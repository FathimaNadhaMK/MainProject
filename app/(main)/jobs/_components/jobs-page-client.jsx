"use client";

import React, { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    BriefcaseIcon,
    RefreshCw,
    Filter,
    TrendingUp,
    Target,
    Star,
    Compass,
    Bookmark,
    CheckCircle,
    Sparkles,
    Zap,
    MapPin,
    Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { refreshJobMatches } from "@/actions/jobs";
import JobCard from "./job-card";

export default function JobsPageClient({ matchesData, stats }) {
    const [activeTab, setActiveTab] = useState("all");
    const [isRefreshing, startRefreshTransition] = useTransition();
    const [filters, setFilters] = useState({
        experienceLevel: null,
        isRemote: null,
        location: "",
    });
    const [showFilters, setShowFilters] = useState(false);

    const tiered = matchesData?.tiered || {
        perfect: [],
        great: [],
        exploring: [],
        saved: [],
        applied: [],
    };

    const allMatches = matchesData?.all || [];
    const matchStats = stats || {};

    // Check if we're in demo mode (any job source is "mock")
    const isDemoMode = allMatches.some(m => m.job.source === "mock");

    const handleRefresh = () => {
        startRefreshTransition(async () => {
            try {
                const result = await refreshJobMatches();
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } catch {
                toast.error("Failed to refresh job matches");
            }
        });
    };

    // Filter matches by active filters
    const filterMatches = (matches) => {
        return matches.filter((m) => {
            if (filters.experienceLevel && m.job.experienceLevel !== filters.experienceLevel)
                return false;
            if (filters.isRemote !== null && m.job.isRemote !== filters.isRemote) return false;
            if (
                filters.location &&
                !m.job.location.toLowerCase().includes(filters.location.toLowerCase())
            )
                return false;
            return true;
        });
    };

    const experienceLevels = [
        "Intern",
        "Entry Level",
        "Junior",
        "Mid-Level",
        "Senior",
        "Lead",
    ];

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Job Matches
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        AI-powered job recommendations tailored to your skills and goals
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        {showFilters ? "Hide" : "Show"} Filters
                    </Button>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Refreshing..." : "Refresh Matches"}
                    </Button>
                </div>
            </div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
            >
                <StatCard
                    icon={<Target className="h-5 w-5 text-green-500" />}
                    label="Perfect Matches"
                    value={tiered.perfect.length}
                    color="text-green-500"
                />
                <StatCard
                    icon={<Star className="h-5 w-5 text-blue-500" />}
                    label="Great Fits"
                    value={tiered.great.length}
                    color="text-blue-500"
                />
                <StatCard
                    icon={<Compass className="h-5 w-5 text-amber-500" />}
                    label="Worth Exploring"
                    value={tiered.exploring.length}
                    color="text-amber-500"
                />
                <StatCard
                    icon={<Bookmark className="h-5 w-5 text-purple-500" />}
                    label="Saved"
                    value={matchStats.savedJobs || 0}
                    color="text-purple-500"
                />
                <StatCard
                    icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
                    label="Applied"
                    value={matchStats.appliedJobs || 0}
                    color="text-emerald-500"
                />
            </motion.div>

            {/* Demo Mode Banner */}
            {isDemoMode && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3 text-amber-500"
                >
                    <Sparkles className="h-5 w-5" />
                    <p className="text-sm font-medium">
                        <strong>Demo Mode:</strong> You're seeing realistic mock jobs because your API keys aren't configured yet. 
                        Connect Adzuna or BrightData to see live listings!
                    </p>
                </motion.div>
            )}

            {/* Readiness Boost Banner */}
            {matchStats.averageScore > 0 && matchStats.averageScore < 80 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/20">
                                <Zap className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-400">Readiness Boost</h3>
                                <p className="text-sm text-muted-foreground">
                                    Improving your ATS score by {Math.max(0, 85 - (matchStats.averageScore || 0))} points could unlock ~
                                    {Math.round(Math.max(0, 85 - (matchStats.averageScore || 0)) * 0.5)} more opportunities.
                                    <Link href="/resume" className="text-blue-400 ml-1 cursor-pointer hover:underline font-medium">
                                        Go to Resume Builder →
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-4 items-center">
                                    {/* Experience Level Filter */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground font-medium">
                                            Experience Level
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant={filters.experienceLevel === null ? "default" : "outline"}
                                                className="cursor-pointer px-3 py-1.5"
                                                onClick={() =>
                                                    setFilters({ ...filters, experienceLevel: null })
                                                }
                                            >
                                                All
                                            </Badge>
                                            {experienceLevels.map((level) => (
                                                <Badge
                                                    key={level}
                                                    variant={
                                                        filters.experienceLevel === level ? "default" : "outline"
                                                    }
                                                    className="cursor-pointer px-3 py-1.5"
                                                    onClick={() =>
                                                        setFilters({ ...filters, experienceLevel: level })
                                                    }
                                                >
                                                    {level}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Remote Toggle */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-foreground">
                                            Work Type
                                        </label>
                                        <div className="flex gap-2">
                                            <Badge
                                                variant={filters.isRemote === null ? "default" : "outline"}
                                                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
                                                onClick={() => setFilters({ ...filters, isRemote: null })}
                                            >
                                                All
                                            </Badge>
                                            <Badge
                                                variant={filters.isRemote === true ? "default" : "outline"}
                                                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
                                                onClick={() => setFilters({ ...filters, isRemote: true })}
                                            >
                                                <Monitor className="h-3 w-3" />
                                                Remote
                                            </Badge>
                                            <Badge
                                                variant={filters.isRemote === false ? "default" : "outline"}
                                                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5"
                                                onClick={() => setFilters({ ...filters, isRemote: false })}
                                            >
                                                <MapPin className="h-3 w-3" />
                                                On-site
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Location Text Filter */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-foreground">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search location..."
                                            value={filters.location}
                                            onChange={(e) =>
                                                setFilters({ ...filters, location: e.target.value })
                                            }
                                            className="w-full px-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content — Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto h-auto p-1">
                    <TabsTrigger value="all" className="flex items-center gap-2 py-2.5">
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">All</span>
                    </TabsTrigger>
                    <TabsTrigger value="perfect" className="flex items-center gap-2 py-2.5">
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Perfect</span>
                    </TabsTrigger>
                    <TabsTrigger value="great" className="flex items-center gap-2 py-2.5">
                        <Star className="h-4 w-4" />
                        <span className="hidden sm:inline">Great</span>
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="flex items-center gap-2 py-2.5">
                        <Bookmark className="h-4 w-4" />
                        <span className="hidden sm:inline">Saved</span>
                    </TabsTrigger>
                    <TabsTrigger value="applied" className="flex items-center gap-2 py-2.5">
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Applied</span>
                    </TabsTrigger>
                </TabsList>

                {/* All Matches — Tiered Sections */}
                <TabsContent value="all" className="space-y-8 mt-6">
                    {allMatches.length === 0 ? (
                        <EmptyState onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                    ) : (
                        <>
                            {/* Perfect Matches (90-100%) */}
                            {filterMatches(tiered.perfect).length > 0 && (
                                <TierSection
                                    title="🎯 Perfect Matches"
                                    subtitle="90-100% match — these are your top picks"
                                    color="from-green-500/10 to-emerald-500/10"
                                    borderColor="border-green-500/20"
                                    matches={filterMatches(tiered.perfect).slice(0, 5)}
                                />
                            )}

                            {/* Great Fits (75-89%) */}
                            {filterMatches(tiered.great).length > 0 && (
                                <TierSection
                                    title="🌟 Great Fits"
                                    subtitle="75-89% match — strong opportunities"
                                    color="from-blue-500/10 to-indigo-500/10"
                                    borderColor="border-blue-500/20"
                                    matches={filterMatches(tiered.great).slice(0, 10)}
                                />
                            )}

                            {/* Worth Exploring (60-74%) */}
                            {filterMatches(tiered.exploring).length > 0 && (
                                <TierSection
                                    title="🧭 Worth Exploring"
                                    subtitle="60-74% match — potential opportunities to consider"
                                    color="from-amber-500/10 to-orange-500/10"
                                    borderColor="border-amber-500/20"
                                    matches={filterMatches(tiered.exploring).slice(0, 15)}
                                />
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Perfect Matches Tab */}
                <TabsContent value="perfect" className="mt-6">
                    <TierSection
                        title="🎯 Perfect Matches"
                        subtitle="These jobs are an excellent fit for your profile"
                        color="from-green-500/10 to-emerald-500/10"
                        borderColor="border-green-500/20"
                        matches={filterMatches(tiered.perfect)}
                    />
                </TabsContent>

                {/* Great Fits Tab */}
                <TabsContent value="great" className="mt-6">
                    <TierSection
                        title="🌟 Great Fits"
                        subtitle="Strong matches that align well with your career goals"
                        color="from-blue-500/10 to-indigo-500/10"
                        borderColor="border-blue-500/20"
                        matches={filterMatches(tiered.great)}
                    />
                </TabsContent>

                {/* Saved Tab */}
                <TabsContent value="saved" className="mt-6">
                    <TierSection
                        title="💾 Saved Jobs"
                        subtitle="Jobs you've bookmarked for later"
                        color="from-purple-500/10 to-violet-500/10"
                        borderColor="border-purple-500/20"
                        matches={filterMatches(tiered.saved)}
                        emptyMessage="No saved jobs yet. Browse matches and save the ones you like!"
                    />
                </TabsContent>

                {/* Applied Tab */}
                <TabsContent value="applied" className="mt-6">
                    <TierSection
                        title="✅ Applied Jobs"
                        subtitle="Jobs you've applied to"
                        color="from-emerald-500/10 to-teal-500/10"
                        borderColor="border-emerald-500/20"
                        matches={filterMatches(tiered.applied)}
                        emptyMessage="No applications tracked yet."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// =============================================
// Sub-Components
// =============================================

function StatCard({ icon, label, value, color }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
                {icon}
                <div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function TierSection({ title, subtitle, color, borderColor, matches, emptyMessage }) {
    if ((!matches || matches.length === 0) && emptyMessage) {
        return (
            <div className={`rounded-lg bg-gradient-to-r ${color} ${borderColor} border p-8 text-center`}>
                <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
        );
    }

    if (!matches || matches.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className={`rounded-lg bg-gradient-to-r ${color} ${borderColor} border p-5`}>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {matches.map((match, index) => (
                    <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <JobCard match={match} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function EmptyState({ onRefresh, isRefreshing }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
        >
            <div className="inline-flex p-6 rounded-full bg-muted/50 mb-6">
                <BriefcaseIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No job matches yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Click &quot;Refresh Matches&quot; to fetch the latest job listings and find personalized
                matches based on your career profile.
            </p>
            <Button onClick={onRefresh} disabled={isRefreshing} size="lg" className="gap-2">
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Fetching Jobs..." : "Find My Matches"}
            </Button>
        </motion.div>
    );
}
