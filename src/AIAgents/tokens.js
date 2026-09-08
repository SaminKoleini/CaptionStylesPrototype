// Design tokens — shared by all 5 scenes
export const BG      = "#0a0a0a";
export const WHITE   = "#ffffff";
export const GREY    = "rgba(255,255,255,0.55)";
export const ACCENT  = "#6366f1";   // indigo
export const ACCENT2 = "#818cf8";   // lighter indigo
export const GREEN   = "#22c55e";   // emphasis green
export const YELLOW  = "#eab308";
export const PURPLE  = "#a855f7";
export const RED     = "#ef4444";

// Font (loaded via @remotion/google-fonts in AIAgentsVideo.jsx)
export const FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";

// Safe zone — 1080 × 1920 canvas
export const ST = 150;   // safe top
export const SB = 1750;  // safe bottom  (1920 − 170)
export const SL = 60;    // safe left
export const SR = 1020;  // safe right   (1080 − 60)
export const SW = 960;   // safe width
export const SH = 1600;  // safe height
export const CX = 540;   // canvas centre x
export const CY = 960;   // canvas centre y

// Spring config — high damping, no bounce
export const SPRING_CFG = { damping: 200, stiffness: 400 };
