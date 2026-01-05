import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    // Get counts from database
    const [
      userCount,
      roadmapCount,
      assessmentCount,
      opportunityCount
    ] = await Promise.all([
      db.user.count(),
      db.roadmap.count(),
      db.assessment.count(),
      db.opportunity.count()
    ]);

    // Get database info using Prisma.sql
    const dbInfo = await db.$queryRaw(
      Prisma.sql`SELECT version() as version, current_database() as name`
    );

    return Response.json({
      success: true,
      message: "Database connection test successful",
      data: {
        database: {
          name: dbInfo[0]?.name || "unknown",
          version: dbInfo[0]?.version?.split(' ')[0] || "PostgreSQL", // Just version number
          status: "connected"
        },
        counts: {
          users: userCount,
          roadmaps: roadmapCount,
          assessments: assessmentCount,
          opportunities: opportunityCount
        },
        health: "healthy",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Database test error:", error);
    return Response.json({
      success: false,
      error: error.message,
      message: "Database connection failed",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}