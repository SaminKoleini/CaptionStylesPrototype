/**
 * Scene 1 — "What is an AI Agent?"
 *
 * Visual: Tag → Headline → Subtitle → Divider → Brain icon at centre of
 * a three-node PERCEIVE / REASON / ACT cycle.  Arrows draw clockwise with
 * SVG stroke-dashoffset.
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, WHITE, GREY, ACCENT, ACCENT2, GREEN, FONT, ST, SL, SPRING_CFG } from "./tokens";

// ── Helpers ───────────────────────────────────────────────────────────────────
function sp(frame, fps, delay = 0) {
  return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: SPRING_CFG });
}
function ci(v, a, b, c, d) {
  // Accept both ci(v, a, b, c, d) and ci(v, [a,b], [c,d])
  if (Array.isArray(a)) return interpolate(v, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return interpolate(v, [a, b], [c, d], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// ── Diagram geometry ──────────────────────────────────────────────────────────
const CX = 540, DIAG_CY = 1230, DIAG_R = 340, NR = 80;

const NODES = [
  { x: CX,        y: DIAG_CY - DIAG_R, label: "PERCEIVE", color: ACCENT  },
  { x: CX + 295,  y: DIAG_CY + 170,    label: "REASON",   color: ACCENT2 },
  { x: CX - 295,  y: DIAG_CY + 170,    label: "ACT",      color: GREEN   },
];
// PERCEIVE: (540,  890)
// REASON:   (835, 1400)
// ACT:      (245, 1400)

// Quadratic bezier arrows — curving outward from the triangle
const ARROWS = [
  // PERCEIVE → REASON
  { d: "M 578 955 Q 758 1095 798 1325", color: ACCENT,  delay: 88 },
  // REASON → ACT
  { d: "M 752 1400 Q 540 1498 328 1400", color: ACCENT2, delay: 102 },
  // ACT → PERCEIVE
  { d: "M 282 1325 Q 322 1095 502 955",  color: GREEN,   delay: 116 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export const Scene1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagS    = sp(frame, fps, 0);
  const h1S     = sp(frame, fps, 8);
  const subO    = ci(frame, 24, 44, 0, 1);
  const divW    = ci(sp(frame, fps, 38), 0, 1, 0, 960);
  const brainS  = sp(frame, fps, 54);
  const nodeS   = NODES.map((_, i) => sp(frame, fps, 68 + i * 12));
  const arrowD  = ARROWS.map(a => ci(frame, [a.delay, a.delay + 34], [0, 1]));
  const labelO  = NODES.map((_, i) => ci(frame, [104 + i * 12, 126 + i * 12], [0, 1]));
  const captionO = ci(frame, [154, 170], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>

      {/* Subtle grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05 }}
        viewBox="0 0 1080 1920">
        <defs>
          <pattern id="s1g" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={ACCENT} strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#s1g)" />
      </svg>

      {/* Tag */}
      <div style={{
        position: "absolute", top: ST + 28, left: SL,
        fontSize: 28, fontWeight: 600, color: ACCENT, letterSpacing: "0.14em",
        textTransform: "uppercase", opacity: tagS,
      }}>AI EXPLAINER · EP 1</div>

      {/* Headline */}
      <div style={{
        position: "absolute", top: ST + 102, left: SL, right: SL,
        transform: `scale(${h1S})`, transformOrigin: "left top",
        opacity: ci(h1S, 0, 0.4, 0, 1),
      }}>
        <div style={{ fontSize: 76, fontWeight: 800, color: WHITE, lineHeight: 1.1 }}>What is an</div>
        <div style={{ fontSize: 76, fontWeight: 800, color: ACCENT, lineHeight: 1.1 }}>AI Agent?</div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: ST + 332, left: SL, right: SL,
        fontSize: 36, fontWeight: 400, color: GREY, lineHeight: 1.5, opacity: subO,
      }}>
        A program that perceives its environment, reasons about it,
        and takes actions autonomously to reach a goal.
      </div>

      {/* Divider */}
      <div style={{
        position: "absolute", top: ST + 508, left: SL,
        height: 2, width: divW, backgroundColor: ACCENT, borderRadius: 2,
      }} />

      {/* Diagram */}
      <svg viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* Brain at diagram centre */}
        <g transform={`translate(${CX} ${DIAG_CY}) scale(${brainS})`}>
          <circle cx={0} cy={0} r={72} fill={`${ACCENT}18`}
            stroke={ACCENT} strokeWidth={2} strokeDasharray="7 4" />
          <circle cx={0} cy={0} r={48} fill={`${ACCENT}28`} />
          {/* Left hemisphere */}
          <path d="M -16 -22 Q -42 -32 -36 0 Q -42 28 -16 24 L 0 24 L 0 -24 Z"
            fill={ACCENT} opacity={0.78} />
          {/* Right hemisphere */}
          <path d="M 16 -22 Q 42 -32 36 0 Q 42 28 16 24 L 0 24 L 0 -24 Z"
            fill={ACCENT} />
          {/* Centre line */}
          <line x1={0} y1={-24} x2={0} y2={24}
            stroke={WHITE} strokeWidth={1.5} opacity={0.32} />
          {/* "Eyes" */}
          <circle cx={-10} cy={-4} r={5} fill={WHITE} opacity={0.9} />
          <circle cx={10}  cy={-4} r={5} fill={WHITE} opacity={0.9} />
          <text x={0} y={52} textAnchor="middle" fontSize={22} fontWeight={600}
            fontFamily={FONT} fill={WHITE} opacity={0.6}>AI CORE</text>
        </g>

        {/* Arrows (draw on) */}
        {ARROWS.map(({ d, color }, i) => (
          <path key={i} d={d} stroke={color} strokeWidth={3.5}
            fill="none" strokeLinecap="round"
            strokeDasharray={550} strokeDashoffset={550 * (1 - arrowD[i])} />
        ))}

        {/* Nodes */}
        {NODES.map(({ x, y, label, color }, i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${nodeS[i]})`}>
            <circle cx={0} cy={0} r={NR + 12} fill={`${color}10`} />
            <circle cx={0} cy={0} r={NR} fill={`${color}22`}
              stroke={color} strokeWidth={2.5} />
            <text x={0} y={8} textAnchor="middle" dominantBaseline="middle"
              fontSize={30} fontWeight={800} fontFamily={FONT}
              fill={color} opacity={labelO[i]}>
              {label}
            </text>
          </g>
        ))}
      </svg>

      {/* Bottom caption */}
      <div style={{
        position: "absolute", top: 1672, left: SL, right: SL,
        fontSize: 30, fontWeight: 400, color: GREY, textAlign: "center",
        opacity: captionO,
      }}>
        This loop repeats continuously, adapting with every new input.
      </div>

    </AbsoluteFill>
  );
};
