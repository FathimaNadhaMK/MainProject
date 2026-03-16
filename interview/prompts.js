// interview/prompts.js
// Templates that convert domain parameters into LLM prompts.

export function questionPrompt({
  resumeSnapshot,
  conversation,
  phase,
  difficulty,
  intent,
  recruiterProfile,
  turn,
}) {
  const resumeContent = resumeSnapshot?.content || "Resume not provided";

  // reminder: only one question is asked per prompt
  return `You are a professional recruiter (${recruiterProfile.name}); style: ${recruiterProfile.style}.

CANDIDATE'S RESUME:
${resumeContent}

Conversation so far:
${conversation.join("\n")}

Interview parameters:
- phase: ${phase}
- difficulty: ${difficulty}
- intent: ${intent}
- turn: ${turn}

RULES:
* If it is turn 1, introduce yourself ("Hello, I'm [Name]...") and ask your first question directly based on their resume.
* Ask exactly one interview question appropriate to the phase.
* Base questions ONLY on the resume content provided above. Ask about:
  - Specific projects, technologies, or experiences mentioned in the resume
  - Skills and certifications listed
  - Work history and achievements
  - Gaps or transitions between roles
* Do NOT ask generic questions unrelated to the resume.
* Increase difficulty gradually.
* Do not repeat previous questions.
* If an image of the candidate is provided in this prompt, briefly observe their posture, eye contact, or facial expression to make it feel like a real video call (e.g., "I see you're looking a bit tense, relax!", or "Great posture!"). Keep it very subtle and natural.
* Keep your spoken output under three sentences.
* Do not provide answers to the questions you ask.

Return the conversational spoken text only.`;
}


export function answerFeedbackPrompt({ conversation, recruiterProfile }) {
  const lastInteraction = conversation.slice(-2).join("\n");

  return `You are a professional recruiter (${recruiterProfile?.name || "AI"}). 
Review the candidate's last answer to your question:

${lastInteraction}

RULES:
* Briefly evaluate the candidate's last answer in 1-2 sentences. 
* Point out 1 strength and 1 area of improvement, keeping it directly conversational and helpful ("I liked how you...", "One thing you could improve...").
* If an image of the candidate is provided in this prompt, briefly comment on their posture or eye contact from a video interview perspective (e.g., "Make sure you maintain eye contact with the camera," or "Great posture!").
* Do NOT ask a new question. Keep it entirely focused on feedback.
* Return conversational spoken text only as if you were speaking directly to the candidate.`;
}

export function evaluationPrompt({ conversation, session }) {
  const resumeContent = session.resumeSnapshot?.content || "Resume not provided";
  const recruiterName = session.recruiterProfile?.name || "Recruiter";

  // session contains recruiterProfile, targetField, etc.
  return `You are an experienced recruiter evaluating an interview conducted by ${recruiterName}.

CANDIDATE'S RESUME:
${resumeContent}

Interview Transcript:
${conversation.join("\n")}

Evaluate the candidate's responses based on:
- How well they explained experiences from their resume
- Technical depth and accuracy of their answers
- Communication clarity and confidence
- Relevance to the target role
- Ability to discuss specific projects and skills

Return valid JSON with this structure:
{
  "overallScore": number (0-10),
  "strengths": ["string"],
  "areasToImprove": ["string"],
  "summary": "string",
  "verdict": "Suitable | Needs Improvement | Not Ready"
}
`;
}
