import { db } from "./prisma";

/**
 * Calculates the current learning streak for a user based on their activity.
 * @param {string} userId - The user ID
 * @returns {number} Current consecutive days of activity
 */
export async function calculateLearningStreak(userId) {
    const activities = await db.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
    });

    if (!activities || activities.length === 0) return 0;

    const dates = [...new Set(activities.map(a =>
        new Date(a.createdAt).toISOString().split('T')[0]
    ))];

    let streak = 0;
    let currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];

    // Check if active today or yesterday (to maintain streak)
    let checkDate = today;
    let dateIdx = dates.indexOf(checkDate);

    if (dateIdx === -1) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        checkDate = yesterday.toISOString().split('T')[0];
        dateIdx = dates.indexOf(checkDate);
    }

    if (dateIdx === -1) return 0;

    // Count backwards
    while (dateIdx !== -1) {
        streak++;
        const prevDay = new Date(checkDate);
        prevDay.setDate(prevDay.getDate() - 1);
        checkDate = prevDay.toISOString().split('T')[0];
        dateIdx = dates.indexOf(checkDate);
    }

    return streak;
}

/**
 * Gets user's rank and percentile within their industry/role.
 * @param {string} userId - The user ID
 * @returns {Object} { rank, percentile }
 */
export async function getUserRank(userId) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { targetRole: true, industry: true }
    });

    if (!user) return { rank: 'N/A', percentile: 0 };

    // For high performance, we'll calculate based on progress in roadmap
    const allUsersInRole = await db.user.findMany({
        where: {
            targetRole: user.targetRole,
            industry: user.industry
        },
        include: {
            roadmap: {
                select: { progress: true }
            }
        }
    });

    if (allUsersInRole.length <= 1) return { rank: 1, percentile: 100 };

    const scores = allUsersInRole
        .map(u => ({ id: u.id, score: u.roadmap?.progress || 0 }))
        .sort((a, b) => b.score - a.score);

    const userIdx = scores.findIndex(s => s.id === userId);
    const rank = userIdx + 1;
    const percentile = Math.round(((scores.length - rank) / scores.length) * 100);

    return { rank, percentile: Math.max(percentile, 1) };
}

/**
 * Gets badges and milestones for the user.
 * @param {string} userId - The user ID
 * @returns {Object} { badges, milestones }
 */
export async function getEngagementData(userId) {
    const [streak, rankData, roadmap] = await Promise.all([
        calculateLearningStreak(userId),
        getUserRank(userId),
        db.roadmap.findUnique({ where: { userId } })
    ]);

    const badges = [
        { name: 'Starter', earned: true, icon: '🚀' },
        { name: `${streak}-Day Streak`, earned: streak >= 3, icon: '🔥' },
        { name: 'Goal Setter', earned: !!roadmap, icon: '🎯' },
        { name: 'Consistent Learner', earned: streak >= 7, icon: '⭐' }
    ];

    const milestones = {
        currentWeek: roadmap?.currentWeek || 1,
        next: roadmap?.currentWeek < 16
            ? `Complete Week ${roadmap.currentWeek} to unlock new specialized modules`
            : "You've completed the primary 16-week path! Focus on mock interviews now."
    };

    return {
        streak,
        rank: rankData.rank,
        percentile: rankData.percentile,
        badges,
        milestones
    };
}
