import type { CSSProperties } from "react";
import { MONO_FONT } from "@/constants/theme";

/*
 * Stage kit shared by the Gate, Mcp and Plugin cover families.
 *
 * Geometry is drawn in a 320 x 200 SVG stage, the slot's own 16:10 ratio, so
 * it scales evenly (about 1.1 px per unit on a 343 to 370 px card). Packets,
 * status pips and labels are HTML at the same stage coordinates with fixed px
 * sizes. Compositions use x 26 to 294 and y 16 to 170: the card's bottom fade
 * starts at 72 percent of the slot height.
 *
 * Static hairlines keep a 1 px non-scaling stroke. Animated pathLength and
 * pathOffset strokes never do: Chrome measures the normalised dash in user
 * units but paints a non-scaling stroke in screen units, so a draw would stop
 * short. Every looped element that animates a stroke property also starts at
 * opacity 0, so the frozen Reduced frame hides it.
 */

export interface TintProps {
   tint: string;
}

export const GREEN = "#22c55e";
export const AMBER = "#f59e0b";
export const INK = "#0b1012";
export const W03 = "rgba(255,255,255,0.03)";
export const W06 = "rgba(255,255,255,0.06)";
export const W10 = "rgba(255,255,255,0.10)";
export const W16 = "rgba(255,255,255,0.16)";
export const W25 = "rgba(255,255,255,0.25)";
export const W40 = "rgba(255,255,255,0.4)";
export const W55 = "rgba(255,255,255,0.55)";
export const W70 = "rgba(255,255,255,0.7)";
export const NON_SCALING = "non-scaling-stroke";
export const STAGE_W = 320;
export const STAGE_H = 200;

export type Pt = readonly [number, number];
export type Box = readonly [x: number, y: number, w: number, h: number];

const round2 = (v: number) => Math.round(v * 100) / 100;

export const pctX = (x: number) => `${round2((x / STAGE_W) * 100)}%`;
export const pctY = (y: number) => `${round2((y / STAGE_H) * 100)}%`;

export const layer: CSSProperties = { position: "absolute", inset: 0 };

/* Back-layer textures at 4 to 6 percent white, static, px-sized cells. */
const HAIR = "rgba(255,255,255,0.045)";
export const DOTS: CSSProperties = {
   backgroundImage:
      "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.4px)",
   backgroundSize: "16px 16px",
};
export const GRID: CSSProperties = {
   backgroundImage: `linear-gradient(${HAIR} 1px, transparent 1px), linear-gradient(90deg, ${HAIR} 1px, transparent 1px)`,
   backgroundSize: "20px 20px",
};
export const RAILS: CSSProperties = {
   backgroundImage: `linear-gradient(${HAIR} 1px, transparent 1px)`,
   backgroundSize: "100% 18px",
};
export const COLUMNS: CSSProperties = {
   backgroundImage: `linear-gradient(90deg, ${HAIR} 1px, transparent 1px)`,
   backgroundSize: "22px 100%",
};

export const label: CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 8,
   fontWeight: 700,
   letterSpacing: 0.9,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

/* Fixed-px dot centred on a stage point. */
export const dotAt = (at: Pt, size: number, color: string): CSSProperties => ({
   position: "absolute",
   left: pctX(at[0]),
   top: pctY(at[1]),
   width: size,
   height: size,
   marginLeft: -size / 2,
   marginTop: -size / 2,
   borderRadius: "50%",
   background: color,
});

/* ---------- timeline ---------- */

export type Ease = "linear" | "easeInOut";

export interface Tracks {
   x?: (number | string)[];
   y?: (number | string)[];
   opacity?: number[];
   scale?: number[];
   scaleX?: number[];
   pathLength?: number[];
   pathOffset?: number[];
}

/* One repeating timeline; every track shares `times` (fractions of duration). */
export interface Loop extends Tracks {
   duration: number;
   times: number[];
   ease?: Ease;
}

export type Keys = Omit<Loop, "duration">;

/*
 * Motion hands opacity to WAAPI, where a single ease string stretches over the
 * whole iteration and drags keyframes off their `times`, while transforms and
 * stroke props ease per segment on the JS frameloop. One ease per segment
 * keeps every track on the storyboard clock.
 */
export const loopProps = ({
   duration,
   times,
   ease = "easeInOut",
   ...animate
}: Loop) => ({
   animate,
   transition: {
      duration,
      times,
      ease: times.slice(1).map(() => ease),
      repeat: Infinity,
   },
});

/* Bind a scene's cycle length once. */
export const clock =
   (duration: number) =>
   (keys: Keys): Loop => ({ ...keys, duration });

/* Opacity window: fades in at `on`, holds, is gone by `off`. */
export const shown = (on: number, off: number, ramp = 0.03): Keys => ({
   times: [0, on, on + ramp, off - ramp, off, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});

/* ---------- curves and routes ---------- */

export type Cubic = readonly [Pt, Pt, Pt, Pt];

const mix = (a: Pt, b: Pt, f: number): Pt => [
   a[0] + (b[0] - a[0]) * f,
   a[1] + (b[1] - a[1]) * f,
];

/* Cubic with horizontal tangents at both ports, an S between two edges. */
export const sCurve = (a: Pt, b: Pt): Cubic => {
   const k = (b[0] - a[0]) / 2;
   return [a, [a[0] + k, a[1]], [b[0] - k, b[1]], b];
};

/* Straight run as a cubic, so routes treat lines and curves alike. */
export const line = (a: Pt, b: Pt): Cubic => [
   a,
   mix(a, b, 1 / 3),
   mix(a, b, 2 / 3),
   b,
];

const fmt = ([x, y]: Pt) => `${round2(x)},${round2(y)}`;
export const curveD = ([a, c1, c2, b]: Cubic) =>
   `M${fmt(a)}C${fmt(c1)} ${fmt(c2)} ${fmt(b)}`;

const bezier = ([a, c1, c2, b]: Cubic, t: number): Pt => {
   const u = 1 - t;
   const w0 = u * u * u;
   const w1 = 3 * u * u * t;
   const w2 = 3 * u * t * t;
   const w3 = t * t * t;
   return [
      w0 * a[0] + w1 * c1[0] + w2 * c2[0] + w3 * b[0],
      w0 * a[1] + w1 * c1[1] + w2 * c2[1] + w3 * b[1],
   ];
};

const TABLE = 48;

/* Arc-length table for one cubic: total length and a point-at-length lookup. */
const measure = (c: Cubic) => {
   const pts = Array.from({ length: TABLE + 1 }, (_, i) =>
      bezier(c, i / TABLE),
   );
   const acc = [0];
   for (let i = 1; i <= TABLE; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      acc.push(acc[i - 1] + Math.hypot(x1 - x0, y1 - y0));
   }
   const length = acc[TABLE];
   const at = (f: number): Pt => {
      const target = f * length;
      let i = 1;
      while (i < TABLE && acc[i] < target) i++;
      const span = acc[i] - acc[i - 1] || 1;
      return mix(pts[i - 1], pts[i], (target - acc[i - 1]) / span);
   };
   return { length, at };
};

/* A continuous chain of cubics with one arc-length parameter over all of it. */
export interface Route {
   d: string;
   /* fraction of the whole route where each segment ends; the last is 1 */
   ends: number[];
   at: (s: number) => Pt;
}

export const route = (...segs: Cubic[]): Route => {
   const parts = segs.map(measure);
   const total = parts.reduce((sum, p) => sum + p.length, 0);
   const ends: number[] = [];
   let run = 0;
   for (const p of parts) {
      run += p.length;
      ends.push(run / total);
   }
   const at = (s: number): Pt => {
      /* past the last end (float drift at s = 1) means the last segment */
      let i = ends.findIndex((end) => s <= end);
      if (i === -1) i = ends.length - 1;
      const start = i === 0 ? 0 : ends[i - 1];
      return parts[i].at((s - start) / (ends[i] - start || 1));
   };
   const tail = segs
      .slice(1)
      .map(([, c1, c2, b]) => `C${fmt(c1)} ${fmt(c2)} ${fmt(b)}`)
      .join("");
   return { d: curveD(segs[0]) + tail, ends, at };
};

/* [time, route fraction]; equal fractions on consecutive stops hold. */
export type Stop = readonly [t: number, s: number];

interface Sample {
   t: number;
   s: number;
}

const SAMPLES = 6;
const easeInOut = (u: number) =>
   u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;

/* Ease between stops in route fraction, sampled so motion follows the curve. */
const sampleStops = (stops: readonly Stop[]): Sample[] => {
   const out: Sample[] = [{ t: stops[0][0], s: stops[0][1] }];
   for (let i = 1; i < stops.length; i++) {
      const [t0, s0] = stops[i - 1];
      const [t1, s1] = stops[i];
      const n = s0 === s1 ? 1 : SAMPLES;
      for (let j = 1; j <= n; j++) {
         out.push({
            t: t0 + ((t1 - t0) * j) / n,
            s: s0 + (s1 - s0) * easeInOut(j / n),
         });
      }
   }
   return out;
};

/* When a move from stop a to stop b passes fraction s, inverting the ease. */
export const passAt = ([t0, s0]: Stop, [t1, s1]: Stop, s: number): number => {
   const goal = (s - s0) / (s1 - s0);
   let lo = 0;
   let hi = 1;
   for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (easeInOut(mid) < goal) lo = mid;
      else hi = mid;
   }
   return t0 + ((t1 - t0) * (lo + hi)) / 2;
};

export const FADE = 0.025;

/*
 * Keyframes for a fixed-px packet riding a route. It fades in on its first
 * stop, travels and holds through the rest, fades out FADE after the last,
 * then slides home while hidden, so the loop closes without a visible jump.
 */
export const ride = (r: Route, stops: readonly Stop[]): Keys => {
   const path = sampleStops(stops);
   const first = path[0];
   const last = path[path.length - 1];
   const frames = [
      { t: 0, s: first.s, o: 0 },
      { t: first.t - FADE, s: first.s, o: 0 },
      ...path.map((p) => ({ ...p, o: 1 })),
      { t: last.t + FADE, s: last.s, o: 0 },
      { t: 1, s: first.s, o: 0 },
   ];
   return {
      times: frames.map((f) => f.t),
      x: frames.map((f) => pctX(r.at(f.s)[0])),
      y: frames.map((f) => pctY(r.at(f.s)[1])),
      opacity: frames.map((f) => f.o),
      ease: "linear",
   };
};

/*
 * Short fading trail behind the same packet: a dash of at most `len` that
 * grows from each departure, follows the head in either direction and
 * collapses into it on every hold.
 */
export const comet = (stops: readonly Stop[], len = 0.1): Keys => {
   const path = sampleStops(stops);
   let from = path[0].s;
   const dash = path.map((p, i) => {
      const prev = i === 0 ? p.s : path[i - 1].s;
      if (p.s === prev) from = p.s;
      const run = Math.min(len, Math.abs(p.s - from));
      return { t: p.t, length: run, offset: p.s > from ? p.s - run : p.s };
   });
   const home = path[0].s;
   const last = path[path.length - 1];
   /* the closing frames shrink the dash into the head, not its tail */
   const frames = [
      { t: 0, length: 0, offset: home, o: 0 },
      ...dash.map((d) => ({ ...d, o: 1 })),
      { t: last.t + FADE, length: 0, offset: last.s, o: 0 },
      { t: 1, length: 0, offset: home, o: 0 },
   ];
   return {
      times: frames.map((f) => f.t),
      pathLength: frames.map((f) => f.length),
      pathOffset: frames.map((f) => f.offset),
      opacity: frames.map((f) => f.o),
      ease: "linear",
   };
};

/*
 * The route lights up behind the packet (pathLength 0 to the furthest point
 * reached) and holds until `hold`, then fades and resets while hidden.
 */
export const lit = (stops: readonly Stop[], hold: number): Keys => {
   const path = sampleStops(stops);
   let reach = 0;
   const grown = path.map((p) => {
      reach = Math.max(reach, p.s);
      return { t: p.t, length: reach };
   });
   const frames = [
      { t: 0, length: 0, o: 0 },
      ...grown.map((g) => ({ ...g, o: 1 })),
      { t: hold, length: reach, o: 1 },
      { t: hold + FADE, length: reach, o: 0 },
      { t: 1, length: 0, o: 0 },
   ];
   return {
      times: frames.map((f) => f.t),
      pathLength: frames.map((f) => f.length),
      opacity: frames.map((f) => f.o),
      ease: "linear",
   };
};
