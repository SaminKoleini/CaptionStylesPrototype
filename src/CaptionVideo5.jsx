/**
 * CaptionVideo5.jsx — Remotion Player wrapper for "5. Spatial Whisper"
 *
 * Passes videoAspectRatio through to the Caption5 component so it can
 * compute the exact video window (accounting for letterboxing) and anchor
 * the left/right word columns correctly relative to the speaker.
 */

import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption5 } from "./Caption5";

const SpatialWhisperComposition = ({
  videoSrc,
  transcription,
  layoutData,
  videoAspectRatio,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Video
      src={videoSrc}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Caption5
      transcription={transcription}
      layoutData={layoutData}
      videoAspectRatio={videoAspectRatio}
    />
  </AbsoluteFill>
);

export const CaptionVideoPlayer5 = ({
  videoSrc,
  transcription,
  layoutData,
  videoAspectRatio,
  durationInFrames,
}) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={SpatialWhisperComposition}
      inputProps={{ videoSrc, transcription, layoutData, videoAspectRatio }}
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
