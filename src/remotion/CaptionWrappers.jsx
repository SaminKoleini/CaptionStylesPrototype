/**
 * Thin Remotion composition wrappers for Caption1, Caption2, and Caption3.
 *
 * These three components receive `currentFrame` and `fps` as props instead
 * of reading them via hooks, so they need a small host component that calls
 * useCurrentFrame() / useVideoConfig() and passes the values down.
 *
 * Caption4–Caption8 call useCurrentFrame() internally and can be used as
 * Remotion compositions directly (with an AbsoluteFill background wrapper).
 */

import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption } from "../Caption";
import { Caption2 } from "../Caption2";
import { Caption3 } from "../Caption3";

const BG = { backgroundColor: "#1a1a1a" };

export const Caption1Composition = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={BG}>
      <Caption captions={captions} currentFrame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export const Caption2Composition = ({ captions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={BG}>
      <Caption2 captions={captions} currentFrame={frame} fps={fps} />
    </AbsoluteFill>
  );
};

export const Caption3Composition = ({ captions, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={BG}>
      <Caption3 captions={captions} title={title} currentFrame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
