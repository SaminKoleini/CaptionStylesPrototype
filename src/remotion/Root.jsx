/**
 * Remotion Root — registers all 8 caption style compositions for Studio.
 *
 * Each composition uses the same 390×844 mobile canvas at 30 fps with a
 * sample transcript so you can preview and edit styles without uploading
 * a real video.
 *
 * To add a new style:
 *   1. Create CaptionN.jsx in src/ following the patterns below.
 *   2. Add a <Composition> entry here with a unique id.
 *   3. Run `npm run studio` to see it live.
 */

import { AbsoluteFill, Composition } from "remotion";
import { AIAgentsVideo } from "../AIAgents/AIAgentsVideo";
import { Caption4 } from "../Caption4";
import { Caption9 } from "../Caption9";
import { Caption10 } from "../Caption10";
import { Caption11 } from "../Caption11";
import { Caption12 } from "../Caption12";
import { Caption13 } from "../Caption13";
import { Caption14 } from "../Caption14";
import { Caption5 } from "../Caption5";
import { Caption6 } from "../Caption6";
import { Caption7 } from "../Caption7";
import { Caption8 } from "../Caption8";
import { Caption1Composition, Caption2Composition, Caption3Composition } from "./CaptionWrappers";
import { SAMPLE_TRANSCRIPTION, SAMPLE_DURATION_FRAMES, SAMPLE_TITLE } from "./sampleData";

// Caption4–8 use useCurrentFrame() internally; just give them a background.
const Caption4BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption4 {...props} />
  </AbsoluteFill>
);

const Caption5BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption5 {...props} />
  </AbsoluteFill>
);

const Caption6BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption6 {...props} />
  </AbsoluteFill>
);

const Caption7BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption7 {...props} />
  </AbsoluteFill>
);

const Caption8BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption8 {...props} />
  </AbsoluteFill>
);

const Caption9BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption9 {...props} />
  </AbsoluteFill>
);

const Caption10BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption10 transcription={props.transcription} />
  </AbsoluteFill>
);

const Caption11BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption11 transcription={props.transcription} />
  </AbsoluteFill>
);

const Caption12BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption12 transcription={props.transcription} />
  </AbsoluteFill>
);

const Caption13BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption13 transcription={props.transcription} />
  </AbsoluteFill>
);

const Caption14BG = (props) => (
  <AbsoluteFill style={{ backgroundColor: "#1a1a1a" }}>
    <Caption14 transcription={props.transcription} />
  </AbsoluteFill>
);

const COMP = {
  width: 390,
  height: 844,
  fps: 30,
  durationInFrames: SAMPLE_DURATION_FRAMES,
};

export const RemotionRoot = () => (
  <>
    {/* ── AI Agents Explainer (standalone 1080×1920 educational video) ──── */}
    <Composition
      id="AIAgents-Explainer"
      component={AIAgentsVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={912}
      defaultProps={{}}
    />
    <Composition
      id="Style1-Basic"
      component={Caption1Composition}
      {...COMP}
      defaultProps={{ captions: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style2-WordHighlight"
      component={Caption2Composition}
      {...COMP}
      defaultProps={{ captions: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style3-EditorialPodcast"
      component={Caption3Composition}
      {...COMP}
      defaultProps={{ captions: SAMPLE_TRANSCRIPTION, title: SAMPLE_TITLE }}
    />
    <Composition
      id="Style4-FloatingBlocks"
      component={Caption4BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style5-SpatialWhisper"
      component={Caption5BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION, layoutData: null }}
    />
    <Composition
      id="Style6-QuoteStack"
      component={Caption6BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style7-GlowingImpact"
      component={Caption7BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style8-StaircaseImpact"
      component={Caption8BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style9-MigsVisuals"
      component={Caption9BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style10-DepthReveal"
      component={Caption10BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style11-NeonBloom"
      component={Caption11BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition
      id="Style12-RetroSignal"
      component={Caption12BG}
      {...COMP}
      defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }}
    />
    <Composition id="Style13-CozyHandwritten" component={Caption13BG} {...COMP} defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }} />
    <Composition id="Style14-EditorialSerif" component={Caption14BG} {...COMP} defaultProps={{ transcription: SAMPLE_TRANSCRIPTION }} />
  </>
);
