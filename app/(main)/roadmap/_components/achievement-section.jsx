"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Sparkles, TrendingUp, ExternalLink, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import AchievementsModal from "./achievements-modal";

export default function AchievementSection({ achievements, stats, streak }) {
    const [showAchievementsModal, setShowAchievementsModal] = useState(false);
    // Separate earned and locked achievements
    const earnedAchievements = achievements?.filter((a) => a.earned) || [];
    const lockedAchievements = achievements?.filter((a) => !a.earned) || [];

    // Show exactly 3 slots: earned achievements first, then locked placeholders
    const MAX_DISPLAY_SLOTS = 3;
    const displayedEarned = earnedAchievements.slice(0, MAX_DISPLAY_SLOTS);
    const remainingSlots = MAX_DISPLAY_SLOTS - displayedEarned.length;
    const displayedLocked = remainingSlots > 0 ? lockedAchievements.slice(0, remainingSlots) : [];

    // Get next achievement to unlock for progress bar
    const nextToUnlock = lockedAchievements.slice(0, 1);

    const getTierColor = (tier) => {
        switch (tier) {
            case "bronze":
                return "from-amber-700/20 to-amber-900/20 border-amber-500/30";
            case "silver":
                return "from-gray-400/20 to-gray-600/20 border-gray-400/30";
            case "gold":
                return "from-yellow-500/20 to-yellow-700/20 border-yellow-500/30";
            case "platinum":
                return "from-purple-500/20 to-purple-700/20 border-purple-500/30";
            default:
                return "from-gray-700/20 to-gray-900/20 border-gray-500/30";
        }
    };

    const getRarityBadge = (rarity) => {
        const colors = {
            common: "bg-gray-500/10 text-gray-400 border-gray-500/20",
            rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            legendary: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        };
        return colors[rarity] || colors.common;
    };

    const currentLevel = stats?.level || 1;
    const currentXP = stats?.totalXP || 0;
    const nextLevelXP = (currentLevel ** 2) * 100;
    const xpProgress = ((currentXP % nextLevelXP) / nextLevelXP) * 100;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Streak Card */}
                <Card className="md:col-span-1 bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/20 p-6 rounded-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                    <div className="mb-4 p-4 rounded-full bg-orange-500/20 relative z-10">
                        <span className="text-5xl">{(streak || stats?.currentStreak || 0) > 0 ? '🔥' : '💤'}</span>
                        {(streak || stats?.currentStreak || 0) > 0 && (
                            <div className="absolute inset-0 rounded-full animate-ping bg-orange-500/10" />
                        )}
                    </div>
                    <h3 className="text-4xl font-black text-white mb-1 relative z-10">
                        {streak || stats?.currentStreak || 0} {(streak || stats?.currentStreak || 0) === 1 ? 'Day' : 'Days'}
                    </h3>
                    <p className="text-xs text-orange-300 font-bold uppercase tracking-widest relative z-10">
                        Learning Streak
                    </p>
                    {stats?.longestStreak > 0 && (
                        <p className="text-[10px] text-orange-400/60 mt-2 relative z-10">
                            Best: {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
                        </p>
                    )}
                </Card>

                {/* Achievements Card */}
                <Card className="md:col-span-2 bg-white/5 border-white/5 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold text-white flex items-center gap-2">
                            <Award className="text-yellow-500 h-5 w-5" />
                            Achievements
                        </h4>
                        <div className="flex items-center gap-2">
                            {earnedAchievements.length > 0 && (
                                <>
                                    <span className="text-xs text-gray-500 font-mono">
                                        Rank #{stats?.rank || "—"}
                                    </span>
                                    {stats?.percentile && (
                                        <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400">
                                            Top {stats.percentile}%
                                        </Badge>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <TooltipProvider>
                            {/* Show message if no achievements earned */}
                            {displayedEarned.length === 0 && (
                                <div className="w-full text-center py-6">
                                    <p className="text-gray-400 text-sm mb-2">No achievements yet</p>
                                    <p className="text-gray-500 text-xs">Complete your first task to start earning achievements! 🎯</p>
                                </div>
                            )}

                            {/* Earned Achievements */}
                            {displayedEarned.map((achievement, idx) => (
                                <Tooltip key={idx}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ delay: idx * 0.1, type: "spring" }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-gradient-to-br ${getTierColor(
                                                achievement.tier
                                            )} cursor-pointer hover:scale-105 transition-transform`}
                                        >
                                            <span className="text-xl">{achievement.icon}</span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white">
                                                    {achievement.name.replace(/^[^\s]+\s/, "")}
                                                </span>
                                                <Badge
                                                    className={`text-[8px] w-fit mt-0.5 ${getRarityBadge(
                                                        achievement.rarity
                                                    )}`}
                                                >
                                                    {achievement.tier}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-gray-900 border-white/10">
                                        <div className="space-y-1">
                                            <p className="font-bold text-white">{achievement.name}</p>
                                            <p className="text-xs text-gray-400">{achievement.description}</p>
                                            <p className="text-[10px] text-green-400">
                                                +{achievement.xpReward} XP
                                            </p>
                                            {achievement.earnedAt && (
                                                <p className="text-[10px] text-gray-500">
                                                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}

                            {/* Locked Achievement Slots */}
                            {displayedLocked.map((achievement, idx) => (
                                <Tooltip key={`locked-${idx}`}>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-800/50 border-white/5 text-gray-500 grayscale opacity-50 cursor-help">
                                            <Lock className="h-4 w-4" />
                                            <span className="text-xs font-bold">???</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-gray-900 border-white/10">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-400">{achievement.name}</p>
                                            <p className="text-xs text-gray-500">{achievement.description}</p>
                                            <p className="text-[10px] text-yellow-400">
                                                Unlock: {JSON.stringify(achievement.requirement)}
                                            </p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TooltipProvider>
                    </div>

                    {/* Progress Bar for Next Achievement */}
                    {nextToUnlock.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                    Next: {nextToUnlock[0].name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {stats?.[nextToUnlock[0].requirement.type] || 0} /{" "}
                                    {nextToUnlock[0].requirement.value}
                                </span>
                            </div>
                            <Progress
                                value={
                                    ((stats?.[nextToUnlock[0].requirement.type] || 0) /
                                        nextToUnlock[0].requirement.value) *
                                    100
                                }
                                className="h-1.5 bg-gray-800"
                            />
                        </div>
                    )}

                    {/* View All Achievements Button */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <Button
                            onClick={() => setShowAchievementsModal(true)}
                            className="w-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400 hover:text-yellow-300 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            View All {achievements?.length || 0} Achievements
                            <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                </Card>

                {/* Level & XP Card */}
                <Card className="md:col-span-1 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/20 p-6 rounded-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                <Sparkles className="h-5 w-5 text-purple-400" />
                            </div>
                            <Badge className="bg-purple-500/10 text-purple-400 text-[10px] border-purple-500/20">
                                Level {currentLevel}
                            </Badge>
                        </div>

                        <h4 className="text-2xl font-black text-white mb-1">
                            {currentXP.toLocaleString()} XP
                        </h4>
                        <p className="text-xs text-purple-300 mb-4">Total Experience</p>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                    Next Level
                                </span>
                                <span className="text-[10px] text-purple-400 font-bold">
                                    {nextLevelXP - (currentXP % nextLevelXP)} XP
                                </span>
                            </div>
                            <Progress value={xpProgress} className="h-2 bg-gray-800" />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Tasks</span>
                            <span className="text-white font-bold">{stats?.tasksCompleted || 0}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Assessments</span>
                            <span className="text-white font-bold">{stats?.assessmentsTaken || 0}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                            <span className="text-gray-500">Interviews</span>
                            <span className="text-white font-bold">
                                {stats?.interviewsPracticed || 0}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Achievements Modal */}
            <AchievementsModal
                open={showAchievementsModal}
                onClose={() => setShowAchievementsModal(false)}
                achievements={achievements || []}
                stats={stats || {}}
            />
        </>
    );
}
