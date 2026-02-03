"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ScrollText } from "lucide-react";
import ResumeBuilder from "./_components/resume-builder";
import AtsChecker from "./_components/ats-checker";
import TargetReadiness from "./_components/target-readiness";
import StudyRoadmap from "./_components/study-roadmap";

export default function ResumePage({ initialContent, userData }) {
  const [atsScore, setAtsScore] = useState(null);
  const [showGrowthFeatures, setShowGrowthFeatures] = useState(false);

  const handleScoreCalculated = (score) => {
    setAtsScore(score);
    if (score) {
      setShowGrowthFeatures(true);
      // Smooth scroll to growth features
      setTimeout(() => {
        document.getElementById("growth-features")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 300);
    } else {
      setShowGrowthFeatures(false);
    }
  };

  const scrollToBuilder = () => {
    document.getElementById("resume-builder")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-12">
      {/* ATS Checker Section */}
      <AtsChecker onScoreCalculated={handleScoreCalculated} />

      {/* Career Growth Features - Show after ATS analysis */}
      {showGrowthFeatures && atsScore && (
        <div id="growth-features" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Target Readiness */}
          <TargetReadiness userData={userData} atsScore={atsScore} />

          {/* Study Roadmap */}
          <StudyRoadmap userData={userData} />

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="min-w-[200px]">
              <Sparkles className="mr-2 h-5 w-5" />
              Improve Resume with AI
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-w-[200px]"
              onClick={scrollToBuilder}
            >
              <ScrollText className="mr-2 h-5 w-5" />
              Build Resume from Template
            </Button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-muted-foreground font-medium">
            Or build your resume from scratch
          </span>
        </div>
      </div>

      {/* Existing Resume Builder */}
      <div id="resume-builder">
        <ResumeBuilder initialContent={initialContent} />
      </div>
    </div>
  );
}
