// Job Matching Algorithm — Multi-factor weighted scoring
// Score = Skill×W1 + Level×W2 + Location×W3 + ATS×W4 + Industry×W5
// Default weights: 0.35, 0.25, 0.15, 0.15, 0.10

import { getEligibleJobLevels, isAdjacentLevel } from "./level-mapper";
import { careerRoadmaps } from "@/data/roadmap-data";
import { calculateSemanticSkillMatch } from "./semantic-matcher";

// Industry similarity map — related industries get partial credit
const INDUSTRY_SIMILARITY = {
    "IT / Software Developer": ["Cloud / DevOps", "Cyber Security", "Data Science"],
    "Cloud / DevOps": ["IT / Software Developer", "Cyber Security"],
    "Data Science": ["AI / Machine Learning", "IT / Software Developer"],
    "AI / Machine Learning": ["Data Science", "IT / Software Developer"],
    "Cyber Security": ["IT / Software Developer", "Cloud / DevOps"],
    "UI/UX Design": ["IT / Software Developer"],
};

/**
 * Main entry point: calculate a weighted match score between a user and a job.
 * @param {Object} user - User record with skills, industry, locationPref, etc.
 * @param {Object} job - JobListing record
 * @param {Object} userProfile - Extended profile with atsScore, targetReadinessScore, skillLevel
 * @param {Object} weights - Optional custom weights from UserMatchPreference
 * @returns {{ matchScore, breakdown, reasoning, gapAnalysis }}
 */
export async function calculateJobMatch(user, job, userProfile, weights = null) {
    const w = weights || {
        skillWeight: 0.35,
        levelWeight: 0.25,
        locationWeight: 0.15,
        atsWeight: 0.15,
        industryWeight: 0.10,
    };

    const scores = {
        skillMatch: 0,
        levelMatch: 0,
        industryMatch: 0,
        atsReadiness: 0,
        location: 0,
    };

    // 1. Skill Match (default 35%) using Strategy 3 Contextual Semantic Scoring
    const userSkills = extractSkillsFromProfile(user);
    scores.skillMatch = await calculateSemanticSkillMatch(user.targetRole || user.industry, userSkills, job.skillsRequired);

    // 2. Experience Level Match (default 25%)
    const skillLevel = detectSkillLevel(user);
    const readiness = userProfile.targetReadinessScore || 0;
    const eligibleLevels = getEligibleJobLevels(skillLevel, readiness);

    if (eligibleLevels.includes(job.experienceLevel)) {
        scores.levelMatch = 100;
    } else if (isAdjacentLevel(skillLevel, job.experienceLevel)) {
        scores.levelMatch = 50;
    } else {
        scores.levelMatch = 0;
    }

    // 3. Industry Alignment (default 10%)
    scores.industryMatch = calculateIndustryMatch(user.industry, job.industry);

    // 4. ATS Readiness (default 15%)
    scores.atsReadiness = Math.min(userProfile.atsScore || 0, 100);

    // 5. Location (default 15%)
    scores.location = matchLocation(user.locationPref, job.location, job.isRemote, userProfile.preferRemote);

    // Calculate weighted final score
    const finalScore =
        scores.skillMatch * w.skillWeight +
        scores.levelMatch * w.levelWeight +
        scores.location * w.locationWeight +
        scores.atsReadiness * w.atsWeight +
        scores.industryMatch * w.industryWeight;

    const reasoning = generateMatchReasoning(scores, user, job);
    const gapAnalysis = generateGapAnalysis(user, job, scores);

    return {
        matchScore: Math.round(finalScore),
        breakdown: scores,
        reasoning,
        gapAnalysis,
    };
}

/**
 * Extract user's skills from profile JSON + roadmap data for their industry.
 */
export function extractSkillsFromProfile(user) {
    const skills = new Set();

    // From user.skills JSON (set during onboarding)
    if (user.skills) {
        const parsed = typeof user.skills === "string" ? JSON.parse(user.skills) : user.skills;
        if (Array.isArray(parsed)) {
            parsed.forEach((s) => {
                if (typeof s === 'string') skills.add(s.toLowerCase());
            });
        } else if (typeof parsed === "object") {
            // Handle { skillName: level } format
            Object.keys(parsed).forEach((s) => {
                if (typeof s === 'string') skills.add(s.toLowerCase());
            });
        }
    }

    // From roadmap data for their industry
    const industry = user.industry || "";
    const roadmap = careerRoadmaps[industry];
    if (roadmap && roadmap.skills) {
        roadmap.skills.forEach((s) => {
            if (typeof s === 'string') skills.add(s.toLowerCase());
        });
    }

    return Array.from(skills);
}

/**
 * Calculate percentage of job's required skills that the user has.
 */
export function calculateSkillOverlap(userSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 50; // No skills listed = neutral

    const userSkillSet = new Set(userSkills.map((s) => typeof s === 'string' ? s.toLowerCase() : ''));
    const matchedSkills = jobSkills.filter((skill) =>
        typeof skill === 'string' && userSkillSet.has(skill.toLowerCase())
    );

    return Math.round((matchedSkills.length / jobSkills.length) * 100);
}

/**
 * Score industry alignment.
 * Exact match = 100, similar industry = 60, no match = 0.
 */
function calculateIndustryMatch(userIndustry, jobIndustry) {
    if (!userIndustry || !jobIndustry) return 30; // Unknown = some credit

    // Normalize for comparison
    const uNorm = userIndustry.toLowerCase().trim();
    const jNorm = jobIndustry.toLowerCase().trim();

    if (uNorm === jNorm) return 100;

    // Check similarity map
    const similar = INDUSTRY_SIMILARITY[userIndustry] || [];
    if (similar.some((s) => s.toLowerCase() === jNorm)) return 60;

    return 0;
}

/**
 * Score location match.
 * Remote job + user prefers remote = 100.
 * Same location = 100.
 * Flexible / not specified = 50.
 */
function matchLocation(userPref, jobLocation, isRemote, userPrefersRemote) {
    // Remote preference match
    if (isRemote && userPrefersRemote) return 100;
    if (isRemote) return 80; // Remote is generally good

    if (!userPref || userPref.toLowerCase() === "flexible") return 50;
    if (!jobLocation) return 50;

    // Simple substring match
    const uLower = userPref.toLowerCase();
    const jLower = jobLocation.toLowerCase();

    if (jLower.includes(uLower) || uLower.includes(jLower)) return 100;

    return 20; // Location mismatch
}

/**
 * Detect the user's approximate skill level from their profile data.
 */
function detectSkillLevel(user) {
    // Check educationLevel or background for clues
    const bg = (user.background || "").toLowerCase();
    const edu = (user.educationLevel || "").toLowerCase();

    if (bg.includes("expert") || bg.includes("senior") || bg.includes("lead")) return "expert";
    if (bg.includes("advanced") || bg.includes("experienced") || edu.includes("masters"))
        return "advanced";
    if (bg.includes("intermediate") || bg.includes("junior") || edu.includes("bachelors"))
        return "intermediate";
    return "beginner";
}

/**
 * Generate human-readable "Why this match?" text.
 */
function generateMatchReasoning(scores, user, job) {
    const reasons = [];

    if (scores.skillMatch >= 70) {
        reasons.push(`Strong skill alignment — your skills match ${scores.skillMatch}% of what ${job.company} is looking for.`);
    } else if (scores.skillMatch >= 40) {
        reasons.push(`Partial skill match (${scores.skillMatch}%) — you have several relevant skills for this role.`);
    } else {
        reasons.push(`Low skill overlap (${scores.skillMatch}%) — this role requires skills outside your current profile.`);
    }

    if (scores.levelMatch === 100) {
        reasons.push(`Your experience level is a perfect match for this ${job.experienceLevel} position.`);
    } else if (scores.levelMatch === 50) {
        reasons.push(`This ${job.experienceLevel} role is slightly above/below your current level — a stretch goal!`);
    }

    if (scores.industryMatch === 100) {
        reasons.push(`Direct industry match — this role is in your target industry.`);
    } else if (scores.industryMatch >= 60) {
        reasons.push(`Related industry — skills from your field are transferable.`);
    }

    if (scores.location >= 80) {
        reasons.push(`Great location fit for your preferences.`);
    }

    if (scores.atsReadiness >= 70) {
        reasons.push(`Your resume is well-optimized (ATS score: ${scores.atsReadiness}%) for this type of role.`);
    }

    return {
        summary: reasons[0] || "This job matches your career profile.",
        details: reasons,
        topStrength:
            scores.skillMatch >= scores.levelMatch && scores.skillMatch >= scores.industryMatch
                ? "skills"
                : scores.levelMatch >= scores.industryMatch
                    ? "experience"
                    : "industry",
    };
}

/**
 * Generate gap analysis that links back to roadmap modules.
 * "You're X skills away from a perfect fit! Complete Y and Z modules."
 */
function generateGapAnalysis(user, job, scores) {
    const userSkills = extractSkillsFromProfile(user);
    const userSkillSet = new Set(userSkills.map((s) => typeof s === 'string' ? s.toLowerCase() : ''));

    const missingSkills = (job.skillsRequired || []).filter(
        (s) => typeof s === 'string' && !userSkillSet.has(s.toLowerCase())
    );

    // ATS readiness boost calculation
    const currentAts = scores.atsReadiness || 0;
    const atsImprovement = Math.max(0, 85 - currentAts);

    // Estimate how many more jobs would unlock with better ATS
    const additionalOpportunities = Math.round(atsImprovement * 0.5);

    return {
        missingSkills,
        missingSkillCount: missingSkills.length,
        message:
            missingSkills.length === 0
                ? "You have all the required skills for this role! 🎉"
                : missingSkills.length <= 2
                    ? `You're just ${missingSkills.length} skill${missingSkills.length === 1 ? "" : "s"} away from a perfect fit! Learn ${missingSkills.join(" and ")}.`
                    : `You need ${missingSkills.length} more skills for this role. Focus on: ${missingSkills.slice(0, 3).join(", ")}.`,
        readinessBoost:
            atsImprovement > 0
                ? `Improving your ATS score by ${atsImprovement} points could unlock ~${additionalOpportunities} more opportunities.`
                : "Your ATS score is already excellent!",
        skillsToLearn: missingSkills.slice(0, 5),
        improvementPercentage:
            missingSkills.length > 0
                ? Math.round(
                    ((job.skillsRequired.length - missingSkills.length) / job.skillsRequired.length) * 100
                )
                : 100,
    };
}
