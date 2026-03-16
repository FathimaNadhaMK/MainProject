"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRouter } from "next/navigation";
import { createInterviewSession, extractPdfText } from "../_actions/interview-session";
import { getInterviewContext } from "@/actions/user";

// recruiter data will be generated based on onboarding context
import { generateRecruiters } from "@/lib/recruiters";

export default function StartInterviewClient() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // ui state
  const [resumeFile, setResumeFile] = useState(null);
  const [mode, setMode] = useState(null); // "audio" | "video"
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [recruiters, setRecruiters] = useState([]);
  const [duration, setDuration] = useState(300); // default 5 minutes (in seconds)

  /* helpers */
  function handleFile(file) {
    if (file && file.type !== "application/pdf") {
      alert("Only PDF resumes are allowed");
      return;
    }
    setResumeFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    handleFile(file);
  }

  async function startInterview() {
    if (!context || !context.user || !context.user.industry) {
      router.push("/onboarding");
      return;
    }
    setLoading(true);
    try {
      let resumeText = null;
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        resumeText = await extractPdfText(formData);
      }

      const interviewId = await createInterviewSession({
        mode,
        recruiterProfile: selectedRecruiter,
        resumeText,
        duration,
      });
      router.push(`/interview/session/${interviewId}`);
    } catch (err) {
      console.error("startInterview error", err);
      alert(err.message || "Failed to start interview. Please try again.");
      if (err.message && err.message.toLowerCase().includes("onboarding")) {
        router.push("/onboarding");
      }
    } finally {
      setLoading(false);
    }
  }

  /* fetch context once on mount */
  useEffect(() => {
    setContextLoading(true);
    getInterviewContext()
      .then((res) => {
        const ctx = res ? { user: { industry: res.targetField } } : null;
        setContext(ctx);
        if (res) {
          setRecruiters(
            generateRecruiters({
              industry: res.targetField,
              targetRole: res.targetRole,
            })
          );
        }
      })
      .catch((err) => {
        console.error("failed to load interview context", err);
      })
      .finally(() => setContextLoading(false));
  }, []);

  /* render */
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Vibrant Midnight Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/20 blur-[130px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-5xl w-full space-y-12 relative z-10 animate-in fade-in zoom-in-95 duration-1000 py-12">
        {/* Header */}
        <header className="text-center space-y-6">
          <h1 className="text-6xl font-black tracking-tighter text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Career Coach</span> AI
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 text-lg font-medium leading-relaxed">
            Prepare for your dream role with personalized, high-fidelity interview practice.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Resume Upload */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-indigo-500/50" /> 01 Your Resume
                </h3>
                <div
                  onDrop={onDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  className={`relative group border-2 border-dashed rounded-[3rem] p-10 text-center cursor-pointer transition-all duration-700 bg-white/[0.03] backdrop-blur-3xl overflow-hidden ${dragActive
                      ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]"
                      : resumeFile
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange} />
                  <div className="space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-500 ${resumeFile ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-indigo-500"
                      }`}>
                      {resumeFile ? '✓' : '+'}
                    </div>
                    {resumeFile ? (
                      <p className="text-emerald-400 font-bold tracking-tight">{resumeFile.name}</p>
                    ) : (
                      <div>
                        <p className="text-white font-bold text-lg">Upload PDF Resume</p>
                        <p className="text-slate-500 text-xs mt-1">We'll tailor the session to your experience</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Mode Selection */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-indigo-500/50" /> 02 Practice Mode
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "audio", label: "Voice Only", icon: "🎙️" },
                    { key: "video", label: "Video Call", icon: "📹" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setMode(option.key)}
                      className={`relative p-8 rounded-3xl flex flex-col items-center gap-4 transition-all duration-500 border-2 ${mode === option.key
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-[1.05]"
                          : "border-white/5 bg-white/[0.03] hover:border-white/20"
                        }`}
                    >
                      <span className="text-3xl">{option.icon}</span>
                      <p className={`font-black text-sm tracking-widest uppercase ${mode === option.key ? "text-white" : "text-slate-500"}`}>
                        {option.label}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Session Duration Selection */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-indigo-500/50" /> 03 Session Duration
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 120, label: "2m", sub: "Quick" },
                    { key: 300, label: "5m", sub: "Standard" },
                    { key: 600, label: "10m", sub: "Deep" },
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setDuration(option.key)}
                      className={`relative p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-500 border-2 ${duration === option.key
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-[1.05]"
                          : "border-white/5 bg-white/[0.03] hover:border-white/20"
                        }`}
                    >
                      <p className={`font-black text-xl tracking-tighter ${duration === option.key ? "text-white" : "text-slate-500"}`}>
                        {option.label}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{option.sub}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Recruiter Selection */}
            <section className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-3">
                <div className="w-8 h-[1px] bg-indigo-500/50" /> 03 Choose Your Mentor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {contextLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />
                  ))
                ) : (
                  recruiters.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRecruiter(r)}
                      className={`group cursor-pointer relative p-6 rounded-[2rem] transition-all duration-500 border-2 overflow-hidden ${selectedRecruiter?.id === r.id
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.1)] scale-[1.02]"
                          : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:scale-[1.01]"
                        }`}
                    >
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="relative">
                          <img
                            src={r.avatar}
                            alt={r.name}
                            className={`w-14 h-14 rounded-2xl object-cover transition-all duration-700 grayscale ${selectedRecruiter?.id === r.id ? "scale-110 grayscale-0" : "opacity-40 group-hover:grayscale-0 group-hover:opacity-100"
                              }`}
                          />
                          {selectedRecruiter?.id === r.id && (
                            <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-400 animate-pulse pointer-events-none" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-black text-sm tracking-tight truncate ${selectedRecruiter?.id === r.id ? "text-white" : "text-slate-500"}`}>
                            {r.name}
                          </p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate mt-1">
                            {r.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-12 text-center">
          <button
            disabled={!mode || !selectedRecruiter || !resumeFile || loading}
            onClick={startInterview}
            className="group relative inline-flex items-center gap-6 transition-all duration-500 active:scale-[0.98] disabled:opacity-20"
          >
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className={`relative px-12 py-6 rounded-full font-black text-xs uppercase tracking-[0.5em] transition-all duration-500 ${loading ? "bg-slate-800 text-slate-500" : "bg-white text-black hover:bg-indigo-400 hover:text-white"
              }`}>
              {loading ? "Preparing your session..." : "Start Practice"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
