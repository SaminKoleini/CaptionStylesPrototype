/**
 * Caption11.jsx — Style 11: "Neon Bloom"
 *
 * Small italic context words float above a MASSIVE neon orange/gold hero word.
 * Each hero word explodes in with a spring bounce (stiffness 420, damping 14),
 * wrapped in layered glow text-shadow that pulses at 2 Hz.
 * Parent has subtle perspective: 800px with static rotateX(-5deg).
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

export const Caption11 = ({ transcription }) => {
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

  // Glow pulse — 2 Hz sine wave
  const glowPulse = 0.75 + 0.25 * Math.sin(2 * Math.PI * 2 * (frame / fps));

  const neonGlow = `
    0 0 8px rgba(255,200,0,${glowPulse}),
    0 0 20px rgba(255,140,0,${glowPulse * 0.9}),
    0 0 50px rgba(255,80,0,${glowPulse * 0.7}),
    0 0 100px rgba(255,20,0,${glowPulse * 0.4}),
    2px 2px 0 rgba(0,0,0,0.9)
  `;

  // Hero entry: spring bounce from hero word's spoken timestamp
  const heroStartFrame = Math.round(heroWord.start * fps);
  const heroElapsed = Math.max(0, frame - heroStartFrame);
  const heroScale = spring({
    frame: heroElapsed,
    fps,
    from: 0.3,
    to: 1.0,
    config: { stiffness: 420, damping: 14 },
  });
  const heroOpacity = interpolate(heroElapsed, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitOpacity = interpolate(
    currentTime,
    [end - 0.35, end - 0.05],
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
          top: "38%",
          opacity: exitOpacity,
        }}
      >
        {/* Context words — small italic, fade in word-by-word */}
        {contextWords.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              marginBottom: "8px",
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
                    fontSize: 16,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontStyle: "italic",
                    color: `rgba(255,255,255,${wProg * 0.65})`,
                    textShadow: "0 1px 6px rgba(0,0,0,0.9)",
                    display: "inline-block",
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        )}

        {/* Hero word — neon orange with bloom glow and bounce */}
        <div style={{ perspective: "800px", perspectiveOrigin: "50% 100%" }}>
          <div
            style={{
              transform: `rotateX(-5deg) scale(${heroScale})`,
              transformOrigin: "center bottom",
              opacity: heroOpacity,
              display: "inline-block",
            }}
          >
            <span
              style={{
                fontSize: 78,
                fontFamily: "'Anton', sans-serif",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: 1.0,
                color: "#FF9900",
                textShadow: neonGlow,
                display: "block",
                textTransform: "uppercase",
              }}
            >
              {heroWord.word}
            </span>
          </div>
        </div>

        {/* Tail words */}
        {tailWords.length > 0 && (
          <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
            {tailWords.map((w, i) => {
              const wElapsed = Math.max(0, frame - Math.round(w.start * fps));
              const wProg = interpolate(wElapsed, [0, 5], [0, 1], {
                extrapolateRight: "clamp",
              });
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 16,
                    fontFamily: "'Inter', sans-serif",
                    fontStyle: "italic",
                    color: `rgba(255,255,255,${wProg * 0.65})`,
                    textShadow: "0 1px 6px rgba(0,0,0,0.9)",
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
