"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function generateSkillGap() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("Industry not set");
  if (!user.skills || user.skills.length === 0) {
    throw new Error("Skills not set");
  }

  console.log("🔥 Gemini Skill Gap generating for:", user.industry);

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are a career coach AI.

Industry: ${user.industry}
User skills: ${user.skills.join(", ")}

Task:
1. List top 10 required skills for this industry
2. Identify missing skills
3. Give a short improvement summary

Return ONLY valid JSON:
{
  "requiredSkills": [],
  "missingSkills": [],
  "summary": ""
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
    console.error("❌ Gemini Skill Gap API error:", err);
    throw new Error("Gemini failed");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = text.replace(/```json|```/g, "").trim();

  console.log("✅ Gemini Skill Gap success");

  let ai;
  try {
    ai = JSON.parse(cleaned);
  } catch (e) {
    console.error("❌ Skill gap JSON parse failed:", cleaned);
    throw new Error("Skill gap parsing failed");
  }

  return {
    industry: user.industry,
    userSkills: user.skills,
    requiredSkills: ai.requiredSkills || [],
    missingSkills: ai.missingSkills || [],
    summary: ai.summary || "No summary generated",
  };
}
