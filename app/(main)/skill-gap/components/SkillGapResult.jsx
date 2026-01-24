"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

export default function SkillGapResult({ skillGap }) {
  if (!skillGap) return null;

  const total = skillGap.requiredSkills.length;
  const missing = skillGap.missingSkills.length;
  const matched = total - missing;
  const percent = Math.round((matched / total) * 100);

  const chartData = [
    { name: "Matched", value: matched },
    { name: "Missing", value: missing },
  ];

  return (
    <div className="space-y-10">

      {/* SUMMARY */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 border border-blue-700/30">
        <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
        <p className="text-gray-300">{skillGap.summary}</p>
      </div>

      {/* SCORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-gray-900 p-6 border border-gray-700 text-center">
          <p className="text-sm text-gray-400">Skill Match</p>
          <p className="text-4xl font-bold text-green-400 mt-2">
            {percent}%
          </p>
        </div>

        <div className="md:col-span-2 rounded-xl bg-gray-900 p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">
            Coverage Progress
          </p>
          <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {matched} of {total} skills matched
          </p>
        </div>
      </div>

      {/* CHART + MISSING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl bg-gray-900 p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">
            Skill Coverage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-gray-900 p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-red-400">
            Missing Skills
          </h3>
          <ul className="space-y-2">
            {skillGap.missingSkills.map((s) => (
              <li
                key={s}
                className="rounded-lg bg-red-900/30 px-4 py-2 border border-red-700/30 text-red-300"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* REQUIRED SKILLS */}
      <div className="rounded-xl bg-gray-900 p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">
          Required Industry Skills
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {skillGap.requiredSkills.map((s) => {
            const isMissing = skillGap.missingSkills.includes(s);
            return (
              <div
                key={s}
                className={`rounded-lg px-3 py-2 border text-sm ${
                  isMissing
                    ? "bg-red-900/20 border-red-700/40 text-red-300"
                    : "bg-green-900/20 border-green-700/40 text-green-300"
                }`}
              >
                {s}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold"
          onClick={() => (window.location.href = "/roadmap")}
        >
          View Your Roadmap →
        </button>
      </div>

    </div>
  );
}
