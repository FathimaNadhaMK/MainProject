"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, HelpCircle, CheckCircle2, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { generateWeeklyQuiz, submitWeeklyQuiz } from "@/actions/roadmap";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export function WeeklyQuiz({ weekNumber, colorScheme, lockStatus, onPassed }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    const isLocked = lockStatus?.quizPassed;

    const startQuiz = async () => {
        setLoading(true);
        setAnswers({});
        setShowResults(false);
        try {
            const res = await generateWeeklyQuiz(weekNumber);
            if (res.success && res.quiz?.questions) {
                setQuiz(res.quiz);
            } else {
                toast.error("Failed to generate quiz. Try again.");
            }
        } catch (error) {
            toast.error("Unexpected error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qIdx, optionKey) => {
        if (showResults) return;
        setAnswers(prev => ({ ...prev, [qIdx]: optionKey }));
    };

    const submitQuiz = async () => {
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                correctCount++;
            }
        });
        const finalScore = (correctCount / quiz.questions.length) * 100;
        setScore(finalScore);
        setShowResults(true);

        try {
            await submitWeeklyQuiz(weekNumber, finalScore, quiz);
            if (finalScore >= 80) {
                toast.success(`Awesome! You passed the week ${weekNumber} Quiz with ${finalScore}%!`);
                if (onPassed) onPassed();
            } else {
                toast.error(`You scored ${finalScore}%. You need at least 80% to pass. Try again!`);
            }
        } catch (e) {
            toast.error("Could not save score");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                // Reset on close
                setQuiz(null);
                setAnswers({});
                setShowResults(false);
            } else if (!isLocked && !quiz) {
                startQuiz();
            }
            setOpen(val);
        }}>
            <DialogTrigger asChild>
                <Button
                    variant={isLocked ? "default" : "outline"}
                    className={isLocked
                        ? `bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-bold h-12 px-8 rounded-xl`
                        : `border-${colorScheme.primary}-500/30 text-${colorScheme.primary}-400 hover:bg-${colorScheme.primary}-500/10 hover:border-${colorScheme.primary}-500/50 font-bold h-12 px-8 rounded-xl`
                    }
                >
                    {isLocked ? "Quiz Passed" : "Take Weekly Quiz"}
                    <HelpCircle className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#0c0c0e] border-white/10 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${colorScheme.primary}-500 to-transparent opacity-50`} />

                <DialogHeader className="p-8 pb-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`p-3 rounded-2xl bg-${colorScheme.primary}-500/10 border border-${colorScheme.primary}-500/20`}>
                            <HelpCircle className={`h-6 w-6 text-${colorScheme.primary}-400`} />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">Week {weekNumber} Application Quiz</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Pass this quiz (80%+) to unlock the next week.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 pt-6 min-h-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <Loader2 className={`h-12 w-12 text-${colorScheme.primary}-400 animate-spin`} />
                            <p className="text-gray-400">Generating unique scenario-based questions via AI...</p>
                        </div>
                    ) : quiz ? (
                        <div className="space-y-8">
                            {showResults && (
                                <div className={`p-6 rounded-2xl border ${score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} flex flex-col items-center`}>
                                    <h3 className="text-3xl font-black mb-2">{score}% Score</h3>
                                    <p className="text-gray-300">
                                        {score >= 80 ? 'Congratulations, you passed!' : 'You did not pass. Try again to unlock the next week.'}
                                    </p>
                                    {score < 80 && (
                                        <Button
                                            onClick={startQuiz}
                                            className={`mt-4 bg-${colorScheme.primary}-600 hover:bg-${colorScheme.primary}-500`}
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                                        </Button>
                                    )}
                                </div>
                            )}

                            {quiz.questions.map((q, idx) => (
                                <div key={idx} className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl space-y-4">
                                    <h4 className="text-lg font-semibold text-gray-200">{idx + 1}. {q.question}</h4>
                                    <div className="space-y-2">
                                        {Object.entries(q.options).map(([key, value]) => {
                                            const isSelected = answers[idx] === key;
                                            const isCorrect = q.correctAnswer === key;
                                            let borderClass = 'border-white/10 hover:border-white/30';
                                            let bgClass = isSelected ? `bg-${colorScheme.primary}-600/20 border-${colorScheme.primary}-500` : 'bg-black/20';

                                            // Handle result display
                                            if (showResults) {
                                                if (isCorrect) {
                                                    borderClass = 'border-emerald-500';
                                                    bgClass = 'bg-emerald-500/20';
                                                } else if (isSelected && !isCorrect) {
                                                    borderClass = 'border-red-500';
                                                    bgClass = 'bg-red-500/20';
                                                } else {
                                                    borderClass = 'border-white/5 opacity-50';
                                                }
                                            }

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleOptionSelect(idx, key)}
                                                    disabled={showResults}
                                                    className={`w-full text-left p-4 rounded-xl border ${borderClass} ${bgClass} transition-all flex justify-between items-center`}
                                                >
                                                    <span className="text-gray-300">{key.toUpperCase()}: {value}</span>
                                                    {showResults && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                                    {showResults && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {showResults && (
                                        <div className={`p-4 rounded-xl mt-4 ${answers[idx] === q.correctAnswer ? 'bg-emerald-500/5 text-emerald-200' : 'bg-red-500/5 text-red-200'} text-sm`}>
                                            <p className="font-semibold mb-1">Explanation:</p>
                                            {q.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {!showResults && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={submitQuiz}
                                        disabled={Object.keys(answers).length !== quiz.questions.length}
                                        className={`h-12 px-8 bg-${colorScheme.primary}-600 hover:bg-${colorScheme.primary}-500 font-bold rounded-xl`}
                                    >
                                        Submit Final Answers
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
