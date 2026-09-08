/**
 * Caption12.jsx — "Retro Signal" (v5b)
 *
 * Four phases:
 *   Phase 1 – INTRO  (0–2 s):          Centered scanline title (parasite glitch) +
 *                                        Merriweather captions right above title
 *   Phase 2 – BODY   (2 s → last 6 s): Merriweather captions at 30% from bottom
 *   Phase 3 – OUTRO  (last 6 s → 3 s): Big scanline title + captions ON TOP
 *   Phase 4 – FINALE (last 3 s → end): Narrow centered scrolling topic words + mask hole
 *                                        over head/shoulder (from face box); optional
 *                                        speakerFaceBox → tight duplicate Video mask so
 *                                        text sits behind the face only; green wash over
 *                                        the whole lower half (including speaker).
 *
 * Caption style: Merriweather 700/900, pure white, no background box, no border shadows.
 */

import { useMemo } from "react";
import {
  AbsoluteFill, interpolate, spring, Video,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import { buildPhrases3D } from "./captionHelpers10";

/** Longer readable hold: extend phrase display until min(naturalEnd + linger, next phrase start). */
function getActiveCaptionPhrase(phrases, currentTime, lingerSec = 0.55) {
  if (!phrases?.length) return null;
  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    const start = phrase.words[0].start;
    const lastWord = phrase.words[phrase.words.length - 1];
    const baseEnd =
      i + 1 < phrases.length
        ? phrases[i + 1].words[0].start
        : lastWord.end + 0.6;
    const nextStart = i + 1 < phrases.length ? phrases[i + 1].words[0].start : Infinity;
    const displayEnd = Math.min(baseEnd + lingerSec, nextStart);
    if (currentTime >= start && currentTime < displayEnd) {
      return { phrase, idx: i, start, end: displayEnd };
    }
  }
  return null;
}

/** Default face ellipse (0–1) when no vision data — upper-centre talking-head. */
const DEFAULT_FACE_BOX = { xPct: 0.28, yPct: 0.1, wPct: 0.44, hPct: 0.28 };

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Alpha mask for duplicate finale Video: white = show clip (face only), transparent elsewhere.
 * @param {{ xPct: number, yPct: number, wPct: number, hPct: number }} box
 */
function subjectBoxToMaskImage(box) {
  const b = {
    xPct: clamp01(box.xPct),
    yPct: clamp01(box.yPct),
    wPct: Math.max(0.06, clamp01(box.wPct)),
    hPct: Math.max(0.08, clamp01(box.hPct)),
  };
  const cx = (b.xPct + b.wPct / 2) * 100;
  const cy = (b.yPct + b.hPct / 2) * 100;
  const tight = b.hPct < 0.34;
  const rx = Math.min(48, (b.wPct / 2) * 100 * (tight ? 1.02 : 0.95) + (tight ? 4 : 5));
  const ry = Math.min(52, (b.hPct / 2) * 100 * (tight ? 1.05 : 0.95) + (tight ? 5 : 6));
  return `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 48%, rgba(255,255,255,0.55) 62%, rgba(255,255,255,0.1) 72%, transparent 78%)`;
}

/** Grow face box downward/sideways so motional text can be masked off head + shoulder + arm. */
function expandFaceToUpperBodyAvoid(face) {
  const f = face ?? DEFAULT_FACE_BOX;
  return {
    xPct: clamp01(f.xPct - 0.11),
    yPct: clamp01(f.yPct - 0.035),
    wPct: Math.min(0.94, f.wPct + 0.26),
    hPct: Math.min(0.9, f.hPct + 0.44),
  };
}

/** Vision subject box + light padding — best hole for “no text on torso/hood” (when API returns it). */
function padSubjectBoxForScrollAvoid(sub) {
  return {
    xPct: clamp01(sub.xPct - 0.045),
    yPct: clamp01(sub.yPct - 0.035),
    wPct: Math.min(0.98, sub.wPct + 0.09),
    hPct: Math.min(0.94, sub.hPct + 0.12),
  };
}

/** Mask for scrolling text: transparent in centre = hide words over speaker; white outside = show. */
function scrollMotionalAvoidMask(avoidBox) {
  const b = {
    xPct: clamp01(avoidBox.xPct),
    yPct: clamp01(avoidBox.yPct),
    wPct: Math.max(0.12, clamp01(avoidBox.wPct)),
    hPct: Math.max(0.18, clamp01(avoidBox.hPct)),
  };
  const cx = (b.xPct + b.wPct / 2) * 100;
  const cy = (b.yPct + b.hPct / 2) * 100;
  const rx = Math.min(58, (b.wPct / 2) * 100 * 1.06 + 10);
  const ry = Math.min(64, (b.hPct / 2) * 100 * 1.04 + 12);
  return `radial-gradient(ellipse ${rx}% ${ry}% at ${cx}% ${cy}%, transparent 0%, transparent 48%, rgba(255,255,255,0.2) 58%, rgba(255,255,255,1) 72%, rgba(255,255,255,1) 100%)`;
}

// ── Colour / typography constants ─────────────────────────────────────────────
const SCANLINE_COLOR  = "#D4FF00";
const WHITE           = "#FFFFFF";
const MERRIWEATHER    = "'Merriweather', serif";
const ANTON           = "'Anton', sans-serif";

// ── Filler word set ───────────────────────────────────────────────────────────
const FILLER = new Set([
  "a","an","the","is","it","in","on","to","do","by","no","so","but","and",
  "of","for","at","with","my","i","we","they","he","she","you","are","was",
  "were","not","your","its","this","that","or","as","be","been","have","has",
  "had","will","would","can","could","should","just","very","get","go","also",
  "even","still","like","what","how","when","who","which","if","then","here",
  "there","from","about","up","out","some","one","all","more","most","into",
  "now","well","them","their","our","us","me","him","her","got","let",
]);

function isFillerWord(w) {
  return FILLER.has(w.toLowerCase().replace(/[^a-z]/g, ""));
}

// ── Extract 2 topic words ─────────────────────────────────────────────────────
function getTopicWords(transcription, position) {
  if (!transcription?.length) return ["VIDEO", "TOPIC"];
  const slice = position === "start"
    ? transcription.slice(0, Math.min(25, transcription.length))
    : transcription.slice(Math.max(0, Math.floor(transcription.length * 0.65)));
  const content = slice.filter(w => !isFillerWord(w.word));
  if (!content.length) {
    const fb = transcription.find(w => !isFillerWord(w.word));
    return fb ? [fb.word.toUpperCase()] : ["CONTENT"];
  }
  const sorted = [...content].sort((a, b) => b.word.length - a.word.length);
  return sorted.slice(0, 2).map(w => w.word.replace(/[^a-zA-Z]/g, "").toUpperCase());
}

// ── Parasite scanline word — glitch strength 0 = stable title; ramps on exit only
const ParasiteScanlineWord = ({ word, frame, fontSize, parasiteStrength = 0 }) => {
  const chars = word.split("");
  const len   = Math.max(1, chars.length);
  const g1 = 1 % len;
  const g2 = Math.min(3, len - 1);
  const s  = Math.max(0, Math.min(1, parasiteStrength));

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {chars.map((ch, i) => {
        const isGlitch = len > 2 && (i === g1 || i === g2);
        const gX = isGlitch ? Math.sin(frame * 0.65 + i * 2.1) * 5 * s : 0;
        const gY = isGlitch ? Math.cos(frame * 0.85 + i * 1.5) * 3 * s : 0;
        return (
          <span key={i} style={{
            fontSize,
            fontFamily: ANTON,
            fontStyle: "italic",
            letterSpacing: "0.02em",
            lineHeight: 0.95,
            color: SCANLINE_COLOR,
            textShadow: "0 0 28px rgba(180,255,0,0.55), 0 2px 14px rgba(0,0,0,0.85)",
            display: "inline-block",
            textTransform: "uppercase",
            transform: `translateX(${gX}px) translateY(${gY}px)`,
          }}>
            {ch}
          </span>
        );
      })}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(0,0,0,0.42) 3px, rgba(0,0,0,0.42) 4px)",
        pointerEvents: "none",
      }} />
    </div>
  );
};

// ── Scanline block with parasite (Phases 1 & 3) — parasiteStrength 0 = clean title
const ScanlineBlockParasite = ({
  words,
  frame,
  fontSize0 = 94,
  fontSize1 = 84,
  parasiteStrength = 0,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
    {words.map((w, i) => (
      <ParasiteScanlineWord
        key={i}
        word={w}
        frame={frame}
        fontSize={i === 0 ? fontSize0 : fontSize1}
        parasiteStrength={parasiteStrength}
      />
    ))}
  </div>
);

// ── Outlined word (Phase 4 background scroll) ────────────────────────────────
// Large hollow text with chromatic aberration layers + scanline texture,
// matching the reference style (big, full-width, outlined, RGB offset).
const OutlinedLine = ({ text, fontSize = 145 }) => {
  const sharedStyle = {
    fontSize,
    fontFamily: ANTON,
    fontStyle: "italic",
    letterSpacing: "0.01em",
    lineHeight: 0.92,
    textTransform: "uppercase",
    display: "block",
    whiteSpace: "nowrap",
  };
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Dark depth shadow (bottom-right offset for 3D extrusion feel) */}
      <span style={{ ...sharedStyle, position: "absolute", left: "6px", top: "6px", color: "rgba(0,0,0,0.45)" }}>{text}</span>
      {/* Cyan chromatic layer */}
      <span style={{ ...sharedStyle, position: "absolute", left: "5px", top: "-3px", color: "transparent", WebkitTextStroke: "3px rgba(0,200,255,0.65)" }}>{text}</span>
      {/* Red chromatic layer */}
      <span style={{ ...sharedStyle, position: "absolute", left: "-5px", top: "3px", color: "transparent", WebkitTextStroke: "3px rgba(255,40,80,0.65)" }}>{text}</span>
      {/* Main white outline */}
      <span style={{ ...sharedStyle, position: "relative", color: "transparent", WebkitTextStroke: "3.5px rgba(255,255,255,0.92)" }}>{text}</span>
      {/* Scanline texture */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 4px)",
        pointerEvents: "none",
      }} />
    </div>
  );
};

const MAX_WORDS_PER_CAPTION_LINE = 4;

// ── Line caption — one row, max 4 words; words appear in order as each starts; no fades
// Hero = last content word in phrase (e.g. “nice” in “I am nice”) — clearly larger.
// Long phrases: sequential chunks of ≤4 words (only one row at a time).
const LineCaption = ({
  phrase,
  currentTime,
  regularSize = 26,
  heroSize = 44,
  flashy = false,
  frame = 0,
}) => {
  const { words, heroIdx } = phrase;

  const chunks = [];
  for (let i = 0; i < words.length; i += MAX_WORDS_PER_CAPTION_LINE) {
    chunks.push(words.slice(i, i + MAX_WORDS_PER_CAPTION_LINE));
  }

  let activeChunkIdx = 0;
  for (let c = chunks.length - 1; c >= 0; c--) {
    if (currentTime >= chunks[c][0].start) {
      activeChunkIdx = c;
      break;
    }
  }
  const lineWords = chunks[activeChunkIdx] ?? [];
  const chunkOffset = activeChunkIdx * MAX_WORDS_PER_CAPTION_LINE;

  const highlightPulse = flashy ? 0.88 + 0.12 * Math.sin(frame * 0.38) : 1;
  const flashyShadow = flashy
    ? `0 0 ${Math.round(18 * highlightPulse)}px rgba(255,255,255,0.95),
       0 0 ${Math.round(42 * highlightPulse)}px rgba(255,255,255,0.55),
       0 0 ${Math.round(72 * highlightPulse)}px rgba(200,255,255,0.35),
       0 2px 0 rgba(0,0,0,0.9),
       0 4px 12px rgba(0,0,0,0.75)`
    : "none";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        gap: "10px",
        alignItems: "baseline",
        justifyContent: flashy ? "center" : "flex-start",
        maxWidth: "92%",
      }}
    >
      {lineWords.map((w, wi) => {
        if (currentTime < w.start) return null;
        const globalIdx = chunkOffset + wi;
        const isHero = globalIdx === heroIdx;
        return (
          <span
            key={`${activeChunkIdx}-${wi}`}
            style={{
              fontFamily: MERRIWEATHER,
              fontWeight: isHero ? 900 : 700,
              fontSize: isHero ? heroSize : regularSize,
              color: WHITE,
              letterSpacing: isHero ? "-0.02em" : "0.02em",
              display: "inline-block",
              lineHeight: 1.05,
              textShadow: flashy
                ? [flashyShadow, isHero ? "0 0 28px rgba(255,255,255,0.65)" : ""].filter(Boolean).join(", ")
                : undefined,
              WebkitTextStroke: flashy && isHero ? "0.4px rgba(255,255,255,0.5)" : undefined,
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const Caption12 = ({
  transcription,
  videoSrc = null,
  /** Optional face box `{ xPct, yPct, wPct, hPct }` 0–1 from vision (faceBox preferred). */
  speakerFaceBox = null,
  /** Optional full subject box from vision — when set, motional text hole follows body, not only expanded face. */
  speakerSubjectBox = null,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const INTRO_END    = 60;
  const OUTRO_START  = Math.max(INTRO_END + 60, durationInFrames - 180);
  const FINALE_START = Math.max(OUTRO_START + 30, durationInFrames - 90);

  const currentTime = frame / fps;

  const isIntro  = frame < INTRO_END;
  const isFinale = frame >= FINALE_START;
  const isOutro  = !isIntro && !isFinale && frame >= OUTRO_START;
  const isBody   = !isIntro && !isOutro && !isFinale;

  const phrases    = useMemo(() => buildPhrases3D(transcription ?? []), [transcription]);
  const introWords = useMemo(() => getTopicWords(transcription ?? [], "start"), [transcription]);
  const outroWords = useMemo(() => getTopicWords(transcription ?? [], "end"),   [transcription]);

  const active = getActiveCaptionPhrase(phrases, currentTime);
  const phraseWithEnd = active ? { ...active.phrase, end: active.end } : null;

  // Parasite on scanline titles only while they break apart (fade-out), not on entrance
  const introParasiteStr = interpolate(frame, [INTRO_END - 24, INTRO_END - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outroParasiteStr = interpolate(frame, [FINALE_START - 28, FINALE_START - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // INTRO spring/fade
  const introSp  = spring({ frame, fps, from: 0, to: 1, config: { stiffness: 220, damping: 28 } });
  const introScV = interpolate(introSp, [0, 1], [0.82, 1.0], { extrapolateRight: "clamp" });
  const introOp  = interpolate(frame, [0, 8, 50, INTRO_END], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // OUTRO spring/fade
  const outroEl  = Math.max(0, frame - OUTRO_START);
  const outroSp  = spring({ frame: outroEl, fps, from: 0, to: 1, config: { stiffness: 200, damping: 26 } });
  const outroScV = interpolate(outroSp, [0, 1], [0.82, 1.0], { extrapolateRight: "clamp" });
  const outroOp  = interpolate(outroEl, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // FINALE scroll
  const finaleEl = Math.max(0, frame - FINALE_START);
  const scrollY  = -finaleEl * 8;
  const ROW_H    = 165;
  const NUM_ROWS = 7;

  const facePunchMask = useMemo(
    () => subjectBoxToMaskImage(speakerFaceBox ?? DEFAULT_FACE_BOX),
    [speakerFaceBox],
  );

  const finaleScrollHideMask = useMemo(() => {
    const avoid =
      speakerSubjectBox && typeof speakerSubjectBox.xPct === "number"
        ? padSubjectBoxForScrollAvoid(speakerSubjectBox)
        : expandFaceToUpperBodyAvoid(speakerFaceBox);
    return scrollMotionalAvoidMask(avoid);
  }, [speakerFaceBox, speakerSubjectBox]);

  // ── Sweep glow: diagonal shine stripe moving top-left → bottom-right ──────
  // Phase 1 title: sweeps over last 30 frames before fade-out (frames 20→50)
  const introSweepP = interpolate(frame, [20, 52], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const introSweepX = interpolate(introSweepP, [0, 1], [-160, 500]);

  // Phase 3 title: sweeps over last 30 frames before finale
  const outroSweepP = interpolate(frame, [FINALE_START - 34, FINALE_START - 4], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const outroSweepX = interpolate(outroSweepP, [0, 1], [-160, 500]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>

      {/* ───── PHASE 1 · INTRO ─────────────────────────────────────────────── */}
      {isIntro && (
        <>
          <div style={{
            position: "absolute", left: "3%", right: "3%", top: "50%",
            perspective: "600px", perspectiveOrigin: "50% 50%",
            opacity: introOp,
            transform: `scale(${introScV})`,
            transformOrigin: "center center",
            display: "flex",
            justifyContent: "center",
          }}>
            <div style={{ transform: "rotateX(-8deg)", position: "relative", overflow: "hidden" }}>
              <ScanlineBlockParasite
                words={introWords}
                frame={frame}
                fontSize0={114}
                fontSize1={102}
                parasiteStrength={introParasiteStr}
              />
              {/* Sweep glow stripe */}
              <div style={{
                position: "absolute", top: "-30%", bottom: "-30%",
                left: introSweepX, width: "130px",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,220,0.75) 50%, transparent 100%)",
                transform: "skewX(-18deg)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }} />
            </div>
          </div>

          {phraseWithEnd && (
            <div style={{
              position: "absolute", left: "5%", right: "5%", top: "45%",
              opacity: introOp,
              display: "flex",
              justifyContent: "center",
            }}>
              <LineCaption phrase={phraseWithEnd} currentTime={currentTime} frame={frame} />
            </div>
          )}
        </>
      )}

      {/* ───── PHASE 2 · BODY ──────────────────────────────────────────────── */}
      {isBody && phraseWithEnd && (
        <div style={{
          position: "absolute", left: "5%", right: "5%", bottom: "30%",
          display: "flex",
          justifyContent: "flex-start",
        }}>
          <LineCaption
            phrase={phraseWithEnd}
            currentTime={currentTime}
            frame={frame}
            regularSize={28}
            heroSize={46}
          />
        </div>
      )}

      {/* ───── PHASE 3 · OUTRO ─────────────────────────────────────────────── */}
      {isOutro && (
        <>
          <div style={{
            position: "absolute", left: "3%", right: "3%", top: "48%",
            perspective: "600px", perspectiveOrigin: "50% 50%",
            opacity: outroOp,
            transform: `scale(${outroScV})`,
            transformOrigin: "center center",
            display: "flex",
            justifyContent: "center",
            zIndex: 1,
          }}>
            <div style={{ transform: "rotateX(-8deg)", position: "relative", overflow: "hidden" }}>
              <ScanlineBlockParasite
                words={outroWords}
                frame={frame}
                fontSize0={114}
                fontSize1={102}
                parasiteStrength={outroParasiteStr}
              />
              {/* Sweep glow stripe */}
              <div style={{
                position: "absolute", top: "-30%", bottom: "-30%",
                left: outroSweepX, width: "130px",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,220,0.75) 50%, transparent 100%)",
                transform: "skewX(-18deg)",
                mixBlendMode: "overlay",
                pointerEvents: "none",
              }} />
            </div>
          </div>

          {phraseWithEnd && (
            <div style={{
              position: "absolute", left: "4%", right: "4%",
              top: "57%",
              transform: "translateY(-50%)",
              display: "flex",
              justifyContent: "center",
              zIndex: 20,
            }}>
              <LineCaption
                phrase={phraseWithEnd}
                currentTime={currentTime}
                frame={frame}
                regularSize={34}
                heroSize={54}
                flashy
              />
            </div>
          )}
        </>
      )}

      {/* ───── PHASE 4 · FINALE ────────────────────────────────────────────── */}
      {isFinale && (
        <>
          {/* Scrolling topic words — ~38% width (~31% margin each side); centre hole masks head/shoulder */}
          <div style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            zIndex: 1,
            WebkitMaskImage: finaleScrollHideMask,
            maskImage: finaleScrollHideMask,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}>
            {Array.from({ length: NUM_ROWS }, (_, i) => {
              const word = outroWords[i % outroWords.length] ?? "CONTENT";
              const rowY = i * ROW_H + 844 + scrollY;
              const fs = i % 2 === 0 ? 112 : 102;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "31%",
                    width: "38%",
                    top: rowY,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: i % 2 === 0 ? 0 : "10px",
                    paddingRight: i % 2 === 0 ? "10px" : 0,
                    boxSizing: "border-box",
                  }}
                >
                  <OutlinedLine text={word} fontSize={fs} />
                </div>
              );
            })}
          </div>

          {/* Green wash over entire lower half (including speaker) — not masked out */}
          <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            bottom: 0,
            background: "linear-gradient(to top, rgba(175,255,0,0.92) 0%, rgba(165,248,0,0.62) 28%, rgba(115,220,0,0.28) 58%, rgba(70,185,0,0.08) 82%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }} />

          {/* Face-only duplicate video: natural face above text + green; torso/arms still show motional layer */}
          {videoSrc ? (
            <AbsoluteFill style={{ zIndex: 5, pointerEvents: "none" }}>
              <Video
                src={videoSrc}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  WebkitMaskImage: facePunchMask,
                  maskImage: facePunchMask,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                }}
                volume={0}
              />
            </AbsoluteFill>
          ) : null}

          {phraseWithEnd && (
            <div style={{
              position: "absolute", left: "5%", right: "5%",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
            }}>
              <LineCaption
                phrase={phraseWithEnd}
                currentTime={currentTime}
                frame={frame}
                regularSize={28}
                heroSize={46}
              />
            </div>
          )}
        </>
      )}

    </AbsoluteFill>
  );
};
