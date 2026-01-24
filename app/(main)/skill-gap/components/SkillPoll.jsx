"use client";

import { useState } from "react";

export default function SkillPoll({ requiredSkills, onSubmit }) {
  const [ratings, setRatings] = useState({});

  const handleChange = (skill, value) => {
    setRatings((prev) => ({ ...prev, [skill]: Number(value) }));
  };

  const handleSubmit = async () => {
    if (!requiredSkills || requiredSkills.length === 0) return;
    await onSubmit(ratings);
  };

  if (!requiredSkills || requiredSkills.length === 0) {
    return <p className="text-gray-400">No skills available to rate.</p>;
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Rate Your Skill Levels</h2>

      {requiredSkills.map((skill) => (
        <div key={skill} className="space-y-1">
          <label className="block text-white">
            {skill} — {ratings[skill] ?? 20}%
          </label>

          <input
            type="range"
            min="0"
            max="100"
            defaultValue="20"
            onChange={(e) => handleChange(skill, e.target.value)}
            className="w-full"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full rounded bg-white py-2 font-semibold text-black hover:bg-gray-200"
      >
        Generate Skill Gap
      </button>
    </div>
  );
}
