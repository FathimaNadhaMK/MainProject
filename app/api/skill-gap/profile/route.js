import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  return Response.json({
    industry: user.industry,
    skills: user.skills,
  });
}
