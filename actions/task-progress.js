"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Update task progress dynamically with multiple states and tracking
 * @param {string} taskId - The task identifier
 * @param {object} progressData - Progress data including status, percentage, timeSpent, completedSubtasks
 */
export async function updateTaskProgress(taskId, progressData) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Not authenticated");

    try {
        const user = await db.user.findUnique({ where: { clerkUserId } });
        if (!user) throw new Error("User not found");

        const roadmap = await db.roadmap.findUnique({ where: { userId: user.id } });
        if (!roadmap) throw new Error("Roadmap not found");

        // Get or initialize task progress tracking
        let taskProgress = roadmap.taskProgress || {};

        // Update task progress data
        const currentProgress = taskProgress[taskId] || {
            status: "not_started", // not_started, in_progress, completed
            percentage: 0,
            timeSpent: 0, // in minutes
            completedSubtasks: [],
            startedAt: null,
            completedAt: null,
            lastUpdated: new Date().toISOString()
        };

        // Merge new progress data
        const updatedTaskProgress = {
            ...currentProgress,
            ...progressData,
            lastUpdated: new Date().toISOString()
        };

        // Auto-set timestamps
        if (progressData.status === "in_progress" && !currentProgress.startedAt) {
            updatedTaskProgress.startedAt = new Date().toISOString();
        }

        if (progressData.status === "completed" && !currentProgress.completedAt) {
            updatedTaskProgress.completedAt = new Date().toISOString();
            updatedTaskProgress.percentage = 100;

            // Trigger achievement updates
            const { incrementStat, updateUserStreak } = await import("@/lib/achievement-service");
            await incrementStat(user.id, "tasksCompleted");
            await updateUserStreak(user.id);
        }

        // Update the task progress map
        taskProgress[taskId] = updatedTaskProgress;

        // Calculate overall roadmap progress
        const allTasks = roadmap.weeklyPlan.reduce((acc, week) => {
            const weekTasks = week.tasks?.map(task => task.id || `${week.week}-${task.title}`) || [];
            return [...acc, ...weekTasks];
        }, []);

        const totalProgress = allTasks.reduce((sum, id) => {
            const progress = taskProgress[id]?.percentage || 0;
            return sum + progress;
        }, 0);

        const overallProgress = allTasks.length > 0 ? (totalProgress / allTasks.length) : 0;

        // Update completed tasks list (for backward compatibility)
        const completedTasks = Object.keys(taskProgress)
            .filter(id => taskProgress[id].status === "completed");

        // Update roadmap
        const updatedRoadmap = await db.roadmap.update({
            where: { id: roadmap.id },
            data: {
                taskProgress,
                completedTasks,
                progress: overallProgress,
                actualTimeSpent: Object.values(taskProgress).reduce((sum, tp) => sum + (tp.timeSpent || 0), 0)
            }
        });

        revalidatePath("/roadmap");
        revalidatePath("/roadmap/foundation");
        revalidatePath("/roadmap/intermediate");
        revalidatePath("/roadmap/advanced");
        revalidatePath("/roadmap/interview-prep");

        return {
            success: true,
            taskProgress: updatedTaskProgress,
            overallProgress: updatedRoadmap.progress
        };
    } catch (error) {
        console.error("Update task progress failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get task progress for a specific task
 */
export async function getTaskProgress(taskId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Not authenticated");

    try {
        const user = await db.user.findUnique({ where: { clerkUserId } });
        if (!user) throw new Error("User not found");

        const roadmap = await db.roadmap.findUnique({ where: { userId: user.id } });
        if (!roadmap) throw new Error("Roadmap not found");

        const taskProgress = roadmap.taskProgress || {};
        return {
            success: true,
            progress: taskProgress[taskId] || {
                status: "not_started",
                percentage: 0,
                timeSpent: 0,
                completedSubtasks: [],
                startedAt: null,
                completedAt: null
            }
        };
    } catch (error) {
        console.error("Get task progress failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Start a task timer (marks as in_progress and begins time tracking)
 */
export async function startTaskTimer(taskId) {
    return updateTaskProgress(taskId, {
        status: "in_progress",
        startedAt: new Date().toISOString()
    });
}

/**
 * Log time spent on a task
 */
export async function logTaskTime(taskId, minutesSpent) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Not authenticated");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    const roadmap = await db.roadmap.findUnique({ where: { userId: user.id } });

    const currentProgress = roadmap.taskProgress?.[taskId] || { timeSpent: 0 };

    return updateTaskProgress(taskId, {
        status: currentProgress.status === "not_started" ? "in_progress" : currentProgress.status,
        timeSpent: (currentProgress.timeSpent || 0) + minutesSpent
    });
}

/**
 * Update task percentage completion
 */
export async function updateTaskPercentage(taskId, percentage) {
    const status = percentage === 0 ? "not_started" :
        percentage === 100 ? "completed" :
            "in_progress";

    return updateTaskProgress(taskId, {
        status,
        percentage: Math.min(100, Math.max(0, percentage))
    });
}

/**
 * Toggle subtask completion
 */
export async function toggleSubtask(taskId, subtaskId) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Not authenticated");

    const user = await db.user.findUnique({ where: { clerkUserId } });
    const roadmap = await db.roadmap.findUnique({ where: { userId: user.id } });

    const currentProgress = roadmap.taskProgress?.[taskId] || { completedSubtasks: [] };
    const completedSubtasks = currentProgress.completedSubtasks || [];

    const isCompleted = completedSubtasks.includes(subtaskId);
    const newCompletedSubtasks = isCompleted
        ? completedSubtasks.filter(id => id !== subtaskId)
        : [...completedSubtasks, subtaskId];

    return updateTaskProgress(taskId, {
        status: newCompletedSubtasks.length > 0 ? "in_progress" : "not_started",
        completedSubtasks: newCompletedSubtasks
    });
}
