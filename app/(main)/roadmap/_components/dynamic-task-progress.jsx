"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Play,
    Pause,
    CheckCircle2,
    Circle,
    Clock,
    TrendingUp,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    updateTaskProgress,
    logTaskTime,
    updateTaskPercentage
} from "@/actions/task-progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DynamicTaskProgress({
    task,
    taskId,
    initialProgress,
    onProgressUpdate
}) {
    const [progress, setProgress] = useState(initialProgress || {
        status: "not_started",
        percentage: 0,
        timeSpent: 0,
        completedSubtasks: [],
        startedAt: null,
        completedAt: null
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    const formatTotalTime = (minutes) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    const handleStartTimer = async () => {
        setIsTimerRunning(true);
        if (progress.status === "not_started") {
            const result = await updateTaskProgress(taskId, {
                status: "in_progress"
            });
            if (result.success) {
                setProgress(result.taskProgress);
                onProgressUpdate?.(result);
            }
        }
    };

    const handleStopTimer = async () => {
        setIsTimerRunning(false);
        const minutesSpent = Math.ceil(timerSeconds / 60);

        if (minutesSpent > 0) {
            setIsUpdating(true);
            const result = await logTaskTime(taskId, minutesSpent);
            if (result.success) {
                setProgress(result.taskProgress);
                onProgressUpdate?.(result);
                toast.success(`Logged ${minutesSpent} minute${minutesSpent > 1 ? 's' : ''} of work`);
            }
            setIsUpdating(false);
        }
        setTimerSeconds(0);
    };

    const handlePercentageChange = async (newPercentage) => {
        setIsUpdating(true);
        const result = await updateTaskPercentage(taskId, newPercentage);
        if (result.success) {
            setProgress(result.taskProgress);
            onProgressUpdate?.(result);

            if (newPercentage === 100) {
                toast.success("Task completed! 🎉", {
                    description: "Great work! Keep up the momentum."
                });
            }
        }
        setIsUpdating(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "text-green-400 border-green-500/30 bg-green-500/10";
            case "in_progress": return "text-blue-400 border-blue-500/30 bg-blue-500/10";
            default: return "text-gray-400 border-gray-500/30 bg-gray-500/10";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed": return <CheckCircle2 className="h-4 w-4" />;
            case "in_progress": return <Play className="h-4 w-4" />;
            default: return <Circle className="h-4 w-4" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "completed": return "Completed";
            case "in_progress": return "In Progress";
            default: return "Not Started";
        }
    };

    return (
        <div className="space-y-3">
            {/* Main Progress Bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn("text-xs", getStatusColor(progress.status))}
                            >
                                {getStatusIcon(progress.status)}
                                <span className="ml-1">{getStatusText(progress.status)}</span>
                            </Badge>
                            {progress.timeSpent > 0 && (
                                <Badge variant="outline" className="text-xs text-gray-400 border-gray-500/30">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTotalTime(progress.timeSpent)}
                                </Badge>
                            )}
                        </div>
                        <span className="text-xs font-bold text-white">
                            {progress.percentage}%
                        </span>
                    </div>
                    <Progress
                        value={progress.percentage}
                        className="h-2 bg-gray-800"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 p-0"
                >
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Expanded Controls */}
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 pt-2 border-t border-white/5"
                >
                    {/* Timer Controls */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Time Tracker</p>
                            <div className="flex items-center gap-2">
                                {!isTimerRunning ? (
                                    <Button
                                        size="sm"
                                        onClick={handleStartTimer}
                                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        disabled={progress.status === "completed"}
                                    >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start Timer
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={handleStopTimer}
                                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                    >
                                        <Pause className="h-3 w-3 mr-1" />
                                        Stop ({formatTime(timerSeconds)})
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Manual Progress Update */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Update Progress</p>
                        <div className="flex gap-2">
                            {[0, 25, 50, 75, 100].map((percent) => (
                                <Button
                                    key={percent}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePercentageChange(percent)}
                                    disabled={isUpdating || progress.percentage === percent}
                                    className={cn(
                                        "flex-1 text-xs",
                                        progress.percentage === percent
                                            ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    {percent}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Progress Stats */}
                    {(progress.startedAt || progress.completedAt) && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {progress.startedAt && (
                                <div className="bg-white/5 rounded-lg p-2">
                                    <p className="text-gray-500 mb-1">Started</p>
                                    <p className="text-white font-medium">
                                        {new Date(progress.startedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {progress.completedAt && (
                                <div className="bg-green-500/10 rounded-lg p-2 border border-green-500/20">
                                    <p className="text-green-400 mb-1">Completed</p>
                                    <p className="text-white font-medium">
                                        {new Date(progress.completedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
