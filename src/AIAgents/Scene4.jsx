/**
 * Scene 4 — "Step 3: Act & Remember"
 *
 * Visual: Four pipeline steps in a horizontal row:
 *   [PLAN] → [CALL TOOL] → [READ RESULT] → [MEMORY]
 *
 * A curved feedback arrow returns from MEMORY to PLAN below the row.
 * A large "STEP N" counter animates from 0 → 4 as the steps light up.
 * Each active step pops in with spring; inactive ones appear dimly.
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, WHITE, GREY, ACCENT, GREEN, YELLOW, FONT, ST, SL, SPRING_CFG } from "./tokens";

function sp(frame, fps, delay = 0) {
  return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: SPRING_CFG });
}
function ci(v, a, b, c, d) {
  if (Array.isArray(a)) return interpolate(v, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return interpolate(v, [a, b], [c, d], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// ── Step layout ───────────────────────────────────────────────────────────────
const STEPS = [
  { label: "PLAN",        icon: "📋", color: ACCENT,   x: 60  },
  { label: "CALL TOOL",   icon: "🔧", color: "#06b6d4", x: 305 },
  { label: "READ RESULT", icon: "📊", color: YELLOW,   x: 550 },
  { label: "MEMORY",      icon: "#💾", color: GREEN,    x: 795 },
];
const STEP_W = 210, STEP_H = 180, STEP_ROW_Y = 860;
const STEP_CY = STEP_ROW_Y + STEP_H / 2;

// Arrow connectors between steps
const CONNECTORS = [
  { x1: 270, x2: 305 },
  { x1: 515, x2: 550 },
  { x1: 760, x2: 795 },
];
const CONN_Y = STEP_CY;

// Tool icon overrides (avoid # bug in the 4th step label)
const STEP_ICONS = ["📋", "🔧", "📊", "💾"];
const STEP_LABELS = ["PLAN", "CALL TOOL", "READ RESULT", "MEMORY"];
const STEP_COLORS = [ACCENT, "#06b6d4", YELLOW, GREEN];
const STEP_XS = [60, 305, 550, 795];

// ── Component ─────────────────────────────────────────────────────────────────
export const Scene4 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numO  = ci(sp(frame, fps, 0), 0, 0.5, 0, 1);
  const h1S   = sp(frame, fps, 8);
  const subO  = ci(frame, 22, 40, 0, 1);

  // Steps spring in staggered
  const stepS = STEP_XS.map((_, i) => sp(frame, fps, 50 + i * 14));

  // Connectors draw
  const connD = CONNECTORS.map((_, i) => ci(frame, [78 + i * 12, 100 + i * 12], [0, 1]));

  // Active step (lights up sequentially)
  const activeStep = Math.floor(ci(frame, 48, 148, 0, 4.99));

  // Feedback arc draws
  const arcD = ci(frame, [142, 170], [0, 1]);

  // Step counter
  const countNum = Math.round(ci(frame, 48, 148, 0, 4));

  // Sub-labels for each step (tool calls)
  const SUBLABELS = [
    "devise next action",
    "web_search(query)",
    "parse + validate",
    "store in memory",
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>

      {/* "03" step number */}
      <div style={{
        position: "absolute", top: ST + 18, left: SL,
        fontSize: 100, fontWeight: 800, color: `${ACCENT}40`, lineHeight: 1,
        opacity: numO,
      }}>03</div>

      {/* Headline */}
      <div style={{
        position: "absolute", top: ST + 118, left: SL, right: SL,
        transform: `scale(${h1S})`, transformOrigin: "left top",
        opacity: ci(h1S, 0, 0.4, 0, 1),
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: WHITE }}>Act &amp; Remember</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: ACCENT, marginTop: 4 }}>STEP 3</div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: ST + 310, left: SL, right: SL,
        fontSize: 36, fontWeight: 400, color: GREY, lineHeight: 1.5, opacity: subO,
      }}>
        Agents run real tools — web search, code execution, file I/O —
        then store results in <span style={{ color: GREEN, fontWeight: 600 }}>memory</span> to inform the next step.
      </div>

      {/* SVG: pipeline + connector arrows + feedback arc */}
      <svg viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* Connector arrows between boxes */}
        {CONNECTORS.map(({ x1, x2 }, i) => (
          <g key={i}>
            <line x1={x1} y1={CONN_Y} x2={x1 + (x2 - x1) * connD[i]} y2={CONN_Y}
              stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
            {connD[i] > 0.9 && (
              <polygon
                points={`${x2},${CONN_Y} ${x2 - 14},${CONN_Y - 8} ${x2 - 14},${CONN_Y + 8}`}
                fill={WHITE} opacity={0.5}
              />
            )}
          </g>
        ))}

        {/* Step boxes */}
        {STEP_XS.map((x, i) => {
          const isActive = i < activeStep;
          const color = STEP_COLORS[i];
          const cy_box = STEP_ROW_Y + STEP_H / 2;
          return (
            <g key={i} transform={`translate(${x + STEP_W / 2} ${cy_box}) scale(${stepS[i]}) translate(${-(x + STEP_W / 2)} ${-cy_box})`}>
              {/* Active glow */}
              {isActive && (
                <rect x={x - 4} y={STEP_ROW_Y - 4} width={STEP_W + 8} height={STEP_H + 8}
                  rx={22} fill="none" stroke={color} strokeWidth={10} opacity={0.2} />
              )}
              {/* Box */}
              <rect x={x} y={STEP_ROW_Y} width={STEP_W} height={STEP_H}
                rx={18}
                fill={isActive ? `${color}22` : `${color}0a`}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
                opacity={isActive ? 1 : 0.5}
              />
              {/* Icon */}
              <text x={x + STEP_W / 2} y={STEP_ROW_Y + 68}
                textAnchor="middle" fontSize={42} fontFamily={FONT}>
                {STEP_ICONS[i]}
              </text>
              {/* Label */}
              <text x={x + STEP_W / 2} y={STEP_ROW_Y + 118}
                textAnchor="middle" fontSize={28} fontWeight={700}
                fontFamily={FONT} fill={isActive ? color : `${color}88`}>
                {STEP_LABELS[i]}
              </text>
            </g>
          );
        })}

        {/* Feedback arc: MEMORY → PLAN */}
        <path
          d={`M ${STEP_XS[3] + STEP_W} ${STEP_ROW_Y + STEP_H - 10}
             Q 540 ${STEP_ROW_Y + STEP_H + 120}
             ${STEP_XS[0]} ${STEP_ROW_Y + STEP_H - 10}`}
          fill="none" stroke={`${GREEN}80`} strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={500}
          strokeDashoffset={500 * (1 - arcD)}
        />
      </svg>

      {/* Step counter */}
      <div style={{
        position: "absolute", top: 1180, left: SL, right: SL,
        display: "flex", alignItems: "baseline", gap: 18,
      }}>
        <span style={{
          fontSize: 160, fontWeight: 800, color: GREEN,
          fontVariantNumeric: "tabular-nums", lineHeight: 1,
          textShadow: `0 0 40px ${GREEN}55`,
        }}>{countNum}</span>
        <div>
          <div style={{ fontSize: 40, fontWeight: 700, color: WHITE }}>iterations</div>
          <div style={{ fontSize: 32, fontWeight: 400, color: GREY }}>
            per agent loop so far
          </div>
        </div>
      </div>

      {/* Sub-labels grid */}
      <div style={{
        position: "absolute", top: 1390, left: SL, right: SL,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "12px 24px",
        opacity: ci(frame, [90, 112], [0, 1]),
      }}>
        {STEP_LABELS.map((label, i) => (
          <div key={i} style={{
            fontSize: 28, fontWeight: 500, color: STEP_COLORS[i],
            opacity: i < activeStep ? 1 : 0.3,
            transition: "opacity 0.2s",
          }}>
            {STEP_ICONS[i]}  {SUBLABELS[i]}
          </div>
        ))}
      </div>

    </AbsoluteFill>
  );
};
