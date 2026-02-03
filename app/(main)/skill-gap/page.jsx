"use client";

import { useEffect, useState } from "react";
import SkillGapResult from "./components/SkillGapResult";

export default function SkillGapPage() {
  const [loading, setLoading] = useState(true);
  const [skillGap, setSkillGap] = useState(null);
  const [error, setError] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

  useEffect(() => {
    loadSavedAnalyses();
    autoGenerate();
  }, []);

  const loadSavedAnalyses = () => {
    const saved = localStorage.getItem('skillGapAnalyses');
    if (saved) {
      setSavedAnalyses(JSON.parse(saved));
    }
  };

  const saveCurrentAnalysis = () => {
    if (!skillGap) return;

    const analysis = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      skillGap: skillGap,
      targetRole: skillGap.targetRole || 'Unknown Role',
      industry: skillGap.industry || 'Unknown Industry'
    };

    const updated = [analysis, ...savedAnalyses.filter(a => a.id !== currentAnalysisId)];
    setSavedAnalyses(updated);
    setCurrentAnalysisId(analysis.id);
    localStorage.setItem('skillGapAnalyses', JSON.stringify(updated));

    // Show success message
    alert('Analysis saved successfully!');
  };

  const loadAnalysis = (analysisId) => {
    const analysis = savedAnalyses.find(a => a.id === analysisId);
    if (analysis) {
      setSkillGap(analysis.skillGap);
      setCurrentAnalysisId(analysisId);
      setLoading(false);
      setError(null);
    }
  };

  const deleteAnalysis = (analysisId) => {
    const updated = savedAnalyses.filter(a => a.id !== analysisId);
    setSavedAnalyses(updated);
    localStorage.setItem('skillGapAnalyses', JSON.stringify(updated));

    if (currentAnalysisId === analysisId) {
      setCurrentAnalysisId(null);
      setSkillGap(null);
      autoGenerate();
    }
  };

  const exportAnalysis = () => {
    if (!skillGap) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      skillGap: skillGap,
      summary: {
        totalSkills: skillGap.requiredSkills.length,
        matchedSkills: skillGap.requiredSkills.length - skillGap.missingSkills.length,
        missingSkills: skillGap.missingSkills.length,
        matchPercentage: Math.round(((skillGap.requiredSkills.length - skillGap.missingSkills.length) / skillGap.requiredSkills.length) * 100)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-gap-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareAnalysis = async () => {
    if (!skillGap) return;

    const shareData = {
      title: 'My Skill Gap Analysis',
      text: `I have a ${Math.round(((skillGap.requiredSkills.length - skillGap.missingSkills.length) / skillGap.requiredSkills.length) * 100)}% skill match for my target role. Check out my analysis!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Analysis link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert('Analysis link copied to clipboard!');
      } catch (clipboardErr) {
        alert('Sharing not supported. Please copy the URL manually.');
      }
    }
  };

  async function autoGenerate() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/skill-gap/submit", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate skill gap");
      }

      setSkillGap(data.skillGap);
      setCurrentAnalysisId(null);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          Your Skill Gap Analysis
        </h2>

        <div className="flex gap-2">
          <button
            onClick={saveCurrentAnalysis}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
            title="Save this analysis"
          >
            💾 Save
          </button>

          <button
            onClick={exportAnalysis}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors"
            title="Export as JSON"
          >
            📤 Export
          </button>

          <button
            onClick={shareAnalysis}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors"
            title="Share analysis"
          >
            🔗 Share
          </button>

          <button
            onClick={autoGenerate}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors"
            title="Generate new analysis"
          >
            🔄 New
          </button>
        </div>
      </div>

      {/* Saved Analyses */}
      {savedAnalyses.filter(analysis => analysis.targetRole && analysis.targetRole !== 'Unknown Role').length > 0 && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-medium mb-3 text-gray-200">Saved Analyses</h3>
          <div className="flex flex-wrap gap-2">
            {savedAnalyses
              .filter(analysis => analysis.targetRole && analysis.targetRole !== 'Unknown Role')
              .slice(0, 5)
              .map((analysis) => (
                <button
                  key={analysis.id}
                  onClick={() => loadAnalysis(analysis.id)}
                  className={`px-3 py-2 text-sm rounded border transition-colors ${
                    currentAnalysisId === analysis.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                  title={`Load analysis from ${new Date(analysis.timestamp).toLocaleDateString()}`}
                >
                  {analysis.targetRole} ({new Date(analysis.timestamp).toLocaleDateString()})
                </button>
              ))}
            {savedAnalyses.filter(analysis => analysis.targetRole && analysis.targetRole !== 'Unknown Role').length > 5 && (
              <span className="px-3 py-2 text-sm text-gray-500">
                +{savedAnalyses.filter(analysis => analysis.targetRole && analysis.targetRole !== 'Unknown Role').length - 5} more...
              </span>
            )}
          </div>
        </div>
      )}

      <SkillGapResult
        skillGap={skillGap}
        onSave={saveCurrentAnalysis}
        onExport={exportAnalysis}
        onShare={shareAnalysis}
        savedAnalyses={savedAnalyses}
        currentAnalysisId={currentAnalysisId}
      />
    </div>
  );
}
