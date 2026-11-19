/* Pictionary: the board. Ported from the footer lab's draft
   (pictionary-night/board.js): a marker line draws each doodle in white, the
   newest stroke in blue, with a blue pen dot leading it. Also here: the
   resting recap and the envelope that flies to the email control.

   Every animation goes through fx (the scene's tracked set), so the board
   pauses and resumes with the cast. The ink is SVG, which animates on the
   main thread: the stroke and the pen dot run on a steps() timing of at
   most 60 updates a second, whatever the display's refresh rate is, and
   fades run on HTML wrappers (compositor) instead of on SVG nodes. */

import { EASING } from "@/constants/theme";
import { decor, el, svg } from "./dom";
import type { Fx } from "./fx";

const EASE_STD = `cubic-bezier(${EASING.standard.join(", ")})`;
const EASE_OUT = `cubic-bezier(${EASING.cinematic.join(", ")})`;
/** The marker's pace along a stroke: cubic-bezier(0.45, 0.05, 0.4, 1). */
const DRAW = [0.45, 0.05, 0.4, 1] as const;
/** Updates a second at most for anything animated on an SVG node. */
const MAX_FPS = 60;
/** The drawing area's width over its height. */
const RATIO = 1.6;
/* The envelope's flight, at the draft's pace: a beat where it lifts and
   shrinks, then the trip, as long as the draft's straight one, or longer by
   up to TRIP_MAX times for a longer path (around the players). */
const LIFT_MS = 252;
const LIFT_PX = 6;
const TRIP_MS = 798;
const TRIP_MAX = 1.6;
/** Corner radii of the path: the turn down and the turn into the control. */
const TURN_DOWN = 40;
const TURN_IN = 24;

export const DOODLE_IDS = ["cloud", "containers", "pipeline", "email"] as const;
export type DoodleId = (typeof DOODLE_IDS)[number];
/** The envelope: the doodle that flies to the email control. */
export const LAST = DOODLE_IDS.length - 1;

/* The four doodles in a 320 x 200 box, drawn clean here and roughened once.
   Each stroke is [path, ms] (relative weights; the show scales every doodle
   to one drawing time). The words that go with them are copy
   (footer.scenes.pictionary.doodles in data/ui.json). */
const STROKES: Record<DoodleId, readonly (readonly [d: string, ms: number])[]> =
   {
      cloud: [
         [
            "M98 112C72 113 64 86 88 77C84 54 112 42 132 56C140 32 190 28 200 56C222 46 248 66 238 86C258 92 252 114 228 112Z",
            1250,
         ],
         ["M163 186L163 101", 380],
         ["M147 117L163 99L179 117", 260],
      ],
      containers: [
         ["M62 78L234 78L234 150L62 150Z", 760],
         ["M62 78L92 58L264 58L264 128L234 150M234 78L264 58", 560],
         [
            "M80 86L80 142M97 86L97 142M114 86L114 142M131 86L131 142M148 86L148 142M165 86L165 142M182 86L182 142M199 86L199 142M216 86L216 142",
            720,
         ],
         ["M244 74L244 140M254 68L254 132", 240],
         [
            "M40 174C52 166 64 166 76 174C88 182 100 182 112 174C124 166 136 166 148 174C160 182 172 182 184 174C196 166 208 166 220 174C232 182 244 182 256 174C268 166 280 166 288 172",
            560,
         ],
      ],
      pipeline: [
         [
            "M49 92L87 92Q96 92 96 101L96 131Q96 140 87 140L49 140Q40 140 40 131L40 101Q40 92 49 92Z",
            380,
         ],
         ["M102 116L126 116M117 108L126 116L117 124", 230],
         [
            "M141 92L179 92Q188 92 188 101L188 131Q188 140 179 140L141 140Q132 140 132 131L132 101Q132 92 141 92Z",
            380,
         ],
         ["M194 116L218 116M209 108L218 116L209 124", 230],
         [
            "M233 92L271 92Q280 92 280 101L280 131Q280 140 271 140L233 140Q224 140 224 131L224 101Q224 92 233 92Z",
            380,
         ],
         ["M239 117L249 127L266 105", 240],
         ["M252 86C252 34 68 34 68 84M59 74L68 86L77 74", 640],
      ],
      email: [
         ["M86 60L234 60L234 150L86 150Z", 880],
         ["M88 62L160 114L232 62", 520],
         ["M88 148L140 104M232 148L180 104", 420],
      ],
   };

/* ---- hand-drawn wobble ---- */

type Point = [x: number, y: number];
interface Extent {
   x0: number;
   y0: number;
   x1: number;
   y1: number;
}
const emptyExtent = (): Extent => ({
   x0: Infinity,
   y0: Infinity,
   x1: -Infinity,
   y1: -Infinity,
});

function seeded(seed: number): () => number {
   return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
   };
}
const round1 = (v: number): number => Math.round(v * 10) / 10;

// A smooth curve through the points (Catmull-Rom as cubic Beziers).
function smooth(p: readonly Point[]): string {
   let d = `M${round1(p[0][0])} ${round1(p[0][1])}`;
   for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] ?? p2;
      d += `C${round1(p1[0] + (p2[0] - p0[0]) / 6)} ${round1(p1[1] + (p2[1] - p0[1]) / 6)} ${round1(p2[0] - (p3[0] - p1[0]) / 6)} ${round1(p2[1] - (p3[1] - p1[1]) / 6)} ${round1(p2[0])} ${round1(p2[1])}`;
   }
   return d;
}
// The point `by` units past q0, on the line from q1 through q0.
function extend(q0: Point, q1: Point, by: number): Point {
   const dx = q0[0] - q1[0];
   const dy = q0[1] - q1[1];
   const l = Math.hypot(dx, dy) || 1;
   return [q0[0] + (dx / l) * by, q0[1] + (dy / l) * by];
}
// One clean stroke as a marker would draw it: a slow wobble across the
// line, and ends that run a little long. `probe` measures the clean path;
// `seen` grows to hold every point drawn.
function roughen(
   d: string,
   rand: () => number,
   probe: SVGPathElement,
   seen: Extent,
   amp = 1.3,
): string {
   return (d.match(/M[^M]+/g) ?? [])
      .map((sub) => {
         probe.setAttribute("d", sub);
         const len = probe.getTotalLength();
         const closed = /z\s*$/i.test(sub);
         const n = Math.max(3, Math.round(len / 5));
         const ph = rand() * 100;
         const ph2 = rand() * 100;
         const pts: Point[] = [];
         for (let i = 0; i <= n; i++) {
            const s = (len * i) / n;
            const a = probe.getPointAtLength(Math.max(0, s - 0.6));
            const b = probe.getPointAtLength(Math.min(len, s + 0.6));
            const p = probe.getPointAtLength(s);
            let tx = b.x - a.x;
            let ty = b.y - a.y;
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            const wob =
               amp *
               (0.65 * Math.sin(s * 0.05 + ph) +
                  0.35 * Math.sin(s * 0.13 + ph2));
            pts.push([p.x - ty * wob, p.y + tx * wob]);
         }
         if (closed) {
            // run a little past the start, off the first pass, like a marker does
            for (let k = 1; k <= 2; k++)
               pts.push([pts[k][0] + 1.3, pts[k][1] + 1.5]);
         } else {
            pts.unshift(extend(pts[0], pts[1], 1 + rand() * 1.5));
            pts.push(
               extend(
                  pts[pts.length - 1],
                  pts[pts.length - 2],
                  1.5 + rand() * 2.5,
               ),
            );
         }
         for (const [x, y] of pts) {
            seen.x0 = Math.min(seen.x0, x);
            seen.y0 = Math.min(seen.y0, y);
            seen.x1 = Math.max(seen.x1, x);
            seen.y1 = Math.max(seen.y1, y);
         }
         return smooth(pts);
      })
      .join("");
}

interface InkArt {
   /** Per doodle, one roughened path per stroke. */
   rough: readonly (readonly string[])[];
   /** Per doodle, the box its points fill. */
   extents: readonly Extent[];
   /** The ink's viewBox: x, y, width, height. */
   box: readonly [x: number, y: number, width: number, height: number];
   /** The lowest point any doodle reaches, as a fraction of the ink's
       height (with half the marker's width): jumps under the board keep
       their fists below it. */
   bottom: number;
}
// The same for every mount (the wobble is seeded), so it is made once.
let inkArt: InkArt | null = null;

function makeInkArt(host: Element): InkArt {
   // Path lengths and points come from the browser: a zero-size probe that
   // is in the page only while the art is made.
   const probe = svg("path");
   const probeSvg = decor(svg("svg", { width: 0, height: 0 }, probe));
   probeSvg.style.cssText =
      "position:absolute;width:0;height:0;overflow:hidden";
   host.append(probeSvg);
   const extents = DOODLE_IDS.map(emptyExtent);
   const rough = DOODLE_IDS.map((id, i) => {
      const rand = seeded(1031 + i * 7919);
      return STROKES[id].map(([d]) => roughen(d, rand, probe, extents[i]));
   });
   probeSvg.remove();
   // The box every doodle fits in, padded for the marker's width and fitted
   // to the board's 16:10 drawing area: the ink's viewBox, so the doodles
   // fill the board instead of a third of it.
   const x0 = Math.min(...extents.map((e) => e.x0)) - 3;
   const y0 = Math.min(...extents.map((e) => e.y0)) - 3;
   const x1 = Math.max(...extents.map((e) => e.x1)) + 3;
   const y1 = Math.max(...extents.map((e) => e.y1)) + 3;
   const width = Math.max(x1 - x0, (y1 - y0) * RATIO);
   const height = width / RATIO;
   const box = [
      round1((x0 + x1 - width) / 2),
      round1((y0 + y1 - height) / 2),
      round1(width),
      round1(height),
   ] as const;
   return { rough, extents, box, bottom: (y1 - 1 - box[1]) / box[3] };
}

// y for x on cubic-bezier(x1, y1, x2, y2).
function bezier(
   x1: number,
   y1: number,
   x2: number,
   y2: number,
): (x: number) => number {
   const at = (a: number, b: number, t: number): number =>
      3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
   return (x) => {
      let lo = 0;
      let hi = 1;
      for (let k = 0; k < 24; k++) {
         const mid = (lo + hi) / 2;
         if (at(x1, x2, mid) < x) lo = mid;
         else hi = mid;
      }
      return at(y1, y2, (lo + hi) / 2);
   };
}
const drawPace = bezier(...DRAW);
/** The envelope's pace along its path: the draft's sideways ease. */
const tripPace = bezier(0.4, 0, 0.3, 1);
// A steps() timing of at most MAX_FPS updates a second over `ms`.
const stepped = (ms: number): number =>
   Math.max(1, Math.floor((ms * MAX_FPS) / 1000));

const noop = (): void => {};

type Pt = readonly [x: number, y: number];
/** Where the envelope goes down to the control, in viewport px: its
    centre's x on the way down and its width there. */
export interface Lane {
   x: number;
   w: number;
}
/* A path through `pts` with each inner corner k rounded by a quadratic
   curve `radius[k - 1]` px either side of it. at(d) is the point d px along
   it; turns[k] is how far along the curve of corner k + 1 begins. */
function route(
   pts: readonly Pt[],
   radius: readonly number[],
): { len: number; turns: number[]; at: (d: number) => Pt } {
   const line: Pt[] = [pts[0]];
   const lens = [0];
   const turns: number[] = [];
   const push = (p: Pt): void => {
      const [x, y] = line[line.length - 1];
      lens.push(lens[lens.length - 1] + Math.hypot(p[0] - x, p[1] - y));
      line.push(p);
   };
   const toward = (from: Pt, to: Pt, d: number): Pt => {
      const l = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
      return [
         from[0] + ((to[0] - from[0]) * d) / l,
         from[1] + ((to[1] - from[1]) * d) / l,
      ];
   };
   for (let k = 1; k < pts.length - 1; k++) {
      const c = pts[k];
      const a = toward(c, pts[k - 1], radius[k - 1]);
      const b = toward(c, pts[k + 1], radius[k - 1]);
      push(a);
      turns.push(lens[lens.length - 1]);
      for (let i = 1; i <= 12; i++) {
         const t = i / 12;
         const u = 1 - t;
         push([
            u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
            u * u * a[1] + 2 * u * t * c[1] + t * t * b[1],
         ]);
      }
   }
   push(pts[pts.length - 1]);
   const len = lens[lens.length - 1];
   const at = (d: number): Pt => {
      let i = 1;
      while (i < lens.length - 1 && lens[i] < d) i++;
      const t = Math.min(
         1,
         Math.max(0, (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1)),
      );
      const [x0, y0] = line[i - 1];
      const [x1, y1] = line[i];
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
   };
   return { len, turns, at };
}

interface Doodle {
   /** The HTML wrapper: fades run on it. */
   layer: HTMLElement;
   paths: SVGPathElement[];
}

export interface Board {
   readonly el: HTMLElement;
   /** Sizes the ink for a board `width` x `height` px: `pad` is the room
       kept clear above and below it, `px` the marker's width on screen.
       Returns the lowest line any doodle draws, in px below the board's top
       edge. */
   fit(
      width: number,
      height: number,
      pad: readonly [top: number, bottom: number],
      px: number,
   ): number;
   /** Draws doodle i in `total` ms; `wait` is the stage's pausable delay. */
   draw(
      i: number,
      total: number,
      wait: (ms: number) => Promise<void>,
   ): Promise<void>;
   /** Someone got it early: every stroke left shows at once. */
   finish(): void;
   /** Wipes the doodle off. */
   clear(): void;
   /** Reduced: doodle i fully drawn. */
   still(i: number): void;
   /** The resting board: three doodles, small, with their words. */
   showRecap(instant: boolean): void;
   /** An empty board, nothing in the air. */
   reset(): void;
   /** The doodle on the board shrinks and flies to `target` (a box in
       viewport coordinates): out to the side, down `lane` and into the
       target's left end from the side. Returns the flight's length in ms,
       0 when there is nothing to fly. */
   fly(target: DOMRect, lane: Lane): number;
   /** Ends a flight now (the scene is hidden or leaving). */
   land(): void;
}

/** Builds the board. `host` is in the page already (the art is measured in
    it once); `label` and `words` (one per doodle) are copy. */
export function createBoard(
   host: Element,
   label: string,
   words: readonly string[],
   fx: Fx,
): Board {
   const art = (inkArt ??= makeInkArt(host));
   const viewBox = art.box.join(" ");

   const pen = svg("circle", { class: "pn-pen", cx: 0, cy: 0, r: 4.6 });
   const ink = el("div", "pn-ink", svg("svg", { viewBox }, pen));
   // The resting board: cloud, containers, pipeline, small, with their words.
   const recap = el(
      "div",
      "pn-recap",
      ...[0, 1, 2].map((i) =>
         el(
            "div",
            "pn-recap-item",
            svg(
               "svg",
               { viewBox: "30 24 260 170" },
               ...art.rough[i].map((d) => svg("path", { d })),
            ),
            el("span", "pn-recap-word", words[i]),
         ),
      ),
   );
   const board = decor(
      el(
         "div",
         "pn-board",
         el("span", "pn-label", label),
         ink,
         recap,
         el("i", "pn-tray"),
      ),
   );

   let current: Doodle | null = null;
   // The stroke being drawn, and its two animations (the line, the pen).
   let drawing: SVGPathElement | null = null;
   let strokeAnims: Animation[] = [];
   let flight: { el: HTMLElement; anims: Animation[] } | null = null;
   let strokeWidth = 3.3; // in the ink's own units, set by fit()

   function doodle(i: number): Doodle {
      const paths = art.rough[i].map((d) => svg("path", { d, pathLength: 1 }));
      const layer = el("div", "pn-doodle", svg("svg", { viewBox }, ...paths));
      ink.prepend(layer); // under the pen
      return { layer, paths };
   }
   function penUp(): void {
      drawing = null;
      for (const a of strokeAnims) a.cancel();
      strokeAnims = [];
      pen.style.opacity = "0";
   }
   function stroke(paths: SVGPathElement[], k: number, ms: number): void {
      if (k > 0) paths[k - 1].classList.remove("pn-new");
      const p = paths[k];
      p.classList.add("pn-on", "pn-new");
      p.style.strokeDashoffset = "0";
      // One keyframe per step, on a steps() clock: the line and the pen dot
      // update together, MAX_FPS times a second at most.
      const steps = stepped(ms);
      const len = p.getTotalLength();
      const line: Keyframe[] = [];
      const dot: Keyframe[] = [];
      for (let s = 0; s <= steps; s++) {
         const done = drawPace(s / steps);
         const pt = p.getPointAtLength(done * len);
         line.push({ strokeDashoffset: 1 - done });
         dot.push({
            transform: `translate(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px)`,
         });
      }
      const timing = { duration: ms, easing: `steps(${steps}, end)` };
      pen.style.transform = String(dot[dot.length - 1].transform);
      pen.style.opacity = "1";
      drawing = p;
      const a = fx.run(p, line, timing);
      strokeAnims = [a, fx.run(pen, dot, timing)];
      a.finished.then(() => {
         if (drawing !== p) return;
         drawing = null;
         strokeAnims = [];
         pen.style.opacity = "0";
      }, noop);
   }
   async function draw(
      i: number,
      total: number,
      wait: (ms: number) => Promise<void>,
   ): Promise<void> {
      const d = doodle(i);
      current = d;
      const strokes = STROKES[DOODLE_IDS[i]];
      const sum = strokes.reduce((s, [, ms]) => s + ms, 0);
      for (let k = 0; k < d.paths.length; k++) {
         if (current !== d || d.paths[k].classList.contains("pn-on")) return;
         const ms = (strokes[k][1] * total) / sum;
         stroke(d.paths, k, ms);
         await wait(ms + 90);
      }
   }
   function finish(): void {
      const d = current;
      if (!d) return;
      penUp();
      for (const p of d.paths) {
         p.style.strokeDashoffset = "0";
         if (!p.classList.contains("pn-on")) {
            p.classList.add("pn-on");
            fx.run(p, [{ opacity: 0, easing: EASE_STD }, { opacity: 1 }], {
               duration: 220,
               easing: `steps(${stepped(220)}, end)`,
            });
         }
         p.classList.remove("pn-new");
      }
      d.paths[d.paths.length - 1].classList.add("pn-new");
   }
   function clear(): void {
      const d = current;
      current = null;
      penUp();
      if (!d) return;
      const remove = (): void => d.layer.remove();
      fx.run(d.layer, [{ opacity: 1 }, { opacity: 0 }], {
         duration: 320,
         easing: EASE_STD,
         fill: "forwards",
      }).finished.then(remove, remove);
   }
   function land(): void {
      const f = flight;
      if (!f) return;
      flight = null;
      for (const a of f.anims) a.cancel();
      f.el.remove();
   }
   function reset(): void {
      land();
      penUp();
      for (const layer of ink.querySelectorAll(".pn-doodle")) layer.remove();
      current = null;
      recap.style.opacity = "0";
   }
   function still(i: number): void {
      reset();
      const d = doodle(i);
      for (const p of d.paths) {
         p.classList.add("pn-on");
         p.style.strokeDashoffset = "0";
      }
      d.paths[d.paths.length - 1].classList.add("pn-new");
      current = d;
   }
   function showRecap(instant: boolean): void {
      recap.style.opacity = "1";
      if (instant) return;
      fx.run(
         recap,
         [
            { opacity: 0, transform: "translateY(6px)" },
            { opacity: 1, transform: "none" },
         ],
         { duration: 600, easing: EASE_OUT },
      );
   }
   function fit(
      width: number,
      height: number,
      pad: readonly [top: number, bottom: number],
      px: number,
   ): number {
      const room = height - pad[0] - pad[1];
      const inkH = Math.max(
         1,
         Math.floor(Math.min(room, (width - 16) / RATIO)),
      );
      const top = Math.round(pad[0] + (room - inkH) / 2);
      strokeWidth = (px * art.box[3]) / inkH;
      board.style.setProperty("--pn-ink-t", `${top}px`);
      board.style.setProperty("--pn-ink-h", `${inkH}px`);
      board.style.setProperty("--pn-ink-w", `${strokeWidth.toFixed(2)}px`);
      pen.setAttribute("r", (strokeWidth * 1.4).toFixed(1));
      return top + inkH * art.bottom;
   }

   /* The one node the scene puts outside its own element: the stage clips
      its content and the email control is below it, so the envelope crosses
      as a fixed layer on the body. It is removed when it lands, by land()
      and by reset(). */
   function fly(target: DOMRect, lane: Lane): number {
      const d = current;
      if (!d) return 0;
      land();
      penUp();
      const sr = ink.getBoundingClientRect();
      // Where the envelope is on screen, from the art's own numbers.
      const box = art.extents[LAST];
      const scale = sr.width / art.box[2];
      const ex = ((box.x0 + box.x1) / 2 - art.box[0]) * scale;
      const ey = ((box.y0 + box.y1) / 2 - art.box[1]) * scale;
      const ew = Math.max(1, (box.x1 - box.x0) * scale);
      const picture = svg(
         "svg",
         { viewBox },
         ...art.rough[LAST].map((path) => svg("path", { d: path })),
      );
      picture.style.strokeWidth = `${(strokeWidth * 1.09).toFixed(2)}px`;
      const inner = el("div", "pn-fly-inner", picture);
      inner.style.transformOrigin = `${ex.toFixed(1)}px ${ey.toFixed(1)}px`;
      const outer = decor(el("div", "pn-fly", inner));
      outer.style.left = `${sr.left}px`;
      outer.style.top = `${sr.top}px`;
      outer.style.width = `${sr.width}px`;
      outer.style.height = `${sr.height}px`;
      document.body.append(outer);
      d.layer.style.opacity = "0";
      // It lifts and shrinks, then goes out sideways at that height (over
      // the players' heads), down the lane (beside the players and the end
      // line's words), and into the control's round left end (the ring on
      // desktop, the knob on phones) from the side, landing about half as
      // tall as the control. Its size: the lane's width by the turn down,
      // the landing size from the turn in.
      const cx = sr.left + ex;
      const cy = sr.top + ey;
      const start: Pt = [cx, cy - LIFT_PX];
      const end: Pt = [
         target.left + target.height / 2,
         target.top + target.height / 2,
      ];
      const drop = Math.abs(end[1] - start[1]) / 3;
      const path = route(
         [start, [lane.x, start[1]], [lane.x, end[1]], end],
         [
            Math.min(TURN_DOWN, Math.abs(start[0] - lane.x) / 2, drop),
            Math.min(TURN_IN, Math.abs(end[0] - lane.x) / 2, drop),
         ],
      );
      const [down, turnIn] = path.turns;
      const lifted = 0.7;
      const narrow = Math.min(lifted, lane.w / ew);
      const landed = Math.max(0.06, (target.height * 0.5) / ew);
      const sizeAt = (at: number): number => {
         if (at < down) return lifted + ((narrow - lifted) * at) / down;
         if (at < turnIn) return narrow;
         return (
            narrow +
            ((landed - narrow) * (at - turnIn)) / (path.len - turnIn || 1)
         );
      };
      const straight = Math.hypot(end[0] - start[0], end[1] - start[1]) || 1;
      const trip =
         TRIP_MS * Math.min(TRIP_MAX, Math.max(1, path.len / straight));
      const total = LIFT_MS + trip;
      const lift = LIFT_MS / total;
      // Transforms only (the compositor): one keyframe per sample of the
      // path, the pace in where along it each one sits.
      const frames: Keyframe[] = [
         { translate: "0px 0px", scale: "1", easing: EASE_OUT },
      ];
      const SAMPLES = 48;
      for (let k = 0; k <= SAMPLES; k++) {
         const at = path.len * tripPace(k / SAMPLES);
         const [x, y] = path.at(at);
         frames.push({
            offset: lift + ((1 - lift) * k) / SAMPLES,
            translate: `${(x - cx).toFixed(1)}px ${(y - cy).toFixed(1)}px`,
            scale: sizeAt(at).toFixed(3),
         });
      }
      const flown = fx.run(inner, frames, {
         duration: total,
         fill: "forwards",
      });
      const mine = { el: outer, anims: [flown] };
      flight = mine;
      // Landed, or cut short: either way the envelope is off the board.
      const done = (): void => {
         outer.remove();
         d.layer.remove();
         if (current === d) current = null;
         if (flight === mine) flight = null;
      };
      flown.finished.then(done, done);
      return total;
   }

   return {
      el: board,
      fit,
      draw,
      finish,
      clear,
      still,
      showRecap,
      reset,
      fly,
      land,
   };
}
