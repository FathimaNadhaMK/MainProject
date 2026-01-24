"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    CheckCircle2,
    Circle,
    ArrowRight,
    Target,
    Brain,
    Building2,
    Award,
    CalendarDays,
    ChevronRight,
    Youtube,
    BookOpen,
    ExternalLink,
    PlayCircle,
    Video
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RoadmapView({ roadmap }) {
    const [selectedTask, setSelectedTask] = useState(null);

    const {
        skillGapAnalysis,
        weeklyPlan,
        companyPrep,
        certificationRecs,
        internshipTimeline
    } = roadmap;

    return (
        <div className="space-y-10 pb-20">
            {/* Introduction Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/5 p-8 rounded-2xl backdrop-blur-md">
                <div className="space-y-3">
                    <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-none px-3 py-1">Interactive Roadmap</Badge>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Your 8-Week Master Plan</h2>
                    <p className="text-gray-400 max-w-2xl leading-relaxed">
                        Every button is a stepping stone. Click on the tasks to discover hand-picked
                        resources from <b>YouTube</b>, <b>Coursera</b>, and <b>Udemy</b> to accelerate your learning.
                    </p>
                </div>
                <Link href="/dashboard">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl group px-8">
                        Know Your Industry
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Plan - 2/3 column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <CalendarDays className="h-6 w-6 text-blue-400" />
                            Week-by-Week Breakdown
                        </h3>
                    </div>

                    <div className="space-y-8">
                        {weeklyPlan?.map((week, idx) => (
                            <div key={idx} className="relative pl-12">
                                {/* Timeline connector */}
                                {idx !== weeklyPlan.length - 1 && (
                                    <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-blue-600/50 to-transparent" />
                                )}

                                {/* Week indicator */}
                                <div className="absolute left-0 top-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-400 font-bold z-10 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                                    {week.week || idx + 1}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white">{week.topic}</h4>
                                        <p className="text-gray-500 text-sm mt-1">{week.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {week.tasks && week.tasks.length > 0 ? (
                                            week.tasks.map((task, tIdx) => (
                                                <Dialog key={tIdx}>
                                                    <DialogTrigger asChild>
                                                        <button
                                                            onClick={() => setSelectedTask(task)}
                                                            className="group text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 active:scale-[0.98]"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h5 className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                                                                    {task.title}
                                                                </h5>
                                                                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                                            </div>
                                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                                {task.description}
                                                            </p>
                                                        </button>
                                                    </DialogTrigger>

                                                    <DialogContent className="bg-[#0c0c0e] border-white/10 text-white max-w-2xl sm:max-w-3xl max-h-[90vh]">
                                                        <DialogHeader>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                                    <Target className="h-5 w-5 text-blue-400" />
                                                                </div>
                                                                <DialogTitle className="text-2xl font-bold tracking-tight">
                                                                    {task.title}
                                                                </DialogTitle>
                                                            </div>
                                                            <DialogDescription className="text-gray-400 text-base leading-relaxed">
                                                                {task.description}
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <Tabs defaultValue="resources" className="w-full mt-6">
                                                            <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 h-12">
                                                                <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600 h-full px-6">
                                                                    Learning Resources
                                                                </TabsTrigger>
                                                                <TabsTrigger value="objectives" className="data-[state=active]:bg-blue-600 h-full px-6">
                                                                    Key Objectives
                                                                </TabsTrigger>
                                                            </TabsList>

                                                            <TabsContent value="resources" className="pt-6">
                                                                <div className="h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                                                    <div className="space-y-8">
                                                                        {/* YouTube Section */}
                                                                        <div className="space-y-4">
                                                                            <div className="flex items-center gap-2 text-red-500 font-semibold">
                                                                                <Youtube className="h-5 w-5" />
                                                                                <span>Free Video Tutorials (YouTube)</span>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {task.resources?.youtube?.map((vid, vIdx) => (
                                                                                    <a
                                                                                        key={vIdx}
                                                                                        href={vid.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all group"
                                                                                    >
                                                                                        <div className="flex items-start justify-between mb-2">
                                                                                            <PlayCircle className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                                                                                            <ExternalLink className="h-3 w-3 text-gray-600" />
                                                                                        </div>
                                                                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white line-clamp-2">
                                                                                            {vid.title}
                                                                                        </span>
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Courses Section */}
                                                                        <div className="space-y-4 pt-4 border-t border-white/5">
                                                                            <div className="flex items-center gap-2 text-blue-400 font-semibold">
                                                                                <Award className="h-5 w-5" />
                                                                                <span>Vetted Professional Courses (Premium)</span>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {task.resources?.courses?.map((course, cIdx) => (
                                                                                    <a
                                                                                        key={cIdx}
                                                                                        href={course.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                                                                                    >
                                                                                        <div className="flex items-start justify-between mb-2">
                                                                                            <Badge variant="outline" className="text-[10px] uppercase border-blue-500/50 text-blue-400">
                                                                                                {course.platform}
                                                                                            </Badge>
                                                                                            <ExternalLink className="h-3 w-3 text-gray-600" />
                                                                                        </div>
                                                                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white line-clamp-2">
                                                                                            {course.title}
                                                                                        </span>
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                            <p className="text-[10px] text-gray-600 bg-white/5 p-3 rounded-lg border border-white/5">
                                                                                Note: Premium resources are hand-picked for quality. Many offer free trials or financial aid.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TabsContent>

                                                            <TabsContent value="objectives" className="pt-6">
                                                                <div className="space-y-4">
                                                                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                                                                        <ul className="space-y-3">
                                                                            <li className="flex items-start gap-3 text-sm text-gray-300">
                                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                                <span>Master the core fundamental syntax and structures</span>
                                                                            </li>
                                                                            <li className="flex items-start gap-3 text-sm text-gray-300">
                                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                                <span>Build 1 small modular project using these concepts</span>
                                                                            </li>
                                                                            <li className="flex items-start gap-3 text-sm text-gray-300">
                                                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                                                                <span>Document your learning in a GitHub repository</span>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </TabsContent>
                                                        </Tabs>
                                                    </DialogContent>
                                                </Dialog>
                                            ))
                                        ) : (
                                            <p className="text-gray-600 text-xs italic">Personalizing tasks for your niche...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - Insights & Prep */}
                <div className="space-y-8">
                    {/* Skill Gap Analysis */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Brain className="h-5 w-5 text-purple-400" />
                            Skill Diagnostic
                        </h3>
                        <Card className="bg-white/5 border-white/5">
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Your Strengths</span>
                                    <div className="flex flex-wrap gap-2">
                                        {skillGapAnalysis?.strengths?.map(s => (
                                            <Badge key={s} variant="outline" className="bg-green-500/5 text-green-400 border-green-500/20 px-3 py-1 font-normal tracking-wide">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Growth Gaps</span>
                                    <div className="flex flex-wrap gap-2">
                                        {skillGapAnalysis?.gaps?.map(g => (
                                            <Badge key={g} variant="outline" className="bg-red-500/5 text-red-400 border-red-500/20 px-3 py-1 font-normal tracking-wide">{g}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Company Prep */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-yellow-400" />
                            Interview Logic
                        </h3>
                        <Card className="bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent border-white/5">
                            <CardContent className="pt-6 space-y-5">
                                {companyPrep && Object.entries(companyPrep).map(([company, tips]) => (
                                    <div key={company} className="space-y-2 p-3 rounded-lg bg-white/5">
                                        <h4 className="font-semibold text-yellow-500 flex items-center gap-2 text-xs uppercase tracking-wider">
                                            {company}
                                        </h4>
                                        <p className="text-[13px] text-gray-400 leading-relaxed font-light italic">
                                            &quot;{tips}&quot;
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Tips */}
                    <section className="p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-blue-600/5 border border-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:translate-x-10 group-hover:-translate-y-10" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Award className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h4 className="font-bold text-white">Career Edge</h4>
                        </div>
                        <p className="text-sm text-indigo-200/70 leading-relaxed font-light">
                            <b>Pro-Tip:</b> In 2026, companies aren&apos;t just looking for skills, they want <b>proof of problem solving</b>.
                            Document your roadmap as a <b>devblog</b> on Hashnode or Dev.to as you go!
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
