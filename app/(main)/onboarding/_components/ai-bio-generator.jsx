"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AIBioGenerator({ value, onChange, userProfile }) {
    const [generating, setGenerating] = useState(false);

    const generateBio = async () => {
        if (!userProfile.targetRole || !userProfile.skills?.length) {
            toast.error("Please fill in your target role and skills first");
            return;
        }

        setGenerating(true);
        try {
            const response = await fetch("/api/generate-bio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userProfile),
            });

            if (!response.ok) throw new Error("Failed to generate bio");

            const data = await response.json();
            onChange(data.bio);
            toast.success("Bio generated successfully!");
        } catch (error) {
            console.error("Bio generation error:", error);
            toast.error("Failed to generate bio. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-gray-300">Professional Bio (Optional)</Label>
                <Button
                    type="button"
                    onClick={generateBio}
                    disabled={generating}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-purple-200"
                >
                    {generating ? (
                        <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-3 w-3 mr-2" />
                            Tailor with AI
                        </>
                    )}
                </Button>
            </div>

            <Textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Tell us about your career journey, achievements, and aspirations... or click 'Tailor with AI' to generate one automatically"
                className="bg-gray-900 text-white border-white/10 h-32 resize-none"
                maxLength={500}
            />

            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                    {value?.length || 0} / 500 characters
                </span>
                {value && (
                    <button
                        type="button"
                        onClick={generateBio}
                        disabled={generating}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Regenerate
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-500 italic">
                💡 AI will craft a professional bio based on your skills, experience, and career goals
            </p>
        </div>
    );
}
