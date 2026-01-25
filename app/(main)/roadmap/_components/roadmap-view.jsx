"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { generateRoadmap } from "@/actions/roadmap";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

export default function RoadmapView({ roadmap }) {
    const [selectedTask, setSelectedTask] = useState(null);
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const [isPending, startTransition] = useTransition();

    const {
        skillGapAnalysis,
        weeklyPlan,
        companyPrep,
        certificationRecs,
        internshipTimeline
    } = roadmap;

    const toggleTask = (taskId) => {
        const newCompleted = new Set(completedTasks);
        if (newCompleted.has(taskId)) {
            newCompleted.delete(taskId);
        } else {
            newCompleted.add(taskId);
        }
        setCompletedTasks(newCompleted);
    };

    const totalTasks = weeklyPlan?.reduce((acc, week) => acc + (week.tasks?.length || 0), 0) || 0;
    const completedCount = completedTasks.size;
    const overallProgress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    const handleRegenerate = async () => {
        startTransition(async () => {
            try {
                const result = await generateRoadmap();
                if (result.success) {
                    toast.success("Roadmap regenerated successfully!");
                } else {
                    toast.error(result.error || "Failed to regenerate roadmap");
                }
            } catch (error) {
                toast.error("An error occurred while regenerating your plan.");
            }
        });
    };

    const roadmapPhases = {
        foundation: {
            title: "Foundation",
            weeks: "1-4",
            focus: "Core fundamentals",
            intensity: "Heavy learning",
            color: "blue"
        },
        intermediate: {
            title: "Intermediate",
            weeks: "5-8",
            focus: "Applied projects",
            intensity: "Balanced building",
            color: "indigo"
        },
        advanced: {
            title: "Advanced",
            weeks: "9-12",
            focus: "Complex systems",
            intensity: "Project-heavy",
            color: "purple"
        },
        interview_prep: {
            title: "Interview Prep",
            weeks: "13-16",
            focus: "Interview mastery",
            intensity: "Practice-focused",
            color: "emerald"
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Introduction Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/5 p-8 rounded-2xl backdrop-blur-md"
            >
                <div className="space-y-3">
                    <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-none px-3 py-1">Progressive AI Roadmap</Badge>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Your 16-Week Mastery Journey</h2>
                    <p className="text-gray-400 max-w-2xl leading-relaxed">
                        A structured path divided into four high-impact phases. From foundations to
                        industry-ready interview mastery.
                    </p>

                    <div className="pt-4 space-y-2 max-w-md">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-400">
                            <span>Total Career Progress</span>
                            <span>{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${overallProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={handleRegenerate}
                            disabled={isPending}
                            variant="outline"
                            className="border-white/10 hover:bg-white/5 text-gray-400 font-bold h-12 px-6"
                        >
                            {isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Update Roadmap
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link href="/dashboard">
                            <Button
                                variant="outline"
                                className="border-white/10 hover:bg-white/5 text-gray-400 font-bold h-12 px-6"
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Know Your Industry
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Phase Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(roadmapPhases).map(([key, phase], idx) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-5 rounded-2xl border bg-white/[0.03] border-white/5 relative overflow-hidden group`}
                    >
                        <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${phase.color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform`} />
                        <h4 className={`text-${phase.color}-400 font-bold text-xs uppercase tracking-[0.2em] mb-3`}>Phase {idx + 1}</h4>
                        <h3 className="text-white font-bold text-lg mb-1">{phase.title}</h3>
                        <p className="text-gray-400 text-xs mb-4">Weeks {phase.weeks}</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span className="uppercase tracking-wider">Focus: {phase.focus}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span className="uppercase tracking-wider">Intensity: {phase.intensity}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Plan - 2/3 column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <CalendarDays className="h-6 w-6 text-blue-400" />
                            Weekly Learning Journey
                        </h3>
                    </div>

                    <div className="space-y-12">
                        {weeklyPlan?.map((week, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="relative pl-16"
                            >
                                {/* Timeline connector */}
                                {idx !== weeklyPlan.length - 1 && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        whileInView={{ height: "100%" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                                        className="absolute left-[24px] top-12 w-[2px] bg-gradient-to-b from-blue-600 via-indigo-600/30 to-transparent z-0"
                                    />
                                )}

                                {/* Week indicator */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="absolute left-0 top-0 h-12 w-12 flex flex-col items-center justify-center rounded-2xl bg-[#0c0c0e] border border-blue-500/40 text-blue-400 z-10 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                >
                                    <span className="text-[10px] font-bold uppercase leading-none opacity-60">Wk</span>
                                    <span className="text-lg font-bold leading-none">{week.week || idx + 1}</span>
                                </motion.div>

                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-[10px] uppercase border-blue-500/30 text-blue-400 px-2 py-0">
                                                    {week.phase || "Phase I"}
                                                </Badge>
                                            </div>
                                            <h4 className="text-xl font-bold text-white">{week.topic}</h4>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none text-right">
                                                Week {week.week || idx + 1}<br />Progress
                                            </div>
                                            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${(week.tasks?.filter(t => completedTasks.has(`${idx}-${week.tasks.indexOf(t)}`)).length / (week.tasks?.length || 1)) * 100}%` }}
                                                    viewport={{ once: true }}
                                                    className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Objectives */}
                                    {week.objectives && (
                                        <div className="flex flex-wrap gap-2">
                                            {week.objectives.map((obj, oIdx) => (
                                                <span key={oIdx} className="text-[11px] text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                                    {obj}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tasks Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {week.tasks?.map((task, tIdx) => (
                                            <Dialog key={tIdx}>
                                                <DialogTrigger asChild>
                                                    <motion.button
                                                        whileHover={{ y: -5 }}
                                                        className="group text-left p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/[0.05] transition-all duration-500 shadow-xl backdrop-blur-md"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleTask(`${idx}-${tIdx}`);
                                                                    }}
                                                                    className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${completedTasks.has(`${idx}-${tIdx}`)
                                                                        ? "bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                                                        : "border-white/20 group-hover:border-blue-500"
                                                                        }`}
                                                                >
                                                                    {completedTasks.has(`${idx}-${tIdx}`) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                                                </div>
                                                                <h5 className={`font-bold transition-colors text-lg ${completedTasks.has(`${idx}-${tIdx}`) ? "text-gray-500 line-through" : "text-gray-100"}`}>
                                                                    {task.title}
                                                                </h5>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px] text-gray-500 uppercase">{task.timeEstimate}</Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-2 ml-9">
                                                            {task.description}
                                                        </p>
                                                    </motion.button>
                                                </DialogTrigger>

                                                <DialogContent className="bg-[#0c0c0e] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                                                    <DialogHeader>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                                    <Target className="h-6 w-6 text-blue-400" />
                                                                </div>
                                                                <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
                                                            </div>
                                                            <Badge className="bg-blue-600/20 text-blue-400 border-none">{task.type || 'learning'}</Badge>
                                                        </div>
                                                        <DialogDescription className="text-gray-400 text-base mt-2">
                                                            {task.description}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <Tabs defaultValue="resources" className="w-full mt-6 flex-1 overflow-hidden flex flex-col">
                                                        <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 h-12 shrink-0">
                                                            <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600 h-full px-6">Curated Resources</TabsTrigger>
                                                            <TabsTrigger value="delivery" className="data-[state=active]:bg-blue-600 h-full px-6">Success Criteria</TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent value="resources" className="flex-1 overflow-y-auto mt-4 pr-2 custom-scrollbar">
                                                            <div className="space-y-6">
                                                                {/* Map through all resource types */}
                                                                {[
                                                                    { key: 'videos', icon: Youtube, color: 'text-red-500', title: 'Video Tutorials' },
                                                                    { key: 'courses', icon: Award, color: 'text-blue-400', title: 'Full Courses' },
                                                                    { key: 'articles', icon: BookOpen, color: 'text-green-400', title: 'Articles & Blogs' },
                                                                    { key: 'documentation', icon: BookOpen, color: 'text-purple-400', title: 'Official Documentation' },
                                                                    { key: 'books', icon: BookOpen, color: 'text-orange-400', title: 'Recommended Reading' }
                                                                ].map((section) => (
                                                                    task.resources?.[section.key]?.length > 0 && (
                                                                        <div key={section.key} className="space-y-3">
                                                                            <h6 className={`flex items-center gap-2 font-semibold ${section.color}`}>
                                                                                <section.icon className="h-4 w-4" />
                                                                                {section.title}
                                                                            </h6>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                {task.resources[section.key].map((res, rIdx) => (
                                                                                    <a
                                                                                        key={rIdx}
                                                                                        href={res.url || "#"}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="group overflow-hidden rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex flex-col"
                                                                                    >
                                                                                        {res.thumbnail && section.key === 'videos' && (
                                                                                            <div className="aspect-video w-full relative overflow-hidden">
                                                                                                <img
                                                                                                    src={res.thumbnail}
                                                                                                    alt={res.title}
                                                                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                                                                                />
                                                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                    <PlayCircle className="h-10 w-10 text-white shadow-2xl" />
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="p-4 flex flex-col gap-1">
                                                                                            <div className="flex justify-between items-start">
                                                                                                <div className="flex flex-col gap-1">
                                                                                                    <span className="text-xs text-gray-500 font-medium">
                                                                                                        {res.platform || res.creator || res.author || 'Resource'}
                                                                                                    </span>
                                                                                                    {res.platform === 'Coursera' && res.rating && (
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <Badge variant="outline" className="text-[10px] h-4 border-yellow-500/30 text-yellow-500 px-1 font-bold">★ {res.rating}</Badge>
                                                                                                            <span className="text-[10px] text-gray-500">{res.duration}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {res.platform === 'Udemy' && res.avgRating && (
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <Badge variant="outline" className="text-[10px] h-4 border-orange-500/30 text-orange-400 px-1 font-bold">★ {res.avgRating}</Badge>
                                                                                                            <span className="text-[10px] text-gray-500">{res.priceRange}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                                {!res.thumbnail && <ExternalLink className="h-3 w-3 text-gray-700 group-hover:text-blue-400" />}
                                                                                            </div>
                                                                                            <span className="text-sm font-semibold text-gray-300 group-hover:text-white line-clamp-2 leading-snug">{res.title}</span>
                                                                                            {res.platform === 'Coursera' && res.level && (
                                                                                                <Badge className="w-fit mt-2 bg-blue-500/10 text-blue-400 text-[9px] border-none uppercase tracking-tighter">{res.level}</Badge>
                                                                                            )}
                                                                                            {res.platform === 'Udemy' && (
                                                                                                <div className="flex items-center gap-2 mt-2">
                                                                                                    <Badge className="bg-orange-500/10 text-orange-400 text-[9px] border-none uppercase tracking-tighter">Bestseller</Badge>
                                                                                                    <span className="text-[9px] text-gray-500 uppercase tracking-tighter">{res.duration}</span>
                                                                                                </div>
                                                                                            )}
                                                                                            {section.key === 'articles' && res.relevance && (
                                                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                                                    <Badge className="bg-green-500/10 text-green-400 text-[9px] border-none uppercase tracking-tighter">{res.type}</Badge>
                                                                                                    <span className="text-[9px] text-gray-400 uppercase tracking-tighter">{res.relevance}</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ))}
                                                            </div>
                                                        </TabsContent>

                                                        <TabsContent value="delivery" className="pt-4">
                                                            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                                                                <h6 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Milestone Deliverable</h6>
                                                                <p className="text-gray-300 mb-6">{task.deliverable || "Complete all learning modules and practical exercises."}</p>

                                                                <h6 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Verification Checkpoints</h6>
                                                                <ul className="space-y-3">
                                                                    {(week.successCriteria || ["Knowledge check", "Task completion"]).map((criteria, cIdx) => (
                                                                        <li key={cIdx} className="flex items-start gap-3 text-sm text-gray-400">
                                                                            <Circle className="h-1.5 w-1.5 mt-2 fill-blue-500 text-blue-500" />
                                                                            {criteria}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </TabsContent>
                                                    </Tabs>
                                                </DialogContent>
                                            </Dialog>
                                        ))}
                                    </div>

                                    {/* Project Idea Feature */}
                                    {week.projectIdea && (
                                        <Card className="bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                                        <Video className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-white text-sm">Week {week.week || idx + 1} Mini-Project</h5>
                                                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{week.projectIdea.difficulty} • {week.projectIdea.techStack?.join(', ')}</p>
                                                    </div>
                                                </div>
                                                <h6 className="font-bold text-indigo-300 text-lg mb-2">{week.projectIdea.title}</h6>
                                                <p className="text-sm text-gray-400 mb-4">{week.projectIdea.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {week.projectIdea.features?.map((feat, fIdx) => (
                                                        <Badge key={fIdx} variant="secondary" className="bg-white/5 text-gray-400 font-normal text-[10px]">{feat}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </motion.div>
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
                        <Card className="bg-white/[0.03] border-white/5 backdrop-blur-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-500">Timeline Impact</CardTitle>
                                <CardDescription className="text-purple-400">{skillGapAnalysis?.timelineImpact || "Estimated 3-4 months"}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Identified Strengths</span>
                                    <div className="space-y-3">
                                        {skillGapAnalysis?.strengths?.map((s, idx) => (
                                            <div key={idx} className="group">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-200">{typeof s === 'string' ? s : s.skill}</span>
                                                    <Badge className="bg-green-500/10 text-green-400 text-[9px] uppercase border-none">
                                                        {typeof s === 'string' ? 'Intermediate' : s.level}
                                                    </Badge>
                                                </div>
                                                {s.evidence && <p className="text-[11px] text-gray-500 italic line-clamp-1">{s.evidence}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4 border-t border-white/5 pt-4">
                                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Critical Gaps</span>
                                    <div className="space-y-3">
                                        {skillGapAnalysis?.gaps?.map((g, idx) => (
                                            <div key={idx} className="bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-medium text-gray-200">{typeof g === 'string' ? g : g.skill}</span>
                                                    <Badge variant="outline" className="text-[9px] uppercase border-red-500/30 text-red-400">
                                                        {typeof g === 'string' ? 'High' : g.impact}
                                                    </Badge>
                                                </div>
                                                {g.learningTime && <p className="text-[11px] text-gray-500">Est. learning: {g.learningTime}</p>}
                                            </div>
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
                            Target Preparation
                        </h3>
                        <div className="space-y-4">
                            {companyPrep && Object.entries(companyPrep).map(([company, data]) => (
                                <Card key={company} className="bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent border-white/5">
                                    <CardContent className="p-5">
                                        <h4 className="font-bold text-yellow-500 text-sm uppercase tracking-wider mb-3">{company}</h4>
                                        <div className="space-y-4">
                                            {typeof data === 'string' ? (
                                                <p className="text-sm text-gray-400 italic">"{data}"</p>
                                            ) : (
                                                <>
                                                    <div>
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Focus Areas</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {data.focusAreas?.map((f, fi) => (
                                                                <span key={fi} className="text-[11px] text-yellow-500/70">{f}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-gray-400 border-t border-white/5 pt-3">
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Internal Process</span>
                                                        <p className="line-clamp-2">{data.interviewProcess?.join(' → ')}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Certifications */}
                    {certificationRecs && certificationRecs.length > 0 && (
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-400" />
                                Certification Path
                            </h3>
                            <div className="space-y-4">
                                {certificationRecs.map((cert, cIdx) => (
                                    <Dialog key={cIdx}>
                                        <DialogTrigger asChild>
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group cursor-pointer hover:border-blue-500/30 transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-gray-200 text-sm group-hover:text-blue-400 transition-colors">{cert.name}</h4>
                                                        <p className="text-[11px] text-gray-500">{cert.provider || "Industry Standard"}</p>
                                                    </div>
                                                    <Badge className="bg-blue-500/10 text-blue-400 text-[9px] border-none whitespace-nowrap">LVL {cert.difficulty?.slice(0, 3).toUpperCase()}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                        <CalendarDays className="h-3 w-3 text-blue-500" />
                                                        {cert.averagePrepTime}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                                        <Award className="h-3 w-3 text-yellow-500" />
                                                        {cert.roi?.split(' - ')[0]}
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500/30 w-0 group-hover:w-full transition-all duration-500" />
                                            </motion.div>
                                        </DialogTrigger>

                                        <DialogContent className="bg-[#0c0c0e] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
                                            <DialogHeader>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                        <Award className="h-8 w-8 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <DialogTitle className="text-2xl font-bold">{cert.name}</DialogTitle>
                                                        <DialogDescription className="text-blue-400/80 font-medium">Issued by {cert.provider}</DialogDescription>
                                                    </div>
                                                </div>
                                            </DialogHeader>

                                            <div className="space-y-8 mt-4">
                                                {/* Meta Info Grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Cost</span>
                                                        <span className="text-sm font-bold text-gray-200">{cert.estimatedCost || cert.cost}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Time</span>
                                                        <span className="text-sm font-bold text-gray-200">{cert.averagePrepTime || cert.studyTime}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Level</span>
                                                        <span className="text-sm font-bold text-gray-200">{cert.difficulty}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest block">Exam</span>
                                                        <span className="text-sm font-bold text-gray-200">{cert.examFrequency || "Flexible"}</span>
                                                    </div>
                                                </div>

                                                {/* Prerequisites */}
                                                {cert.prerequisites && (
                                                    <section>
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <Target className="h-3.5 w-3.5 text-blue-400" />
                                                            Prerequisites
                                                        </h5>
                                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {cert.prerequisites.map((p, i) => (
                                                                <li key={i} className="text-sm text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                    {p}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </section>
                                                )}

                                                {/* Study Plan */}
                                                {cert.studyPlan && (
                                                    <section>
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <CalendarDays className="h-3.5 w-3.5 text-purple-400" />
                                                            Recommended Study Plan
                                                        </h5>
                                                        <div className="space-y-3">
                                                            {Object.entries(cert.studyPlan).map(([period, focus]) => (
                                                                <div key={period} className="flex gap-4 group">
                                                                    <div className="text-xs font-bold text-purple-400 w-20 shrink-0 uppercase pt-1">{period}</div>
                                                                    <div className="text-sm text-gray-300 bg-white/[0.03] p-3 rounded-xl border border-white/5 group-hover:border-purple-500/20 transition-all flex-1">
                                                                        {focus}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}

                                                {/* Exam Tips */}
                                                {cert.examTips && (
                                                    <section className="bg-yellow-500/5 border border-yellow-500/10 p-5 rounded-2xl">
                                                        <h5 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <Brain className="h-3.5 w-3.5" />
                                                            Expert Exam Tips
                                                        </h5>
                                                        <ul className="space-y-2">
                                                            {cert.examTips.map((tip, i) => (
                                                                <li key={i} className="text-sm text-yellow-500/70 border-l-2 border-yellow-500/20 pl-4 py-1">
                                                                    {tip}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </section>
                                                )}

                                                {/* Free Resources */}
                                                {cert.freeResources && (
                                                    <section>
                                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Self-Study Resources</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {cert.freeResources.map((res, i) => (
                                                                <Badge key={i} variant="outline" className="bg-white/5 border-white/10 text-gray-400 font-normal py-1.5 px-3">
                                                                    {res}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </section>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Timeline Summary */}
                    {internshipTimeline && (
                        <Card className="bg-blue-600/5 border-blue-600/20">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <CalendarDays className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <h4 className="font-bold text-white text-sm">Application Timeline</h4>
                                </div>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">DSA Prep Start</span>
                                        <span className="text-gray-200 font-medium">{internshipTimeline.dsaStart || "Week 1"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">System Design</span>
                                        <span className="text-gray-200 font-medium">{internshipTimeline.systemDesignStart || "Week 4"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Ready to Apply</span>
                                        <span className="text-indigo-400 font-bold">{internshipTimeline.readyToApply || "Week 12"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
