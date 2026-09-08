/**
 * captionHelpers15.js — Magazine / ransom-note collage cutouts
 *
 * Expanded matte swatches (newsprint, kraft, ads, deep print).
 * Per-word: sticker rim, halftone strength, sepia, misregistration — all seeded.
 */

function seededRng(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// ─── Cutout stock — editorial / old magazine / kraft / newsprint ─────────────

export const PAPER_COLORS = [
  { base: "#C4A3A0", dark: "#9E7D7A", light: "#D9BEBB", ink: "#2A2624", inkIsLight: false },
  { base: "#2C3D32", dark: "#1A2620", light: "#3D5245", ink: "#EDE8DC", inkIsLight: true },
  { base: "#E8DFD0", dark: "#CFC4B2", light: "#F5F0E6", ink: "#1E3A2C", inkIsLight: false },
  { base: "#8F5344", dark: "#6A3A30", light: "#A86B5A", ink: "#F4EDE5", inkIsLight: true },
  // Yellowed news / kraft / faded ads / deep print pages
  { base: "#D2CAB8", dark: "#B5AA94", light: "#E8E2D4", ink: "#252218", inkIsLight: false },
  { base: "#8E9AAE", dark: "#6F7788", light: "#AEB6C8", ink: "#1A1C22", inkIsLight: false },
  { base: "#C4B896", dark: "#A69872", light: "#D9CEAE", ink: "#2A2418", inkIsLight: false },
  { base: "#E5CCD2", dark: "#C5A8B0", light: "#F0DDE2", ink: "#3A2830", inkIsLight: false },
  { base: "#3D4A58", dark: "#28323C", light: "#536274", ink: "#F2EDE4", inkIsLight: true },
  { base: "#B8A574", dark: "#95855C", light: "#D4C89A", ink: "#221E14", inkIsLight: false },
];

function makeClipPath(rng) {
  const jp = (spread = 3.8) => (rng() - 0.5) * spread;

  const pts = [
    `${2 + jp()}% ${2 + jp()}%`,
    `${25 + jp()}% ${jp(2)}%`,
    `${50 + jp()}% ${jp(2)}%`,
    `${75 + jp()}% ${jp(2)}%`,
    `${98 + jp()}% ${2 + jp()}%`,
    `${100 + jp(2)}% ${25 + jp()}%`,
    `${100 + jp(2)}% ${50 + jp()}%`,
    `${100 + jp(2)}% ${75 + jp()}%`,
    `${98 + jp()}% ${98 + jp()}%`,
    `${75 + jp()}% ${100 + jp(2)}%`,
    `${50 + jp()}% ${100 + jp(2)}%`,
    `${25 + jp()}% ${100 + jp(2)}%`,
    `${2 + jp()}% ${98 + jp()}%`,
    `${jp(2)}% ${75 + jp()}%`,
    `${jp(2)}% ${50 + jp()}%`,
    `${jp(2)}% ${25 + jp()}%`,
  ];

  return `polygon(${pts.join(", ")})`;
}

export function groupWords(transcription, maxPerGroup = 5) {
  if (!transcription?.length) return [];

  const groups = [];
  let i = 0;

  while (i < transcription.length) {
    const chunk = transcription.slice(i, i + maxPerGroup);
    const groupStart = chunk[0].start;
    const groupEnd = chunk[chunk.length - 1].end;
    const nextStart = transcription[i + maxPerGroup]?.start;
    const displayEnd =
      nextStart != null ? nextStart - 0.03 : groupEnd + 2.4;

    groups.push({ words: chunk, start: groupStart, end: groupEnd, displayEnd });
    i += maxPerGroup;
  }

  return groups;
}

export function computeGroupLayouts(groups) {
  return groups.map((group, gi) => {
    const wordLayouts = group.words.map((word, wi) => {
      const seed = (gi * 97 + wi * 43 + 0x5f3759df) >>> 0;
      const rng = seededRng(seed);

      const colorIdx =
        (gi * 5 + wi * 3 + Math.floor(rng() * PAPER_COLORS.length)) %
        PAPER_COLORS.length;
      const color = PAPER_COLORS[colorIdx];

      const restRotation = (rng() - 0.5) * 22;
      const microOffsetX = Math.round((rng() - 0.5) * 5);
      const microOffsetY = Math.round((rng() - 0.5) * 4);

      const clipPath = makeClipPath(rng);

      const padL = 7 + Math.floor(rng() * 6);
      const padR = 7 + Math.floor(rng() * 6);
      const padT = 6 + Math.floor(rng() * 4);
      const padB = 6 + Math.floor(rng() * 4);

      const gradientAnchorX = 20 + Math.floor(rng() * 60);
      const gradientAnchorY = 20 + Math.floor(rng() * 60);

      const foldAngle1 = Math.floor(rng() * 180);
      const foldAngle2 = Math.floor(rng() * 180);
      const foldAngle3 = rng() > 0.35 ? Math.floor(rng() * 180) : null;

      // ── Old-magazine / print-shop variation (seeded) ───────────────────────
      // Sticker-like pale rim (cut paper glued on a page)
      const stickerRim = rng() > 0.38;
      // Halftone / rosetone screen (spacing + strength)
      const halftonePx = 2.4 + rng() * 2.2; // 2.4–4.6px
      const halftoneStrength = 0.045 + rng() * 0.055;
      // Yellowing + sepia wash
      const sepiaOverlay = 0.1 + rng() * 0.12;
      const edgeYellow = 0.06 + rng() * 0.1;
      // Fake CMYK misregistration on letterforms (px-ish, very subtle)
      const misRx = (rng() - 0.5) * 0.55;
      const misRy = (rng() - 0.5) * 0.45;
      const misGx = (rng() - 0.5) * 0.5;
      const misGy = (rng() - 0.5) * 0.4;
      // Ink not perfectly opaque — news ink fades slightly
      const inkOpacity = 0.88 + rng() * 0.1;

      return {
        word: word.word,
        start: word.start,
        color,
        restRotation,
        clipPath,
        padL,
        padR,
        padT,
        padB,
        gradientAnchorX,
        gradientAnchorY,
        foldAngle1,
        foldAngle2,
        foldAngle3,
        microOffsetX,
        microOffsetY,
        stickerRim,
        halftonePx,
        halftoneStrength,
        sepiaOverlay,
        edgeYellow,
        misRx,
        misRy,
        misGx,
        misGy,
        inkOpacity,
      };
    });

    return { ...group, wordLayouts };
  });
}
