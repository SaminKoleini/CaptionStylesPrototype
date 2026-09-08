/**
 * Caption14.jsx — "Editorial Serif" style
 *
 * Small context words above a massive 88px italic Playfair Display hero word.
 * All pure white, left-aligned, elegant fade-in animations.
 */

import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { buildPhrases3D, getActivePhraseAt } from "./captionHelpers10";

export const Caption14 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phrases = useMemo(() => buildPhrases3D(transcription ?? []), [transcription]);

  const currentTime = frame / fps;
  const active = getActivePhraseAt(phrases, currentTime);

  if (!active) return <AbsoluteFill />;

  const { phrase, end } = active;
  const { words, heroIdx } = phrase;

  const contextWords = words.slice(0, heroIdx);
  const heroWord = words[heroIdx];
  const tailWords = words.slice(heroIdx + 1);

  // Whole phrase exit opacity
  const phraseExitOpacity = interpolate(currentTime, [end - 0.4, end - 0.05], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Hero word animation
  const heroElapsed = heroWord
    ? Math.max(0, frame - Math.round(heroWord.start * fps))
    : 0;
  const heroSpring = heroWord
    ? spring({
        frame: heroElapsed,
        fps,
        from: 0,
        to: 1,
        config: { stiffness: 160, damping: 28 },
      })
    : 0;
  const heroScale = 0.94 + heroSpring * 0.06;
  const heroWordOpacity = heroWord
    ? interpolate(heroElapsed, [0, 12], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "18%",
          opacity: phraseExitOpacity,
          pointerEvents: "none",
        }}
      >
        {/* Context words (before hero) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
          {contextWords.map((w, i) => {
            const progress = interpolate(
              Math.max(0, frame - Math.round(w.start * fps)),
              [0, 12],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            const translateY = interpolate(progress, [0, 1], [6, 0]);
            return (
              <span
                key={i}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  fontSize: "21px",
                  color: "#FFFFFF",
                  opacity: progress,
                  transform: `translateY(${translateY}px)`,
                  display: "inline-block",
                  textShadow: "0 1px 12px rgba(0,0,0,0.6)",
                  letterSpacing: "0.04em",
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>

        {/* Hero word */}
        {heroWord && (
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "88px",
              color: "#FFFFFF",
              opacity: heroWordOpacity,
              transform: `scale(${heroScale})`,
              transformOrigin: "left center",
              display: "block",
              textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.08)",
              lineHeight: 1,
              marginBottom: "4px",
            }}
          >
            {heroWord.word}
          </div>
        )}

        {/* Tail words (after hero) */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
          {tailWords.map((w, i) => {
            const progress = interpolate(
              Math.max(0, frame - Math.round(w.start * fps)),
              [0, 12],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            const translateY = interpolate(progress, [0, 1], [6, 0]);
            return (
              <span
                key={i}
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  fontSize: "21px",
                  color: "#FFFFFF",
                  opacity: progress,
                  transform: `translateY(${translateY}px)`,
                  display: "inline-block",
                  textShadow: "0 1px 12px rgba(0,0,0,0.6)",
                  letterSpacing: "0.04em",
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
