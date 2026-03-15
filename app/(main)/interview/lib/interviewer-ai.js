"use server";

import { getNextQuestion, evaluateInterview } from "../_lib/orchestrator/orchestrator";

// these functions act as server actions that client components can import
// they simply forward arguments to the orchestrator, keeping the UI layer
// completely domain‑agnostic.

export async function generateNextQuestion({ sessionId, conversation, timeRemaining }) {
  return await getNextQuestion({ sessionId, conversation, timeRemaining });
}

export async function generateInterviewFeedback({ sessionId, conversation }) {
  return await evaluateInterview({ sessionId, conversation });
}
