import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI, { toFile } from "openai";
import fs from "fs";
import path from "path";

const app = express();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

app.use(cors());
// Increase the JSON body limit to accommodate base64-encoded video frames
// sent from the client for the spatial layout analysis endpoint.
app.use(express.json({ limit: "40mb" }));

app.post("/transcribe", upload.single("video"), async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Video file is required" });
    }

    const openai = new OpenAI({ apiKey });

    console.log("Transcribing video:", req.file.originalname);

    // Detect QuickTime-branded MP4 (ftyp brand "qt  ") and remap to .mov
    // so OpenAI's Whisper recognises the container correctly.
    const headerBuf = Buffer.alloc(12);
    const fd = fs.openSync(req.file.path, "r");
    fs.readSync(fd, headerBuf, 0, 12, 0);
    fs.closeSync(fd);
    const majorBrand = headerBuf.slice(8, 12).toString("ascii");
    const isQuickTime = majorBrand.trim() === "qt";

    const fileStream = fs.createReadStream(req.file.path);
    const uploadName = isQuickTime
      ? req.file.originalname.replace(/\.(mp4|m4v)$/i, ".mov")
      : req.file.originalname;
    const uploadMime = isQuickTime ? "video/quicktime" : req.file.mimetype;

    const openaiFile = await toFile(fileStream, uploadName, { type: uploadMime });

    const transcription = await openai.audio.transcriptions.create({
      file: openaiFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"],
    });

    fs.unlinkSync(req.file.path);

    console.log("Transcription complete. Word count:", transcription.words?.length || 0);

    res.json(transcription.words || []);
  } catch (error) {
    console.error("Transcription error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const statusCode = error.status || 500;
    const errorType = error.type || "unknown_error";
    const errorCode = error.code || null;

    let userMessage = error.message;

    if (statusCode === 400 && error.message.includes("Unrecognized file format")) {
      userMessage = "Unsupported video format. Please use MP4, MPEG, or WEBM format. You may need to convert your video file.";
    } else if (statusCode === 401) {
      userMessage = "Invalid API key. Please check your OpenAI API key and try again.";
      if (error.message.includes("Incorrect API key")) {
        userMessage = "Incorrect API key provided. The key format is invalid or the key doesn't exist.";
      }
    } else if (statusCode === 429) {
      userMessage = "Rate limit exceeded. Please wait a moment and try again.";
    } else if (statusCode === 402) {
      userMessage = "Insufficient credits. Please add credits to your OpenAI account.";
    } else if (statusCode === 403) {
      userMessage = "Access forbidden. Your API key may not have permission to use the Whisper API.";
    }

    res.status(statusCode).json({
      error: userMessage,
      details: {
        type: errorType,
        code: errorCode,
        status: statusCode,
        originalMessage: error.message,
      },
    });
  }
});

// ─── Generate a 1-2 word editorial title from the transcript ─────────────────
app.post("/generate-title", async (req, res) => {
  const { transcriptText, apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }
  if (!transcriptText || !transcriptText.trim()) {
    return res.status(400).json({ error: "Transcript text is required" });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are creating a short elegant social-video title. Read the transcript and return exactly one emotionally resonant 1–2 word title in title case. No quotes. No extra text. No punctuation. Examples: Comments, Boundaries, Healing, Red Flags, Confidence, Friendship.",
        },
        { role: "user", content: transcriptText },
      ],
      max_tokens: 10,
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content.trim();
    // Sanitise: keep only the first 1-2 words, strip punctuation
    const words = raw.replace(/[^a-zA-Z\s'-]/g, "").trim().split(/\s+/).slice(0, 2);
    const title = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

    res.json({ title });
  } catch (error) {
    console.error("Title generation error:", error);

    // Fallback: pick the most-repeated content word from the transcript
    const stopWords = new Set([
      "the","a","an","and","or","but","in","on","at","to","for","of","with",
      "is","it","i","you","we","they","he","she","was","are","be","been",
      "have","has","had","that","this","not","do","did","so","if","as",
      "just","like","but","get","got","my","your","me","him","her","us",
    ]);
    const freq = {};
    transcriptText.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).forEach((w) => {
      if (w.length > 3 && !stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    const fallback = top
      ? top[0].charAt(0).toUpperCase() + top[0].slice(1)
      : "Podcast";

    res.json({ title: fallback, fallback: true });
  }
});

// ─── Spatial Whisper: layout analysis via GPT-4.1 vision ─────────────────────
//
// Receives an array of phrase clusters, each with the words to place and
// an optional base64 JPEG frame captured from the video at the cluster's
// midpoint. Returns structured word-placement JSON for every cluster.
//
// POST /analyze-spatial-layout
// Body: { apiKey: string, clusters: Array<{ words: string[], frameDataUrl?: string }> }
// Response: { clusters: Array<{ subjectBox, faceBox } | null> }
//
// The client uses subjectBox/faceBox to anchor a deterministic left/right
// column layout in Caption5.jsx. Null entries mean the vision call failed;
// the client falls back to centred defaults for those clusters.

app.post("/analyze-spatial-layout", async (req, res) => {
  const { apiKey, clusters } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }
  if (!clusters?.length) {
    return res.status(400).json({ error: "No clusters provided" });
  }

  const openai = new OpenAI({ apiKey });
  const results = [];

  // Simple task: locate the speaker in each frame.
  // Word placement is handled deterministically on the client (Caption5.jsx).
  const SYSTEM_PROMPT =
    "You are a video frame analyser. Locate the primary speaker in the frame " +
    "and return the bounding boxes of their body and face as fractions (0.0–1.0) " +
    "of the frame dimensions. Return only valid JSON, no extra text.";

  for (const cluster of clusters) {
    const { frameDataUrl = null } = cluster;

    const userText =
      "Locate the speaker/person in this video frame.\n" +
      "Return ONLY this JSON — coordinates as fractions 0.0–1.0 of frame width/height:\n" +
      "{\n" +
      '  "subjectBox": { "xPct": 0.2, "yPct": 0.15, "wPct": 0.6, "hPct": 0.65 },\n' +
      '  "faceBox":    { "xPct": 0.3, "yPct": 0.10, "wPct": 0.4, "hPct": 0.28 }\n' +
      "}\n" +
      "subjectBox = full visible body. faceBox = face only (tighter box). No other text.";

    try {
      const userContent = frameDataUrl
        ? [
            { type: "image_url", image_url: { url: frameDataUrl, detail: "low" } },
            { type: "text", text: userText },
          ]
        : [{ type: "text", text: "No frame provided. Return default centred boxes.\n" + userText }];

      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        max_tokens: 200,
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const parsed = JSON.parse(completion.choices[0].message.content);

      if (!parsed.subjectBox && !parsed.faceBox) {
        throw new Error("No bounding boxes returned by vision model");
      }

      console.log("Speaker detected for cluster:", JSON.stringify(parsed.faceBox ?? parsed.subjectBox));
      results.push({
        subjectBox: parsed.subjectBox ?? null,
        faceBox: parsed.faceBox ?? null,
      });
    } catch (err) {
      console.error("Speaker detection failed for cluster:", err.message);
      // Null → Caption5 falls back to centred default column positions.
      results.push(null);
    }
  }

  res.json({ clusters: results });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
