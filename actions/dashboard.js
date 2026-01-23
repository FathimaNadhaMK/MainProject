"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIInsights(userData) {
  if (!userData || !userData.industry) throw new Error("Industry data required");

  console.log("🔥 Gemini generating for industry:", userData.industry);

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-flash as gemini-pro is deprecated and flash is faster
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a senior career advisor, hiring strategist, and labor market analyst.
      
      Generate HIGHLY PERSONALIZED, PRACTICAL career insights for the following profile:
      
      USER PROFILE:
      - Industry: ${userData.industry}
      - Experience: ${userData.experience ?? 0} years
      - Education: ${userData.educationLevel || "Not specified"}
      - Background: ${userData.background || "Not specified"}
      - Target Role: ${userData.targetRole || "Not specified"}
      - Skills: ${JSON.stringify(userData.skills || [])}

      OUTPUT FORMAT (JSON ONLY):
      {
        "overview": "Concise industry summary",
        "marketSize": "Market size estimate",
        "growthRate": 15,
        "averageSalary": "$80k-120k",
        "trendingSkills": ["skill1", "skill2"],
        "emergingRoles": ["role1", "role2"],
        "topCompanies": ["company1", "company2"],
        "certifications": ["cert1", "cert2"],
        "learningResources": ["resource1", "resource2"],
        "challenges": ["challenge1", "challenge2"],
        "opportunities": ["opportunity1", "opportunity2"],
        "aiInsights": {
          "salaryRanges": [
             { "role": "Role Name", "min": 60000, "max": 90000, "median": 75000, "location": "Global" }
          ],
          "demandLevel": "High", 
          "marketOutlook": "Positive", 
          "keyTrends": ["trend1", "trend2"],
          "recommendedSkills": ["skill1", "skill2"]
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    // Fallback Mock Data
    return {
      overview: "Industry insights currently unavailable (Fallback).",
      marketSize: "N/A",
      growthRate: 0,
      averageSalary: "N/A",
      trendingSkills: [],
      emergingRoles: [],
      topCompanies: [],
      certifications: [],
      learningResources: [],
      challenges: [],
      opportunities: [],
      aiInsights: {
        salaryRanges: [],
        demandLevel: "Unknown",
        marketOutlook: "Neutral",
        keyTrends: [],
        recommendedSkills: []
      }
    };
  }
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

  try {
    const insight = await db.industryInsight.upsert({
      where: { industry: user.industry },
      update: {
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
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
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
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return insight;
  } catch (error) {
    if (error.code === 'P2002') {
      // If we still get a unique constraint error due to rare race condition,
      // just fetch the existing record.
      return await db.industryInsight.findUnique({
        where: { industry: user.industry },
      });
    }
    throw error;
  }
}
