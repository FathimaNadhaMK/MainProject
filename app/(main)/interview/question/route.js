import { NextResponse } from "next/server";
import { getNextQuestion } from "@/interview/orchestrator";

export async function POST(req) {
  const { sessionId, conversation } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const questionData = await getNextQuestion({ sessionId, conversation });
    return NextResponse.json(questionData);
  } catch (err) {
    console.error("/interview/question error", err);
    return NextResponse.json({ error: err.message || "Failed to generate question" }, { status: 500 });
  }
}
