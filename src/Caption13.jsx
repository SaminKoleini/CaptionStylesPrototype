/**
 * Caption13.jsx — "Cozy Handwritten" style
 *
 * Intro: topic word inside a hand-drawn wobbly ellipse (frames 0–110).
 * Captions: Caveat handwritten font, warm cream color, word-by-word fade-in.
 */

import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { buildPhrases3D, getActivePhraseAt } from "./captionHelpers10";

const FILLER_WORDS = new Set([
  "a","an","the","is","it","in","on","to","do","by","no","so","but","and",
  "of","for","at","with","my","i","we","they","he","she","you","are","was",
  "were","not","your","its","this","that","or","as","be","been","have","has",
  "had","will","would","can","could","should","just","very","get","go","also",
  "even","still",
]);

export const Caption13 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phrases = useMemo(() => buildPhrases3D(transcription ?? []), [transcription]);

  // Find topic word: longest content word in first 30% of transcript
  const topicWord = useMemo(() => {
    if (!transcription?.length) return null;
    const first30 = transcription.slice(0, Math.max(1, Math.floor(transcription.length * 0.3)));
    const content = first30.filter(
      (w) => !FILLER_WORDS.has(w.word.toLowerCase().replace(/[^a-z]/g, ""))
    );
    if (!content.length) {
      const any = transcription.find(
        (w) => !FILLER_WORDS.has(w.word.toLowerCase().replace(/[^a-z]/g, ""))
      );
      return any ? any.word : transcription[0].word;
    }
    return content.reduce((best, w) => (w.word.length > best.word.length ? w : best), content[0]).word;
  }, [transcription]);

  const currentTime = frame / fps;

  // Ellipse draw-in animation
  const dashOffset = interpolate(frame, [8, 48], [780, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ellipse fade-out
  const ellipseOpacity = interpolate(frame, [85, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Shake animation (deterministic, no Math.random)
  const shakeX = Math.sin(frame * 0.45) * 1.8;
  const shakeY = Math.cos(frame * 0.38) * 1.0;
  const shakeR = Math.sin(frame * 0.31) * 1.4;

  // Topic word entry animation
  const wordSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    from: 0,
    to: 1,
    config: { stiffness: 180, damping: 22 },
  });
  const wordScale = 0.7 + wordSpring * 0.3;
  const wordOpacity = interpolate(Math.max(0, frame - 12), [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Active phrase for captions
  const active = getActivePhraseAt(phrases, currentTime);

  return (
    <AbsoluteFill>
      {/* Wobbly ellipse intro (frames 0–110) */}
      {topicWord && (
        <svg
          viewBox="0 0 390 844"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: ellipseOpacity,
          }}
        >
          <g
            style={{
              transform: `translate(${shakeX}px, ${shakeY}px) rotate(${shakeR}deg)`,
              transformOrigin: "195px 405px",
            }}
          >
            {/* Outer ellipse path */}
            <path
              d="M 48 407 C 52 343 122 334 196 335 C 270 336 338 346 342 408 C 346 470 274 472 196 470 C 118 468 44 471 48 407 Z"
              fill="none"
              stroke="#C8A882"
              strokeWidth={2.2}
              opacity={0.8}
              strokeDasharray={780}
              strokeDashoffset={dashOffset}
            />
            {/* Inner ellipse path */}
            <path
              d="M 60 407 C 63 352 126 344 196 345 C 266 346 328 354 330 408 C 332 462 268 464 196 463 C 124 462 57 462 60 407 Z"
              fill="none"
              stroke="#C8A882"
              strokeWidth={1.6}
              opacity={0.55}
              strokeDasharray={780}
              strokeDashoffset={dashOffset}
            />
          </g>
        </svg>
      )}

      {/* Topic word centered inside the ellipse */}
      {topicWord && frame >= 10 && frame <= 110 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "43%",
            transform: `translateX(-50%) translateY(-50%) scale(${wordScale})`,
            opacity: Math.min(wordOpacity, ellipseOpacity),
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: "78px",
            color: "#F5ECD5",
            textTransform: "uppercase",
            textShadow: "0 2px 12px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {topicWord}
        </div>
      )}

      {/* Regular handwritten captions */}
      {active && (
        () => {
          const { phrase, start, end } = active;
          const phraseExitOpacity = interpolate(currentTime, [end - 0.3, end - 0.05], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              style={{
                position: "absolute",
                left: "6%",
                right: "6%",
                top: "67%",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "6px",
                opacity: phraseExitOpacity,
                pointerEvents: "none",
              }}
            >
              {phrase.words.map((w, i) => {
                const wordOpacityVal = interpolate(
                  Math.max(0, frame - Math.round(w.start * fps)),
                  [0, 8],
                  [0, 1],
                  { extrapolateRight: "clamp" }
                );
                return (
                  <span
                    key={i}
                    style={{
                      fontFamily: "'Caveat', cursive",
                      fontWeight: 700,
                      fontSize: "30px",
                      color: "#F5ECD5",
                      textShadow: "0 1px 6px rgba(0,0,0,0.6)",
                      opacity: wordOpacityVal,
                    }}
                  >
                    {w.word}
                  </span>
                );
              })}
            </div>
          );
        }
      )()}
    </AbsoluteFill>
  );
};
