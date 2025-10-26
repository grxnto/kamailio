"use client";
import { useEffect, useRef, useState } from "react";

interface TypeFillOnScrollProps {
  text: string;
  className?: string;
}

function TypeFillOnScroll({ text, className = "" }: TypeFillOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [fillProgress, setFillProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Only start animation when element reaches middle of viewport
      // Complete when it reaches top third
      const start = windowHeight * 0.7; // Middle of screen
      const end = windowHeight * 0.4;   // Upper third
      const current = rect.top;
      
      let progress = 0;
      if (current <= start && current >= end) {
        progress = 1 - (current - end) / (start - end);
      } else if (current < end) {
        progress = 1;
      }
      // If current > start, progress stays 0 (text stays grey)
      
      setFillProgress(Math.max(0, Math.min(1, progress)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const letters = text.split("");
  const filledCount = Math.floor(fillProgress * letters.length);

  return (
    <div ref={ref} className={className}>
      {letters.map((char, index) => (
        <span
          key={index}
          style={{
            color: index < filledCount ? "#ffffff" : "#888888",
            transition: "color 0.1s ease-out",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

export default TypeFillOnScroll;