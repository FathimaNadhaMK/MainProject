"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

function normalizeSkill(s) {
  if (!s) return "";

  // Handle objects like { name: "Python" } or { label: "Python" }
  if (typeof s === "object") {
    s = s.name || s.label || JSON.stringify(s);
  }

  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


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

  if (!user.targetRole) {
    console.warn("⚠️ User has no targetRole set, using industry as fallback");
  }

  console.log("🔥 Gemini Skill Gap generating for:", user.industry);

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
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
2. Give a short improvement summary

Return ONLY valid JSON:
{
  "requiredSkills": [],
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

  // 🔥 SMART MATCHING LOGIC
const userSkillsNormalized = (user.skills || [])
  .filter(Boolean)
  .map(normalizeSkill);


  const matchedSkills = [];
  const missingSkills = [];

  for (const reqSkill of ai.requiredSkills || []) {
    const reqNorm = normalizeSkill(reqSkill);

    const isMatched = userSkillsNormalized.some(userSkill =>
      reqNorm.includes(userSkill) || userSkill.includes(reqNorm)
    );

    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const result = {
    industry: user.industry,
    targetRole: user.targetRole || `${user.industry} Professional`,
    userSkills: user.skills,
    requiredSkills: ai.requiredSkills || [],
    matchedSkills,
    missingSkills,
    summary: ai.summary || "No summary generated",
  };

  return result;
}
