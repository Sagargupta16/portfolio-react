import type { CSSProperties } from "react";
import {
   AMBER,
   BLUE,
   BLUE_LIGHT,
   BLUE_PALE,
   MONO_FONT,
   SKY,
   TEXT_SECONDARY,
} from "@/constants/theme";

/** One slice of a SplitBar: `weight` sizes it, `display` is the legend value. */
export interface SplitSegment {
   key: string;
   label: string;
   weight: number;
   display: string;
   color: string;
}

/** Small uppercase mono caption shared by the platform cards. */
export const CAPTION_STYLE: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 11,
   fontWeight: 700,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   color: TEXT_SECONDARY,
};

// Top languages take the blue family in order rather than GitHub's language
// colours: one accent family on the page. Neighbours alternate light and deep
// so adjacent slices stay distinct.
export const LANGUAGE_SHADES = [
   BLUE,
   BLUE_LIGHT,
   "#1e40af",
   SKY,
   BLUE_PALE,
   "#bfdbfe",
];

// LeetCode is the one amber surface; difficulty reads as amber strength,
// hard at full strength.
export const DIFFICULTY_SHADES = {
   easy: `${AMBER}59`,
   medium: `${AMBER}a6`,
   hard: AMBER,
};

// The Stats band tile figures: the counter's own blue at three strengths, as
// outlines and as strokes, plus a neutral track. They are SVG presentation
// attributes, which cannot read var(--ch-*), so the colours are literal.
const ROUND = { strokeLinecap: "round", strokeLinejoin: "round" } as const;
export const FIGURE_TONES = {
   solid: { fill: BLUE_LIGHT },
   half: { fill: `${BLUE_LIGHT}99` },
   faint: { fill: `${BLUE_LIGHT}40` },
   ring: { fill: "none", stroke: BLUE_LIGHT, strokeWidth: 1.2 },
   line: { fill: "none", stroke: BLUE_LIGHT, strokeWidth: 1.6, ...ROUND },
   bold: { fill: "none", stroke: BLUE_LIGHT, strokeWidth: 2.2, ...ROUND },
   dim: { fill: "none", stroke: `${BLUE_LIGHT}73`, strokeWidth: 1.2, ...ROUND },
   track: {
      fill: "none",
      stroke: "rgba(255, 255, 255, 0.16)",
      strokeWidth: 1.2,
      ...ROUND,
   },
} as const;

export type FigureTone = keyof typeof FIGURE_TONES;
