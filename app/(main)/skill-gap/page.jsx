"use client";

import { useEffect, useState } from "react";
import SkillGapResult from "./components/SkillGapResult";

export default function SkillGapPage() {
  const [loading, setLoading] = useState(true);
  const [skillGap, setSkillGap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    autoGenerate();
  }, []);

  async function autoGenerate() {
    try {
      const res = await fetch("/api/skill-gap/submit", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate skill gap");
      }

      setSkillGap(data.skillGap);
    } catch (err) {
      console.error(err);
      setError("Skill gap generation failed");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-gray-400">Generating your skill gap…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!skillGap) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">
        Your Skill Gap Analysis
      </h2>

      <SkillGapResult skillGap={skillGap} />
    </div>
  );
}
