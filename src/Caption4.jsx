// ─── Style 4: Motivational Rhythm — Remotion caption component ───────────────
//
// Three phases driven by % position within total video duration:
//
//   Phase A (0 – 33 %)    LEFT top headline — whole block slides in from the
//                         left EDGE of the screen as a unit (bold/heavy).
//                         BOTTOM centered running subtitle — word-by-word,
//                         each new word slides in from its inline left.
//                         Max 4 words per line group to prevent overflow.
//
//   Phase B (33 – 66 %)   CENTER caption only — bigger/bolder than Phase A
//                         bottom; context line (white, 34 px semibold) stacked
//                         above emphasis line (teal, 60 px italic bold).
//                         No background, no overlay.
//
//   Phase C (66 – 100 %)  Centered text styled exactly like Phase A top
//                         (heavy white + teal italic for emphasis), but
//                         horizontally centred. Video is blurred behind the
//                         text via CSS backdrop-filter.

import { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  buildLineGroups,
  buildHighlightGroups,
  isEmphasisWord,
  toTitleCase,
} from "./captionHelpers4";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#F4F1EA",
  accent:  "#9BB8AE",
};

const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
// Lighter shadow — avoids the "background box" look
const SHADOW = "0 1px 8px rgba(0,0,0,0.78), 0 0 18px rgba(0,0,0,0.42)";

// ─── Font sizes ───────────────────────────────────────────────────────────────
// Phase A
const A_BOT_SZ  = 38;   // bottom running subtitle (4 words max)
const A_CTX_SZ  = 46;   // top headline — context words
const A_EMP_SZ  = 66;   // top headline — emphasis word (larger, teal)

// Phase B (bigger + bolder than Phase A bottom)
const B_CTX_SZ  = 34;   // center context line
const B_EMP_SZ  = 60;   // center emphasis line

// Phase C — same visual weight as Phase A top, just centered
const C_CTX_SZ  = A_CTX_SZ;   // 46 px — inherits Phase A top style
const C_EMP_SZ  = A_EMP_SZ;   // 66 px

// ─── Positions ────────────────────────────────────────────────────────────────
const A_TOP_Y  = 90;    // Phase A top headline block (px from top)
const A_BOT_Y  = 680;   // Phase A bottom subtitle vertical centre (px from top)
const A_PAD    = 30;    // Phase A top headline left-padding
const B_CY     = 410;   // Phase B caption vertical centre
const C_CY     = 440;   // Phase C caption vertical centre

// ─── Spring configs ───────────────────────────────────────────────────────────
// Bottom words: very short slide from the left (–15 px → 0) with a fast
// critically-damped spring (settles in ≈ 4 frames) so the brief overlap
// with the previous word is invisible at normal playback speed.
const SPR_WORD = { stiffness: 600, damping: 55 };
// Top headline BLOCK: dramatic slide from screen edge (off-screen left → 0)
const SPR_BLOCK = { stiffness: 140, damping: 22 };

// ─── slideIn helper (word-level) ─────────────────────────────────────────────
function slideInWord(frame, fps, wordStart) {
  const age = Math.max(0, frame - Math.round(wordStart * fps));
  // –15 px offset: word starts just barely left of its natural inline position
  // and snaps into place in ≈ 4 frames — preserves the left-entry feel
  // without overlapping the previous word long enough to look merged.
  const x   = spring({ frame: age, fps, config: SPR_WORD, from: -15, to: 0 });
  const op  = Math.min(1, age / 3);
  return { x, op };
}

// ─── WordRow helper ───────────────────────────────────────────────────────────
// Renders a centered flex row of words, applying slide-in to the newest word.
function WordRow({ words, lastWord, frame, fps, size, weight, italic = false, color, wrap = false }) {
  return (
    <div
      style={{
        display:        "flex",
        flexWrap:       wrap ? "wrap" : "nowrap",
        gap:            "10px",
        justifyContent: "center",
        overflow:       "hidden",
      }}
    >
      {words.map((w) => {
        const raw   = w._t ?? w.word ?? w.text ?? "";
        const isNew = lastWord && w.start === lastWord.start;
        const { x, op } = isNew ? slideInWord(frame, fps, w.start) : { x: 0, op: 1 };
        return (
          <span
            key={w.start}
            style={{
              display:       "inline-block",
              fontFamily:    FONT,
              fontSize:      size,
              fontWeight:    weight,
              fontStyle:     italic ? "italic" : "normal",
              color,
              textShadow:    SHADOW,
              letterSpacing: "-0.015em",
              whiteSpace:    "nowrap",
              transform:     isNew ? `translateX(${x}px)` : "none",
              opacity:       isNew ? op : 1,
            }}
          >
            {toTitleCase(raw)}
          </span>
        );
      })}
    </div>
  );
}

// ─── Phase A: Bottom running subtitle ────────────────────────────────────────
// Centered, thin, 1 line, word-by-word slide from inline-left.
// Hard max-width + overflow:hidden prevent the line from stretching wider than
// the composition (the root cause of the horizontal overflow bug).
function PhaseABottom({ group, frame, fps }) {
  if (!group) return null;
  const t       = frame / fps;
  // Show only words that have been spoken
  const visible = group.words.filter((w) => t >= w.start);
  if (!visible.length) return null;

  const last = visible[visible.length - 1];

  return (
    <div
      style={{
        position:       "absolute",
        top:            A_BOT_Y,
        left:           0,
        right:          0,
        display:        "flex",
        justifyContent: "center",
        transform:      "translateY(-50%)",
      }}
    >
      {/* Fixed width container — strictly clips any overflow */}
      <div style={{ width: "360px", overflow: "hidden", display: "flex", justifyContent: "center" }}>
        <WordRow
          words={visible}
          lastWord={last}
          frame={frame}
          fps={fps}
          size={A_BOT_SZ}
          weight={isEmphasisWord(last._t ?? last.word ?? last.text ?? "") ? 500 : 300}
          color={"#FFFFFF"}
        />
      </div>
    </div>
  );
}

// ─── Phase A: Top headline ─────────────────────────────────────────────────────
// Left-aligned. The WHOLE BLOCK slides in from off-screen LEFT as a unit
// (not word-by-word). The translateX spring gives it a strong energetic entry.
function PhaseATop({ group, opacity, translateX }) {
  if (!group || !opacity) return null;

  const empSet = new Set(
    group.emphasisWords.map((e) => e.toLowerCase().replace(/[^a-z]/g, ""))
  );
  const contextWords = [];
  const emphWords    = [];

  group.words.forEach((w) => {
    const raw = w._t ?? w.word ?? w.text ?? "";
    const key = raw.toLowerCase().replace(/[^a-z]/g, "");
    if (empSet.has(key)) emphWords.push(toTitleCase(raw));
    else contextWords.push(toTitleCase(raw));
  });

  return (
    <div
      style={{
        position:  "absolute",
        top:       A_TOP_Y,
        left:      A_PAD,
        right:     A_PAD,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Context words: bold white */}
      {contextWords.length > 0 && (
        <p
          style={{
            fontFamily:    FONT,
            fontSize:      A_CTX_SZ,
            fontWeight:    700,
            color:         C.primary,
            margin:        0,
            lineHeight:    1.15,
            letterSpacing: "-0.018em",
            textShadow:    SHADOW,
          }}
        >
          {contextWords.join(" ")}
        </p>
      )}
      {/* Emphasis word: larger, teal, italic */}
      {emphWords.length > 0 && (
        <p
          style={{
            fontFamily:    FONT,
            fontSize:      A_EMP_SZ,
            fontWeight:    800,
            fontStyle:     "italic",
            color:         C.accent,
            margin:        0,
            lineHeight:    1.05,
            letterSpacing: "-0.022em",
            textShadow:    "0 1px 14px rgba(0,0,0,0.65)",
          }}
        >
          {emphWords.join(" ")}
        </p>
      )}
    </div>
  );
}

// ─── Phase B: Centered caption (bigger + bolder) ──────────────────────────────
// Context words on line 1 (34 px, semibold, white).
// Emphasis words on line 2 (60 px, bold italic, teal).
// Word-by-word slide-in on newest word.
function PhaseBCenter({ group, frame, fps }) {
  if (!group) return null;
  const t       = frame / fps;
  const visible = group.words.filter((w) => t >= w.start);
  if (!visible.length) return null;

  const last        = visible[visible.length - 1];
  const hasEmphasis = visible.some((w) => isEmphasisWord(w._t ?? w.word ?? w.text ?? ""));

  if (hasEmphasis) {
    const ctxW = visible.filter((w) => !isEmphasisWord(w._t ?? w.word ?? w.text ?? ""));
    const empW = visible.filter((w) =>  isEmphasisWord(w._t ?? w.word ?? w.text ?? ""));
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        {ctxW.length > 0 && (
          <WordRow words={ctxW} lastWord={last} frame={frame} fps={fps}
            size={B_CTX_SZ} weight={600} color={C.primary} />
        )}
        <WordRow words={empW} lastWord={last} frame={frame} fps={fps}
          size={B_EMP_SZ} weight={700} italic={true} color={C.accent} />
      </div>
    );
  }

  return (
    <WordRow words={visible} lastWord={last} frame={frame} fps={fps}
      size={B_CTX_SZ} weight={600} color={C.primary} />
  );
}

// ─── Phase C: Centered, styled like Phase A top, over blurred video ───────────
// Same visual weight as Phase A headline (heavy white + teal italic) but
// horizontally CENTRED. The blur effect comes from backdrop-filter on the
// overlay div (blurs everything behind it = the video).
function PhaseCCaption({ group, frame, fps }) {
  if (!group) return null;
  const t       = frame / fps;
  const visible = group.words.filter((w) => t >= w.start);
  if (!visible.length) return null;

  const last        = visible[visible.length - 1];
  const hasEmphasis = visible.some((w) => isEmphasisWord(w._t ?? w.word ?? w.text ?? ""));

  if (hasEmphasis) {
    const ctxW = visible.filter((w) => !isEmphasisWord(w._t ?? w.word ?? w.text ?? ""));
    const empW = visible.filter((w) =>  isEmphasisWord(w._t ?? w.word ?? w.text ?? ""));
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        {ctxW.length > 0 && (
          <WordRow words={ctxW} lastWord={last} frame={frame} fps={fps}
            size={C_CTX_SZ} weight={700} color={C.primary} />
        )}
        <WordRow words={empW} lastWord={last} frame={frame} fps={fps}
          size={C_EMP_SZ} weight={800} italic={true} color={C.accent} />
      </div>
    );
  }

  // No emphasis word: all words bold white
  return (
    <WordRow words={visible} lastWord={last} frame={frame} fps={fps}
      size={C_CTX_SZ} weight={700} color={C.primary} wrap={true} />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const Caption4 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // maxPerLine = 3 — 3 words at 38 px still fits comfortably in 390 px;
  // 4 words caused horizontal overflow for longer words like "Money".
  const lineGroups = useMemo(() => buildLineGroups(transcription ?? [], 3), [transcription]);
  const highlights = useMemo(() => buildHighlightGroups(lineGroups, 1.5), [lineGroups]);

  if (!lineGroups.length) return null;

  const t        = frame / fps;
  const totalSec = durationInFrames / fps;
  const phase    = t < totalSec / 3 ? "A" : t < (totalSec * 2) / 3 ? "B" : "C";

  const activeGroup = lineGroups.find((g) => t >= g.start && t < g.end) ?? null;

  // Phase A — top headline: find active highlight + compute block-level slide-in
  let activeHL    = null;
  let hlOpacity   = 0;
  let hlTranslateX = 0;

  if (phase === "A") {
    const cands = highlights.filter((h) => t >= h.start && t < h.end);
    if (cands.length) {
      activeHL = cands[cands.length - 1];

      // Opacity ramp (6 frames in / out)
      const RAMP = 6;
      const sF   = Math.round(activeHL.start * fps);
      const eF   = Math.round(activeHL.end   * fps);
      hlOpacity  = Math.max(0, Math.min(1,
        Math.min((frame - sF) / RAMP, (eF - frame) / RAMP)
      ));

      // Whole-block slide-in from the left EDGE of the screen (–360 px → 0).
      // Begins when the highlight first appears.
      const slideAge = Math.max(0, frame - sF);
      hlTranslateX   = spring({
        frame:  slideAge,
        fps,
        config: SPR_BLOCK,
        from:   -360,
        to:     0,
      });
    }
  }

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>

      {/* ── Phase C: blurred video backdrop + very light dark tint ── */}
      {phase === "C" && (
        <div
          style={{
            position:            "absolute",
            inset:               0,
            // backdrop-filter blurs all video content behind this div
            backdropFilter:      "blur(12px)",
            WebkitBackdropFilter:"blur(12px)",
            // Subtle dark tint so text still reads on bright video
            background:          "rgba(0,0,0,0.18)",
          }}
        />
      )}

      {/* ── Phase A: bottom running subtitle ── */}
      {phase === "A" && (
        <PhaseABottom group={activeGroup} frame={frame} fps={fps} />
      )}

      {/* ── Phase A: top headline block (slides in from screen-left) ── */}
      {phase === "A" && activeHL && (
        <PhaseATop
          group={activeHL}
          opacity={hlOpacity}
          translateX={hlTranslateX}
        />
      )}

      {/* ── Phase B: centered caption ── */}
      {phase === "B" && (
        <div
          style={{
            position:       "absolute",
            top:            B_CY,
            left:           0,
            right:          0,
            display:        "flex",
            justifyContent: "center",
            transform:      "translateY(-50%)",
          }}
        >
          <PhaseBCenter group={activeGroup} frame={frame} fps={fps} />
        </div>
      )}

      {/* ── Phase C: centered caption (Phase-A-top style, blurred bg) ── */}
      {phase === "C" && (
        <div
          style={{
            position:       "absolute",
            top:            C_CY,
            left:           0,
            right:          0,
            display:        "flex",
            justifyContent: "center",
            transform:      "translateY(-50%)",
          }}
        >
          <PhaseCCaption group={activeGroup} frame={frame} fps={fps} />
        </div>
      )}

    </div>
  );
};
