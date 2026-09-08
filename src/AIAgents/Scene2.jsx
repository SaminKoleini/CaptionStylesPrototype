/**
 * Scene 2 — "Step 1: Perceive"
 *
 * Visual: Four input-source chips (Text / Image / API / Tools) slide in
 * from the left with stagger.  SVG lines draw from each chip into a
 * "Context Window" box on the right.  A progress fill bar inside the box
 * grows as each input arrives.
 */

import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, WHITE, GREY, ACCENT, ACCENT2, GREEN, YELLOW, FONT, ST, SL, SPRING_CFG } from "./tokens";

function sp(frame, fps, delay = 0) {
  return spring({ frame: Math.max(0, frame - delay), fps, from: 0, to: 1, config: SPRING_CFG });
}
function ci(v, a, b, c, d) {
  if (Array.isArray(a)) return interpolate(v, a, b, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return interpolate(v, [a, b], [c, d], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

// ── Input sources ─────────────────────────────────────────────────────────────
const SOURCES = [
  { icon: "💬", label: "TEXT",   color: ACCENT,  cy: 778  },
  { icon: "🖼",  label: "IMAGE",  color: ACCENT2, cy: 918  },
  { icon: "📡", label: "API",    color: GREEN,   cy: 1058 },
  { icon: "⚙️", label: "TOOLS",  color: YELLOW,  cy: 1198 },
];
const CHIP_W = 250, CHIP_H = 108;
const BOX_X = 380, BOX_Y = 718, BOX_W = 618, BOX_H = 542;

// ── Component ─────────────────────────────────────────────────────────────────
export const Scene2 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numO  = ci(sp(frame, fps, 0), 0, 0.5, 0, 1);
  const h1S   = sp(frame, fps, 8);
  const subO  = ci(frame, 24, 42, 0, 1);
  const boxS  = sp(frame, fps, 48);

  // Chips slide in from x = -300
  const chipTX = SOURCES.map((_, i) => {
    const s = sp(frame, fps, 56 + i * 14);
    return ci(s, 0, 1, -340, 0);
  });

  // Lines draw from chip right edge (x=280) to box left edge (x=380)
  const lineD = SOURCES.map((_, i) => ci(frame, [90 + i * 12, 120 + i * 12], [0, 1]));

  // Progress fill inside box
  const barW = ci(frame, [90, 160], [0, BOX_W - 40]);

  // Context labels inside box
  const ctxLabelO = ci(frame, [110, 130], [0, 1]);
  const ctxItemO  = SOURCES.map((_, i) => ci(frame, [108 + i * 12, 130 + i * 12], [0, 1]));

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FONT }}>

      {/* Subtle dot grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}
        viewBox="0 0 1080 1920">
        <defs>
          <pattern id="s2dots" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx={30} cy={30} r={1.5} fill={ACCENT} />
          </pattern>
        </defs>
        <rect width="1080" height="1920" fill="url(#s2dots)" />
      </svg>

      {/* "01" step number */}
      <div style={{
        position: "absolute", top: ST + 18, left: SL,
        fontSize: 100, fontWeight: 800, color: `${ACCENT}40`,
        lineHeight: 1, opacity: numO,
      }}>01</div>

      {/* Headline */}
      <div style={{
        position: "absolute", top: ST + 118, left: SL, right: SL,
        transform: `scale(${h1S})`, transformOrigin: "left top",
        opacity: ci(h1S, 0, 0.4, 0, 1),
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: WHITE }}>Perceive</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: ACCENT, marginTop: 4 }}>
          STEP 1
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute", top: ST + 310, left: SL, right: SL,
        fontSize: 36, fontWeight: 400, color: GREY, lineHeight: 1.5, opacity: subO,
      }}>
        Agents ingest inputs — text, images, API data, tool results —
        and pack everything into a <span style={{ color: ACCENT, fontWeight: 600 }}>Context Window</span> the LLM can read.
      </div>

      {/* Source chips (left column) */}
      {SOURCES.map(({ icon, label, color, cy }, i) => (
        <div key={i} style={{
          position: "absolute",
          top: cy - CHIP_H / 2,
          left: SL,
          width: CHIP_W,
          height: CHIP_H,
          backgroundColor: `${color}12`,
          border: `2px solid ${color}55`,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 18px",
          transform: `translateX(${chipTX[i]}px)`,
          opacity: ci(sp(frame, fps, 56 + i * 14), 0, 0.3, 0, 1),
        }}>
          <span style={{ fontSize: 44 }}>{icon}</span>
          <span style={{ fontSize: 36, fontWeight: 700, color }}>{label}</span>
        </div>
      ))}

      {/* SVG: lines + context window box */}
      <svg viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>

        {/* Lines from each chip to box */}
        {SOURCES.map(({ color, cy }, i) => {
          const lx1 = SL + CHIP_W;
          const ly  = cy;
          const lx2 = BOX_X;
          return (
            <g key={i}>
              <line x1={lx1} y1={ly} x2={lx1 + (lx2 - lx1) * lineD[i]} y2={ly}
                stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.8} />
              {/* Arrow tip */}
              {lineD[i] > 0.95 && (
                <polygon
                  points={`${lx2},${ly} ${lx2 - 14},${ly - 8} ${lx2 - 14},${ly + 8}`}
                  fill={color} opacity={0.9}
                />
              )}
            </g>
          );
        })}

        {/* Context Window box */}
        <g transform={`translate(${BOX_X + BOX_W / 2} ${BOX_Y + BOX_H / 2}) scale(${boxS}) translate(${-(BOX_X + BOX_W / 2)} ${-(BOX_Y + BOX_H / 2)})`}>
          {/* Glow */}
          <rect x={BOX_X - 4} y={BOX_Y - 4} width={BOX_W + 8} height={BOX_H + 8}
            rx={22} fill="none" stroke={`${ACCENT}30`} strokeWidth={8} />
          {/* Box */}
          <rect x={BOX_X} y={BOX_Y} width={BOX_W} height={BOX_H}
            rx={18} fill={`${ACCENT}0d`} stroke={ACCENT} strokeWidth={2} />
          {/* Label */}
          <text x={BOX_X + BOX_W / 2} y={BOX_Y + 46} textAnchor="middle"
            fontSize={28} fontWeight={700} fontFamily={FONT} fill={ACCENT}>
            CONTEXT WINDOW
          </text>
          {/* Divider */}
          <line x1={BOX_X + 20} y1={BOX_Y + 64} x2={BOX_X + BOX_W - 20} y2={BOX_Y + 64}
            stroke={`${ACCENT}40`} strokeWidth={1} />
          {/* Progress bar track */}
          <rect x={BOX_X + 20} y={BOX_Y + BOX_H - 50}
            width={BOX_W - 40} height={22} rx={11} fill={`${ACCENT}18`} />
          {/* Progress fill */}
          <rect x={BOX_X + 20} y={BOX_Y + BOX_H - 50}
            width={barW} height={22} rx={11} fill={ACCENT} opacity={0.85} />
          <text x={BOX_X + BOX_W / 2} y={BOX_Y + BOX_H - 55 + 14}
            textAnchor="middle" fontSize={22} fontWeight={600}
            fontFamily={FONT} fill={WHITE} opacity={0.6}>
            {`${Math.round(barW / (BOX_W - 40) * 100)}% full`}
          </text>
        </g>

        {/* Items appearing inside box */}
        {SOURCES.map(({ icon, label, color, cy }, i) => (
          <text key={i}
            x={BOX_X + 28} y={BOX_Y + 98 + i * 96}
            fontSize={32} fontFamily={FONT} fontWeight={600}
            fill={color} opacity={ctxItemO[i]}>
            {icon}{"  "}{label}
          </text>
        ))}
      </svg>

    </AbsoluteFill>
  );
};
