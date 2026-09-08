/**
 * AIAgentsVideo.jsx — Main composition
 *
 * 5 scenes with 12-frame cross-fades via overlapping Sequence windows.
 * Total: 5 × 192 − 4 × 12 = 912 frames ≈ 30.4 s at 30 fps.
 *
 * Font: Inter loaded via @remotion/google-fonts.
 */

import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";

// Load Inter — integrates automatically with Remotion's delayRender pipeline
loadFont("normal", {
  weights: ["400", "600", "800"],
  subsets: ["latin"],
});

// ── Timeline ──────────────────────────────────────────────────────────────────
const SCENE_DUR = 192;   // frames per scene
const TRANS     = 12;    // cross-fade overlap
const GAP       = SCENE_DUR - TRANS;  // 180
// Sequence starts: 0, 180, 360, 540, 720
// Composition end: 720 + 192 = 912 frames (set in Root.jsx)

// ── Fade wrapper (reads Sequence-local frame) ─────────────────────────────────
const FadeWrapper = ({ dur, fadeIn, fadeOut, children }) => {
  const frame = useCurrentFrame();
  let opacity = 1;
  if (fadeIn)  opacity *= interpolate(frame, [0, TRANS], [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (fadeOut) opacity *= interpolate(frame, [dur - TRANS, dur], [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// ── Composition ───────────────────────────────────────────────────────────────
export const AIAgentsVideo = () => (
  <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
    <Sequence from={0} durationInFrames={SCENE_DUR}>
      <FadeWrapper dur={SCENE_DUR} fadeIn={false} fadeOut>
        <Scene1 />
      </FadeWrapper>
    </Sequence>

    <Sequence from={180} durationInFrames={SCENE_DUR}>
      <FadeWrapper dur={SCENE_DUR} fadeIn fadeOut>
        <Scene2 />
      </FadeWrapper>
    </Sequence>

    <Sequence from={360} durationInFrames={SCENE_DUR}>
      <FadeWrapper dur={SCENE_DUR} fadeIn fadeOut>
        <Scene3 />
      </FadeWrapper>
    </Sequence>

    <Sequence from={540} durationInFrames={SCENE_DUR}>
      <FadeWrapper dur={SCENE_DUR} fadeIn fadeOut>
        <Scene4 />
      </FadeWrapper>
    </Sequence>

    <Sequence from={720} durationInFrames={SCENE_DUR}>
      <FadeWrapper dur={SCENE_DUR} fadeIn fadeOut={false}>
        <Scene5 />
      </FadeWrapper>
    </Sequence>
  </AbsoluteFill>
);
