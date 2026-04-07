import { Player } from "@remotion/player";
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption3 } from "./Caption3";

const VideoWithCaptions3 = ({ videoSrc, captions, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Video
        src={videoSrc}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        volume={1}
        muted={false}
      />
      <Caption3
        captions={captions}
        title={title}
        currentFrame={frame}
        fps={fps}
      />
    </AbsoluteFill>
  );
};

export const CaptionVideoPlayer3 = ({ videoSrc, captions, title, durationInFrames }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <Player
        component={VideoWithCaptions3}
        inputProps={{ videoSrc, captions, title }}
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
