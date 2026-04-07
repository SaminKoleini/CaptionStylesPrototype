import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption4 } from "./Caption4";

// Inner Remotion composition: video + motivational captions layered on top.
// Vertical format (9:16) — same dimensions as Section 3 for UI consistency.
const VideoWithCaptions4 = ({ videoSrc, transcription }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Video
      src={videoSrc}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Caption4 transcription={transcription} />
  </AbsoluteFill>
);

export const CaptionVideoPlayer4 = ({ videoSrc, transcription, durationInFrames }) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={VideoWithCaptions4}
      inputProps={{ videoSrc, transcription }}
      durationInFrames={durationInFrames}
      fps={30}
      compositionWidth={390}
      compositionHeight={844}
      style={{
        width:        "390px",
        height:       "844px",
        border:       "2px solid #333",
        borderRadius: "8px",
        overflow:     "hidden",
      }}
      controls
    />
  </div>
);
