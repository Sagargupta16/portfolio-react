// Centralized design tokens -- single source of truth for visual consistency.
// CSS custom properties in index.css handle Tailwind classes; these are for
// inline `style={{}}` usage and animation variants in React components.

// ===== Colors =====
// Flat minimal palette (akobir-style): blue family only for accents.
export const BLUE = "#2563eb"; // primary CTA
export const BLUE_LIGHT = "#60a5fa"; // accent text / icons on dark
export const SKY = "#38bdf8"; // secondary accent (roles, PoR)
export const BLUE_PALE = "#93c5fd"; // third shade in blue-family ramps
export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
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

// Surfaces -- mirror --color-bg-primary / --color-bg-card in index.css.
export const BG_PRIMARY = "#0b1012";
export const BG_CARD = "#0e1417";

export const GLASS_BORDER = "rgba(255, 255, 255, 0.08)";

// ===== Fonts =====
export const MONO_FONT = "Geist Mono Variable, ui-monospace, monospace";

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
   /** Flanks beside the 896px hero column are wide enough for 40px tiles. */
   wide: `(min-width: ${BREAKPOINTS.xl}px)`,
   /** The primary pointer can hover: the gate for pointer-driven decoration. */
   hover: "(hover: hover)",
   /** Touch-first primary pointer: the gate for 44px hit areas. */
   coarse: "(pointer: coarse)",
} as const;

// ===== Animation Tokens =====
// Shared across Framer Motion variants and CSS transitions.
export const EASING = {
   standard: [0.4, 0, 0.2, 1] as const,
   cinematic: [0.16, 1, 0.3, 1] as const,
   brisk: [0.25, 0.1, 0.25, 1] as const,
} as const;

export const DURATION = {
   quick: 0.25, // hover, tooltip
   default: 0.4, // card reveals, transitions
   slow: 0.7, // section / hero entrance
} as const;

// ===== Shared inline style objects =====

/** Transparent box centred on a small link (which must be position:
 *  relative), so its tap target is at least 44 x 44 px with no visual change.
 *  Render it only under MEDIA_QUERIES.coarse. */
export const TOUCH_HIT_AREA: React.CSSProperties = {
   position: "absolute",
   top: "50%",
   left: "50%",
   width: "max(100%, 44px)",
   height: "max(100%, 44px)",
   transform: "translate(-50%, -50%)",
};

/** Chrome header bar -- used by TerminalDemo */
export const CHROME_BAR_STYLE: React.CSSProperties = {
   background: "rgb(var(--ch-bg-sec) / 0.8)",
   borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
   display: "flex",
   alignItems: "center",
};
