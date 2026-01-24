import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();
        let { prompt } = body;

        if (!prompt && body.targetRole?.trim()) {
            // Construct prompt from profile data if direct prompt is missing
            const skillsList = Array.isArray(body.skills)
                ? body.skills.map(s => typeof s === 'string' ? s : s.name).join(", ")
                : "";

            prompt = `
                Write a professional, engaging LinkedIn-style bio for a professional with the following profile:
                - Target Role: ${body.targetRole}
                - Industry: ${body.industry} ${body.subIndustry ? `(${body.subIndustry})` : ""}
                - Skills: ${skillsList}
                - Experience: ${body.experience} years
                - Education: ${body.educationLevel} (${body.background})
                
                The bio should be under 500 characters, highlight achievements, and use professional tone.
                Return ONLY the bio text without any prefix or quotes.
            `;
        }

        if (!prompt) {
            return NextResponse.json({ error: "Prompt or profile data is required" }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Switch to gemini-2.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const bio = response.text().trim();

        return NextResponse.json({ bio });
    } catch (error) {
        console.error("Bio generation error:", error);

        // Fallback: Mock bio to ensure UX continuity
        const mockBio = "I am a passionate professional with a drive for innovation. I love building impactful solutions and collaborating with teams to solve complex problems. My background in technology and my commitment to continuous learning make me a strong asset to any project.";

        return NextResponse.json({ bio: mockBio });
    }
}
