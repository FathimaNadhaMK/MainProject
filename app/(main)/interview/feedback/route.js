import { NextResponse } from "next/server";
import { evaluateInterview } from "@/interview/orchestrator";

export async function POST(req) {
  const { sessionId, conversation } = await req.json();
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  try {
    const evaluation = await evaluateInterview({ sessionId, conversation });
    return NextResponse.json({ feedback: evaluation });
  } catch (err) {
    console.error("/interview/feedback error", err);
    return NextResponse.json({ error: err.message || "Evaluation failed" }, { status: 500 });
  }
}
