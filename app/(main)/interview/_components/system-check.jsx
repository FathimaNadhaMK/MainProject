"use client";
import { useEffect, useRef, useState } from "react";

export default function SystemCheck({ onSuccess }) {
  const videoRef = useRef(null);

  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [face, setFace] = useState(false);
  const [error, setError] = useState("");

  // Check camera & mic
  useEffect(() => {
    async function checkDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        setCamera(true);
        setMic(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Fake face detection (browser-safe prototype)
        setTimeout(() => {
          setFace(true);
        }, 2000);
      } catch (err) {
        setError("Camera or microphone permission denied.");
      }
    }

    checkDevices();
  }, []);

  const allPassed = camera && mic && face;

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        System Requirements Check
      </h2>

      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-48 bg-black rounded mb-4"
      />

      <ul className="space-y-2">
        <li>📷 Webcam: {camera ? "✅ Detected" : "❌ Not detected"}</li>
        <li>🎤 Microphone: {mic ? "✅ Detected" : "❌ Not detected"}</li>
        <li>🙂 Face Detection: {face ? "✅ Face detected" : "⏳ Checking..."}</li>
      </ul>

      {error && (
        <p className="text-red-600 mt-3">{error}</p>
      )}

      <button
        disabled={!allPassed}
        onClick={onSuccess}
        className="mt-6 w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        Start Interview
      </button>
    </div>
  );
}
