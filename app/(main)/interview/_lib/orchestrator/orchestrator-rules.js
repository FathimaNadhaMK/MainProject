// interview/orchestrator-rules.js
// Defines domain-specific rules for phase progression, difficulty, and intent.

// Determine the sequence of phases based on the candidate's target field.
export function determinePhase(turn, targetField) {
  // turn is 1-based index of the question to ask
  const techPhases = [
    "Intro",
    "Projects",
    "Core Skills",
    "Reasoning",
    "Behavioral",
  ];
  const nonTechPhases = [
    "Intro",
    "Motivation",
    "Situational",
    "Ethics",
    "Awareness",
    "Communication",
  ];

  const sequence =
    targetField && targetField.toLowerCase().includes("tech")
      ? techPhases
      : nonTechPhases;

  return sequence[Math.min(turn - 1, sequence.length - 1)];
}

export function determineDifficulty(turn) {
  if (turn <= 2) return "easy";
  if (turn <= 4) return "medium";
  return "hard";
}

export function intentForPhase(phase) {
  const map = {
    Intro: "get to know candidate and warm up",
    Projects: "understand past work and impact",
    "Core Skills": "assess fundamental technical ability",
    Reasoning: "evaluate problem‑solving approach",
    Behavioral: "observe behaviour under hypothetical scenarios",
    Motivation: "gauge candidate's drive and fit",
    Situational: "see how the candidate would act in a given situation",
    Ethics: "test moral judgement and compliance",
    Awareness: "check understanding of industry/culture",
    Communication: "evaluate clarity and professionalism",
  };
  return map[phase] || "evaluate general competence";
}

// Recruiter personas may tweak the flow; expose a hook that allows
// persona-specific adjustments.
export function adjustForPersona(phase, recruiterProfile) {
  // Example: a "startup_cto" might skip some "Intro" questions faster.
  // Currently a no-op but kept for extensibility.
  return phase;
}

// Splits the resume and returns only the chunk relevant to the current phase
export function getRelevantResumeChunk(resumeText, phase) {
  if (!resumeText) return "";
  
  const lines = resumeText.split('\n');
  let currentSection = "General";
  const chunks = {
    "General": [],
    "Skills": [],
    "Projects": [],
    "Experience": [],
    "Education": []
  };

  const sectionRegex = /^(?:#+\s*)?(skills|projects|experience|work history|employment|education|certifications)(?:\s*:)?(.*)$/i;

  for (const line of lines) {
    const match = line.trim().match(sectionRegex);
    if (match) {
      const secName = match[1].toLowerCase();
      if (secName.includes("skill")) currentSection = "Skills";
      else if (secName.includes("project")) currentSection = "Projects";
      else if (secName.includes("experience") || secName.includes("work")) currentSection = "Experience";
      else if (secName.includes("education")) currentSection = "Education";
      else currentSection = "General";
    }
    chunks[currentSection].push(line);
  }

  if (phase === "Projects") return chunks["Projects"].join("\n");
  if (phase === "Core Skills") return chunks["Skills"].join("\n");
  if (phase === "Intro" || phase === "Experience") return chunks["Experience"].join("\n") || chunks["General"].join("\n");
  
  const targetChunk = chunks[phase === "Projects" ? "Projects" : phase === "Core Skills" ? "Skills" : "Experience"].join("\n");
  return targetChunk.trim().length > 50 ? targetChunk : resumeText; 
}
