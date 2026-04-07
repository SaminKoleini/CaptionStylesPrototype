/**
 * captionHelpers6.js — Progressive Quote Stack utilities
 *
 * Handles splitting a Whisper word array into balanced poetic lines
 * and computing the vertical layout so the final fully-built block
 * is perfectly centred in the composition.
 */

// ─── Line splitting ────────────────────────────────────────────────────────────

/**
 * Splits Whisper word-level output into lines of ≤ maxPerLine words.
 *
 * Breaking strategy:
 *   1. Prefer to break immediately after punctuation (period, comma,
 *      question mark, etc.) — this preserves poetic / natural phrasing.
 *   2. Otherwise break at maxPerLine.
 *   3. Avoid orphan lines: if the last line would be a single filler word,
 *      pull it up into the previous line even if that exceeds maxPerLine.
 *
 * Each returned line carries its start/end time from Whisper so the
 * reveal can be keyed to actual speech timing.
 *
 * @param {Array}  words       — Whisper word array: { word|text, start, end }
 * @param {number} maxPerLine  — maximum words per line (default 5)
 * @returns {Array<{ text, words, start, end }>}
 */
export function splitIntoLines(words, maxPerLine = 5) {
  if (!words?.length) return [];

  const ws = words.map((w) => ({
    ...w,
    _text: (w.word ?? w.text ?? "").replace(/[,;:.!?]+$/, "").trim(),
    _punct: /[.!?;]/.test(w.word ?? w.text ?? ""),
    _comma: /[,]/.test(w.word ?? w.text ?? ""),
  }));

  const lines = [];
  let i = 0;

  while (i < ws.length) {
    let end = Math.min(i + maxPerLine, ws.length);

    // Try to break earlier at strong punctuation.
    for (let j = i + 2; j < end; j++) {
      if (ws[j]._punct) { end = j + 1; break; }
    }
    // Or at a comma if we've reached 3+ words.
    if (end === Math.min(i + maxPerLine, ws.length)) {
      for (let j = i + 3; j < end; j++) {
        if (ws[j]._comma) { end = j + 1; break; }
      }
    }

    const chunk = ws.slice(i, end);
    lines.push({
      text:  chunk.map((w) => w._text).join(" "),
      words: chunk,
      start: chunk[0].start,
      end:   chunk[chunk.length - 1].end,
    });
    i = end;
  }

  // Merge a lonesome final single-filler word up into the previous line.
  const FILLERS = new Set(["a","an","the","of","in","on","at","to","is","it","and","or","but","so"]);
  if (lines.length >= 2) {
    const last = lines[lines.length - 1];
    if (last.words.length === 1 && FILLERS.has(last._text?.toLowerCase())) {
      const prev = lines[lines.length - 2];
      prev.text  = prev.text + " " + last.text;
      prev.words = [...prev.words, ...last.words];
      prev.end   = last.end;
      lines.pop();
    }
  }

  return lines;
}

// ─── Layout calculation ────────────────────────────────────────────────────────

/**
 * Computes the Y position at which the first line should be rendered
 * so that, when ALL lines are visible, the complete text block is
 * perfectly vertically centred inside the composition.
 *
 * @param {number} totalLines  — number of lines in the full quote
 * @param {number} fontSize    — font size in px
 * @param {number} lineHeight  — CSS line-height multiplier (e.g. 1.35)
 * @param {number} compHeight  — composition pixel height (default 844)
 * @returns {number} startY in px
 */
export function computeStartY(totalLines, fontSize, lineHeight, compHeight = 844) {
  const lineHeightPx  = fontSize * lineHeight;
  const totalBlockH   = totalLines * lineHeightPx;
  return Math.round((compHeight - totalBlockH) / 2);
}

// ─── Reveal timing ────────────────────────────────────────────────────────────

/**
 * Given the array of lines and the current playback time, returns the
 * index of the last line that should be visible (0-based).
 *
 * If a line's `start` is 0 (e.g. all lines share the same start time
 * or Whisper data is absent), falls back to distributing reveals evenly
 * across the full duration.
 *
 * @param {Array}  lines        — output of splitIntoLines
 * @param {number} currentTime  — current time in seconds
 * @param {number} totalDuration — clip duration in seconds
 * @returns {number} index of last visible line (-1 = none visible yet)
 */
export function getVisibleLineCount(lines, currentTime, totalDuration) {
  if (!lines.length) return 0;

  // Check if we have meaningful Whisper-derived timing (at least one line
  // starts after 0 s and before totalDuration).
  const hasRealTimings = lines.some((l) => l.start > 0 && l.start < totalDuration);

  if (hasRealTimings) {
    // Show line i as soon as currentTime >= line[i].start.
    let count = 0;
    for (const line of lines) {
      if (currentTime >= line.start) count++;
    }
    return count;
  }

  // Fallback: distribute evenly over the duration.
  const interval = totalDuration / lines.length;
  return Math.min(lines.length, Math.floor(currentTime / interval) + 1);
}
