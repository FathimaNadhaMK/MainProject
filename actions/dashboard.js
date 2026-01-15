"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function generateAIInsights(industry) {
  if (!industry) throw new Error("Industry required");

  console.log("🔥 Gemini generating for industry:", industry);

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY, // ✅ CORRECT
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are a senior career advisor, hiring strategist, and labor market analyst.

Your task is to generate HIGHLY PERSONALIZED, PRACTICAL career insights
based on the individual user's profile below.

DO NOT give generic or surface-level advice.

====================
USER PROFILE
====================
- Industry: ${industry.industry}
- Years of Experience: ${industry.experience ?? 0}
- Education Level: ${industry.educationLevel || "Not specified"}
- Background: ${industry.background || "Not specified"}
- Current Skills: ${industry.skills || "Not specified"}
- Target Role: ${industry.targetRole || "Not specified"}
- Target Companies: ${industry.targetCompanies || "Not specified"}
- Preferred Company Size: ${industry.companySizePref || "Not specified"}
- Preferred Location: ${industry.locationPref || "Global"}
- Internship Interest: ${industry.internshipInterest || "No"}
- Interested in Certifications: ${industry.certificationInterest ? "Yes" : "No"}
- Professional Bio: ${industry.bio || "Not provided"}

====================
ANALYSIS RULES
====================
1. Adjust ALL recommendations based on years of experience:
   - < 2 years → entry-level / junior / internship roles
   - 2–4 years → mid-level roles
   - > 4 years → senior / specialist roles

2. Align roles, skills, and salary ranges with:
   - User’s target role
   - Current skill set
   - Education level

3. Recommend certifications ONLY if certificationInterest is "Yes".

4. If internshipInterest is "Yes" and experience < 2 years:
   - Include internships, apprenticeships, or trainee roles.

5. Salary ranges MUST be realistic and industry-accurate.
   - Adjust based on experience level and preferred location.

6. Avoid vague advice such as:
   - "Keep learning"
   - "Stay updated"
   - "Improve your skills"

7. All content must be actionable and specific.

====================
OUTPUT REQUIREMENTS
====================
Return ONLY valid JSON.
Do NOT include markdown, explanations, comments, or extra text.

The JSON MUST match EXACTLY the structure below:

{
  "overview": "Concise, personalized summary of this industry for the user",
  "marketSize": "Short, realistic market size description",
  "growthRate": number,
  "averageSalary": "Experience-adjusted salary range",

  "trendingSkills": ["skill1","skill2","skill3","skill4","skill5"],

  "emergingRoles": ["role1","role2","role3","role4","role5"],

  "topCompanies": ["company1","company2","company3","company4","company5"],

  "certifications": ["cert1","cert2","cert3","cert4","cert5"],

  "learningResources": ["resource1","resource2","resource3","resource4","resource5"],

  "challenges": ["challenge1","challenge2","challenge3","challenge4","challenge5"],

  "opportunities": ["opportunity1","opportunity2","opportunity3","opportunity4","opportunity5"],

  "aiInsights": {
    "salaryRanges": [
      {
        "role": "Role name",
        "min": number,
        "max": number,
        "median": number,
        "location": "Global or specific region"
      }
    ],
    "demandLevel": "High | Medium | Low",
    "marketOutlook": "Positive | Neutral | Negative",
    "keyTrends": ["trend1","trend2","trend3","trend4","trend5"],
    "recommendedSkills": ["skill1","skill2","skill3","skill4","skill5"]
  }
}
`

              }
            ]
          }
        ]
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("❌ Gemini API error:", err);
    throw new Error("Gemini failed");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const cleaned = text.replace(/```json|```/g, "").trim();

  console.log("✅ Gemini success");
  return JSON.parse(cleaned);
}

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user?.industry) throw new Error("Industry not set");

  // Generate AI once per request
  const ai = await generateAIInsights(user);

  const insight = await db.industryInsight.upsert({
    where: { industry: user.industry },
    update: {}, // do NOTHING if already exists
    create: {
      industry: user.industry,
      overview: ai.overview,
      marketSize: ai.marketSize,
      growthRate: ai.growthRate,
      averageSalary: ai.averageSalary,
      trendingSkills: ai.trendingSkills,
      emergingRoles: ai.emergingRoles,
      topCompanies: ai.topCompanies,
      certifications: ai.certifications,
      learningResources: ai.learningResources,
      challenges: ai.challenges,
      opportunities: ai.opportunities,
      aiInsights: ai.aiInsights,
    },
  });

  return insight;
}

