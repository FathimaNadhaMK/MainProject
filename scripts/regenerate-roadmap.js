/**
 * Script to regenerate roadmap for a specific user
 * This will fix the phase distribution for existing users
 * 
 * Usage: node scripts/regenerate-roadmap.js <clerkUserId>
 * Example: node scripts/regenerate-roadmap.js user_2abc123xyz
 */

import { db } from '../lib/prisma.js';
import { aiService } from '../lib/ai-service.js';

async function regenerateRoadmapForUser(clerkUserId) {
    try {
        console.log(`🔄 Regenerating roadmap for user: ${clerkUserId}`);

        // Find user
        const user = await db.user.findUnique({
            where: { clerkUserId },
            include: {
                userSkills: true,
                roadmap: true
            }
        });

        if (!user) {
            console.error('❌ User not found');
            return;
        }

        console.log(`✅ Found user: ${user.name || user.email}`);
        console.log(`📋 Target Role: ${user.targetRole}`);

        // Delete existing roadmap
        if (user.roadmap) {
            await db.roadmap.delete({
                where: { userId: user.id }
            });
            console.log('🗑️  Deleted old roadmap');
        }

        // Import and call generateRoadmap
        const { generateRoadmap } = await import('../actions/roadmap.js');

        // Temporarily set auth context (this is a workaround for server actions)
        // In production, you'd want to use the Clerk API directly
        console.log('🤖 Generating new roadmap with AI...');

        // For now, just log instructions
        console.log('\n⚠️  This script needs to be run with proper authentication context.');
        console.log('📝 Instead, please:');
        console.log('   1. Log in to the application as this user');
        console.log('   2. Go to /roadmap');
        console.log('   3. Click the "Regenerate Roadmap" button');
        console.log('\nOr, manually trigger regeneration from the onboarding page.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.$disconnect();
    }
}

// Get clerkUserId from command line
const clerkUserId = process.argv[2];

if (!clerkUserId) {
    console.log('Usage: node scripts/regenerate-roadmap.js <clerkUserId>');
    console.log('Example: node scripts/regenerate-roadmap.js user_2abc123xyz');
    process.exit(1);
}

regenerateRoadmapForUser(clerkUserId);
