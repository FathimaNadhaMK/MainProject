"use client";

import { useEffect, useRef, useState } from "react";
import {
  generateNextQuestion,
  generateInterviewFeedback,
} from "../lib/interviewer-ai";
import { fetchInterviewConfig } from "@/actions/interview-session";

export default function InterviewRoom({ sessionId }) {
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const streamRef = useRef(null);

  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [turn, setTurn] = useState(1);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [recruiterName, setRecruiterName] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [microphoneError, setMicrophoneError] = useState(null);
  const [recruiterSpeaking, setRecruiterSpeaking] = useState(false);

  const MAX_TURNS = 6;

  useEffect(() => {
    if (!callStarted) return;
    
    setCurrentQuestion("Please introduce yourself and tell me about your background.");
    // load configuration for optional UI tweaks (e.g. show recruiter name)
    (async () => {
      try {
        const cfg = await fetchInterviewConfig(sessionId);
        if (cfg?.recruiterProfile?.name) {
          setRecruiterName(cfg.recruiterProfile.name);
        }
      } catch (e) {
        console.warn("could not load interview config", e);
      }
    })();
  }, [sessionId, callStarted]);

  async function startCall() {
    try {
      setMicrophoneError(null);
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });
      streamRef.current = stream;

      // Create audio context for audio level monitoring
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyzer = audioContext.createAnalyser();
      analyzerRef.current = analyzer;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Monitor audio levels
      const monitorAudio = () => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 255) * 100));
        if (isRecording) {
          requestAnimationFrame(monitorAudio);
        }
      };

      setCallStarted(true);
      setIsRecording(true);
      mediaRecorder.start();
      monitorAudio();
    } catch (error) {
      console.error("Microphone access denied:", error);
      setMicrophoneError(
        error.name === "NotAllowedError"
          ? "Microphone access denied. Please allow access to continue."
          : "Unable to access microphone. Please check your device."
      );
    }
  }

  function endCall() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setFinished(true);
  }

  function toggleMute() {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  }

  async function submitAnswer(answer) {
    setIsRecording(false);

    const updatedConversation = [
      ...conversation,
      `Interviewer: ${currentQuestion}`,
      `Candidate: ${answer}`,
    ];

    setConversation(updatedConversation);

    if (turn >= MAX_TURNS) {
      setFinished(true);
      const result = await generateInterviewFeedback({
        conversation: updatedConversation,
        sessionId,
      });
      setFeedback(result);
      return;
    }

    const nextTurn = turn + 1;
    setTurn(nextTurn);

    // Simulate recruiter speaking
    setRecruiterSpeaking(true);
    await new Promise((r) => setTimeout(r, 2000));

    const nextQuestionData = await generateNextQuestion({
      sessionId,
      conversation: updatedConversation,
    });

    setCurrentQuestion(nextQuestionData.question);
    setRecruiterSpeaking(false);
    setIsRecording(true);

    // Auto-speak the question
    speak(nextQuestionData.question);
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }

  // Pre-call screen
  if (!callStarted) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ready to Interview?</h1>
            <p className="text-gray-400">{recruiterName || "AI Recruiter"}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
            <div className="space-y-2 text-left">
              <p className="text-sm font-semibold text-gray-300">Before you start:</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>✓ Find a quiet location</li>
                <li>✓ Ensure good lighting</li>
                <li>✓ Allow microphone access</li>
                <li>✓ Test your audio</li>
              </ul>
            </div>
          </div>

          {microphoneError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-300">{microphoneError}</p>
            </div>
          )}

          <button
            onClick={startCall}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // Feedback screen
  if (finished && feedback) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
              <p className="text-gray-400">Here's your feedback</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Overall Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-blue-400">
                  {feedback.score || "6"}/10
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3">Summary</p>
              <p className="text-gray-400">{feedback.summary}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3">Strengths</p>
              <ul className="space-y-2">
                {(feedback.strengths || []).map((s, i) => (
                  <li key={i} className="text-green-400 text-sm">✓ {s}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-3">Areas to Improve</p>
              <ul className="space-y-2">
                {(feedback.areasToImprove || []).map((a, i) => (
                  <li key={i} className="text-yellow-400 text-sm">• {a}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
        <div>
          <p className="text-sm text-gray-400">
            Interview with {recruiterName || "AI Recruiter"}
          </p>
          <p className="text-xs text-gray-500 mt-1">Turn {turn}/{MAX_TURNS}</p>
        </div>
        <div className="text-sm text-gray-400">⏱ {turn * 2} min</div>
      </div>

      {/* Main interview area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* Recruiter card */}
        <div className="max-w-2xl w-full">
          <div className={`bg-gray-800/50 border-2 rounded-xl p-8 transition ${
            recruiterSpeaking ? "border-blue-500 bg-gray-800" : "border-gray-700"
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <p className="font-semibold">{recruiterName || "AI Recruiter"}</p>
                <p className="text-sm text-gray-400">
                  {recruiterSpeaking ? "Speaking..." : "Listening..."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Current Question:</p>
              <p className="text-lg leading-relaxed">{currentQuestion}</p>
            </div>

            {recruiterSpeaking && (
              <div className="mt-4 flex gap-1 justify-center">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, height: `${12 + i * 4}px` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Candidate audio visualizer */}
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-xl">🎤</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-2">Your audio level</p>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 flex justify-center gap-4 border-t border-gray-700">
        <button
          onClick={toggleMute}
          className={`px-6 py-3 rounded-full font-semibold transition ${
            isMuted
              ? "bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600/30"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          {isMuted ? "🔇 Unmute" : "🎤 Mute"}
        </button>

        <button
          onClick={() => {
            const answer = prompt("Describe your response:");
            if (answer) submitAnswer(answer);
          }}
          disabled={recruiterSpeaking}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-semibold transition"
        >
          Submit Answer
        </button>

        <button
          onClick={endCall}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition"
        >
          📞 End Call
        </button>
      </div>
    </div>
  );

}
