/**
 * Caption5.jsx — Spatial Whisper: column-grid layout around the speaker
 *
 * Layout logic (matches the user's annotated reference image):
 *
 *   Words fill a 2-column × 4-row grid anchored to the speaker's head.
 *   Column assignment alternates left → right as each word is added:
 *
 *     word 0 → left  col, row 0
 *     word 1 → right col, row 0
 *     word 2 → left  col, row 1
 *     word 3 → right col, row 1
 *     ...  (max 4 rows = 8 word slots)
 *
 *   Left column : just to the left of the speaker's face edge
 *   Right column: just to the right of the speaker's face edge
 *   Rows        : spaced downward from the top of the face
 *
 * Timing:
 *   • Words enter one-by-one (left→right, top→bottom) based on Whisper timing
 *   • Each word fades in gently with a small upward settle
 *   • When the cluster ends, ALL words fade out TOGETHER (simultaneous exit)
 *   • New cluster words start entering immediately after
 *
 * Speaker position:
 *   • When AI layout data is available, faceBox calibrates the column positions
 *   • Falls back to sensible defaults centred in the video window
 */

import { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clusterWords } from "./captionHelpers5";

// ─── Composition / typography constants ───────────────────────────────────────

const COMP_W      = 390;
const COMP_H      = 844;
const FONT_SIZE   = 32;        // px
const ROW_H       = FONT_SIZE + 10; // vertical gap between rows
const MAX_ROWS    = 4;         // 4 rows × 2 cols = 8 word slots per cluster
const ENTER_F     = 10;        // frames for each word to fade in
const EXIT_F      = 8;         // frames for the whole cluster to fade out
const DRIFT_PX    = 5;         // upward drift during fade-in

const FONT_FAMILY = "'Quicksand', 'Dosis', 'Nunito', sans-serif";
const TEXT_COLOR  = "rgba(255,255,255,0.90)";
const TEXT_GLOW   = "0 0 14px rgba(255,255,255,0.18), 0 1px 5px rgba(0,0,0,0.35)";

// ─── Video window ─────────────────────────────────────────────────────────────

/**
 * Computes the actual rendered area of the video within the 390×844 composition.
 *
 * Remotion's <Video> with objectFit:"cover" on a landscape video fills the full
 * comp height and crops the sides, meaning there are NO black bars (the video
 * content fills the entire 390×844 area). However, for landscape videos the
 * left/right edges of the video frame are cropped, so we need to account for
 * that when mapping AI-detected face coordinates.
 *
 * For safety we also handle the "contain" (letterbox) case.
 */
function getVideoWindow(aspectRatio) {
  if (!aspectRatio) return { x: 0, y: 0, w: COMP_W, h: COMP_H };
  const compRatio = COMP_W / COMP_H; // 390/844 ≈ 0.462

  if (aspectRatio > compRatio) {
    // Landscape video. objectFit:cover → fills full height, crops width.
    // But screenshots show letterbox → treat as contain.
    const h = Math.round(COMP_W / aspectRatio);
    const y = Math.round((COMP_H - h) / 2);
    return { x: 0, y, w: COMP_W, h };
  }
  // Portrait video → fills full height, pillarboxes width (or cover fills width).
  const w = Math.round(COMP_H * aspectRatio);
  const x = Math.round((COMP_W - w) / 2);
  return { x, y: 0, w, h: COMP_H };
}

// ─── Column layout calculator ─────────────────────────────────────────────────

/**
 * Given the video window and optional AI speaker detection data for this
 * cluster, returns the (leftX, rightX, startY) column anchor points.
 *
 * Column rules:
 *   leftX  = just left of the speaker's face left edge (right-aligned text
 *             would sit here; we use left-anchor so we just position far enough
 *             from the face that single-word text won't overlap it)
 *   rightX = just right of the speaker's face right edge
 *   startY = top of the face (or slightly above)
 */
function computeColumnLayout(clusterIndex, layoutData, vw) {
  const { x: vx, y: vy, w: vwW, h: vwH } = vw;
  const cluster = layoutData?.clusters?.[clusterIndex];

  // Prefer faceBox (tighter) for column anchoring, fall back to subjectBox.
  const box = cluster?.faceBox ?? cluster?.subjectBox ?? null;

  // Fractions of the video window, defaulting to "person centred" heuristic.
  const faceLeftPct  = box?.xPct               ?? 0.28;
  const faceRightPct = box ? box.xPct + box.wPct : 0.72;
  const faceTopPct   = box?.yPct               ?? 0.12;

  const faceLeftPx  = vx + faceLeftPct  * vwW;
  const faceRightPx = vx + faceRightPct * vwW;
  const faceTopPx   = vy + faceTopPct   * vwH;

  // Left column starts 8px to the left of a ~100px "arm" from the face edge.
  const leftX  = Math.max(vx + 4,          faceLeftPx  - 108);
  // Right column starts 8px to the right of the face edge.
  const rightX = Math.min(vx + vwW - 110,  faceRightPx + 8);
  // Rows begin at face-top level (clamped into video window).
  const startY = Math.max(vy + 4, faceTopPx - 4);

  return { leftX, rightX, startY };
}

/**
 * Returns the pixel (x, y) for the word at `wordIndex` in the current cluster.
 * Returns null if the word would fall beyond the 4-row limit.
 */
function getWordSlot(wordIndex, layout) {
  const col = wordIndex % 2;          // 0 = left, 1 = right
  const row = Math.floor(wordIndex / 2);
  if (row >= MAX_ROWS) return null;

  return {
    x: col === 0 ? layout.leftX : layout.rightX,
    y: layout.startY + row * ROW_H,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Caption5 = ({
  transcription,
  layoutData = null,
  videoAspectRatio = null,
  fontSize = FONT_SIZE,
  fontFamily = FONT_FAMILY,
  textColor = TEXT_COLOR,
  maxWordsPerCluster = 8,   // 4 rows × 2 columns
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const videoWindow = useMemo(
    () => getVideoWindow(videoAspectRatio),
    [videoAspectRatio]
  );

  const clusters = useMemo(
    () => (transcription?.length ? clusterWords(transcription, maxWordsPerCluster) : []),
    [transcription, maxWordsPerCluster]
  );

  // Find the active cluster at the current playback time.
  const ci = clusters.findIndex((c) => t >= c.start && t < c.displayEnd);
  if (ci === -1) return null;
  const activeCluster = clusters[ci];

  const layout          = computeColumnLayout(ci, layoutData, videoWindow);
  const clusterEndFrame = Math.round(activeCluster.displayEnd * fps);

  // ── Cluster-level fade-out — ALL words exit together ─────────────────────
  const clusterFadeStart = clusterEndFrame - EXIT_F;
  const clusterFadeOut   =
    frame > clusterFadeStart
      ? Math.max(0, 1 - (frame - clusterFadeStart) / EXIT_F)
      : 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {activeCluster.words.map((word, wi) => {
        const slot = getWordSlot(wi, layout);
        if (!slot) return null; // beyond 4-row limit

        const wordStartFrame = Math.round(word.start * fps);
        if (frame < wordStartFrame) return null;

        // ── Per-word fade-in ─────────────────────────────────────────────
        const age    = frame - wordStartFrame;
        const fadeIn = Math.min(1, age / ENTER_F);
        const driftY = (1 - fadeIn) * DRIFT_PX;
        const opacity = fadeIn * clusterFadeOut;

        // ── Edge clamp (prevent right-edge overflow) ─────────────────────
        const wordText  = (word._text ?? "").toLowerCase();
        const approxW   = wordText.length * fontSize * 0.58;
        const x = Math.max(4, Math.min(slot.x, COMP_W - approxW - 6));
        const y = Math.max(4, slot.y);

        return (
          <div
            key={`c${ci}-w${wi}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              opacity,
              transform: `translateY(${driftY}px)`,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                fontFamily,
                fontSize,
                fontWeight: 400,
                color: textColor,
                letterSpacing: "0.015em",
                lineHeight: 1,
                textShadow: TEXT_GLOW,
                textTransform: "lowercase",
                userSelect: "none",
              }}
            >
              {wordText}
            </span>
          </div>
        );
      })}
    </div>
  );
};
