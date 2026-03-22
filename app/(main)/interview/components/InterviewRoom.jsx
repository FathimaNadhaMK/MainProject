"use client";

import 'regenerator-runtime/runtime';
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import {
  generateNextQuestion,
  generateInterviewFeedback,
} from "../lib/interviewer-ai";
import { fetchInterviewConfig } from "../_actions/interview-session";

const recruiters = [
  { name: "Sarah Miller", avatar: "/recruiters/sarah_miller.jpg", role: "Technical Recruiter" },
  { name: "Jason Chen", avatar: "/recruiters/jason_chen.jpg", role: "Engineering Manager" },
  { name: "Elena Rodriguez", avatar: "/recruiters/elena_rodriguez.jpg", role: "Senior Director" }
];

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
  const [callDuration, setCallDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const isProcessingRef = useRef(false);
  const [isProcessingUI, setIsProcessingUI] = useState(false);
  const lastInteractionRef = useRef(Date.now());
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const MAX_TURNS = 15; // Increased to allow duration to be the primary limit
  const SILENCE_THRESHOLD = 800;

  useEffect(() => {
    let interval;
    if (callStarted && !finished && timeLeft > 0) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && callStarted && !finished) {
      endCall();
    }
    return () => clearInterval(interval);
  }, [callStarted, finished, timeLeft]);

  useEffect(() => {
    if (!callStarted || finished) return;
    if (!listening && !recruiterSpeaking) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [callStarted, listening, recruiterSpeaking, finished]);

  useEffect(() => {
    // Aggressive Interruption: If user speaks clearly while AI is talking, stop AI.
    if (callStarted && recruiterSpeaking && audioLevel > 15) {
      window.speechSynthesis.cancel();
      setRecruiterSpeaking(false);
      resetTranscript();
      // Keep previous question context so user can continue answering
    }
  }, [audioLevel, recruiterSpeaking, callStarted]);

  useEffect(() => {
    if (!callStarted || finished || recruiterSpeaking || isProcessingRef.current) {
      lastInteractionRef.current = Date.now();
      return;
    }
    
    if (audioLevel > 5) {
      lastInteractionRef.current = Date.now();
    } else {
      // If silence > 1.5s and transcript exists, auto-submit
      if (Date.now() - lastInteractionRef.current >= 1500) {
        const finalAnswer = transcript.trim();
        if (finalAnswer.length > 5) {
          lastInteractionRef.current = Date.now();
          submitAnswer(finalAnswer);
        }
      }
    }
  }, [audioLevel, transcript, recruiterSpeaking, callStarted, finished]);

  const [recruiterGender, setRecruiterGender] = useState("male");

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchInterviewConfig(sessionId);
        if (cfg?.recruiterProfile?.name) setRecruiterName(cfg.recruiterProfile.name);
        if (cfg?.recruiterProfile?.gender) setRecruiterGender(cfg.recruiterProfile.gender);
        if (cfg?.mode) setMode(cfg.mode);
        if (cfg?.config?.duration) setTimeLeft(cfg.config.duration);
      } catch (e) {
        console.warn("could not load interview config", e);
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (!callStarted) return;
    const initialQuestion = "Hello Fathima, are you ready? Let's start. Please introduce yourself and tell me about your background.";
    setCurrentQuestion(initialQuestion);
    speak(initialQuestion);
  }, [callStarted]);

  async function startCall() {
    try {
      setMicrophoneError(null);
      let currentMode = mode;
      try {
        const cfg = await fetchInterviewConfig(sessionId);
        if (cfg?.mode) currentMode = cfg.mode;
        if (cfg?.recruiterProfile?.gender) setRecruiterGender(cfg.recruiterProfile.gender);
      } catch (e) { console.warn(e); }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: currentMode === "video" ? { facingMode: "user" } : false,
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyzer = audioContext.createAnalyser();
      analyzerRef.current = analyzer;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const monitorAudio = () => {
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 255) * 100));
        requestAnimationFrame(monitorAudio);
      };

      setCallStarted(true);
      setIsRecording(true);
      mediaRecorder.start();
      monitorAudio();

      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.startListening({ continuous: true });
      }
    } catch (error) {
      setMicrophoneError("Microphone access denied or device not found.");
    }
  }

  async function endCall() {
    window.speechSynthesis.cancel();
    SpeechRecognition.stopListening();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioContextRef.current && audioContextRef.current.state !== "closed") audioContextRef.current.close();
    setFinished(true);

    if (!feedback) {
      try {
        const result = await generateInterviewFeedback({ conversation, sessionId });
        setFeedback(result);
      } catch (error) { console.error(error); }
    }
  }

  function toggleMute() {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => { track.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  }

  function playFillerSound() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const fillers = ["Hmm...", "Right...", "Okay...", "Let me think...", "I see."];
    const filler = fillers[Math.floor(Math.random() * fillers.length)];
    speakSingleUtterance(filler);
  }

  async function submitAnswer(answer) {
    if (!answer || answer.length < 3 || isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessingUI(true);
    
    // Immediately clear transcript and show thinking state
    resetTranscript();
    setRecruiterSpeaking(true);
    playFillerSound();

    const updatedConversation = [...conversation, `Interviewer: ${currentQuestion}`, `Candidate: ${answer}`];
    setConversation(updatedConversation);

    if (turn >= MAX_TURNS) {
      setFinished(true);
      const result = await generateInterviewFeedback({ conversation: updatedConversation, sessionId });
      setFeedback(result);
      return;
    }

    setTurn(prev => prev + 1);
    setCurrentQuestion(""); // Reset for new stream

    try {
      const response = await fetch('/api/interview/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conversation: updatedConversation,
          timeRemaining: timeLeft
        })
      });

      if (!response.ok) throw new Error("Streaming failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let sentenceBuffer = "";

      // Function to process and speak sentences as they come
      const processSentences = (text, isFinal = false) => {
        sentenceBuffer += text;
        const parts = sentenceBuffer.split(/([.?!,])\s*/);

        while (parts.length > 2 || (isFinal && parts.length > 0)) {
          let sentence = parts.shift();
          if (parts.length > 0 && parts[0].match(/[.?!,]/)) {
            sentence += parts.shift();
          }
          if (sentence.trim()) {
            speakSentence(sentence.trim());
          }
        }
        sentenceBuffer = parts.join("");
      };

      const speechQueue = [];
      let isActuallySpeaking = false;

      const speakSentence = (text) => {
        speechQueue.push(text);
        if (!isActuallySpeaking) processSpeechQueue();
      };

      const processSpeechQueue = async () => {
        if (speechQueue.length === 0) {
          isActuallySpeaking = false;
          isProcessingRef.current = false; // Allow next loop
          setIsProcessingUI(false);
          setRecruiterSpeaking(false);
          return;
        }
        isActuallySpeaking = true;
        const text = speechQueue.shift();
        await speakSingleUtterance(text);
        processSpeechQueue();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          processSentences("", true);
          if (speechQueue.length === 0 && !isActuallySpeaking) {
            isProcessingRef.current = false;
            setIsProcessingUI(false);
            setRecruiterSpeaking(false);
          }
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setCurrentQuestion(fullContent);
        processSentences(chunk);
      }
    } catch (err) {
      console.error("Streaming error:", err);
      isProcessingRef.current = false;
      setIsProcessingUI(false);
    }
  }

  // Refined speech helper for streaming sentences
  function speakSingleUtterance(text) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const simpleName = recruiterName?.split('(')[0].trim() || "Coach";

      let matchingVoices = voices.filter(v => {
        if (!v.lang.startsWith('en')) return false;
        const name = v.name.toLowerCase();
        const isFemale = name.includes('female') || name.match(/zira|priya|samantha|jenny|hazel|heera|veena|aria|natasha/);
        const isMale = name.includes('male') || name.match(/david|ravi|mark|guy|george|brian|prabhat/);
        if (recruiterGender === 'female') return isFemale;
        return isMale || (!isFemale && !name.includes('female'));
      });

      if (matchingVoices.length === 0) {
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        const half = Math.max(1, Math.floor(enVoices.length / 2));
        matchingVoices = recruiterGender === 'female' ? enVoices.slice(0, half) : enVoices.slice(half);
        if (matchingVoices.length === 0) matchingVoices = enVoices;
      }

      const nameHash = simpleName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      if (matchingVoices.length > 0) utterance.voice = matchingVoices[nameHash % matchingVoices.length];

      const pitchVar = (nameHash % 5) * 0.04;
      const rateVar = ((nameHash * 2) % 5) * 0.02;

      utterance.pitch = (recruiterGender === 'female' ? 1.0 : 0.9) + pitchVar + (Math.random() * 0.04);
      utterance.rate = 0.92 + rateVar + (Math.random() * 0.04);

      utterance.onstart = () => setRecruiterSpeaking(true);
      utterance.onerror = () => {
        setTimeout(resolve, 200);
      };
      utterance.onend = () => {
        setTimeout(resolve, 200); // BREATH
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  function speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Split into sentences for natural rhythm
    const sentences = text.match(/[^.?!]+[.?!]?/g) || [text];
    let index = 0;

    function speakNext() {
      if (index >= sentences.length) {
        setRecruiterSpeaking(false);
        return;
      }

      const sentence = sentences[index].trim();
      if (!sentence) {
        index++;
        speakNext();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      const voices = window.speechSynthesis.getVoices();
      const simpleName = recruiterName?.split('(')[0].trim() || "Coach";

      let matchingVoices = voices.filter(v => {
        if (!v.lang.startsWith('en')) return false;
        const name = v.name.toLowerCase();
        const isFemale = name.includes('female') || name.match(/zira|priya|samantha|jenny|hazel|heera|veena|aria|natasha/);
        const isMale = name.includes('male') || name.match(/david|ravi|mark|guy|george|brian|prabhat/);
        if (recruiterGender === 'female') return isFemale;
        return isMale || (!isFemale && !name.includes('female'));
      });

      if (matchingVoices.length === 0) {
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        const half = Math.max(1, Math.floor(enVoices.length / 2));
        matchingVoices = recruiterGender === 'female' ? enVoices.slice(0, half) : enVoices.slice(half);
        if (matchingVoices.length === 0) matchingVoices = enVoices;
      }

      const nameHash = simpleName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      if (matchingVoices.length > 0) utterance.voice = matchingVoices[nameHash % matchingVoices.length];

      const pitchVar = (nameHash % 5) * 0.04;
      const rateVar = ((nameHash * 2) % 5) * 0.02;

      utterance.pitch = (recruiterGender === 'female' ? 1.0 : 0.9) + pitchVar + (Math.random() * 0.04);
      utterance.rate = 0.92 + rateVar + (Math.random() * 0.04);

      utterance.onstart = () => setRecruiterSpeaking(true);
      utterance.onerror = () => {
        index++;
        setTimeout(speakNext, 200 + Math.random() * 100);
      };
      utterance.onend = () => {
        index++;
        setTimeout(speakNext, 200 + Math.random() * 100);
      };

      window.speechSynthesis.speak(utterance);
    }

    speakNext();
  }

  // Pre-call screen
  if (!callStarted) {
    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="max-w-md w-full text-center space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
              Ready to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Start?</span>
            </h1>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Mentor: {recruiterName || "AI COACH"}</p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-10 space-y-8 shadow-2xl overflow-hidden relative group transition-all duration-700 hover:border-white/20">
            <div className="space-y-6 text-left">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Session Details</p>
              <ul className="space-y-6">
                {[
                  { icon: "🎙️", text: "Vocal Practice", sub: "Natural conversation flow" },
                  { icon: "⚡", text: "Expert Coaching", sub: "Real-time AI guidance" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-5 items-start">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-lg border border-white/10">{item.icon}</span>
                    <div>
                      <p className="text-sm font-black text-slate-200 tracking-tight leading-none uppercase">{item.text}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {microphoneError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center justify-center gap-2">{microphoneError}</p>
            </div>
          )}
          <button onClick={startCall} disabled={!recruiterName} className="w-full relative group transition-all duration-500 active:scale-[0.98] disabled:opacity-20">
            <div className="absolute inset-0 bg-indigo-600 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-white text-black font-black text-xs uppercase tracking-[0.5em] py-6 px-8 rounded-full flex items-center justify-center gap-4 transition-all group-hover:bg-indigo-400 group-hover:text-white">
              {recruiterName ? "Start Practice" : "Connecting..."}
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Feedback screen
  if (finished) {
    if (!feedback) {
      return (
        <div className="min-h-screen bg-[#050505] text-slate-200 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-1000 font-sans">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-20 h-20 border-t-4 border-indigo-500 rounded-full animate-spin shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-xl font-black tracking-[0.5em] uppercase text-white">Reviewing Session</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">Analyzing results...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="max-w-4xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-1000 py-12">
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-16 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="text-center space-y-5">
              <h2 className="text-6xl font-black tracking-tighter text-white">Session <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Results</span></h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">MENTOR: {recruiterName}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 md:col-span-2 bg-white/5 rounded-3xl p-12 border border-white/10 flex flex-col items-center justify-center space-y-4 hover:bg-white/[0.08] transition-all">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Overall Score</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-[120px] font-black text-white leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">{feedback.overallScore || feedback.score || "6"}</span>
                  <span className="text-3xl font-black text-slate-700">/10</span>
                </div>
              </div>
              <div className={`col-span-1 border-2 rounded-3xl p-10 flex flex-col items-center justify-center space-y-6 transition-all ${feedback.hiringVerdict === 'Hired' ? "border-emerald-500/50 bg-emerald-500/10" : feedback.hiringVerdict === 'Waitlisted' ? "border-amber-500/50 bg-amber-500/10" : "border-rose-500/50 bg-rose-500/10"}`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Decision</p>
                <p className={`text-4xl font-black uppercase tracking-tight ${feedback.hiringVerdict === 'Hired' ? "text-emerald-400" : feedback.hiringVerdict === 'Waitlisted' ? "text-amber-400" : "text-rose-400"}`}>{feedback.hiringVerdict || "PENDING"}</p>
                {feedback.verdictReasoning && <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed uppercase tracking-widest">{feedback.verdictReasoning}</p>}
              </div>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Vibe / Tone", value: feedback.toneAnalysis, icon: "🎯" },
                  { label: "Confidence", value: feedback.confidenceLevel, icon: "💎" },
                  { label: "Clarity", value: feedback.englishProficiency, icon: "🗣️" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-3 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{item.label}</p>
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest leading-relaxed">{item.value || "..."}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-2xl p-8 border border-white/5 text-center">
                <p className="text-slate-300 leading-relaxed text-sm font-medium italic uppercase tracking-wider">"{feedback.summary}"</p>
              </div>
            </div>
            <button onClick={() => (window.location.href = "/interview/start")} className="w-full relative group transition-all duration-500 active:scale-[0.98]">
              <div className="absolute inset-0 bg-indigo-600 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-white text-black font-black text-xs uppercase tracking-[0.5em] py-6 px-10 rounded-full flex items-center justify-center gap-4 transition-all group-hover:bg-indigo-400 group-hover:text-white">Start New Practice</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-300 flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-all duration-1000 blur-[130px] pointer-events-none opacity-30 ${recruiterSpeaking ? 'bg-indigo-600/30 scale-125' : 'bg-indigo-900/10 scale-100'}`} />

      {/* Header Bar */}
      <div className="flex justify-between items-center px-8 py-6 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <span className="text-indigo-400 text-sm font-bold">AI</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">{recruiterName || "Interviewer"}</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{mode === "video" ? "Video Practice Session" : "Voice Practice Session"}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${timeLeft < 60 ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-white/10 bg-white/5 text-slate-300"}`}>
          <div className={`w-2 h-2 rounded-full ${timeLeft < 60 ? "bg-rose-500 animate-pulse" : "bg-indigo-400"}`} />
          <span className="text-xs font-mono font-medium">
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Main Stage (Center Space) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 w-full max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Avatar Area */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Audio Waves around avatar */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <div 
                key={`wave-${i}`} 
                className={`absolute w-[220px] h-[220px] rounded-full border border-indigo-500/20 transition-all duration-150`}
                style={{ 
                  transform: `scale(${1 + (audioLevel / 40) + (i * 0.15)})`,
                  opacity: recruiterSpeaking ? 1 - (i * 0.25) : 0,
                }} 
              />
            ))}
          </div>
          
          <div className={`relative z-10 w-56 h-56 rounded-full border-[3px] overflow-hidden transition-all duration-500 shadow-2xl ${recruiterSpeaking ? "border-indigo-400 shadow-indigo-500/20" : "border-white/10"}`}>
            {mode === "video" ? (
              <video 
                ref={(el) => { 
                  videoRef.current = el; 
                  if (el && streamRef.current && !el.srcObject) { 
                    el.srcObject = streamRef.current; 
                    el.onloadedmetadata = () => el.play(); 
                  } 
                }} 
                muted playsInline autoPlay 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
            ) : (
              <img 
                src={recruiters.find(r => r.name === recruiterName)?.avatar || "/recruiters/default.jpg"} 
                alt={recruiterName || "AI Coach"} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent((recruiterName || "AI").split('(')[0].trim()) + "&background=4f46e5&color=fff&size=200"; }}
              />
            )}
            <div className={`absolute inset-0 bg-indigo-500 transition-opacity duration-300 ${recruiterSpeaking ? 'opacity-20 mix-blend-overlay' : 'opacity-0'}`} />
          </div>
          
          {/* Speaking Indicator Badge */}
          <div className={`absolute -bottom-4 bg-indigo-600 text-white text-[9px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg border border-indigo-400 transition-all duration-300 ${recruiterSpeaking ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 scale-90'}`}>
            Speaking
          </div>
        </div>

        {/* Live Transcription Area (Replaces massive boxes) */}
        <div className="w-full flex flex-col items-center text-center space-y-8 max-w-3xl">
          {/* AI Subtitle */}
          <div className="min-h-[100px] flex items-center justify-center">
             <p className={`text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-relaxed transition-all duration-500 ${recruiterSpeaking ? 'text-white drop-shadow-md' : 'text-slate-500'}`}>
               {currentQuestion || (recruiterSpeaking ? "..." : "")}
             </p>
          </div>
          
          {/* User Subtitle (Fades in immediately when you start speaking) */}
          <div className={`min-h-[50px] max-w-xl w-full px-8 py-4 rounded-2xl transition-all duration-300 ${transcript ? 'bg-white/5 border border-white/10 opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : 'opacity-0 translate-y-2'}`}>
            <p className="text-sm md:text-base font-medium text-slate-300 opacity-90">
              <span className="text-indigo-400 font-bold mr-2">You:</span>
              {transcript || "..."}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock (Replaces the clunky footer grid) */}
      <div className="pb-10 pt-6 px-6 flex justify-center z-50">
        <div className="bg-[#111115]/80 backdrop-blur-2xl border border-white/10 p-2.5 rounded-full flex items-center gap-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
          
          <button 
            onClick={toggleMute} 
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isMuted ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
            title="Toggle Microphone"
          >
            <span className="text-xl">{isMuted ? "🔇" : "🎤"}</span>
          </button>

          <div className="px-8 py-2 flex flex-col items-center justify-center min-w-[220px]">
            {isProcessingUI ? (
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                 <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Processing...</span>
              </div>
            ) : recruiterSpeaking ? (
              <div className="flex items-center gap-1.5 h-[24px]">
                {[...Array(5)].map((_, i) => (
                  <div key={`ai-viz-${i}`} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${Math.max(6, Math.random() * 24)}px`, animationDuration: `${0.3 + Math.random() * 0.2}s` }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2 w-full">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-emerald-400 ${audioLevel > 5 ? 'animate-pulse' : ''}`} /> 
                  Listening
                </span>
                <div className="w-full max-w-[140px] bg-white/10 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-75" style={{ width: `${Math.min(100, audioLevel * 3)}%` }} />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={endCall} 
            className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]"
            title="End Session"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" x2="2" y1="2" y2="22"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
