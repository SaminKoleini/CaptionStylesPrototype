/**
 * captionHelpers8.js — Staircase Impact helpers
 *
 * Splits a Whisper word array into three sections:
 *
 *   phase1  — first impact cluster (max 5 words, cut at first long pause)
 *   phase2  — middle running captions (everything in between), grouped into
 *             lines of max 3 words using pause-aware chunking
 *   phase3  — final impact cluster (max 5 words from the last long pause)
 *
 * The phase 1 / phase 3 clusters are used by the StaircaseGroup renderer.
 * The phase 2 lines are used by CenteredLineCaptions.
 */

// ─── Normalise Whisper word objects ──────────────────────────────────────────

function norm(w) {
  return { ...w, _text: (w.word ?? w.text ?? "").trim() };
}

// ─── Phase 2 line grouping ────────────────────────────────────────────────────

/**
 * Groups an array of normalised words into lines of ≤ maxPerLine words.
 * Prefers to break on punctuation or gaps > 300 ms; falls back to maxPerLine.
 * Each line carries `start` / `end` / `displayEnd` for timing.
 */
export function groupPhase2Lines(words, maxPerLine = 3) {
  if (!words?.length) return [];

  const lines = [];
  let i = 0;

  while (i < words.length) {
    let end = Math.min(i + maxPerLine, words.length);

    // Try to break earlier at punctuation.
    for (let j = i + 1; j < end; j++) {
      if (/[.!?;,]/.test(words[j]._text)) { end = j + 1; break; }
    }
    // Or at a gap > 300 ms.
    for (let j = i + 1; j < end - 1; j++) {
      const gap = words[j + 1].start - words[j].end;
      if (gap > 0.3) { end = j + 1; break; }
    }

    const chunk = words.slice(i, end);
    lines.push({
      text:  chunk.map((w) => w._text).join(" "),
      words: chunk,
      start: chunk[0].start,
      end:   chunk[chunk.length - 1].end,
    });
    i = end;
  }

  // Extend each line's display window to the next line's start.
  for (let j = 0; j < lines.length; j++) {
    lines[j].displayEnd =
      j + 1 < lines.length
        ? lines[j + 1].start - 0.04
        : lines[j].end + 0.8;
  }

  return lines;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

/**
 * Splits the full Whisper word array into:
 *   { phase1, phase2Lines, phase3 }
 *
 * phase1  — array of ≤5 normalised word objects (the opening staircase)
 * phase3  — array of ≤5 normalised word objects (the closing staircase)
 * phase2Lines — output of groupPhase2Lines() for the middle section
 *
 * Each group also carries:
 *   start, end, displayEnd — timing helpers for Caption8
 */
export function buildStaircaseGroups(transcription) {
  if (!transcription?.length) {
    return { phase1: [], phase2Lines: [], phase3: [] };
  }

  const ws = transcription.map(norm);

  // ── Identify Phase 1 cluster ────────────────────────────────────────────────
  // Take words from the start until the first gap > 400 ms, capped at 5.
  let p1End = 1;
  while (p1End < ws.length && p1End < 5) {
    const gap = ws[p1End].start - ws[p1End - 1].end;
    if (gap > 0.4) break;
    p1End++;
  }
  // Ensure at least 2 words in Phase 1 for visual interest.
  p1End = Math.max(2, Math.min(p1End, 5));

  // ── Identify Phase 3 cluster ────────────────────────────────────────────────
  // Scan backwards for the last gap > 400 ms, take up to 5 words from there.
  let p3Start = ws.length - 1;
  while (p3Start > p1End && ws.length - p3Start < 5) {
    const gap = ws[p3Start].start - ws[p3Start - 1].end;
    if (gap > 0.4) break;
    p3Start--;
  }
  // Ensure Phase 3 has at least 2 words and doesn't overlap Phase 1.
  p3Start = Math.max(p1End + 2, Math.min(p3Start, ws.length - 2));

  const phase1 = ws.slice(0, p1End);
  const phase3 = ws.slice(p3Start);
  const middle = ws.slice(p1End, p3Start);

  // Timing helpers for phase 1 / 3 groups.
  function addTiming(group, nextStart, prevEnd) {
    return {
      words:      group,
      start:      group[0]?.start ?? 0,
      end:        group[group.length - 1]?.end ?? 0,
      displayEnd: nextStart ?? (group[group.length - 1]?.end ?? 0) + 1.0,
    };
  }

  const p2Lines   = groupPhase2Lines(middle, 3);
  const p2Start   = p2Lines[0]?.start ?? (phase1[phase1.length - 1]?.end ?? 0);
  const p2End     = p2Lines[p2Lines.length - 1]?.end ?? phase3[0]?.start ?? 0;

  const p1Group   = addTiming(phase1, p2Start ?? phase3[0]?.start);
  const p3Group   = addTiming(phase3, null);

  return {
    phase1:      p1Group,
    phase2Lines: p2Lines,
    phase3:      p3Group,
  };
}
