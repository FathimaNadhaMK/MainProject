import { geminiModel } from "@/app/lib/gemini";
import { MOCK_JOBS } from "./mock-jobs";
import { getRoleTaxonomy } from "./role-taxonomy";

export async function generateMockJobsWithAI(queries = []) {
    if (!queries || queries.length === 0) {
        return MOCK_JOBS;
    }

    const rawRole = queries[0];
    const taxonomy = await getRoleTaxonomy(rawRole);
    
    const count = 8;
    const prompt = `You are a job board data generator. Generate ${count} UNIQUE and REALISTIC job postings for the role: "${rawRole}".

CRITICAL CONSTRAINTS:
- Job titles MUST be one of: ${taxonomy.jobTitleVariants.join(", ")}
- Job titles MUST NOT include: ${taxonomy.excludeTitles.join(", ")}
- Skills MUST prioritize: ${taxonomy.skillHierarchy.core.join(", ")}
- You must generate exactly ${count} jobs.

Required JSON structure (Array of these objects):
[
  {
    "title": "String",
    "company": "realistic company name",
    "location": "city, state or Remote",
    "experienceLevel": "String (e.g. Intern, Entry Level, Junior, Mid-Level, Senior)",
    "skillsRequired": ["skill1", "skill2"], /* MUST include core skills */
    "industry": "String",
    "salaryRange": "String (e.g. $80,000 - $110,000)",
    "description": "String (A realistic 2-3 sentence description)",
    "applicationUrl": "https://example.com/apply",
    "isRemote": Boolean,
    "jobType": "full-time"
  }
]

VALIDATION RULES:
1. Every job MUST include at least 2 skills from: ${taxonomy.skillHierarchy.core.join(", ")}
2. NO jobs for: ${taxonomy.excludeTitles.join(", ")}
3. Descriptions must clearly indicate "${rawRole}" responsibilities.
4. Company names must be realistic.

Generate ONLY the JSON array, no markdown or comments inside the JSON.`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```(?:json)?\n?/g, "").replace(/\n?```/g, "").trim();
        let generatedJobs = JSON.parse(cleanedText);

        // VALIDATION LAYER (Strategy 4 & 5)
        generatedJobs = generatedJobs.filter(job => {
            if (!job.title || !job.skillsRequired) return false;
            
            // Reject jobs with excluded titles
            if (taxonomy.excludeTitles.some(excluded => 
                job.title.toLowerCase().includes(excluded.toLowerCase())
            )) {
                return false;
            }
            
            // Require at least 1 core skill match (softened requirement to avoid filtering out everything if AI is slightly off)
            const hasCoreSkills = taxonomy.skillHierarchy.core.some(skill =>
                job.skillsRequired.some(js => js.toLowerCase() === skill.toLowerCase())
            );
            
            return hasCoreSkills;
        });

        if (generatedJobs.length === 0) {
            throw new Error("Validation layer filtered all AI generated jobs.");
        }

        const today = new Date();
        today.setHours(0,0,0,0); // Same day deterministic timestamp
        return generatedJobs.map((job, index) => {
            const companySlug = job.company ? job.company.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "unknown";
            const titleSlug = job.title ? job.title.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : "job";
            
            return {
                ...job,
                postedDate: new Date(),
                // Deterministic ID prevents huge duplicates of AI mock jobs in DB
                externalJobId: `mock_ai_${companySlug}_${titleSlug}`,
                source: "mock-ai"
            };
        });
    } catch (error) {
        console.error("Error generating dynamic mock jobs with AI Constraints:", error);
        
        // Fallback to static mock jobs, but filter them
        const filteredList = MOCK_JOBS.filter(job => {
            const hasExcludedTitle = taxonomy.excludeTitles.some(excluded =>
                job.title.toLowerCase().includes(excluded.toLowerCase())
            );
            if (hasExcludedTitle) return false;
            
            const hasRoleKeywords = taxonomy.primaryKeywords.some(keyword =>
                job.description.toLowerCase().includes(keyword.toLowerCase()) ||
                job.title.toLowerCase().includes(keyword.toLowerCase())
            );
            return hasRoleKeywords;
        });
        
        return filteredList.length > 0 ? filteredList : MOCK_JOBS.slice(0, 4);
    }
}
