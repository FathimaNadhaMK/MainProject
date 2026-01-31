import { db } from '../lib/prisma.js';

async function deleteRoadmap() {
    try {
        console.log('🗑️  Deleting roadmap...');

        const deleted = await db.roadmap.deleteMany({});

        console.log(`✅ Deleted ${deleted.count} roadmap(s)`);
        console.log('📝 Now go to /onboarding to regenerate with the fix!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.$disconnect();
    }
}

deleteRoadmap();
