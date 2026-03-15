import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req) {
  try {
    const formData = await req.formData();

    const company = formData.get("company");
    const position = formData.get("position");
    const file = formData.get("resume");

    if (!file || !company || !position) {
      return NextResponse.json(
        { error: "Resume, company, and position are required" },
        { status: 400 }
      );
    }

    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

    const promptText = `
You are an expert career assistant.

Analyze the attached resume and generate a professional cover letter.

CRITICAL INSTRUCTION: Extract the actual CANDIDATE'S:
- Name (Do not use template author names like 'Overleaf' or default names, find the real applicant's name in the document body)
- Phone Number
- Email

Then include them ONLY at the very top of the cover letter in this exact format:

Name
Phone
Email

Date: ${today}

Company: ${company}
Position: ${position}

Instructions:
- Identify key skills and experience from the attached resume
- Tailor the letter to the ${position} role at ${company}
- Professional tone
- 3–4 paragraphs
- Do NOT include placeholders like [Your Name]
- The generated text must contain the actual candidate details from the resume at the top.

Return only the cover letter text.
`;

    let result;

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");

      result = await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf",
          },
        },
        promptText,
      ]);
    } else {
      const resumeText = await file.text();
      result = await model.generateContent([
        promptText,
        `\n\nResume Text Content:\n${resumeText}`
      ]);
    }

    const letter = result.response.text().trim();

    return NextResponse.json({ letter });

  } catch (error) {
    console.error("Cover letter generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}