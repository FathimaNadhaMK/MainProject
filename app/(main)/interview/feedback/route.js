import { NextResponse } from "next/server";

export async function POST(req) {
  const { conversation } = await req.json();

  const prompt = `
You are an experienced recruiter evaluating an interview.

Interview transcript:
${conversation.join("\n")}

Evaluate the candidate on:
- Communication
- Confidence
- Technical depth
- Clarity

Provide:
1. Strengths
2. Weaknesses
3. Suggestions
4. Final verdict (entry-level readiness)

Keep it realistic and professional.
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
      process.env.GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();

  return NextResponse.json({
    feedback:
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Feedback unavailable."
  });
}
