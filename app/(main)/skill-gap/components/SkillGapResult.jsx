"use client";

import { useState, useEffect, useMemo } from "react";
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
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer rounded-lg p-4 border transition-all duration-200 ${
        type === 'matched'
          ? 'bg-green-900/20 border-green-500/30 hover:border-green-400/50 hover:bg-green-900/30'
          : 'bg-red-900/20 border-red-500/30 hover:border-red-400/50 hover:bg-red-900/30'
      }`}
      onClick={() => onClick(skill)}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{skill}</span>
        <div className="flex items-center gap-2">
          {type === 'matched' && <CheckCircle className="w-4 h-4 text-green-400" />}
          {type === 'missing' && <XCircle className="w-4 h-4 text-red-400" />}
        </div>
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
        className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50 hover:border-blue-400/50 transition-all duration-200 hover:bg-gray-800/70"
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
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value || 1) * 20}%, #374151 ${(value || 1) * 20}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-10">

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
        className="rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 border border-blue-700/30"
      >
        <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
        <p className="text-gray-300">{skillGap.summary}</p>
      </motion.div>

      {/* SCORE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gray-900 p-6 border border-gray-700 text-center"
        >
          <p className="text-sm text-gray-400">Skill Match</p>
          <p className="text-4xl font-bold text-green-400 mt-2">
            <AnimatedCounter value={percent} />
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Industry Benchmark: <span className={benchmark.color}>{benchmark.status}</span>
          </p>
        </motion.div>

        <div className="md:col-span-2 rounded-xl bg-gray-900 p-6 border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">
            Coverage Progress
          </p>
          <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {matched} of {total} skills matched
          </p>
          {progressHistory.length > 1 && (
            <p className="text-xs text-blue-400 mt-1">
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
          className="rounded-xl bg-gray-900 p-6 border border-gray-700"
        >
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
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={activeIndex === index ? COLORS[index] + '80' : COLORS[index]}
                      stroke={activeIndex === index ? COLORS[index] : 'none'}
                      strokeWidth={activeIndex === index ? 2 : 0}
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
                          className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg"
                        >
                          <p className="text-white font-medium">{data.name}</p>
                          <p className="text-gray-300">{data.value} skills ({((data.value/total)*100).toFixed(1)}%)</p>
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
          className="rounded-xl bg-gray-900 p-6 border border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-red-400">
            Missing Skills ({skillGap.missingSkills.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {skillGap.missingSkills.map((skill, index) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg bg-red-900/30 px-4 py-2 border border-red-700/30 text-red-300 hover:bg-red-900/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedSkill(skill)}
                >
                  {skill}
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
        className="rounded-xl bg-gray-900 p-6 border border-gray-700"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold">
            Required Industry Skills ({skillGap.requiredSkills.length})
          </h3>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  filterType === 'all'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('matched')}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  filterType === 'matched'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Matched
              </button>
              <button
                onClick={() => setFilterType('missing')}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  filterType === 'missing'
                    ? 'bg-red-600 border-red-500 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Missing
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
          className="rounded-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6 border border-yellow-500/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-yellow-300">Achievements</h3>
            <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs border border-yellow-500/30">
              {achievements.length} unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  achievement.earned
                    ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-200'
                    : 'bg-gray-800/50 border-gray-600 text-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs opacity-75 mt-1">{achievement.description}</div>
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
          className="rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-300">Smart Suggestions</h3>
            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs border border-blue-500/30">
              {suggestions.length} recommendations
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className={`p-4 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer ${
                  suggestion.priority === 'high'
                    ? 'bg-red-900/20 border-red-500/30 hover:border-red-400/50'
                    : 'bg-blue-900/20 border-blue-500/30 hover:border-blue-400/50'
                }`}
                onClick={suggestion.action}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    suggestion.priority === 'high'
                      ? 'bg-red-500/20 border border-red-400/30'
                      : 'bg-blue-500/20 border border-blue-400/30'
                  }`}>
                    <span className="text-lg">{suggestion.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{suggestion.title}</h4>
                    <p className="text-sm text-gray-300">{suggestion.description}</p>
                  </div>
                  <Target className={`w-5 h-5 ${
                    suggestion.priority === 'high' ? 'text-red-400' : 'text-blue-400'
                  }`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ADVANCED FEATURES TOGGLE */}
      <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 border border-gray-700 shadow-lg">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-left flex justify-between items-center text-lg font-semibold hover:text-blue-400 transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 group-hover:border-blue-400/50 transition-colors">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span>Advanced Analysis Features</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded-full border border-gray-600">
              {Object.keys(skillConfidence).length > 0 ? 'Active' : 'Explore'}
            </span>
            <span className={`text-2xl transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>{showAdvanced ? '−' : '+'}</span>
          </div>
        </button>

        {showAdvanced && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-500">

            {/* SKILL CONFIDENCE ASSESSMENT */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-6 border border-blue-500/30 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-300">Skill Confidence Assessment</h4>
                    <p className="text-sm text-blue-200/70">Rate your mastery level in existing skills</p>
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
                  <div className="text-center py-6 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.98-5.5-2.5" />
                    </svg>
                    <p>No matched skills to assess yet</p>
                    <p className="text-sm">Focus on acquiring missing skills first</p>
                  </div>
                )}
              </div>
            </div>

            {/* INDUSTRY BENCHMARK */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 border border-purple-500/30 shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-400/30">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-purple-300">Industry Benchmark Comparison</h4>
                    <p className="text-sm text-purple-200/70">How you stack up against industry standards</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-colors">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-400/30">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-green-400 mb-1">{percent}%</p>
                    <p className="text-sm text-green-200/80 font-medium">Your Performance</p>
                    <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-colors">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-400/30">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-blue-400 mb-1">{benchmark.benchmark}%</p>
                    <p className="text-sm text-blue-200/80 font-medium">Industry Average</p>
                    <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${benchmark.benchmark}%` }}></div>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-400/30">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p className="text-3xl font-bold text-purple-400 mb-1">95%</p>
                    <p className="text-sm text-purple-200/80 font-medium">Top Performers</p>
                    <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full w-[95%]"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-gray-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${
                        percent >= 95 ? "bg-purple-500/20 border-purple-400/30" :
                        percent >= benchmark.benchmark ? "bg-blue-500/20 border-blue-400/30" : "bg-green-500/20 border-green-400/30"
                      }`}>
                        {percent >= 95 ? (
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        ) : percent >= benchmark.benchmark ? (
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-200">Performance Status</p>
                        <p className={`text-sm font-bold ${benchmark.color}`}>{benchmark.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Position</p>
                      <p className="text-sm font-bold text-gray-200">
                        Top {percent >= 95 ? '5%' : percent >= benchmark.benchmark ? '25%' : '50%'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JOB MARKET INSIGHTS */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 p-6 border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-cyan-300">Job Market Insights</h4>
                    <p className="text-sm text-cyan-200/70">Career opportunities and market alignment</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-5 border border-cyan-500/30 hover:border-cyan-400/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cyan-200">Job Qualification</p>
                        <p className="text-xs text-cyan-200/70">Positions you can apply for</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-cyan-400 mb-2">{marketInsights.qualifiedJobs}%</p>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: `${marketInsights.qualifiedJobs}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400">Based on your skill match</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-5 border border-orange-500/30 hover:border-orange-400/50 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-400/30">
                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-orange-200">Growth Potential</p>
                        <p className="text-xs text-orange-200/70">Career advancement opportunities</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-400 mb-2">{Math.round(marketInsights.growthPotential)}%</p>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: `${marketInsights.growthPotential}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-400">Skills needed for next level</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI RECOMMENDATIONS */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6 border border-yellow-500/30 shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-yellow-300">AI-Powered Recommendations</h4>
                    <p className="text-sm text-yellow-200/70">Personalized advice for your career growth</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-yellow-500/20 rounded-full border border-yellow-400/30 mt-0.5">
                          <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-200 leading-relaxed">{rec}</p>
                      </div>
                    </div>
                  ))}

                  {recommendations.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p>Great job! No specific recommendations needed.</p>
                      <p className="text-sm">Continue building on your current strengths.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PROGRESS TRACKING */}
            {progressHistory.length > 1 && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 border border-green-500/30 shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg border border-green-400/30">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-green-300">Progress Tracking</h4>
                      <p className="text-sm text-green-200/70">Your improvement journey over time</p>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-5 border border-green-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Started With</p>
                        <p className="text-2xl font-bold text-green-400">{progressHistory[0]?.percentage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Current Level</p>
                        <p className="text-2xl font-bold text-green-400">{progressHistory[progressHistory.length - 1]?.percentage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Improvement</p>
                        <p className={`text-2xl font-bold ${
                          progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage > 0
                            ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage > 0 ? '+' : ''}
                          {progressHistory[progressHistory.length - 1]?.percentage - progressHistory[0]?.percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-300">Journey:</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                          style={{
                            width: `${(progressHistory[progressHistory.length - 1]?.percentage / 100) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-green-400 font-semibold">
                        {progressHistory.length} sessions
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
