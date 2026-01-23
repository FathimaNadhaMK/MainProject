"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { checkUser } from "@/lib/checkUser";

// In actions/user.js - updateUser function
// In actions/user.js - updateUser function
export async function resetUserIndustry() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  await db.user.update({
    where: { clerkUserId: userId },
    data: { industry: null },
  });

  if (user.industry) {
    await db.industryInsight.deleteMany({
      where: { industry: user.industry },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return { success: true };
}

export async function updateUser(data) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  try {
    let existingUser = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!existingUser) {
      existingUser = await checkUser();
    }

    if (!existingUser) throw new Error("User not found after sync");

    // Build update data
    const updateData = {};

    if (data.industry !== undefined) updateData.industry = data.industry;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetRole !== undefined) updateData.targetRole = data.targetRole;
    if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel;
    if (data.locationPref !== undefined) updateData.locationPref = data.locationPref;
    if (data.companySizePref !== undefined) updateData.companySizePref = data.companySizePref;
    if (data.targetCompanies !== undefined) updateData.targetCompanies = data.targetCompanies;
    if (data.internshipInterest !== undefined) updateData.internshipInterest = data.internshipInterest;
    if (data.certificationInterest !== undefined) updateData.certificationInterest = data.certificationInterest;
    if (data.background !== undefined) updateData.background = data.background;

    // Simple update without transaction
    const updatedUser = await db.user.update({
      where: {
        id: existingUser.id,
      },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");
    revalidatePath("/");

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error.message);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

export async function getUserOnboardingStatus() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  try {
    let user = await db.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        industry: true,
        name: true,
        email: true,
        targetRole: true,
        roadmap: {
          select: { id: true }
        }
      },
    });

    if (!user) {
      await checkUser();
      user = await db.user.findUnique({
        where: { clerkUserId },
        select: {
          id: true,
          industry: true,
          name: true,
          email: true,
          targetRole: true,
          roadmap: {
            select: { id: true }
          }
        },
      });
    }

    if (!user) throw new Error("User not found after sync");

    // Check if user has completed minimal onboarding including roadmap generation
    const isOnboarded = !!(user.industry && user.name && user.email && user.targetRole && user.roadmap);

    return {
      isOnboarded,
      user: {
        id: user.id,
        industry: user.industry,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
      },
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

export async function getUserProfile() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        industry: true,
        skills: true,
        targetRole: true,
        educationLevel: true,
        locationPref: true,
        companySizePref: true,
        targetCompanies: true,
        internshipInterest: true,
        certificationInterest: true,
        background: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
}

export async function getIndustryInsights(industry) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) throw new Error("User not found");

    const industryToQuery = industry || user.industry;

    if (!industryToQuery) {
      return null;
    }

    const insight = await db.industryInsight.findUnique({
      where: {
        industry: industryToQuery,
      },
      select: {
        id: true,
        industry: true,
        overview: true,
        marketSize: true,
        growthRate: true,
        averageSalary: true,
        trendingSkills: true,
        emergingRoles: true,
        topCompanies: true,
        certifications: true,
        learningResources: true,
        challenges: true,
        opportunities: true,
        lastUpdated: true,
        nextUpdate: true,
      },
    });

    return insight;
  } catch (error) {
    console.error("Error fetching industry insights:", error);
    throw new Error("Failed to fetch industry insights");
  }
}