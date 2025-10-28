"use client";

import { useState, useRef } from 'react';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
}

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendAudioToBackend(audioBlob, 'recording.webm');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob, filename: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, filename);

      const response = await fetch('http://localhost:8000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Transcription failed');
      }

      const result: TranscriptionResult = await response.json();
      setTranscription(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Transcription error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    await sendAudioToBackend(file, file.name);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-4xl mx-auto">
      {/* Control Buttons */}
      <div className="flex gap-4 items-center">
        {/* Record Button */}
        <button
          onClick={handleRecordClick}
          disabled={isUploading}
          className={`rounded-md border border-solid transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
              : 'border-transparent bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]'
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-3 h-3 bg-white rounded-md animate-pulse"></span>
              Stop Recording ({formatTime(recordingTime)})
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              Record Audio
            </>
          )}
        </button>

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.mp4,.webm,.ogg"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <button
          onClick={handleUploadClick}
          disabled={isUploading || isRecording}
          className="rounded-md border border-solid border-white/20 transition-colors flex items-center justify-center gap-2 hover:bg-white/10 font-medium text-sm sm:text-base h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload File
        </button>
      </div>

      {/* Processing Indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-blue-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Transcribing audio...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="w-full p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Transcription Text Box */}
      <div className="w-full space-y-4">
        {transcription ? (
          <>
            {/* Full Text */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">Transcription</h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                  {transcription.language}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {transcription.text}
              </p>
            </div>

            {/* Timestamped Segments */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3 text-white sticky top-0 bg-inherit pb-2">
                Timestamped Segments
              </h3>
              <div className="space-y-3">
                {transcription.segments.map((segment, index) => (
                  <div 
                    key={index} 
                    className="flex gap-3 p-2 hover:bg-white/5 rounded transition-colors"
                  >
                    <span className="text-xs font-mono text-blue-400 whitespace-nowrap min-w-[80px]">
                      {formatTime(segment.start)} - {formatTime(segment.end)}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {segment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full p-12 border-2 border-dashed border-white/10 rounded-lg text-center">
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
              <p className="text-gray-400 mt-2">
                Record live audio or upload a file to see transcription
              </p>
              <p className="text-gray-500 text-sm">
                Supported formats: MP3, WAV, M4A, MP4, WebM, OGG
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}