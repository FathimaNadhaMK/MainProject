const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
    // Existing achievements (keeping them for reference)
    { name: "🔥 Starter", description: "Complete your first day of learning", icon: "🔥", category: "streak", tier: "bronze", requirement: { type: "streak", value: 1 }, rarity: "common", xpReward: 10 },
    { name: "🔥 7-Day Fire", description: "Maintain a 7-day learning streak", icon: "🔥", category: "streak", tier: "silver", requirement: { type: "streak", value: 7 }, rarity: "rare", xpReward: 50 },
    { name: "🔥 30-Day Legend", description: "Maintain a 30-day learning streak", icon: "🔥", category: "streak", tier: "gold", requirement: { type: "streak", value: 30 }, rarity: "epic", xpReward: 200 },
    { name: "🔥 100-Day Master", description: "Maintain a 100-day learning streak", icon: "🔥", category: "streak", tier: "platinum", requirement: { type: "streak", value: 100 }, rarity: "legendary", xpReward: 1000 },
    { name: "📚 Goal Setter", description: "Complete your first weekly task", icon: "📚", category: "completion", tier: "bronze", requirement: { type: "tasks_completed", value: 1 }, rarity: "common", xpReward: 15 },
    { name: "📚 Consistent Learner", description: "Complete 10 tasks", icon: "⭐", category: "completion", tier: "silver", requirement: { type: "tasks_completed", value: 10 }, rarity: "rare", xpReward: 75 },
    { name: "📚 Dedicated Scholar", description: "Complete 50 tasks", icon: "🌟", category: "completion", tier: "gold", requirement: { type: "tasks_completed", value: 50 }, rarity: "epic", xpReward: 300 },
    { name: "🎯 First Steps", description: "Complete your first assessment", icon: "🎯", category: "skill", tier: "bronze", requirement: { type: "assessments_taken", value: 1 }, rarity: "common", xpReward: 20 },
    { name: "🎯 Skill Builder", description: "Complete 10 assessments", icon: "🎯", category: "skill", tier: "silver", requirement: { type: "assessments_taken", value: 10 }, rarity: "rare", xpReward: 100 },
    { name: "💼 Interview Ready", description: "Complete your first mock interview", icon: "💼", category: "skill", tier: "bronze", requirement: { type: "interviewsPracticed", value: 1 }, rarity: "common", xpReward: 25 },
    { name: "💼 Interview Pro", description: "Complete 10 mock interviews", icon: "💼", category: "skill", tier: "silver", requirement: { type: "interviewsPracticed", value: 10 }, rarity: "rare", xpReward: 150 },
    { name: "💼 Interview Master", description: "Complete 25 mock interviews", icon: "💼", category: "skill", tier: "gold", requirement: { type: "interviewsPracticed", value: 25 }, rarity: "epic", xpReward: 500 },
    { name: "🏆 Certified", description: "Earn your first certification", icon: "🏆", category: "skill", tier: "gold", requirement: { type: "certificationsEarned", value: 1 }, rarity: "epic", xpReward: 500 },

    // NEW ACHIEVEMENTS
    { name: "🎯 First Step", description: "Complete your first roadmap task", icon: "🎯", category: "onboarding", tier: "bronze", requirement: { type: "tasksCompleted", value: 1 }, rarity: "common", xpReward: 10 },
    { name: "🚀 Journey Begins", description: "Start your first roadmap", icon: "🚀", category: "onboarding", tier: "bronze", requirement: { type: "roadmapsStarted", value: 1 }, rarity: "common", xpReward: 15 },
    { name: "💪 Getting Serious", description: "Complete 5 roadmap items", icon: "💪", category: "onboarding", tier: "bronze", requirement: { type: "tasksCompleted", value: 5 }, rarity: "common", xpReward: 25 },
    { name: "📊 Quarter Way There", description: "Complete 25% of a roadmap", icon: "📊", category: "progression", tier: "bronze", requirement: { type: "roadmapProgress", value: 25 }, rarity: "common", xpReward: 50 },
    { name: "🎖️ Halfway Hero", description: "Complete 50% of a roadmap", icon: "🎖️", category: "progression", tier: "silver", requirement: { type: "roadmapProgress", value: 50 }, rarity: "rare", xpReward: 100 },
    { name: "🏅 Almost There", description: "Complete 75% of a roadmap", icon: "🏅", category: "progression", tier: "gold", requirement: { type: "roadmapProgress", value: 75 }, rarity: "rare", xpReward: 200 },
    { name: "🏆 Roadmap Finisher", description: "Complete 100% of a roadmap", icon: "🏆", category: "progression", tier: "gold", requirement: { type: "roadmapsCompleted", value: 1 }, rarity: "epic", xpReward: 500 },
    { name: "🔥 3-Day Streak", description: "Learn 3 days in a row", icon: "🔥", category: "streak", tier: "bronze", requirement: { type: "currentStreak", value: 3 }, rarity: "common", xpReward: 30 },
    { name: "🔥 Consistency Champ", description: "Maintain a 14-day streak", icon: "🔥", category: "streak", tier: "silver", requirement: { type: "currentStreak", value: 14 }, rarity: "rare", xpReward: 150 },
    { name: "📅 No Days Off", description: "Log progress every day in a month", icon: "📅", category: "streak", tier: "gold", requirement: { type: "monthlyStreak", value: 30 }, rarity: "epic", xpReward: 600 },
    { name: "⚡ Speed Runner", description: "Complete 5 tasks in one day", icon: "⚡", category: "challenge", tier: "silver", requirement: { type: "tasksInOneDay", value: 5 }, rarity: "rare", xpReward: 100 },
    { name: "🎯 Deep Focus", description: "Study continuously for 2+ hours", icon: "🎯", category: "challenge", tier: "silver", requirement: { type: "continuousHours", value: 2 }, rarity: "rare", xpReward: 150 },
    { name: "📈 Productive Day", description: "Complete tasks from 3 sections in one day", icon: "📈", category: "challenge", tier: "bronze", requirement: { type: "sectionsInDay", value: 3 }, rarity: "common", xpReward: 80 },
    { name: "🌟 Overachiever", description: "Exceed your daily goal", icon: "🌟", category: "challenge", tier: "bronze", requirement: { type: "dailyGoalExceeded", value: 1 }, rarity: "common", xpReward: 50 },
    { name: "🎯 Goal Setter", description: "Set your first learning goal", icon: "🎯", category: "goal", tier: "bronze", requirement: { type: "goalsSet", value: 1 }, rarity: "common", xpReward: 20 },
    { name: "📋 Weekly Planner", description: "Set weekly goals consistently for 4 weeks", icon: "📋", category: "goal", tier: "silver", requirement: { type: "weeklyGoalsSet", value: 4 }, rarity: "rare", xpReward: 100 },
    { name: "💥 Goal Crusher", description: "Complete all your weekly goals", icon: "💥", category: "goal", tier: "silver", requirement: { type: "weeklyGoalsCompleted", value: 1 }, rarity: "rare", xpReward: 150 },
    { name: "📱 Daily Check-In", description: "Visit the platform daily for 5 days", icon: "📱", category: "engagement", tier: "bronze", requirement: { type: "dailyVisits", value: 5 }, rarity: "common", xpReward: 50 },
    { name: "🦘 Roadmap Hopper", description: "Explore 3 different roadmaps", icon: "🦘", category: "engagement", tier: "bronze", requirement: { type: "roadmapsExplored", value: 3 }, rarity: "common", xpReward: 75 },
    { name: "💬 Feedback Giver", description: "Submit platform feedback", icon: "💬", category: "engagement", tier: "bronze", requirement: { type: "feedbackSubmitted", value: 1 }, rarity: "rare", xpReward: 40 },
    { name: "💯 Perfectionist", description: "Complete a roadmap without skipping any step", icon: "💯", category: "special", tier: "platinum", requirement: { type: "perfectRoadmap", value: 1 }, rarity: "legendary", xpReward: 1000, isHidden: true },
    { name: "👑 Comeback King", description: "Resume learning after a 30-day gap", icon: "👑", category: "special", tier: "gold", requirement: { type: "comebackAfterGap", value: 30 }, rarity: "epic", xpReward: 500, isHidden: true },
    { name: "🦉 Night Owl", description: "Learn after midnight 5 times", icon: "🦉", category: "special", tier: "silver", requirement: { type: "nightSessions", value: 5 }, rarity: "rare", xpReward: 150, isHidden: true },
    { name: "🐦 Early Bird", description: "Learn before 6 AM 5 times", icon: "🐦", category: "special", tier: "silver", requirement: { type: "morningSessions", value: 5 }, rarity: "rare", xpReward: 150, isHidden: true },
    { name: "🏃 Marathon Learner", description: "Learn for 100 total days", icon: "🏃", category: "special", tier: "platinum", requirement: { type: "totalDaysActive", value: 100 }, rarity: "legendary", xpReward: 800, isHidden: true },
    { name: "⬆️ Level Up", description: "Reach Level 10", icon: "⬆️", category: "progression", tier: "gold", requirement: { type: "level", value: 10 }, rarity: "epic", xpReward: 500 },
    { name: "👑 Elite Member", description: "Unlock 50 achievements", icon: "👑", category: "progression", tier: "platinum", requirement: { type: "achievementsUnlocked", value: 50 }, rarity: "legendary", xpReward: 1500 },
];

async function seedAchievements() {
    console.log("🏆 Seeding achievements...");

    let count = 0;
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
        await prisma.achievement.upsert({
            where: { name: achievement.name },
            update: achievement,
            create: achievement,
        });
        count++;
        console.log(`  ✓ ${achievement.name}`);
    }

    console.log(`\n✅ Created/Updated ${count} achievements`);
}

seedAchievements()
    .then(async () => {
        await prisma.$disconnect();
        console.log("✅ Achievement seeding completed!");
        process.exit(0);
    })
    .catch(async (error) => {
        console.error("❌ Error seeding achievements:", error);
        await prisma.$disconnect();
        process.exit(1);
    });
