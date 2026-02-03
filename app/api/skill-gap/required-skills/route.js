import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || !user.industry) {
    return Response.json(
      { error: "Industry not set" },
      { status: 400 }
    );
  }

  const insight = await db.industryInsight.findUnique({
    where: { industry: user.industry },
  });

  return Response.json({
    skills: insight?.trendingSkills || [],
  });
}
