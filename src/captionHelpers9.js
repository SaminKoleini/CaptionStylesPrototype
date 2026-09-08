/**
 * captionHelpers9.js — Helpers for Caption9 (migs.visuals Dynamic Style)
 */

// ── Word classification ────────────────────────────────────────────────────────

const FILLER_WORDS = new Set([
  "a","an","the","is","it","in","on","to","do","by","no","so","but","and",
  "of","for","at","with","my","why","many","add","if","you","this","that",
  "i","we","they","he","she","are","was","were","not","your","its",
]);

function normalizeWord(w) {
  return w.toLowerCase().replace(/[^a-z]/g, "");
}

export function isFiller(word) {
  return FILLER_WORDS.has(normalizeWord(word));
}

// ── Phrase builder ─────────────────────────────────────────────────────────────
// Groups words into phrases by natural pauses (gap > 0.3s) or max 6 words.
// Each word is annotated with `globalIndex` and `isFiller` for the renderer.

export function buildPhrases(transcription) {
  const phrases = [];
  let current = [];

  for (let i = 0; i < transcription.length; i++) {
    const w = {
      ...transcription[i],
      globalIndex: i,
      isFiller: isFiller(transcription[i].word),
    };

    if (current.length === 0) {
      current.push(w);
    } else {
      const prev = current[current.length - 1];
      const gap  = w.start - prev.end;
      if (gap > 0.3 || current.length >= 6) {
        phrases.push(current);
        current = [w];
      } else {
        current.push(w);
      }
    }
  }

  if (current.length > 0) phrases.push(current);
  return phrases;
}
