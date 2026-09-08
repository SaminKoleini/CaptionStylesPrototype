/**
 * captionHelpers10.js — Shared phrase-building utilities for Styles 10, 11, 12.
 *
 * buildPhrases3D(transcription) → Array of { words: Word[], heroIdx: number }
 *   Groups words by natural pause (>0.35s gap) OR max 5 words per chunk.
 *   heroIdx = index of last content word in chunk (not in FILLER_WORDS);
 *   falls back to last word if all words are fillers.
 *
 * getActivePhraseAt(phrases, currentTime) → { phrase, idx, start, end } | null
 *   start = phrases[i].words[0].start
 *   end   = phrases[i+1].words[0].start OR last word's end + 0.6s
 */

const FILLER_WORDS = new Set([
  "a","an","the","is","it","in","on","to","do","by","no","so","but","and",
  "of","for","at","with","my","i","we","they","he","she","you","are","was",
  "were","not","your","its","this","that","or","as","be","been","have","has",
  "had","will","would","can","could","should","just","very","get","go","also",
  "even","still",
]);

function normalize(w) {
  return w.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Builds an array of phrase objects from a flat word transcription.
 * Each phrase: { words: Word[], heroIdx: number }
 */
export function buildPhrases3D(transcription) {
  if (!transcription || transcription.length === 0) return [];

  const phrases = [];
  let current = [];

  for (let i = 0; i < transcription.length; i++) {
    const w = transcription[i];

    if (current.length === 0) {
      current.push(w);
    } else {
      const prev = current[current.length - 1];
      const gap = w.start - prev.end;
      if (gap > 0.35 || current.length >= 5) {
        phrases.push(buildPhrase(current));
        current = [w];
      } else {
        current.push(w);
      }
    }
  }

  if (current.length > 0) phrases.push(buildPhrase(current));
  return phrases;
}

function buildPhrase(words) {
  // Find last content word (not filler), from the end
  let heroIdx = words.length - 1; // fallback: last word
  for (let i = words.length - 1; i >= 0; i--) {
    if (!FILLER_WORDS.has(normalize(words[i].word))) {
      heroIdx = i;
      break;
    }
  }
  return { words, heroIdx };
}

/**
 * Returns the active phrase at currentTime (in seconds).
 * Returns null if no phrase is active.
 */
export function getActivePhraseAt(phrases, currentTime) {
  if (!phrases || phrases.length === 0) return null;

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    const start = phrase.words[0].start;

    // end = next phrase's first word start, OR last word's end + 0.6s
    const lastWord = phrase.words[phrase.words.length - 1];
    const end =
      i + 1 < phrases.length
        ? phrases[i + 1].words[0].start
        : lastWord.end + 0.6;

    if (currentTime >= start && currentTime < end) {
      return { phrase, idx: i, start, end };
    }
  }

  return null;
}
