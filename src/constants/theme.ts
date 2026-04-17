// Centralized theme tokens -- single source of truth for design values.
// CSS custom properties in index.css handle Tailwind classes; these are for
// inline `style={{}}` usage and animation variants in React components.

// ===== Colors =====
export const CYAN = "#06b6d4";
export const PURPLE = "#a855f7";
export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const PINK = "#ec4884";
export const BLUE = "#007bff";

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

// ===== Animation Tokens =====
// Shared across Framer Motion variants and CSS transitions.
export const EASING = {
   // Smooth "out" curve -- most section reveals.
   smooth: [0.25, 0.46, 0.45, 0.94] as const,
   // Snappy cinematic exit -- bento + browser mockup.
   cinematic: [0.16, 1, 0.3, 1] as const,
   // Quick tight motion -- tags, cascade items.
   brisk: [0.25, 0.1, 0.25, 1] as const,
} as const;

export const DURATION = {
   quick: 0.3,
   default: 0.6,
   slow: 0.8,
} as const;

export const SPRING = {
   gentle: { type: "spring" as const, stiffness: 80, damping: 16 },
   default: { type: "spring" as const, stiffness: 100, damping: 15 },
} as const;

// ===== Shared inline style objects =====

/** Glassmorphism panel -- used by TerminalCard, ActivityFeed, NodeDiagram, StatsCard */
export const GLASS_PANEL_STYLE: React.CSSProperties = {
   borderRadius: 12,
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
