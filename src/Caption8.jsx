/**
 * Caption8.jsx — Staircase Impact
 *
 * 3-phase caption system:
 *
 *   Phase 1 — words build one-by-one into a left-anchored staircase stack.
 *             Each word shifts slightly rightward. Final word: yellow + underline.
 *
 *   Phase 2 — centered line-by-line captions (max 3 words/line), no staircase.
 *
 *   Phase 3 — staircase returns, same as Phase 1.
 *             Final word: red + underline (the closing punchline).
 */

import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { buildStaircaseGroups, groupPhase2Lines } from "./captionHelpers8";

// ─── Constants ────────────────────────────────────────────────────────────────
const COMP_H      = 844;
const FONT        = "'Anton', 'Inter', system-ui, sans-serif";
const WORD_FADE   = 6;      // frames to fade each staircase word in
const LINE_FADE   = 8;      // frames to fade each phase-2 line in
const STEP_PX     = 22;     // rightward shift per word line (staircase)
const LEFT_ANCHOR = 22;     // px from left edge for first word
const LINE_H_TOP  = 46;     // px between staircase lines
const TOP_SZ      = 34;     // px — normal staircase word
const EMPH_SZ     = 48;     // px — final emphasized word
const CTR_SZ      = 22;     // px — phase 2 centered text
const YELLOW      = "#F0D126";
const RED         = "#E53935";
const WHITE       = "#FFFFFF";
const SHADOW      = "2px 2px 0px rgba(0,0,0,0.95), 0px 0px 10px rgba(0,0,0,0.55)";

// ─── StaircaseGroup ───────────────────────────────────────────────────────────

/**
 * Renders one staircase phrase group word-by-word.
 * Each word appears on its own line, shifted progressively rightward.
 * The final word is rendered in `highlightColor` with an underline.
 *
 * Props:
 *   group          — { words, start, end, displayEnd }
 *   highlightColor — YELLOW or RED
 *   topPct         — vertical start position (0–1 fraction of COMP_H)
 *   frame / fps
 */
function StaircaseGroup({ group, highlightColor, topPct, frame, fps }) {
  const words   = group.words;
  const lastIdx = words.length - 1;

  return (
    <div
      style={{
        position:   "absolute",
        top:        `${Math.round(topPct * COMP_H)}px`,
        left:       0,
        width:      "100%",
        pointerEvents: "none",
        userSelect:    "none",
      }}
    >
      {words.map((word, wi) => {
        const wordFrame = Math.round(word.start * fps);
        if (frame < wordFrame) return null;

        const age    = frame - wordFrame;
        const fadeIn = Math.min(1, age / WORD_FADE);
        const isLast = wi === lastIdx;
        const sz     = isLast ? EMPH_SZ : TOP_SZ;

        const x = LEFT_ANCHOR + wi * STEP_PX;
        const y = wi * LINE_H_TOP;

        return (
          <div
            key={wi}
            style={{
              position:  "absolute",
              left:      x,
              top:       y,
              opacity:   fadeIn,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily:  FONT,
                fontSize:    sz,
                fontWeight:  900,
                fontStyle:   isLast ? "italic" : "normal",
                color:       isLast ? highlightColor : WHITE,
                textShadow:  SHADOW,
                letterSpacing: 0,
                lineHeight:  1,
                display:     "inline-block",
                // Underline via border — more reliable than text-decoration
                // across different font rendering engines.
                borderBottom: isLast
                  ? `3px solid ${highlightColor}`
                  : "none",
                paddingBottom: isLast ? 2 : 0,
              }}
            >
              {word._text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── CenteredLineCaptions ─────────────────────────────────────────────────────

/**
 * Shows one line at a time from `lines`, centered, fading in gently.
 * Used for Phase 2 (the middle running caption section).
 */
function CenteredLineCaptions({ lines, frame, fps }) {
  const activeLine = lines.find(
    (l) =>
      frame >= Math.round(l.start * fps) &&
      frame <  Math.round(l.displayEnd * fps)
  );

  if (!activeLine) return null;

  const startFr = Math.round(activeLine.start * fps);
  const fadeIn  = Math.min(1, Math.max(0, frame - startFr) / LINE_FADE);

  return (
    <div
      style={{
        position:   "absolute",
        top:        "44%",
        width:      "100%",
        textAlign:  "center",
        paddingLeft:  24,
        paddingRight: 24,
        boxSizing:  "border-box",
        opacity:    fadeIn,
        pointerEvents: "none",
        userSelect:    "none",
      }}
    >
      <span
        style={{
          fontFamily:  FONT,
          fontSize:    CTR_SZ,
          fontWeight:  700,
          color:       WHITE,
          textShadow:  SHADOW,
          lineHeight:  1.2,
          display:     "block",
          whiteSpace:  "normal",
          wordBreak:   "break-word",
        }}
      >
        {activeLine.text}
      </span>
    </div>
  );
}

// ─── Root Caption8 ────────────────────────────────────────────────────────────

export const Caption8 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { phase1, phase2Lines, phase3 } = useMemo(
    () => buildStaircaseGroups(transcription ?? []),
    [transcription]
  );

  const t = frame / fps;

  // Determine which phase is active.
  const inPhase1 = phase1.words?.length > 0 &&
    t >= phase1.start && t < phase1.displayEnd;

  const inPhase3 = phase3.words?.length > 0 &&
    t >= phase3.start && t < phase3.displayEnd;

  const inPhase2 = !inPhase1 && !inPhase3 &&
    phase2Lines.some(
      (l) => frame >= Math.round(l.start * fps) &&
             frame <  Math.round(l.displayEnd * fps)
    );

  if (inPhase1) {
    return (
      <StaircaseGroup
        key="phase1"
        group={phase1}
        highlightColor={YELLOW}
        topPct={0.18}
        frame={frame}
        fps={fps}
      />
    );
  }

  if (inPhase3) {
    return (
      <StaircaseGroup
        key="phase3"
        group={phase3}
        highlightColor={RED}
        topPct={0.22}
        frame={frame}
        fps={fps}
      />
    );
  }

  if (inPhase2) {
    return (
      <CenteredLineCaptions
        lines={phase2Lines}
        frame={frame}
        fps={fps}
      />
    );
  }

  return null;
};
