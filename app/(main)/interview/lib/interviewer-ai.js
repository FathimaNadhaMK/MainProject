"use server";

import { getNextQuestion, evaluateInterview, getAnswerFeedback } from "@/interview/orchestrator";

// these functions act as server actions that client components can import
// they simply forward arguments to the orchestrator, keeping the UI layer
// completely domain‑agnostic.

export async function generateNextQuestion({ sessionId, conversation, imageBase64 }) {
  return await getNextQuestion({ sessionId, conversation, imageBase64 });
}

export async function generateAnswerFeedback({ sessionId, conversation, imageBase64 }) {
  return await getAnswerFeedback({ sessionId, conversation, imageBase64 });
}

export async function generateInterviewFeedback({ sessionId, conversation }) {
  return await evaluateInterview({ sessionId, conversation });
}

