import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/lib/achievement-service";

export async function POST() {
    try {
        console.log("🏆 Seeding achievements...");

        let count = 0;
        for (const achievement of ACHIEVEMENT_DEFINITIONS) {
            await db.achievement.upsert({
                where: { name: achievement.name },
                update: achievement,
                create: achievement,
            });
            count++;
        }

        return NextResponse.json({
            success: true,
            message: `Created/Updated ${count} achievements`,
            total: ACHIEVEMENT_DEFINITIONS.length
        });
    } catch (error) {
        console.error("Error seeding achievements:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
