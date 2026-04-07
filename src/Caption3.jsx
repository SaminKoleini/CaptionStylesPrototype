import { useState, useEffect } from "react";

// ─── Oval frame: load once, strip black background, cache as blob URL ─────────
// mix-blend-mode:screen can't be used here because the parent div's opacity < 1
// creates an isolated stacking context, causing black pixels to stay visible
// during the fade. The fix is to pre-process the PNG: any pixel whose R, G, B
// are all below 25 gets its alpha zeroed, producing a true transparent image.
let _ovalBlobUrl = null;
let _ovalLoadPromise = null;

function loadTransparentOval() {
  if (_ovalBlobUrl) return Promise.resolve(_ovalBlobUrl);
  if (_ovalLoadPromise) return _ovalLoadPromise;
  _ovalLoadPromise = new Promise((resolve) => {
    const raw = new Image();
    raw.onload = () => {
      const c = document.createElement("canvas");
      c.width = raw.naturalWidth;
      c.height = raw.naturalHeight;
      const c2d = c.getContext("2d");
      c2d.drawImage(raw, 0, 0);
      const id = c2d.getImageData(0, 0, c.width, c.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < 25 && d[i + 1] < 25 && d[i + 2] < 25) d[i + 3] = 0;
      }
      c2d.putImageData(id, 0, 0);
      c.toBlob((blob) => {
        _ovalBlobUrl = URL.createObjectURL(blob);
        resolve(_ovalBlobUrl);
      }, "image/png");
    };
    raw.onerror = () => resolve("/oval-frame.png"); // fallback: use original
    raw.src = "/oval-frame.png";
  });
  return _ovalLoadPromise;
}

// ─── Editorial Podcast caption style ─────────────────────────────────────────
//
// Title card:  Bodoni Moda 700 italic — high-contrast editorial serif.
//              Solid tilted oval ring (+18° so the left end rises, right end
//              drops — matching the provided reference design), three-layer
//              sparkle cluster at the upper-left end, and two ring glints
//              on the oval circumference that simulate light on polished metal.
//              Visible 0–4 s with a 0.5 s fade in and fade out.
//
// Subtitles:   Playfair Display 400 italic — warmer, lighter, softer.
//              Cream-white (#F5EFE3), 3–4 words, soft drop-shadow only.
//              Each phrase stays on screen until the next one starts.

const TITLE_VISIBLE_SEC = 4;
const FADE_FRAMES = 15; // 0.5 s at 30 fps

// ─── Composition geometry ─────────────────────────────────────────────────────
// All values in composition-space pixels (390 × 844).
const COMP_W = 390;

// Oval + title vertical centre — ~21 % from top of the 844 px composition.
const OVAL_CX = COMP_W / 2; // 195
const OVAL_CY = 175;

// Oval half-axes — wide enough to comfortably contain a 1–2 word title.
const OVAL_RX = 155;
const OVAL_RY = 38;

// Original PNG dimensions — used to compute the scaled image height so the
// oval ring is vertically centred on OVAL_CY inside the composition.
const FRAME_PNG_W = 1024;
const FRAME_PNG_H = 597;

// ─── Chunking ─────────────────────────────────────────────────────────────────
// Groups 3–4 words, preferring to break on punctuation for natural cadence.
function buildChunks3(captions, maxWords = 4) {
  const chunks = [];
  let i = 0;
  while (i < captions.length) {
    let end = Math.min(i + maxWords, captions.length);
    for (let j = i + 2; j < end; j++) {
      if (/[,\.?!;]$/.test(captions[j].word)) {
        end = j + 1;
        break;
      }
    }
    chunks.push(captions.slice(i, end));
    i = end;
  }
  return chunks;
}

// ─── Title card ───────────────────────────────────────────────────────────────
const EditorialTitleCard = ({ title, currentFrame, fps }) => {
  // Start with whatever is already cached (instant if the image was processed
  // during a prior render); update via effect if processing is still pending.
  const [ovalSrc, setOvalSrc] = useState(_ovalBlobUrl ?? "");
  useEffect(() => {
    if (!_ovalBlobUrl) loadTransparentOval().then(setOvalSrc);
  }, []);

  const titleEnd = TITLE_VISIBLE_SEC * fps;
  if (currentFrame >= titleEnd) return null;

  // Smooth fade in / fade out
  let opacity = 1;
  if (currentFrame < FADE_FRAMES) {
    opacity = currentFrame / FADE_FRAMES;
  } else if (currentFrame > titleEnd - FADE_FRAMES) {
    opacity = (titleEnd - currentFrame) / FADE_FRAMES;
  }
  opacity = Math.max(0, Math.min(1, opacity));

  return (
    // Root: covers the full composition so SVG and text share the same origin.
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
      }}
    >
      {/* ── Oval frame graphic ──
          The PNG has a black background. mix-blend-mode:screen makes black
          fully transparent, so only the white ring and sparkles show through
          over the video beneath. The image is scaled to the composition width
          and vertically centred on OVAL_CY so the oval ring wraps the title. */}
      {/* Transparent-background version of the oval frame PNG.
          Black pixels have been removed by loadTransparentOval(); opacity on
          the parent div now fades cleanly with no black overlay artifact. */}
      {ovalSrc && (
        <img
          src={ovalSrc}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            top: Math.round(OVAL_CY - (COMP_W * FRAME_PNG_H) / FRAME_PNG_W / 2),
            width: COMP_W,
            height: "auto",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Title text ──
          Bodoni Moda 700 Italic — high-contrast editorial serif, intentionally
          different from the Playfair Display used for captions. The layered
          text-shadow creates a soft glossy/shiny luminance without neon glow. */}
      <div
        style={{
          position: "absolute",
          top: OVAL_CY,
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          textAlign: "center",
          // No padding — let the oval geometry handle horizontal bounds
        }}
      >
        <span
          style={{
            fontFamily: "'Bodoni Moda', Georgia, serif",
            fontSize: 50,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#FFFFFF",
            letterSpacing: "0.015em",
            lineHeight: 1,
            // Three-layer glow builds a premium, slightly luminous sheen —
            // the widest layer adds airiness, the tight layers add crisp shine.
            textShadow: [
              "0 0 48px rgba(255,255,255,0.22)",
              "0 0 14px rgba(255,255,255,0.18)",
              "0 1px 0 rgba(255,255,255,0.10)",
            ].join(", "),
          }}
        >
          {title}
        </span>
      </div>
    </div>
  );
};

// ─── Subtitles ────────────────────────────────────────────────────────────────
const EditorialSubtitles = ({ captions, currentFrame, fps }) => {
  const currentTime = currentFrame / fps;
  const chunks = buildChunks3(captions);

  // Stay visible until the next chunk begins — no blank gaps.
  const activeChunk = chunks.find((chunk, idx) => {
    const start = chunk[0].start;
    const end =
      idx + 1 < chunks.length
        ? chunks[idx + 1][0].start
        : chunk[chunk.length - 1].end + 1;
    return currentTime >= start && currentTime < end;
  });

  if (!activeChunk) return null;

  const text = activeChunk.map((w) => w.word).join(" ");

  return (
    <div
      style={{
        position: "absolute",
        // 25 % from bottom = 3/4 down the screen
        bottom: "25%",
        left: 0,
        right: 0,
        textAlign: "center",
        padding: "0 28px",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          // Playfair Display — softer, warmer, lighter than the Bodoni title.
          // Using a different weight (400) and colour reinforces the hierarchy.
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 30,
          fontWeight: 400,
          fontStyle: "italic",
          // Warmer cream — noticeably different from the title's pure white.
          color: "#F5EFE3",
          lineHeight: 1.4,
          letterSpacing: "0.01em",
          // Layered shadow: the wide diffuse layer lifts text off dark backgrounds;
          // the tight layer handles bright or mid-tone backgrounds. No outline.
          textShadow: [
            "0 2px 16px rgba(0,0,0,0.60)",
            "0 0 40px rgba(0,0,0,0.22)",
          ].join(", "),
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          maxWidth: "88%",
          margin: "0 auto",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// ─── Combined component used by Remotion composition ─────────────────────────
export const Caption3 = ({ captions, title, currentFrame, fps }) => {
  const safeCaptions = captions ?? [];

  return (
    <>
      {title && (
        <EditorialTitleCard
          title={title}
          currentFrame={currentFrame}
          fps={fps}
        />
      )}
      {safeCaptions.length > 0 && (
        <EditorialSubtitles
          captions={safeCaptions}
          currentFrame={currentFrame}
          fps={fps}
        />
      )}
    </>
  );
};
