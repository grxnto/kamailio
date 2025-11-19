"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

interface LiveRecorderProps {
  onTranscriptionComplete: (text: string, segments: any[]) => void;
  onError: (error: string) => void;
}

export default function LiveRecorder({ onTranscriptionComplete, onError }: LiveRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveTranscript) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveTranscript]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendChunkToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'chunk.webm');

      const response = await fetch('http://localhost:8001/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription chunk failed');

      const result = await response.json();
      
      if (result.text) {
        setLiveTranscript(prev => prev + ' ' + result.text);
      }
    } catch (err) {
      console.error('Chunk transcription error:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await sendChunkToBackend(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        
        const segments = [{
          start: 0,
          end: recordingTime,
          text: liveTranscript.trim()
        }];
        
        onTranscriptionComplete(liveTranscript.trim(), segments);
      };

      mediaRecorder.start();
      chunkIntervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.requestData();
        }
      }, 3000);

      setIsRecording(true);
      setRecordingTime(0);
      setLiveTranscript('');

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      onError('Failed to access microphone. Please allow microphone permissions.');
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
      
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full rounded-md border border-solid transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base h-12 px-6 ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
            : 'border-transparent bg-foreground text-background hover:bg-[#383838]'
        }`}
      >
        {isRecording ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            Stop Recording ({formatTime(recordingTime)})
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Start Live Recording
          </>
        )}
      </button>

      {isRecording && liveTranscript && (
        <div className="w-full p-4 bg-blue-900/10 border border-blue-500/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Live Transcription
            </h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {liveTranscript}
            <div ref={transcriptEndRef} />
          </p>
        </div>
      )}
    </div>
  );
}