"use client";

import { useState } from "react";
import { Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "./file-upload";
import AtsSuggestions, { AtsScoreDisplay } from "./ats-suggestions";
import { ClipLoader } from "react-spinners";

// Mock ATS analysis function with varied results
const analyzeMockResume = (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Generate varied score based on file properties (for demo purposes)
            const baseScore = 60 + Math.floor(Math.random() * 30); // 60-90%
            const fileName = file.name.toLowerCase();

            // Adjust score based on filename (just for demo variety)
            let score = baseScore;
            if (fileName.includes('senior') || fileName.includes('experienced')) {
                score = Math.min(score + 5, 95);
            }
            if (fileName.includes('junior') || fileName.includes('entry')) {
                score = Math.max(score - 10, 50);
            }

            // Generate varied suggestions based on score
            const allSuggestions = {
                keywords: [
                    "Add industry-specific keywords like 'Agile', 'Scrum', 'CI/CD'",
                    "Include action verbs: 'Led', 'Developed', 'Implemented'",
                    "Add technical skills relevant to your target role",
                    "Include domain-specific terminology",
                    "Add certifications and qualifications",
                ],
                formatting: [
                    "Use consistent bullet points throughout",
                    "Standardize date formats (MM/YYYY)",
                    "Ensure proper heading hierarchy",
                    "Use clear section headers",
                    "Maintain consistent font sizes",
                ],
                skills: [
                    "Add a dedicated technical skills section",
                    "Include proficiency levels for key skills",
                    "Group skills by category (Languages, Frameworks, Tools)",
                    "List both hard and soft skills",
                    "Prioritize relevant skills for your target role",
                ],
                projects: [
                    "Quantify achievements with metrics (e.g., '30% increase')",
                    "Add project outcomes and impact",
                    "Include technologies used in each project",
                    "Describe your specific role and contributions",
                    "Add links to live projects or GitHub repositories",
                ],
                grammar: [
                    "Check for consistent tense usage",
                    "Review punctuation in bullet points",
                    "Ensure proper capitalization of proper nouns",
                    "Fix any spelling errors",
                    "Use active voice instead of passive",
                ],
            };

            // Select random subset of suggestions based on score
            const numSuggestions = score >= 80 ? 2 : score >= 65 ? 3 : 4;

            const suggestions = {};
            Object.keys(allSuggestions).forEach(category => {
                const items = allSuggestions[category];
                suggestions[category] = items
                    .sort(() => Math.random() - 0.5)
                    .slice(0, numSuggestions);
            });

            resolve({
                score,
                suggestions,
            });
        }, 2000); // Simulate 2 second analysis
    });
};

export default function AtsChecker({ onScoreCalculated }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setAnalysisResult(null); // Clear previous results
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setAnalysisResult(null);
        if (onScoreCalculated) {
            onScoreCalculated(null); // Reset score in parent
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setIsAnalyzing(true);
        try {
            const result = await analyzeMockResume(selectedFile);
            setAnalysisResult(result);

            // Notify parent component of the score
            if (onScoreCalculated) {
                onScoreCalculated(result.score);
            }
        } catch (error) {
            console.error("Analysis error:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center space-y-3">
                <h1 className="font-bold gradient-title text-4xl md:text-5xl lg:text-6xl">
                    Resume Builder
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Upload your resume and check if it is ATS friendly
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-xl mx-auto">
                    <Info className="h-4 w-4 flex-shrink-0" />
                    <span>AI will analyze your resume and guide you to improve it</span>
                </div>
            </div>

            {/* File Upload Section */}
            <Card>
                <CardContent className="pt-6">
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                        onClear={handleClearFile}
                    />

                    {selectedFile && !analysisResult && (
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                size="lg"
                                className="min-w-[200px]"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <ClipLoader size={16} color="white" className="mr-2" />
                                        Analyzing Resume...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Analyze Resume
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* ATS Score Section */}
                    <Card className="border-2">
                        <CardContent className="pt-6">
                            <AtsScoreDisplay score={analysisResult.score} />
                        </CardContent>
                    </Card>

                    {/* AI Suggestions Panel */}
                    <Card className="border-2">
                        <CardContent className="pt-6">
                            <AtsSuggestions suggestions={analysisResult.suggestions} />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleClearFile}
                            className="min-w-[150px]"
                        >
                            Upload New Resume
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
