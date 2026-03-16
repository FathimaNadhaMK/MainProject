"use client";

import 'regenerator-runtime/runtime';
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
  generateNextQuestion,
  generateAnswerFeedback,
  generateInterviewFeedback,
} from "../lib/interviewer-ai";
import { fetchInterviewConfig } from "@/actions/interview-session";

export default function InterviewRoom({ sessionId }) {
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

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
  const [mode, setMode] = useState("audio");
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);

  const timeoutRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const MAX_TURNS = 6;

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchInterviewConfig(sessionId);
        if (cfg?.recruiterProfile?.name) {
          setRecruiterName(cfg.recruiterProfile.name);
        }
        if (cfg?.mode) {
          setMode(cfg.mode);
        }
      } catch (e) {
        console.warn("could not load interview config", e);
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (!callStarted) return;

    // First question initialization
    const initInterview = async () => {
      setRecruiterSpeaking(true);
      setCurrentQuestion("Processing resume details...");
      try {
        const initialMsg = await generateNextQuestion({
          sessionId,
          conversation: [],
        });
        setCurrentQuestion(initialMsg.question);
        speak(initialMsg.question);
      } catch (err) {
        setCurrentQuestion("Please introduce yourself and tell me about your background.");
        speak("Please introduce yourself and tell me about your background.");
      }
      setRecruiterSpeaking(false);

      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.startListening({ continuous: true });
      }
    };

    initInterview();
  }, [callStarted]);

  // Duplex VAD and Manual Detection
  useEffect(() => {
    if (transcript.trim().length > 5 && recruiterSpeaking) {
      // VAD Interruption: User started talking, cut off the AI immediately
      window.speechSynthesis.cancel();
      setRecruiterSpeaking(false);
    }

    if (transcript.trim()) {
      setIsUserTalking(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Removed 4-second auto-submit. Waiting for manual submit click.
    } else {
      setIsUserTalking(false);
    }
  }, [transcript]);

  // Watchdog: Force SpeechRecognition to stay alive during the user's turn. 
  useEffect(() => {
    if (callStarted && !recruiterSpeaking && !isWaitingForNext && !isMuted) {
      if (!listening && browserSupportsSpeechRecognition) {
        try {
          SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        } catch (err) {
          console.warn("Speech recognition restart ignored", err);
        }
      }
    }
  }, [listening, callStarted, recruiterSpeaking, isWaitingForNext, isMuted, browserSupportsSpeechRecognition]);

  async function startCall() {
    try {
      setMicrophoneError(null);

      // Ensure we have latest mode from DB if state hasn't updated
      let currentMode = mode;
      try {
        const cfg = await fetchInterviewConfig(sessionId);
        if (cfg?.mode) currentMode = cfg.mode;
      } catch (e) {
        console.warn("Could not double-check mode", e);
      }

      // Request microphone and video access
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
          },
          video: currentMode === "video" ? { facingMode: "user" } : false,
        });
      } catch (err) {
        if (currentMode === "video") {
          console.warn("Video access failed, falling back to audio only", err);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: false,
            },
            video: false,
          });
        } else {
          throw err;
        }
      }
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
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
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
    if (!isMuted) {
      SpeechRecognition.stopListening();
    } else if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  }

  async function submitAnswer(answer) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRecording(false);
    setIsUserTalking(false);

    const updatedConversation = [
      ...conversation,
      `Interviewer: ${currentQuestion}`,
      `Candidate: ${answer}`,
    ];

    setConversation(updatedConversation);
    setRecruiterSpeaking(true);

    // Multimodal Vision capture
    let imageBase64 = null;
    if (mode === "video" && videoRef.current) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        imageBase64 = canvas.toDataURL("image/jpeg").split(',')[1];
      } catch (e) { console.error("Could not capture frame", e); }
    }

    try {
      const { feedback } = await generateAnswerFeedback({
        sessionId,
        conversation: updatedConversation,
        imageBase64
      });

      speak(feedback);
    } catch (err) {
      console.error(err);
      speak("Got it! Thanks for sharing.");
    }

    setRecruiterSpeaking(false);
    setIsWaitingForNext(true);
  }

  async function handleNextQuestion() {
    if (turn >= MAX_TURNS) {
      setFinished(true);
      const result = await generateInterviewFeedback({
        conversation,
        sessionId,
      });
      setFeedback(result);
      return;
    }

    const nextTurn = turn + 1;
    setTurn(nextTurn);
    setRecruiterSpeaking(true);
    setIsWaitingForNext(false);

    try {
      const nextQuestionData = await generateNextQuestion({
        sessionId,
        conversation,
      });

      setCurrentQuestion(nextQuestionData.question);
      speak(nextQuestionData.question);
    } catch (err) {
      console.error(err);
      setCurrentQuestion("Could you elaborate on that?");
      speak("Could you elaborate on that?");
    }

    setRecruiterSpeaking(false);
    setIsRecording(true);
    if (browserSupportsSpeechRecognition && !isMuted) {
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    }
  }

  function speak(text) {
    window.speechSynthesis.cancel(); // ensure no overlap
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.lang = "en-US";

    utterance.onstart = () => setRecruiterSpeaking(true);
    utterance.onend = () => setRecruiterSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  // Pre-call screen
  if (!callStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
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
                <li>✓ Allow {mode === "video" ? "camera and microphone" : "microphone"} access</li>
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
            disabled={!recruiterName}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-wait"
          >
            {recruiterName ? "Start Interview" : "Loading Session..."}
          </button>
        </div>
      </div>
    );
  }

  // Feedback screen
  if (finished && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
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
          <div className={`bg-gray-800/50 border-2 rounded-xl p-8 transition ${recruiterSpeaking ? "border-blue-500 bg-gray-800" : "border-gray-700"
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

        {/* Candidate audio/video visualizer */}
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            {mode === "video" && (
              <div className="mb-4 w-full aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 relative">
                <video
                  ref={(element) => {
                    videoRef.current = element;
                    if (element && streamRef.current && !element.srcObject) {
                      element.srcObject = streamRef.current;
                      element.onloadedmetadata = () => {
                        element.play().catch(e => console.error("video play root err", e));
                      }
                    }
                  }}
                  muted
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
            )}
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
      <div className="p-6 flex flex-col justify-center items-center gap-4 border-t border-gray-700">
        <div className={`w-full max-w-2xl bg-gray-900 border transition-all duration-300 rounded-lg p-4 min-h-[80px] ${isUserTalking ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "border-gray-700"
          }`}>
          <div className="text-gray-300">
            {isMicrophoneAvailable === false && (
              <span className="text-red-400 font-bold mr-2 block mb-2">
                🚫 OS Microphone access blocked or unavailable!
              </span>
            )}
            {listening && !isUserTalking && !recruiterSpeaking && (
              <span className="text-green-400 font-bold animate-pulse mr-2 block mb-2">
                ● Auto-Listening to your voice...
              </span>
            )}
            {recruiterSpeaking && (
              <span className="text-blue-400 font-bold animate-pulse mr-2 block mb-2">
                AI is speaking...
              </span>
            )}
            {!listening && !recruiterSpeaking && !isWaitingForNext && browserSupportsSpeechRecognition && (
              <button
                onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-US' })}
                className="text-yellow-400 font-bold hover:underline mr-2 mb-2 block animate-pulse bg-yellow-900/30 px-3 py-1 rounded"
              >
                ⚠️ Browser suspended microphone. Click here to force resume!
              </button>
            )}
            {transcript || (
              <span className="text-gray-600 italic block">
                {browserSupportsSpeechRecognition
                  ? "Speak naturally. Your transcription will appear here..."
                  : "Speech recognition is not supported in this browser."}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4 w-full max-w-2xl justify-center">
          <button
            onClick={toggleMute}
            className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isMuted
              ? "bg-red-600/20 border border-red-600 text-red-500 hover:bg-red-600/30"
              : "bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white"
              }`}
          >
            {isMuted ? "🔇 Unmuted (Paused)" : "🎤 Mute Microphone"}
          </button>

          {!isWaitingForNext ? (
            <button
              onClick={() => {
                const finalAnswer = transcript.trim();
                if (finalAnswer) {
                  resetTranscript();
                  submitAnswer(finalAnswer);
                } else {
                  alert("No speech detected. Please speak your answer into the microphone.");
                }
              }}
              disabled={recruiterSpeaking}
              className={`flex-1 py-4 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 ${transcript.trim()
                ? "bg-green-600 hover:bg-green-700 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                : "bg-gray-600 hover:bg-gray-700"
                }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={recruiterSpeaking}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              Next Question
            </button>
          )}

          <button
            onClick={endCall}
            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2"
          >
            📞 End Interview
          </button>
        </div>
      </div>
    </div >
  );

}
