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
    if (callStarted && recruiterSpeaking && audioLevel > 12) {
      window.speechSynthesis.cancel();
      setRecruiterSpeaking(false);
      resetTranscript();
    }
  }, [audioLevel, recruiterSpeaking, callStarted]);

  useEffect(() => {
    if (!callStarted || finished || recruiterSpeaking || !transcript.trim()) return;
    const now = Date.now();
    const timer = setTimeout(() => {
      if (Date.now() - now >= SILENCE_THRESHOLD - 100) {
        submitAnswer(transcript.trim());
        resetTranscript();
      }
    }, SILENCE_THRESHOLD);
    return () => clearTimeout(timer);
  }, [transcript, recruiterSpeaking, callStarted, finished]);

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
    const initialQuestion = "Please introduce yourself and tell me about your background.";
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

  async function submitAnswer(answer) {
    if (!answer || answer.length < 3) return;
    const updatedConversation = [...conversation, `Interviewer: ${currentQuestion}`, `Candidate: ${answer}`];
    setConversation(updatedConversation);

    if (turn >= MAX_TURNS) {
      setFinished(true);
      const result = await generateInterviewFeedback({ conversation: updatedConversation, sessionId });
      setFeedback(result);
      return;
    }

    setTurn(turn + 1);
    setRecruiterSpeaking(true);
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
        // Split by sentence terminators but keep them
        const parts = sentenceBuffer.split(/([.?!])\s+/);
        
        while (parts.length > 2 || (isFinal && parts.length > 0)) {
          let sentence = parts.shift();
          if (parts.length > 0 && parts[0].match(/[.?!]/)) {
            sentence += parts.shift();
          }
          if (sentence.trim()) {
            speakSentence(sentence.trim());
          }
        }
        sentenceBuffer = parts.join(" ");
      };

      // Helper for prioritized speech queuing
      const speechQueue = [];
      let isActuallySpeaking = false;

      const speakSentence = (text) => {
        speechQueue.push(text);
        if (!isActuallySpeaking) processSpeechQueue();
      };

      const processSpeechQueue = async () => {
        if (speechQueue.length === 0) {
          isActuallySpeaking = false;
          return;
        }
        isActuallySpeaking = true;
        const text = speechQueue.shift();
        
        // Use a modified 'speak' that doesn't cancel and handles completion callback
        await speakSingleUtterance(text);
        processSpeechQueue();
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          processSentences("", true); // Flush remaining buffer
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setCurrentQuestion(fullContent); // Live UI update
        processSentences(chunk);
      }
    } catch (err) {
      console.error("Streaming error:", err);
      // Fallback or error UI
    }
  }

  // Refined speech helper for streaming sentences
  function speakSingleUtterance(text) {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      let preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const isNatural = name.includes('google') || name.includes('natural') || name.includes('premium');
        const isIndian = v.lang === 'en-IN' || name.includes('india');
        const matchesGender = recruiterGender === 'female' 
          ? (name.includes('female') || name.includes('priya') || name.includes('heera') || name.includes('veena') || name.includes('zira'))
          : (name.includes('male') || name.includes('ravi') || name.includes('prabhat') || name.includes('david'));
        return isNatural && isIndian && matchesGender;
      });

      if (!preferredVoice) {
        preferredVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const matchesGender = recruiterGender === 'female' ? (name.includes('female') || name.includes('zira')) : (name.includes('male') || name.includes('david'));
          return matchesGender && v.lang.startsWith('en');
        });
      }

      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.94 + (Math.random() * 0.04); 
      utterance.pitch = (recruiterGender === 'female' ? 1.05 : 0.9) + (Math.random() * 0.04);
      
      utterance.onstart = () => setRecruiterSpeaking(true);
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
      
      let preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const isNatural = name.includes('google') || name.includes('natural') || name.includes('premium');
        const isIndian = v.lang === 'en-IN' || name.includes('india');
        const matchesGender = recruiterGender === 'female' 
          ? (name.includes('female') || name.includes('priya') || name.includes('heera') || name.includes('veena') || name.includes('zira'))
          : (name.includes('male') || name.includes('ravi') || name.includes('prabhat') || name.includes('david'));
        return isNatural && isIndian && matchesGender;
      });

      if (!preferredVoice) {
        preferredVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          const matchesGender = recruiterGender === 'female' ? (name.includes('female') || name.includes('zira')) : (name.includes('male') || name.includes('david'));
          return matchesGender && v.lang.startsWith('en');
        });
      }

      if (preferredVoice) utterance.voice = preferredVoice;
      
      // Humanized variability: slight changes in rate/pitch per sentence
      utterance.rate = 0.94 + (Math.random() * 0.04); 
      utterance.pitch = (recruiterGender === 'female' ? 1.05 : 0.9) + (Math.random() * 0.04);
      
      utterance.onstart = () => setRecruiterSpeaking(true);
      utterance.onend = () => {
        index++;
        // Breath pause
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
    <div className="min-h-screen bg-[#050505] text-slate-300 flex flex-col font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 50%, #4f46e5 0%, transparent 50%)`, backgroundSize: '100% 100%' }} />
      
      {/* Header HUD */}
      <div className="flex justify-between items-center px-10 py-8 bg-black/40 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-indigo-500 rounded-full animate-ping opacity-50" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black tracking-[0.5em] uppercase text-white">Constant Stream</p>
              <span className="text-indigo-500 animate-pulse font-bold text-xs">⚡</span>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
             <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${timeLeft < 60 ? "text-rose-400" : "text-indigo-400"}`}>
               {timeLeft < 60 ? "SESSION ENDS IN" : "LIVE SESSION"}
             </p>
             <div className={`bg-white/5 px-3 py-1 rounded-full text-[10px] font-mono transition-colors ${timeLeft < 60 ? "text-rose-500 animate-pulse font-bold" : "text-slate-400"}`}>
               {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 items-end h-3">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="w-1 bg-indigo-500/40 rounded-full animate-bounce" style={{ height: `${Math.random()*100}%`, animationDuration: `${0.5 + Math.random()}s` }} />
             ))}
          </div>
          <div className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-6xl mx-auto w-full space-y-12 pb-64 relative z-10">
        <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Main Interaction Card */}
          <div className={`relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 transition-all duration-700 ${recruiterSpeaking ? "shadow-[0_0_100px_rgba(99,102,241,0.15)] border-indigo-500/40" : ""}`}>
            <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
              <div className="relative">
                {/* Breathing Avatar */}
                <div 
                  className={`w-44 h-44 rounded-3xl border-2 transition-all duration-500 overflow-hidden shadow-2xl grayscale ${recruiterSpeaking ? "border-indigo-400 scale-[1.05] grayscale-0" : "border-white/10 opacity-70"}`}
                  style={{ transform: recruiterSpeaking ? `scale(${1 + audioLevel / 1000})` : 'scale(1)' }}
                >
                  <img src={recruiters.find(r => r.name === recruiterName)?.avatar || "/recruiters/default.jpg"} alt={recruiterName} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-indigo-500/5 transition-opacity duration-1000 ${recruiterSpeaking ? 'opacity-100' : 'opacity-20'}`} />
                </div>
                {/* Pulsing Aura */}
                <div className={`absolute -inset-6 border border-indigo-500/10 rounded-[3rem] animate-pulse pointer-events-none transition-opacity ${recruiterSpeaking ? 'opacity-100' : 'opacity-30'}`} />
              </div>
              <div className="text-center md:text-left space-y-4 flex-1">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Mentor Presence</p>
                  <div className="h-1 flex-1 max-w-[100px] bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500/40 w-full animate-shimmer" />
                  </div>
                </div>
                <h2 className="text-5xl font-black tracking-tighter text-white">{recruiterName || "COACH"}</h2>
                {/* Responsive Voice Matrix */}
                <div className="flex items-center justify-center md:justify-start gap-1.5 h-8">
                  {[...Array(32)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full transition-all duration-75 ${recruiterSpeaking && i < (audioLevel / 3) ? 'bg-gradient-to-t from-indigo-500 to-purple-400' : 'bg-white/10'}`} 
                      style={{ height: recruiterSpeaking && i < (audioLevel / 3) ? `${Math.max(6, Math.random() * 32)}px` : '4px' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Transcription Display */}
            <div className="relative group">
              <div className="bg-black/40 rounded-3xl p-10 border border-white/5 min-h-[160px] flex flex-col justify-center transition-all group-hover:border-white/10">
                <div className="absolute top-4 left-8 flex items-center gap-3">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em]">Continuous Feed</p>
                  {recruiterSpeaking && <div className="w-1 h-1 bg-indigo-400 rounded-full animate-ping" />}
                </div>
                <p className={`text-3xl md:text-4xl leading-tight font-black tracking-tight ${recruiterSpeaking ? 'text-white' : 'text-slate-600'} transition-all duration-500`}>
                  {currentQuestion || "Initializing stream..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Secondary Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-10">
          {mode === "video" ? (
            <div className="md:col-span-3 aspect-video bg-black/40 rounded-[2.5rem] overflow-hidden border border-white/10 relative group">
              <video ref={(el) => { videoRef.current = el; if (el && streamRef.current && !el.srcObject) { el.srcObject = streamRef.current; el.onloadedmetadata = () => el.play(); } }} muted playsInline autoPlay className="w-full h-full object-cover scale-x-[-1] opacity-60 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black text-slate-300 uppercase tracking-widest border border-white/10 shadow-2xl">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> 
                Optical Signal
              </div>
            </div>
          ) : (
             <div className="md:col-span-3 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 opacity-10 flex items-end">
                  {[...Array(50)].map((_, i) => (
                    <div key={i} className="flex-1 bg-indigo-500 animate-pulse" style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }} />
                  ))}
               </div>
               <div className="relative text-center space-y-4">
                  <span className="text-6xl opacity-40 group-hover:scale-110 transition-transform block">🎙️</span>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Audio Stream Active</p>
               </div>
             </div>
          )}
          <div className="md:col-span-1 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-center items-center gap-8 group">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${audioLevel > 15 ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] scale-110' : 'border-white/5'}`}>
               <span className="text-2xl">{audioLevel > 15 ? "🔥" : "💤"}</span>
            </div>
            <div className="w-full space-y-4 px-4 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Input Saturation</p>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(100, audioLevel * 2)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistence Console */}
      <div className="fixed bottom-0 left-0 w-full p-10 z-[60] bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Constant Stream Panel */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-8 transition-all hover:bg-white/[0.04] shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.5em]">Constant Stream | Active Listening</p>
              <div className="flex-1 h-[1px] bg-white/10" />
              <div className="flex gap-1">
                 {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                 ))}
              </div>
            </div>
            <p className={`text-2xl font-black tracking-tight leading-tight transition-all duration-300 ${listening ? 'text-white' : 'text-slate-600'}`}>
              {transcript || (recruiterSpeaking ? "Mentor is speaking... I'm listening to your potential interruptions." : "Speak whenever you're ready, I'm streaming your audio now.")}
            </p>
          </div>
          <div className="flex items-center justify-center gap-8">
            <button onClick={toggleMute} className={`group flex flex-col items-center gap-2 px-10 py-6 transition-all duration-500 rounded-3xl border ${isMuted ? "bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.1)]" : "bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-white"}`}>
              <span className="text-xl">{isMuted ? "🎤" : "🔇"}</span><p className="text-[9px] font-black tracking-[0.3em] uppercase">{isMuted ? "LIVE" : "MUTE"}</p>
            </button>
            <button onClick={endCall} className="bg-rose-600 hover:bg-rose-500 text-white px-20 py-6 font-black text-xs uppercase tracking-[0.5em] rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-rose-900/40">End Stream</button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
}
