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
* Ask exactly one interview question appropriate to the phase.
* Base questions ONLY on the resume content provided above. Ask about:
  - Specific projects, technologies, or experiences mentioned in the resume
  - Skills and certifications listed
  - Work history and achievements
  - Gaps or transitions between roles
* Do NOT ask generic questions unrelated to the resume.
* Increase difficulty gradually.
* Do not repeat previous questions.
* Keep output under two sentences.
* Do not provide answers.

Return the question text only.`;
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
