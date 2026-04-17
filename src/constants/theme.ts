// Centralized design tokens -- single source of truth for visual consistency.
// CSS custom properties in index.css handle Tailwind classes; these are for
// inline `style={{}}` usage and animation variants in React components.

// ===== Colors =====
export const CYAN = "#06b6d4";
export const PURPLE = "#a855f7";
export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const PINK = "#ec4899";
export const BLUE = "#007bff";
export const INDIGO = "#6366f1";
export const ORANGE = "#f97316";
export const RED = "#ef4444";

// Semantic medal colors -- never substitute these, they're earned.
export const MEDAL_GOLD = "#fbbf24";
export const MEDAL_SILVER = "#94a3b8";
export const MEDAL_BRONZE = "#d97706";

export const TEXT_PRIMARY = "#eeeef5";
export const TEXT_SECONDARY = "#a5a5c0";
export const TEXT_MUTED = "#6e6e90";

export const GLASS_BORDER = "rgba(255, 255, 255, 0.06)";
export const GLASS_BG = "rgba(255, 255, 255, 0.03)";

// ===== Fonts =====
export const MONO_FONT = "JetBrains Mono, ui-monospace, monospace";

// ===== Layout =====
export const MAX_WIDTH = 1152;
export const MAX_WIDTH_NARROW = 960;

// ===== Responsive Breakpoints =====
// Align with Tailwind defaults -- single source of truth for media queries.
export const BREAKPOINTS = {
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

// ===== Spacing Scale (base-4 grid) =====
// Every padding / gap / margin should resolve to one of these.
export const SPACE = {
   0: 0,
   1: 4,
   2: 8,
   3: 12,
   4: 16,
   5: 20,
   6: 24,
   8: 32,
   10: 40,
   12: 48,
} as const;

// ===== Typography Scale =====
// 7 steps, roughly 1.25 modular ratio at the higher end.
export const TEXT_SIZE = {
   xs: 11, // caption, tag
   sm: 12, // subtle labels
   base: 14, // body
   md: 16, // card titles
   lg: 20, // section sub-headers
   xl: 24, // section headers
   "2xl": 32, // page titles
   "3xl": 48, // hero
} as const;

// ===== Line Heights =====
export const LEADING = {
   none: 1, // numerals, monograms
   tight: 1.2, // headings
   normal: 1.5, // body
   relaxed: 1.7, // long-form paragraphs
} as const;

// ===== Border Radii =====
export const RADIUS = {
   sm: 6, // chips, tags
   md: 10, // small cards
   lg: 12, // standard cards
   xl: 16, // panels, modals
   pill: 9999,
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

export const SPRING = {
   gentle: { type: "spring" as const, stiffness: 80, damping: 16 },
   default: { type: "spring" as const, stiffness: 100, damping: 15 },
} as const;

// ===== Shared inline style objects =====

/** Glassmorphism panel -- used by TerminalCard, ActivityFeed, NodeDiagram, StatsCard */
export const GLASS_PANEL_STYLE: React.CSSProperties = {
   borderRadius: RADIUS.lg,
   overflow: "hidden",
   border: "1px solid rgb(var(--ch-white) / 0.06)",
   background: "rgb(var(--ch-glass) / 0.5)",
   backdropFilter: "blur(16px)",
   WebkitBackdropFilter: "blur(16px)",
};

/** Chrome header bar -- used by TerminalCard, ActivityFeed, BrowserMockup */
export const CHROME_BAR_STYLE: React.CSSProperties = {
   background: "rgb(var(--ch-bg-sec) / 0.8)",
   borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
   display: "flex",
   alignItems: "center",
};
