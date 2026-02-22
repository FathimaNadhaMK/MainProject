"use server";

import { getNextQuestion, evaluateInterview } from "@/interview/orchestrator";

// these functions act as server actions that client components can import
// they simply forward arguments to the orchestrator, keeping the UI layer
// completely domain‑agnostic.

export async function generateNextQuestion({ sessionId, conversation }) {
  return await getNextQuestion({ sessionId, conversation });
}

export async function generateInterviewFeedback({ sessionId, conversation }) {
  return await evaluateInterview({ sessionId, conversation });
}
