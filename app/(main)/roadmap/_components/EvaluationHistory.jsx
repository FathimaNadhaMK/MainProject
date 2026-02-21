"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
    Github,
    ExternalLink,
    ChevronRight,
    Trophy,
    MessageSquare,
    Calendar,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getProjectEvaluations } from "@/actions/roadmap";
import { motion, AnimatePresence } from "framer-motion";

export function EvaluationHistory() {
    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEval, setSelectedEval] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const data = await getProjectEvaluations();
            setEvaluations(data);
            setLoading(false);
        };
        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (evaluations.length === 0) {
        return (
            <Card className="bg-slate-900/50 border-white/5 p-12 text-center rounded-[2rem]">
                <div className="max-w-md mx-auto space-y-4">
                    <div className="p-4 bg-muted rounded-full w-fit mx-auto">
                        <Github className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-white">No evaluations yet</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Submit your first project from the weekly view to see AI-powered feedback and scores here.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {evaluations.map((evalItem, index) => (
                        <motion.div
                            key={evalItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-[#0c0c0e]/80 border-white/5 hover:border-blue-500/30 transition-all group rounded-3xl overflow-hidden shadow-xl">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none">
                                            Week {evalItem.weekNumber}
                                        </Badge>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            {format(new Date(evalItem.createdAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    <CardTitle className="text-white text-lg font-bold truncate">
                                        {evalItem.repoUrl.split('/').pop()}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-end justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">Merit Score</p>
                                            <h4 className="text-3xl font-black text-white">{evalItem.score}/100</h4>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-lg">
                                            <Trophy className="h-5 w-5 text-emerald-400" />
                                        </div>
                                    </div>

                                    <Progress value={evalItem.score} className="h-1.5 bg-white/5" />

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full mt-4 justify-between bg-white/5 hover:bg-white/10 text-white rounded-xl py-6 font-bold group"
                                                onClick={() => setSelectedEval(evalItem)}
                                            >
                                                View Full Report
                                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </DialogTrigger>
                                        {selectedEval && (
                                            <DialogContent className="max-w-3xl bg-[#0c0c0e] border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-3xl">
                                                <ScrollArea className="max-h-[85vh]">
                                                    <div className="p-8 space-y-8">
                                                        <DialogHeader>
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <Badge className="bg-blue-500/20 text-blue-400">Week {selectedEval.weekNumber} Review</Badge>
                                                                <span className="text-xs text-gray-500 font-medium">Evaluation Date: {format(new Date(selectedEval.createdAt), "PPP")}</span>
                                                            </div>
                                                            <DialogTitle className="text-4xl font-black text-white tracking-tighter">
                                                                Project Performance Analysis
                                                            </DialogTitle>
                                                        </DialogHeader>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <Card className="bg-white/5 border-none p-6 rounded-[2rem] space-y-4">
                                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Competency Level</h4>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-6xl font-black text-white">{selectedEval.score}</span>
                                                                    <span className="text-gray-500 font-bold text-xl">/ 100</span>
                                                                </div>
                                                                <Progress value={selectedEval.score} className="h-3 bg-white/5" />
                                                            </Card>

                                                            <div className="space-y-4 justify-center flex flex-col">
                                                                <div className="flex items-start gap-4 p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                                                                    <Github className="h-6 w-6 text-blue-400 shrink-0" />
                                                                    <div className="space-y-1 overflow-hidden">
                                                                        <p className="text-xs font-bold text-blue-400/70 uppercase">Linked Repository</p>
                                                                        <a href={selectedEval.repoUrl} target="_blank" className="text-sm text-white hover:underline truncate block">{selectedEval.repoUrl}</a>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <MessageSquare className="h-5 w-5 text-indigo-400" />
                                                                <h4 className="text-xl font-bold text-white">AI Mentor Summary</h4>
                                                            </div>
                                                            <p className="text-gray-400 leading-relaxed text-lg italic bg-white/5 p-6 rounded-[2rem] border-l-4 border-indigo-500">
                                                                {selectedEval.report.summary}
                                                            </p>
                                                        </div>

                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                            <Card className="bg-emerald-500/5 border-none p-8 rounded-[2rem] space-y-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-xl bg-emerald-500/10">
                                                                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                                                    </div>
                                                                    <h4 className="text-lg font-bold text-white">Key Pillars Strength</h4>
                                                                </div>
                                                                <ul className="space-y-4">
                                                                    {selectedEval.report.strengths?.map((s, idx) => (
                                                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                                            {s}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </Card>

                                                            <Card className="bg-amber-500/5 border-none p-8 rounded-[2rem] space-y-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-xl bg-amber-500/10">
                                                                        <AlertCircle className="h-5 w-5 text-amber-400" />
                                                                    </div>
                                                                    <h4 className="text-lg font-bold text-white">Growth Opportunities</h4>
                                                                </div>
                                                                <ul className="space-y-4">
                                                                    {selectedEval.report.weaknesses?.map((w, idx) => (
                                                                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                                                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                                                            {w}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </Card>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <h4 className="text-xl font-bold text-white">Actionable Next Steps</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {selectedEval.report.nextSteps?.map((step, idx) => (
                                                                    <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                                                                        {step}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ScrollArea>
                                            </DialogContent>
                                        )}
                                    </Dialog>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
