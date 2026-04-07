import { Player } from "@remotion/player";
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption2 } from "./Caption2";

const VideoWithCaptions2 = ({ videoSrc, captions }) => {
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
      <Caption2 captions={captions} currentFrame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export const CaptionVideoPlayer2 = ({ videoSrc, captions, durationInFrames }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <Player
        component={VideoWithCaptions2}
        inputProps={{ videoSrc, captions }}
        durationInFrames={durationInFrames}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        style={{
          width: "800px",
          height: "450px",
          border: "2px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
          maxWidth: "100%",
        }}
        controls
      />
    </div>
  );
};
