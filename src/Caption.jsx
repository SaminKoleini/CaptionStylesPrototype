export const Caption = ({ captions, currentFrame, fps }) => {
  if (!captions || captions.length === 0) return null;

  const currentTime = currentFrame / fps;

  const chunks = [];
  for (let i = 0; i < captions.length; i += 5) {
    chunks.push(captions.slice(i, i + 5));
  }

  const activeChunk = chunks.find((chunk) => {
    const start = chunk[0].start;
    const end = chunk[chunk.length - 1].end;
    return currentTime >= start && currentTime <= end;
  });

  if (!activeChunk) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        width: "100%",
        textAlign: "center",
        fontSize: 38,
        fontFamily: "Arial Black, sans-serif",
        color: "white",
        WebkitTextStroke: "3px black",
        paintOrder: "stroke fill",
        padding: "0 20px",
        lineHeight: 1.2,
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {activeChunk.map((w) => w.word).join(" ")}
    </div>
  );
};
