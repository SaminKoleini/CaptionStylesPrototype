/**
 * Scene 3 — "Step 2: Reason"
 *
 * Visual: A three-box flowchart:
 *   [Context Window]  ──▼──  [LLM Core]  ──▼──  [Action]
 *
 * The LLM box has a pulsing indigo glow and small "neuron" nodes inside.
 * Arrows between boxes draw on with SVG stroke-dashoffset.
 * Below the chart a code-style "action" label fades in.
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, WHITE, GREY, ACCENT, ACCENT2, GREEN, FONT, ST, SL, SPRING_CFG } from "./tokens";

function sp(frame, fps, delay = 0) {
  return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: SPRING_CFG });
}
function ci(v, a, b, c, d) {
  if (Array.isArray(a)) return interpolate(v, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return interpolate(v, [a, b], [c, d], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// ── Box layout ────────────────────────────────────────────────────────────────
const BX = 80, BW = 920, CX_SVG = 540;

const BOXES = [
  { label: "CONTEXT WINDOW", y: 718, h: 130, color: ACCENT2, delay: 48 },
  { label: "LLM CORE",       y: 938, h: 180, color: ACCENT,  delay: 72  },
  { label: "ACTION",         y: 1218, h: 130, color: GREEN,  delay: 96  },
];

// Neuron dots inside LLM box (local to box interior)
const NEURONS = [
  { x: 160, y: 1020 }, { x: 310, y: 990 }, { x: 460, y: 1040 },
  { x: 610, y: 985  }, { x: 760, y: 1020 }, { x: 910, y: 1000 },
];
const NEURON_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [1, 3], [2, 4], [3, 5],
];

// Arrow paths (vertical, 90px tall)
const ARROWS_Y = [
  { y1: BOXES[0].y + BOXES[0].h, y2: BOXES[1].y, delay: 86 },
  { y1: BOXES[1].y + BOXES[1].h, y2: BOXES[2].y, delay: 110 },
];

// ── Component ─────────────────────────────────────────────────────────────────
export const Scene3 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numO  = ci(sp(frame, fps, 0), 0, 0.5, 0, 1);
  const h1S   = sp(frame, fps, 8);
  const subO  = ci(frame, 22, 40, 0, 1);

  // Box scale-in
  const boxS = BOXES.map(b => sp(frame, fps, b.delay));

  // Arrow draw
  const arrowD = ARROWS_Y.map(a => ci(frame, [a.delay, a.delay + 22], [0, 1]));

  // LLM glow pulse
  const glowR = 12 + 5 * Math.sin(frame * 0.13);

  // Neuron edge pulse (individual timings)
  const neuronEdgeO = NEURON_EDGES.map((_, i) =>
    0.35 + 0.35 * Math.sin(frame * 0.09 + i * 0.7)
  );

  // Code output
  const codeO = ci(frame, [130, 150], [0, 1]);
  const codeY = ci(sp(frame, fps, 130), 0, 1, 20, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>

      {/* "02" step number */}
      <div style={{
        position: "absolute", top: ST + 18, left: SL,
        fontSize: 100, fontWeight: 800, color: `${ACCENT}40`, lineHeight: 1,
        opacity: numO,
      }}>02</div>

      {/* Headline */}
      <div style={{
        position: "absolute", top: ST + 118, left: SL, right: SL,
        transform: `scale(${h1S})`, transformOrigin: "left top",
        opacity: ci(h1S, 0, 0.4, 0, 1),
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: WHITE }}>Reason</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: ACCENT, marginTop: 4 }}>STEP 2</div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: ST + 310, left: SL, right: SL,
        fontSize: 36, fontWeight: 400, color: GREY, lineHeight: 1.5, opacity: subO,
      }}>
        The <span style={{ color: ACCENT, fontWeight: 600 }}>LLM</span> reads the full context
        and decides what to do next — call a tool, ask a question, or return an answer.
      </div>

      {/* Flowchart */}
      <svg viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* Boxes */}
        {BOXES.map(({ label, y, h, color }, i) => {
          const cy_box = y + h / 2;
          const isLLM  = i === 1;
          return (
            <g key={i} transform={`translate(${CX_SVG} ${cy_box}) scale(${boxS[i]}) translate(${-CX_SVG} ${-cy_box})`}>
              {/* Glow for LLM box */}
              {isLLM && (
                <rect x={BX - 6} y={y - 6} width={BW + 12} height={h + 12}
                  rx={24} fill="none"
                  stroke={ACCENT}
                  strokeWidth={glowR}
                  opacity={0.18} />
              )}
              {/* Main rect */}
              <rect x={BX} y={y} width={BW} height={h}
                rx={18} fill={`${color}${isLLM ? "22" : "0e"}`}
                stroke={color} strokeWidth={isLLM ? 2.5 : 2} />
              {/* Label */}
              <text x={CX_SVG} y={y + h / 2 + 10} textAnchor="middle"
                dominantBaseline="middle" fontSize={isLLM ? 40 : 34}
                fontWeight={800} fontFamily={FONT} fill={color}>
                {label}
              </text>
            </g>
          );
        })}

        {/* Neuron nodes inside LLM box */}
        {NEURONS.map(({ x, y }, i) => (
          <circle key={i} cx={x} cy={y} r={7}
            fill={ACCENT}
            opacity={0.3 + 0.4 * Math.sin(frame * 0.1 + i * 0.9)} />
        ))}

        {/* Neuron edges */}
        {NEURON_EDGES.map(([a, b], i) => (
          <line key={i}
            x1={NEURONS[a].x} y1={NEURONS[a].y}
            x2={NEURONS[b].x} y2={NEURONS[b].y}
            stroke={ACCENT} strokeWidth={1.2} opacity={neuronEdgeO[i]} />
        ))}

        {/* Arrows */}
        {ARROWS_Y.map(({ y1, y2 }, i) => (
          <g key={i}>
            <line x1={CX_SVG} y1={y1} x2={CX_SVG} y2={y1 + (y2 - y1) * arrowD[i]}
              stroke={i === 0 ? ACCENT : GREEN} strokeWidth={3}
              strokeLinecap="round" />
            {arrowD[i] > 0.9 && (
              <polygon
                points={`${CX_SVG},${y2} ${CX_SVG - 10},${y2 - 18} ${CX_SVG + 10},${y2 - 18}`}
                fill={i === 0 ? ACCENT : GREEN} />
            )}
          </g>
        ))}

        {/* Token-by-token output hint */}
        <g opacity={codeO} transform={`translate(0 ${codeY})`}>
          <rect x={BX} y={BOXES[2].y + BOXES[2].h + 28}
            width={BW} height={88} rx={12}
            fill="rgba(34,197,94,0.07)" stroke={`${GREEN}55`} strokeWidth={1.5} />
          <text x={BX + 24} y={BOXES[2].y + BOXES[2].h + 74}
            fontSize={30} fontFamily="'Courier New', monospace" fill={GREEN} fontWeight={600}>
            → call_tool("search", "How do LLMs work?")
          </text>
        </g>
      </svg>

    </AbsoluteFill>
  );
};
