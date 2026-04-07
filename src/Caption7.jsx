/**
 * Caption7.jsx — Glowing Impact Captions
 *
 * 3-phase caption system:
 *
 *   Phase 1 — glowing headline near top of frame
 *              words reveal one-by-one with fade-in (no slide)
 *              emphasis word = orange with warmer glow
 *              after full phrase is shown, fades to 0.25 opacity (behind-speaker)
 *
 *   Phase 2 — centered plain bold white text
 *              no glow, whole phrase fades in together
 *              clean, direct, readable
 *
 *   Phase 3 — identical to Phase 1 (glowing top headline returns)
 */

import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { buildGlowPhrases } from "./captionHelpers7";

// ─── Constants ────────────────────────────────────────────────────────────────
const COMP_W = 390;
const COMP_H = 844;

const FONT         = "'Inter', 'SF Pro Display', system-ui, sans-serif";
const WHITE        = "#FFFFFF";
const ORANGE       = "#FF9A1F";

// Glow shadows — "lit from inside" feel
const WHITE_GLOW   =
  "0 0 18px rgba(255,255,255,0.92), 0 0 42px rgba(255,255,255,0.48), 0 2px 4px rgba(0,0,0,0.55)";
const ORANGE_GLOW  =
  "0 0 20px rgba(255,154,31,0.96), 0 0 52px rgba(255,154,31,0.58), 0 2px 4px rgba(0,0,0,0.60)";
const PLAIN_SHADOW =
  "0px 2px 8px rgba(0,0,0,0.88), 0px 0px 16px rgba(0,0,0,0.40)";

// Timing
const WORD_FADE_F  = 8;   // frames to fade each word in (phases 1 & 3)
const PHRASE_FADE_F = 10; // frames to fade whole phrase in (phase 2)
const HOLD_EXTRA   = 6;   // extra frames after last word before behind-fade begins
const BEHIND_F     = 14;  // frames to fade behind-speaker (to opacity 0.25)

// Font sizes (tuned for 390 px wide preview)
const TOP_SIZE      = 30;  // phases 1 & 3 base size
const TOP_EMPH_SIZE = 38;  // emphasis word larger
const CENTER_SIZE   = 26;  // phase 2

// ─── PhaseTopGlow ─────────────────────────────────────────────────────────────

/**
 * Renders a glowing word-by-word headline near the top of the frame.
 * Used for Phase 1 and Phase 3.
 *
 * Words appear one-by-one as their Whisper timestamps are crossed.
 * Once all words are shown, the block fades toward 0.25 opacity to
 * simulate the text falling behind the speaker.
 */
function PhaseTopGlow({ phrase, frame, fps }) {
  const words          = phrase.words;
  const emphIdx        = phrase.emphasisIndex;
  const lastWord       = words[words.length - 1];
  const lastWordFrame  = Math.round(lastWord.start * fps);
  const allShownFrame  = lastWordFrame + WORD_FADE_F + HOLD_EXTRA;
  const displayEndFr   = Math.round(phrase.displayEnd * fps);

  // Behind-speaker fade: begins after all words are shown.
  const behindProgress =
    frame > allShownFrame
      ? Math.min(1, (frame - allShownFrame) / BEHIND_F)
      : 0;
  const containerOpacity = 1 - behindProgress * 0.75; // 1 → 0.25

  // Split into max-2-word lines for a headline feel.
  const lines = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2));
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        width: "100%",
        textAlign: "center",
        paddingLeft: 20,
        paddingRight: 20,
        boxSizing: "border-box",
        opacity: containerOpacity,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {lines.map((lineWords, li) => (
        <div
          key={li}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "6px",
            lineHeight: 1.15,
            marginBottom: 4,
          }}
        >
          {lineWords.map((word, wi) => {
            const globalIdx  = li * 2 + wi;
            const wordStart  = Math.round(word.start * fps);

            // Word not yet visible.
            if (frame < wordStart) return null;

            const age     = frame - wordStart;
            const fadeIn  = Math.min(1, age / WORD_FADE_F);
            const isEmph  = globalIdx === emphIdx;
            const sz      = isEmph ? TOP_EMPH_SIZE : TOP_SIZE;

            return (
              <span
                key={wi}
                style={{
                  fontFamily:  FONT,
                  fontSize:    sz,
                  fontWeight:  isEmph ? 900 : 800,
                  fontStyle:   "normal",
                  color:       isEmph ? ORANGE : WHITE,
                  textShadow:  isEmph ? ORANGE_GLOW : WHITE_GLOW,
                  letterSpacing: 0,
                  lineHeight:  1.1,
                  display:     "inline-block",
                  opacity:     fadeIn,
                  // No translateX — pure fade only (no slide motion)
                }}
              >
                {word._text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── PhaseCenterPlain ─────────────────────────────────────────────────────────

/**
 * Renders a clean, centered, bold-white phrase with no glow.
 * The entire phrase fades in together over PHRASE_FADE_F frames.
 */
function PhaseCenterPlain({ phrase, frame, fps }) {
  const startFrame = Math.round(phrase.startTime * fps);
  const age        = Math.max(0, frame - startFrame);
  const fadeIn     = Math.min(1, age / PHRASE_FADE_F);
  const text       = phrase.words.map((w) => w._text).join(" ");

  return (
    <div
      style={{
        position: "absolute",
        top: "44%",
        width: "100%",
        textAlign: "center",
        paddingLeft: 24,
        paddingRight: 24,
        boxSizing: "border-box",
        opacity: fadeIn,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <span
        style={{
          fontFamily:  FONT,
          fontSize:    CENTER_SIZE,
          fontWeight:  700,
          fontStyle:   "normal",
          color:       WHITE,
          textShadow:  PLAIN_SHADOW,
          lineHeight:  1.2,
          display:     "block",
          whiteSpace:  "normal",
          wordBreak:   "break-word",
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Root Caption7 component ──────────────────────────────────────────────────

export const Caption7 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phrases = useMemo(
    () => buildGlowPhrases(transcription ?? []),
    [transcription]
  );

  // Find the active phrase at the current frame.
  const active = phrases.find(
    (p) => frame >= Math.round(p.startTime * fps) &&
           frame <  Math.round(p.displayEnd * fps)
  );

  if (!active) return null;

  if (active.phase === "phase2") {
    return (
      <PhaseCenterPlain
        key={active.id}
        phrase={active}
        frame={frame}
        fps={fps}
      />
    );
  }

  // Phase 1 or Phase 3 — glowing top headline
  return (
    <PhaseTopGlow
      key={active.id}
      phrase={active}
      frame={frame}
      fps={fps}
    />
  );
};
