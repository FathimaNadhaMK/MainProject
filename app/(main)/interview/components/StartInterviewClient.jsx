"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createInterviewSession } from "@/actions/interview-session";
import { getInterviewContext } from "@/actions/user";

// recruiter data will be generated based on onboarding context
import { generateRecruiters } from "@/lib/recruiters";

// initially no recruiters until context is fetched


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
  const [contextError, setContextError] = useState(null);
  const [recruiters, setRecruiters] = useState([]);

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
      // ensure onboarding
      router.push("/onboarding");
      return;
    }
    setLoading(true);
    try {
      const interviewId = await createInterviewSession({
        mode,
        recruiterProfile: selectedRecruiter,
      });
      router.push(`/interview/session/${interviewId}`);
    } catch (err) {
      console.error("startInterview error", err);
      alert(err.message || "Failed to start interview. Please try again.");
      // if user needs onboarding, send them there
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
        // once we know the user's field/role, generate recruiters
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
        setContextError(err);
      })
      .finally(() => setContextLoading(false));
  }, []);

  /* render */
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-12">
        {/* header */}
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-white">
            AI Mock Interview
          </h1>
          <p className="mt-2 text-gray-300">
            Personalized questions based on your resume, goals and skills.
            Choose your setup below to begin.
          </p>
        </header>

        {/* resume upload */}
        <section>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resume <span className="text-gray-500">(Optional)</span>
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Upload your resume to get more personalized questions. If you don't have one uploaded,
            <a href="/dashboard" className="text-blue-400 hover:text-blue-300 ml-1">manage it here</a>.
          </p>
          <div
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
              dragActive ? "border-blue-400 bg-blue-800" : "border-gray-700 bg-gray-800"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onFileChange}
            />
            {resumeFile ? (
              <p className="text-gray-200">{resumeFile.name}</p>
            ) : (
              <p className="text-gray-400">
                Drag & drop a PDF or click to browse
              </p>
            )}
          </div>
        </section>

        {/* interview mode */}
        <section>
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            Select Interview Mode
          </h2>
          <div className="flex gap-6">
            {[
              { key: "audio", label: "Audio Interview", icon: "🎧" },
              { key: "video", label: "Video Interview", icon: "🎥" },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setMode(option.key)}
                className={`flex-1 border rounded-lg p-6 flex flex-col items-center gap-2 transition shadow-sm hover:shadow-md focus:outline-none ${
                  mode === option.key
                    ? "border-blue-500 bg-blue-800"
                    : "border-gray-700 bg-gray-800"
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className="text-gray-200 font-semibold">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* recruiter selection */}
        <section>
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            Choose AI Recruiter
          </h2>
          {context && context.user && context.user.industry && (
            <p className="text-gray-400 mb-2">Field: {context.user.industry}</p>
          )}
          {contextLoading ? (
            <p className="text-gray-400">Loading recruiters...</p>
          ) : contextError ? (
            <p className="text-red-400">Failed to load context</p>
          ) : (
            (() => {
              if (recruiters.length === 0) {
                return (
                  <p className="text-gray-400">
                    No recruiters available for your field yet.
                  </p>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recruiters.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRecruiter(r)}
                      className={`cursor-pointer border rounded-lg p-4 flex items-center gap-4 transition shadow-sm hover:shadow-md ${
                        selectedRecruiter?.id === r.id
                          ? "border-blue-500 bg-blue-800 ring-2 ring-blue-300"
                          : "border-gray-700 bg-gray-800"
                      }`}
                    >
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-200">{r.name}</p>
                        <p className="text-sm text-gray-400">
                          {r.role} • {r.companyType}
                        </p>
                        <p className="text-xs text-gray-500 italic">
                          {r.tone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </section>

        {/* start button */}
        <div className="flex justify-end">
          <button
            disabled={!mode || !selectedRecruiter || loading}
            onClick={startInterview}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Starting…" : "Start Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
