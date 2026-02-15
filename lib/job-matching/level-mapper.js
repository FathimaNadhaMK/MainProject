// Experience Level Mapping — maps user skill levels to eligible job levels
// Used by the matcher to score Level Match (25% of total score)

export const SKILL_LEVEL_TO_JOB_LEVEL = {
    beginner: {
        primary: ["Intern", "Entry Level", "Trainee"],
        secondary: ["Junior"],
        keywords: ["internship", "entry-level", "graduate", "fresher", "0-1 years", "entry level"],
    },
    intermediate: {
        primary: ["Junior", "Associate"],
        secondary: ["Mid-Level"],
        keywords: ["junior", "associate", "1-3 years", "2-4 years"],
    },
    advanced: {
        primary: ["Mid-Level", "Senior"],
        secondary: ["Lead"],
        keywords: ["mid-level", "senior", "3-5 years", "5-7 years", "experienced"],
    },
    expert: {
        primary: ["Senior", "Lead", "Staff"],
        secondary: ["Principal", "Architect"],
        keywords: ["senior", "lead", "staff", "7+ years", "expert", "principal"],
    },
};

// Ordered list of levels for adjacency calculation
const LEVEL_ORDER = [
    "Intern",
    "Trainee",
    "Entry Level",
    "Junior",
    "Associate",
    "Mid-Level",
    "Senior",
    "Lead",
    "Staff",
    "Principal",
    "Architect",
];

/**
 * Get eligible job levels for a user based on their skill level and readiness score.
 * If readiness >= 75%, include secondary (stretch) levels.
 */
export function getEligibleJobLevels(userSkillLevel, targetReadinessScore = 0) {
    const level = (userSkillLevel || "beginner").toLowerCase();
    const mapping = SKILL_LEVEL_TO_JOB_LEVEL[level] || SKILL_LEVEL_TO_JOB_LEVEL.beginner;

    if (targetReadinessScore >= 75) {
        return [...mapping.primary, ...mapping.secondary];
    }

    return mapping.primary;
}

/**
 * Check if a job's experience level is adjacent (one tier off) from the user's level.
 * Used to give partial credit (50 pts) when the level isn't an exact match.
 */
export function isAdjacentLevel(userSkillLevel, jobExperienceLevel) {
    const level = (userSkillLevel || "beginner").toLowerCase();
    const mapping = SKILL_LEVEL_TO_JOB_LEVEL[level];
    if (!mapping) return false;

    const allUserLevels = [...mapping.primary, ...mapping.secondary];

    // Find the closest user level index
    const userIndices = allUserLevels
        .map((l) => LEVEL_ORDER.indexOf(l))
        .filter((i) => i !== -1);

    const jobIndex = LEVEL_ORDER.indexOf(jobExperienceLevel);
    if (jobIndex === -1 || userIndices.length === 0) return false;

    // Adjacent = within 1 position in the ordered list
    return userIndices.some((ui) => Math.abs(ui - jobIndex) <= 1);
}

/**
 * Normalize raw experience level strings from APIs into standard format.
 */
export function normalizeExperienceLevel(raw) {
    if (!raw) return "Entry Level";
    const lower = raw.toLowerCase().trim();

    if (lower.includes("intern") || lower.includes("trainee")) return "Intern";
    if (lower.includes("entry") || lower.includes("fresher") || lower.includes("graduate"))
        return "Entry Level";
    if (lower.includes("junior") || lower.includes("associate")) return "Junior";
    if (lower.includes("mid") || lower.includes("intermediate")) return "Mid-Level";
    if (lower.includes("senior") || lower.includes("sr.") || lower.includes("sr "))
        return "Senior";
    if (lower.includes("lead") || lower.includes("principal") || lower.includes("staff"))
        return "Lead";

    return "Entry Level"; // Default
}

/**
 * Detect experience level from a job title or description text.
 */
export function detectExperienceLevelFromText(title, description = "") {
    const text = `${title} ${description}`.toLowerCase();

    for (const [, mapping] of Object.entries(SKILL_LEVEL_TO_JOB_LEVEL)) {
        for (const keyword of mapping.keywords) {
            if (text.includes(keyword)) {
                return normalizeExperienceLevel(keyword);
            }
        }
    }

    return "Entry Level";
}
