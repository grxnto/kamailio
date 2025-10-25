"use client";
import React, { useEffect, useRef } from "react";
import { Inter} from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface AnimatedTextProps {
  text?: string;
  noRepeat?: boolean;
  animate?: boolean;
  circleSize?: number;
  wordSpacing?: number;
  letterSpacing?: number;
  animationSpeed?: number;
  backgroundColor?: string;
  fontWeight?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text = "Q&A Experience — Live Audio Transcription — Record, Upload, Transcribe — Kama'ilio — Timestamp Capture and Summary —",
  noRepeat = false,
  animate = true,
  circleSize = 166,
  wordSpacing = 0,
  letterSpacing = 1,
  animationSpeed = 10,
  backgroundColor = "transparent",
  fontWeight = 500,
}) => {
  const circlePathRef = useRef<SVGPathElement | null>(null);
  const textPathRef = useRef<SVGTextPathElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const fontFamily = `${inter.style.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;


  useEffect(() => {
    updateCirclePath();
  }, [circleSize]);

  useEffect(() => {
    updateText();
  }, [text, noRepeat, circleSize, wordSpacing, letterSpacing, fontWeight]);

  useEffect(() => {
    const styles = document.createElement("style");
    styles.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .spin {
        animation: spin ${animationSpeed}s linear infinite;
        transform-origin: center;
      }
    `;
    document.head.appendChild(styles);
    return () => {
      document.head.removeChild(styles);
    };
  }, [animationSpeed]);

  const updateCirclePath = () => {
    if (!circlePathRef.current) return;

    const center = 200;
    const radius = circleSize;
    circlePathRef.current.setAttribute(
      "d",
      `M${center},${center} m-${radius},0 a${radius},${radius} 0 1,0 ${radius * 2},0 a${radius},${radius} 0 1,0 -${radius * 2},0`
    );
    updateText();
  };

  const getTextLength = (
    textContent: string,
    fontSize: number,
    letterSpacingValue: number
  ) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    return (
      context.measureText(textContent).width +
      (textContent.length - 1) * letterSpacingValue
    );
  };

  const spaceOutWords = (
    inputText: string,
    circleLength: number,
    fontSize: number,
    wordSpacingValue: number,
    letterSpacingValue: number
  ) => {
    const words = inputText.split(" ");
    const totalLength =
      getTextLength(inputText, fontSize, letterSpacingValue) +
      (words.length - 1) * wordSpacingValue;

    if (totalLength <= circleLength) {
      return inputText;
    }
    return null;
  };

  const repeatPhrase = (
    inputText: string,
    circleLength: number,
    fontSize: number,
    wordSpacingValue: number,
    letterSpacingValue: number
  ) => {
    const phraseLength =
      getTextLength(inputText, fontSize, letterSpacingValue) +
      (inputText.split(" ").length - 1) * wordSpacingValue;
    const maxRepetitions = Math.floor(circleLength / phraseLength);

    if (maxRepetitions >= 1) {
      const totalTextLength = phraseLength * maxRepetitions;
      const remainingSpace = circleLength - totalTextLength;
      const spaceBetweenPhrases = remainingSpace / maxRepetitions;

      const spaceCharWidth = getTextLength(
        " ",
        fontSize,
        letterSpacingValue
      );
      const spacerLength = Math.round(spaceBetweenPhrases / spaceCharWidth);
      const spacer = " ".repeat(spacerLength);

      return (inputText + spacer).repeat(maxRepetitions).trim();
    }
    return null;
  };

  const updateText = () => {
    if (!textPathRef.current || !circlePathRef.current) return;

    const inputText = text.trim();
    const circlePath = circlePathRef.current;

    let circleLength: number;
    try {
      circleLength = circlePath.getTotalLength();
    } catch {
      circleLength = 2 * Math.PI * circleSize;
    }

    if (!circleLength || isNaN(circleLength)) {
      circleLength = 2 * Math.PI * circleSize;
    }

    let fontSize = 40;

    while (fontSize > 8) {
      let finalText: string | null = "";
      if (noRepeat) {
        finalText = spaceOutWords(
          inputText,
          circleLength,
          fontSize,
          wordSpacing,
          letterSpacing
        );
      } else {
        finalText = repeatPhrase(
          inputText,
          circleLength,
          fontSize,
          wordSpacing,
          letterSpacing
        );
      }

      if (finalText) {
        textPathRef.current.textContent = finalText;
        textPathRef.current.setAttribute("font-size", fontSize.toString());
        textPathRef.current.setAttribute("font-family", fontFamily);
        textPathRef.current.setAttribute("font-weight", fontWeight.toString());
        textPathRef.current.setAttribute("word-spacing", `${wordSpacing}px`);
        textPathRef.current.setAttribute("letter-spacing", `${letterSpacing}px`);
        return;
      }
      fontSize--;
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-[32px]"
      style={{ backgroundColor }}
    >
      <div className="flex justify-center items-center p-6">
        <svg
          width={circleSize * 2}
          height={circleSize * 2}
          viewBox="0 0 400 400"
          ref={svgRef}
        >
          <g id="circleGroup" className={animate ? "spin" : ""}>
            <path
              id="circlePath"
              d="M200,200 m-150,0 a150,150 0 1,0 300,0 a150,150 0 1,0 -300,0"
              fill="none"
              ref={circlePathRef}
            />
            <text id="circleText" fill="white">
              <textPath href="#circlePath" startOffset="0%" ref={textPathRef} />
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedText;
