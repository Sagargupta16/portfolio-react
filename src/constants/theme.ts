// Centralized theme tokens -- single source of truth for all inline styles.
// CSS custom properties in index.css handle Tailwind classes; these are for
// inline `style={{}}` usage in React components.

// ===== Colors =====
export const CYAN = "#06b6d4";
export const PURPLE = "#a855f7";
export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const PINK = "#ec4884";

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
