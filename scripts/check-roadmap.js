/**
 * Check current roadmap structure in the database
 * This will show how many weeks exist and their phase distribution
 */

import { db } from '../lib/prisma.js';

async function checkRoadmapStructure() {
    try {
        console.log('🔍 Checking roadmap structure...\n');

        // Get all users with roadmaps
        const users = await db.user.findMany({
            include: {
                roadmap: true
            }
        });

        if (users.length === 0) {
            console.log('❌ No users found in database');
            return;
        }

        for (const user of users) {
            console.log(`\n👤 User: ${user.name || user.email}`);
            console.log(`   Target Role: ${user.targetRole || 'Not set'}`);

            if (!user.roadmap) {
                console.log('   ⚠️  No roadmap generated yet');
                continue;
            }

            const weeklyPlan = user.roadmap.weeklyPlan || [];
            console.log(`   📅 Total Weeks: ${weeklyPlan.length}`);

            // Count weeks by phase
            const phaseCount = {
                'Foundation': 0,
                'Intermediate': 0,
                'Advanced': 0,
                'Interview Prep': 0,
                'Other': 0
            };

            weeklyPlan.forEach(week => {
                const phase = week.phase;
                if (phaseCount.hasOwnProperty(phase)) {
                    phaseCount[phase]++;
                } else {
                    phaseCount['Other']++;
                }
            });

            console.log('\n   📊 Phase Distribution:');
            Object.entries(phaseCount).forEach(([phase, count]) => {
                if (count > 0) {
                    const weeks = weeklyPlan
                        .filter(w => w.phase === phase)
                        .map(w => w.week)
                        .sort((a, b) => a - b);

                    console.log(`      ${phase}: ${count} weeks (${weeks.join(', ')})`);
                }
            });

            // Check for missing weeks
            const weekNumbers = weeklyPlan.map(w => w.week).sort((a, b) => a - b);
            const expectedWeeks = Array.from({ length: 16 }, (_, i) => i + 1);
            const missingWeeks = expectedWeeks.filter(w => !weekNumbers.includes(w));

            if (missingWeeks.length > 0) {
                console.log(`\n   ⚠️  Missing Weeks: ${missingWeeks.join(', ')}`);
            } else {
                console.log('\n   ✅ All 16 weeks present');
            }

            // Check Interview Prep specifically
            const interviewPrepWeeks = weeklyPlan.filter(w => w.phase === 'Interview Prep');
            console.log(`\n   🎯 Interview Prep Status:`);
            if (interviewPrepWeeks.length === 0) {
                console.log('      ❌ NO INTERVIEW PREP WEEKS FOUND');
                console.log('      → You need to regenerate your roadmap!');
            } else {
                console.log(`      ✅ ${interviewPrepWeeks.length} weeks found`);
                interviewPrepWeeks.forEach(week => {
                    const taskCount = week.tasks?.length || 0;
                    console.log(`         Week ${week.week}: ${taskCount} tasks - "${week.topic}"`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.$disconnect();
    }
}

checkRoadmapStructure();
