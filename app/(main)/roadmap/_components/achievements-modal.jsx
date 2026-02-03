"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    Lock,
    CheckCircle2,
    TrendingUp,
    Filter,
    Search,
    X,
    Sparkles,
    Trophy,
    Target,
    Zap,
    Star,
    Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Calculate achievement progress percentage
 * @param {Object} achievement - Achievement definition
 * @param {Object} stats - User stats
 * @returns {number} Progress percentage (0-100)
 */
function calculateAchievementProgress(achievement, stats) {
    // If achievement is earned, always return 100%
    if (achievement.earned) {
        return 100;
    }

    const { type, value } = achievement.requirement;
    const currentValue = stats[type] || 0;

    // Calculate percentage, capped at 100%
    const progress = Math.min((currentValue / value) * 100, 100);

    return Math.round(progress);
}

/**
 * Get current value for achievement requirement
 * @param {Object} achievement - Achievement definition
 * @param {Object} stats - User stats
 * @returns {number} Current progress value
 */
function getCurrentValue(achievement, stats) {
    const { type, value } = achievement.requirement;

    // If achievement is earned, show the requirement value
    if (achievement.earned) {
        return value;
    }

    // Otherwise get current value from stats
    return stats[type] || 0;
}

/**
 * Determine achievement status
 * @param {Object} achievement - Achievement with earned flag
 * @param {number} progress - Progress percentage
 * @returns {string} 'completed' | 'in-progress' | 'locked'
 */
function getAchievementStatus(achievement, progress) {
    if (achievement.earned) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'locked';
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
    const icons = {
        streak: <Zap className="h-4 w-4" />,
        completion: <Target className="h-4 w-4" />,
        skill: <Trophy className="h-4 w-4" />,
        progression: <TrendingUp className="h-4 w-4" />,
        special: <Sparkles className="h-4 w-4" />,
        challenge: <Star className="h-4 w-4" />,
        onboarding: <Sparkles className="h-4 w-4" />,
        goal: <Target className="h-4 w-4" />,
        engagement: <Star className="h-4 w-4" />,
    };
    return icons[category] || <Award className="h-4 w-4" />;
}

/**
 * Get tier color classes
 */
function getTierColor(tier) {
    const colors = {
        bronze: "from-amber-700/20 to-amber-900/20 border-amber-500/30",
        silver: "from-gray-400/20 to-gray-600/20 border-gray-400/30",
        gold: "from-yellow-500/20 to-yellow-700/20 border-yellow-500/30",
        platinum: "from-purple-500/20 to-purple-700/20 border-purple-500/30",
    };
    return colors[tier] || "from-gray-700/20 to-gray-900/20 border-gray-500/30";
}

/**
 * Get rarity badge color
 */
function getRarityBadge(rarity) {
    const colors = {
        common: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        legendary: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
    return colors[rarity] || colors.common;
}

/**
 * Achievement Card Component
 */
function AchievementCard({ achievement, stats, index }) {
    const progress = calculateAchievementProgress(achievement, stats);
    const currentValue = getCurrentValue(achievement, stats);
    const targetValue = achievement.requirement.value;
    const status = getAchievementStatus(achievement, progress);

    const isCompleted = status === 'completed';
    const isInProgress = status === 'in-progress';
    const isLocked = status === 'locked';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <Card
                className={`
                    relative overflow-hidden transition-all duration-300
                    ${isCompleted ? 'bg-gradient-to-br ' + getTierColor(achievement.tier) + ' border-2' : 'bg-white/[0.02] border-white/5'}
                    ${isInProgress ? 'border-blue-500/30' : ''}
                    ${isLocked ? 'opacity-60' : ''}
                    hover:scale-[1.02] hover:shadow-lg
                `}
            >
                {/* Completion Glow Effect */}
                {isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />
                )}

                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className={`
                                flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                                ${isCompleted ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30' : 'bg-white/5 border border-white/10'}
                                ${isLocked ? 'grayscale' : ''}
                                relative
                            `}
                        >
                            {isLocked ? (
                                <Lock className="h-6 w-6 text-gray-500 absolute" />
                            ) : (
                                <span className={isLocked ? 'opacity-30' : ''}>
                                    {achievement.icon}
                                </span>
                            )}

                            {/* Completion Checkmark */}
                            {isCompleted && (
                                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm mb-1 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                                        {achievement.name}
                                    </h4>
                                    <p className={`text-xs ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {achievement.description}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className="flex flex-col items-end gap-1">
                                    {isCompleted && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] px-2">
                                            Completed
                                        </Badge>
                                    )}
                                    {isInProgress && (
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] px-2">
                                            In Progress
                                        </Badge>
                                    )}
                                    {isLocked && (
                                        <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30 text-[9px] px-2">
                                            Locked
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2 mt-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className={isLocked ? 'text-gray-600' : 'text-gray-400'}>
                                        Progress
                                    </span>
                                    <span className={`font-mono font-bold ${isCompleted ? 'text-green-400' : isInProgress ? 'text-blue-400' : 'text-gray-500'}`}>
                                        {currentValue} / {targetValue}
                                    </span>
                                </div>

                                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className={`
                                            h-full rounded-full
                                            ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                isInProgress ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                                    'bg-gray-600'}
                                        `}
                                    />

                                    {/* Progress percentage text */}
                                    {progress > 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-white drop-shadow-lg">
                                                {progress}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer - Rewards & Category */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    {/* Category */}
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                        {getCategoryIcon(achievement.category)}
                                        <span className="capitalize">{achievement.category}</span>
                                    </div>

                                    {/* Tier */}
                                    <Badge className={`text-[8px] px-2 ${getRarityBadge(achievement.rarity)}`}>
                                        {achievement.tier}
                                    </Badge>
                                </div>

                                {/* XP Reward */}
                                <div className={`flex items-center gap-1 text-xs font-bold ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                                    <Sparkles className="h-3 w-3" />
                                    <span>+{achievement.xpReward} XP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/**
 * Main Achievements Modal Component
 */
export default function AchievementsModal({ open, onClose, achievements, stats }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // Calculate stats for each achievement
    const achievementsWithProgress = useMemo(() => {
        return achievements.map(achievement => ({
            ...achievement,
            progress: calculateAchievementProgress(achievement, stats),
            currentValue: getCurrentValue(achievement, stats),
            status: getAchievementStatus(achievement, calculateAchievementProgress(achievement, stats))
        }));
    }, [achievements, stats]);

    // Filter achievements
    const filteredAchievements = useMemo(() => {
        return achievementsWithProgress.filter(achievement => {
            // Search filter
            const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                achievement.description.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const matchesCategory = selectedCategory === "all" || achievement.category === selectedCategory;

            // Status filter
            const matchesStatus = selectedStatus === "all" || achievement.status === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [achievementsWithProgress, searchQuery, selectedCategory, selectedStatus]);

    // Group achievements by status
    const groupedAchievements = useMemo(() => {
        const completed = filteredAchievements.filter(a => a.status === 'completed');
        const inProgress = filteredAchievements.filter(a => a.status === 'in-progress');
        const locked = filteredAchievements.filter(a => a.status === 'locked');

        return { completed, inProgress, locked };
    }, [filteredAchievements]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(achievements.map(a => a.category))];
        return cats;
    }, [achievements]);

    // Calculate overall stats
    const overallStats = useMemo(() => {
        const total = achievements.length;
        const completed = achievementsWithProgress.filter(a => a.earned).length;
        const inProgress = achievementsWithProgress.filter(a => a.status === 'in-progress').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, inProgress, completionRate };
    }, [achievements, achievementsWithProgress]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] bg-[#0c0c0e] border-white/10 text-white p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Trophy className="h-6 w-6 text-yellow-500" />
                                Achievements
                            </DialogTitle>
                            <DialogDescription className="text-gray-400 mt-1">
                                Track your progress and unlock rewards
                            </DialogDescription>
                        </div>

                        {/* Overall Stats */}
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-white">{overallStats.completed}</div>
                                <div className="text-[10px] text-gray-500 uppercase">Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">{overallStats.inProgress}</div>
                                <div className="text-[10px] text-gray-500 uppercase">In Progress</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">{overallStats.completionRate}%</div>
                                <div className="text-[10px] text-gray-500 uppercase">Complete</div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex items-center gap-3 mt-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search achievements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="h-4 w-4 text-gray-500 hover:text-white" />
                                </button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="bg-[#0c0c0e]">
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="completed" className="bg-[#0c0c0e]">Completed</option>
                            <option value="in-progress" className="bg-[#0c0c0e]">In Progress</option>
                            <option value="locked" className="bg-[#0c0c0e]">Locked</option>
                        </select>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="bg-white/5 border-white/10 mb-4">
                            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
                                All ({filteredAchievements.length})
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="data-[state=active]:bg-white/10">
                                Completed ({groupedAchievements.completed.length})
                            </TabsTrigger>
                            <TabsTrigger value="in-progress" className="data-[state=active]:bg-white/10">
                                In Progress ({groupedAchievements.inProgress.length})
                            </TabsTrigger>
                            <TabsTrigger value="locked" className="data-[state=active]:bg-white/10">
                                Locked ({groupedAchievements.locked.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* All Achievements */}
                        <TabsContent value="all" className="space-y-3">
                            {filteredAchievements.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>No achievements found</p>
                                </div>
                            ) : (
                                filteredAchievements.map((achievement, index) => (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        stats={stats}
                                        index={index}
                                    />
                                ))
                            )}
                        </TabsContent>

                        {/* Completed */}
                        <TabsContent value="completed" className="space-y-3">
                            {groupedAchievements.completed.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    {filteredAchievements.length === 0 ? (
                                        <>
                                            <p>No achievements match your filters</p>
                                            <p className="text-xs mt-1">Try adjusting your search or filters</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>No completed achievements yet</p>
                                            <p className="text-xs mt-1">Start completing tasks to earn achievements!</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                groupedAchievements.completed.map((achievement, index) => (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        stats={stats}
                                        index={index}
                                    />
                                ))
                            )}
                        </TabsContent>

                        {/* In Progress */}
                        <TabsContent value="in-progress" className="space-y-3">
                            {groupedAchievements.inProgress.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    {filteredAchievements.length === 0 ? (
                                        <>
                                            <p>No achievements match your filters</p>
                                            <p className="text-xs mt-1">Try adjusting your search or filters</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>No achievements in progress</p>
                                            <p className="text-xs mt-1">Complete some tasks to start making progress!</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                groupedAchievements.inProgress.map((achievement, index) => (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        stats={stats}
                                        index={index}
                                    />
                                ))
                            )}
                        </TabsContent>

                        {/* Locked */}
                        <TabsContent value="locked" className="space-y-3">
                            {groupedAchievements.locked.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    {filteredAchievements.length === 0 ? (
                                        <>
                                            <p>No achievements match your filters</p>
                                            <p className="text-xs mt-1">Try adjusting your search or filters</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>No locked achievements</p>
                                            <p className="text-xs mt-1">Great progress! 🎉</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                groupedAchievements.locked.map((achievement, index) => (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        stats={stats}
                                        index={index}
                                    />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
