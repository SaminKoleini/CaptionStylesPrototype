# TikTok-Style Auto Caption Prototype

A web-based prototype that automatically generates TikTok-style captions for videos using OpenAI's Whisper API and displays them with Remotion Player.

## Features

- Upload video files (MP4, MOV, etc.)
- Transcribe audio using OpenAI Whisper API with word-level timestamps
- Display TikTok-style captions with:
  - Bold white text with black stroke outline
  - Grouped words (4-6 words per caption)
  - Smooth timing synchronized with speech
- Real-time preview with Remotion Player (runs entirely in browser)

## Tech Stack

- **Frontend**: React + Vite
- **Video Player**: Remotion Player
- **Backend**: Express.js
- **Transcription**: OpenAI Whisper API
- **File Upload**: Multer

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key with access to Whisper API

## Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

## Running the Application

You need to run both the frontend and backend servers:

### Terminal 1 - Frontend (Vite Dev Server)
```bash
npm run dev
```
This starts the React app on `http://localhost:5173`

### Terminal 2 - Backend (Express Server)
```bash
npm run server
```
This starts the API server on `http://localhost:3001`

## Usage

1. Open `http://localhost:5173` in your browser
2. Upload a video file (any format supported by your browser)
3. Enter your OpenAI API key (starts with `sk-...`)
4. Click "Generate Captions"
5. Wait for transcription to complete (progress indicator will show)
6. Preview your video with TikTok-style captions in the player below

## How It Works

```
User uploads video + API key
        ↓
Frontend sends video to Express backend
        ↓
Express calls OpenAI Whisper API
        ↓
Whisper returns word-level timestamps
        ↓
Frontend receives caption data
        ↓
Remotion Player renders video with caption overlay
```

## Project Structure

```
/
├── server/
│   └── index.js              # Express server with Whisper API integration
├── src/
│   ├── App.jsx               # Main UI component
│   ├── App.css               # Styling
│   ├── CaptionVideo.jsx      # Remotion Player wrapper
│   ├── Caption.jsx           # TikTok-style caption overlay
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── uploads/                  # Temporary video storage (auto-created)
├── vite.config.js
├── package.json
└── README.md
```

## API Key Security

- Your API key is sent directly from the browser to the Express server
- The server uses it only for the Whisper API call
- The key is never stored or logged
- For production use, implement proper authentication and server-side key management

## Notes

- The video file stays in your browser (only audio is sent to Whisper)
- Temporary files are automatically cleaned up after transcription
- The Remotion Player runs entirely client-side (no encoding required)
- This is a prototype - not production-ready

## Troubleshooting

**"Transcription failed" error:**
- Verify your OpenAI API key is valid
- Check that your API key has Whisper API access
- Ensure the video file is not corrupted
- Check the server terminal for detailed error messages

**Video doesn't play:**
- Make sure your browser supports the video format
- Try converting the video to MP4 format
- Check browser console for errors

**Captions don't appear:**
- Verify the video has audio/speech
- Check that the transcription returned word timestamps
- Look for errors in the browser console

## License

MIT

## Credits

Built with React, Vite, Remotion, and OpenAI Whisper API.
