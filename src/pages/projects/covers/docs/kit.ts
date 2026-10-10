import type { CSSProperties } from "react";
import type { Easing } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

/*
 * Shared tokens and geometry for the Docs family (docs/*Variant.tsx) and the
 * Guide and Tax scenes. Every scene lays out in one 160 x 100 viewBox that
 * covers the 16:10 slot, so 1 x unit is 1/160 of the width and 1 y unit is 1%
 * of the height. HTML pins use the same units through px() / py(), so a label,
 * a panel or a packet lands on the SVG geometry at any card width.
 */

export const VIEW_W = 160;
export const VIEW_H = 100;
export const VIEW_BOX = `0 0 ${VIEW_W} ${VIEW_H}`;

export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const W03 = "rgba(255,255,255,0.03)";
export const W05 = "rgba(255,255,255,0.05)";
export const W10 = "rgba(255,255,255,0.10)";
export const W18 = "rgba(255,255,255,0.18)";
export const W30 = "rgba(255,255,255,0.30)";
export const W50 = "rgba(255,255,255,0.50)";
export const W80 = "rgba(255,255,255,0.80)";
export const BASE_BG = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";
/** The panel lift (3% white) over an opaque base, so a cover or a wire that
    passes under a panel hides cleanly. */
export const SOLID_FILL = `linear-gradient(${W03}, ${W03}), #0d1418`;

export const EASE: Easing = "easeInOut";
export const LINEAR: Easing = "linear";

/* ---------- units -> slot percentages ---------- */

export const px = (x: number) => `${(x / VIEW_W) * 100}%`;
export const py = (y: number) => `${(y / VIEW_H) * 100}%`;
export const FILL: CSSProperties = { position: "absolute", inset: 0 };
export const pin = (x: number, y: number): CSSProperties => ({
   position: "absolute",
   left: px(x),
   top: py(y),
});
export const rect = (
   x: number,
   y: number,
   w: number,
   h: number,
): CSSProperties => ({ ...pin(x, y), width: px(w), height: py(h) });

/** 1 px device hairline for STATIC paths and px dash flows only. Never put
    it on a path that animates pathLength or pathOffset: Chrome normalises
    the dash in user units but strokes the screen-space path. */
export const hair = (color: string) => ({
   stroke: color,
   strokeWidth: 1,
   fill: "none",
   vectorEffect: "non-scaling-stroke" as const,
});

/** Stroke for pathLength draws: user units, scales with the uniform viewBox. */
export const drawStroke = (color: string) => ({
   stroke: color,
   strokeWidth: 0.6,
   strokeLinecap: "butt" as const,
   fill: "none",
});

export const LABEL: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 8,
   fontWeight: 600,
   letterSpacing: "0.08em",
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

/* ---------- timing ---------- */

/** One ease per keyframe segment. Motion runs opacity through WAAPI and
    transforms on its frameloop; a single ease string spans the whole WAAPI
    iteration and pulls the two tracks out of step (skill rule 11). */
export const perSegment = (
   times: readonly number[],
   ease: Easing = EASE,
): Easing[] => times.slice(1).map(() => ease);

export const loop = (
   cycle: number,
   times: number[],
   ease: Easing = EASE,
   delay = 0,
) => ({
   duration: cycle,
   repeat: Infinity,
   times,
   delay,
   ease: perSegment(times, ease),
});

/** Six keys: rest until `on`, rise, hold until `off`, fall, rest to the end. */
export const windowTimes = (
   on: number,
   off: number,
   rise = 0.05,
   fall = 0.06,
): number[] => [0, on, on + rise, off, off + fall, 1];

export const windowKeys = <T>(rest: T, peak: T): T[] => [
   rest,
   rest,
   peak,
   peak,
   rest,
   rest,
];

/* ---------- curves and packets ---------- */

export interface Pt {
   x: number;
   y: number;
}

export type Cubic = readonly [Pt, Pt, Pt, Pt];

/** Horizontal S-curve: both control points pulled along x. */
export const sCurve = (a: Pt, b: Pt, pull = 0.5): Cubic => {
   const dx = (b.x - a.x) * pull;
   return [a, { x: a.x + dx, y: a.y }, { x: b.x - dx, y: b.y }, b];
};

/** Straight run expressed as a cubic so packets share one sampler. */
export const straight = (a: Pt, b: Pt): Cubic => [
   a,
   { x: a.x + (b.x - a.x) / 3, y: a.y + (b.y - a.y) / 3 },
   { x: a.x + ((b.x - a.x) * 2) / 3, y: a.y + ((b.y - a.y) * 2) / 3 },
   b,
];

export const cubicD = ([a, b, c, d]: Cubic) =>
   `M ${a.x} ${a.y} C ${b.x} ${b.y} ${c.x} ${c.y} ${d.x} ${d.y}`;

const bez = (p0: number, p1: number, p2: number, p3: number, t: number) => {
   const u = 1 - t;
   return (
      u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
   );
};

export const cubicAt = ([a, b, c, d]: Cubic, t: number): Pt => ({
   x: bez(a.x, b.x, c.x, d.x, t),
   y: bez(a.y, b.y, c.y, d.y, t),
});

/** One run of a packet: along `curve` between cycle fractions `from` and `to`. */
export interface Leg {
   curve: Cubic;
   from: number;
   to: number;
}

export interface Track {
   x: string[];
   y: string[];
   opacity: number[];
   times: number[];
}

const SAMPLES = 6;
const FADE = 0.03;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Keyframes for a packet riding one or more legs. Points are sampled on each
 * cubic and spaced in time by a smoothstep, so linear segments between them
 * ease in and out. The packet waits where one leg ends until the next begins,
 * fades out after the last, and slips back to the start while invisible, so
 * the loop never shows a jump. x / y are percentages of a slot-sized box.
 */
export const packetTrack = (legs: readonly Leg[]): Track => {
   const start = legs[0].curve[0];
   const points: Pt[] = [start, start];
   const opacity = [0, 0];
   const times = [0, legs[0].from];
   const push = (p: Pt, o: number, t: number) => {
      points.push(p);
      opacity.push(o);
      times.push(t);
   };
   for (const leg of legs) {
      if (leg.from > (times.at(-1) ?? 0)) push(leg.curve[0], 1, leg.from);
      for (let i = 1; i <= SAMPLES; i += 1) {
         const f = i / SAMPLES;
         push(
            cubicAt(leg.curve, f),
            1,
            leg.from + (leg.to - leg.from) * smoothstep(f),
         );
      }
   }
   push(points.at(-1) ?? start, 0, (times.at(-1) ?? 0) + FADE);
   push(start, 0, 1);
   return {
      x: points.map((p) => px(p.x)),
      y: points.map((p) => py(p.y)),
      opacity,
      times,
   };
};
