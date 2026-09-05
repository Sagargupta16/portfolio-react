import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";

/*
 * Tokens and timeline helpers for the GateScene family. Chrome (panels,
 * hairlines, bars) is drawn in a 16:10 SVG stage of 320 x 200 units and
 * scales with the slot. Signals (dots, flashes, log lines) are HTML placed at
 * the same stage coordinates with fixed px sizes, so the mechanism still
 * reads at 165 px.
 */

export interface TintProps {
   tint: string;
}

export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_08 = "rgba(255,255,255,0.08)";
export const WHITE_12 = "rgba(255,255,255,0.12)";
export const WHITE_15 = "rgba(255,255,255,0.15)";
export const WHITE_25 = "rgba(255,255,255,0.25)";
export const WHITE_50 = "rgba(255,255,255,0.5)";
export const LINEAR = "linear";
export const NON_SCALING = "non-scaling-stroke";
export const CENTER = "translateX(-50%)";
export const STAGE_W = 320;
export const STAGE_H = 200;
const EASE = "easeInOut";

/* One repeating timeline; keyframe arrays share `times` (fractions of duration). */
export interface Loop {
   duration: number;
   times?: number[];
   x?: (number | string)[];
   opacity?: number[];
   scale?: number[];
   ease?: "linear" | "easeInOut";
}

export type Keyframes = Omit<Loop, "duration" | "ease">;

/* Static chrome as tuples in stage units. Strokes never scale, so a
   zero-length round-capped line is a fixed-px dot and a thick one a bar. */
/* [x1, y1, x2, y2, stroke?, strokeWidth?] */
export type Line = [number, number, number, number, string?, number?];
/* [x, y, w, h, color, rx, stroke?] */
export type Rect = [number, number, number, number, string, number, string?];
export type Box = [x: number, y: number, w: number, h: number];
export type Statics = { lines?: Line[]; rects?: Rect[] };

/*
 * Motion hands opacity to WAAPI, where a single ease string stretches over
 * the whole iteration and drags keyframes off their `times`, while x/scale
 * stay per segment on the JS path. One ease per segment keeps every track
 * on the storyboard clock.
 */
export const loopProps = ({
   duration,
   times,
   ease = EASE,
   ...animate
}: Loop) => ({
   animate,
   transition: {
      duration,
      times,
      ease: times ? times.slice(1).map(() => ease) : ease,
      repeat: Infinity,
   },
});

export const pctX = (x: number) => `${(x / STAGE_W) * 100}%`;
export const pctY = (y: number) => `${(y / STAGE_H) * 100}%`;

export const label: CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 0.8,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

export const layer: CSSProperties = { position: "absolute", inset: 0 };

/* Fixed-px HTML dot centred on a stage point. */
export const dot = (
   x: number,
   y: number,
   size: number,
   color: string,
): CSSProperties => ({
   position: "absolute",
   left: pctX(x),
   top: pctY(y),
   width: size,
   height: size,
   marginLeft: -size / 2,
   marginTop: -size / 2,
   borderRadius: "50%",
   background: color,
});
