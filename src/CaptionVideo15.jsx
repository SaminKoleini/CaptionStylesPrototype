/**
 * CaptionVideo15.jsx — Remotion Player wrapper for "15. Scrappy Paper Cutouts"
 *
 * Paper scraps fly in from above, land with a spring-bounce, and rest at
 * random tilts — one per word. CSS 3D perspective gives depth, irregular
 * clip-path polygons give the hand-cut-with-scissors look.
 */

import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption15 } from "./Caption15";

const PaperCutoutComposition = ({ videoSrc, transcription }) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    {videoSrc && (
      <Video
        src={videoSrc}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1}
      />
    )}
    <Caption15 transcription={transcription} />
  </AbsoluteFill>
);

export const CaptionVideo15Player = ({ videoSrc, transcription, durationInFrames }) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={PaperCutoutComposition}
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
