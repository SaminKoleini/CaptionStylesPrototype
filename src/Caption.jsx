export const Caption = ({ captions, currentFrame, fps }) => {
  const safeCaptions = captions ?? [];
  const currentTime = currentFrame / fps;

  const chunks = [];
  for (let i = 0; i < safeCaptions.length; i += 9) {
    chunks.push(safeCaptions.slice(i, i + 9));
  }

  // Each chunk stays visible until the next chunk's first word starts,
  // so there are never any blank gaps between groups.
  const activeChunk = chunks.find((chunk, idx) => {
    const start = chunk[0].start;
    const end =
      idx + 1 < chunks.length
        ? chunks[idx + 1][0].start
        : chunk[chunk.length - 1].end + 1;
    return currentTime >= start && currentTime < end;
  });

  if (!activeChunk) return null;

  const chunkText = activeChunk.map((w) => w.word).join(" ").toLowerCase();
  const displayText = chunkText.charAt(0).toUpperCase() + chunkText.slice(1);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "15%",
        left: 0,
        right: 0,
        width: "100%",
        textAlign: "center",
        padding: "0 20px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 600,
          color: "white",
          lineHeight: 1.35,
          maxWidth: "72%",
          margin: "0 auto",
          whiteSpace: "normal",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          textShadow: `
            -1px -1px 0 #000,
            1px -1px 0 #000,
            -1px 1px 0 #000,
            1px 1px 0 #000
          `,
        }}
      >
        {displayText}
      </div>
    </div>
  );
};
