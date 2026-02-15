// Personalization Engine — learns from user behavior to recalibrate match weights
// Analyzes which jobs users save/apply to and adjusts scoring weights accordingly.

import { db } from "@/lib/prisma";

// Default weights
const DEFAULT_WEIGHTS = {
    skillWeight: 0.35,
    levelWeight: 0.25,
    locationWeight: 0.15,
    atsWeight: 0.15,
    industryWeight: 0.10,
};

/**
 * Calibrate a user's match weights based on their save/apply behavior.
 * Called after every 10 actions or weekly via Inngest.
 *
 * Logic:
 * - Analyze saved/applied jobs' score breakdowns
 * - If user consistently saves jobs with high skill match → increase skillWeight
 * - If user saves remote jobs → flag preferRemote
 * - Normalize weights so they always sum to 1.0
 */
export async function calibrateWeights(userId) {
    try {
        // Get user's positive interactions (saved + applied)
        const positiveMatches = await db.userJobMatch.findMany({
            where: {
                userId,
                status: { in: ["saved", "applied"] },
            },
            select: {
                skillMatchScore: true,
                levelMatchScore: true,
                locationScore: true,
                atsScore: true,
                industryScore: true,
                job: {
                    select: {
                        isRemote: true,
                        location: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50, // Last 50 interactions
        });

        if (positiveMatches.length < 5) {
            // Not enough data to calibrate — keep defaults
            return DEFAULT_WEIGHTS;
        }

        // Calculate which factors are most prominent in saved/applied jobs
        const avgScores = {
            skill: average(positiveMatches.map((m) => m.skillMatchScore)),
            level: average(positiveMatches.map((m) => m.levelMatchScore)),
            location: average(positiveMatches.map((m) => m.locationScore)),
            ats: average(positiveMatches.map((m) => m.atsScore)),
            industry: average(positiveMatches.map((m) => m.industryScore)),
        };

        // Higher average = user values this factor more → increase its weight
        const total =
            avgScores.skill + avgScores.level + avgScores.location + avgScores.ats + avgScores.industry;

        if (total === 0) return DEFAULT_WEIGHTS;

        // Blend: 60% default + 40% learned
        const learned = {
            skillWeight: blend(DEFAULT_WEIGHTS.skillWeight, avgScores.skill / total, 0.4),
            levelWeight: blend(DEFAULT_WEIGHTS.levelWeight, avgScores.level / total, 0.4),
            locationWeight: blend(DEFAULT_WEIGHTS.locationWeight, avgScores.location / total, 0.4),
            atsWeight: blend(DEFAULT_WEIGHTS.atsWeight, avgScores.ats / total, 0.4),
            industryWeight: blend(DEFAULT_WEIGHTS.industryWeight, avgScores.industry / total, 0.4),
        };

        // Normalize so weights sum to 1.0
        const weightTotal =
            learned.skillWeight +
            learned.levelWeight +
            learned.locationWeight +
            learned.atsWeight +
            learned.industryWeight;

        const normalized = {
            skillWeight: round(learned.skillWeight / weightTotal),
            levelWeight: round(learned.levelWeight / weightTotal),
            locationWeight: round(learned.locationWeight / weightTotal),
            atsWeight: round(learned.atsWeight / weightTotal),
            industryWeight: round(learned.industryWeight / weightTotal),
        };

        // Detect remote preference
        const remoteCount = positiveMatches.filter((m) => m.job.isRemote).length;
        const preferRemote = remoteCount / positiveMatches.length > 0.5;

        // Detect preferred locations
        const locationCounts = {};
        positiveMatches.forEach((m) => {
            const loc = m.job.location?.split(",")[0]?.trim();
            if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });
        const preferredLocations = Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([loc]) => loc);

        // Upsert preferences
        await db.userMatchPreference.upsert({
            where: { userId },
            update: {
                ...normalized,
                preferRemote,
                preferredLocations,
                lastCalibration: new Date(),
                savedCount: await db.userJobMatch.count({
                    where: { userId, status: "saved" },
                }),
                appliedCount: await db.userJobMatch.count({
                    where: { userId, status: "applied" },
                }),
            },
            create: {
                userId,
                ...normalized,
                preferRemote,
                preferredLocations,
                lastCalibration: new Date(),
            },
        });

        console.log(`[Personalizer] Calibrated weights for user ${userId}:`, normalized);
        return normalized;
    } catch (error) {
        console.error("[Personalizer] Calibration error:", error.message);
        return DEFAULT_WEIGHTS;
    }
}

/**
 * Get the current weights for a user (personalized or default).
 */
export async function getUserWeights(userId) {
    try {
        const prefs = await db.userMatchPreference.findUnique({
            where: { userId },
        });

        if (!prefs) return DEFAULT_WEIGHTS;

        return {
            skillWeight: prefs.skillWeight,
            levelWeight: prefs.levelWeight,
            locationWeight: prefs.locationWeight,
            atsWeight: prefs.atsWeight,
            industryWeight: prefs.industryWeight,
            preferRemote: prefs.preferRemote,
            preferredLocations: prefs.preferredLocations,
        };
    } catch {
        return DEFAULT_WEIGHTS;
    }
}

// Helpers
function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, v) => sum + (v || 0), 0) / arr.length;
}

function blend(defaultVal, learnedVal, learnedWeight) {
    return defaultVal * (1 - learnedWeight) + learnedVal * learnedWeight;
}

function round(num) {
    return Math.round(num * 1000) / 1000;
}
