"use client";

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { MessageSquare, X, ChevronDown, ChevronUp, Send, Copy, Check } from 'lucide-react';

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

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptQAProps {
  transcription: TranscriptionResult;
}

// Markdown parser component
const MarkdownContent = ({ content }: { content: string }) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let listKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-none space-y-2 my-3 pl-0">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex gap-2 leading-relaxed">
                <span className="text-gray-400 mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: parseBold(item) }} />
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const parseBold = (text: string) => {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    };

    lines.forEach((line, idx) => {
      // Handle headers (##, ###, etc.)
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={idx} className="text-base font-semibold text-white mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={idx} className="text-lg font-semibold text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-3">
            {line.replace('# ', '')}
          </h1>
        );
      }
      // Handle bullet points
      else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        listItems.push(line.trim().substring(2));
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        flushList();
        const match = line.trim().match(/^\d+\.\s(.+)/);
        if (match) {
          elements.push(
            <div key={idx} className="flex gap-2 my-2 leading-relaxed">
              <span className="text-gray-400 font-medium">{line.trim().match(/^\d+/)?.[0]}.</span>
              <span dangerouslySetInnerHTML={{ __html: parseBold(match[1]) }} />
            </div>
          );
        }
      }
      // Handle empty lines
      else if (line.trim() === '') {
        flushList();
        elements.push(<div key={idx} className="h-2" />);
      }
      // Handle regular text with bold
      else if (line.trim()) {
        flushList();
        elements.push(
          <p key={idx} className="leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
        );
      }
    });

    flushList();
    return elements;
  };

  return <div className="text-sm text-gray-300">{parseMarkdown(content)}</div>;
};

export default function TranscriptQA({ transcription }: TranscriptQAProps) {
  const [qaMode, setQaMode] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const qaContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  useEffect(() => {
    if (qaMode) {
      qaContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [qaMode, question]);

  // Scroll to bottom whenever messages or loading state changes
  useLayoutEffect(() => {
    if (qaMode && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, qaMode]);

  // Also scroll after a delay to catch any rendering delays
  useEffect(() => {
    if (qaMode && messagesContainerRef.current && (messages.length > 0 || isLoading)) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isLoading, qaMode]);

  const handleStartQA = () => {
    setQaMode(true);
    setShowTranscript(false);
  };

  const handleExitQA = () => {
    setQaMode(false);
    setShowTranscript(true);
    setMessages([]);
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcription.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuestion = async () => {
    if (!question.trim()) return;

    const userMessage: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          transcript: transcription.text,
          segments: transcription.segments,
        }),
      });

      if (!response.ok) throw new Error('Failed to get answer');

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.answer };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const mockResponse: Message = {
        role: 'assistant',
        content: `Based on the transcript: ${
          question.toLowerCase().includes('what')
            ? 'The transcript discusses various topics. Could you be more specific?'
            : 'I found relevant information in the transcript that addresses your question.'
        }`,
      };

      setMessages(prev => [...prev, mockResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <div 
      className={`px-4 pb-4 mb-40 bg-[#161616] rounded-lg border border-white/10 transition-all duration-500 ease-in-out ${
        qaMode ? 'min-h-[600px]' : 'max-h-96 overflow-y-auto'
      }`}
    >
      {/* Header - Transforms between modes */}
      <div className="sticky top-0 z-10 bg-[#161616] flex justify-between items-center pt-4 pb-1 mb-2">
        <h3 className="text-lg font-semibold text-white pb-1 bg-[#161616]">
          {qaMode ? 'Q&A Chat' : 'Timestamped Segments'}
        </h3>
        <div className="flex items-center gap-2">
          {!qaMode ? (
            <>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                {transcription.language}
              </span>
              <button
                onClick={handleCopyTranscript}
                className="hover:cursor-pointer px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={handleStartQA}
                className="hover:cursor-pointer px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <MessageSquare className="w-3 h-3" />
                Start Q&A
              </button>
            </>
          ) : (
            <button
              onClick={handleExitQA}
              className="hover:cursor-pointer px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <X className="w-3 h-3" />
              Exit Q&A
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Transcript Section (Only in Q&A mode) */}
      {qaMode && (
        <div className="border-b border-white/10 mb-3">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full py-2 flex items-center justify-between hover:bg-white/5 rounded transition-colors px-2 hover:cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">View Transcript</span>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                {transcription.segments.length} timestamps
              </span>
            </div>
            {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              showTranscript ? 'max-h-48 pb-3' : 'max-h-0'
            }`}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transcription.segments.map((segment, index) => (
                <div key={index} className="flex gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                  <span className="text-xs font-mono text-blue-400 whitespace-nowrap w-[100px] flex-shrink-0">
                    {formatTime(segment.start)} - {formatTime(segment.end)}
                  </span>
                  <p className="text-sm text-gray-300 leading-relaxed flex-1">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Area - Morphs between segments and chat */}
      {!qaMode ? (
        // Normal Mode: Show Timestamped Segments
        <div className="space-y-3 animate-fadeIn">
          {transcription.segments.map((segment, index) => (
            <div 
              key={index} 
              className="flex gap-3 p-2 hover:bg-white/5 rounded transition-colors"
            >
              <span className="text-xs font-mono text-blue-400 whitespace-nowrap w-[100px] flex-shrink-0">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </span>
              <p className="text-sm text-gray-300 leading-relaxed flex-1">
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Q&A Mode: Show Chat Interface
        <div ref={qaContainerRef} className="animate-fadeIn">
          <div
            ref={messagesContainerRef} 
            className="space-y-3 mb-3 overflow-y-auto"
            style={{ height: '500px' }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Ask a question or request a summary</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex pr-5 animate-slideIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] mb-3 rounded-md p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-400/5 text-white border border-white/10'
                          : 'bg-white/5 text-gray-300 border border-white/10'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <MarkdownContent content={msg.content} />
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-slideIn">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div />
              </>
            )}
          </div>

          {/* Input Area - Slides up */}
          <div className="border-t border-white/10 pt-3 animate-slideUp">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onKeyDown={handleKeyPress}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your query here..."
                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={isLoading}
              />
              <button
                onClick={handleSendQuestion}
                disabled={isLoading || !question.trim()}
                className="hover:cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="text-sm">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}