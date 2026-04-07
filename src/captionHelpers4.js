// ─── Style 4: Motivational Rhythm — caption helpers ──────────────────────────
//
// The system has three phases driven by the total video duration:
//
//   Phase 1 (0 – 33 %)   Bottom word-by-word subtitle  +  top highlight phrase
//   Phase 2 (33 – 66 %)  Center word-by-word subtitle (1 line, no top overlay)
//   Phase 3 (66 – 100 %) Center word-by-word subtitle (2 lines, dark bg)
//
// A "line group" is a batch of ≤ MAX_PER_LINE words shown together on one
// subtitle line, built up one word at a time as each word is spoken.
// A "highlight group" is a line group that contains at least one emphasis word
// and is displayed at the top (Phase 1) in a large, stacked layout.

// ─── Power-word set ───────────────────────────────────────────────────────────
export const POWER_WORDS = new Set([
  // emotional beats
  "love","hate","fear","hope","pain","joy","shame","anger","guilt","pride",
  // actions
  "mute","succeed","win","lose","fail","stop","start","change","build","break",
  "fight","die","live","grow","lead","create","quit","push","prove","earn",
  "hide","speak","show","find","run","rise","fall","stay","move","wake",
  // key nouns
  "lunatics","problem","problems","environment","genius","idiot",
  "truth","lie","dream","nightmare","success","failure","courage",
  "life","death","money","time","power","mind","heart","soul","world",
  "future","past","people","person","man","woman","kid","child",
  // adjectives / states
  "younger","older","better","worse","best","worst","stronger","weaker",
  "free","lost","found","broken","perfect","real","fake","bold","brave",
  "crazy","insane","rich","poor","smart","stupid","lazy","great","new",
  "different","special","unique","normal","ordinary","impossible","possible",
  // intensifiers
  "never","always","every","everything","nothing","nobody","anyone",
  "only","even","still","just","first","last","already","yet","ever",
  // commonly spoken power words
  "called","call","success","muted","silenced","younger",
]);

/** Returns true if this raw word token should receive accent styling. */
export function isEmphasisWord(raw) {
  return POWER_WORDS.has(raw.toLowerCase().replace(/[^a-z]/g, ""));
}

/** Title-case a single word (first letter upper, rest lower). */
export function toTitleCase(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ─── Internal helper ──────────────────────────────────────────────────────────
function getWord(w) {
  return (w.word ?? w.text ?? "").trim();
}

// ─── buildLineGroups ──────────────────────────────────────────────────────────
/**
 * Groups a flat Whisper word-timing array into "line groups" — sequences of
 * words that are shown together on one subtitle line (built word by word).
 *
 * Each group object:
 *   { words, start, end, emphasisWords }
 *
 * words[i] has an extra `_t` property with the raw word string.
 *
 * End times are extended to the next group's start so there are no blank gaps.
 *
 * @param {Array}  words      - flat Whisper word timings ({ word/text, start, end })
 * @param {number} maxPerLine - max words before breaking to a new group (default 6)
 */
export function buildLineGroups(words, maxPerLine = 6) {
  if (!words || !words.length) return [];

  // Augment every word with a clean `_t` string
  const ws = words.map((w) => ({ ...w, _t: getWord(w) }));

  const groups = [];
  let i = 0;

  while (i < ws.length) {
    let end = Math.min(i + maxPerLine, ws.length);

    // Prefer to break on punctuation for natural cadence
    for (let j = i; j < end; j++) {
      const tok = ws[j]._t;
      if (/[.!?]/.test(tok)) { end = j + 1; break; }
      if (/[,;]/.test(tok) && j > i + 1) { end = j + 1; break; }
    }

    const chunk = ws.slice(i, end);
    groups.push({
      words:         chunk,
      start:         chunk[0].start,
      end:           chunk[chunk.length - 1].end,
      emphasisWords: chunk.map((w) => w._t).filter(isEmphasisWord),
    });
    i = end;
  }

  // Extend end time of each group to the start of the next (no blank gaps)
  for (let j = 0; j < groups.length; j++) {
    groups[j].end =
      j + 1 < groups.length
        ? groups[j + 1].start
        : groups[j].end + 0.8;
  }

  return groups;
}

// ─── buildHighlightGroups ─────────────────────────────────────────────────────
/**
 * Extracts line groups that contain at least one emphasis word.
 * These are shown as top-overlay highlights during Phase 1.
 * Their end time is extended by `extraDuration` seconds so they
 * "stick" on screen a little longer than the spoken phrase.
 *
 * @param {Array}  lineGroups    - output of buildLineGroups
 * @param {number} extraDuration - seconds to extend each highlight (default 1.5)
 */
export function buildHighlightGroups(lineGroups, extraDuration = 1.5) {
  return lineGroups
    .filter((g) => g.emphasisWords.length > 0)
    .map((g) => ({ ...g, end: g.end + extraDuration }));
}
