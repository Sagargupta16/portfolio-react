// Centralized design tokens -- single source of truth for visual consistency.
// CSS custom properties in index.css handle Tailwind classes; these are for
// inline `style={{}}` usage and animation variants in React components.

// ===== Colors =====
// Flat minimal palette (akobir-style): blue family only for accents.
// Legacy names kept so 40+ call sites don't churn; values remapped.
export const BLUE = "#2563eb"; // primary CTA
export const CYAN = "#60a5fa"; // accent text / icons on dark
export const PURPLE = "#38bdf8"; // secondary accent (roles, PoR)
export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const PINK = "#38bdf8";
export const ORANGE = "#f97316";
export const RED = "#ef4444";

// Semantic medal colors -- never substitute these, they're earned.
export const MEDAL_GOLD = "#fbbf24";
export const MEDAL_SILVER = "#94a3b8";
export const MEDAL_BRONZE = "#d97706";

export const TEXT_PRIMARY = "#f4f6f7";
export const TEXT_SECONDARY = "#9ca9b0";
// Clears WCAG 1.4.3 (4.5:1) for small informational text on the near-black bg.
export const TEXT_MUTED = "#8a97a0";

export const GLASS_BORDER = "rgba(255, 255, 255, 0.08)";

// ===== Fonts =====
export const MONO_FONT = "JetBrains Mono, ui-monospace, monospace";

// ===== Layout =====
export const MAX_WIDTH = 1152;
export const MAX_WIDTH_NARROW = 960;
export const MAX_WIDTH_WIDE = 1024; // GitHub calendar section
export const MAX_WIDTH_FORM = 896; // Contact form + cards

// ===== Responsive Breakpoints =====
// Align with Tailwind defaults -- single source of truth for media queries.
const BREAKPOINTS = {
   sm: 640,
   md: 768,
   lg: 1024,
   xl: 1280,
} as const;

export const MEDIA_QUERIES = {
   mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
   tablet: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
   reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

// ===== Animation Tokens =====
// Shared across Framer Motion variants and CSS transitions.
export const EASING = {
   smooth: [0.25, 0.46, 0.45, 0.94] as const,
   cinematic: [0.16, 1, 0.3, 1] as const,
   brisk: [0.25, 0.1, 0.25, 1] as const,
} as const;

export const DURATION = {
   quick: 0.25, // hover, tooltip
   default: 0.4, // card reveals, transitions
   slow: 0.7, // section / hero entrance
   ambient: 20, // decorative background loops
} as const;

// ===== Shared inline style objects =====

/** Chrome header bar -- used by TerminalCard, ActivityFeed, BrowserMockup */
export const CHROME_BAR_STYLE: React.CSSProperties = {
   background: "rgb(var(--ch-bg-sec) / 0.8)",
   borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
   display: "flex",
   alignItems: "center",
};
