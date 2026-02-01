"use client";
import { useEffect, useRef, useState } from "react";
import InterviewFeedback from "./interview-feedback";

export default function InterviewEngine({ resumeData }) {
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [conversation, setConversation] = useState([]);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const questionCount = useRef(1);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);

  /* ===================== INTERVIEWER SPEAKS ===================== */
  function speak(text) {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  /* ===================== SPEECH RECOGNITION ===================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
      recognition.stop();
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setListening(false);
    };

    recognition.onerror = () => {
      recognition.stop();
      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  /* ===================== CAMERA SELF VIEW ===================== */
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied");
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  /* ===================== START INTERVIEW ===================== */
  useEffect(() => {
    const intro =
      "Good morning. I have reviewed your resume. This interview will include HR, technical, and behavioral questions. Let us begin. Please introduce yourself.";

    setQuestion(intro);
    speak(intro);
  }, []);

  /* ===================== FETCH NEXT QUESTION ===================== */
  async function fetchNextQuestion(updatedConversation) {
    setLoading(true);

    try {
      const res = await fetch("/api/interview/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          conversation: updatedConversation
        })
      });

      const data = await res.json();
      setQuestion(data.question);

      setTimeout(() => {
        speak(data.question);
        setLoading(false);
      }, 1200); // thinking pause
    } catch (err) {
      setLoading(false);
    }
  }

  /* ===================== SUBMIT ANSWER ===================== */
  async function submitAnswer() {
    if (!transcript) return;

    const updatedConversation = [
      ...conversation,
      `Interviewer: ${question}`,
      `Candidate: ${transcript}`
    ];

    setConversation(updatedConversation);
    setTranscript("");
    questionCount.current += 1;

    if (questionCount.current > 6) {
      setFinished(true);
      return;
    }

    await fetchNextQuestion(updatedConversation);
  }

  /* ===================== AUTO SUBMIT ===================== */
  useEffect(() => {
    if (transcript && !listening) {
      const timer = setTimeout(() => {
        submitAnswer();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [transcript]);

  if (finished) {
    return <InterviewFeedback conversation={conversation} />;
  }

  /* ===================== UI ===================== */
  return (
    <>
      {/* Self camera preview */}
      <div className="fixed bottom-6 right-6 w-40 h-28 rounded-xl overflow-hidden shadow-lg border bg-black z-50">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      </div>

      {/* Interview card */}
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <p className="text-sm font-medium text-gray-700">
            Interviewer (Live)
          </p>
        </div>

        <p className="text-xs text-gray-400 mb-2">
          Question {questionCount.current} of 6
        </p>

        <p className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
          {loading ? "Thinking…" : question}
        </p>

        <button
          onClick={() => {
            if (!listening && recognitionRef.current) {
              setTranscript("");
              setListening(true);
              recognitionRef.current.start();
            }
          }}
          disabled={listening || loading}
          className="w-full py-4 rounded-xl bg-black text-white text-lg font-medium disabled:opacity-40"
        >
          {listening ? "Listening… Speak now" : "Start Answer"}
        </button>

        {listening && (
          <button
            onClick={() => {
              recognitionRef.current.stop();
              setListening(false);
            }}
            className="mt-3 w-full py-2 rounded-lg bg-gray-300 text-black"
          >
            Done Speaking
          </button>
        )}

        {transcript && (
          <div className="mt-4 p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">
              Your response:
            </p>
            <p className="italic text-gray-800">
              “{transcript}”
            </p>
          </div>
        )}
      </div>
    </>
  );
}
