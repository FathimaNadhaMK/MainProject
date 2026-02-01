import { NextResponse } from "next/server";

export async function POST(req) {
  const { resumeData, conversation } = await req.json();

  const prompt = `
You are a professional human recruiter conducting a real-life job interview.

Candidate Resume Data:
${JSON.stringify(resumeData, null, 2)}

Conversation so far:
${conversation.join("\n")}

Rules:
- Ask ONLY ONE interview question at a time
- Base questions strictly on the resume
- Mix HR, technical, and behavioral questions
- Ask follow-up questions when needed
- Do NOT provide answers
- Sound natural and professional

Ask the next interview question only.
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
    question:
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tell me about yourself."
  });
}
