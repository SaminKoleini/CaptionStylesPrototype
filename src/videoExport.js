// ─── Style 1 constants ────────────────────────────────────────────────────────
const CHUNK_SIZE = 9;
const COMPOSITION_WIDTH = 390;
const COMPOSITION_HEIGHT = 844;
const CAPTION_FONT_SIZE = 20;
const CAPTION_LINE_HEIGHT = 27;
const CAPTION_MAX_WIDTH_RATIO = 0.72;
const CAPTION_BOTTOM_RATIO = 0.85;

function buildChunks(captions) {
  const chunks = [];
  for (let i = 0; i < captions.length; i += CHUNK_SIZE) {
    chunks.push(captions.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
}

function getActiveText(chunks, currentTime) {
  const active = chunks.find((chunk, idx) => {
    const start = chunk[0].start;
    const end =
      idx + 1 < chunks.length
        ? chunks[idx + 1][0].start
        : chunk[chunk.length - 1].end + 1;
    return currentTime >= start && currentTime < end;
  });
  if (!active) return null;
  const raw = active.map((w) => w.word).join(" ").toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function drawCaptionFrame(ctx, chunks, currentTime) {
  const text = getActiveText(chunks, currentTime);
  if (!text) return;

  const fontStr = `600 ${CAPTION_FONT_SIZE}px "Helvetica Neue", Arial, sans-serif`;
  ctx.save();
  ctx.font = fontStr;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const maxWidth = COMPOSITION_WIDTH * CAPTION_MAX_WIDTH_RATIO;
  const lines = wrapLines(ctx, text, maxWidth);

  const totalHeight = lines.length * CAPTION_LINE_HEIGHT;
  const y = COMPOSITION_HEIGHT * CAPTION_BOTTOM_RATIO - totalHeight;
  const x = COMPOSITION_WIDTH / 2;

  // Draw outline by offsetting in 4 directions
  ctx.fillStyle = "black";
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    lines.forEach((line, i) => {
      ctx.fillText(line, x + dx, y + i * CAPTION_LINE_HEIGHT + dy);
    });
  }

  // Draw white text on top
  ctx.fillStyle = "white";
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * CAPTION_LINE_HEIGHT);
  });

  ctx.restore();
}

export function exportVideoWithCaptions(videoSrc, captions, onProgress) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = COMPOSITION_WIDTH;
    canvas.height = COMPOSITION_HEIGHT;
    const ctx = canvas.getContext("2d");

    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Canvas stream for video frames
      const canvasStream = canvas.captureStream(30);

      // Add audio track from video stream if available
      try {
        const videoStream = video.captureStream
          ? video.captureStream(30)
          : null;
        if (videoStream) {
          videoStream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
        }
      } catch {
        // Audio capture not available; export will be silent
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const chunks = [];
      const recorder = new MediaRecorder(canvasStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };

      recorder.onerror = (e) => reject(e.error);

      const captionChunks = buildChunks(captions);
      let rafId;

      const renderLoop = () => {
        if (video.ended || video.paused) {
          cancelAnimationFrame(rafId);
          recorder.stop();
          return;
        }

        ctx.clearRect(0, 0, COMPOSITION_WIDTH, COMPOSITION_HEIGHT);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, COMPOSITION_WIDTH, COMPOSITION_HEIGHT);
        ctx.drawImage(video, 0, 0, COMPOSITION_WIDTH, COMPOSITION_HEIGHT);
        drawCaptionFrame(ctx, captionChunks, video.currentTime);

        if (onProgress && video.duration > 0) {
          onProgress(Math.round((video.currentTime / video.duration) * 100));
        }

        rafId = requestAnimationFrame(renderLoop);
      };

      recorder.start(100);
      video.play().then(renderLoop).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for export"));
    video.load();
  });
}

// ─── Style 2: Bold and Highlighted ────────────────────────────────────────────
const CHUNK_SIZE_2 = 18;
const COMP2_WIDTH = 1280;
const COMP2_HEIGHT = 720;
const FONT_SIZE_2 = 40;
const LINE_HEIGHT_2 = 52;
const OUTLINE_OFFSET_2 = 3;

function buildChunks2(captions) {
  const chunks = [];
  for (let i = 0; i < captions.length; i += CHUNK_SIZE_2) {
    chunks.push(captions.slice(i, i + CHUNK_SIZE_2));
  }
  return chunks;
}

function drawCaptionFrame2(ctx, captions, chunks, currentTime) {
  // Find active chunk — stays visible until next chunk starts
  let activeChunkIdx = -1;
  for (let i = 0; i < chunks.length; i++) {
    const start = chunks[i][0].start;
    const end =
      i + 1 < chunks.length
        ? chunks[i + 1][0].start
        : chunks[i][chunks[i].length - 1].end + 1;
    if (currentTime >= start && currentTime < end) {
      activeChunkIdx = i;
      break;
    }
  }
  if (activeChunkIdx === -1) return;

  const activeChunk = chunks[activeChunkIdx];

  // Highlight: exact word match first, then fall back to last spoken word
  let highlightIdx = activeChunk.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );
  if (highlightIdx === -1) {
    for (let i = activeChunk.length - 1; i >= 0; i--) {
      if (currentTime >= activeChunk[i].start) {
        highlightIdx = i;
        break;
      }
    }
  }

  const fontStr = `900 ${FONT_SIZE_2}px "Nunito", sans-serif`;
  ctx.save();
  ctx.font = fontStr;
  ctx.textBaseline = "top";

  // Word-by-word layout with manual line wrapping
  const maxWidth = COMP2_WIDTH * 0.9;
  const x = COMP2_WIDTH / 2;

  // Build lines of words
  const lines = [];
  let currentLineWords = [];
  let currentLineWidth = 0;
  const spaceWidth = ctx.measureText(" ").width;

  for (let i = 0; i < activeChunk.length; i++) {
    const wordText = activeChunk[i].word;
    const wordWidth = ctx.measureText(wordText).width;
    const addWidth = currentLineWords.length > 0 ? spaceWidth + wordWidth : wordWidth;

    if (currentLineWords.length > 0 && currentLineWidth + addWidth > maxWidth) {
      lines.push(currentLineWords);
      currentLineWords = [{ word: wordText, idx: i }];
      currentLineWidth = wordWidth;
    } else {
      currentLineWords.push({ word: wordText, idx: i });
      currentLineWidth += addWidth;
    }
  }
  if (currentLineWords.length > 0) lines.push(currentLineWords);

  const visibleLines = lines.slice(0, 2);
  const totalHeight = visibleLines.length * LINE_HEIGHT_2;
  const startY = COMP2_HEIGHT * 0.92 - totalHeight;

  const offsets = [
    [-OUTLINE_OFFSET_2, -OUTLINE_OFFSET_2],
    [OUTLINE_OFFSET_2, -OUTLINE_OFFSET_2],
    [-OUTLINE_OFFSET_2, OUTLINE_OFFSET_2],
    [OUTLINE_OFFSET_2, OUTLINE_OFFSET_2],
    [-OUTLINE_OFFSET_2, 0],
    [OUTLINE_OFFSET_2, 0],
    [0, -OUTLINE_OFFSET_2],
    [0, OUTLINE_OFFSET_2],
  ];

  visibleLines.forEach((lineWords, lineIdx) => {
    const lineY = startY + lineIdx * LINE_HEIGHT_2;

    // Measure full line to center it
    let lineWidth = 0;
    lineWords.forEach((entry, wi) => {
      lineWidth += ctx.measureText(entry.word).width;
      if (wi < lineWords.length - 1) lineWidth += spaceWidth;
    });

    let curX = x - lineWidth / 2;

    lineWords.forEach((entry) => {
      const ww = ctx.measureText(entry.word).width;
      const isHighlighted = entry.idx === highlightIdx;

      // Draw outline
      ctx.fillStyle = "black";
      offsets.forEach(([dx, dy]) => {
        ctx.fillText(entry.word, curX + dx, lineY + dy);
      });

      // Draw word in colour
      ctx.fillStyle = isHighlighted ? "#22c55e" : "white";
      ctx.fillText(entry.word, curX, lineY);

      curX += ww + spaceWidth;
    });
  });

  ctx.restore();
}

export function exportVideoWithCaptions2(videoSrc, captions, onProgress) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = COMP2_WIDTH;
    canvas.height = COMP2_HEIGHT;
    const ctx = canvas.getContext("2d");

    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const canvasStream = canvas.captureStream(30);

      try {
        const videoStream = video.captureStream ? video.captureStream(30) : null;
        if (videoStream) {
          videoStream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
        }
      } catch {
        // Audio capture not available
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recordedChunks = [];
      const recorder = new MediaRecorder(canvasStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };

      recorder.onerror = (e) => reject(e.error);

      const captionChunks = buildChunks2(captions);
      let rafId;

      const renderLoop = () => {
        if (video.ended || video.paused) {
          cancelAnimationFrame(rafId);
          recorder.stop();
          return;
        }

        ctx.clearRect(0, 0, COMP2_WIDTH, COMP2_HEIGHT);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, COMP2_WIDTH, COMP2_HEIGHT);
        ctx.drawImage(video, 0, 0, COMP2_WIDTH, COMP2_HEIGHT);
        drawCaptionFrame2(ctx, captions, captionChunks, video.currentTime);

        if (onProgress && video.duration > 0) {
          onProgress(Math.round((video.currentTime / video.duration) * 100));
        }

        rafId = requestAnimationFrame(renderLoop);
      };

      recorder.start(100);
      video.play().then(renderLoop).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for export"));
    video.load();
  });
}

// ─── Style 3: Editorial Podcast ───────────────────────────────────────────────
const COMP3_WIDTH = 390;
const COMP3_HEIGHT = 844;
const TITLE_VISIBLE_SEC_3 = 4;
const SUBTITLE_FONT_3 = '400 24px "Playfair Display", Georgia, serif';
const SUBTITLE_COLOR_3 = "#F6F1E8";
const SUBTITLE_BOTTOM_RATIO_3 = 0.82;
const SUBTITLE_LINE_HEIGHT_3 = 34;
const SUBTITLE_MAX_WIDTH_RATIO_3 = 0.80;

function buildChunks3(captions, maxWords = 4) {
  const chunks = [];
  let i = 0;
  while (i < captions.length) {
    let end = Math.min(i + maxWords, captions.length);
    for (let j = i + 2; j < end; j++) {
      if (/[,\.?!;]$/.test(captions[j].word)) { end = j + 1; break; }
    }
    chunks.push(captions.slice(i, end));
    i = end;
  }
  return chunks;
}

function getActiveChunk3(chunks, currentTime) {
  return chunks.find((chunk, idx) => {
    const start = chunk[0].start;
    const end =
      idx + 1 < chunks.length
        ? chunks[idx + 1][0].start
        : chunk[chunk.length - 1].end + 1;
    return currentTime >= start && currentTime < end;
  }) ?? null;
}

function drawSubtitle3(ctx, text) {
  ctx.save();
  ctx.font = SUBTITLE_FONT_3;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const maxWidth = COMP3_WIDTH * SUBTITLE_MAX_WIDTH_RATIO_3;
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  const visibleLines = lines.slice(0, 2);

  const totalHeight = visibleLines.length * SUBTITLE_LINE_HEIGHT_3;
  const y = COMP3_HEIGHT * SUBTITLE_BOTTOM_RATIO_3 - totalHeight;
  const x = COMP3_WIDTH / 2;

  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = SUBTITLE_COLOR_3;
  visibleLines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * SUBTITLE_LINE_HEIGHT_3);
  });
  ctx.restore();
}

// Preloaded oval frame image — black background stripped, shared across exports.
// We process the PNG once: near-black pixels (R,G,B < 25) get alpha=0, giving a
// true transparent image so normal source-over drawing works without artifacts.
let _ovalFrameImg = null;
function loadOvalFrame() {
  if (_ovalFrameImg) return Promise.resolve(_ovalFrameImg);
  return new Promise((resolve) => {
    const raw = new Image();
    raw.onload = () => {
      const c = document.createElement("canvas");
      c.width = raw.naturalWidth;
      c.height = raw.naturalHeight;
      const c2d = c.getContext("2d");
      c2d.drawImage(raw, 0, 0);
      const id = c2d.getImageData(0, 0, c.width, c.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < 25 && d[i + 1] < 25 && d[i + 2] < 25) d[i + 3] = 0;
      }
      c2d.putImageData(id, 0, 0);
      c.toBlob((blob) => {
        const img2 = new Image();
        img2.onload = () => { _ovalFrameImg = img2; resolve(img2); };
        img2.onerror = () => resolve(null);
        img2.src = URL.createObjectURL(blob);
      }, "image/png");
    };
    raw.onerror = () => resolve(null);
    raw.src = "/oval-frame.png";
  });
}

function drawTitleCard3(ctx, title, currentTime, frameImg) {
  const FADE = 0.5;
  if (currentTime >= TITLE_VISIBLE_SEC_3) return;

  let opacity = 1;
  if (currentTime < FADE) opacity = currentTime / FADE;
  else if (currentTime > TITLE_VISIBLE_SEC_3 - FADE) opacity = (TITLE_VISIBLE_SEC_3 - currentTime) / FADE;
  opacity = Math.max(0, Math.min(1, opacity));

  ctx.save();
  ctx.globalAlpha = opacity;

  const cx = 195; // OVAL_CX — must match Caption3.jsx
  const cy = 175; // OVAL_CY

  // ── Oval frame PNG ─────────────────────────────────────────────────────────
  // The image has been pre-processed to have a transparent background, so
  // plain source-over drawing is sufficient — no blend mode tricks needed.
  if (frameImg) {
    const imgW = COMP3_WIDTH;                     // 390
    const imgH = Math.round(imgW * (597 / 1024)); // ≈ 227
    const imgTop = Math.round(cy - imgH / 2);     // ≈ 62
    ctx.drawImage(frameImg, 0, imgTop, imgW, imgH);
  }

  // ── Title text ────────────────────────────────────────────────────────────
  ctx.font = 'italic 700 50px "Bodoni Moda", Georgia, serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(255,255,255,0.20)";
  ctx.shadowBlur = 14;
  ctx.fillText(title, cx, cy);
  ctx.shadowBlur = 0;

  ctx.restore();
}

export function exportVideoWithCaptions3(videoSrc, captions, title, onProgress) {
  // Preload the oval frame PNG before starting — same-origin, no CORS issue.
  return loadOvalFrame().then((frameImg) => new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = COMP3_WIDTH;
    canvas.height = COMP3_HEIGHT;
    const ctx = canvas.getContext("2d");

    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const canvasStream = canvas.captureStream(30);

      try {
        const videoStream = video.captureStream ? video.captureStream(30) : null;
        if (videoStream) {
          videoStream.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
        }
      } catch {
        // Audio capture not available
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recordedChunks3 = [];
      const recorder = new MediaRecorder(canvasStream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks3.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks3, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };

      recorder.onerror = (e) => reject(e.error);

      const captionChunks3 = buildChunks3(captions);
      let rafId;

      const renderLoop = () => {
        if (video.ended || video.paused) {
          cancelAnimationFrame(rafId);
          recorder.stop();
          return;
        }

        ctx.clearRect(0, 0, COMP3_WIDTH, COMP3_HEIGHT);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, COMP3_WIDTH, COMP3_HEIGHT);
        ctx.drawImage(video, 0, 0, COMP3_WIDTH, COMP3_HEIGHT);

        if (title) drawTitleCard3(ctx, title, video.currentTime, frameImg);

        const activeChunk = getActiveChunk3(captionChunks3, video.currentTime);
        if (activeChunk) drawSubtitle3(ctx, activeChunk.map((w) => w.word).join(" "));

        if (onProgress && video.duration > 0) {
          onProgress(Math.round((video.currentTime / video.duration) * 100));
        }

        rafId = requestAnimationFrame(renderLoop);
      };

      recorder.start(100);
      video.play().then(renderLoop).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for export"));
    video.load();
  }));
}

// ─── Style 4: Motivational Rhythm — canvas export ─────────────────────────────
// Three-phase layout (mirrors Caption4.jsx exactly):
//
//   Phase A (0–33 %):   LEFT top headline (context 46px bold + emphasis 66px teal italic)
//                       CENTERED bottom subtitle (34px thin, word-by-word)
//   Phase B (33–66 %):  CENTERED caption — context line (28px) + emphasis line (52px italic)
//   Phase C (66–100 %): Full-screen dark overlay + DOMINANT emphasis word (78px)
//
// Spring slide-in is not replicated in canvas — words fade in instead.
const COMP4_W = 390;
const COMP4_H = 844;

// ── Design tokens (mirrors Caption4.jsx) ─────────────────────────────────────
const C4 = { primary: "#F4F1EA", accent: "#9BB8AE" };

const FONT4 = "'Inter', 'Helvetica Neue', Arial, sans-serif";

// Font sizes — mirrors Caption4.jsx constants exactly
const A_BOT_SZ4 = 38;   // Phase A bottom subtitle
const A_CTX_SZ4 = 46;   // Phase A top headline context
const A_EMP_SZ4 = 66;   // Phase A top headline emphasis
const B_CTX_SZ4 = 34;   // Phase B context line
const B_EMP_SZ4 = 60;   // Phase B emphasis line
const C_CTX_SZ4 = 46;   // Phase C context (same as Phase A top)
const C_EMP_SZ4 = 66;   // Phase C emphasis (same as Phase A top)

// Position constants — mirrors Caption4.jsx
const A_BOT_Y4 = 680;   // Phase A bottom subtitle vertical centre
const A_TOP_Y4 = 90;    // Phase A top headline start
const A_PAD4   = 30;    // Phase A left padding
const B_CY4    = 410;   // Phase B caption vertical centre
const C_CY4    = 440;   // Phase C caption vertical centre

// ── Inline helpers ────────────────────────────────────────────────────────────
const POWER_WORDS4 = new Set([
  "love","hate","fear","hope","pain","joy","shame","anger","guilt","pride",
  "mute","succeed","win","lose","fail","stop","start","change","build","break",
  "fight","die","live","grow","lead","create","quit","push","prove","earn",
  "lunatics","problem","problems","environment","genius","idiot",
  "truth","lie","dream","nightmare","success","failure","courage",
  "life","death","money","time","power","mind","heart","soul","world",
  "younger","older","better","worse","best","worst","stronger","weaker",
  "free","lost","found","broken","perfect","real","fake","bold","brave",
  "crazy","insane","rich","poor","smart","stupid","lazy","great","new",
  "never","always","every","everything","nothing","nobody","anyone",
  "only","even","still","just","first","last","already","yet","ever",
  "called","call","muted","silenced","success",
]);

function isEmp4(raw)  { return POWER_WORDS4.has(raw.toLowerCase().replace(/[^a-z]/g, "")); }
function tt4(s)       { return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ""; }
function getRaw4(w)   { return (w.word ?? w.text ?? "").trim(); }
function clamp4(x)    { return Math.max(0, Math.min(1, x)); }

// ── Group builders (self-contained, mirrors captionHelpers4.js) ───────────────
function buildLineGroups4(words, maxPerLine = 6) {
  if (!words || !words.length) return [];
  const ws = words.map((w) => ({ ...w, _t: getRaw4(w) }));
  const groups = [];
  let i = 0;
  while (i < ws.length) {
    let end = Math.min(i + maxPerLine, ws.length);
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
      emphasisWords: chunk.map((w) => w._t).filter(isEmp4),
    });
    i = end;
  }
  for (let j = 0; j < groups.length; j++) {
    groups[j].end = j + 1 < groups.length ? groups[j + 1].start : groups[j].end + 0.8;
  }
  return groups;
}

function buildHighlightGroups4(lineGroups, extra = 1.5) {
  return lineGroups
    .filter((g) => g.emphasisWords.length > 0)
    .map((g) => ({ ...g, end: g.end + extra }));
}

// ── Canvas drawing utility: draw a centred word row ───────────────────────────
// Measures each word, computes total width, then draws left-to-right from centre.
function drawWordRow4(ctx, words, centreX, centreY, size, weight, italic, color, gap = 5) {
  if (!words.length) return;
  ctx.textBaseline = "middle";
  const tokens = words.map((raw) => {
    ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${FONT4}`;
    return { raw, w: ctx.measureText(raw).width };
  });
  const totalW = tokens.reduce((s, t, i) => s + (i > 0 ? gap : 0) + t.w, 0);
  let x = centreX - totalW / 2;
  ctx.shadowColor = "rgba(0,0,0,0.80)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 1;
  ctx.fillStyle = color;
  tokens.forEach((tok, i) => {
    if (i > 0) x += gap;
    ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${FONT4}`;
    ctx.fillText(tok.raw, x, centreY);
    x += tok.w;
  });
  ctx.shadowBlur = 0;
}

// ── Phase A: LEFT-ALIGNED top headline ────────────────────────────────────────
function drawPhaseATop4(ctx, group, opacity) {
  if (!group || !opacity) return;

  const empSet = new Set(group.emphasisWords.map((e) => e.toLowerCase().replace(/[^a-z]/g, "")));
  const ctx_words = [];
  const emp_words = [];
  group.words.forEach((w) => {
    const raw = tt4(w._t ?? "");
    const key = (w._t ?? "").toLowerCase().replace(/[^a-z]/g, "");
    if (empSet.has(key)) emp_words.push(raw);
    else ctx_words.push(raw);
  });

  ctx.save();
  ctx.globalAlpha  = opacity;
  ctx.textBaseline = "top";
  ctx.textAlign    = "left";
  let y = A_TOP_Y4;

  if (ctx_words.length) {
    ctx.font      = `700 ${A_CTX_SZ4}px ${FONT4}`;
    ctx.fillStyle = C4.primary;
    ctx.shadowColor = "rgba(0,0,0,0.82)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 2;
    ctx.fillText(ctx_words.join(" "), A_PAD4, y);
    ctx.shadowBlur = 0;
    y += A_CTX_SZ4 * 1.2;
  }
  if (emp_words.length) {
    ctx.font      = `italic 800 ${A_EMP_SZ4}px ${FONT4}`;
    ctx.fillStyle = C4.accent;
    ctx.shadowColor = "rgba(0,0,0,0.70)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 2;
    ctx.fillText(emp_words.join(" "), A_PAD4, y);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// ── Phase A: CENTRED bottom running subtitle ───────────────────────────────────
function drawPhaseABottom4(ctx, group, currentTime) {
  if (!group) return;
  const visible = group.words.filter((w) => currentTime >= w.start);
  if (!visible.length) return;

  const cx = COMP4_W / 2;
  ctx.textBaseline = "middle";
  ctx.textAlign    = "center";

  // Per-word colouring requires per-word measurement → use drawWordRow4 pattern
  const tokens = visible.map((w) => {
    const raw = tt4(w._t ?? "");
    const emp = isEmp4(w._t ?? "");
    ctx.font = `${emp ? "italic 500" : "300"} ${A_BOT_SZ4}px ${FONT4}`;
    return { raw, emp, wd: ctx.measureText(raw).width };
  });
  const GAP  = 5;
  const totW = tokens.reduce((s, t, i) => s + (i > 0 ? GAP : 0) + t.wd, 0);
  let x = cx - totW / 2;
  ctx.shadowColor = "rgba(0,0,0,0.80)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 1;
  tokens.forEach((tok, i) => {
    if (i > 0) x += GAP;
      ctx.font      = `${tok.emp ? "italic 500" : "300"} ${A_BOT_SZ4}px ${FONT4}`;
      ctx.fillStyle = tok.emp ? C4.accent : "#FFFFFF";
    ctx.textAlign = "left";
    ctx.fillText(tok.raw, x, A_BOT_Y4);
    x += tok.wd;
  });
  ctx.shadowBlur = 0;
}

// ── Phase B: CENTRED context + emphasis stacked ───────────────────────────────
function drawPhaseB4(ctx, group, currentTime) {
  if (!group) return;
  const visible = group.words.filter((w) => currentTime >= w.start);
  if (!visible.length) return;

  const cx  = COMP4_W / 2;
  const hasEmp = visible.some((w) => isEmp4(w._t ?? ""));

  if (hasEmp) {
    const ctxW = visible.filter((w) => !isEmp4(w._t ?? "")).map((w) => tt4(w._t ?? ""));
    const empW = visible.filter((w) =>  isEmp4(w._t ?? "")).map((w) => tt4(w._t ?? ""));
    const gap  = B_CTX_SZ4 * 0.5;
    const totalH = (ctxW.length ? B_CTX_SZ4 : 0) + (ctxW.length && empW.length ? gap : 0) + (empW.length ? B_EMP_SZ4 : 0);
    let y = B_CY4 - totalH / 2;

    if (ctxW.length) {
      y += B_CTX_SZ4 / 2;
      drawWordRow4(ctx, ctxW, cx, y, B_CTX_SZ4, 300, false, C4.primary);
      y += B_CTX_SZ4 / 2 + gap;
    }
    if (empW.length) {
      y += B_EMP_SZ4 / 2;
      drawWordRow4(ctx, empW, cx, y, B_EMP_SZ4, 600, true, C4.accent);
    }
  } else {
    const words = visible.map((w) => tt4(w._t ?? ""));
    drawWordRow4(ctx, words, cx, B_CY4, B_CTX_SZ4, 300, false, C4.primary);
  }
}

// ── Phase C: centered, Phase-A-top style (heavy white + teal italic) ──────────
// The blur + light tint are applied in the render loop before this is called.
// Text style = same as Phase A top headline, but horizontally CENTRED.
function drawPhaseC4(ctx, group, currentTime) {
  if (!group) return;
  const visible = group.words.filter((w) => currentTime >= w.start);
  if (!visible.length) return;

  const cx     = COMP4_W / 2;
  const empSet = new Set(group.emphasisWords.map((e) => e.toLowerCase().replace(/[^a-z]/g, "")));
  const ctxW   = visible.filter((w) => !empSet.has((w._t ?? "").toLowerCase().replace(/[^a-z]/g, ""))).map((w) => tt4(w._t ?? ""));
  const empW   = visible.filter((w) =>  empSet.has((w._t ?? "").toLowerCase().replace(/[^a-z]/g, ""))).map((w) => tt4(w._t ?? ""));

  const hasEmp = empW.length > 0;
  const gap    = 10;
  const ctxH   = (hasEmp && ctxW.length) ? C_CTX_SZ4 : 0;
  const empH   = hasEmp ? C_EMP_SZ4 : 0;
  const totalH = ctxH + (ctxH && empH ? gap : 0) + empH + (hasEmp ? 0 : C_CTX_SZ4);
  let y = C_CY4 - totalH / 2;

  ctx.shadowColor = "rgba(0,0,0,0.75)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;

  if (hasEmp) {
    if (ctxW.length) {
      y += C_CTX_SZ4 / 2;
      drawWordRow4(ctx, ctxW, cx, y, C_CTX_SZ4, 700, false, C4.primary);
      y += C_CTX_SZ4 / 2 + gap;
    }
    y += C_EMP_SZ4 / 2;
    drawWordRow4(ctx, empW, cx, y, C_EMP_SZ4, 800, true, C4.accent);
  } else {
    // All words — centred, bold white
    y += C_CTX_SZ4 / 2;
    drawWordRow4(ctx, visible.map((w) => tt4(w._t ?? "")), cx, y, C_CTX_SZ4, 700, false, C4.primary);
  }

  ctx.shadowBlur = 0;
}

// ── Main per-frame draw call ──────────────────────────────────────────────────
function drawFrame4(ctx, lineGroups, highlightGroups, currentTime, duration) {
  if (!lineGroups.length) return;

  const phase = currentTime < duration / 3 ? "A"
              : currentTime < (duration * 2) / 3 ? "B"
              : "C";

  const activeGroup = lineGroups.find((g) => currentTime >= g.start && currentTime < g.end) ?? null;

  if (phase === "C") {
    // Blur + tint overlay are applied in the render loop before this call
    drawPhaseC4(ctx, activeGroup, currentTime);
    return;
  }

  if (phase === "B") {
    drawPhaseB4(ctx, activeGroup, currentTime);
    return;
  }

  // Phase A
  drawPhaseABottom4(ctx, activeGroup, currentTime);
  const cands = highlightGroups.filter((h) => currentTime >= h.start && currentTime < h.end);
  const hl    = cands.length ? cands[cands.length - 1] : null;
  if (hl) {
    const RAMP  = 0.2;
    const hlOp  = clamp4(Math.min(
      (currentTime - hl.start) / RAMP,
      (hl.end - currentTime) / RAMP
    ));
    drawPhaseATop4(ctx, hl, hlOp);
  }
}

// ── Main export function ───────────────────────────────────────────────────────
export function exportVideoWithCaptions4(videoSrc, transcription, onProgress) {
  return new Promise((resolve, reject) => {
    const canvas  = document.createElement("canvas");
    canvas.width  = COMP4_W;
    canvas.height = COMP4_H;
    const ctx = canvas.getContext("2d");

    // maxPerLine = 3 matches Caption4.jsx — prevents horizontal overflow at 38 px
    const lineGroups      = buildLineGroups4(transcription, 3);
    const highlightGroups = buildHighlightGroups4(lineGroups, 1.5);
    const fps             = 30;

    const video = document.createElement("video");
    video.src         = videoSrc;
    video.crossOrigin = "anonymous";
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration     = video.duration;
      const canvasStream = canvas.captureStream(fps);

      try {
        const vs = video.captureStream ? video.captureStream(fps) : null;
        if (vs) vs.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
      } catch { /* audio unavailable */ }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorded = [];
      const recorder = new MediaRecorder(canvasStream, { mimeType });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recorded.push(e.data); };
      recorder.onstop    = () => resolve(URL.createObjectURL(new Blob(recorded, { type: "video/webm" })));
      recorder.onerror   = (e) => reject(e.error);

      let rafId;
      const renderLoop = () => {
        if (video.ended || video.paused) {
          cancelAnimationFrame(rafId);
          recorder.stop();
          return;
        }

        const phaseNow = video.currentTime < duration / 3 ? "A"
                       : video.currentTime < (duration * 2) / 3 ? "B" : "C";

        ctx.clearRect(0, 0, COMP4_W, COMP4_H);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, COMP4_W, COMP4_H);

        // Phase C: blur the video frame using canvas filter before drawing
        if (phaseNow === "C") ctx.filter = "blur(8px)";
        ctx.drawImage(video, 0, 0, COMP4_W, COMP4_H);
        ctx.filter = "none";

        // Phase C: subtle dark tint over blurred video
        if (phaseNow === "C") {
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(0, 0, COMP4_W, COMP4_H);
        }

        drawFrame4(ctx, lineGroups, highlightGroups, video.currentTime, duration);

        if (onProgress && duration > 0) {
          onProgress(Math.round((video.currentTime / duration) * 100));
        }
        rafId = requestAnimationFrame(renderLoop);
      };

      recorder.start(100);
      video.play().then(renderLoop).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for export"));
    video.load();
  });
}

// ─── Style 5: Spatial Whisper canvas export ───────────────────────────────────

import { clusterWords, assignFallbackPlacements } from "./captionHelpers5.js";

const COMP5_W       = 390;
const COMP5_H       = 844;
const FONT5         = "'Quicksand', 'Dosis', sans-serif";
const ENTER5        = 12;
const EXIT5         = 10;

/**
 * Mirrors Caption5.jsx rendering logic on a canvas for video download.
 * Words are drawn at (xPct, yPct) positions with the same fade-in /
 * staggered-exit timing as the Remotion preview component.
 */
export function exportSpatialWhisper(videoSrc, transcription, layoutData, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.src = videoSrc;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const fps = 30;

      const canvas = document.createElement("canvas");
      canvas.width  = COMP5_W;
      canvas.height = COMP5_H;
      const ctx = canvas.getContext("2d");

      const captureStream5 = canvas.captureStream(fps);
      const audioCtx5 = new AudioContext();
      const src5 = audioCtx5.createMediaElementSource(video);
      const dest5 = audioCtx5.createMediaStreamDestination();
      src5.connect(dest5);
      src5.connect(audioCtx5.destination);
      captureStream5.addTrack(dest5.stream.getAudioTracks()[0]);

      const rec5 = new MediaRecorder(captureStream5, { mimeType: "video/webm; codecs=vp8,opus" });
      const chunks5 = [];
      rec5.ondataavailable = (e) => { if (e.data.size > 0) chunks5.push(e.data); };
      rec5.onstop = () => {
        audioCtx5.close();
        resolve(URL.createObjectURL(new Blob(chunks5, { type: "video/webm" })));
      };

      // Build clusters — mirrors Caption5 useMemo logic.
      const rawClusters = clusterWords(transcription, 6);
      const clusters5 = rawClusters.map((c, ci) => {
        const aiPl = layoutData?.clusters?.[ci]?.wordPlacements ?? null;
        return { ...c, placements: aiPl ?? assignFallbackPlacements(c.words) };
      });

      let raf5 = null;

      const loop5 = () => {
        if (video.ended || video.currentTime >= duration) {
          cancelAnimationFrame(raf5);
          rec5.stop();
          video.pause();
          return;
        }

        const fr = Math.round(video.currentTime * fps);
        const t  = video.currentTime;

        ctx.drawImage(video, 0, 0, COMP5_W, COMP5_H);

        const ac = clusters5.find((c) => t >= c.start && t < c.displayEnd);

        if (ac) {
          const cef = Math.round(ac.displayEnd * fps);
          ctx.save();
          ctx.textBaseline = "top";

          ac.placements.forEach((pl, wi) => {
            const w = ac.words[wi];
            if (!w) return;
            const wsf = Math.round(w.start * fps);
            if (fr < wsf) return;

            const age   = fr - wsf;
            const fIn   = Math.min(1, age / ENTER5);
            const drift = (1 - fIn) * 4;
            const esf   = cef - EXIT5 - wi * 4;
            const fOut  = fr > esf ? Math.max(0, 1 - (fr - esf) / EXIT5) : 1;
            const op    = Math.min(fIn, fOut) * (pl.layer === "behindSubject" ? 0.58 : 1);

            if (op <= 0) return;

            const wordTxt   = (w._text ?? "").toLowerCase();
            const approxW5  = wordTxt.length * 36 * 0.58;
            const rawX5     = Math.round(pl.xPct * COMP5_W);
            const rawY5     = Math.round(pl.yPct * COMP5_H);
            const x         = Math.max(6, Math.min(rawX5, COMP5_W - approxW5 - 8));
            const y         = Math.max(6, Math.min(rawY5, COMP5_H - 44)) + drift;

            ctx.globalAlpha = op;
            ctx.font        = `400 36px ${FONT5}`;
            ctx.fillStyle   = "rgba(255,255,255,0.88)";
            ctx.shadowColor = "rgba(255,255,255,0.22)";
            ctx.shadowBlur  = 10;
            ctx.fillText(wordTxt, x, y);
          });

          ctx.shadowBlur  = 0;
          ctx.globalAlpha = 1;
          ctx.restore();
        }

        if (onProgress && duration > 0) {
          onProgress(Math.round((video.currentTime / duration) * 100));
        }

        raf5 = requestAnimationFrame(loop5);
      };

      rec5.start(100);
      video.play().then(loop5).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for Section 5 export"));
    video.load();
  });
}

// ─── Style 6: Progressive Quote Stack canvas export ──────────────────────────

import { splitIntoLines, computeStartY, getVisibleLineCount } from "./captionHelpers6.js";

const COMP6_W        = 390;
const COMP6_H        = 844;
const FONT6          = "'Cormorant Garamond', 'Bodoni Moda', serif";
const FONT6_SIZE     = 26;
const FONT6_LH       = 1.45;
const FONT6_COLOR    = "#E0C04D";
const FADE6          = 14;   // frames
const DRIFT6         = 5;    // px

export function exportProgressiveQuote(videoSrc, transcription, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.src = videoSrc;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const fps = 30;

      const canvas = document.createElement("canvas");
      canvas.width  = COMP6_W;
      canvas.height = COMP6_H;
      const ctx = canvas.getContext("2d");

      const stream6 = canvas.captureStream(fps);
      const audioCtx6 = new AudioContext();
      const src6 = audioCtx6.createMediaElementSource(video);
      const dest6 = audioCtx6.createMediaStreamDestination();
      src6.connect(dest6);
      src6.connect(audioCtx6.destination);
      stream6.addTrack(dest6.stream.getAudioTracks()[0]);

      const rec6 = new MediaRecorder(stream6, { mimeType: "video/webm; codecs=vp8,opus" });
      const chunks6 = [];
      rec6.ondataavailable = (e) => { if (e.data.size > 0) chunks6.push(e.data); };
      rec6.onstop = () => {
        audioCtx6.close();
        resolve(URL.createObjectURL(new Blob(chunks6, { type: "video/webm" })));
      };

      const lines6 = splitIntoLines(transcription, 4);
      const startY6 = computeStartY(lines6.length, FONT6_SIZE, FONT6_LH, COMP6_H);
      const lineHeightPx6 = FONT6_SIZE * FONT6_LH;
      const hasReal6 = lines6.some((l) => l.start > 0 && l.start < duration);

      function revealFrame6(li) {
        if (hasReal6) return Math.round(lines6[li].start * fps);
        const interval = duration / lines6.length;
        return Math.round(li * interval * fps);
      }

      let raf6 = null;

      const loop6 = () => {
        if (video.ended || video.currentTime >= duration) {
          cancelAnimationFrame(raf6);
          rec6.stop();
          video.pause();
          return;
        }

        const fr = Math.round(video.currentTime * fps);
        const t  = video.currentTime;

        ctx.drawImage(video, 0, 0, COMP6_W, COMP6_H);

        const visCount = getVisibleLineCount(lines6, t, duration);

        ctx.textAlign    = "center";
        ctx.textBaseline = "top";
        ctx.font         = `300 ${FONT6_SIZE}px ${FONT6}`;

        for (let li = 0; li < visCount; li++) {
          const rf  = revealFrame6(li);
          const age = Math.max(0, fr - rf);
          const fadeIn = Math.min(1, age / FADE6);
          const drift  = (1 - fadeIn) * DRIFT6;
          const y = startY6 + li * lineHeightPx6 + drift;

          ctx.globalAlpha  = fadeIn;
          ctx.fillStyle    = FONT6_COLOR;
          ctx.shadowColor  = "rgba(224,192,77,0.18)";
          ctx.shadowBlur   = 14;
          ctx.fillText(lines6[li].text, COMP6_W / 2, y);
        }

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;

        if (onProgress && duration > 0) {
          onProgress(Math.round((video.currentTime / duration) * 100));
        }

        raf6 = requestAnimationFrame(loop6);
      };

      rec6.start(100);
      video.play().then(loop6).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for Section 6 export"));
    video.load();
  });
}

// ─── Style 7: Glowing Impact Captions canvas export ──────────────────────────

import { buildGlowPhrases } from "./captionHelpers7.js";

const COMP7_W       = 390;
const COMP7_H       = 844;
const FONT7         = "'Inter', system-ui, sans-serif";
const ORANGE7       = "#FF9A1F";
const TOP_SZ7       = 30;   // phases 1 & 3 base
const TOP_EMPH_SZ7  = 38;   // emphasis word
const CTR_SZ7       = 26;   // phase 2
const WORD_FADE7    = 8;    // frames per word fade-in
const PHRASE_FADE7  = 10;   // frames for phase-2 phrase fade-in
const HOLD_EXTRA7   = 6;    // frames after last word before behind-fade
const BEHIND_F7     = 14;   // frames of behind-speaker fade

/**
 * Canvas export mirrors Caption7.jsx 3-phase glow logic.
 * Glow is achieved via ctx.shadowColor + ctx.shadowBlur before fillText.
 */
export function exportGlowCaptions(videoSrc, transcription, onProgress) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.src = videoSrc;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const fps = 30;

      const canvas = document.createElement("canvas");
      canvas.width  = COMP7_W;
      canvas.height = COMP7_H;
      const ctx = canvas.getContext("2d");

      const stream7 = canvas.captureStream(fps);
      const audioCtx7 = new AudioContext();
      const src7 = audioCtx7.createMediaElementSource(video);
      const dest7 = audioCtx7.createMediaStreamDestination();
      src7.connect(dest7);
      src7.connect(audioCtx7.destination);
      stream7.addTrack(dest7.stream.getAudioTracks()[0]);

      const rec7 = new MediaRecorder(stream7, { mimeType: "video/webm; codecs=vp8,opus" });
      const chunks7 = [];
      rec7.ondataavailable = (e) => { if (e.data.size > 0) chunks7.push(e.data); };
      rec7.onstop = () => {
        audioCtx7.close();
        resolve(URL.createObjectURL(new Blob(chunks7, { type: "video/webm" })));
      };

      const phrases7 = buildGlowPhrases(transcription);

      let raf7 = null;

      const loop7 = () => {
        if (video.ended || video.currentTime >= duration) {
          cancelAnimationFrame(raf7);
          rec7.stop();
          video.pause();
          return;
        }

        const fr = Math.round(video.currentTime * fps);
        ctx.drawImage(video, 0, 0, COMP7_W, COMP7_H);

        const phrase = phrases7.find(
          (p) => fr >= Math.round(p.startTime * fps) &&
                 fr <  Math.round(p.displayEnd * fps)
        );

        if (phrase) {
          ctx.save();
          ctx.textAlign    = "center";
          ctx.textBaseline = "top";
          const cx = COMP7_W / 2;

          if (phrase.phase === "phase2") {
            // ── Phase 2: centered plain white ──────────────────────────────
            const startFr  = Math.round(phrase.startTime * fps);
            const fadeIn   = Math.min(1, Math.max(0, fr - startFr) / PHRASE_FADE7);
            const text7    = phrase.words.map((w) => w._text).join(" ");

            ctx.globalAlpha = fadeIn;
            ctx.font        = `700 ${CTR_SZ7}px ${FONT7}`;
            ctx.shadowColor = "rgba(0,0,0,0.88)";
            ctx.shadowBlur  = 10;
            ctx.fillStyle   = "#FFFFFF";
            ctx.fillText(text7, cx, COMP7_H * 0.44);
            ctx.shadowBlur  = 0;
          } else {
            // ── Phase 1 / 3: glowing word-by-word top headline ─────────────
            const lastWord     = phrase.words[phrase.words.length - 1];
            const lastWordFr   = Math.round(lastWord.start * fps);
            const allShownFr   = lastWordFr + WORD_FADE7 + HOLD_EXTRA7;
            const behindProg   = fr > allShownFr
              ? Math.min(1, (fr - allShownFr) / BEHIND_F7)
              : 0;
            const containerOp  = 1 - behindProg * 0.75;

            // Draw each word in 2-word line groups
            const words7 = phrase.words;
            const emphIdx = phrase.emphasisIndex;
            const lineH   = TOP_EMPH_SZ7 * 1.25;
            const startY  = COMP7_H * 0.12;

            ctx.globalAlpha = containerOp;

            for (let i = 0; i < words7.length; i++) {
              const word = words7[i];
              const wordFr = Math.round(word.start * fps);
              if (fr < wordFr) continue;

              const age    = fr - wordFr;
              const fadeIn = Math.min(1, age / WORD_FADE7);
              const isEmph = i === emphIdx;
              const sz     = isEmph ? TOP_EMPH_SZ7 : TOP_SZ7;
              const row    = Math.floor(i / 2);

              // Horizontal offset: 0 = left of pair, 1 = right
              const col    = i % 2;
              const offset = col === 0 ? -sz * 1.8 : sz * 1.8;

              const x = cx + offset;
              const y = startY + row * lineH;

              ctx.globalAlpha = containerOp * fadeIn;
              ctx.font        = `${isEmph ? 900 : 800} ${sz}px ${FONT7}`;

              if (isEmph) {
                ctx.shadowColor = "rgba(255,154,31,0.95)";
                ctx.shadowBlur  = 22;
                ctx.fillStyle   = ORANGE7;
              } else {
                ctx.shadowColor = "rgba(255,255,255,0.9)";
                ctx.shadowBlur  = 18;
                ctx.fillStyle   = "#FFFFFF";
              }

              ctx.fillText(word._text, x, y);
              ctx.shadowBlur = 0;
            }
          }

          ctx.globalAlpha = 1;
          ctx.restore();
        }

        if (onProgress && duration > 0) {
          onProgress(Math.round((video.currentTime / duration) * 100));
        }

        raf7 = requestAnimationFrame(loop7);
      };

      rec7.start(100);
      video.play().then(loop7).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for Section 7 export"));
    video.load();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 8 — Staircase Impact export
// ─────────────────────────────────────────────────────────────────────────────

import { buildStaircaseGroups } from "./captionHelpers8.js";

const FONT8        = "'Anton', 'Inter', system-ui, sans-serif";
const WORD_FADE8   = 6;      // frames per staircase word
const LINE_FADE8   = 8;      // frames per phase-2 line
const STEP_PX8     = 22;     // staircase rightward shift per word
const LEFT8        = 22;     // px from left edge
const LINE_H8      = 46;     // px between staircase lines
const TOP_SZ8      = 34;     // normal staircase word font size
const EMPH_SZ8     = 48;     // final word font size
const CTR_SZ8      = 22;     // phase 2 centered text font size
const YELLOW8      = "#F0D126";
const RED8         = "#E53935";
const WHITE8       = "#FFFFFF";
const SHADOW8_BLUR = 10;
const SHADOW8_OFF  = 2;

export async function exportStaircaseImpact(videoSrc, transcription, onProgress) {
  return new Promise((resolve, reject) => {
    const video   = document.createElement("video");
    const canvas  = document.createElement("canvas");
    const ctx     = canvas.getContext("2d");
    const chunks8 = [];

    video.src     = videoSrc;
    video.crossOrigin = "anonymous";
    video.muted   = false;
    video.preload = "auto";

    video.onloadedmetadata = () => {
      const vw       = video.videoWidth;
      const vh       = video.videoHeight;
      canvas.width   = vw;
      canvas.height  = vh;

      const duration = video.duration;
      const fps      = 30;
      const compW    = 390;
      const compH    = 844;
      const scaleX   = vw / compW;
      const scaleY   = vh / compH;

      const { phase1, phase2Lines, phase3 } = buildStaircaseGroups(transcription);

      // Helper: draw drop shadow text
      function drawShadowText(text, x, y, fontSize, weight, color, italic) {
        ctx.font      = `${italic ? "italic " : ""}${weight} ${fontSize * scaleX}px ${FONT8}`;
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        ctx.fillText(text, x + SHADOW8_OFF * scaleX, y + SHADOW8_OFF * scaleY);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = SHADOW8_BLUR * scaleX;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
      }

      // ── Staircase group renderer ─────────────────────────────────────────
      function drawStaircaseGroup(group, highlightColor, topFraction, frame) {
        if (!group.words?.length) return;
        const words   = group.words;
        const lastIdx = words.length - 1;
        const topY    = topFraction * compH * scaleY;

        for (let wi = 0; wi < words.length; wi++) {
          const wordFrame = Math.round(words[wi].start * fps);
          if (frame < wordFrame) continue;

          const age    = frame - wordFrame;
          const fadeIn = Math.min(1, age / WORD_FADE8);
          const isLast = wi === lastIdx;
          const sz     = isLast ? EMPH_SZ8 : TOP_SZ8;
          const x      = (LEFT8 + wi * STEP_PX8) * scaleX;
          const y      = topY + wi * LINE_H8 * scaleY;
          const text   = words[wi]._text ?? words[wi].word ?? words[wi].text ?? "";
          const color  = isLast ? highlightColor : WHITE8;

          ctx.save();
          ctx.globalAlpha = fadeIn;
          ctx.textAlign   = "left";
          ctx.textBaseline = "top";
          drawShadowText(text, x, y, sz, 900, color, isLast);

          if (isLast) {
            // Underline bar beneath the final word.
            const metrics = ctx.measureText(text);
            const uw      = metrics.width;
            const uy      = y + sz * scaleX + 2 * scaleY;
            ctx.fillStyle = highlightColor;
            ctx.fillRect(x, uy, uw, 3 * scaleY);
          }
          ctx.restore();
        }
      }

      // ── Phase 2 centered line renderer ──────────────────────────────────
      function drawCenteredLine(lines, frame) {
        const activeLine = lines.find(
          (l) =>
            frame >= Math.round(l.start * fps) &&
            frame <  Math.round(l.displayEnd * fps)
        );
        if (!activeLine) return;

        const startFr = Math.round(activeLine.start * fps);
        const fadeIn  = Math.min(1, Math.max(0, frame - startFr) / LINE_FADE8);
        const x       = vw / 2;
        const y       = 0.44 * compH * scaleY;

        ctx.save();
        ctx.globalAlpha  = fadeIn;
        ctx.textAlign    = "center";
        ctx.textBaseline = "top";
        drawShadowText(activeLine.text, x, y, CTR_SZ8, 700, WHITE8, false);
        ctx.restore();
      }

      // ── MediaRecorder setup ─────────────────────────────────────────────
      const rec8 = new MediaRecorder(canvas.captureStream(fps), {
        mimeType:    "video/webm;codecs=vp8",
        videoBitsPerSecond: 5_000_000,
      });
      rec8.ondataavailable = (e) => { if (e.data.size > 0) chunks8.push(e.data); };
      rec8.onstop = () => {
        const blob = new Blob(chunks8, { type: "video/webm" });
        resolve(URL.createObjectURL(blob));
      };

      let raf8;
      const loop8 = () => {
        if (video.ended || video.paused) {
          rec8.stop();
          return;
        }

        const t     = video.currentTime;
        const frame = Math.round(t * fps);

        ctx.drawImage(video, 0, 0, vw, vh);

        const inPhase1 = phase1.words?.length > 0 &&
          t >= phase1.start && t < phase1.displayEnd;
        const inPhase3 = phase3.words?.length > 0 &&
          t >= phase3.start && t < phase3.displayEnd;
        const inPhase2 = !inPhase1 && !inPhase3 &&
          phase2Lines.some(
            (l) =>
              frame >= Math.round(l.start * fps) &&
              frame <  Math.round(l.displayEnd * fps)
          );

        if (inPhase1) {
          drawStaircaseGroup(phase1, YELLOW8, 0.18, frame);
        } else if (inPhase3) {
          drawStaircaseGroup(phase3, RED8, 0.22, frame);
        } else if (inPhase2) {
          drawCenteredLine(phase2Lines, frame);
        }

        if (onProgress && duration > 0) {
          onProgress(Math.round((t / duration) * 100));
        }

        raf8 = requestAnimationFrame(loop8);
      };

      rec8.start(100);
      video.play().then(loop8).catch(reject);
    };

    video.onerror = () => reject(new Error("Failed to load video for Section 8 export"));
    video.load();
  });
}
