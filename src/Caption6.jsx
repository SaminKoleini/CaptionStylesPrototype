/**
 * Caption6.jsx — Progressive Quote Stack
 *
 * Lines build one-by-one into a centered stacked composition.
 * All previous lines stay visible. Once all lines are shown the
 * full text block is perfectly centred in the frame.
 *
 * Rendering model:
 *   1. Split the transcript into balanced lines (~5 words each).
 *   2. Compute where the first line must start so the finished block
 *      is vertically centred (calculateCenteredStartY).
 *   3. Each line fades in softly with a tiny upward settle when it
 *      first appears; after that it remains fully opaque.
 *   4. The current visible line count grows over time using
 *      Whisper word timestamps (or an even distribution fallback).
 */

import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { splitIntoLines, computeStartY, getVisibleLineCount } from "./captionHelpers6";

// ─── Composition constants ────────────────────────────────────────────────────
const COMP_W = 390;
const COMP_H = 844;

// ─── Default style values ─────────────────────────────────────────────────────
const DEFAULT_FONT        = "'Cormorant Garamond', 'Bodoni Moda', 'Playfair Display', serif";
const DEFAULT_COLOR       = "#E0C04D";   // warm academic gold
const DEFAULT_FONT_SIZE   = 26;          // px — smaller so 4 words fit without overflow
const DEFAULT_LINE_HEIGHT = 1.45;        // generous line spacing for elegance
const DEFAULT_MAX_WORDS   = 4;
const MAX_WIDTH           = 310;         // px — leaves ~40 px padding each side in 390 comp
const FADE_FRAMES         = 14;          // frames for each line to fade in
const DRIFT_PX            = 5;           // subtle upward settle during fade

/**
 * Caption6
 *
 * Props:
 *   transcription   — Whisper word array: { word|text, start, end }[]
 *   fontFamily      — CSS font family
 *   fontSize        — number (px)
 *   color           — CSS color string
 *   lineHeight      — CSS line-height multiplier
 *   maxWordsPerLine — integer (default 5)
 *   fadeFrames      — frames for fade-in per line
 */
export const Caption6 = ({
  transcription,
  fontFamily      = DEFAULT_FONT,
  fontSize        = DEFAULT_FONT_SIZE,
  color           = DEFAULT_COLOR,
  lineHeight      = DEFAULT_LINE_HEIGHT,
  maxWordsPerLine = DEFAULT_MAX_WORDS,   // 4 words → ~4 lines for a 13-word quote
  fadeFrames      = FADE_FRAMES,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const currentTime  = frame / fps;
  const totalDuration = durationInFrames / fps;

  // ── Build lines once ───────────────────────────────────────────────────────
  const lines = useMemo(
    () => splitIntoLines(transcription ?? [], maxWordsPerLine),
    [transcription, maxWordsPerLine]
  );

  // ── Layout: where does the first line start? ───────────────────────────────
  const startY = useMemo(
    () => computeStartY(lines.length, fontSize, lineHeight, COMP_H),
    [lines.length, fontSize, lineHeight]
  );

  const lineHeightPx = fontSize * lineHeight;

  // ── How many lines are currently visible? ─────────────────────────────────
  const visibleCount = getVisibleLineCount(lines, currentTime, totalDuration);

  if (visibleCount === 0 || !lines.length) return null;

  // ── Determine per-line reveal frame (when does each line first appear) ────
  // We need the frame at which each line was first shown so we can animate
  // its individual fade-in independent of all other lines.
  //
  // Strategy: mirror getVisibleLineCount logic to find the exact frame where
  // line[i] became visible, then compute age = frame - revealFrame[i].
  const hasRealTimings = lines.some((l) => l.start > 0 && l.start < totalDuration);

  function getRevealFrame(lineIdx) {
    if (hasRealTimings) {
      return Math.round(lines[lineIdx].start * fps);
    }
    const interval = totalDuration / lines.length;
    return Math.round(lineIdx * interval * fps);
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {/* Spacer that pushes the text block to the correct vertical start */}
      <div style={{ height: startY, flexShrink: 0 }} />

      {lines.slice(0, visibleCount).map((line, li) => {
        const revealFrame = getRevealFrame(li);
        const age         = Math.max(0, frame - revealFrame);
        const fadeProgress = Math.min(1, age / fadeFrames);

        // Tiny upward settle: starts DRIFT_PX below resting, rises to 0.
        const translateY = (1 - fadeProgress) * DRIFT_PX;

        return (
          <div
            key={li}
            style={{
              minHeight: lineHeightPx,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: MAX_WIDTH,
              maxWidth: MAX_WIDTH,
              overflow: "hidden",
              opacity: fadeProgress,
              transform: `translateY(${translateY}px)`,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize,
                fontWeight: 300,
                fontStyle: "normal",
                color,
                letterSpacing: "-0.01em",
                lineHeight,
                textAlign: "center",
                textShadow: "0 0 22px rgba(224,192,77,0.18), 0 1px 4px rgba(0,0,0,0.22)",
                userSelect: "none",
                whiteSpace: "normal",
                wordBreak: "break-word",
                display: "block",
                width: "100%",
              }}
            >
              {line.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};
