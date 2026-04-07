/**
 * captionHelpers5.js — Spatial Whisper caption utilities
 *
 * Handles phrase clustering, fallback word placement, and client-side
 * frame extraction for the floating spatial caption system (Section 5).
 */

// ─── Phrase Clustering ────────────────────────────────────────────────────────

/**
 * Groups word-level Whisper output into phrase clusters of 4–7 words.
 * Prefers breaking on punctuation; fills up to maxPerCluster otherwise.
 * Each cluster carries `displayEnd` — the time we should stop showing it,
 * extended to the start of the next cluster so there is never a gap.
 */
export function clusterWords(words, maxPerCluster = 6) {
  if (!words?.length) return [];

  // Normalise: ensure each word has a `_text` field.
  const ws = words.map((w) => ({
    ...w,
    _text: (w.word ?? w.text ?? "").trim(),
  }));

  const clusters = [];
  let i = 0;

  while (i < ws.length) {
    let end = Math.min(i + maxPerCluster, ws.length);

    // Try to break early at punctuation (but not on the very first word).
    for (let j = i + 2; j < end; j++) {
      const t = ws[j]._text;
      if (/[.!?;]$/.test(t)) { end = j + 1; break; }
      if (/[,]$/.test(t) && j > i + 2) { end = j + 1; break; }
    }

    const chunk = ws.slice(i, end);
    clusters.push({
      words: chunk,
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
      // midTime used for frame extraction
      midTime: (chunk[0].start + chunk[chunk.length - 1].end) / 2,
    });

    i = end;
  }

  // Extend each cluster's visible window to the next cluster's start
  // (avoids blank frames between clusters).
  for (let j = 0; j < clusters.length; j++) {
    clusters[j].displayEnd =
      j + 1 < clusters.length
        ? clusters[j + 1].start - 0.05
        : clusters[j].end + 1.2;
  }

  return clusters;
}

// ─── Fallback Placement ───────────────────────────────────────────────────────

/**
 * Fallback placement zones clustered AROUND the speaker's typical position.
 *
 * These assume the speaker occupies the central region of the frame
 * (roughly x: 25–75%, y: 25–75%). Words are placed adjacent to the
 * speaker — beside the head, near shoulders, flanking the body — not
 * in distant empty areas or letterbox bars.
 *
 * Positions are percentages of composition dimensions (390 × 844).
 */
const FALLBACK_ZONES = [
  { xPct: 0.05, yPct: 0.32 },  // left of face
  { xPct: 0.68, yPct: 0.30 },  // right of face
  { xPct: 0.06, yPct: 0.47 },  // left mid (shoulder height)
  { xPct: 0.67, yPct: 0.45 },  // right mid (shoulder height)
  { xPct: 0.22, yPct: 0.20 },  // upper-left (above shoulder)
  { xPct: 0.55, yPct: 0.19 },  // upper-right (above shoulder)
  { xPct: 0.07, yPct: 0.60 },  // lower-left (below shoulder)
  { xPct: 0.65, yPct: 0.58 },  // lower-right (below shoulder)
  { xPct: 0.20, yPct: 0.68 },  // lower-centre-left
  { xPct: 0.52, yPct: 0.67 },  // lower-centre-right
];

/**
 * Assigns fallback (xPct, yPct) positions to a cluster's words when no
 * AI layout data is available. Uses the FALLBACK_ZONES reading path so
 * the spatial arrangement still feels intentional.
 */
export function assignFallbackPlacements(clusterWords) {
  return clusterWords.map((w, i) => {
    const zone = FALLBACK_ZONES[i % FALLBACK_ZONES.length];
    return {
      word: w._text,
      xPct: zone.xPct,
      yPct: zone.yPct,
      layer: "front",
    };
  });
}

// ─── Client-side Frame Extraction ────────────────────────────────────────────

/**
 * Seeks a (hidden) video element to `timeSec` and captures the frame
 * as a base64-encoded JPEG data URL.
 *
 * The captured image is down-scaled to maxWidth=640 to keep request
 * payloads manageable when sending to the OpenAI vision endpoint.
 *
 * Usage:
 *   const dataUrl = await extractFrameFromVideo(videoEl, 3.5);
 */
export async function extractFrameFromVideo(videoElement, timeSec, maxWidth = 640) {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      videoElement.removeEventListener("seeked", onSeeked);
      try {
        const canvas = document.createElement("canvas");
        const ratio = videoElement.videoHeight / Math.max(1, videoElement.videoWidth);
        canvas.width = maxWidth;
        canvas.height = Math.round(maxWidth * ratio);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      } catch (err) {
        reject(err);
      }
    };

    const onError = () => {
      videoElement.removeEventListener("error", onError);
      reject(new Error("Video seek error during frame extraction"));
    };

    videoElement.addEventListener("seeked", onSeeked, { once: true });
    videoElement.addEventListener("error", onError, { once: true });
    videoElement.currentTime = Math.max(0, timeSec);
  });
}

/**
 * Extracts one representative frame per cluster from the video's blob URL.
 * Creates and tears down its own hidden video element so the caller's
 * player element is not disturbed.
 *
 * Returns an array of base64 JPEG data URLs, one per cluster.
 * Individual failures resolve to null (fallback layout used).
 */
export async function extractClusterFrames(videoSrc, clusters) {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.preload = "auto";
  video.src = videoSrc;

  // Wait for metadata so duration and dimensions are known.
  await new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = () => reject(new Error("Could not load video for frame extraction"));
  });

  const frames = [];
  for (const cluster of clusters) {
    try {
      const dataUrl = await extractFrameFromVideo(video, cluster.midTime);
      frames.push(dataUrl);
    } catch {
      frames.push(null);
    }
  }

  // Clean up the temporary video element.
  video.src = "";
  video.load();

  return frames;
}
