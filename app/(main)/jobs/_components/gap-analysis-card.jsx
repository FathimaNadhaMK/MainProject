"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Zap } from "lucide-react";

export default function GapAnalysisCard({ gapAnalysis }) {
    if (!gapAnalysis) return null;

    return (
        <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
            {/* Main message */}
            <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/20 mt-0.5">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div>
                    <p className="text-sm font-medium">{gapAnalysis.message}</p>
                    {gapAnalysis.improvementPercentage < 100 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Current skill coverage: {gapAnalysis.improvementPercentage}%
                        </p>
                    )}
                </div>
            </div>

            {/* Skills to learn */}
            {gapAnalysis.skillsToLearn && gapAnalysis.skillsToLearn.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        Skills to learn:
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {gapAnalysis.skillsToLearn.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs bg-amber-500/10 border-amber-500/20">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Readiness boost */}
            {gapAnalysis.readinessBoost && (
                <div className="flex items-start gap-2 text-xs">
                    <Zap className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{gapAnalysis.readinessBoost}</p>
                </div>
            )}
        </div>
    );
}
