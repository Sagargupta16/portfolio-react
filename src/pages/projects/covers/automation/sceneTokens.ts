import type { CSSProperties } from "react";
import type { Easing, Transition } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

/* Shared timing, geometry and palette tokens for the AutomationScene family.

   Every pipeline draws its geometry in one 1600 x 1000 viewBox that matches
   the 16:10 slot, so the SVG scales evenly and the HTML overlays placed with
   xPct / yPct (labels, packets, status dots) stay on it at any card width.
   Static hairlines use non-scaling-stroke; pathLength draws never do, since
   Chrome would compute the dash in user units and stroke it in screen units. */

export const CYCLE = 6;
export const VIEW_W = 1600;
export const VIEW_H = 1000;
export const VIEW_BOX = `0 0 ${VIEW_W} ${VIEW_H}`;
export const NON_SCALING = "non-scaling-stroke";

/** Cycle timestamps in seconds to Motion `times` fractions. */
export const secs = (...stamps: number[]): number[] =>
   stamps.map((s) => s / CYCLE);

/* Motion eases a keyframe array per segment on its frameloop but over the
   whole iteration on WAAPI values (opacity on HTML), so one ease string pulls
   the tracks apart. Every keyframed value gets one ease per segment. */
export const perSegment = (
   times: number[],
   ease: Easing = "easeInOut",
): Easing[] => times.slice(1).map(() => ease);

/** A repeating full-cycle keyframe transition from timestamps in seconds. */
export const loop = (...stamps: number[]): Transition => {
   const times = secs(...stamps);
   return {
      duration: CYCLE,
      repeat: Infinity,
      times,
      ease: perSegment(times),
   };
};

export const xPct = (x: number): string => `${(x / VIEW_W) * 100}%`;
export const yPct = (y: number): string => `${(y / VIEW_H) * 100}%`;

export type Point = readonly [number, number];

/** Horizontal S curve between two points, control points at the mid x. */
export const curve = ([x0, y0]: Point, [x1, y1]: Point): string => {
   const mx = (x0 + x1) / 2;
   return `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
};

/** Points sampled along `curve`, for packets that ride the same line. */
export const curvePoints = (
   [x0, y0]: Point,
   [x1, y1]: Point,
   steps = 6,
): Point[] =>
   Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      const u = 1 - t;
      /* x control points both sit at the mid x, y ones at the two ends */
      const mx = (x0 + x1) / 2;
      const x = u ** 3 * x0 + 3 * u * t * mx + t ** 3 * x1;
      const y = (u ** 3 + 3 * u * u * t) * y0 + (3 * u * t * t + t ** 3) * y1;
      return [x, y] as const;
   });

/** Vertical S curve between two points, control points at the mid y. */
export const vcurve = ([x0, y0]: Point, [x1, y1]: Point): string => {
   const my = (y0 + y1) / 2;
   return `M${x0} ${y0} C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
};

/** Points sampled along `vcurve`. */
export const vcurvePoints = (from: Point, to: Point, steps = 6): Point[] =>
   curvePoints([from[1], from[0]], [to[1], to[0]], steps).map(
      ([y, x]) => [x, y] as const,
   );

/** Cycle seconds a packet passes each point, spaced by distance travelled. */
export const travelStamps = (
   points: readonly Point[],
   from: number,
   to: number,
): number[] => {
   const run = points.map((p, i) => {
      const prev = points[Math.max(0, i - 1)];
      return Math.hypot(p[0] - prev[0], p[1] - prev[1]);
   });
   const total = run.reduce((sum, d) => sum + d, 0) || 1;
   let walked = 0;
   return run.map((d) => {
      walked += d;
      return from + ((to - from) * walked) / total;
   });
};

export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";

export const WHITE_03 = "rgba(255,255,255,0.03)";
export const WHITE_05 = "rgba(255,255,255,0.05)";
export const WHITE_07 = "rgba(255,255,255,0.07)";
export const WHITE_10 = "rgba(255,255,255,0.10)";
export const WHITE_14 = "rgba(255,255,255,0.14)";
export const WHITE_22 = "rgba(255,255,255,0.22)";
export const WHITE_35 = "rgba(255,255,255,0.35)";
export const WHITE_55 = "rgba(255,255,255,0.55)";

/** Opaque stand-in for a 3% white panel, for faces that cover or overlap. */
export const PANEL_SOLID = "#10181c";
export const PANEL_RX = 30;

/* The fetch stage the three card actions share (QueryStage.tsx). */
export const QUERY = { x: 136, y: 300, w: 300, h: 280 };
/** The response leaves from the query panel's right edge, at its middle. */
export const QUERY_OUT: Point = [QUERY.x + QUERY.w, QUERY.y + QUERY.h / 2];
/** Cycle seconds the first response packet leaves and lands. */
export const SEND_AT = 1;
export const LAND_AT = 1.6;
/** Extra delay per additional card the same run renders. */
export const SEND_STAGGER = 0.15;

export interface PipelineProps {
   tint: string;
}

/** Mono micro-label text, 8.5 px uppercase. */
export const labelText = (color: string): CSSProperties => ({
   fontFamily: MONO_FONT,
   fontSize: 8.5,
   fontWeight: 600,
   lineHeight: 1,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   whiteSpace: "nowrap",
   color,
});
