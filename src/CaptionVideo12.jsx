import { Player } from "@remotion/player";
import { AbsoluteFill, Video } from "remotion";
import { Caption12 } from "./Caption12";

const VideoWithCaptions12 = ({ videoSrc, transcription, speakerFaceBox, speakerSubjectBox }) => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Video
      src={videoSrc}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      volume={1}
    />
    <Caption12
      transcription={transcription}
      videoSrc={videoSrc}
      speakerFaceBox={speakerFaceBox}
      speakerSubjectBox={speakerSubjectBox}
    />
  </AbsoluteFill>
);

export const CaptionVideo12Player = ({ videoSrc, transcription, durationInFrames, speakerFaceBox, speakerSubjectBox }) => (
  <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
    <Player
      component={VideoWithCaptions12}
      inputProps={{ videoSrc, transcription, speakerFaceBox, speakerSubjectBox }}
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
