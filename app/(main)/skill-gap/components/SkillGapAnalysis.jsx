"use client";

import { useEffect, useState, useTransition } from "react";
import { generateSkillGap } from "@/app/actions/skillgap";
import SkillGapResult from "./SkillGapResult";

export default function SkillGapAnalysis() {
  const [loading, setLoading] = useState(true);
  const [skillGap, setSkillGap] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await generateSkillGap();
        setSkillGap(result);
      } catch (err) {
        console.error("Skill gap error:", err);
        setError("Failed to generate skill gap analysis.");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading || isPending) {
    return <p className="text-gray-400">Generating your skill gap…</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return <SkillGapResult data={skillGap} />;
}
