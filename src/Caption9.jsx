/**
 * Caption9.jsx — migs.visuals Dynamic Caption Style
 *
 * Key behaviour: every phrase is pinned to its own Y position on screen.
 * When the next phrase becomes active the previous phrase stays exactly
 * where it was and fades out to nothing (ghosting in place), while the
 * new phrase appears fresh at a different Y position.  Up to 2 ghost
 * phrases remain visible simultaneously, blurring softly as they fade.
 *
 * All 10 features:
 * 1.  Word-by-word spring pop-in (stiffness 300, damping 18)
 * 2.  Mixed font sizing: filler ~20px/500w  |  emphasis ~36px/900w uppercase
 * 3.  Ghost-fade of previous phrases at their own Y positions (not stacked)
 * 4.  Gold (#FFD000) on last emphasis word of each phrase
 * 5.  Neon glow + 2 Hz sine pulse on gold words
 * 6.  Chromatic aberration (R/C split) on emphasis where globalIndex % 7 === 0
 * 7.  Italic serif for expressive words (crazy, wild, insane, …)
 * 8.  Single-word drama: isolated 44 px bold at upper-left for (but, no, wait…)
 * 9.  Y-position cycles 15 % / 55 % / 72 % by phraseIndex % 3
 * 10. Entrance direction: even phrases slide from bottom; odd phrases scale only
 */

import { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { buildPhrases } from "./captionHelpers9";

// ── Typography (scaled for 390 × 844 px canvas) ───────────────────────────────
const FONT_FILLER   = 20;   // ~52 px @ 1080 p
const FONT_EMPHASIS = 36;   // ~90 px @ 1080 p
const FONT_DRAMA    = 44;   // ~110 px @ 1080 p

const GOLD  = "#FFD000";
const WHITE = "#FFFFFF";

const FONT_PRIMARY    = "'Inter', 'DM Sans', 'Arial Black', sans-serif";
const FONT_EXPRESSIVE = "'Georgia', 'Caveat', serif";

// Y positions that cycle per phrase index
const Y_POSITIONS = ["15%", "55%", "72%"];

// ── Look-up sets ──────────────────────────────────────────────────────────────
const DRAMA_FILLER_WORDS = new Set(["but", "no", "wait", "yet", "so"]);
const EXPRESSIVE_WORDS   = new Set([
  "crazy","wild","insane","huge","tiny","fast","slow",
  "broken","perfect","best","worst","amazing","terrible",
]);

function normalizeWord(w) { return w.toLowerCase().replace(/[^a-z]/g, ""); }
function isDramaFillerWord(w) { return DRAMA_FILLER_WORDS.has(normalizeWord(w)); }
function isExpressiveWord(w)  { return EXPRESSIVE_WORDS.has(normalizeWord(w)); }

// ── Single-word renderer ──────────────────────────────────────────────────────
const Word = ({ wordObj, isLastInPhrase, isAnimated, frame, fps, isEvenPhrase }) => {
  const { word, globalIndex, isFiller: filler, start } = wordObj;

  const elapsed    = Math.max(0, frame - Math.round(start * fps));
  const springProg = isAnimated
    ? spring({ frame: elapsed, fps, from: 0, to: 1, config: { stiffness: 300, damping: 18 } })
    : 1;

  const scale = interpolate(springProg, [0, 1], [0.6, 1], { extrapolateRight: "clamp" });
  const ty    = isEvenPhrase && isAnimated
    ? interpolate(springProg, [0, 1], [20, 0], { extrapolateRight: "clamp" })
    : 0;

  const wordEmphasis = !filler;
  const wordGlitch   = wordEmphasis && globalIndex % 7 === 0;
  const wordGold     = wordEmphasis && isLastInPhrase;
  const wordExpress  = isExpressiveWord(word);

  // 2 Hz sine-wave glow pulse for gold words
  const glowA = wordGold ? 0.9 + 0.1 * Math.sin(2 * Math.PI * 2 * (frame / fps)) : 1;

  const textShadow = wordGold
    ? `0 0 12px rgba(255,208,0,${glowA}), 0 0 30px rgba(255,153,0,${glowA}), 0 0 6px rgba(255,255,255,${glowA})`
    : "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)";

  const displayText = wordEmphasis ? word.toUpperCase() : word;

  const baseStyle = {
    display:       "inline-block",
    fontSize:      filler ? FONT_FILLER : FONT_EMPHASIS,
    fontWeight:    filler ? 500 : 900,
    fontFamily:    wordExpress ? FONT_EXPRESSIVE : FONT_PRIMARY,
    fontStyle:     wordExpress ? "italic" : "normal",
    textTransform: wordEmphasis ? "uppercase" : "none",
    letterSpacing: wordEmphasis ? "-0.02em" : "normal",
    lineHeight:    1.1,
    color:         wordGold ? GOLD : WHITE,
    textShadow,
    margin:        "0 2px 2px 2px",
    verticalAlign: "baseline",
  };

  // ── Chromatic aberration ──────────────────────────────────────────────────
  if (wordGlitch) {
    return (
      <span style={{
        display: "inline-block", position: "relative",
        margin: "0 2px 2px 2px",
        transform: `scale(${scale}) translateY(${ty}px)`,
        transformOrigin: "center bottom",
      }}>
        <span style={{ ...baseStyle, position:"absolute", left:"-3px", top:0,
          color:"red", mixBlendMode:"screen", opacity:0.75, margin:0, transform:"none" }}>
          {displayText}
        </span>
        <span style={{ ...baseStyle, position:"absolute", left:"3px", top:0,
          color:"cyan", mixBlendMode:"screen", opacity:0.75, margin:0, transform:"none" }}>
          {displayText}
        </span>
        <span style={{ ...baseStyle, position:"relative", margin:0, transform:"none" }}>
          {displayText}
        </span>
      </span>
    );
  }

  return (
    <span style={{
      ...baseStyle,
      transform: `scale(${scale}) translateY(${ty}px)`,
      transformOrigin: "center bottom",
    }}>
      {displayText}
    </span>
  );
};

// ── Phrase block (a row of words at a fixed Y position) ───────────────────────
const PhraseBlock = ({ phrase, phraseIdx, isCurrent, opacity, frame, fps, isEvenPhrase }) => {
  // Ghost phrases get a gentle blur that grows as they fade to reinforce the ghost look
  const blurPx = isCurrent ? 0 : interpolate(opacity, [0, 0.45], [2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position:       "absolute",
      left:           0,
      right:          0,
      top:            Y_POSITIONS[phraseIdx % 3],
      display:        "flex",
      flexWrap:       "wrap",
      justifyContent: "center",
      alignItems:     "baseline",
      padding:        "0 12px",
      lineHeight:     1.1,
      opacity,
      filter:         blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : "none",
      pointerEvents:  "none",
    }}>
      {phrase.map((wordObj, i) => {
        // For ghost phrases all words are already fully revealed — no timing gate
        const visible = isCurrent ? frame >= Math.round(wordObj.start * fps) : true;
        if (!visible) return null;
        return (
          <Word
            key={`${phraseIdx}-${i}`}
            wordObj={wordObj}
            isLastInPhrase={i === phrase.length - 1}
            isAnimated={isCurrent}
            frame={frame}
            fps={fps}
            isEvenPhrase={isEvenPhrase}
          />
        );
      })}
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function phraseEndTime(phrases, idx) {
  if (idx + 1 < phrases.length) return phrases[idx + 1][0].start;
  const last = phrases[idx];
  return last[last.length - 1].end + 1;
}

// Opacity for a ghost phrase that ended at `ghostEnd` seconds ago.
// Fades to zero over `ghostDuration` seconds (≈ how long the phrase itself ran).
function ghostOpacity(currentTime, ghostEndTime, ghostDuration) {
  const elapsed = currentTime - ghostEndTime;
  return interpolate(
    elapsed,
    [0, Math.max(0.4, ghostDuration)],
    [0.45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export const Caption9 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phrases = useMemo(() => buildPhrases(transcription ?? []), [transcription]);

  const currentTime = frame / fps;

  // Find which phrase is currently active
  let activePhraseIdx = -1;
  for (let i = 0; i < phrases.length; i++) {
    const start = phrases[i][0].start;
    const end   = phraseEndTime(phrases, i);
    if (currentTime >= start && currentTime < end) {
      activePhraseIdx = i;
      break;
    }
  }

  if (activePhraseIdx === -1) return null;

  const currentPhrase = phrases[activePhraseIdx];

  // ── Feature 8: single-word drama ─────────────────────────────────────────
  if (currentPhrase.length === 1 && isDramaFillerWord(currentPhrase[0].word)) {
    const w       = currentPhrase[0];
    const elapsed = Math.max(0, frame - Math.round(w.start * fps));
    const sp      = spring({ frame: elapsed, fps, from: 0, to: 1, config: { stiffness: 300, damping: 18 } });
    const sc      = interpolate(sp, [0, 1], [0.6, 1], { extrapolateRight: "clamp" });
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", left: "5%", top: "20%",
          fontSize: FONT_DRAMA, fontWeight: 900, fontFamily: FONT_PRIMARY,
          color: WHITE, textTransform: "uppercase", letterSpacing: "-0.02em",
          textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          transform: `scale(${sc})`, transformOrigin: "left center",
        }}>
          {w.word.toUpperCase()}
        </div>
      </AbsoluteFill>
    );
  }

  // ── Gather ghost phrases (up to 2 previous) ───────────────────────────────
  // Each ghost stays pinned to its original Y position and fades independently.
  const ghosts = [];
  for (let back = 1; back <= 2; back++) {
    const gIdx = activePhraseIdx - back;
    if (gIdx < 0) break;
    const gEnd      = phraseEndTime(phrases, gIdx);
    const gDuration = gEnd - phrases[gIdx][0].start;
    const opacity   = ghostOpacity(currentTime, gEnd, gDuration);
    if (opacity > 0.01) {
      ghosts.push({ phraseIdx: gIdx, opacity });
    }
  }

  const isEvenPhrase = activePhraseIdx % 2 === 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Ghost phrases — rendered behind the current phrase */}
      {ghosts.map(({ phraseIdx, opacity }) => (
        <PhraseBlock
          key={`ghost-${phraseIdx}`}
          phrase={phrases[phraseIdx]}
          phraseIdx={phraseIdx}
          isCurrent={false}
          opacity={opacity}
          frame={frame}
          fps={fps}
          isEvenPhrase={false}
        />
      ))}

      {/* Current phrase — words animate in one by one */}
      <PhraseBlock
        phrase={currentPhrase}
        phraseIdx={activePhraseIdx}
        isCurrent={true}
        opacity={1}
        frame={frame}
        fps={fps}
        isEvenPhrase={isEvenPhrase}
      />
    </AbsoluteFill>
  );
};
