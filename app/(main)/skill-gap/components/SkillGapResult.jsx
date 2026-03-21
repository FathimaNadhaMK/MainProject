"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star, Search, Filter, Trophy, Target, Zap, Award } from "lucide-react";

const COLORS = ["#22c55e", "#ef4444"];

export default function SkillGapResult({ skillGap, onSave, onExport, onShare, savedAnalyses = [], currentAnalysisId }) {
  const [skillConfidence, setSkillConfidence] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [progressHistory, setProgressHistory] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [achievements, setAchievements] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const roadmapRef = useRef(null);

  useEffect(() => {
    // Smooth scroll to CTA on initialization
    if (roadmapRef.current) {
      setTimeout(() => {
        roadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  }, []);

  if (!skillGap) return null;

  const total = skillGap.requiredSkills.length;
  const missing = skillGap.missingSkills.length;
  const matched = total - missing;
  const percent = Math.round((matched / total) * 100);

  const chartData = [
    { name: "Matched", value: matched },
    { name: "Missing", value: missing },
  ];

  // Load progress history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('skillGapProgress');
    if (history) {
      setProgressHistory(JSON.parse(history));
    }
  }, []);

  // Save progress when analysis changes
  useEffect(() => {
    if (skillGap && matched > 0) {
      const newEntry = {
        date: new Date().toISOString(),
        matched: matched,
        total: total,
        percentage: percent
      };

      const updated = [...progressHistory.filter(entry =>
        new Date(entry.date).toDateString() !== new Date().toDateString()
      ), newEntry].slice(-30); // Keep last 30 days

      setProgressHistory(updated);
      localStorage.setItem('skillGapProgress', JSON.stringify(updated));
    }
  }, [skillGap, matched, total, percent]);

  const updateSkillConfidence = (skill, confidence) => {
    const updated = { ...skillConfidence, [skill]: confidence };
    setSkillConfidence(updated);
    localStorage.setItem('skillConfidence', JSON.stringify(updated));
  };

  // Load saved confidence ratings
  useEffect(() => {
    const saved = localStorage.getItem('skillConfidence');
    if (saved) {
      setSkillConfidence(JSON.parse(saved));
    }
  }, []);

  const getIndustryBenchmark = () => {
    // Mock industry data - in real app this would come from API
    const industryAvg = 75;
    const topPerformers = 95;

    if (percent >= topPerformers) return { status: "Top Performer", color: "text-purple-400", benchmark: topPerformers };
    if (percent >= industryAvg) return { status: "Above Average", color: "text-blue-400", benchmark: industryAvg };
    return { status: "Developing", color: "text-yellow-400", benchmark: industryAvg };
  };

  const getJobMarketInsights = () => {
    const qualifiedJobs = Math.max(0, percent - 10);
    const growthPotential = Math.min(100, (100 - percent) * 1.5);

    return { qualifiedJobs, growthPotential };
  };

  const getRecommendations = () => {
    const recommendations = [];

    if (missing > 5) {
      recommendations.push("Focus on building foundational skills first");
    }

    if (percent < 70) {
      recommendations.push("Consider online courses or certifications");
    }

    if (Object.keys(skillConfidence).length > 0) {
      const lowConfidenceSkills = Object.entries(skillConfidence)
        .filter(([_, confidence]) => confidence <= 2)
        .map(([skill, _]) => skill);

      if (lowConfidenceSkills.length > 0) {
        recommendations.push(`Strengthen confidence in: ${lowConfidenceSkills.slice(0, 2).join(", ")}`);
      }
    }

    const benchmark = getIndustryBenchmark();
    if (benchmark.status === "Developing") {
      recommendations.push("Network with industry professionals for mentorship");
    }

    return recommendations;
  };

  // Achievement system
  useEffect(() => {
    const newAchievements = [];
    const earnedIds = achievements.map(a => a.id);

    if (percent >= 90 && !earnedIds.includes('skill_master')) {
      newAchievements.push({
        id: 'skill_master',
        title: 'Skill Master',
        description: 'Achieved 90%+ skill match',
        icon: '🏆',
        earned: true,
        rarity: 'legendary'
      });
    }

    if (Object.keys(skillConfidence).length >= 5 && !earnedIds.includes('confident_learner')) {
      newAchievements.push({
        id: 'confident_learner',
        title: 'Confident Learner',
        description: 'Rated confidence in 5+ skills',
        icon: '⭐',
        earned: true,
        rarity: 'rare'
      });
    }

    if (progressHistory.length >= 7 && !earnedIds.includes('consistent_progress')) {
      newAchievements.push({
        id: 'consistent_progress',
        title: 'Consistent Progress',
        description: 'Completed 7+ skill assessments',
        icon: '📈',
        earned: true,
        rarity: 'common'
      });
    }

    if (missing === 0 && !earnedIds.includes('perfect_match')) {
      newAchievements.push({
        id: 'perfect_match',
        title: 'Perfect Match',
        description: '100% skill alignment achieved',
        icon: '💎',
        earned: true,
        rarity: 'legendary'
      });
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setNewAchievement(newAchievements[0]);
      setShowAchievementModal(true);
      setTimeout(() => setShowAchievementModal(false), 3000);
    }
  }, [percent, skillConfidence, progressHistory, missing]);

  // Real-time suggestions
  useEffect(() => {
    const newSuggestions = [];

    if (missing > 3) {
      newSuggestions.push({
        type: 'course',
        title: 'Skill Development Course',
        description: 'Enroll in comprehensive skill-building program',
        icon: '🎓',
        action: () => window.open('https://www.coursera.org', '_blank'),
        priority: 'high'
      });
    }

    if (percent < 70) {
      newSuggestions.push({
        type: 'practice',
        title: 'Portfolio Project',
        description: 'Build projects to demonstrate your skills',
        icon: '💼',
        action: () => window.open('https://github.com', '_blank'),
        priority: 'medium'
      });
    }

    if (Object.keys(skillConfidence).length === 0) {
      newSuggestions.push({
        type: 'assessment',
        title: 'Skill Confidence Assessment',
        description: 'Rate your confidence in matched skills',
        icon: '📊',
        action: () => setShowAdvanced(true),
        priority: 'high'
      });
    }

    setSuggestions(newSuggestions);
  }, [missing, percent, skillConfidence]);

  const benchmark = getIndustryBenchmark();
  const marketInsights = getJobMarketInsights();
  const recommendations = getRecommendations();

  // Filtered skills for search and filter
  const filteredSkills = useMemo(() => {
    let skills = [];

    if (filterType === 'matched' || filterType === 'all') {
      skills.push(...skillGap.requiredSkills
        .filter(skill => !skillGap.missingSkills.includes(skill))
        .map(skill => ({ skill, type: 'matched' })));
    }

    if (filterType === 'missing' || filterType === 'all') {
      skills.push(...skillGap.missingSkills
        .map(skill => ({ skill, type: 'missing' })));
    }

    return skills.filter(({ skill }) =>
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skillGap, searchTerm, filterType]);

  // Interactive skill card component
  const SkillCard = ({ skill, type, onClick }) => (
    <motion.div
      layout
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-2xl p-5 transition-all duration-500 backdrop-blur-2xl border group ${
        type === 'matched'
          ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-400/50 shadow-[0_4px_20px_rgba(251,191,36,0.05)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.15)]'
          : 'bg-gradient-to-br from-zinc-800/40 to-transparent border-zinc-700/50 hover:border-zinc-500/50 hover:bg-zinc-800/60'
      }`}
      onClick={() => onClick(skill)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${type === 'matched' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'}`}>
             {type === 'matched' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <span className={`font-medium tracking-wide ${type === 'matched' ? 'text-gray-100' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{skill}</span>
        </div>
        <span className={`text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${type === 'matched' ? 'text-amber-400/70' : 'text-zinc-400/70'}`}>
          View
        </span>
      </div>
    </motion.div>
  );

  // Animated counter component
  const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        setCount(Math.floor(progress * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{count}%</span>;
  };

  // Interactive confidence slider component
  const ConfidenceSlider = ({ skill, value, onChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const getConfidenceLabel = (level) => {
      const labels = {
        1: 'Beginner',
        2: 'Basic',
        3: 'Intermediate',
        4: 'Advanced',
        5: 'Expert'
      };
      return labels[level] || 'Not rated';
    };

    const getConfidenceColor = (level) => {
      const colors = {
        1: 'text-red-400',
        2: 'text-orange-400',
        3: 'text-yellow-400',
        4: 'text-blue-400',
        5: 'text-green-400'
      };
      return colors[level] || 'text-gray-400';
    };

    return (
      <motion.div
        className="bg-white/[0.02] backdrop-blur-lg rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-200 font-medium">{skill}</span>
          </div>
          <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
            Matched
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Confidence Level</span>
            <div className="flex items-center gap-2">
              {value && (
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < value ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
              )}
              <span className={`text-sm font-medium ${getConfidenceColor(value)}`}>
                {getConfidenceLabel(value)}
              </span>
            </div>
          </div>

          <div className="relative">
            <input
              type="range"
              min="1"
              max="5"
              value={value || 1}
              onChange={(e) => onChange(skill, parseInt(e.target.value))}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(value || 1) * 20}%, #27272a ${(value || 1) * 20}%, #27272a 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative space-y-10">
      {/* LUXURY AMBIENT AURORA BACKGROUND (TUNGSTEN & GOLD) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-600/20 blur-[130px] rounded-full mix-blend-screen"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[-10%] w-[40%] h-[50%] bg-zinc-600/20 blur-[130px] rounded-full mix-blend-screen"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} 
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-stone-500/10 blur-[150px] rounded-full mix-blend-screen"
        ></motion.div>
      </div>

      {/* ACHIEVEMENT MODAL */}
      <AnimatePresence>
        {showAchievementModal && newAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 p-6 rounded-xl border border-yellow-500/50 shadow-2xl max-w-sm w-full text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                {newAchievement.icon}
              </motion.div>
              <h3 className="text-xl font-bold text-yellow-300 mb-2">Achievement Unlocked!</h3>
              <p className="text-yellow-200 font-semibold mb-1">{newAchievement.title}</p>
              <p className="text-yellow-200/80 text-sm">{newAchievement.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUMMARY */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 opacity-50"></div>
        <h2 className="text-xl font-medium tracking-wide text-white mb-3 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
           AI Analysis Summary
        </h2>
        <p className="text-gray-300 leading-relaxed font-light">{skillGap.summary}</p>
      </motion.div>

      {/* SCORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl p-8 border border-white/5 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <p className="text-xs uppercase tracking-widest text-zinc-400 z-10">Skill Match Readiness</p>
          
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1], 
              textShadow: ['0 0 20px rgba(251,191,36,0)', '0 0 40px rgba(251,191,36,0.3)', '0 0 20px rgba(251,191,36,0)'] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl font-light text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-yellow-600 my-6 z-10"
          >
            <AnimatedCounter value={percent} />
          </motion.div>
          <p className="text-xs text-zinc-400 mt-2 z-10">
            Industry Benchmark: <span className="text-amber-400 font-medium tracking-wide">{benchmark.status}</span>
          </p>
        </motion.div>

        <div className="md:col-span-2 rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5 flex flex-col justify-center shadow-lg">
          <div className="flex justify-between items-end mb-4">
            <p className="text-sm font-medium tracking-wide text-gray-300">Coverage Progress</p>
            <p className="text-xs text-zinc-500">{matched} of {total} skills matched</p>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
          {progressHistory.length > 1 && (
            <p className="text-xs text-amber-400 mt-4 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 
              Progress: {progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage > 0 ? '+' : ''}
              {progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage}% since first analysis
            </p>
          )}
        </div>
      </div>

      {/* CHART + MISSING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5"
        >
          <h3 className="text-lg font-medium tracking-wide mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            Skill Coverage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={index === 0 ? '#fbbf24' : '#27272a'}
                      opacity={activeIndex === index ? 0.8 : 1}
                      style={{ filter: activeIndex === index ? `drop-shadow(0 0 10px ${index === 0 ? '#fbbf24' : '#27272a'})` : 'none', outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      return (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#09090b]/95 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl"
                        >
                          <p className="text-white font-medium mb-1">{data.name}</p>
                          <p className="text-zinc-400 text-sm">{data.value} skills ({((data.value/total)*100).toFixed(1)}%)</p>
                        </motion.div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium tracking-wide text-zinc-300 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-zinc-500" />
              Locked Skills
            </h3>
            <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-3 py-1 rounded-full">{skillGap.missingSkills.length} Remaining</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar flex-1">
            <AnimatePresence>
              {skillGap.missingSkills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl bg-gradient-to-r from-zinc-800/40 to-transparent px-5 py-4 border-l-2 border-zinc-600 font-medium hover:bg-zinc-800/60 hover:border-zinc-400 transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                  onClick={() => setSelectedSkill(skill)}
                >
                  <span className="tracking-wide text-zinc-300">{skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-widest text-amber-500 uppercase">Focus</span>
                    <Target className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* INTERACTIVE SKILLS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h3 className="text-xl font-medium tracking-wide flex items-center gap-3">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Skill Inventory
          </h3>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all focus:outline-none w-full sm:w-64"
              />
            </div>

            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('matched')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'matched'
                    ? 'bg-amber-500/20 text-amber-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Matched
              </button>
              <button
                onClick={() => setFilterType('missing')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterType === 'missing'
                    ? 'bg-zinc-800 text-zinc-300 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Locked
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredSkills.map(({ skill, type }, index) => (
              <motion.div
                key={`${skill}-${type}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <SkillCard
                  skill={skill}
                  type={type}
                  onClick={setSelectedSkill}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredSkills.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <Filter className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p>No skills match your search criteria</p>
          </motion.div>
        )}
      </motion.div>

      {/* ACHIEVEMENTS SECTION */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-xl font-medium tracking-wide">Career Milestones</h3>
            <span className="bg-white/5 text-zinc-300 px-3 py-1 rounded-full text-xs font-medium border border-white/10 ml-auto flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              {achievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] ${
                  achievement.earned
                    ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_4px_20px_rgba(251,191,36,0.05)]'
                    : 'bg-white/5 border-white/5 opacity-50'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="text-4xl filter drop-shadow-md">{achievement.icon}</div>
                  <div>
                    <div className="font-medium text-gray-200 tracking-wide">{achievement.title}</div>
                    <div className="text-xs text-gray-400 mt-1 font-light leading-relaxed">{achievement.description}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SUGGESTIONS SECTION */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-medium tracking-wide flex items-center gap-3">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              Strategic Recommendations
            </h3>
            <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20">
              {suggestions.length} Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className={`p-5 rounded-xl border transition-all hover:-translate-y-1 cursor-pointer group ${
                  suggestion.priority === 'high'
                    ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/10 hover:shadow-[0_8px_30px_rgba(251,191,36,0.1)]'
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]'
                }`}
                onClick={suggestion.action}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl border ${
                    suggestion.priority === 'high'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <span className="text-xl filter drop-shadow-sm">{suggestion.icon}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-medium text-gray-200 tracking-wide mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-zinc-400 font-light leading-relaxed">{suggestion.description}</p>
                  </div>
                  <Target className={`w-5 h-5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                    suggestion.priority === 'high' ? 'text-amber-400' : 'text-zinc-500'
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ADVANCED FEATURES TOGGLE */}
      <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl p-8 border border-white/5 shadow-2xl transition-all">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-left flex justify-between items-center text-lg font-medium hover:text-amber-400 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-amber-500/30 transition-colors">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="tracking-wide text-zinc-200">Deep Analytical Metrics</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              {Object.keys(skillConfidence).length > 0 ? 'Active' : 'Locked'}
            </span>
            <span className={`text-2xl transition-transform duration-500 ${showAdvanced ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
        </button>

        {showAdvanced && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-500">

            {/* SKILL CONFIDENCE ASSESSMENT */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.01] p-8 border border-white/5 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium tracking-wide text-zinc-200">Confidence Calibration</h4>
                    <p className="text-sm text-zinc-500 font-light mt-1">Rate your mastery level in existing skills</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {skillGap.requiredSkills.filter(skill => !skillGap.missingSkills.includes(skill)).slice(0, 5).map((skill, index) => (
                    <ConfidenceSlider
                      key={skill}
                      skill={skill}
                      value={skillConfidence[skill]}
                      onChange={updateSkillConfidence}
                    />
                  ))}
                </div>

                {skillGap.requiredSkills.filter(skill => !skillGap.missingSkills.includes(skill)).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="p-4 bg-white/5 rounded-full inline-block mb-4">
                       <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5" />
                       </svg>
                    </div>
                    <p className="text-gray-300 font-medium tracking-wide">No matched skills to assess yet</p>
                    <p className="text-sm font-light mt-1 text-gray-500">Focus on acquiring missing skills first</p>
                  </div>
                )}
              </div>
            </div>

            {/* INDUSTRY BENCHMARK */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.01] p-8 border border-white/5 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium tracking-wide text-zinc-200">Industry Benchmark Comparison</h4>
                    <p className="text-sm text-zinc-500 font-light mt-1">How you stack up against industry standards</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-amber-500/30 transition-colors shadow-sm">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-light text-amber-500 mb-1">{percent}%</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Your Performance</p>
                    <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-zinc-400/30 transition-colors shadow-sm">
                    <div className="w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
                      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-3xl font-light text-zinc-300 mb-1">{benchmark.benchmark}%</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Industry Average</p>
                    <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full" style={{ width: `${benchmark.benchmark}%` }}></div>
                    </div>
                  </div>

                  <div className="text-center p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/20 transition-colors shadow-sm">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <svg className="w-5 h-5 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-light text-zinc-200 mb-1">95%</p>
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Top Performers</p>
                    <div className="mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-zinc-400 to-zinc-200 rounded-full w-[95%]"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl border ${
                        percent >= 95 ? "bg-white/10 border-white/20" :
                        percent >= benchmark.benchmark ? "bg-amber-500/10 border-amber-500/20" : "bg-zinc-800/50 border-zinc-700/50"
                      }`}>
                        {percent >= 95 ? (
                          <svg className="w-5 h-5 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        ) : percent >= benchmark.benchmark ? (
                          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Performance Status</p>
                        <p className={`text-sm font-bold tracking-wide mt-0.5 ${percent >= benchmark.benchmark ? 'text-amber-500' : 'text-zinc-300'}`}>{benchmark.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-zinc-500">Position</p>
                      <p className="text-sm font-medium tracking-wide text-zinc-200 mt-0.5">
                        Top {percent >= 95 ? '5%' : percent >= benchmark.benchmark ? '25%' : '50%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JOB MARKET INSIGHTS */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.01] p-8 border border-white/5 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium tracking-wide text-zinc-200">Job Market Insights</h4>
                    <p className="text-sm text-zinc-500 font-light mt-1">Career opportunities and market alignment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium tracking-wide text-zinc-200">Job Qualification</p>
                        <p className="text-xs text-zinc-500 font-light">Positions you can apply for</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-light text-amber-500 mb-2">{marketInsights.qualifiedJobs}%</p>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${marketInsights.qualifiedJobs}%` }}></div>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Based on your skill match</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 hover:border-zinc-400/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium tracking-wide text-zinc-200">Growth Potential</p>
                        <p className="text-xs text-zinc-500 font-light">Career advancement opportunities</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-light text-zinc-300 mb-2">{Math.round(marketInsights.growthPotential)}%</p>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-full" style={{ width: `${marketInsights.growthPotential}%` }}></div>
                      </div>
                      <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Skills needed for next level</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI RECOMMENDATIONS */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.01] p-8 border border-white/5 transition-all duration-300">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium tracking-wide text-zinc-200">AI-Powered Recommendations</h4>
                    <p className="text-sm text-zinc-500 font-light mt-1">Personalized advice for your career trajectory</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-white/[0.02] rounded-xl p-5 border border-white/5 hover:border-amber-500/20 transition-colors shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-0.5">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-zinc-300 font-light leading-relaxed tracking-wide">{rec}</p>
                      </div>
                    </div>
                  ))}

                  {recommendations.length === 0 && (
                    <div className="text-center py-8 text-zinc-500">
                      <div className="p-4 bg-white/5 rounded-full inline-block mb-4">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-zinc-300 font-medium tracking-wide">Optimization Complete</p>
                      <p className="text-sm font-light mt-1">No specific recommendations needed. Maintain current velocity.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PROGRESS TRACKING */}
            {progressHistory.length > 1 && (
              <div className="relative overflow-hidden rounded-2xl bg-white/[0.01] p-8 border border-white/5 transition-all duration-300">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50">
                      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium tracking-wide text-zinc-200">Progress Velocity</h4>
                      <p className="text-sm text-zinc-500 font-light mt-1">Your improvement trajectory over time</p>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4">
                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-1">Baseline</p>
                        <p className="text-3xl font-light text-zinc-400">{progressHistory[0]?.percentage}%</p>
                      </div>
                      <div className="text-center p-4 border-x border-white/5">
                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-1">Current Level</p>
                        <p className="text-3xl font-light text-amber-500">{progressHistory[progressHistory.length - 1]?.percentage}%</p>
                      </div>
                      <div className="text-center p-4">
                        <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-1">Delta</p>
                        <p className={`text-3xl font-light ${
                          progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage > 0
                            ? 'text-amber-500' : 'text-zinc-500'
                        }`}>
                          {progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage > 0 ? '+' : ''}
                          {progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm px-4">
                      <span className="text-zinc-500 font-medium uppercase tracking-widest text-xs">Timeline:</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-zinc-600 to-amber-500 rounded-full transition-all duration-1000"
                          style={{
                            width: `${(progressHistory[progressHistory.length - 1]?.percentage / 100) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-amber-500 font-medium tracking-wider">
                        {progressHistory.length} Sessions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* CTA */}
      <div 
        ref={roadmapRef}
        className="flex justify-start border-t border-white/10 pt-8 mt-12 pb-8"
      >
        <button
          className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_40px_rgba(251,191,36,0.4)] transition-all hover:-translate-y-1 group flex items-center gap-3"
          onClick={() => (window.location.href = "/roadmap")}
        >
          Get Roadmap
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

    </div>
  );
}
