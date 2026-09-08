import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption14 } from "./Caption14";

const VideoWithCaptions14 = ({ videoSrc, transcription }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Video
      src={videoSrc}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Caption14 transcription={transcription} />
  </AbsoluteFill>
);

export const CaptionVideo14Player = ({ videoSrc, transcription, durationInFrames }) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={VideoWithCaptions14}
      inputProps={{ videoSrc, transcription }}
      durationInFrames={durationInFrames}
      fps={30}
      compositionWidth={390}
      compositionHeight={844}
      style={{
        width: "390px",
        height: "844px",
        border: "2px solid #333",
        borderRadius: "8px",
        overflow: "hidden",
      }}
      controls
    />
  </div>
);
