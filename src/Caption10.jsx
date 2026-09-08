/**
 * Caption10.jsx — Style 10: "Depth Reveal"
 *
 * CSS 3D perspective drift: small context words appear word-by-word,
 * then a HUGE hero word flips up from below (rotateX 28° → 0°) with a
 * muted color palette cycling through sage, slate, warm, rose, mint.
 */

import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { buildPhrases3D, getActivePhraseAt } from "./captionHelpers10";

const HERO_COLORS = [
  "#8EC5B8", // sage teal
  "#A0B4C8", // slate blue
  "#C8B8A0", // warm sand
  "#B8A0C8", // soft purple
  "#A0C8A8", // mint
];

export const Caption10 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phrases = useMemo(
    () => buildPhrases3D(transcription ?? []),
    [transcription]
  );
  const currentTime = frame / fps;

  const active = getActivePhraseAt(phrases, currentTime);
  if (!active) return null;

  const { phrase, idx, start, end } = active;
  const { words, heroIdx } = phrase;

  const contextWords = words.slice(0, heroIdx);
  const heroWord = words[heroIdx];
  const tailWords = words.slice(heroIdx + 1);
  const heroColor = HERO_COLORS[idx % HERO_COLORS.length];

  // Hero entry spring (starts at hero word's spoken timestamp)
  const heroStartFrame = Math.round(heroWord.start * fps);
  const heroElapsed = Math.max(0, frame - heroStartFrame);
  const heroSpring = spring({
    frame: heroElapsed,
    fps,
    from: 0,
    to: 1,
    config: { stiffness: 260, damping: 22 },
  });
  const heroScale = interpolate(heroSpring, [0, 1], [0.6, 1.0], {
    extrapolateRight: "clamp",
  });
  const heroRotX = interpolate(heroSpring, [0, 1], [28, 0], {
    extrapolateRight: "clamp",
  });
  const heroOpacity = interpolate(heroSpring, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit fade for whole phrase
  const exitOpacity = interpolate(
    currentTime,
    [end - 0.4, end - 0.05],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: "5%",
          right: "5%",
          top: "32%",
          opacity: exitOpacity,
        }}
      >
        {/* Context words — word-by-word spring-in */}
        {contextWords.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginBottom: "6px",
              alignItems: "baseline",
            }}
          >
            {contextWords.map((w, i) => {
              const wElapsed = Math.max(0, frame - Math.round(w.start * fps));
              const wProg = interpolate(wElapsed, [0, 5], [0, 1], {
                extrapolateRight: "clamp",
              });
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 19,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    opacity: wProg,
                    textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                    letterSpacing: "0.02em",
                    transform: `translateY(${interpolate(wProg, [0, 1], [8, 0])}px)`,
                    display: "inline-block",
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        )}

        {/* Hero word with 3D perspective flip */}
        <div style={{ perspective: "500px", perspectiveOrigin: "50% 100%" }}>
          <div
            style={{
              transform: `rotateX(${heroRotX}deg) scale(${heroScale})`,
              transformOrigin: "center bottom",
              opacity: heroOpacity,
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontSize: 76,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 900,
                fontStyle: "italic",
                color: heroColor,
                letterSpacing: "-0.03em",
                lineHeight: 1.0,
                textShadow:
                  "0 4px 24px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.9)",
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              {heroWord.word}
            </span>
          </div>
        </div>

        {/* Tail words (after hero) */}
        {tailWords.length > 0 && (
          <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
            {tailWords.map((w, i) => {
              const wElapsed = Math.max(0, frame - Math.round(w.start * fps));
              const wProg = interpolate(wElapsed, [0, 5], [0, 1], {
                extrapolateRight: "clamp",
              });
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 19,
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 500,
                    color: "#FFFFFF",
                    opacity: wProg,
                    textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Keep alias for Root.jsx backward compat until it's updated
export const SketchOverlay = Caption10;
