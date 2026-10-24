/**
 * Claude Cost Optimizer (36): what one Claude Code session pays per turn and
 * the levers that cut it. Right, six turns as columns: the output band at the
 * foot and the cache read on top, climbing turn by turn as the cached prefix
 * is read back; a dashed cap keeps each column's full bill. Left, the four
 * levers in a two by two, numbered in dots: trim CLAUDE.md, prune MCP
 * servers, cost-mode, Haiku routing. The pointer picks a lever (tested on the
 * rest tops): it and the levers before it engage in order, and the columns
 * shrink to the new bill one after another, nearest the levers first. At rest
 * CLAUDE.md is trimmed and the last turn's cache read is the bright mark.
 * Intensity is the delay per column.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, mk, now, place,
   pointer, poly, proj, put, register, ringAt, rrect, slab, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [LH, PUSH, OUT, CAP, STICK, R2] = [2.4, 3.5, 4, 30, 8, Math.SQRT1_2];
/** A point by screen column u and depth w, to plan x and y. */
const at = (u: number, w: number): Vec2 => [(u + w) * R2, (w - u) * R2];
const COLS = [0, 1, 2, 3, 4, 5].map((k) => at(-20 + k * 17, -6 + k * 2));
const READ = COLS.map((_, k) => 5 + k * 6.2);
const LEVERS = [0, 1, 2, 3].map((k): Vec2 => [
   -62 + (k % 2) * 13,
   8 + (k >> 1) * 13,
]);
const TAGS = ["CLAUDE.md", "MCP prune", "cost-mode", "/model haiku"];
/** Each lever's cut, cumulative: [cache read, output]. Haiku costs a third. */
const CUT: [number, number][] = [
   [1, 1],
   [0.7, 1],
   [0.42, 1],
   [0.42, 0.45],
   [0.14, 0.15],
];
const box = ([x, y]: Vec2, h: number) => rrect(x - h, y - h, x + h, y + h, 2.2);
const RINGS = COLS.map((c) => box(c, 5));
const LRING = LEVERS.map((c) => box(c, 5));
const EXTENT: Vec3[] = [
   ...RINGS.flat().map((q): Vec3 => [q.u, q.v, 0]),
   ...LRING.flat().map((q): Vec3 => [q.u, q.v, LH + PUSH]),
   [COLS[5][0], COLS[5][1], OUT + READ[5]],
];

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = LEVERS.map(([x, y]) => P(x, y, LH));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** CLAUDE.md, cost-mode, then Haiku, then away. */
export const tour: Tour = (({ spot }) => [spot[0], spot[2], spot[3], null])(
   camera(frame),
);

/** Delay per column in ms: 30 at intensity 0, 120 at 1. */
const per = (v: number) => 30 + v * 90;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = per(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The levers, back to front, each numbered in dots on its lid.
   const levers = LEVERS.map((_, k) => ({
      s: solid(g),
      d: Array.from({ length: k + 1 }, () => flatDot(g, C, 0.9, "dot m")),
   }));
   const lin = LRING.map((r) => inset(C, r, 0.9));
   // Columns left to right, which is back to front here: each one's dashed cap, then its two bands.
   const cols = COLS.map((_, k) => {
      const cap = poly(ringAt(P, RINGS[k], OUT + READ[k]));
      mk("path", { d: cap, class: "nf lo dash" }, g);
      return { out: solid(g), read: solid(g) };
   });
   const cin = RINGS.map((r) => inset(C, r, 0.9));

   const lz = LEVERS.map((_, k) => tween(k === 0 ? 1 : 0));
   const cr = COLS.map(() => tween(CUT[1][0]));
   const co = COLS.map(() => tween(1));
   const drawn = { l: LEVERS.map(() => NaN), c: COLS.map(() => "") };

   const B = register(stage, (_dt, t) => {
      let moving = false;
      LEVERS.forEach(([x, y], k) => {
         const z = LH + tval(lz[k], t) * PUSH;
         if (z !== drawn.l[k]) {
            drawn.l[k] = z;
            put(levers[k].s, slab(P, front, LRING[k], lin[k], 0, z));
            const d = levers[k].d;
            d.forEach((e, j) =>
               place(e, P(x + (j - (d.length - 1) / 2) * 2.6, y, z)),
            );
         }
         moving ||= !tdone(lz[k], t);
      });
      COLS.forEach((_, k) => {
         const o = Math.max(0.8, OUT * tval(co[k], t));
         const r = Math.max(0.8, READ[k] * tval(cr[k], t));
         if (`${o} ${r}` !== drawn.c[k]) {
            drawn.c[k] = `${o} ${r}`;
            put(cols[k].out, slab(P, front, RINGS[k], null, 0, o));
            put(cols[k].read, slab(P, front, RINGS[k], cin[k], o, o + r));
         }
         moving ||= !tdone(cr[k], t) || !tdone(co[k], t);
      });
      return moving;
   });
   bag.add(B.unregister);
   cols[5].read.sil.classList.add("hi");

   // Hit test on the levers' rest tops, sticky by STICK.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   /** Engages levers 0 to a in order (-1: rest, CLAUDE.md trimmed), then the columns follow, nearest first. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      const n = a < 0 ? 0 : a;
      LEVERS.forEach((_, k) => {
         tset(lz[k], k <= n ? 1 : 0, t, (k <= n ? k : 3 - k) * step);
         levers[k].s.sil.classList.toggle("hi", k === a);
      });
      cols[5].read.sil.classList.toggle("hi", a < 0);
      const [r, o] = CUT[n + 1];
      COLS.forEach((_, k) => {
         tset(cr[k], r, t, (n + 1 + k) * step);
         tset(co[k], o, t, (n + 1 + k) * step);
      });
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   const move = (p: Vec2) => setActive(hit(p));
   bag.add(pointer(stage, { move, leave: () => setActive(-1) }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = per(v)), destroy: bag.dispose };
};
