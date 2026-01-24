"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Award,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DashboardView = ({ insights }) => {
  const aiInsights = insights?.aiInsights || {};
  const salaryRanges = aiInsights?.salaryRanges || [];

  const marketOutlook = aiInsights?.marketOutlook || "Positive";
  const demandLevel = aiInsights?.demandLevel || "High";
  const keyTrends = aiInsights?.keyTrends || [];
  const recommendedSkills = aiInsights?.recommendedSkills || [];

  const salaryData = salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const nextUpdateDistance = insights?.nextUpdate ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true }) : "coming soon";

  const getDemandColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case 'medium': return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]';
      case 'low': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Role Spectrum Analysis Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-blue-600 pl-6 py-2 bg-white/5 rounded-r-2xl animate-in fade-in slide-in-from-left-4 duration-700">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Role Intelligence: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            {insights.targetRole || insights.industry?.split('-').join(' ')}
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest animate-pulse">
            AI Analysis Live
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Market Outlook Card */}
        <Card className="relative overflow-hidden bg-[#0c0c0e]/80 border-white/5 p-8 rounded-[2rem] flex flex-col h-full min-h-[380px] hover:border-blue-500/40 transition-all duration-500 group shadow-2xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex justify-between items-start mb-8 shrink-0 relative z-10">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <LineChart className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Market Status</span>
          </div>
          <div className="flex-1 flex flex-col justify-between relative z-10">
            <h4 className="text-2xl font-bold text-white leading-snug">
              {marketOutlook} — <span className="text-gray-400 font-medium text-lg leading-relaxed mt-4 block">
                {insights.overview || "Deep market integration required for technical specialization."}
              </span>
            </h4>
            <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Next Refinement: <span className="text-blue-500">{nextUpdateDistance}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Industry Growth Card */}
        <Card className="relative overflow-hidden bg-[#0c0c0e]/80 border-white/5 p-8 rounded-[2rem] flex flex-col h-full min-h-[380px] hover:border-emerald-500/40 transition-all duration-500 group shadow-2xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex justify-between items-start mb-8 shrink-0 relative z-10">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Sector Growth</span>
          </div>
          <div className="flex-1 flex flex-col justify-end pb-4 relative z-10">
            <div className="space-y-6">
              <h4 className="text-7xl font-black text-white tracking-tighter">
                {insights.growthRate?.toFixed(1) || "15.0"}%
              </h4>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  style={{ width: `${Math.min(insights.growthRate || 15, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest">Compounded Annual Return</p>
            </div>
          </div>
        </Card>

        {/* Demand Level Card */}
        <Card className="relative overflow-hidden bg-[#0c0c0e]/80 border-white/5 p-8 rounded-[2rem] flex flex-col h-full min-h-[380px] hover:border-indigo-500/40 transition-all duration-500 group shadow-2xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex justify-between items-start mb-8 shrink-0 relative z-10">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <BriefcaseIcon className="h-5 w-5 text-indigo-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Demand Index</span>
          </div>
          <div className="flex-1 flex flex-col justify-end pb-4 relative z-10">
            <div className="space-y-6">
              <h4 className="text-6xl font-black text-white tracking-tighter italic">
                {demandLevel}
              </h4>
              <div className={`h-2.5 w-full rounded-full transition-all duration-700 ${getDemandColor(demandLevel)}`} />
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest italic">Live Market Sourcing Intensity</p>
            </div>
          </div>
        </Card>

        {/* Top Skills Card */}
        <Card className="relative overflow-hidden bg-[#0c0c0e]/80 border-white/5 p-8 rounded-[2rem] flex flex-col h-full min-h-[380px] hover:border-purple-500/40 transition-all duration-500 group shadow-2xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex justify-between items-start mb-8 shrink-0 relative z-10">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Core Stack</span>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            {insights.trendingSkills?.slice(0, 3).map((skill, idx) => (
              <div
                key={idx}
                className="bg-white/[0.03] border border-white/5 text-white/80 px-5 py-4 rounded-2xl text-[13px] font-bold hover:text-white hover:bg-white/[0.07] transition-all hover:scale-[1.03] shadow-inner backdrop-blur-md"
              >
                {skill}
              </div>
            ))}
            <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest text-center mt-2">Primary Differentiation</p>
          </div>
        </Card>
      </div>

      {/* Salary Visualization Section */}
      <section className="space-y-10 pt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h3 className="text-4xl font-black text-white leading-tight tracking-tighter">Compensation Corridors</h3>
            <p className="text-gray-400 text-lg font-medium max-w-2xl">Projected salary spectrum specifically for <span className="text-white border-b-2 border-indigo-500 pb-0.5">{insights.targetRole || "your role"}</span> trajectories.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 uppercase tracking-[0.2em] font-black shadow-lg">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              2026 Forecast Mode
            </div>
          </div>
        </div>

        {salaryData.length > 0 && (
          <Card className="bg-[#0c0c0e]/90 border-white/5 p-12 rounded-[3rem] overflow-hidden relative group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-40" />
            <div className="h-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 20, right: 30, left: 60, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1e" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#d1d5db"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    dy={10}
                    angle={-35}
                    textAnchor="end"
                    fontWeight="medium"
                  />
                  <YAxis
                    stroke="#d1d5db"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0c0c0e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "24px", padding: "24px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)", backdropFilter: "blur(20px)" }}
                    itemStyle={{ color: "#fff", fontSize: "14px", fontWeight: "900", padding: "4px 0" }}
                    labelStyle={{ color: "#fff", fontSize: "12px", textTransform: "uppercase", marginBottom: "16px", letterSpacing: "2px", fontWeight: "bold" }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }}
                  />
                  <Bar dataKey="min" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} barSize={28} name="Starting Potential" />
                  <Bar dataKey="median" fill="url(#indigoGradient)" radius={[8, 8, 0, 0]} barSize={28} name="Market Average" />
                  <Bar dataKey="max" fill="url(#purpleGradient)" radius={[8, 8, 0, 0]} barSize={28} name="Lead Velocity" />

                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3730a3" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6b21a8" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </section>

      {/* Footer Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <Card className="relative overflow-hidden bg-[#0c0c0e]/90 border border-white/5 p-10 rounded-[3rem] hover:border-blue-500/30 transition-all duration-700 shadow-2xl group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-blue-600/10 transition-all" />
          <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            Growth Catalysts
          </h3>
          <ul className="space-y-8">
            {keyTrends.map((trend, idx) => (
              <li key={idx} className="flex items-start gap-6 text-gray-400 group cursor-default">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500/30 mt-3 shrink-0 group-hover:bg-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-150 transition-all duration-500" />
                <span className="text-xl font-light group-hover:text-white transition-colors leading-relaxed italic">&quot;{trend}&quot;</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="relative overflow-hidden bg-[#0c0c0e]/90 border border-white/5 p-10 rounded-[3rem] hover:border-purple-500/30 transition-all duration-700 shadow-2xl group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-purple-600/10 transition-all" />
          <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            Strategic Mastery
          </h3>
          <div className="flex flex-wrap gap-4">
            {recommendedSkills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="border-white/10 text-gray-400 py-4 px-8 text-sm bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-300 cursor-default font-bold tracking-wider shadow-sm rounded-2xl"
              >
                {skill}
              </Badge>
            ))}
          </div>
          <div className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-[0.2em] text-center">
              High Priority Skill Index for 2026 Competitive Advantage
            </p>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default DashboardView;