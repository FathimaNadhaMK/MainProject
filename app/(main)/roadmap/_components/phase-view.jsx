"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toggleRoadmapTask } from "@/actions/roadmap";
import { toast } from "sonner";
import {
    CheckCircle2,
    Circle,
    ArrowLeft,
    Target,
    CalendarDays,
    Youtube,
    BookOpen,
    ExternalLink,
    PlayCircle,
    Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

const phaseColors = {
    1: { primary: "blue", gradient: "from-blue-600/10 to-purple-600/10" },
    2: { primary: "indigo", gradient: "from-indigo-600/10 to-blue-600/10" },
    3: { primary: "purple", gradient: "from-purple-600/10 to-pink-600/10" },
    4: { primary: "emerald", gradient: "from-emerald-600/10 to-teal-600/10" }
};

export default function PhaseView({ roadmap, phase, weekRange, phaseNumber }) {
    const [completedTasks, setCompletedTasks] = useState(new Set(roadmap.completedTasks || []));

    const { weeklyPlan } = roadmap;

    // Filter weeks for this phase
    const phaseWeeks = weeklyPlan?.filter(week => {
        const weekNum = week.week || 0;
        return weekNum >= weekRange[0] && weekNum <= weekRange[1];
    }) || [];

    const toggleTask = async (taskId) => {
        const isCurrentlyCompleted = completedTasks.has(taskId);

        // Optimistic update
        const newCompleted = new Set(completedTasks);
        if (isCurrentlyCompleted) {
            newCompleted.delete(taskId);
        } else {
            newCompleted.add(taskId);
        }
        setCompletedTasks(newCompleted);

        try {
            const result = await toggleRoadmapTask(taskId);
            if (!result.success) {
                // Rollback if failed
                setCompletedTasks(completedTasks);
                toast.error(result.error || "Failed to update task");
            } else {
                if (result.isCompleted) {
                    toast.success("Task milestone achieved! 🎉", {
                        description: "XP gained. Check your progress in the achievements section.",
                        duration: 3000,
                    });
                }
            }
        } catch (error) {
            setCompletedTasks(completedTasks);
            toast.error("Network error. Could not sync progress.");
        }
    };

    const totalTasks = phaseWeeks.reduce((acc, week) => acc + (week.tasks?.length || 0), 0);
    const completedCount = phaseWeeks.reduce((acc, week) => {
        const weekIdx = weeklyPlan.indexOf(week);
        return acc + (week.tasks?.filter((t, tIdx) => completedTasks.has(`${weekIdx}-${tIdx}`)).length || 0);
    }, 0);
    const phaseProgress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    const colorScheme = phaseColors[phaseNumber];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`bg-gradient-to-r ${colorScheme.gradient} border border-white/5 p-8 rounded-2xl backdrop-blur-md`}
            >
                <Link href="/roadmap">
                    <Button
                        variant="ghost"
                        className="mb-4 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Full Roadmap
                    </Button>
                </Link>

                <div className="space-y-3">
                    <Badge className={`bg-${colorScheme.primary}-500/20 text-${colorScheme.primary}-400 hover:bg-${colorScheme.primary}-500/30 border-none px-3 py-1`}>
                        Phase {phaseNumber}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {phase}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Weeks {weekRange[0]}-{weekRange[1]} • {totalTasks} Tasks
                    </p>

                    <div className="pt-4 space-y-2 max-w-md">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-400">
                            <span>Phase Progress</span>
                            <span>{Math.round(phaseProgress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${phaseProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full bg-${colorScheme.primary}-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]`}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Weekly Content */}
            <div className="space-y-12">
                {phaseWeeks.map((week, idx) => {
                    const weekIdx = weeklyPlan.indexOf(week);

                    return (
                        <motion.div
                            key={weekIdx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="relative pl-16"
                        >
                            {/* Timeline connector */}
                            {idx !== phaseWeeks.length - 1 && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    whileInView={{ height: "100%" }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                                    className={`absolute left-[24px] top-12 w-[2px] bg-gradient-to-b from-${colorScheme.primary}-600 via-${colorScheme.primary}-600/30 to-transparent z-0`}
                                />
                            )}

                            {/* Week indicator */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className={`absolute left-0 top-0 h-12 w-12 flex flex-col items-center justify-center rounded-2xl bg-[#0c0c0e] border border-${colorScheme.primary}-500/40 text-${colorScheme.primary}-400 z-10 shadow-[0_0_20px_rgba(37,99,235,0.2)]`}
                            >
                                <span className="text-[10px] font-bold uppercase leading-none opacity-60">Wk</span>
                                <span className="text-lg font-bold leading-none">{week.week}</span>
                            </motion.div>

                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={`text-[10px] uppercase border-${colorScheme.primary}-500/30 text-${colorScheme.primary}-400 px-2 py-0`}>
                                                {week.phase || phase}
                                            </Badge>
                                        </div>
                                        <h4 className="text-xl font-bold text-white">{week.topic}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <div className={`text-[10px] font-black text-${colorScheme.primary}-400 uppercase tracking-widest leading-none text-right`}>
                                            Week {week.week}<br />Progress
                                        </div>
                                        <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(week.tasks?.filter(t => completedTasks.has(`${weekIdx}-${week.tasks.indexOf(t)}`)).length / (week.tasks?.length || 1)) * 100}%` }}
                                                viewport={{ once: true }}
                                                className={`h-full bg-${colorScheme.primary}-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Objectives */}
                                {week.objectives && (
                                    <div className="flex flex-wrap gap-2">
                                        {week.objectives.map((obj, oIdx) => (
                                            <span key={oIdx} className="text-[11px] text-gray-400 bg-white/5 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1.5">
                                                <CheckCircle2 className={`h-3 w-3 text-${colorScheme.primary}-500`} />
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
                                                    className={`group text-left p-6 rounded-[1.5rem] bg-white/[0.03] border border-white/5 hover:border-${colorScheme.primary}-500/50 hover:bg-${colorScheme.primary}-500/[0.05] transition-all duration-500 shadow-xl backdrop-blur-md`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleTask(`${weekIdx}-${tIdx}`);
                                                                }}
                                                                className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${completedTasks.has(`${weekIdx}-${tIdx}`)
                                                                    ? `bg-${colorScheme.primary}-600 border-${colorScheme.primary}-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]`
                                                                    : `border-white/20 group-hover:border-${colorScheme.primary}-500`
                                                                    }`}
                                                            >
                                                                {completedTasks.has(`${weekIdx}-${tIdx}`) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                                            </div>
                                                            <h5 className={`font-bold transition-colors text-lg ${completedTasks.has(`${weekIdx}-${tIdx}`) ? "text-gray-500 line-through" : "text-gray-100"}`}>
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
                                                            <div className={`h-10 w-10 rounded-xl bg-${colorScheme.primary}-500/20 flex items-center justify-center`}>
                                                                <Target className={`h-6 w-6 text-${colorScheme.primary}-400`} />
                                                            </div>
                                                            <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
                                                        </div>
                                                        <Badge className={`bg-${colorScheme.primary}-600/20 text-${colorScheme.primary}-400 border-none`}>{task.type || 'learning'}</Badge>
                                                    </div>
                                                    <DialogDescription className="text-gray-400 text-base mt-2">
                                                        {task.description}
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <Tabs defaultValue="resources" className="w-full mt-6 flex-1 overflow-hidden flex flex-col">
                                                    <TabsList className="bg-white/5 border border-white/10 w-full justify-start p-1 h-12 shrink-0">
                                                        <TabsTrigger value="resources" className={`data-[state=active]:bg-${colorScheme.primary}-600 h-full px-6`}>Curated Resources</TabsTrigger>
                                                        <TabsTrigger value="delivery" className={`data-[state=active]:bg-${colorScheme.primary}-600 h-full px-6`}>Success Criteria</TabsTrigger>
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
                                                                                        <div className="aspect-video w-full relative overflow-hidden bg-gray-900">
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
                                                                                    {!res.thumbnail && section.key === 'videos' && (
                                                                                        <div className="aspect-video w-full relative overflow-hidden bg-gradient-to-br from-red-900/20 to-gray-900 flex items-center justify-center border-b border-white/5">
                                                                                            <Youtube className="h-12 w-12 text-red-500/50" />
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
                                                        <div className={`p-6 rounded-2xl bg-${colorScheme.primary}-500/5 border border-${colorScheme.primary}-500/10`}>
                                                            <h6 className={`text-[10px] font-bold text-${colorScheme.primary}-400 uppercase tracking-widest mb-4`}>Milestone Deliverable</h6>
                                                            <p className="text-gray-300 mb-6">{task.deliverable || "Complete all learning modules and practical exercises."}</p>

                                                            <h6 className={`text-[10px] font-bold text-${colorScheme.primary}-400 uppercase tracking-widest mb-4`}>Verification Checkpoints</h6>
                                                            <ul className="space-y-3">
                                                                {(week.successCriteria || ["Knowledge check", "Task completion"]).map((criteria, cIdx) => (
                                                                    <li key={cIdx} className="flex items-start gap-3 text-sm text-gray-400">
                                                                        <Circle className={`h-1.5 w-1.5 mt-2 fill-${colorScheme.primary}-500 text-${colorScheme.primary}-500`} />
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
                                    <Card className={`bg-gradient-to-br from-${colorScheme.primary}-500/10 to-transparent border-${colorScheme.primary}-500/20`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`h-8 w-8 rounded-lg bg-${colorScheme.primary}-500/20 flex items-center justify-center`}>
                                                    <CalendarDays className={`h-4 w-4 text-${colorScheme.primary}-400`} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white text-sm">Week {week.week} Mini-Project</h5>
                                                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">{week.projectIdea.difficulty} • {week.projectIdea.techStack?.join(', ')}</p>
                                                </div>
                                            </div>
                                            <h6 className={`font-bold text-${colorScheme.primary}-300 text-lg mb-2`}>{week.projectIdea.title}</h6>
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
                    );
                })}
            </div>
        </div>
    );
}
