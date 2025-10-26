"use client";
import { useEffect, useRef, useState } from "react";

interface WaveformVisualizerProps {
  barCount?: number;
  className?: string;
}

export default function WaveformVisualizer({
  barCount = 30,
  className = "",
}: WaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight;
      const end = 0;
      const current = rect.top;

      let progress = 0;
      if (current <= start && current >= end) {
        progress = 1 - (current - end) / (start - end);
      } else if (current < end) {
        progress = 1;
      }

      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Determine bar heights based on scroll
  const getBarHeight = (index: number) => {
    const normalizedIndex = index / barCount;

    // Each bar activates progressively
    if (scrollProgress < normalizedIndex) {
      return 0.2; // Inactive - taller so it's visible
    }

    // Create varied heights like real audio frequencies
    const frequencyBias = 1 - (index / barCount) * 0.4;

    // Add pseudo-random variation based ONLY on bar index (stable per bar)
    const seed = Math.sin(index * 12.9898) * 43758.5453;
    const pseudoRandom = seed - Math.floor(seed);

    // Base height with random variation (stable for each bar)
    const baseHeight = 0.3 + (pseudoRandom * 0.5) * frequencyBias;

    // Smooth fade-in as bar becomes active
    const fadeDistance = 5;
    const barsSinceActive = scrollProgress * barCount - index;
    const fadeIn = Math.min(1, Math.max(0, barsSinceActive / fadeDistance));

    return Math.max(0.2, baseHeight * fadeIn);
  };

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center gap-1.5 ${className}`}
      style={{ height: "60px", width: "100%" }}
    >
      {Array(barCount)
        .fill(0)
        .map((_, i) => {
          const height = getBarHeight(i);
          const isActive = scrollProgress > i / barCount;
          return (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: "4px",
                height: `${height * 50}px`,
                backgroundColor: isActive
                  ? `rgba(255, 255, 255, ${0.5 + height * 0.5})`
                  : "rgba(107, 114, 128, 0.5)",
                transition: "none",
              }}
            />
          );
        })}
    </div>
  );
}