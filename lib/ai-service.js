import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

class AIService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set in .env");
      this.model = null;
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash as the standard model, since gemini-pro is no longer supported for this API version
    this.model = this.genAI.getGenerativeModel(
      {
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
        }
      },
      { apiVersion: "v1beta" }
    );
  }

  isAvailable() {
    return this.model !== null;
  }

  sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[<>]/g, '').substring(0, 5000);
  }

  parseAIResponse(text) {
    try {
      // With responseMimeType: "application/json", text is natively guaranteed to be JSON
      // However, for extra safety during transitions or legacy prompt caching:
      const cleanText = text.replace(/```(?:json)?\n?|\n?```/g, "").trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn("AI response parse error:", error.message);
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          let escapedText = jsonMatch[0]
            .replace(/[\u0000-\u001F]+/g, "") // Strip out invalid control characters which often break JSON
            .replace(/,\s*([\}\]])/g, "$1"); // Fix common trailing commas before brackets/braces
          return JSON.parse(escapedText);
        }
      } catch (e) {
        console.error("Secondary parse failed", e);
        try {
          // Log the exact text that failed so we can see what's wrong with it
          require("fs").writeFileSync("failed_ai_response.txt", text);
        } catch (fsErr) {
          console.error("Failed to write log file", fsErr);
        }
      }
      return { text: text.trim(), error: "Failed to parse JSON" };
    }
  }

  async generateRoadmap(user, preferences = {}) {
    if (!this.isAvailable()) return { error: "AI service not configured" };

    const prompt = `You are an expert career coach and technical mentor. Generate a comprehensive, personalized career roadmap.

USER PROFILE:
- Education: ${user.educationLevel || 'Not specified'}
- Background: ${user.background || 'Not specified'}
- Current Role/Status: ${user.currentStatus || 'Student'}
- Target Role: ${user.targetRole || 'Software Engineer'}
- Current Skills: ${JSON.stringify(user.skills || [])}
- Skill Levels: ${JSON.stringify(user.skillLevels || {})}
- Target Companies: ${preferences.targetCompanies?.join(', ') || 'General'}
- Location Preference: ${preferences.locationPref || 'Flexible'}
- Interested in Internships: ${user.interestedInInternships || 'No'}
- Interested in Certifications: ${user.interestedInCertifications || 'No'}

Generate a DETAILED roadmap with:

1. SKILL GAP ANALYSIS:
   - Identify 3-5 specific strengths with examples
   - Identify 5-7 critical skill gaps for the target role
   - Priority learning order based on dependencies
   - Timeline impact of each gap

2. PROGRESSIVE WEEKLY PLAN (16 weeks):
   Break the journey into 4 clear phases:
   - PHASE 1: FOUNDATION (Weeks 1-4)
     * Focus: Core fundamentals, environment setup
     * Intensity: Heavy learning
   - PHASE 2: INTERMEDIATE (Weeks 5-8)
     * Focus: Applied projects, framework mastery
     * Intensity: Balanced learning + building
   - PHASE 3: ADVANCED (Weeks 9-12)
     * Focus: Complex systems, optimization, specialization
     * Intensity: Project-heavy
   - PHASE 4: INTERVIEW MASTERY (Weeks 13-16)
     * Focus: DSA, System Design, Behavioral mock interviews
     * Intensity: Practice-focused

   For each week provide:
   - phase (use "Foundation", "Intermediate", "Advanced", or "Interview Prep")
   - Specific, measurable learning objectives
   - 3-5 actionable tasks with time estimates
   - Real project ideas to build
   - Specific resources (MANDATORY: 2+ YouTube tutorial links with creator names, 1+ Course link from Coursera/Udemy/Pluralsight, and relevant documentation)
   - Success criteria for the week

3. COMPANY-SPECIFIC PREPARATION:
   ${preferences.targetCompanies && preferences.targetCompanies.length > 0 ? `
   Provide deep dives into ${preferences.targetCompanies.join(', ')}:
   - Required technical stack and versions
   - Typical interview process steps
   - Focus areas for their specific bar
   ` : 'General market preparation for Top Tier Tech companies.'}

4. CERTIFICATION STRATEGY:
   - Specific certifications that will boost the resume
   - Recommended week to take each exam
   - Best resources for preparation

5. PORTFOLIO & INTERVIEW TIMELINE:
   - When to start DSA LeetCode
   - When to build specific portfolio projects
   - Target date for being "market ready"

Return ONLY valid JSON with this structure:
{
"skillGapAnalysis": {
  "strengths": [{"skill": "string", "evidence": "string", "level": "Beginner|Intermediate|Advanced"}],
  "gaps": [{"skill": "string", "impact": "low|medium|high", "learningTime": "string"}],
  "priorityOrder": ["string"],
  "timelineImpact": "string"
},
"weeklyPlan": [{
  "week": number,
  "phase": "string",
  "topic": "string",
  "objectives": ["string"],
  "tasks": [{ "title": "string", "description": "string", "timeEstimate": "string", "type": "learning|practice|project", "resources": { "videos": [{"title": "string", "creator": "string", "url": "string"}], "courses": [{"platform": "string", "title": "string", "url": "string"}], "documentation": [{"title": "string", "url": "string"}] } }],
  "projectIdea": { "title": "string", "description": "string", "techStack": ["string"], "features": ["string"], "difficulty": "string" },
  "successCriteria": ["string"]
}],
"companyPrep": { "CompanyName": { "requiredSkills": ["string"], "interviewProcess": ["string"], "timeline": "string", "focusAreas": ["string"], "projectSuggestions": ["string"] } },
"certifications": [{"name": "string", "provider": "string", "priority": number, "cost": "string", "studyTime": "string", "roi": "string", "recommendedWeek": number}],
"projectMilestones": [{"week": number, "title": "string", "description": "string", "technologies": ["string"], "features": ["string"], "learningGoals": ["string"], "portfolioImpact": "string"}],
"interviewTimeline": { "dsaStart": "week X", "systemDesignStart": "week X", "behavioralStart": "week X", "readyToApply": "week X" }
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Roadmap generation error:", error);
      // Fallback
      return {
        skillGapAnalysis: { strengths: [], gaps: [], priorityOrder: [], timelineImpact: "" },
        weeklyPlan: Array.from({ length: 16 }, (_, i) => ({
          week: i + 1,
          phase: i < 4 ? "Foundation" : i < 8 ? "Intermediate" : i < 12 ? "Advanced" : "Interview Prep",
          topic: "Topic",
          objectives: [],
          tasks: [],
          projectIdea: { title: "Project", description: "Desc", techStack: [], features: [], difficulty: "Medium" },
          successCriteria: []
        })),
        companyPrep: {},
        certifications: [],
        projectMilestones: [],
        interviewTimeline: { dsaStart: "week 1", systemDesignStart: "week 8", behavioralStart: "week 12", readyToApply: "week 16" }
      };
    }
  }

  async evaluateProject(repoData, weekGoals) {
    if (!this.isAvailable()) return { error: "AI service not configured" };

    const prompt = `You are a technical code reviewer and mentor. Evaluate the following project based on the learning objectives for the week.

PROJECT INFO:
- Name: ${repoData.info.name}
- Description: ${repoData.info.description}
- Primary Language: ${repoData.info.language}

WEEK'S LEARNING OBJECTIVES:
${JSON.stringify(weekGoals)}

REPOSITORY CODE SAMPLES:
${repoData.files.map(f => `--- FILE: ${f.path} ---\n${f.content}\n`).join("\n")}

EVALUATION CRITERIA:
1. Did the project meet the week's learning objectives?
2. Code quality and best practices.
3. Completeness of features.
4. Suggested improvements.

Return ONLY valid JSON with this structure:
{
  "score": 0-100,
  "summary": "Quick summary of the project",
  "strengths": ["list of what they did well"],
  "weaknesses": ["list of what's missing or could be better"],
  "feedback": "Detailed feedback report (use markdown formatting)",
  "nextSteps": ["suggested next steps"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const data = this.parseAIResponse(response.text());

      // Let's implement robust Architecture Zod Validation
      const ProjectEvalSchema = z.object({
        score: z.number().min(0).max(100).catch(0),
        summary: z.string().catch("Project evaluation complete."),
        strengths: z.array(z.string()).catch([]),
        weaknesses: z.array(z.string()).catch([]),
        feedback: z.string().catch("Good progress on the project."),
        nextSteps: z.array(z.string()).catch([])
      }).passthrough(); // allows extra keys loosely if the LLM hallucinates them

      const validatedData = ProjectEvalSchema.parse(data);

      return validatedData;
    } catch (error) {
      console.error("Project evaluation error:", error);
      return { error: "Failed to evaluate project" };
    }
  }

  async generateQuiz(topic, difficulty) {
    if (!this.isAvailable()) return { error: "AI service not configured" };

    const prompt = `
        Create 5 multiple choice questions on ${topic} (${difficulty} level).
        Return as JSON: {topic: "${topic}", questions: [{question: "", options: {a,b,c,d}, correctAnswer: "a", explanation: ""}]}
      `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return this.parseAIResponse(response.text());
    } catch (error) {
      console.error("Quiz gen error:", error);
      return { error: error.message };
    }
  }
}

export const aiService = new AIService();