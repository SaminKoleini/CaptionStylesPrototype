/**
 * CaptionVideo7.jsx — Remotion Player wrapper for "7. Glowing Impact Captions"
 */

import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption7 } from "./Caption7";

const DynamicPunchComposition = ({ videoSrc, transcription }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Video
      src={videoSrc}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Caption7 transcription={transcription} />
  </AbsoluteFill>
);

export const CaptionVideoPlayer7 = ({ videoSrc, transcription, durationInFrames }) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={DynamicPunchComposition}
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
