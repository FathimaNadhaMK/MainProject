// interview/prompts.js
// Templates that convert domain parameters into LLM prompts.

export function questionPrompt({
  resumeSnapshot,
  relevantResumeChunk,
  conversation,
  phase,
  difficulty,
  intent,
  recruiterProfile,
  turn,
  timeRemaining,
}) {
  const contextData = relevantResumeChunk || resumeSnapshot?.content || "";
  
  return `You are a professional human recruiter (${recruiterProfile.name}); your style is ${recruiterProfile.style}.
  
RELEVANT CANDIDATE CONTEXT:
${contextData}

Conversation so far:
${conversation.join("\n")}

Interview parameters:
- General Phase: ${phase}
- Difficulty: ${difficulty}

CRITICAL INSTRUCTIONS FOR MAXIMUM REALISM:
1. **BE EXTREMELY BRIEF:** Keep your response under 2 short sentences. Prioritize conversational speed. 
2. **FOLLOW THE FLOW DYNAMICALLY:** 
   - If the candidate just answered a question and their answer was brief or incomplete, ASK A PROBING FOLLOW-UP QUESTION on the exact same topic.
   - If their answer was great and complete, naturally transition to a new topic based on the RELEVANT CANDIDATE CONTEXT provided above.
3. **SOUND HUMAN:** React naturally to what they just said. Do NOT just rattle off questions. Start with natural conversational markers like "That makes sense," or "Interesting."
4. **AVOID ROBOTIC PHRASES:** NEVER use phrases like "Next question", "Answer the following", or "Let's move to the next phase." 
5. **NO ANSWERING FOR THEM:** Never provide the answer to your own question.

${timeRemaining !== undefined && timeRemaining < 60 ? `URGENT: Session ends in ${Math.floor(timeRemaining)}s. Transition immediately to a final concluding thought.` : ""}

Generate your ONLY your spoken response now:`;
}

export function evaluationPrompt({ conversation, session }) {
  const resumeContent = session.resumeSnapshot?.content;
  const recruiterName = session.recruiterProfile?.name || "Recruiter";
  
  if (!resumeContent) {
    throw new Error("Resume content is mandatory for evaluation.");
  }
  
  // session contains recruiterProfile, targetField, etc.
  return `You are an experienced recruiter evaluating an interview conducted by ${recruiterName}.

CANDIDATE'S RESUME:
${resumeContent}

Interview Transcript:
${conversation.join("\n")}

Evaluate the candidate's responses based on:
- Technical accuracy and depth regarding the experiences on their resume.
- Ability to explain the "why" behind their projects and technical choices.
- Alignment between their spoken answers and the resume details.
- Communication clarity, professional tone, and confidence.
- English proficiency and vocabulary usage.
- Relevance of their expertise to their target career path.

CRITICAL RULES:
- If the candidate has not provided any answers (the transcript only contains interviewer questions), the overallScore MUST be 0.
- If the answers are extremely short or non-substantive (e.g., "yes", "no", "I don't know"), the score should be very low (1-2).
- NEVER assume knowledge or skills that aren't demonstrated in the transcript, even if they are on the resume.

Return valid JSON with this structure:
{
  "overallScore": number (0-10),
  "strengths": ["string"],
  "areasToImprove": ["string"],
  "summary": "string",
  "toneAnalysis": "string",
  "confidenceLevel": "string",
  "englishProficiency": "string",
  "hiringVerdict": "Hired | Waitlisted | Rejected",
  "verdictReasoning": "string"
}
`;
}

export function answerFeedbackPrompt({ conversation, recruiterProfile }) {
  return `You are a professional recruiter (${recruiterProfile.name}).
  
Conversation so far:
${conversation.join("\n")}

Provide brief, professional feedback on the candidate's last response. 
Focus on:
- Clarity
- Professionalism
- Relevance
Keep it encouraging but honest. 
**CRITICAL**: Output should be under two sentences. Do NOT ask a follow-up question. Return ONLY the feedback text.`;
}
