/**
 * Caption15.jsx — Old magazine / ransom-note collage captions
 *
 * Two decorative stars at fixed frame positions (first 5s only, gentle sway):
 *   — left / mic side ~8%, 72%   (purple glitter asset)
 *   — bottom-right ~90%, 89%     (silver sparkle asset)
 * Caption words sit in a fixed deck; stars are siblings on AbsoluteFill so
 * captions never move them. Merriweather Black (900).
 */

import { useMemo } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { computeGroupLayouts, groupWords } from "./captionHelpers15";
import star2 from "./assets/caption15-stars/star2.png";
import star8 from "./assets/caption15-stars/star8.png";

/** First N seconds of the timeline — star stickers only */
const STARS_DURATION_SEC = 5;

/** Fixed “caption box” — word layout only (stars are not anchored here) */
const DECK_W = 358;
const DECK_MIN_H = 140;

/** Composition % positions — match boxed areas in reference (portrait 390×844) */
const STAR_LEFT = { left: "8%", top: "72%", w: 52, rot: -11, phase: 0, src: star2 };
const STAR_RIGHT = { left: "90%", top: "89%", w: 48, rot: 14, phase: 1.15, src: star8 };

function TwoFrameStars({ frame, fps }) {
  const t = frame / fps;
  const w = Math.PI * 2 * 1.08;
  const spots = [STAR_LEFT, STAR_RIGHT];
  return (
    <>
      {spots.map((a, i) => {
        const sway = Math.sin(t * w + a.phase) * 3.2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: a.left,
              top: a.top,
              width: a.w,
              height: a.w,
              transform: `translate(-50%, -50%) translateX(${sway}px) rotate(${a.rot}deg)`,
              zIndex: 60,
              pointerEvents: "none",
              filter:
                "sepia(0.12) saturate(0.94) drop-shadow(2px 4px 6px rgba(12,10,8,0.36))",
            }}
          >
            <Img
              src={a.src}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        );
      })}
    </>
  );
}

const FONT = '"Merriweather", Georgia, "Times New Roman", serif';
const FONT_SIZE = 22;
const FONT_WEIGHT = 900;

const GRAIN_FINE = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23f)'/%3E%3C/svg%3E")`;

const GRAIN_COARSE = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.38' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23c)'/%3E%3C/svg%3E")`;

const LINEN_STYLE = {
  position: "absolute",
  inset: 0,
  backgroundImage: [
    "repeating-linear-gradient(0deg, rgba(0,0,0,0.034) 0px, transparent 1px, transparent 3px, rgba(0,0,0,0.021) 4px)",
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.028) 0px, transparent 1px, transparent 3px, rgba(0,0,0,0.017) 4px)",
  ].join(", "),
  mixBlendMode: "multiply",
  opacity: 0.88,
  pointerEvents: "none",
};

function wrinkleLayer(angle, opacity = 0.055) {
  return {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(${angle}deg,
      transparent 42%,
      rgba(0,0,0,${opacity}) 49.2%,
      rgba(0,0,0,${opacity * 0.55}) 50%,
      rgba(0,0,0,${opacity * 0.85}) 50.8%,
      transparent 58%)`,
    mixBlendMode: "multiply",
    pointerEvents: "none",
  };
}

const OUTER_SHADOW = "0 3px 10px rgba(15,12,8,0.38)";

function WordScrap({ wl, frame, fps }) {
  const wordStartFrame = Math.round(wl.start * fps);
  if (frame < wordStartFrame) return null;

  const { color, gradientAnchorX, gradientAnchorY } = wl;
  const paperRadial = `radial-gradient(ellipse at ${gradientAnchorX}% ${gradientAnchorY}%, ${color.light} 0%, ${color.base} 48%, ${color.dark} 100%)`;
  // Slightly dingy highlight — not a clean digital gloss
  const paperWash = `radial-gradient(ellipse at 10% 6%, rgba(255,252,242,0.18) 0%, transparent 38%)`;

  const insetDepth =
    "inset 0 2px 6px rgba(0,0,0,0.16), inset 0 -2px 5px rgba(255,250,238,0.08)";

  const stickerRim = wl.stickerRim
    ? ", 0 0 0 1px rgba(252,248,238,0.92), 0 0 0 2px rgba(22,18,14,0.07)"
    : "";

  const cardShadow = `${insetDepth}${stickerRim}, ${OUTER_SHADOW}`;

  const s = wl.sepiaOverlay;
  const sepiaWash = `linear-gradient(168deg,
    rgba(110,88,62,${s * 0.9}) 0%,
    transparent 42%,
    rgba(72,52,38,${s * 0.55}) 100%)`;
  const edgeAge = `radial-gradient(ellipse 130% 95% at 50% 108%, rgba(140,110,70,${wl.edgeYellow}) 0%, transparent 52%)`;

  const h = wl.halftoneStrength;
  const hp = wl.halftonePx;
  const halftoneBg = `radial-gradient(circle at 50% 50%, rgba(22,19,14,${h}) 0.32px, transparent 0.85px)`;

  const misR = wl.color.inkIsLight
    ? `${wl.misRx.toFixed(2)}px ${wl.misRy.toFixed(2)}px 0 rgba(120,200,220,0.14), ${wl.misGx.toFixed(2)}px ${wl.misGy.toFixed(2)}px 0 rgba(255,150,160,0.1)`
    : `${wl.misRx.toFixed(2)}px ${wl.misRy.toFixed(2)}px 0 rgba(0,100,130,0.09), ${wl.misGx.toFixed(2)}px ${wl.misGy.toFixed(2)}px 0 rgba(160,35,55,0.08)`;

  const inkShadow = wl.color.inkIsLight
    ? "0 1px 0 rgba(0,0,0,0.32), 0 0 2px rgba(0,0,0,0.2)"
    : "0 1px 0 rgba(255,252,240,0.2), 0 -0.5px 1px rgba(0,0,0,0.12)";

  return (
    <div
      style={{
        display: "inline-flex",
        transform: `translate(${wl.microOffsetX}px, ${wl.microOffsetY}px) rotate(${wl.restRotation}deg)`,
        transformOrigin: "center center",
        verticalAlign: "middle",
      }}
    >
      <div
        style={{
          position: "relative",
          clipPath: wl.clipPath,
          boxShadow: cardShadow,
          backgroundImage: `${paperWash}, ${paperRadial}`,
          backgroundBlendMode: "soft-light, normal",
          padding: `${wl.padT}px ${wl.padR}px ${wl.padB}px ${wl.padL}px`,
        }}
      >
        {/* Linen / newsprint weave */}
        <div style={{ ...LINEN_STYLE, zIndex: 1 }} />

        {/* Sepia + edge yellowing — aged paper */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `${sepiaWash}, ${edgeAge}`,
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Halftone rosette / print screen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: halftoneBg,
            backgroundSize: `${hp}px ${hp}px`,
            mixBlendMode: "multiply",
            opacity: 0.85,
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRAIN_COARSE,
            backgroundSize: "180px 180px",
            opacity: 0.095,
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRAIN_FINE,
            backgroundSize: "96px 96px",
            opacity: 0.11,
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        <div style={{ ...wrinkleLayer(wl.foldAngle1, 0.075), zIndex: 6 }} />
        <div style={{ ...wrinkleLayer(wl.foldAngle2 + 47, 0.048), zIndex: 6 }} />
        {wl.foldAngle3 != null && (
          <div style={{ ...wrinkleLayer(wl.foldAngle3 + 23, 0.038), zIndex: 6 }} />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(165deg, transparent 32%, rgba(0,0,0,0.075) 96%)",
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 7,
          }}
        />

        <span
          style={{
            fontFamily: FONT,
            fontStyle: "normal",
            fontWeight: FONT_WEIGHT,
            fontSize: `${FONT_SIZE}px`,
            color: wl.color.ink,
            opacity: wl.inkOpacity,
            lineHeight: 1.05,
            display: "block",
            whiteSpace: "nowrap",
            position: "relative",
            zIndex: 8,
            letterSpacing: "0.02em",
            textShadow: `${misR}, ${inkShadow}`,
          }}
        >
          {wl.word}
        </span>

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `${GRAIN_FINE}, ${GRAIN_COARSE}`,
            backgroundSize: "88px 88px, 200px 200px",
            opacity: 0.15,
            mixBlendMode: "multiply",
            pointerEvents: "none",
            zIndex: 9,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: GRAIN_FINE,
            backgroundSize: "64px 64px",
            opacity: 0.065,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
}

export const Caption15 = ({ transcription }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const layouts = useMemo(
    () => computeGroupLayouts(groupWords(transcription ?? [])),
    [transcription]
  );

  const activeGroup = layouts.find((g) => {
    const startFr = Math.round(g.start * fps);
    const endFr = Math.round(g.displayEnd * fps);
    return frame >= startFr && frame <= endFr;
  });

  const showStars = frame < STARS_DURATION_SEC * fps;
  if (!showStars && !activeGroup) return null;

  return (
    <AbsoluteFill style={{ overflow: "visible", pointerEvents: "none", userSelect: "none" }}>
      {showStars && <TwoFrameStars frame={frame} fps={fps} />}

      {(showStars || activeGroup) && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "72%",
            width: DECK_W,
            minHeight: DECK_MIN_H,
            transform: "translateX(-50%)",
            boxSizing: "border-box",
            overflow: "visible",
          }}
        >
          {activeGroup && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 5px",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                padding: "18px 14px 20px",
                zIndex: 40,
              }}
            >
              {activeGroup.wordLayouts.map((wl, wi) => (
                <WordScrap key={wi} wl={wl} frame={frame} fps={fps} />
              ))}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
