// central recruiter persona definitions used across client and server
export const recruiters = {
  faang_hr: {
    id: "faang_hr",
    name: "FAANG HR",
    difficulty: "hard",
    style: "formal",
    focus: ["behavioral", "culture", "leadership"],
    description:
      "A structured, formal interviewer from a top-tier tech company. Expects polished answers and evaluates leadership/impact.",
  },
  startup_cto: {
    id: "startup_cto",
    name: "Startup CTO",
    difficulty: "medium",
    style: "probing",
    focus: ["technical", "systems", "product"],
    description:
      "Deep‑diving technical questions with an emphasis on systems thinking and product trade‑offs. Informal tone.",
  },
  service_hr: {
    id: "service_hr",
    name: "Service Company HR",
    difficulty: "easy",
    style: "friendly",
    focus: ["general", "behavioral"],
    description:
      "A friendly HR representative from a large services firm. Focuses on fit and communication.",
  },
  bank_hr: {
    id: "bank_hr",
    name: "Bank HR",
    difficulty: "medium",
    style: "situational",
    focus: ["situational", "motivation"],
    description:
      "Situational and motivation‑driven questions typical of banking HR rounds.",
  },
  bank_officer: {
    id: "bank_officer",
    name: "Senior Bank Officer",
    difficulty: "hard",
    style: "strict",
    focus: ["ethics", "awareness", "communication"],
    description:
      "A strict senior officer who tests ethics, awareness and communication under pressure.",
  },
};

// helper to convert object to list for UI
export const recruiterList = Object.values(recruiters);

// dynamically generate mock recruiters based on user onboarding context
export function generateRecruiters({ industry, targetRole }) {
  const list = [];
  const field = industry || "General";
  const role = targetRole || "Candidate";

  // always include an HR persona for the field
  list.push({
    id: `${field.toLowerCase().replace(/\s+/g, "_")}_hr`,
    name: `${field} HR`,
    role: "HR",
    companyType: field,
    tone: "Formal",
    domain: field,
    focus: ["behavioral", "culture", "fit"],
    difficulty: "medium",
    avatar: `https://i.pravatar.cc/100?u=${field.toLowerCase()}_hr`,
  });

  // include a role‑specific hiring manager
  list.push({
    id: `${role.toLowerCase().replace(/\s+/g, "_")}_hm`,
    name: `${role} Hiring Manager`,
    role: role,
    companyType: field,
    tone: "Direct",
    domain: field,
    focus: ["role-specific", "experience", "skills"],
    difficulty: "medium",
    avatar: `https://i.pravatar.cc/100?u=${role.toLowerCase()}_hm`,
  });

  // add one generic technical/non‑technical persona depending on industry
  const techy = field.toLowerCase().includes("tech");
  list.push({
    id: techy ? "tech_lead" : "general_interviewer",
    name: techy ? "Technical Lead" : "General Interviewer",
    role: techy ? "Lead" : "Interviewer",
    companyType: techy ? "Tech" : "Consulting",
    tone: techy ? "Technical" : "Friendly",
    domain: field,
    focus: techy ? ["technical", "systems", "architecture"] : ["general", "problem-solving"],
    difficulty: techy ? "hard" : "easy",
    avatar: `https://i.pravatar.cc/100?u=${techy ? "tech_lead" : "general_interviewer"}`,
  });

  return list;
}
