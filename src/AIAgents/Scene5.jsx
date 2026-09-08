/**
 * Scene 5 — "Step 4: Scale with Teams"
 *
 * Visual: Five agent nodes in a pentagon layout — PLANNER at top,
 * RESEARCHER, CODER, CRITIC, COORDINATOR around it.  Edges draw in
 * sequentially.  Background: 12 semi-transparent circles drift upward
 * (particle effect).  A large "10×" counter counts up from 1.
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, WHITE, GREY, ACCENT, ACCENT2, GREEN, YELLOW, PURPLE, FONT, ST, SL, SPRING_CFG } from "./tokens";

function sp(frame, fps, delay = 0) {
  return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: SPRING_CFG });
}
function ci(v, a, b, c, d) {
  if (Array.isArray(a)) return interpolate(v, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return interpolate(v, [a, b], [c, d], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// ── Agent nodes (pentagon, centre = 540,1020, R=300) ─────────────────────────
const AGENTS = [
  { label: "PLANNER",     color: ACCENT,  x: 540, y: 720  },
  { label: "RESEARCHER",  color: ACCENT2, x: 825, y: 937  },
  { label: "CODER",       color: GREEN,   x: 716, y: 1273 },
  { label: "CRITIC",      color: YELLOW,  x: 364, y: 1273 },
  { label: "COORDINATOR", color: PURPLE,  x: 255, y: 937  },
];
const NODE_R = 74;

// Edges to draw (source → target index)
const EDGES = [
  [0, 1], [0, 4], [0, 2], [0, 3],  // PLANNER speaks to all
  [1, 2], [4, 3],                   // peer links
];

// ── Particles ─────────────────────────────────────────────────────────────────
const PARTICLES = [
  { x: 120,  speed: 1.1, r: 10, op: 0.4, del: 0   },
  { x: 230,  speed: 0.8, r: 7,  op: 0.3, del: 22  },
  { x: 355,  speed: 1.0, r: 13, op: 0.5, del: 8   },
  { x: 470,  speed: 1.4, r: 6,  op: 0.35, del: 38 },
  { x: 540,  speed: 0.9, r: 9,  op: 0.4, del: 16  },
  { x: 650,  speed: 1.2, r: 11, op: 0.45, del: 44 },
  { x: 745,  speed: 0.7, r: 8,  op: 0.3, del: 5   },
  { x: 840,  speed: 1.3, r: 13, op: 0.5, del: 30  },
  { x: 930,  speed: 1.0, r: 7,  op: 0.35, del: 52 },
  { x: 185,  speed: 1.2, r: 9,  op: 0.4, del: 62  },
  { x: 505,  speed: 0.85, r: 14, op: 0.3, del: 78 },
  { x: 880,  speed: 1.1, r: 8,  op: 0.45, del: 90 },
];
const CYCLE = 210; // frames per full particle cycle

// ── Component ─────────────────────────────────────────────────────────────────
export const Scene5 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numO  = ci(sp(frame, fps, 0), 0, 0.5, 0, 1);
  const h1S   = sp(frame, fps, 8);
  const subO  = ci(frame, 22, 40, 0, 1);

  // Node spring in
  const nodeS = AGENTS.map((_, i) => sp(frame, fps, 50 + i * 12));

  // Edge draw on (staggered by 8f)
  const edgeD = EDGES.map((_, i) => ci(frame, [88 + i * 8, 118 + i * 8], [0, 1]));

  // "10×" count-up
  const tenX = Math.max(1, Math.round(ci(frame, 60, 138, 1, 10)));

  // Particles
  const particles = PARTICLES.map(({ x, speed, r, op, del }) => {
    const rawProg = ((frame + del * 2 + CYCLE) % CYCLE) / CYCLE;
    const y = 1870 - rawProg * 1750;
    const opacity = op * Math.sin(rawProg * Math.PI);
    return { x, y, r, opacity };
  });

  // Node label sizing — COORDINATOR is long
  const labelSize = (label) => label.length > 8 ? 22 : 26;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>

      {/* "04" step number */}
      <div style={{
        position: "absolute", top: ST + 18, left: SL,
        fontSize: 100, fontWeight: 800, color: `${ACCENT}40`, lineHeight: 1,
        opacity: numO,
      }}>04</div>

      {/* Headline */}
      <div style={{
        position: "absolute", top: ST + 118, left: SL, right: SL,
        transform: `scale(${h1S})`, transformOrigin: "left top",
        opacity: ci(h1S, 0, 0.4, 0, 1),
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: WHITE }}>Scale with Teams</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: ACCENT, marginTop: 4 }}>STEP 4</div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: ST + 310, left: SL, right: SL,
        fontSize: 36, fontWeight: 400, color: GREY, lineHeight: 1.5, opacity: subO,
      }}>
        Hard tasks split across{" "}
        <span style={{ color: ACCENT, fontWeight: 600 }}>specialist agents</span> — a Planner,
        Researcher, Coder, Critic — collaborating like a company.
      </div>

      {/* SVG: particles + network */}
      <svg viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* Drifting particles (behind everything) */}
        {particles.map(({ x, y, r, opacity }, i) => (
          <circle key={i} cx={x} cy={y} r={r}
            fill={ACCENT} opacity={opacity} />
        ))}

        {/* Edges */}
        {EDGES.map(([ai, bi], i) => {
          const a = AGENTS[ai], b = AGENTS[bi];
          const dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx*dx+dy*dy);
          const ux = dx/len, uy = dy/len;
          const x1 = a.x + ux*NODE_R, y1 = a.y + uy*NODE_R;
          const x2 = b.x - ux*NODE_R, y2 = b.y - uy*NODE_R;
          return (
            <line key={i}
              x1={x1} y1={y1}
              x2={x1 + (x2-x1)*edgeD[i]} y2={y1 + (y2-y1)*edgeD[i]}
              stroke={AGENTS[ai].color} strokeWidth={2}
              strokeLinecap="round" opacity={0.55} />
          );
        })}

        {/* Agent nodes */}
        {AGENTS.map(({ x, y, label, color }, i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${nodeS[i]})`}>
            {/* Outer glow */}
            <circle cx={0} cy={0} r={NODE_R + 14} fill={`${color}10`} />
            {/* Node */}
            <circle cx={0} cy={0} r={NODE_R} fill={`${color}22`}
              stroke={color} strokeWidth={2.5} />
            {/* Label */}
            <text x={0} y={8} textAnchor="middle" dominantBaseline="middle"
              fontSize={labelSize(label)} fontWeight={800}
              fontFamily={FONT} fill={color}>
              {label}
            </text>
          </g>
        ))}
      </svg>

      {/* "10×" counter */}
      <div style={{
        position: "absolute", top: 1480, left: SL, right: SL,
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: ci(frame, [58, 76], [0, 1]),
      }}>
        <div style={{
          fontSize: 180, fontWeight: 800, color: GREEN,
          fontVariantNumeric: "tabular-nums", lineHeight: 1,
          textShadow: `0 0 60px ${GREEN}55`,
        }}>
          {tenX}×
        </div>
        <div style={{
          fontSize: 36, fontWeight: 600, color: WHITE, marginTop: 8,
        }}>
          faster than a solo agent
        </div>
        <div style={{
          fontSize: 28, fontWeight: 400, color: GREY, marginTop: 6,
        }}>
          parallelism + specialisation
        </div>
      </div>

    </AbsoluteFill>
  );
};
