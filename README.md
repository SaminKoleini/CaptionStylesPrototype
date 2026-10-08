# Caption Styles Prototype

A web prototype for turning a talking-head video into **styled, animated captions**. Upload a clip, transcribe it with word-level timestamps, then preview the same transcript in **15 different caption styles** — from clean subtitles to kinetic, editorial and collage looks — all rendered live with [Remotion](https://www.remotion.dev).

It also includes a 30-second animated explainer composition, built with the same toolkit.

## What it does

- **Word-level transcription** with OpenAI Whisper (`whisper-1`), so captions can react to individual words.
- **15 caption styles**, each a Remotion component driven by the same transcript.
- **AI assists** where a style needs them:
  - a generated 1–2 word title card (Editorial Podcast), using `gpt-4o-mini`
  - speaker location from a vision model, so captions can wrap around the person (Spatial Whisper)
- **Live preview** in the browser with the Remotion Player — no rendering step.
- **Remotion Studio** for tweaking any composition against built-in sample data.
- **In-browser export** to WebM for the styles that support it (the rest say "Export coming soon").

## The styles

| # | Style | Look |
| --- | --- | --- |
| 1 | Simple and Readable | Clean centered captions, subtle outline, natural line breaks |
| 2 | Bold and Highlighted | Big bold white text with a thick outline; the word being spoken glows green (horizontal video) |
| 3 | Editorial Podcast | Elegant cream-white serif subtitles with a generated title card |
| 4 | Motivational Rhythm | Short phrases shift between top, centre and lower third; teal accents on power words |
| 5 | Spatial Whisper | Column-grid layout placed around the speaker using a vision model |
| 6 | Progressive Quote Stack | Lines build one by one into a centered stack |
| 7 | Glowing Impact Captions | Three phases: a glowing headline up top (orange emphasis word), plain bold centered text, then the glow returns |
| 8 | Staircase Impact | Words build into a left-anchored staircase (final word yellow, then red), with centered lines in between |
| 9 | 3D Depth Reveal | CSS 3D perspective drift, context words appearing word by word |
| 10 | migs.visuals Dynamic | Every phrase pinned to its own vertical position |
| 11 | Neon Bloom | Small italic context words above a massive neon orange/gold hero word |
| 12 | Retro Signal | Four phases: glitchy scanline title, serif captions, a big title with captions on top, and scrolling topic words behind the speaker |
| 13 | Cozy Handwritten | Topic word in a hand-drawn wobbly ellipse, handwritten captions |
| 14 | Editorial Serif | Context words above a huge italic serif hero word |
| 15 | Scrappy Paper Cutouts | Old-magazine / ransom-note collage lettering with swaying paper stars |

Each style lives in `src/CaptionN.jsx` (the look) with a matching `CaptionVideoN.jsx` (the Remotion Player wrapper) and, for some, a `captionHelpersN.js` (grouping/timing logic). Compositions are registered in `src/remotion/Root.jsx`.

## Tech stack

- **Frontend:** React 19 + Vite
- **Video:** Remotion (`remotion`, `@remotion/player`, `@remotion/transitions`, `@remotion/google-fonts`)
- **Backend:** Express 5, Multer for uploads
- **AI:** OpenAI SDK — Whisper (transcription), `gpt-4o-mini` (titles), a vision model (speaker layout)

## Prerequisites

- Node.js 18 or higher
- An OpenAI API key (you paste it into the UI; see [API key handling](#api-key-handling))

## Getting started

```bash
npm install
```

Run the backend and the frontend in two terminals:

```bash
# Terminal 1 — API server (http://localhost:3001)
npm run server

# Terminal 2 — Vite dev server (http://localhost:5173)
npm run dev
```

Then open <http://localhost:5173>, upload a video, enter your OpenAI API key, and press **Generate Captions** on any style. Transcription usually takes 10–30 seconds. See [QUICKSTART.md](QUICKSTART.md) for the short version.

### Remotion Studio

To edit or preview compositions on their own against sample data:

```bash
npm run studio
```

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server for the UI |
| `npm run server` / `npm start` | Express API server |
| `npm run studio` | Remotion Studio |
| `npm run build` | Production build of the UI |
| `npm run lint` | ESLint |

## Configuration

| Variable | Used by | Default | Purpose |
| --- | --- | --- | --- |
| `PORT` | server | `3001` | Port the API listens on |
| `VITE_API_BASE_URL` | frontend | `http://localhost:3001` | Where the UI sends API requests |

## How it works

```
Upload video + API key
        ↓
Express server → OpenAI Whisper (word timestamps)
        ↓
Captions come back to the browser as [{ word, start, end }, …]
        ↓
Each style groups the words and animates them
        ↓
Remotion Player renders the preview in the browser
```

### API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/transcribe` | Video upload → word-level timestamps |
| `POST` | `/generate-title` | Transcript → a short 1–2 word title (with a local fallback if the call fails) |
| `POST` | `/analyze-spatial-layout` | Video frames → speaker and face bounding boxes (used by Spatial Whisper) |
| `GET` | `/health` | Health check for deploys |

## Project structure

```
├── server/index.js            # Express API (transcribe, title, spatial layout, health)
├── src/
│   ├── App.jsx                # upload + one section per style
│   ├── Caption*.jsx           # the 15 caption styles
│   ├── CaptionVideo*.jsx      # Remotion Player wrappers
│   ├── captionHelpers*.js     # grouping and timing logic
│   ├── videoExport.js         # in-browser WebM export
│   ├── AIAgents/              # five-scene animated explainer (~30 s)
│   └── remotion/              # Root.jsx, sample data, composition wrappers
├── public/
├── remotion.config.js
└── vite.config.js
```

## API key handling

- The key is entered in the browser and sent straight to your own Express server.
- The server uses it only for that request's OpenAI calls and never stores or logs it.
- For anything beyond a prototype, keep the key server-side and add real authentication.

## Notes

- Only the audio is needed for transcription; the video itself stays in your browser for preview.
- Uploaded files are deleted from the server once transcription finishes.
- This is a prototype, not production software.

## Troubleshooting

**"Transcription failed"** — check that the API key is valid and has Whisper access, that the file isn't corrupted, and read the server terminal for the detailed error.

**Video won't play** — your browser may not support the container; try an MP4.

**No captions appear** — make sure the video has clear speech and check the browser console.

**Server won't start** — port 3001 may be in use; set `PORT` to something else and update `VITE_API_BASE_URL`.

## Credits

Built with React, Vite, Remotion and the OpenAI API.

## License

MIT
