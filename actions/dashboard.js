"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const generateAIInsights = async (industry) => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const prompt = `Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
{
  "overview": "A comprehensive overview of the industry (2-3 paragraphs)",
  "marketSize": "string describing market size",
  "growthRate": 8.5,
  "averageSalary": "string with salary range",
  "trendingSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "emergingRoles": ["role1", "role2", "role3", "role4", "role5"],
  "topCompanies": ["company1", "company2", "company3", "company4", "company5"],
  "certifications": ["cert1", "cert2", "cert3", "cert4", "cert5"],
  "learningResources": ["resource1", "resource2", "resource3", "resource4", "resource5"],
  "challenges": ["challenge1", "challenge2", "challenge3", "challenge4", "challenge5"],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3", "opportunity4", "opportunity5"],
  "aiInsights": {
    "salaryRanges": [
      { "role": "Junior", "min": 40000, "max": 60000, "median": 50000, "location": "Global" },
      { "role": "Mid-level", "min": 60000, "max": 90000, "median": 75000, "location": "Global" },
      { "role": "Senior", "min": 90000, "max": 130000, "median": 110000, "location": "Global" },
      { "role": "Lead", "min": 120000, "max": 170000, "median": 145000, "location": "Global" },
      { "role": "Principal", "min": 150000, "max": 220000, "median": 185000, "location": "Global" }
    ],
    "demandLevel": "High",
    "marketOutlook": "Positive",
    "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
    "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
  }
}

IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.`;

  try {
    // Using the REST API directly with v1beta
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    
    // Fallback: Return mock data if API fails
    return {
      overview: `The ${industry} industry is a dynamic and growing sector with significant opportunities for professionals. This industry continues to evolve with technological advancements and changing market demands. Career prospects remain strong with competitive compensation and diverse role options.`,
      marketSize: "Large and growing market",
      growthRate: 7.5,
      averageSalary: "$60,000 - $120,000",
      trendingSkills: ["Problem Solving", "Communication", "Technical Skills", "Adaptability", "Leadership"],
      emergingRoles: ["Specialist", "Analyst", "Coordinator", "Manager", "Consultant"],
      topCompanies: ["Industry Leader 1", "Industry Leader 2", "Industry Leader 3", "Industry Leader 4", "Industry Leader 5"],
      certifications: ["Professional Certification 1", "Professional Certification 2", "Professional Certification 3", "Technical Certification 1", "Technical Certification 2"],
      learningResources: ["Online Courses", "Industry Publications", "Professional Networks", "Workshops & Seminars", "Mentorship Programs"],
      challenges: ["Market Competition", "Skill Gap", "Rapid Technology Changes", "Economic Fluctuations", "Work-Life Balance"],
      opportunities: ["Career Growth", "Remote Work Options", "Global Markets", "Innovation", "Entrepreneurship"],
      aiInsights: {
        salaryRanges: [
          { role: "Entry Level", min: 40000, max: 60000, median: 50000, location: "Global" },
          { role: "Mid-Level", min: 60000, max: 90000, median: 75000, location: "Global" },
          { role: "Senior", min: 90000, max: 130000, median: 110000, location: "Global" },
          { role: "Lead", min: 120000, max: 170000, median: 145000, location: "Global" },
          { role: "Principal", min: 150000, max: 220000, median: 185000, location: "Global" }
        ],
        demandLevel: "High",
        marketOutlook: "Positive",
        keyTrends: ["Digital Transformation", "Remote Work", "Automation", "Sustainability", "Data-Driven Decisions"],
        recommendedSkills: ["Critical Thinking", "Digital Literacy", "Communication", "Collaboration", "Technical Expertise"]
      }
    };
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("User industry not set");

  // Check if insights already exist for this industry
  let industryInsight = await db.industryInsight.findUnique({
    where: { industry: user.industry },
  });

  // If no insights exist, generate them
  if (!industryInsight) {
    const insights = await generateAIInsights(user.industry);

    industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        overview: insights.overview,
        marketSize: insights.marketSize,
        growthRate: insights.growthRate,
        averageSalary: insights.averageSalary,
        trendingSkills: insights.trendingSkills,
        emergingRoles: insights.emergingRoles,
        topCompanies: insights.topCompanies,
        certifications: insights.certifications,
        learningResources: insights.learningResources,
        challenges: insights.challenges,
        opportunities: insights.opportunities,
        aiInsights: insights.aiInsights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });
  }

  return industryInsight;
}