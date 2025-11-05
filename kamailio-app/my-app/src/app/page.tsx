"use client";

import AudioRecorder from "./components/audio-recorder";
import CircularText from "./components/circular-text";
import Header from "./components/header";
import Footer from "./components/footer";
import TypeFillOnScroll from "./components/type-on-scroll";
import WaveformVisualizer from "./components/waveform";
import Particles from './components/particles';
import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from 'react';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (mainRef.current) {
      observer.observe(mainRef.current);
    }

    return () => {
      if (mainRef.current) {
        observer.unobserve(mainRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Particles Background - Fixed behind everything */}
      <div className="fixed inset-0 min-w-screen max-w-screen overflow-x-hidden min-h-screen z-0 pointer-events-none">
        <Particles
          particleColors={['#f3f3f3ff']}
          particleCount={300}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={80}
          moveParticlesOnHover={false}
          alphaParticles={false}
        />
      </div>

      {/* Main content */}
      <div className="font-mono flex flex-col items-center justify-center min-h-screen min-w-[300px] relative z-10">
        {/* Responsive Header */}
        <Header />

        {/* Hero Section */}
        <section className="font-inter flex justify-center items-center min-w-screen min-h-[70vh] pt-10">
          <div className="absolute">
            <CircularText 
              text="Q&A EXPERIENCE • LIVE AUDIO TRANSCRIPTION • "
              spinDuration={60}
              onHover="speedUp"
            />
          </div>
          
          {/* Center image */}
          <div className="relative z-5">
            <Image
              src="/ilio.png" 
              alt="ʻīlio"
              width={180}          
              height={180}
              className="rounded-full object-cover"
            />
          </div>
        </section>

        {/* Animated Description */}
        <section className="flex flex-col items-center justify-center min-w-screen sm:min-h-[250px] gap-4 mb-20 sm:mb-5">
          {/* fancy desktop */}
          <div className="hidden xl:flex flex-col items-center">
            <TypeFillOnScroll
              text="Record live conversation and upload audio files"
              className={`text-5xl font-bold ${inter.className}`}
            />
            <WaveformVisualizer barCount={30} className="mt-4" />
          </div>

          {/* mobile fallback */}
          <p className={`text-3xl xl:hidden  text-left mx-6 font-bold ${inter.className}`}>
            Record live conversation and upload audio files
          </p>
          <p className={`text-sm xl:hidden text-left mx-6 text-gray-400 ${inter.className}`}>
            After transcribing your audio, export the text for LLM Q&A functionality
          </p>
        </section>

        {/* App Section */}
        <main 
          ref={mainRef}
          id="recorder"
          className={`justify-center min-h-[700px] transition-all duration-700 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <AudioRecorder />
        </main>

        {/* Footer */}
        <div className="bg-black w-full">
          <Footer />
        </div>
      </div>
    </>
  );
}