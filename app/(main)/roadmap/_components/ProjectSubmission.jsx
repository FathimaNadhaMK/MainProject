"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { evaluateProject, checkSubmissionStatus } from "@/actions/roadmap";
import { toast } from "sonner";
import { Loader2, Github, CheckCircle2, AlertCircle, ExternalLink, ArrowRight, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { motion, AnimatePresence } from "framer-motion";

export function ProjectSubmission({ weekNumber, colorScheme }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    const [open, setOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await checkSubmissionStatus(weekNumber);
                if (status?.isSubmitted) {
                    setReport(status.report);
                    setUrl(status.repoUrl || "");
                    setIsLocked(true);
                }
            } catch (error) {
                console.error("Failed to check submission status", error);
            } finally {
                setIsChecking(false);
            }
        };
        fetchStatus();
    }, [weekNumber]);

    const handleSubmit = async () => {
        if (!url) {
            toast.error("Please enter a GitHub repository URL");
            return;
        }

        if (!url.includes("github.com")) {
            toast.error("Invalid GitHub URL");
            return;
        }

        if (isLocked) return;

        setLoading(true);
        setReport(null);
        try {
            const result = await evaluateProject(url, weekNumber);
            if (result.success) {
                setReport(result.report);
                setIsLocked(true);
                toast.success("Project evaluation complete. Submission is now locked.");
            } else {
                toast.error(result.error || "Failed to evaluate project");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={isLocked ? "default" : "outline"}
                    className={isLocked
                        ? `bg-${colorScheme.primary}-600/20 text-${colorScheme.primary}-400 hover:bg-${colorScheme.primary}-600/30 font-bold h-12 px-8 rounded-xl`
                        : `border-${colorScheme.primary}-500/30 text-${colorScheme.primary}-400 hover:bg-${colorScheme.primary}-500/10 hover:border-${colorScheme.primary}-500/50 font-bold h-12 px-8 rounded-xl`
                    }
                    disabled={isChecking}
                >
                    {isChecking ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                        </>
                    ) : (
                        <>
                            {isLocked ? "View Submission" : "Submit project"}
                            <Github className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0c0c0e] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${colorScheme.primary}-500 to-transparent opacity-50`} />

                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`p-3 rounded-2xl bg-${colorScheme.primary}-500/10 border border-${colorScheme.primary}-500/20`}>
                            <Github className={`h-6 w-6 text-${colorScheme.primary}-400`} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">Post-Completion Submission</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Submit your GitHub repository for AI evaluation and detailed feedback.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 pt-6 min-h-0">
                    <AnimatePresence mode="wait">
                        {!report ? (
                            <motion.div
                                key="submission"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Repository URL</h4>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                                <Github className="h-4 w-4" />
                                            </div>
                                            <Input
                                                placeholder="https://github.com/username/repo"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                className="bg-black/40 border-white/10 pl-12 h-12 rounded-xl focus:border-blue-500/50 transition-all"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className={`h-12 px-8 bg-${colorScheme.primary}-600 hover:bg-${colorScheme.primary}-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]`}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    Run Evaluation
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3" />
                                        Make sure the repository is public and contains the project code for Week {weekNumber}.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Evaluation Process</span>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Gemini will parse your codebase, analyze your implementation against the week's goals, and provide scoring on code quality, architecture, and completeness.
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <BarChart className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">What you get</span>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            A comprehensive report including a merit score, highlighted strengths, areas for improvement, and tailored next steps for your career path.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="report"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-5"
                            >
                                {/* Result Header */}
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 relative overflow-hidden">
                                    <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-${colorScheme.primary}-500/10 rounded-full blur-3xl`} />

                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            {isLocked ? (
                                                <Badge className="bg-blue-500/20 text-blue-400 border-none px-3 py-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Locked
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-3 py-1">Evaluation Complete</Badge>
                                            )}
                                            <span className="text-gray-500 text-sm">• Week {weekNumber}</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">{report.summary}</h3>
                                    </div>

                                    <div className="flex flex-col items-center gap-1 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Merit Score</span>
                                        <div className={`text-4xl font-black ${getScoreColor(report.score)}`}>
                                            {report.score}
                                        </div>
                                        <Progress value={report.score} className={`w-20 h-1 mt-1 bg-white/5`} />
                                    </div>
                                </div>

                                {/* Feedback Report */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Key Strengths
                                        </h4>
                                        <div className="space-y-2">
                                            {report.strengths?.map((s, i) => (
                                                <div key={i} className="flex gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-gray-300 text-sm items-start">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="leading-tight">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Growth Areas
                                        </h4>
                                        <div className="space-y-2">
                                            {report.weaknesses?.map((w, i) => (
                                                <div key={i} className="flex gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-gray-300 text-sm items-start">
                                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                                    <span className="leading-tight">{w}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        Detailed Feedback
                                    </h4>
                                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                                        {report.feedback}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                                        <ArrowRight className="h-4 w-4" />
                                        Recommended Next Steps
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {report.nextSteps?.map((step, i) => (
                                            <div key={i} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-gray-300 text-sm flex items-start gap-2">
                                                <ArrowRight className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                                                <span className="leading-tight">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!isLocked && (
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setReport(null)}
                                            className="text-gray-500 hover:text-white text-sm h-8"
                                        >
                                            Submit another repository
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
