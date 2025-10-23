"use client"; // required in Next.js 13 app directory for client-side hooks

import { useState, useRef } from "react";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob, "live.wav");

      const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setTranscript((prev) => prev + "\n" + data.transcription);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };



  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.[0]) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setTranscript((prev) => prev + "\n" + data.transcription);
  };
  const buttonClasses = 'rounded-lg border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#54a192] dark:hover:bg-[#5ea7a8] hover:border-transparent  font-small text-sm h-15 px-4 pt-4 pb-4 cursor-pointer';
  return (






    <div className="flex flex-col items-center gap-10 pt-10">
      <div className="flex gap-x-4">
        

        <button
          onClick={recording ? stopRecording : startRecording}
          className={buttonClasses}
        >
          {recording ? "Stop Recording" : "Start Recording"}
        </button>
        <input
          type="file"
          id="file-upload"
          accept="audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Custom button */}
        <label
          htmlFor="file-upload"
          className={buttonClasses}
        >
          Upload File
        </label>
      </div>
      <textarea
        value={transcript}
        readOnly
        rows={10}
        cols={50}
        className="border p-2 w-full max-w-xl"
      />
    </div>
  );
}
