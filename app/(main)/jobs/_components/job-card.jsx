"use client";

import React, { useState, useTransition, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Building2,
    ExternalLink,
    Bookmark,
    BookmarkCheck,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    Briefcase,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { updateJobMatchStatus, getGapAnalysisForJob } from "@/actions/jobs";
import dynamic from "next/dynamic";

const MatchBreakdown = dynamic(() => import("./match-breakdown"), { ssr: false });
const GapAnalysisCard = dynamic(() => import("./gap-analysis-card"), { ssr: false });

export default function JobCard({ match }) {
    const [status, setStatus] = useState(match.status);
    const [showDetails, setShowDetails] = useState(false);
    const [isPending, startTransition] = useTransition();
    
    // New state for lazy loaded match metrics
    const [detailedMatch, setDetailedMatch] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const job = match.job;
    const score = match.matchScore;

    // ... color/label getters remain identical
    const getScoreColor = () => {
        if (score >= 90) return "text-green-400";
        if (score >= 75) return "text-blue-400";
        if (score >= 60) return "text-amber-400";
        return "text-red-400";
    };

    const getScoreBg = () => {
        if (score >= 90) return "from-green-500/20 to-emerald-500/20 border-green-500/30";
        if (score >= 75) return "from-blue-500/20 to-indigo-500/20 border-blue-500/30";
        if (score >= 60) return "from-amber-500/20 to-orange-500/20 border-amber-500/30";
        return "from-red-500/20 to-rose-500/20 border-red-500/30";
    };

    const getScoreLabel = () => {
        if (score >= 90) return "Perfect Match";
        if (score >= 75) return "Great Fit";
        if (score >= 60) return "Worth Exploring";
        return "Low Match";
    };

    const handleStatusUpdate = (newStatus) => {
        startTransition(async () => {
            try {
                await updateJobMatchStatus(match.id, newStatus);
                setStatus(newStatus);
                const messages = {
                    saved: "Job saved! 💾",
                    applied: "Marked as applied! ✅",
                    rejected: "Job dismissed",
                    suggested: "Moved back to suggestions",
                };
                toast.success(messages[newStatus] || "Status updated");
            } catch {
                toast.error("Failed to update status");
            }
        });
    };
    
    const handleToggleDetails = async () => {
      const willShow = !showDetails;
      setShowDetails(willShow);
      
      // Lazily fetch the heavy graph data only when opened
      if (willShow && !detailedMatch && !isLoadingDetails) {
          setIsLoadingDetails(true);
          try {
              const res = await getGapAnalysisForJob(match.id);
              if (res.success) {
                  setDetailedMatch(res.data);
              }
          } catch(e) {
              console.error("Failed to load match details:", e);
              toast.error("Failed to load match analysis.");
          } finally {
              setIsLoadingDetails(false);
          }
      }
    };

    // SVG ring for score
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
                {/* Score Header */}
                <div className={`bg-gradient-to-r ${getScoreBg()} border-b p-4`}>
                    <div className="flex items-center justify-between">
                        {/* Score Ring */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16">
                                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        className="text-muted/20"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={radius}
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        className={getScoreColor()}
                                    />
                                </svg>
                                <span
                                    className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor()}`}
                                >
                                    {score}%
                                </span>
                            </div>
                            <div>
                                <Badge variant="secondary" className="text-xs">
                                    {getScoreLabel()}
                                </Badge>
                            </div>
                        </div>

                        {/* Status Badge */}
                        {status !== "suggested" && (
                            <Badge
                                variant={status === "applied" ? "default" : "outline"}
                                className="capitalize"
                            >
                                {status === "saved" && <BookmarkCheck className="h-3 w-3 mr-1" />}
                                {status === "applied" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {status}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Job Info */}
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{job.company || "Missing Company"}</span>
                        </div>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.isRemote ? "Remote" : job.location?.split(",")[0]}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.experienceLevel}
                        </Badge>
                        {job.salary && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {job.salary}
                            </Badge>
                        )}
                    </div>

                    {/* "Why this match?" toggle */}
                    <button
                        onClick={handleToggleDetails}
                        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Why this match?
                        {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {/* Expandable Details */}
                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                {isLoadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <div className="w-6 h-6 border-b-2 border-primary rounded-full animate-spin mb-2"></div>
                                        <p className="text-xs text-muted-foreground">Loading analysis...</p>
                                    </div>
                                ) : detailedMatch ? (
                                    <>
                                        {/* Match Reasoning */}
                                        {detailedMatch.matchReasoning && (
                                            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                                                <p className="text-sm font-medium">
                                                    {detailedMatch.matchReasoning.summary}
                                                </p>
                                                {detailedMatch.matchReasoning.details?.slice(1).map((detail, i) => (
                                                    <p key={i} className="text-xs text-muted-foreground">
                                                        • {detail}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Score Breakdown */}
                                        <Suspense fallback={<div className="h-24 bg-muted animate-pulse rounded-md" />}>
                                          <MatchBreakdown
                                              skillMatch={detailedMatch.breakdown?.skillMatch}
                                              levelMatch={detailedMatch.breakdown?.levelMatch}
                                              location={detailedMatch.breakdown?.location}
                                              atsReadiness={detailedMatch.breakdown?.atsReadiness}
                                              industry={detailedMatch.breakdown?.industry}
                                          />
                                        </Suspense>

                                        {/* Gap Analysis */}
                                        {detailedMatch.gapAnalysis && (
                                           <Suspense fallback={<div className="h-24 bg-muted animate-pulse rounded-md" />}>
                                              <GapAnalysisCard gapAnalysis={detailedMatch.gapAnalysis} />
                                           </Suspense>
                                        )}
                                    </>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                        {status !== "saved" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate("saved")}
                                disabled={isPending}
                                className="flex-1 flex items-center gap-1"
                            >
                                <Bookmark className="h-3.5 w-3.5" />
                                Save
                            </Button>
                        )}
                        {status === "saved" && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate("suggested")}
                                disabled={isPending}
                                className="flex-1 flex items-center gap-1"
                            >
                                <BookmarkCheck className="h-3.5 w-3.5" />
                                Unsave
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={() => {
                                if (job.applicationUrl) {
                                    window.open(job.applicationUrl, "_blank");
                                }
                                handleStatusUpdate("applied");
                            }}
                            disabled={isPending || status === "applied"}
                            className="flex-1 flex items-center gap-1"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {status === "applied" ? "Applied" : "Apply"}
                        </Button>
                        {status !== "rejected" && status !== "applied" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate("rejected")}
                                disabled={isPending}
                                className="p-2"
                            >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                    </div>

                    {/* Posted date */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Posted {formatDate(job.postedDate)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
}
