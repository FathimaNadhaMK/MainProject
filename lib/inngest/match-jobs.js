// Inngest Function: Match Jobs for Users
// Runs every 6 hours to fetch new jobs and calculate matches for all onboarded users.

import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { fetchAllJobs, generateSearchQueries } from "@/lib/job-matching/job-fetcher";
import { calculateJobMatch } from "@/lib/job-matching/matcher";
import { getUserWeights, calibrateWeights } from "@/lib/job-matching/personalizer";

export const matchJobsForUsers = inngest.createFunction(
    { id: "match-jobs-for-users", name: "Match Jobs for Users" },
    { cron: "0 */6 * * *" }, // Every 6 hours
    async ({ step }) => {
        // Step 1: Get all distinct industries from onboarded users
        const industries = await step.run("get-active-industries", async () => {
            const users = await db.user.findMany({
                where: {
                    industry: { not: null },
                    roadmap: { isNot: null }, // Only onboarded users
                },
                select: { industry: true },
                distinct: ["industry"],
            });
            return users.map((u) => u.industry).filter(Boolean);
        });

        if (industries.length === 0) {
            return { message: "No onboarded users found" };
        }

        // Step 2: Generate search queries and fetch jobs from APIs
        const newJobCount = await step.run("fetch-new-jobs", async () => {
            const queries = generateSearchQueries(industries);
            const jobs = await fetchAllJobs(queries);

            if (jobs.length === 0) return 0;

            // Upsert jobs into database
            let insertedCount = 0;
            for (const job of jobs) {
                try {
                    await db.jobListing.upsert({
                        where: { externalJobId: job.externalJobId },
                        update: {
                            isActive: true,
                            updatedAt: new Date(),
                        },
                        create: job,
                    });
                    insertedCount++;
                } catch (error) {
                    // Skip duplicate/invalid entries
                    console.warn(`[MatchJobs] Skipping job: ${error.message}`);
                }
            }

            return insertedCount;
        });

        // Step 3: Mark stale jobs as inactive (>30 days old)
        await step.run("mark-stale-jobs", async () => {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const result = await db.jobListing.updateMany({
                where: {
                    postedDate: { lt: thirtyDaysAgo },
                    isActive: true,
                },
                data: { isActive: false },
            });
            return { staleCount: result.count };
        });

        // Step 4: Get all onboarded users with their profiles
        const users = await step.run("get-users-for-matching", async () => {
            return await db.user.findMany({
                where: {
                    industry: { not: null },
                    roadmap: { isNot: null },
                },
                include: {
                    resume: {
                        select: { atsScore: true, aiScore: true },
                    },
                    matchPreferences: true,
                },
            });
        });

        // Step 5: Get all active jobs
        const activeJobs = await step.run("get-active-jobs", async () => {
            return await db.jobListing.findMany({
                where: { isActive: true },
                orderBy: { postedDate: "desc" },
                take: 200, // Limit to recent 200 jobs for performance
            });
        });

        // Step 6: Calculate matches for each user
        let totalMatches = 0;
        for (const user of users) {
            const matchCount = await step.run(`match-user-${user.id}`, async () => {
                // Get personalized weights or defaults
                const weights = user.matchPreferences || await getUserWeights(user.id);

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

                        // Only store matches with score >= 60
                        if (result.matchScore >= 60) {
                            await db.userJobMatch.upsert({
                                where: {
                                    userId_jobId: {
                                        userId: user.id,
                                        jobId: job.id,
                                    },
                                },
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
                        console.warn(`[MatchJobs] Error matching user ${user.id} to job ${job.id}:`, error.message);
                    }
                }

                // Recalibrate weights if user has enough interactions
                const totalActions = await db.userJobMatch.count({
                    where: {
                        userId: user.id,
                        status: { in: ["saved", "applied"] },
                    },
                });
                if (totalActions >= 5 && totalActions % 10 === 0) {
                    await calibrateWeights(user.id);
                }

                return matchesCreated;
            });

            totalMatches += matchCount;
        }

        return {
            newJobsFetched: newJobCount,
            usersProcessed: users.length,
            totalMatches,
        };
    }
);
