"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

const factors = [
    { key: "skillMatch", label: "Skill Match", weight: "35%", color: "bg-blue-500" },
    { key: "levelMatch", label: "Experience Level", weight: "25%", color: "bg-purple-500" },
    { key: "location", label: "Location", weight: "15%", color: "bg-green-500" },
    { key: "atsReadiness", label: "ATS Readiness", weight: "15%", color: "bg-amber-500" },
    { key: "industry", label: "Industry", weight: "10%", color: "bg-rose-500" },
];

export default function MatchBreakdown({
    skillMatch = 0,
    levelMatch = 0,
    location = 0,
    atsReadiness = 0,
    industry = 0,
}) {
    const scores = { skillMatch, levelMatch, location, atsReadiness, industry };

    return (
        <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Score Breakdown
            </h4>
            {factors.map(({ key, label, weight, color }) => (
                <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                            {label} <span className="opacity-50">({weight})</span>
                        </span>
                        <span className="font-medium">{Math.round(scores[key])}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full ${color} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(scores[key], 100)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
