"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
    getUserStats,
    getUserAchievements,
    getDisplayedAchievements,
} from "@/lib/achievement-service";

/**
 * Get user achievements and stats for display
 */
export async function getAchievementsData() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Auto-seed achievements if table is empty
        const count = await db.achievement.count();
        if (count === 0) {
            const { seedAchievements } = await import("@/lib/achievement-service");
            await seedAchievements();
        }

        // Get user stats
        let stats = await getUserStats(user.id);

        // Check if streak should be reset (if user hasn't been active for more than 1 day)
        if (stats.lastActivityDate) {
            const now = new Date();
            const daysSinceLastActivity = Math.floor(
                (now.getTime() - stats.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Reset streak if more than 1 day has passed without activity
            if (daysSinceLastActivity > 1 && stats.currentStreak > 0) {
                stats = await db.userStats.update({
                    where: { userId: user.id },
                    data: {
                        currentStreak: 0,
                    },
                });
            }
        }

        // Get all achievements (earned + locked)
        const achievements = await getUserAchievements(user.id);

        // Calculate rank and percentile dynamically
        const totalUsers = await db.user.count();
        const usersWithMoreXP = await db.userStats.count({
            where: {
                totalXP: {
                    gt: stats.totalXP,
                },
            },
        });

        const rank = usersWithMoreXP + 1;

        // Calculate percentile more realistically
        // For users with 0 XP or minimal activity, show them in the bottom percentile
        let percentile;
        if (stats.totalXP === 0 && stats.tasksCompleted === 0) {
            // Complete beginners start at bottom 50%
            percentile = Math.max(50, Math.round((rank / totalUsers) * 100));
        } else if (stats.totalXP < 100) {
            // Low activity users (less than 100 XP)
            percentile = Math.max(40, Math.round((rank / totalUsers) * 100));
        } else {
            // Active users get actual percentile
            percentile = Math.round((rank / totalUsers) * 100);
        }

        return {
            success: true,
            data: {
                stats: {
                    ...stats,
                    rank,
                    percentile,
                },
                achievements,
                streak: stats.currentStreak,
            },
        };
    } catch (error) {
        console.error("Error fetching achievements:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get engagement data for dashboard (legacy compatibility)
 */
export async function getEngagementData() {
    const achievementsData = await getAchievementsData();

    if (!achievementsData.success) {
        return null;
    }

    const { stats, achievements, streak } = achievementsData.data;

    // Format for dashboard compatibility
    const earnedAchievements = achievements.filter((a) => a.earned);

    return {
        streak: streak,
        rank: stats.rank,
        percentile: stats.percentile,
        badges: earnedAchievements.slice(0, 4).map((a) => ({
            icon: a.icon,
            name: a.name.replace(/^[^\s]+\s/, ""), // Remove emoji from name
            earned: true,
        })),
        milestones: {
            next: getNextMilestone(stats, achievements),
        },
    };
}

function getNextMilestone(stats, achievements) {
    // Find next locked achievement
    const locked = achievements.filter((a) => !a.earned);

    if (locked.length === 0) {
        return "Complete Week 1 to unlock new specialized modules";
    }

    const next = locked[0];
    const reqType = next.requirement.type;
    const reqValue = next.requirement.value;
    const current = stats[reqType] || 0;

    if (reqType === "streak") {
        return `Maintain ${reqValue}-day streak to unlock "${next.name}"`;
    } else if (reqType === "tasks_completed") {
        return `Complete ${reqValue - current} more tasks to unlock "${next.name}"`;
    } else if (reqType === "assessments_taken") {
        return `Take ${reqValue - current} more assessments to unlock "${next.name}"`;
    }

    return "Complete Week 1 to unlock new specialized modules";
}
