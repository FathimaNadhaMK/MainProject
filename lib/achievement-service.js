import { db } from "@/lib/prisma";

// Achievement definitions (GitHub/LeetCode style)
export const ACHIEVEMENT_DEFINITIONS = [
    // Streak Achievements (Tiered)
    {
        name: "🔥 Starter",
        description: "Complete your first day of learning",
        icon: "🔥",
        category: "streak",
        tier: "bronze",
        requirement: { type: "streak", value: 1 },
        rarity: "common",
        xpReward: 10,
    },
    {
        name: "🔥 7-Day Fire",
        description: "Maintain a 7-day learning streak",
        icon: "🔥",
        category: "streak",
        tier: "silver",
        requirement: { type: "streak", value: 7 },
        rarity: "rare",
        xpReward: 50,
    },
    {
        name: "🔥 30-Day Legend",
        description: "Maintain a 30-day learning streak",
        icon: "🔥",
        category: "streak",
        tier: "gold",
        requirement: { type: "streak", value: 30 },
        rarity: "epic",
        xpReward: 200,
    },
    {
        name: "🔥 100-Day Master",
        description: "Maintain a 100-day learning streak",
        icon: "🔥",
        category: "streak",
        tier: "platinum",
        requirement: { type: "streak", value: 100 },
        rarity: "legendary",
        xpReward: 1000,
    },

    // Completion Achievements
    {
        name: "📚 Goal Setter",
        description: "Complete your first weekly task",
        icon: "📚",
        category: "completion",
        tier: "bronze",
        requirement: { type: "tasks_completed", value: 1 },
        rarity: "common",
        xpReward: 15,
    },
    {
        name: "📚 Consistent Learner",
        description: "Complete 10 tasks",
        icon: "⭐",
        category: "completion",
        tier: "silver",
        requirement: { type: "tasks_completed", value: 10 },
        rarity: "rare",
        xpReward: 75,
    },
    {
        name: "📚 Dedicated Scholar",
        description: "Complete 50 tasks",
        icon: "🌟",
        category: "completion",
        tier: "gold",
        requirement: { type: "tasks_completed", value: 50 },
        rarity: "epic",
        xpReward: 300,
    },

    // Assessment Achievements
    {
        name: "🎯 First Steps",
        description: "Complete your first assessment",
        icon: "🎯",
        category: "skill",
        tier: "bronze",
        requirement: { type: "assessments_taken", value: 1 },
        rarity: "common",
        xpReward: 20,
    },
    {
        name: "🎯 Skill Builder",
        description: "Complete 10 assessments",
        icon: "🎯",
        category: "skill",
        tier: "silver",
        requirement: { type: "assessments_taken", value: 10 },
        rarity: "rare",
        xpReward: 100,
    },


    // Interview Achievements
    {
        name: "💼 Interview Ready",
        description: "Complete your first mock interview",
        icon: "💼",
        category: "skill",
        tier: "bronze",
        requirement: { type: "interviewsPracticed", value: 1 },
        rarity: "common",
        xpReward: 25,
    },
    {
        name: "💼 Interview Pro",
        description: "Complete 10 mock interviews",
        icon: "💼",
        category: "skill",
        tier: "silver",
        requirement: { type: "interviewsPracticed", value: 10 },
        rarity: "rare",
        xpReward: 150,
    },
    {
        name: "💼 Interview Master",
        description: "Complete 25 mock interviews",
        icon: "💼",
        category: "skill",
        tier: "gold",
        requirement: { type: "interviewsPracticed", value: 25 },
        rarity: "epic",
        xpReward: 500,
    },

    // Certification Achievements
    {
        name: "🏆 Certified",
        description: "Earn your first certification",
        icon: "🏆",
        category: "skill",
        tier: "gold",
        requirement: { type: "certificationsEarned", value: 1 },
        rarity: "epic",
        xpReward: 500,
    },
    {
        name: "🏆 Multi-Certified",
        description: "Earn 3 certifications",
        icon: "🏆",
        category: "skill",
        tier: "platinum",
        requirement: { type: "certificationsEarned", value: 3 },
        rarity: "legendary",
        xpReward: 1500,
    },

    // Progress Milestones
    {
        name: "📈 Rising Star",
        description: "Complete 25 tasks",
        icon: "📈",
        category: "completion",
        tier: "silver",
        requirement: { type: "tasksCompleted", value: 25 },
        rarity: "rare",
        xpReward: 125,
    },
    {
        name: "📈 Unstoppable",
        description: "Complete 100 tasks",
        icon: "📈",
        category: "completion",
        tier: "gold",
        requirement: { type: "tasksCompleted", value: 100 },
        rarity: "epic",
        xpReward: 500,
    },
    {
        name: "📈 Legend",
        description: "Complete 250 tasks",
        icon: "📈",
        category: "completion",
        tier: "platinum",
        requirement: { type: "tasksCompleted", value: 250 },
        rarity: "legendary",
        xpReward: 1250,
    },

    // Assessment Mastery
    {
        name: "🎯 Assessment Enthusiast",
        description: "Complete 5 assessments",
        icon: "🎯",
        category: "skill",
        tier: "bronze",
        requirement: { type: "assessmentsTaken", value: 5 },
        rarity: "common",
        xpReward: 50,
    },
    {
        name: "🎯 Assessment Expert",
        description: "Complete 25 assessments",
        icon: "🎯",
        category: "skill",
        tier: "silver",
        requirement: { type: "assessmentsTaken", value: 25 },
        rarity: "rare",
        xpReward: 200,
    },
    {
        name: "🎯 Assessment Legend",
        description: "Complete 50 assessments",
        icon: "🎯",
        category: "skill",
        tier: "gold",
        requirement: { type: "assessmentsTaken", value: 50 },
        rarity: "epic",
        xpReward: 750,
    },

    // Level Achievements
    {
        name: "⭐ Level 5 Achiever",
        description: "Reach Level 5",
        icon: "⭐",
        category: "progression",
        tier: "bronze",
        requirement: { type: "level", value: 5 },
        rarity: "common",
        xpReward: 100,
    },
    {
        name: "⭐ Level 10 Master",
        description: "Reach Level 10",
        icon: "⭐",
        category: "progression",
        tier: "silver",
        requirement: { type: "level", value: 10 },
        rarity: "rare",
        xpReward: 250,
    },
    {
        name: "⭐ Level 25 Elite",
        description: "Reach Level 25",
        icon: "⭐",
        category: "progression",
        tier: "gold",
        requirement: { type: "level", value: 25 },
        rarity: "epic",
        xpReward: 1000,
    },
    {
        name: "⭐ Level 50 Legend",
        description: "Reach Level 50",
        icon: "⭐",
        category: "progression",
        tier: "platinum",
        requirement: { type: "level", value: 50 },
        rarity: "legendary",
        xpReward: 5000,
    },

    // XP Milestones
    {
        name: "💎 XP Collector",
        description: "Earn 1,000 XP",
        icon: "💎",
        category: "progression",
        tier: "bronze",
        requirement: { type: "totalXP", value: 1000 },
        rarity: "common",
        xpReward: 100,
    },
    {
        name: "💎 XP Hoarder",
        description: "Earn 5,000 XP",
        icon: "💎",
        category: "progression",
        tier: "silver",
        requirement: { type: "totalXP", value: 5000 },
        rarity: "rare",
        xpReward: 500,
    },
    {
        name: "💎 XP Master",
        description: "Earn 10,000 XP",
        icon: "💎",
        category: "progression",
        tier: "gold",
        requirement: { type: "totalXP", value: 10000 },
        rarity: "epic",
        xpReward: 1000,
    },
    {
        name: "💎 XP Legend",
        description: "Earn 50,000 XP",
        icon: "💎",
        category: "progression",
        tier: "platinum",
        requirement: { type: "totalXP", value: 50000 },
        rarity: "legendary",
        xpReward: 5000,
    },

    // Special/Time-Limited Achievements
    {
        name: "🚀 Early Adopter",
        description: "Joined during beta period",
        icon: "🚀",
        category: "special",
        tier: "platinum",
        requirement: { type: "special", value: "early_adopter" },
        rarity: "legendary",
        xpReward: 1000,
    },
    {
        name: "🌟 Comeback Kid",
        description: "Return after 30 days of inactivity",
        icon: "🌟",
        category: "special",
        tier: "silver",
        requirement: { type: "special", value: "comeback" },
        rarity: "rare",
        xpReward: 150,
    },
    {
        name: "🎯 Perfectionist",
        description: "Complete an entire week without missing a day",
        icon: "🎯",
        category: "challenge",
        tier: "gold",
        requirement: { type: "special", value: "perfect_week" },
        rarity: "epic",
        xpReward: 300,
    },

    // 🟢 Onboarding Achievements
    {
        name: "🎯 First Step",
        description: "Complete your first roadmap task",
        icon: "🎯",
        category: "onboarding",
        tier: "bronze",
        requirement: { type: "tasksCompleted", value: 1 },
        rarity: "common",
        xpReward: 10,
    },
    {
        name: "🚀 Journey Begins",
        description: "Start your first roadmap",
        icon: "🚀",
        category: "onboarding",
        tier: "bronze",
        requirement: { type: "roadmapsStarted", value: 1 },
        rarity: "common",
        xpReward: 15,
    },
    {
        name: "💪 Getting Serious",
        description: "Complete 5 roadmap items",
        icon: "💪",
        category: "onboarding",
        tier: "bronze",
        requirement: { type: "tasksCompleted", value: 5 },
        rarity: "common",
        xpReward: 25,
    },

    // 🔵 Progress-Based Achievements
    {
        name: "📊 Quarter Way There",
        description: "Complete 25% of a roadmap",
        icon: "📊",
        category: "progression",
        tier: "bronze",
        requirement: { type: "roadmapProgress", value: 25 },
        rarity: "common",
        xpReward: 50,
    },
    {
        name: "🎖️ Halfway Hero",
        description: "Complete 50% of a roadmap",
        icon: "🎖️",
        category: "progression",
        tier: "silver",
        requirement: { type: "roadmapProgress", value: 50 },
        rarity: "rare",
        xpReward: 100,
    },
    {
        name: "🏅 Almost There",
        description: "Complete 75% of a roadmap",
        icon: "🏅",
        category: "progression",
        tier: "gold",
        requirement: { type: "roadmapProgress", value: 75 },
        rarity: "rare",
        xpReward: 200,
    },
    {
        name: "🏆 Roadmap Finisher",
        description: "Complete 100% of a roadmap",
        icon: "🏆",
        category: "progression",
        tier: "gold",
        requirement: { type: "roadmapsCompleted", value: 1 },
        rarity: "epic",
        xpReward: 500,
    },

    // 🟣 Consistency & Streak Achievements
    {
        name: "🔥 3-Day Streak",
        description: "Learn 3 days in a row",
        icon: "🔥",
        category: "streak",
        tier: "bronze",
        requirement: { type: "currentStreak", value: 3 },
        rarity: "common",
        xpReward: 30,
    },
    {
        name: "🔥 Consistency Champ",
        description: "Maintain a 14-day streak",
        icon: "🔥",
        category: "streak",
        tier: "silver",
        requirement: { type: "currentStreak", value: 14 },
        rarity: "rare",
        xpReward: 150,
    },
    {
        name: "📅 No Days Off",
        description: "Log progress every day in a month",
        icon: "📅",
        category: "streak",
        tier: "gold",
        requirement: { type: "monthlyStreak", value: 30 },
        rarity: "epic",
        xpReward: 600,
    },

    // 🔴 Challenge & Performance Achievements
    {
        name: "⚡ Speed Runner",
        description: "Complete 5 tasks in one day",
        icon: "⚡",
        category: "challenge",
        tier: "silver",
        requirement: { type: "tasksInOneDay", value: 5 },
        rarity: "rare",
        xpReward: 100,
    },
    {
        name: "🎯 Deep Focus",
        description: "Study continuously for 2+ hours",
        icon: "🎯",
        category: "challenge",
        tier: "silver",
        requirement: { type: "continuousHours", value: 2 },
        rarity: "rare",
        xpReward: 150,
    },
    {
        name: "📈 Productive Day",
        description: "Complete tasks from 3 sections in one day",
        icon: "📈",
        category: "challenge",
        tier: "bronze",
        requirement: { type: "sectionsInDay", value: 3 },
        rarity: "common",
        xpReward: 80,
    },
    {
        name: "🌟 Overachiever",
        description: "Exceed your daily goal",
        icon: "🌟",
        category: "challenge",
        tier: "bronze",
        requirement: { type: "dailyGoalExceeded", value: 1 },
        rarity: "common",
        xpReward: 50,
    },

    // 🟡 Goal & Planning Achievements
    {
        name: "🎯 Goal Setter",
        description: "Set your first learning goal",
        icon: "🎯",
        category: "goal",
        tier: "bronze",
        requirement: { type: "goalsSet", value: 1 },
        rarity: "common",
        xpReward: 20,
    },
    {
        name: "📋 Weekly Planner",
        description: "Set weekly goals consistently for 4 weeks",
        icon: "📋",
        category: "goal",
        tier: "silver",
        requirement: { type: "weeklyGoalsSet", value: 4 },
        rarity: "rare",
        xpReward: 100,
    },
    {
        name: "💥 Goal Crusher",
        description: "Complete all your weekly goals",
        icon: "💥",
        category: "goal",
        tier: "silver",
        requirement: { type: "weeklyGoalsCompleted", value: 1 },
        rarity: "rare",
        xpReward: 150,
    },

    // 🟤 Engagement & Platform Usage Achievements
    {
        name: "📱 Daily Check-In",
        description: "Visit the platform daily for 5 days",
        icon: "📱",
        category: "engagement",
        tier: "bronze",
        requirement: { type: "dailyVisits", value: 5 },
        rarity: "common",
        xpReward: 50,
    },
    {
        name: "🦘 Roadmap Hopper",
        description: "Explore 3 different roadmaps",
        icon: "🦘",
        category: "engagement",
        tier: "bronze",
        requirement: { type: "roadmapsExplored", value: 3 },
        rarity: "common",
        xpReward: 75,
    },
    {
        name: "💬 Feedback Giver",
        description: "Submit platform feedback",
        icon: "💬",
        category: "engagement",
        tier: "bronze",
        requirement: { type: "feedbackSubmitted", value: 1 },
        rarity: "rare",
        xpReward: 40,
    },

    // ⚫ Hidden Achievements
    {
        name: "💯 Perfectionist",
        description: "Complete a roadmap without skipping any step",
        icon: "💯",
        category: "special",
        tier: "platinum",
        requirement: { type: "perfectRoadmap", value: 1 },
        rarity: "legendary",
        xpReward: 1000,
    },
    {
        name: "👑 Comeback King",
        description: "Resume learning after a 30-day gap",
        icon: "👑",
        category: "special",
        tier: "gold",
        requirement: { type: "comebackAfterGap", value: 30 },
        rarity: "epic",
        xpReward: 500,
    },
    {
        name: "🦉 Night Owl",
        description: "Learn after midnight 5 times",
        icon: "🦉",
        category: "special",
        tier: "silver",
        requirement: { type: "nightSessions", value: 5 },
        rarity: "rare",
        xpReward: 150,
    },
    {
        name: "🐦 Early Bird",
        description: "Learn before 6 AM 5 times",
        icon: "🐦",
        category: "special",
        tier: "silver",
        requirement: { type: "morningSessions", value: 5 },
        rarity: "rare",
        xpReward: 150,
    },
    {
        name: "🏃 Marathon Learner",
        description: "Learn for 100 total days",
        icon: "🏃",
        category: "special",
        tier: "platinum",
        requirement: { type: "totalDaysActive", value: 100 },
        rarity: "legendary",
        xpReward: 800,
    },

    // 🟨 Meta / Prestige Achievements
    {
        name: "⬆️ Level Up",
        description: "Reach Level 10",
        icon: "⬆️",
        category: "progression",
        tier: "gold",
        requirement: { type: "level", value: 10 },
        rarity: "epic",
        xpReward: 500,
    },
    {
        name: "👑 Elite Member",
        description: "Unlock 50 achievements",
        icon: "👑",
        category: "progression",
        tier: "platinum",
        requirement: { type: "achievementsUnlocked", value: 50 },
        rarity: "legendary",
        xpReward: 1500,
    },
];

/**
 * Initialize achievements in database
 */
export async function seedAchievements() {
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        await db.achievement.upsert({
            where: { name: achievement.name },
            update: achievement,
            create: achievement,
        });
    }
    console.log("✅ Achievements seeded successfully");
}

/**
 * Get or create user stats
 */
export async function getUserStats(userId) {
    let stats = await db.userStats.findUnique({
        where: { userId },
    });

    if (!stats) {
        stats = await db.userStats.create({
            data: { userId },
        });
    }

    return stats;
}

/**
 * Update user streak
 */
export async function updateUserStreak(userId) {
    const stats = await getUserStats(userId);
    const now = new Date();
    const lastActivity = stats.lastActivityDate;

    let newStreak = stats.currentStreak;

    if (!lastActivity) {
        // First activity
        newStreak = 1;
    } else {
        const daysSinceLastActivity = Math.floor(
            (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastActivity === 1) {
            // Consecutive day
            newStreak = stats.currentStreak + 1;
        } else if (daysSinceLastActivity > 1) {
            // Streak broken
            newStreak = 1;
        }
        // Same day = no change
    }

    const updatedStats = await db.userStats.update({
        where: { userId },
        data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, stats.longestStreak),
            lastActivityDate: now,
        },
    });

    // Check for streak achievements
    await checkAchievements(userId, "streak", newStreak);

    return updatedStats;
}

/**
 * Increment a stat counter
 */
export async function incrementStat(userId, statName) {
    const stats = await getUserStats(userId);

    const updatedStats = await db.userStats.update({
        where: { userId },
        data: {
            [statName]: stats[statName] + 1,
        },
    });

    // Check for achievements based on this stat
    await checkAchievements(userId, statName, updatedStats[statName]);

    return updatedStats;
}

/**
 * Check and award achievements
 */
export async function checkAchievements(userId, type, value) {
    // Get all achievements for this type
    const achievements = await db.achievement.findMany({
        where: {
            requirement: {
                path: ["type"],
                equals: type,
            },
        },
    });

    for (const achievement of achievements) {
        const requiredValue = achievement.requirement.value;

        // Check if user already has this achievement
        const existing = await db.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
        });

        // Award achievement if threshold met and not already earned
        if (value >= requiredValue && !existing) {
            await db.userAchievement.create({
                data: {
                    userId,
                    achievementId: achievement.id,
                },
            });

            // Award XP
            const updatedStats = await db.userStats.update({
                where: { userId },
                data: {
                    totalXP: {
                        increment: achievement.xpReward,
                    },
                },
            });

            // Calculate new level
            const newLevel = calculateLevel(updatedStats.totalXP);
            if (newLevel > updatedStats.level) {
                await db.userStats.update({
                    where: { userId },
                    data: { level: newLevel },
                });

                // Check level achievements
                await checkAchievements(userId, "level", newLevel);
            }

            // Check XP milestone achievements
            await checkAchievements(userId, "totalXP", updatedStats.totalXP);

            console.log(`🎉 Achievement unlocked: ${achievement.name} for user ${userId}`);
        }
    }
}

/**
 * Get user achievements with details
 */
export async function getUserAchievements(userId) {
    const userAchievements = await db.userAchievement.findMany({
        where: { userId },
        include: {
            achievement: true,
        },
        orderBy: {
            earnedAt: "desc",
        },
    });

    // Get all achievements to show locked ones
    const allAchievements = await db.achievement.findMany({
        orderBy: [{ category: "asc" }, { tier: "asc" }],
    });

    const earnedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    const achievements = allAchievements.map((achievement) => {
        const userAchievement = userAchievements.find(
            (ua) => ua.achievementId === achievement.id
        );

        return {
            ...achievement,
            earned: earnedIds.has(achievement.id),
            earnedAt: userAchievement?.earnedAt,
            level: userAchievement?.level || 0,
            progress: userAchievement?.progress || 0,
        };
    });

    return achievements;
}

/**
 * Get user's displayed achievements (for profile/roadmap)
 */
export async function getDisplayedAchievements(userId, limit = 5) {
    const achievements = await getUserAchievements(userId);

    // Filter earned and displayed, sort by rarity and date
    const displayed = achievements
        .filter((a) => a.earned)
        .sort((a, b) => {
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
            const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
            if (rarityDiff !== 0) return rarityDiff;
            return new Date(b.earnedAt) - new Date(a.earnedAt);
        })
        .slice(0, limit);

    return displayed;
}

/**
 * Calculate user level from XP
 */
export function calculateLevel(xp) {
    // Simple formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel) {
    return (currentLevel ** 2) * 100;
}
