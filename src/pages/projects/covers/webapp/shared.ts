import type { CSSProperties } from "react";
import type { Easing, Transition } from "motion/react";
import { easeInOut } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

/* Geometry, timing and chrome shared by the WebAppScene stages and AuthScene.
   A stage lays its panels out in percent of the 16:10 slot and sizes the
   small things (dots, pills, bars) in px for the ~350 px card slot.
   Wires live in one SVG whose viewBox is 160 x 100: the slot is 16:10, so
   the SVG scales uniformly and a percent point (x, y) is (1.6x, y). */

export interface PanelProps {
   tint: string;
}

/* A point in percent of the slot. */
export interface Pt {
   x: number;
   y: number;
}

export const VIEW_W = 160;
export const VIEW_H = 100;
export const VIEWBOX = `0 0 ${VIEW_W} ${VIEW_H}`;

export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_05 = "rgba(255,255,255,0.05)";
export const WHITE_06 = "rgba(255,255,255,0.06)";
export const WHITE_08 = "rgba(255,255,255,0.08)";
export const WHITE_10 = "rgba(255,255,255,0.10)";
export const WHITE_14 = "rgba(255,255,255,0.14)";
export const WHITE_18 = "rgba(255,255,255,0.18)";
export const WHITE_22 = "rgba(255,255,255,0.22)";
export const WHITE_28 = "rgba(255,255,255,0.28)";
export const WHITE_40 = "rgba(255,255,255,0.40)";
export const WHITE_60 = "rgba(255,255,255,0.60)";
export const INK = "#0b1012";
export const BASE_GRADIENT = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";

export const HAIRLINE = `1px solid ${WHITE_10}`;
export const BORDER_BOX = "border-box";
export const CLEAR = "transparent";
export const CENTER_Y = "translateY(-50%)";
export const CENTER_XY = "translate(-50%, -50%)";

export const ROOT: CSSProperties = {
   position: "absolute",
   inset: 0,
   overflow: "hidden",
   background: BASE_GRADIENT,
};

export const FILL: CSSProperties = { position: "absolute", inset: 0 };

/* Mid layer: flat bordered panel, the same chrome as every other cover. */
export const PANEL: CSSProperties = {
   position: "absolute",
   boxSizing: BORDER_BOX,
   border: HAIRLINE,
   borderRadius: 8,
   background: WHITE_03,
};

export const LABEL: CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 8,
   fontWeight: 700,
   letterSpacing: 0.8,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
   color: WHITE_40,
};

/* Label sitting on the line just above a panel's top edge. */
export const LABEL_ABOVE: CSSProperties = { ...LABEL, left: 1, top: -13 };

/* Panel spanning two percent x edges, its anchor row pinned to `y`.
   `rowCentre` is that row's px distance from the panel top; without it the
   panel's own middle sits on `y`. Wires meet the panel at (left, y) and
   (right, y), so a percent point always lands on the right row. */
export const span = (
   left: number,
   right: number,
   y: number,
   rowCentre?: number,
): CSSProperties => ({
   ...PANEL,
   left: `${left}%`,
   right: `${100 - right}%`,
   top: `${y}%`,
   transform:
      rowCentre === undefined ? CENTER_Y : `translateY(-${rowCentre}px)`,
});

/* Small fixed-size element centred on a percent point. */
export const centredAt = (p: Pt): CSSProperties => ({
   position: "absolute",
   left: `${p.x}%`,
   top: `${p.y}%`,
   transform: CENTER_XY,
});

/* Thin rounded bar standing in for a line of text. */
export const bar = (
   width: string | number,
   background: string,
   height = 4,
): CSSProperties => ({
   display: "block",
   width,
   height,
   borderRadius: height,
   background,
   flexShrink: 0,
});

export const disc = (size: number, background: string): CSSProperties => ({
   display: "block",
   width: size,
   height: size,
   borderRadius: "50%",
   background,
   flexShrink: 0,
});

/* Avatar disc in the tint family. */
export const avatar = (tint: string, size = 9): CSSProperties => ({
   ...disc(size, `${tint}26`),
   boxSizing: BORDER_BOX,
   border: `1px solid ${tint}80`,
});

const vx = (x: number) => Math.round(x * (VIEW_W / 100) * 100) / 100;

/* Horizontal S between two percent points. The control points sit a third
   and two thirds along the run, so x moves linearly in t and y follows
   smoothstep(t); Packet keys its head on exactly that. */
export const hCurve = (a: Pt, b: Pt): string => {
   const third = (b.x - a.x) / 3;
   return `M ${vx(a.x)} ${a.y} C ${vx(a.x + third)} ${a.y} ${vx(b.x - third)} ${b.y} ${vx(b.x)} ${b.y}`;
};

/* Vertical S: y moves linearly in t and x follows smoothstep(t). */
export const vCurve = (a: Pt, b: Pt): string => {
   const third = (b.y - a.y) / 3;
   return `M ${vx(a.x)} ${a.y} C ${vx(a.x)} ${a.y + third} ${vx(b.x)} ${b.y - third} ${vx(b.x)} ${b.y}`;
};

export const smoothstep = (t: number): number => t * t * (3 - 2 * t);

export type Axis = "h" | "v";

const ARC_SAMPLES = 48;

/* Curve parameter t at which an S curve has covered fraction s of its
   length. The tail's pathOffset moves by length, so the head maps through
   this to stay on the tail's tip instead of drifting a few px on steep
   curves. Measured in viewBox units, where the 16:10 slot scales evenly. */
export const arcToT = (a: Pt, b: Pt, axis: Axis): ((s: number) => number) => {
   const runX = vx(b.x) - vx(a.x);
   const runY = b.y - a.y;
   const at = (t: number): [number, number] =>
      axis === "h"
         ? [runX * t, runY * smoothstep(t)]
         : [runX * smoothstep(t), runY * t];
   const lengths = [0];
   let [px, py] = at(0);
   for (let i = 1; i <= ARC_SAMPLES; i++) {
      const [x, y] = at(i / ARC_SAMPLES);
      lengths.push(lengths[i - 1] + Math.hypot(x - px, y - py));
      [px, py] = [x, y];
   }
   const total = lengths[ARC_SAMPLES];
   if (total === 0) return (s) => s;
   return (s) => {
      const target = s * total;
      let k = 1;
      while (k < ARC_SAMPLES && lengths[k] < target) k++;
      const segment = lengths[k] - lengths[k - 1];
      const frac = segment === 0 ? 0 : (target - lengths[k - 1]) / segment;
      return (k - 1 + frac) / ARC_SAMPLES;
   };
};

export const EASE: Easing = "easeInOut";

/* Head easings for one hop: easeInOut in arc length, mapped to t for the
   axis that runs linearly and through smoothstep for the cross axis. */
export const hopEases = (
   a: Pt,
   b: Pt,
   axis: Axis,
): { along: Easing; across: Easing } => {
   const toT = arcToT(a, b, axis);
   return {
      along: (u: number) => toT(easeInOut(u)),
      across: (u: number) => smoothstep(toT(easeInOut(u))),
   };
};

/* Infinite keyframe loop with one ease per segment. Motion runs opacity
   through WAAPI, which would spread a single ease over the whole iteration
   while transforms and SVG props ease each segment, pulling the tracks off
   the beats. Pass `eases` to set a segment's curve (hopEases). */
export const loop = (
   duration: number,
   times: number[],
   eases?: Easing[],
): Transition => ({
   duration,
   repeat: Infinity,
   times,
   ease: eases ?? times.slice(1).map(() => EASE),
});

/* A value that rests at `rest`, eases to `peak` over [on, onDone], holds,
   and eases back over [off, offDone]; offDone must stay below 1. The usual
   beat shape, as matching keyframes and times. */
export interface Beat {
   values: number[];
   times: number[];
}

export const beat = (
   rest: number,
   peak: number,
   [on, onDone, off, offDone]: [number, number, number, number],
): Beat => ({
   values: [rest, rest, peak, peak, rest, rest],
   times: [0, on, onDone, off, offDone, 1],
});
