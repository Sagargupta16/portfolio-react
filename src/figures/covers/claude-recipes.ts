/**
 * Claude Code Recipes (35): copy-paste recipes dropping into a project's
 * `.claude/` tree. A plate holds the tree: the root tile, its trunk and one
 * elbow to each folder (commands, agents, hooks, skills), each a low bin
 * with a slot in its lid and its number in dots on the plate. Over every
 * bin a recipe card hovers, carrying the same dots. The pointer picks a
 * folder (by screen x, against the rest poses): the branch from the root to
 * it draws, its card drops into the slot and takes the bright edge, and the
 * other cards lift away, staggered by distance. At rest the commands card
 * is half way down, bright. Intensity is the stagger step.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   now, open, part, place, poly, proj, put, register, ringAt, rrect, slab,
   solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [BH, CT, LIFT, PT, HB, HC, TY] = [4, 1.6, 5, 3, 9, 7.5, -6];
const BINS: Vec2[] = [0, 1, 2, 3].map((i) => [14 + i * 32, 24]);
/** Card heights at rest: uneven, the commands card nearly home. */
const REST = [7, 13, 16, 11];
const TAGS = ["commands/", "agents/", "hooks/", "skills/"];
const PLATE = rrect(-40, -20, 128, 44, 8, 8);
const ROOT = circ(8, 48).map((q) => ({ ...q, u: q.u - 22, v: q.v + TY }));
const RTOP = -14;
/** Each folder's route from the root: along the trunk, then down its elbow. */
const ROUTES: Vec2[][] = BINS.map(([x, y]) => [
   [RTOP, TY],
   [x, TY],
   [x, y - HB],
]);
/** The tree drawn once, dim: the trunk and the four elbows. */
const TREE: Vec2[][] = [
   [
      [RTOP, TY],
      [BINS[3][0], TY],
   ],
   ...BINS.map(([x, y]): Vec2[] => [
      [x, TY],
      [x, y - HB],
   ]),
];
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   BINS.flatMap(([x, y], i): Vec3[] => [
      [x - HC, y - HC, REST[i] + LIFT + CT],
      [x + HC, y + HC, REST[i] + LIFT + CT],
   ]),
);

/** The camera fitted to a frame, and each bin's lid centre on screen: the hit spots. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   return { C, P, front: facing(C), spot: BINS.map(([x, y]) => P(x, y, BH)) };
}

export const frame = FRAMES.cover;
/** agents, hooks, skills, then away: left to right as a hand reads the tree. */
export const tour: Tour = ((s) => [s[1], s[2], s[3], null])(camera(frame).spot);

/** Where card i stands when folder a is picked (-1: rest). */
function height(a: number, i: number) {
   if (a < 0) return REST[i];
   return i === a ? BH : REST[i] + LIFT;
}

/** A row of n dots centred on (x, y), 3.4 apart. */
const row = (x: number, y: number, n: number): Vec2[] =>
   Array.from({ length: n }, (_, k) => [x + (k - (n - 1) / 2) * 3.4, y]);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = 30 + value * 30;
   let act = -1;
   const g = mk("g", {}, svg);

   // The plate, the dim tree on it, the lines that grow over it, each folder's dots, the root tile.
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   const tree = TREE.map((s) => open(s.map((q) => P(q[0], q[1], 0))));
   mk("path", { d: tree.join(""), class: "nf lo" }, g);
   const scr = ROUTES.map((r) => r.map((q) => P(q[0], q[1], 0)));
   const lines = scr.map(() => mk("path", { class: "nf sil" }, g));
   BINS.forEach(([x, y], i) => {
      for (const q of row(x, y + HB + 4, i + 1))
         place(flatDot(g, C, 1.3, "dot off"), P(q[0], q[1], 0));
   });
   put(solid(g), slab(P, front, ROOT, inset(C, ROOT, 1), 0, 6));

   // Back to front along the row: a bin, its slot, then the card over it with its dots.
   const cards = BINS.map(([x, y], i) => {
      const ring = rrect(x - HB, y - HB, x + HB, y + HB, 3, 6);
      put(solid(g), slab(P, front, ring, null, 0, BH));
      const slot = rrect(
         x - HC - 0.6,
         y - HC - 0.6,
         x + HC + 0.6,
         y + HC + 0.6,
         2.4,
      );
      mk("path", { d: poly(ringAt(P, slot, BH)), class: "nf lo" }, g);
      const cg = mk("g", {}, g);
      const card = rrect(x - HC, y - HC, x + HC, y + HC, 2.2, 6);
      const el = solid(cg);
      const dots = row(x, y + 3.4, i + 1).map((q) => ({
         q,
         e: flatDot(cg, C, 1.1, "dot m"),
      }));
      return { ring: card, inner: inset(C, card, 1), el, dots };
   });

   const z = REST.map((r) => tween(r));
   const l = BINS.map(() => tween(0));
   const drawn = BINS.map(() => ({ z: Number.NaN, l: Number.NaN }));
   const B = register(stage, (_dt, t) => {
      let moving = false;
      cards.forEach((c, i) => {
         const [zi, li, was] = [tval(z[i], t), tval(l[i], t), drawn[i]];
         if (li !== was.l) {
            was.l = li;
            lines[i].setAttribute(
               "d",
               li > 0.002 ? open(part(scr[i], li)) : "",
            );
         }
         if (zi !== was.z) {
            was.z = zi;
            put(c.el, slab(P, front, c.ring, c.inner, zi, zi + CT));
            for (const d of c.dots) place(d.e, P(d.q[0], d.q[1], zi + CT));
         }
         moving ||= !tdone(z[i], t) || !tdone(l[i], t);
      });
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest row: the bin whose lid centre is nearest the pointer's x, inside the tree's band.
   const top = Math.min(...BINS.map(([x, y], i) => P(x, y, REST[i] + LIFT)[1]));
   const foot = P(BINS[3][0], BINS[3][1] + HB + 6, 0)[1];
   const hit = ([px, py]: Vec2) => {
      const d = spot.map((s) => Math.abs(s[0] - px));
      const best = d.indexOf(Math.min(...d));
      return d[best] < 34 && py > top - 24 && py < foot + 10 ? best : -1;
   };

   /** Drops card a into its folder (-1: back to rest), the others lifting away by distance. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const from = a < 0 ? act : a;
      cards.forEach((c, i) => {
         const delay = Math.abs(i - from) * step;
         tset(z[i], height(a, i), t, i === a ? step : delay);
         tset(l[i], i === a ? 1 : 0, t, 0);
         c.el.sil.classList.toggle("hi", i === Math.max(0, a));
      });
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }
   cards[0].el.sil.classList.add("hi");

   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = 30 + v * 30;
   };
   return { set, destroy: bag.dispose };
};
