"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

interface TypeFillOnScrollProps {
  text: string;
  className?: string;
  durationPerLetter?: number;
}

export default function TypeFillOnScroll({
  text,
  className,
  durationPerLetter = 50,
}: TypeFillOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();
  const [letters, setLetters] = useState<string[]>([]);

  useEffect(() => {
    setLetters(text.split(""));
  }, [text]);

  useEffect(() => {
    if (isInView) {
      // Animate letters sequentially
      controls.start((i) => ({
        color: "#ffffff",
        transition: { delay: i * (durationPerLetter / 1000), duration: 0.3 },
      }));
    }
  }, [isInView, controls, durationPerLetter]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      {letters.map((char, index) => (
        <motion.span
          key={index}
          custom={index}
          initial={{ color: "#888888" }}
          animate={controls}
          style={{ display: "inline-block" }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}
