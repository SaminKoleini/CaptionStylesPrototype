/**
 * CaptionVideo6.jsx — Remotion Player wrapper for "6. Progressive Quote Stack"
 */

import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption6 } from "./Caption6";

const ProgressiveQuoteComposition = ({ videoSrc, transcription }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Video
      src={videoSrc}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Caption6 transcription={transcription} />
  </AbsoluteFill>
);

export const CaptionVideoPlayer6 = ({ videoSrc, transcription, durationInFrames }) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={ProgressiveQuoteComposition}
      inputProps={{ videoSrc, transcription }}
      durationInFrames={Math.max(1, durationInFrames)}
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
