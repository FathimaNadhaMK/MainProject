"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function saveCoverLetter({ company, position, content }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const letter = await db.coverLetter.create({
    data: {
      userId: user.id,
      company,
      position,
      content,
    },
  });

  return letter;
}