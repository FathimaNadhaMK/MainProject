"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/lib/ai-service";
import { resourceFetcher } from "@/lib/resource-fetcher";
import { recommendCertifications } from "@/lib/certification-engine";
import { companyRequirements } from "@/lib/company-intel";
import { analyzeAssessments, analyzeTimeTracking } from "@/lib/performance-analyzer";
import { revalidatePath } from "next/cache";

/**
 * Normalizes the weekly plan to ensure proper phase distribution:
 * - Weeks 1-4: Foundation
 * - Weeks 5-8: Intermediate
 * - Weeks 9-12: Advanced
 * - Weeks 13-16: Interview Prep
 * 
 * This ensures consistency regardless of AI output quality.
 */
function normalizeWeeklyPlanPhases(weeklyPlan, targetRole = "Professional") {
    // Ensure we have exactly 16 weeks
    const normalized = [];

    for (let i = 0; i < 16; i++) {
        const week = i + 1;
        const existingWeek = weeklyPlan.find(w => w.week === week) || weeklyPlan[i];

        // Determine correct phase based on week number
        let correctPhase = "Foundation";
        if (week > 12) correctPhase = "Interview Prep";
        else if (week > 8) correctPhase = "Advanced";
        else if (week > 4) correctPhase = "Intermediate";

        // Use existing week data but ensure correct phase
        if (existingWeek) {
            normalized.push({
                ...existingWeek,
                week,
                phase: correctPhase,
                // Update topic if it doesn't match the phase
                topic: existingWeek.topic || `Week ${week}: ${correctPhase} Phase`,
            });
        } else {
            // Create a placeholder week if missing
            normalized.push({
                week,
                phase: correctPhase,
                topic: `Week ${week}: ${correctPhase} - ${targetRole} Development`,
                objectives: [`Master ${correctPhase} level concepts`, "Build practical skills"],
                tasks: [{
                    title: `${correctPhase} Level Work`,
                    description: `Focus on ${correctPhase.toLowerCase()}-level skills for ${targetRole}`,
                    timeEstimate: "5-8 hours",
                    type: week > 12 ? "practice" : week > 8 ? "project" : "learning",
                    resources: {
                        videos: [],
                        courses: [],
                        articles: [],
                        documentation: [],
                        books: []
                    },
                    deliverable: `${correctPhase} milestone`
                }],
                projectIdea: {
                    title: `${correctPhase} Project`,
                    description: `Build a ${correctPhase.toLowerCase()}-level project`,
                    techStack: [],
                    features: [],
                    difficulty: correctPhase
                },
                successCriteria: ["Complete all tasks", "Achieve learning objectives"]
            });
        }
    }

    return normalized;
}


export async function generateRoadmap() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId },
            include: {
                userSkills: true,
            }
        });

        if (!user) throw new Error("User not found");

        // Map user profile for AI
        const userProfile = {
            ...user,
            skillLevels: user.userSkills.reduce((acc, s) => {
                acc[s.skill] = s.level;
                return acc;
            }, {}),
            currentStatus: user.background, // Using background as current status if not separate
            interestedInInternships: user.internshipInterest?.length > 0 ? "Yes" : "No",
            interestedInCertifications: user.certificationInterest ? "Yes" : "No",
        };

        // Generate roadmap using AI
        let roadmapData;
        try {
            roadmapData = await aiService.generateRoadmap(userProfile, {
                targetCompanies: user.targetCompanies,
                locationPref: user.locationPref,
            });

            // Check for AI or parsing error
            if (!roadmapData || roadmapData.error) {
                throw new Error(roadmapData?.error || "Invalid AI response");
            }

            // NORMALIZE PHASES: Ensure proper phase distribution regardless of AI output
            if (roadmapData.weeklyPlan && Array.isArray(roadmapData.weeklyPlan)) {
                roadmapData.weeklyPlan = normalizeWeeklyPlanPhases(roadmapData.weeklyPlan, user.targetRole);
            }
        } catch (aiError) {
            console.error("AI Roadmap Generation failed, using fallback:", aiError);
            // Fallback static roadmap
            roadmapData = {
                skillGapAnalysis: {
                    strengths: (user.skills && Array.isArray(user.skills))
                        ? user.skills.slice(0, 3).map(s => ({ skill: typeof s === 'string' ? s : s.name, evidence: "Self-reported", level: "Foundational" }))
                        : [{ skill: "Core Competencies", evidence: "Background", level: "Beginner" }],
                    gaps: [{ skill: "Advanced Concepts", impact: "high", learningTime: "4 weeks" }, { skill: "Industry Patterns", impact: "medium", learningTime: "2 weeks" }],
                    priorityOrder: ["Deep Dive in Current Tech", "System Design"],
                    timelineImpact: "2-3 months"
                },
                weeklyPlan: Array.from({ length: 16 }, (_, i) => {
                    const week = i + 1;
                    let phase = "Foundation";
                    if (week > 12) phase = "Interview Prep";
                    else if (week > 8) phase = "Advanced";
                    else if (week > 4) phase = "Intermediate";

                    return {
                        week,
                        phase,
                        topic: week === 1 ? "Foundations & Core Setup" : `Technical Growth - Phase ${phase} (W${week})`,
                        objectives: [`Master ${phase} level core concepts`, "Complete hands-on practical tasks"],
                        tasks: [
                            {
                                title: week === 1 ? "Environment & Tooling" : `${phase} Implementation`,
                                description: `Specialized tasks for the ${phase} stage of your career journey.`,
                                timeEstimate: "5-10 hours",
                                type: "learning",
                                resources: {
                                    videos: [],
                                    courses: [{ platform: "Coursera", title: `${user.targetRole || 'Career'} specialization`, url: `https://www.coursera.org/search?query=${encodeURIComponent(user.targetRole || 'Software Engineering')}` }],
                                    documentation: [{ title: "Official Documentation", url: "#" }],
                                    articles: [],
                                    books: []
                                },
                                deliverable: "Project milestone"
                            }
                        ],
                        projectIdea: {
                            title: `Phase ${phase} Mini-Project`,
                            description: `Build a project showcasing ${phase} skills.`,
                            techStack: [user.targetRole || "Technology"],
                            features: ["Core feature", "Unit tests"],
                            difficulty: phase
                        },
                        successCriteria: ["Tasks completed", "Project updated"]
                    };
                }),
                companyPrep: { "General": { requiredSkills: ["DSA", "Problem Solving"], interviewProcess: ["Technical", "Behavioral"], timeline: "4-6 weeks", focusAreas: ["Portfolio"], projectSuggestions: ["Real-world app"] } },
                certifications: [{ name: "Professional Certification", provider: "Industry Leader", priority: 1, cost: "Varies", studyTime: "40 hours", roi: "High", recommendedWeek: 8 }],
                interviewTimeline: { dsaStart: "week 1", systemDesignStart: "week 4", behavioralStart: "week 8", readyToApply: "week 12" }
            };
        }

        // Enrich the first 8 weeks with real YouTube videos and Coursera recommendations for better UX
        if (roadmapData.weeklyPlan) {
            const enrichmentWeeks = roadmapData.weeklyPlan.slice(0, 8);
            await Promise.all(enrichmentWeeks.map(async (week) => {
                if (week.tasks) {
                    await Promise.all(week.tasks.map(async (task) => {
                        // Parallel fetch YouTube, Coursera, Udemy, and Free Resources
                        // Use week topic for better relevance instead of generic task title
                        const searchQuery = week.topic || task.title;
                        const [videos, courseraData, udemyData, freeData] = await Promise.all([
                            resourceFetcher.fetchYouTubeContent(searchQuery, user.targetRole),
                            resourceFetcher.fetchCourseraContent(searchQuery, user.educationLevel || user.background, user.targetRole),
                            resourceFetcher.fetchUdemyContent(searchQuery, user.targetRole),
                            resourceFetcher.fetchFreeResources(searchQuery)
                        ]);

                        if (videos && videos.length > 0) {
                            console.log(`[Roadmap] Week ${week.week}: Found ${videos.length} videos for task "${task.title}"`);
                            task.resources = {
                                ...task.resources,
                                videos: videos
                            };
                        } else {
                            console.warn(`[Roadmap] Week ${week.week}: No videos found for task "${task.title}"`);
                        }

                        // Merge free resources into articles/documentation
                        if (freeData && freeData.length > 0) {
                            const freeFormatted = freeData.map(f => ({
                                title: `${f.platform}: ${f.type}`,
                                url: f.url,
                                platform: f.platform,
                                relevance: f.relevance,
                                type: f.type
                            }));
                            task.resources = {
                                ...task.resources,
                                articles: [
                                    ...(task.resources?.articles || []),
                                    ...freeFormatted
                                ]
                            };
                        }

                        // Merge Coursera and Udemy into courses
                        const combinedCourses = [];
                        if (courseraData?.recommendedCourses) {
                            combinedCourses.push(...courseraData.recommendedCourses);
                        }
                        if (udemyData?.recommended) {
                            combinedCourses.push(...udemyData.recommended);
                        }

                        if (combinedCourses.length > 0) {
                            task.resources = {
                                ...task.resources,
                                courses: [
                                    ...(task.resources?.courses || []),
                                    ...combinedCourses
                                ]
                            };
                        }
                    }));
                }
            }));
        }

        // ENRICH COMPANY PREP WITH INTELLIGENCE
        if (user.targetCompanies && user.targetCompanies.length > 0) {
            const enrichedPrep = { ...(roadmapData.companyPrep || {}) };

            user.targetCompanies.forEach(company => {
                if (companyRequirements[company]) {
                    enrichedPrep[company] = {
                        ...(enrichedPrep[company] || {}),
                        ...companyRequirements[company]
                    };
                }
            });

            roadmapData.companyPrep = enrichedPrep;
        }

        // SMART CERTIFICATION ENGINE INTEGRATION
        const engineCerts = recommendCertifications(userProfile);
        const aiCerts = roadmapData.certifications || [];

        // Combine and de-duplicate (prefer engine certs)
        const combinedCertsMap = new Map();

        // Add engine certs first
        engineCerts.forEach(cert => combinedCertsMap.set(cert.name.toLowerCase(), cert));

        // Add AI certs if not already present
        aiCerts.forEach(cert => {
            const name = typeof cert === 'string' ? cert : cert.name;
            if (!combinedCertsMap.has(name.toLowerCase())) {
                const certObj = typeof cert === 'object' ? cert : { name: cert };
                combinedCertsMap.set(name.toLowerCase(), certObj);
            }
        });

        // Convert back to array and enrich all with detailed metrics
        roadmapData.certifications = await Promise.all(
            Array.from(combinedCertsMap.values()).map(async (cert) => {
                const info = await resourceFetcher.fetchCertificationInfo(cert.name);
                return {
                    ...info,
                    ...cert, // Values from roadmapData or Engine override info
                };
            })
        );

        // Save to database
        const roadmap = await db.roadmap.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                skillGapAnalysis: roadmapData.skillGapAnalysis || {},
                weeklyPlan: roadmapData.weeklyPlan || [],
                companyPrep: roadmapData.companyPrep || {},
                certificationRecs: roadmapData.certifications || [],
                internshipTimeline: roadmapData.interviewTimeline || {},
                lastAIGenerated: new Date(),
            },
            update: {
                skillGapAnalysis: roadmapData.skillGapAnalysis || {},
                weeklyPlan: roadmapData.weeklyPlan || [],
                companyPrep: roadmapData.companyPrep || {},
                certificationRecs: roadmapData.certifications || [],
                internshipTimeline: roadmapData.interviewTimeline || {},
                lastAIGenerated: new Date(),
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/roadmap");

        return { success: true, roadmap };
    } catch (error) {
        console.error("Critical roadmap error:", error);
        throw new Error(`Failed to process roadmap: ${error.message}`);
    }
}

export async function getRoadmap() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    const user = await db.user.findUnique({
        where: { clerkUserId },
    });

    if (!user) return null;

    return await db.roadmap.findUnique({
        where: { userId: user.id },
    });
}

export async function adaptRoadmap() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId },
            include: {
                roadmap: true,
                assessments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 50
                }
            }
        });

        if (!user || !user.roadmap) throw new Error("No active roadmap found to adapt");

        // 1. Analyze performance
        const weakAreas = analyzeAssessments(user.assessments);
        const { status: intensityStatus } = analyzeTimeTracking(user.activities, user.roadmap.currentWeek);

        const adjustments = {
            remedialTasks: [],
            weekUpdates: [],
            note: ""
        };

        // 2. Adjust for weak areas
        if (weakAreas.length > 0) {
            const remedialTasks = await Promise.all(weakAreas.map(async (skill) => {
                // Fetch targeted remedial resources
                const [videos, courses] = await Promise.all([
                    resourceFetcher.fetchYouTubeContent(`${skill} crash course`, user.targetRole),
                    resourceFetcher.fetchCourseraContent(skill, "Beginner", user.targetRole)
                ]);

                return {
                    title: `Remedial: ${skill} Deep Dive`,
                    description: `Based on your recent assessment, we've added this focused module to strengthen your ${skill} skills.`,
                    timeEstimate: "3-5 hours",
                    type: "remedial",
                    resources: {
                        videos: videos.slice(0, 2),
                        courses: courses.recommendedCourses,
                        articles: [],
                        documentation: []
                    },
                    deliverable: `${skill} practice session complete`
                };
            }));

            adjustments.remedialTasks = remedialTasks;
            adjustments.note += `Injected remedial support for: ${weakAreas.join(", ")}. `;
        }

        // 3. Adjust for intensity/workload
        if (intensityStatus === 'lagging-low-intensity') {
            adjustments.note += "Workload optimized for your current pace. ";
        }

        // 4. Perform the update
        await updateRoadmapWithAdaptations(user.id, adjustments);

        revalidatePath("/roadmap");
        return { success: true, adjustments };
    } catch (error) {
        console.error("Roadmap adaptation failed:", error);
        return { error: error.message };
    }
}

async function updateRoadmapWithAdaptations(userId, adjustments) {
    const roadmap = await db.roadmap.findUnique({ where: { userId } });
    if (!roadmap) return;

    let updatedWeeklyPlan = [...(roadmap.weeklyPlan || [])];
    const currentWeekIdx = roadmap.currentWeek - 1;

    // Inject remedial tasks into the current week
    if (adjustments.remedialTasks.length > 0 && updatedWeeklyPlan[currentWeekIdx]) {
        const currentTasks = updatedWeeklyPlan[currentWeekIdx].tasks || [];
        // Add only if not already present
        const newTasks = adjustments.remedialTasks.filter(rt =>
            !currentTasks.some(ct => ct.title === rt.title) || false
        );

        updatedWeeklyPlan[currentWeekIdx].tasks = [...newTasks, ...currentTasks];
    }

    // Save updates
    await db.roadmap.update({
        where: { userId },
        data: {
            weeklyPlan: updatedWeeklyPlan,
            updatedAt: new Date()
        }
    });

    // Log the adaptation activity
    await db.userActivity.create({
        data: {
            userId,
            activityType: "ROADMAP_ADAPTATION",
            module: "ROADMAP",
            details: {
                adaptationNote: adjustments.note,
                remedialCount: adjustments.remedialTasks.length
            }
        }
    });
}

/**
 * Toggle a task's completion status and update achievements
 */
export async function toggleRoadmapTask(taskId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Not authenticated");

    try {
        const user = await db.user.findUnique({ where: { clerkUserId } });
        if (!user) throw new Error("User not found");

        const roadmap = await db.roadmap.findUnique({ where: { userId: user.id } });
        if (!roadmap) throw new Error("Roadmap not found");

        let completedTasks = [...(roadmap.completedTasks || [])];
        const isCompleted = completedTasks.includes(taskId);

        if (isCompleted) {
            completedTasks = completedTasks.filter(id => id !== taskId);
        } else {
            completedTasks.push(taskId);

            // Increment task completion stat and check achievements
            const { incrementStat, updateUserStreak } = await import("@/lib/achievement-service");
            await incrementStat(user.id, "tasksCompleted");
            await updateUserStreak(user.id);
        }

        const updatedRoadmap = await db.roadmap.update({
            where: { id: roadmap.id },
            data: {
                completedTasks,
                progress: (completedTasks.length / roadmap.weeklyPlan.reduce((acc, week) => acc + (week.tasks?.length || 0), 0)) * 100
            }
        });

        revalidatePath("/roadmap");
        return { success: true, isCompleted: !isCompleted, progress: updatedRoadmap.progress };
    } catch (error) {
        console.error("Toggle task failed:", error);
        return { error: error.message };
    }
}
