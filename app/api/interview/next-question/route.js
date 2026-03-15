import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  determinePhase,
  determineDifficulty,
  intentForPhase,
  adjustForPersona,
} from "../../../(main)/interview/_lib/orchestrator/orchestrator-rules";
import { questionPrompt } from "../../../(main)/interview/_lib/orchestrator/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function POST(req) {
  const { sessionId, conversation = [], timeRemaining } = await req.json();

  const session = await db.interview.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Session not found" }), { status: 404 });
  }

  // Orchestrator logic (duplicate of getNextQuestion but streaming)
  const conversationLength = Array.isArray(conversation) ? conversation.length : 0;
  const turn = Math.floor(conversationLength / 2) + 1;
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
    timeRemaining,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);
        let fullText = "";

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          controller.enqueue(encoder.encode(chunkText));
        }

        // Parallel DB update (non-blocking for the stream completion)
        db.interview.update({
          where: { id: sessionId },
          data: {
            conversation,
            currentPhase: phase,
            currentDifficulty: difficulty,
            turn: turn + 1,
            questions: { push: { text: fullText, phase, difficulty, intent } },
          },
        }).catch(err => console.error("Streaming DB update error:", err));

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
