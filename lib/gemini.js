import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractJSON(text) {
  try {
    // Pull first JSON object from Gemini output
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Gemini JSON parse error:", err, "\nRAW:\n", text);
    return {
      requiredSkills: [],
      missingSkills: [],
      summary: "AI parsing failed"
    };
  }
}

export async function generateSkillGapAI(industry, skills) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a career coach AI.

Industry: ${industry}
User skills: ${skills.join(", ")}

Task:
1. List top 10 required skills for this industry
2. Identify missing skills
3. Give a short improvement summary

Return ONLY valid JSON in this exact format:
{
  "requiredSkills": ["..."],
  "missingSkills": ["..."],
  "summary": "..."
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return extractJSON(text);
}
