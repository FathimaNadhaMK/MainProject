// central recruiter persona definitions used across client and server
export const recruiters = {
  faang_hr: {
    id: "faang_hr",
    name: "Rajesh (FAANG HR)",
    gender: "male",
    difficulty: "hard",
    style: "formal",
    focus: ["behavioral", "culture", "leadership"],
    description:
      "A structured, formal interviewer from a top-tier tech company. Expects polished answers and evaluates leadership/impact.",
    avatar: "/recruiters/rajesh_faang_hr.png",
  },
  startup_cto: {
    id: "startup_cto",
    name: "Priya (Startup CTO)",
    gender: "female",
    difficulty: "medium",
    style: "probing",
    focus: ["technical", "systems", "product"],
    description:
      "Deep‑diving technical questions with an emphasis on systems thinking and product trade‑offs. Informal tone.",
    avatar: "/recruiters/priya_startup_cto.png",
  },
  service_hr: {
    id: "service_hr",
    name: "Anita (Service HR)",
    gender: "female",
    difficulty: "easy",
    style: "friendly",
    focus: ["general", "behavioral"],
    description:
      "A friendly HR representative from a large services firm. Focuses on fit and communication.",
    avatar: "/recruiters/anjali_hr.png",
  },
  bank_hr: {
    id: "bank_hr",
    name: "Vikram (Bank HR)",
    gender: "male",
    difficulty: "medium",
    style: "situational",
    focus: ["situational", "motivation"],
    description:
      "Situational and motivation‑driven questions typical of banking HR rounds.",
    avatar: "/recruiters/vikram_bank_hr.png",
  },
  bank_officer: {
    id: "bank_officer",
    name: "Mrs. Sharma",
    gender: "female",
    difficulty: "hard",
    style: "strict",
    focus: ["ethics", "awareness", "communication"],
    description:
      "A strict senior officer who tests ethics, awareness and communication under pressure.",
    avatar: "/recruiters/mrs_sharma_officer.png",
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
    name: `Anjali (${field} HR)`,
    gender: "female",
    role: "HR",
    companyType: field,
    tone: "Formal",
    domain: field,
    focus: ["behavioral", "culture", "fit"],
    difficulty: "medium",
    avatar: "/recruiters/anjali_hr.png",
  });

  // include a role‑specific hiring manager
  list.push({
    id: `${role.toLowerCase().replace(/\s+/g, "_")}_hm`,
    name: `Siddharth (${role} Manager)`,
    gender: "male",
    role: role,
    companyType: field,
    tone: "Direct",
    domain: field,
    focus: ["role-specific", "experience", "skills"],
    difficulty: "medium",
    avatar: "/recruiters/siddharth_manager.png",
  });

  // add one generic technical/non‑technical persona depending on industry
  const techy = field.toLowerCase().includes("tech");
  list.push({
    id: techy ? "tech_lead" : "general_interviewer",
    name: techy ? "Kunal (Tech Lead)" : "Arjun (Interviewer)",
    gender: "male",
    role: techy ? "Lead" : "Interviewer",
    companyType: techy ? "Tech" : "Consulting",
    tone: techy ? "Technical" : "Friendly",
    domain: field,
    focus: techy ? ["technical", "systems", "architecture"] : ["general", "problem-solving"],
    difficulty: techy ? "hard" : "easy",
    avatar: techy ? "/recruiters/kunal_tech_lead.png" : "/recruiters/arjun_interviewer.png",
  });

  return list;
}
