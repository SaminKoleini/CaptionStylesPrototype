/**
 * captionHelpers7.js — Glowing Impact Captions helpers
 *
 * Phrase grouping: same pause/duration/max-word logic as other sections.
 * Phase assignment: phrase-count based
 *   Phase 1 — first ~40 % of groups  (glowing top headline)
 *   Phase 2 — next 2 groups          (centered plain bold white)
 *   Phase 3 — remaining groups       (glowing top headline again)
 *
 * Emphasis detection: heuristic — longest non-filler word in the group.
 */

// ─── Filler words skipped for emphasis detection ──────────────────────────────
const FILLERS = new Set([
  "the","a","an","and","or","but","in","on","at","to","is","it","of","for",
  "so","as","be","by","do","he","i","if","me","my","no","up","we","you","are",
  "was","not","can","all","its","our","has","had","was","this","that","they",
  "with","have","from","than","like","just","been","into","more","also","when",
]);

/**
 * Returns the index of the emphasis word within `words`.
 * Picks the longest non-filler word. Falls back to the last word.
 */
function findEmphasisIndex(words) {
  let best = -1;
  let bestLen = -1;

  for (let i = 0; i < words.length; i++) {
    const t = words[i]._text.toLowerCase().replace(/[^a-z]/g, "");
    if (!FILLERS.has(t) && t.length > bestLen) {
      bestLen = t.length;
      best    = i;
    }
  }

  // If every word is a filler, use the last word as default.
  return best === -1 ? words.length - 1 : best;
}

// ─── Phrase grouping ──────────────────────────────────────────────────────────

/**
 * Groups the flat Whisper word array into phrase clusters.
 * Break triggers: natural pause > 350 ms, phrase duration > 2 s, or 5 words.
 * Returns raw groups (arrays of normalised word objects) before phase assignment.
 */
function groupRaw(words) {
  const ws = words.map((w) => ({
    ...w,
    _text: (w.word ?? w.text ?? "").trim(),
  }));

  const groups = [];
  let group = [];

  for (let i = 0; i < ws.length; i++) {
    group.push(ws[i]);

    const next     = ws[i + 1];
    const gap      = next ? next.start - ws[i].end : 999;
    const duration = ws[i].end - group[0].start;

    if (gap > 0.35 || duration > 2.0 || group.length >= 5) {
      groups.push(group);
      group = [];
    }
  }

  if (group.length) groups.push(group);
  return groups;
}

// ─── Phase assignment ─────────────────────────────────────────────────────────

/**
 * Given N total groups, assign phases:
 *   Phase 1: indices 0 … floor(N * 0.40) - 1
 *   Phase 2: next 2 groups
 *   Phase 3: everything else
 *
 * Minimum 1 group per phase (when N is very small).
 */
function assignPhase(index, total) {
  const p1End = Math.max(1, Math.floor(total * 0.40));
  const p2End = Math.min(total - 1, p1End + 2);

  if (index < p1End)  return "phase1";
  if (index < p2End)  return "phase2";
  return "phase3";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Main entry point.
 * Returns an array of GlowPhrase objects consumed by Caption7.jsx.
 *
 * GlowPhrase {
 *   id               number
 *   words            normalised word array
 *   startTime        seconds
 *   endTime          seconds (extended to next phrase start to close gaps)
 *   phase            "phase1" | "phase2" | "phase3"
 *   emphasisIndex    index in words[] of the emphasis word (-1 = none for phase2)
 * }
 */
export function buildGlowPhrases(transcription) {
  if (!transcription?.length) return [];

  const rawGroups = groupRaw(transcription);
  const total     = rawGroups.length;

  const phrases = rawGroups.map((words, i) => ({
    id:           i,
    words,
    startTime:    words[0].start,
    endTime:      words[words.length - 1].end,
    phase:        assignPhase(i, total),
    emphasisIndex: assignPhase(i, total) === "phase2" ? -1 : findEmphasisIndex(words),
  }));

  // Extend each phrase's displayEnd to the start of the next one
  // so there are no blank frames between phrases.
  for (let i = 0; i < phrases.length; i++) {
    phrases[i].displayEnd =
      i + 1 < phrases.length
        ? phrases[i + 1].startTime - 0.04
        : phrases[i].endTime + 1.0;
  }

  return phrases;
}
