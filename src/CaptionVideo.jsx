import { Player } from "@remotion/player";
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "./Caption";

const VideoWithCaptions = ({ videoSrc, captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video src={videoSrc} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      <Caption captions={captions} currentFrame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export const CaptionVideoPlayer = ({ videoSrc, captions, durationInFrames }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <Player
        component={VideoWithCaptions}
        inputProps={{ videoSrc, captions }}
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
};
