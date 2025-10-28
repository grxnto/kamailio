"use client";

{/*"font-mono list-inside list-decimal text-sm/6 text-center sm:text-left" 
  "bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded"
  "rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
  "rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
  */}
{/*className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"*/}

import AudioRecorder from "./components/audio-recorder";
import AnimatedText from "./components/animated-text";
import PageIntro from "./components/page-intro";
import Header from "./components/header";
import Footer from "./components/footer";
import TypeFillOnScroll from "./components/type-on-scroll";
import WaveformVisualizer from "./components/waveform";
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
    <div className="font-mono flex flex-col items-center justify-center min-h-screen min-w-[300px]">
       {/* Responsive Header */}
      <Header />

      {/* Hero Section */}
      <section className="font-inter flex justify-center items-center min-w-screen min-h-[70vh] pt-10">
        <div className="absolute animate-spin-slow">
          <AnimatedText animationSpeed={30}/>
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
      <section className="flex flex-col items-center justify-center min-w-screen min-h-[300px] gap-4">
        <TypeFillOnScroll
              text="Record live conversation and upload audio files"
              className={`text-5xl font-bold ${inter.className}`}
            />
        <WaveformVisualizer
          barCount={30}
          className="mt-4"
        />
      </section>

        {/* App Section */}
      <main 
        ref={mainRef}
        className={`justify-center min-h-[700px] transition-all duration-700 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="flex text-3xl font-bold text-white justify-center">
          Audio Transcriber
        </h1>         
        <AudioRecorder />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}