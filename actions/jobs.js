"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { inngest } from "@/lib/inngest/client";

// =============================================
// Get Matched Jobs — Tiered + Filtered
// =============================================

export async function getMatchedJobs(filters = {}) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
    });
    if (!user) throw new Error("User not found");

    const where = {
        userId: user.id,
        job: {
            isActive: true,
        },
    };

    // Apply filters
    if (filters.status && filters.status !== "all") {
        where.status = filters.status;
    }

    if (filters.minScore) {
        where.matchScore = { gte: filters.minScore };
    }

    if (filters.experienceLevel) {
        where.job.experienceLevel = filters.experienceLevel;
    }

    if (filters.isRemote !== undefined && filters.isRemote !== null) {
        where.job.isRemote = filters.isRemote;
    }

    if (filters.location) {
        where.job = {
            ...where.job,
            location: { contains: filters.location, mode: "insensitive" },
        };
    }

    const matches = await db.userJobMatch.findMany({
        where,
        include: {
            job: true,
        },
        orderBy: { matchScore: "desc" },
        take: 50,
    });

    // Group into tiers
    const tiered = {
        perfect: matches.filter((m) => m.matchScore >= 90),        // 90-100%
        great: matches.filter((m) => m.matchScore >= 75 && m.matchScore < 90),  // 75-89%
        exploring: matches.filter((m) => m.matchScore >= 60 && m.matchScore < 75), // 60-74%
        saved: matches.filter((m) => m.status === "saved"),
        applied: matches.filter((m) => m.status === "applied"),
    };

    return {
        success: true,
        data: {
            all: matches,
            tiered,
            total: matches.length,
            stats: {
                perfectCount: tiered.perfect.length,
                greatCount: tiered.great.length,
                exploringCount: tiered.exploring.length,
                savedCount: tiered.saved.length,
                appliedCount: tiered.applied.length,
                averageScore:
                    matches.length > 0
                        ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
                        : 0,
            },
        },
    };
}

// =============================================
// Update Job Match Status
// =============================================

export async function updateJobMatchStatus(matchId, newStatus) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
    });
    if (!user) throw new Error("User not found");

    const updateData = { status: newStatus };

    // Set timestamps based on status
    if (newStatus === "saved") {
        updateData.savedAt = new Date();
    } else if (newStatus === "applied") {
        updateData.appliedAt = new Date();
    }

    // Always set viewedAt on first interaction
    updateData.viewedAt = new Date();

    const match = await db.userJobMatch.update({
        where: {
            id: matchId,
            userId: user.id, // Ensure user owns this match
        },
        data: updateData,
        include: { job: true },
    });

    revalidatePath("/jobs");

    return { success: true, data: match };
}

// =============================================
// Get Job Match Stats
// =============================================

export async function getJobMatchStats() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
    });
    if (!user) throw new Error("User not found");

    const [total, saved, applied, avgResult] = await Promise.all([
        db.userJobMatch.count({ where: { userId: user.id } }),
        db.userJobMatch.count({ where: { userId: user.id, status: "saved" } }),
        db.userJobMatch.count({ where: { userId: user.id, status: "applied" } }),
        db.userJobMatch.aggregate({
            where: { userId: user.id },
            _avg: { matchScore: true },
            _max: { matchScore: true },
        }),
    ]);

    return {
        success: true,
        data: {
            totalMatches: total,
            savedJobs: saved,
            appliedJobs: applied,
            averageScore: Math.round(avgResult._avg.matchScore || 0),
            highestScore: Math.round(avgResult._max.matchScore || 0),
        },
    };
}

// =============================================
// Refresh Job Matches (On-Demand Trigger)
// =============================================

export async function refreshJobMatches() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    try {
        // For development: directly trigger job matching instead of Inngest event
        // Import the matching functions
        const { fetchAllJobs, generateSearchQueries } = await import("@/lib/job-matching/job-fetcher");
        const { calculateJobMatch } = await import("@/lib/job-matching/matcher");
        const { getUserWeights } = await import("@/lib/job-matching/personalizer");

        // Get user's industry
        const user = await db.user.findUnique({
            where: { clerkUserId },
            include: {
                resume: { select: { atsScore: true, aiScore: true } },
                matchPreferences: true,
            },
        });

        if (!user || !user.targetRole) {
            return { success: false, message: "Please complete onboarding and set your target role first" };
        }

        // Generate search queries and fetch jobs based on target role
        const queries = generateSearchQueries([user.targetRole]);
        const jobs = await fetchAllJobs(queries);

        if (jobs.length === 0) {
            return { success: false, message: "No jobs found. Please try again later." };
        }

        // Upsert jobs into database
        let insertedCount = 0;
        for (const job of jobs) {
            try {
                await db.jobListing.upsert({
                    where: { externalJobId: job.externalJobId },
                    update: { isActive: true, updatedAt: new Date() },
                    create: job,
                });
                insertedCount++;
            } catch (error) {
                console.warn(`Skipping job: ${error.message}`);
            }
        }

        // Get active jobs
        const activeJobs = await db.jobListing.findMany({
            where: { isActive: true },
            orderBy: { postedDate: "desc" },
            take: 100,
        });

        // Calculate matches for this user
        const weights = user.matchPreferences || (await getUserWeights(user.id));
        const userProfile = {
            atsScore: user.resume?.atsScore || user.resume?.aiScore || 50,
            targetReadinessScore: user.resume?.atsScore
                ? Math.round(user.resume.atsScore * 0.6 + 15)
                : 40,
            preferRemote: user.matchPreferences?.preferRemote || false,
        };

        let matchesCreated = 0;
        for (const job of activeJobs) {
            try {
                const result = await calculateJobMatch(user, job, userProfile, weights);

                if (result.matchScore >= 60) {
                    await db.userJobMatch.upsert({
                        where: { userId_jobId: { userId: user.id, jobId: job.id } },
                        update: {
                            matchScore: result.matchScore,
                            skillMatchScore: result.breakdown.skillMatch,
                            levelMatchScore: result.breakdown.levelMatch,
                            locationScore: result.breakdown.location,
                            atsScore: result.breakdown.atsReadiness,
                            industryScore: result.breakdown.industryMatch,
                            matchReasoning: result.reasoning,
                            gapAnalysis: result.gapAnalysis,
                        },
                        create: {
                            userId: user.id,
                            jobId: job.id,
                            matchScore: result.matchScore,
                            skillMatchScore: result.breakdown.skillMatch,
                            levelMatchScore: result.breakdown.levelMatch,
                            locationScore: result.breakdown.location,
                            atsScore: result.breakdown.atsReadiness,
                            industryScore: result.breakdown.industryMatch,
                            matchReasoning: result.reasoning,
                            gapAnalysis: result.gapAnalysis,
                        },
                    });
                    matchesCreated++;
                }
            } catch (error) {
                console.warn(`Error matching job ${job.id}:`, error.message);
            }
        }

        revalidatePath("/jobs");
        return {
            success: true,
            message: `Found ${insertedCount} new jobs and created ${matchesCreated} matches!`,
        };
    } catch (error) {
        console.error("Refresh error:", error);
        return { success: false, message: `Failed to refresh: ${error.message}` };
    }
}

// =============================================
// Get Gap Analysis for a Specific Job Match
// =============================================

export async function getGapAnalysisForJob(matchId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
    });
    if (!user) throw new Error("User not found");

    const match = await db.userJobMatch.findUnique({
        where: { id: matchId, userId: user.id },
        include: { job: true },
    });

    if (!match) throw new Error("Match not found");

    return {
        success: true,
        data: {
            gapAnalysis: match.gapAnalysis,
            matchReasoning: match.matchReasoning,
            breakdown: {
                skillMatch: match.skillMatchScore,
                levelMatch: match.levelMatchScore,
                location: match.locationScore,
                atsReadiness: match.atsScore,
                industry: match.industryScore,
            },
            job: match.job,
        },
    };
}
