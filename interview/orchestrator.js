// interview/orchestrator.js
// Core interview orchestration: decides what the next question should be and
// generates final evaluation.  Logic is kept separate from language model
// prompts and configurable via rules files.

import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  determinePhase,
  determineDifficulty,
  intentForPhase,
  adjustForPersona,
} from "./orchestrator-rules";
import { questionPrompt, evaluationPrompt } from "./prompts";

// shared model instance
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// helper to infer turn number from stored state or conversation array
function computeTurn(session, conversation) {
  if (session.turn && session.turn > 0) return session.turn;
  if (Array.isArray(conversation)) {
    // each turn adds two entries (Interviewer/Candidate)
    return Math.floor(conversation.length / 2) + 1;
  }
  return 1;
}

// build prioritized list of personalization targets
function buildPriorityList(session) {
  const list = [];
  const cfg = session.config || {};

  // 1. resume projects/experiences – assume resumeSnapshot.projects array
  if (session.resumeSnapshot?.projects) {
    for (const p of session.resumeSnapshot.projects) {
      list.push({ type: "project", value: p });
    }
  }

  // 2. weak skills from config
  if (cfg.weakSkills && Array.isArray(cfg.weakSkills)) {
    for (const s of cfg.weakSkills) {
      list.push({ type: "weakSkill", value: s });
    }
  }

  // 3. pending roadmap topics
  if (cfg.pendingTopics && Array.isArray(cfg.pendingTopics)) {
    for (const t of cfg.pendingTopics) {
      list.push({ type: "pendingTopic", value: t });
    }
  }

  // 4. career goal / target role
  if (cfg.careerGoal) {
    list.push({ type: "careerGoal", value: cfg.careerGoal });
  }

  // 5. fallbacks
  list.push({ type: "general", value: "" });

  return list;
}

export async function getNextQuestion({ sessionId, conversation = [] }) {
  const session = await db.interview.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new Error("Interview session not found");

  const turn = computeTurn(session, conversation);
  const targetField = session.config?.targetField || session.recruiterProfile?.targetField || "General";

  let phase = determinePhase(turn, targetField);
  phase = adjustForPersona(phase, session.recruiterProfile || {});

  const difficulty = determineDifficulty(turn);
  const intent = intentForPhase(phase);

  const prompt = questionPrompt({
    resumeSnapshot: session.resumeSnapshot || {},
    conversation,
    phase,
    difficulty,
    intent,
    recruiterProfile: session.recruiterProfile || { name: "Recruiter" },
    turn,
  });

  const res = await model.generateContent(prompt);
  const questionText = (await res.response.text()).trim();

  // persist updated state (save conversation if provided, bump turn, etc.)
  await db.interview.update({
    where: { id: sessionId },
    data: {
      conversation,
      currentPhase: phase,
      currentDifficulty: difficulty,
      turn: turn + 1,
      questions: { push: { text: questionText, phase, difficulty, intent } },
    },
  });

  return {
    question: questionText,
    intent,
    difficulty,
    phase,
  };
}

export async function evaluateInterview({ sessionId, conversation = [] }) {
  const session = await db.interview.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new Error("Interview session not found");

  const prompt = evaluationPrompt({ conversation, session });
  const res = await model.generateContent(prompt);
  let text = await res.response.text();
  text = text.replace(/```(?:json)?/g, "").trim();

  let evaluation;
  try {
    evaluation = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse evaluation JSON", text, e);
    throw e;
  }

  // store results
  await db.interview.update({
    where: { id: sessionId },
    data: {
      feedback: evaluation,
      score: evaluation.overallScore,
      areasToImprove: evaluation.areasToImprove || [],
      userResponses: conversation,
      isCompleted: true,
      duration: session.duration || 0,
    },
  });

  return evaluation;
}
