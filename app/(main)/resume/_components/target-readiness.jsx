"use client";

import { Target, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TargetReadiness({ userData, atsScore }) {
    // Calculate match score (simplified mock calculation)
    const calculateMatchScore = () => {
        if (!atsScore) return 0;

        // Base score from ATS
        let matchScore = atsScore * 0.6;

        // Adjust based on user data completeness
        if (userData?.targetRole) matchScore += 5;
        if (userData?.industry) matchScore += 5;
        if (userData?.skills) matchScore += 5;

        return Math.min(Math.round(matchScore), 95);
    };

    const currentScore = calculateMatchScore();
    const targetScore = 85;
    const gap = targetScore - currentScore;
    const gapPercentage = Math.max(gap, 0);

    const getStatusColor = (score) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getStatusBadge = (score) => {
        if (score >= 80) return { label: "Excellent Match", variant: "success" };
        if (score >= 60) return { label: "Good Progress", variant: "warning" };
        return { label: "Needs Work", variant: "destructive" };
    };

    const status = getStatusBadge(currentScore);

    // Don't show if no ATS score yet
    if (!atsScore) {
        return null;
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Your Target Readiness</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Target Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Target Field</p>
                        <p className="font-semibold text-lg">{userData?.industry || "General"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Target Role</p>
                        <p className="font-semibold text-lg">{userData?.targetRole || "Professional"}</p>
                    </div>
                </div>

                {/* Score Comparison */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Resume Match Analysis</h3>
                        <Badge variant={status.variant} className="text-sm">
                            {status.label}
                        </Badge>
                    </div>

                    {/* Current Score */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current Resume Match</span>
                            <span className={`font-bold text-2xl ${getStatusColor(currentScore)}`}>
                                {currentScore}%
                            </span>
                        </div>
                        <Progress value={currentScore} className="h-3" />
                    </div>

                    {/* Target Score */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Target Score to Achieve</span>
                            <span className="font-bold text-2xl text-green-600">{targetScore}%</span>
                        </div>
                        <Progress value={targetScore} className="h-3 bg-green-100" />
                    </div>

                    {/* Gap Indicator */}
                    {gap > 0 ? (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                    Gap to Close: +{gapPercentage}%
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                                    You need to improve your resume by {gapPercentage}% to reach your target score.
                                    Follow the study roadmap below to enhance your profile.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-green-900 dark:text-green-100">
                                    Excellent! You've reached your target!
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                                    Your resume is well-aligned with your target role. Keep updating it with new skills and projects.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Visual Comparison Chart */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Current Level</p>
                        <div className="relative w-24 h-24 mx-auto">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-muted"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(currentScore / 100) * 251.2} 251.2`}
                                    className={getStatusColor(currentScore)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xl font-bold ${getStatusColor(currentScore)}`}>
                                    {currentScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Target Level</p>
                        <div className="relative w-24 h-24 mx-auto">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-muted"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${(targetScore / 100) * 251.2} 251.2`}
                                    className="text-green-600"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-green-600">{targetScore}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
