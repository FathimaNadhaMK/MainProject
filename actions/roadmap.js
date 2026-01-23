"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { aiService } from "@/lib/ai-service";
import { revalidatePath } from "next/cache";

export async function generateRoadmap() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    try {
        const user = await db.user.findUnique({
            where: { clerkUserId },
        });

        if (!user) throw new Error("User not found");

        // Generate roadmap using AI
        let roadmapData;
        try {
            roadmapData = await aiService.generateRoadmap(user, {
                targetCompanies: user.targetCompanies,
                locationPref: user.locationPref,
            });

            // Check for AI or parsing error
            if (!roadmapData || roadmapData.error) {
                throw new Error(roadmapData?.error || "Invalid AI response");
            }
        } catch (aiError) {
            console.error("AI Roadmap Generation failed, using fallback:", aiError);
            // Fallback static roadmap
            roadmapData = {
                skillGapAnalysis: {
                    strengths: user.skills?.map(s => typeof s === 'string' ? s : s.name) || ["Core Competencies"],
                    gaps: ["Advanced Concepts", "Industry Patterns"],
                    priority: ["Deep Dive in Current Tech", "System Design"]
                },
                weeklyPlan: [1, 2, 3, 4, 5, 6, 7, 8].map((week) => ({
                    week,
                    topic: week === 1 ? "Foundations & Core Setup" : `Technical Specialization - Phase ${week}`,
                    description: `Master the essential workflows and advanced concepts for a ${user.targetRole || 'Professional'} role.`,
                    tasks: [
                        {
                            title: week === 1 ? "Environment & Tooling" : "Advanced Implementation",
                            description: `Focus on ${week === 1 ? 'setting up your professional workspace' : 'building scalable industry projects'}.`,
                            resources: {
                                youtube: [{ title: `${user.targetRole || 'Skill'} Masterclass`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(user.targetRole || 'Software Engineering')}+tutorial` }],
                                courses: [{ platform: "Coursera", title: `${user.targetRole || 'Career'} specialization`, url: `https://www.coursera.org/search?query=${encodeURIComponent(user.targetRole || 'Software Engineering')}` }],
                                documentation: [{ title: "Official Documentation", url: "#" }]
                            }
                        }
                    ]
                })),
                companyPrep: { "General": "Research target companies and emphasize your unique projects." },
                certifications: ["Identify missing certifications in your niche"],
                interviewTimeline: "Ready to apply in 6-8 weeks."
            };
        }

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
