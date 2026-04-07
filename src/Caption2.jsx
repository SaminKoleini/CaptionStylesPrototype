const CHUNK_SIZE = 18;

export const Caption2 = ({ captions, currentFrame, fps }) => {
  if (!captions || captions.length === 0) return null;

  const currentTime = currentFrame / fps;

  // Build chunks
  const chunks = [];
  for (let i = 0; i < captions.length; i += CHUNK_SIZE) {
    chunks.push(captions.slice(i, i + CHUNK_SIZE));
  }

  // Each chunk stays visible until the next chunk's first word starts,
  // so there are never any blank gaps between groups.
  const activeChunkIdx = chunks.findIndex((chunk, idx) => {
    const start = chunk[0].start;
    const end =
      idx + 1 < chunks.length
        ? chunks[idx + 1][0].start
        : chunk[chunk.length - 1].end + 1;
    return currentTime >= start && currentTime < end;
  });

  if (activeChunkIdx === -1) return null;

  const activeChunk = chunks[activeChunkIdx];

  // Find the highlighted word: exact match first, then fall back to last spoken word
  let highlightIdx = activeChunk.findIndex(
    (w) => currentTime >= w.start && currentTime <= w.end
  );

  if (highlightIdx === -1) {
    // In a pause between words — highlight the most recently spoken word
    for (let i = activeChunk.length - 1; i >= 0; i--) {
      if (currentTime >= activeChunk[i].start) {
        highlightIdx = i;
        break;
      }
    }
  }

  const outline = `
    -3px -3px 0 #000,
    3px -3px 0 #000,
    -3px 3px 0 #000,
    3px 3px 0 #000,
    -3px 0 0 #000,
    3px 0 0 #000,
    0 -3px 0 #000,
    0 3px 0 #000
  `;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "8%",
        left: 0,
        right: 0,
        width: "100%",
        textAlign: "center",
        padding: "0 40px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-block",
          maxWidth: "90%",
          fontSize: 40,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          lineHeight: 1.25,
          overflow: "hidden",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          textAlign: "center",
          wordBreak: "break-word",
        }}
      >
        {activeChunk.map((w, i) => (
          <span
            key={i}
            style={{
              color: i === highlightIdx ? "#22c55e" : "white",
              textShadow: outline,
            }}
          >
            {w.word}
            {i < activeChunk.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
