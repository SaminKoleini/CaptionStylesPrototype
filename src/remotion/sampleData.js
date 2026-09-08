// Sample transcript used for Remotion Studio previews.
// Matches the shape returned by the Whisper API: [{ word, start, end }]

export const SAMPLE_TRANSCRIPTION = [
  { word: "Every",    start: 0.00, end: 0.30 },
  { word: "great",    start: 0.35, end: 0.60 },
  { word: "story",    start: 0.65, end: 0.95 },
  { word: "starts",   start: 1.00, end: 1.30 },
  { word: "with",     start: 1.35, end: 1.50 },
  { word: "a",        start: 1.55, end: 1.65 },
  { word: "single",   start: 1.70, end: 2.00 },
  { word: "word.",    start: 2.05, end: 2.50 },
  { word: "What",     start: 2.80, end: 3.00 },
  { word: "you",      start: 3.05, end: 3.20 },
  { word: "say",      start: 3.25, end: 3.50 },
  { word: "matters,", start: 3.55, end: 3.90 },
  { word: "but",      start: 3.95, end: 4.10 },
  { word: "how",      start: 4.15, end: 4.35 },
  { word: "you",      start: 4.40, end: 4.55 },
  { word: "show",     start: 4.60, end: 4.85 },
  { word: "it",       start: 4.90, end: 5.05 },
  { word: "matters",  start: 5.10, end: 5.45 },
  { word: "more.",    start: 5.50, end: 6.20 },
];

// 7 seconds at 30 fps
export const SAMPLE_DURATION_FRAMES = 210;

// Used by Style 3 (Editorial Podcast) for the title card
export const SAMPLE_TITLE = "STORY";
