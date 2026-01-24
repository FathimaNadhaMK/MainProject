"use client";

import {
    BookOpen,
    Wrench,
    Briefcase,
    Award,
    MessageSquare,
    Clock,
    CheckCircle,
    Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { careerRoadmaps, skillLevelTimelines } from "@/data/roadmap-data";

export default function StudyRoadmap({ userData }) {
    const targetField = userData?.industry || "IT / Software Developer"; // Default to Software Dev
    const skillLevel = userData?.educationLevel || "Intermediate";

    const roadmap = careerRoadmaps[targetField] || careerRoadmaps["IT / Software Developer"];
    const timeline = skillLevelTimelines[skillLevel] || skillLevelTimelines.Intermediate;

    const sections = [
        {
            title: "Must Learn Skills",
            icon: BookOpen,
            items: roadmap.skills,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Tools to Practice",
            icon: Wrench,
            items: roadmap.tools,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
        {
            title: "Projects to Build",
            icon: Briefcase,
            items: roadmap.projects,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Certifications",
            icon: Award,
            items: roadmap.certifications,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
        },
        {
            title: "Interview Topics",
            icon: MessageSquare,
            items: roadmap.interviewTopics,
            color: "text-pink-600",
            bgColor: "bg-pink-50 dark:bg-pink-950",
        },
        {
            title: "Resume Keywords",
            icon: Hash,
            items: roadmap.keywords,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50 dark:bg-indigo-950",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <CardTitle className="text-2xl">Your Learning Roadmap</CardTitle>
                    </div>
                    <p className="text-muted-foreground">
                        Personalized path to become a {userData?.targetRole || "professional"} in{" "}
                        {targetField}
                    </p>
                </CardHeader>
            </Card>

            {/* Roadmap Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Card
                            key={section.title}
                            className="hover:shadow-lg transition-shadow duration-200"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${section.bgColor}`}>
                                        <Icon className={`h-5 w-5 ${section.color}`} />
                                    </div>
                                    <CardTitle className="text-base">{section.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {section.items.map((item, index) => (
                                        <li
                                            key={index}
                                            className="text-sm flex items-start gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Time Estimation */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">
                                Estimated Time to Reach Target
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="text-base px-3 py-1">
                                    {skillLevel} Level
                                </Badge>
                                <span className="text-2xl font-bold text-primary">
                                    {timeline.min}–{timeline.max} {timeline.unit}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Based on your current skill level and consistent learning (10-15 hours/week).
                                Focus on building projects and gaining hands-on experience to accelerate your progress.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Tips */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Build a portfolio:</strong> Create a GitHub profile and showcase your projects
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Update your resume:</strong> Add these keywords and skills as you learn them
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Practice regularly:</strong> Dedicate consistent time each day to learning
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Join communities:</strong> Engage with others in your field on LinkedIn, Discord, or Reddit
                            </span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
