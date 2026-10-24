/**
 * Deploy Guide (32): pick a framework and a platform, then follow that
 * guide's numbered steps to a live deploy. A board holds the matrix: a row
 * of framework pucks along the back, a column of platform tiles down the
 * left, and between them a 4 x 3 grid of guide cells. The pointer picks a
 * cell (unprojected onto each cell's own rest top): its framework and
 * platform heads rise, the cell grows out of the board, the cells of its
 * row and column follow a little, staggered by distance, and its four step
 * dots light one by one before the cell takes the bright edge. At rest the
 * fastapi guide on Render stands up, its steps done, bright. Intensity is
 * the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, clamp, disposer, facing, fitFrame, flatDot, follow, inset,
   mk, now, place, proj, put, register, rrect, slab, solid, tdone, tset, tval,
   tween, unproj,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CH, GROW, HH, HR, PITCH, HALF] = [3, 3, 9, 5, 4, 20, 8];
const FW = ["react", "next", "fastapi", "django"];
const PF = ["pages", "vercel", "render"];
const HOME: Vec2 = [2, 2];
const BOARD = rrect(-26, -26, 76, 56, 8, 8);
const CELLS = FW.flatMap((_, i) => PF.map((_, j): Vec2 => [i, j]));
const ctr = ([i, j]: Vec2): Vec2 => [i * PITCH, j * PITCH];
const isHome = ([i, j]: Vec2) => i === HOME[0] && j === HOME[1];
/** A cell's rest height above the board: the home guide stands up. */
const restZ = (c: Vec2) => CH + (isHome(c) ? GROW : 0);
const puck = ([x, y]: readonly number[]): Ring =>
   circ(6.5, 40).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
/** The heads, [axis, index, centre]: framework pucks behind row 0, platform pucks left of column 0. */
const HEADS = [
   ...FW.map((_, i) => [0, i, [i * PITCH, -17]] as const),
   ...PF.map((_, j) => [1, j, [-17, j * PITCH]] as const),
];
const EXTENT = BOARD.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [-HALF, -HALF, CH + GROW + 2],
   [-6.5, -23.5, HH + HR],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C), front: facing(C) };
}

export const frame = FRAMES.cover;
/** react on Pages, next on Vercel, django on Render, then away. */
export const tour: Tour = ((P) => [
   ...[
      [0, 0],
      [1, 1],
      [3, 2],
   ].map(([i, j]) => P(i * PITCH, j * PITCH, CH)),
   null,
])(camera(frame).P);

/** Delay per hop in ms: 40 at intensity 0, 100 at 1. */
const hop = (v: number) => 40 + v * 60;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -PT, 0));

   // Heads and cells, back to front by x + y, so appending is painting.
   const part = (ring: Ring, d: number) => {
      const el = solid(g);
      return { ring, inner: inset(C, ring, 1), el, d, z: Number.NaN };
   };
   const heads = HEADS.map(([, , c]) => part(puck(c), c[0] + c[1]));
   const cells = CELLS.map((c) => {
      const [x, y] = ctr(c);
      const ring = rrect(x - HALF, y - HALF, x + HALF, y + HALF, 3, 6);
      return part(ring, x + y);
   });
   for (const p of [...heads, ...cells].sort((a, b) => a.d - b.d))
      g.appendChild(p.el.g);

   // The step dots ride the chosen cell's lid, moved into its group so they paint with it.
   const steps = mk("g", {}, g);
   const dots = [0, 1, 2, 3].map(() => flatDot(steps, C, 1.3, "dot off"));

   const hz = heads.map(() => tween(0));
   const cz = CELLS.map((c) => tween(restZ(c)));
   const on = dots.map(() => tween(1));
   let home = CELLS.findIndex(isHome);
   const drawn = { d: dots.map(() => Number.NaN), lit: dots.map(() => false) };

   const B = register(stage, (_dt, t) => {
      let moving = false;
      heads.forEach((h, k) => {
         const z = tval(hz[k], t) * HR;
         if (z !== h.z) put(h.el, slab(P, front, h.ring, h.inner, z, z + HH));
         h.z = z;
         moving ||= !tdone(hz[k], t);
      });
      cells.forEach((c, k) => {
         const z = tval(cz[k], t);
         if (z !== c.z) {
            c.z = z;
            put(c.el, slab(P, front, c.ring, c.inner, 0, z));
         }
         moving ||= !tdone(cz[k], t);
      });
      const [x, y] = ctr(CELLS[home]);
      const top = cells[home].z;
      dots.forEach((d, k) => {
         if (top !== drawn.d[k]) {
            drawn.d[k] = top;
            place(d, P(x - 5 + k * 3.4, y + 3, top));
         }
         const lit = tval(on[k], t) > 0.5;
         if (lit !== drawn.lit[k])
            d.setAttribute("class", lit ? "dot m" : "dot off");
         drawn.lit[k] = lit;
         moving ||= !tdone(on[k], t);
      });
      return moving;
   });
   bag.add(B.unregister);
   cells[home].el.sil.classList.add("hi");
   cells[home].el.g.appendChild(steps);

   // Hit test: the pointer onto each cell's own rest top; the nearest centre wins, inside half a pitch.
   const hit = ([px, py]: Vec2) => {
      let best = -1;
      let bd = PITCH / 2 + 2;
      CELLS.forEach((c, k) => {
         const [u, v] = unproj(C, px, py, restZ(c));
         const [x, y] = ctr(c);
         const d = Math.max(Math.abs(u - x), Math.abs(v - y));
         if (d < bd) [best, bd] = [k, d];
      });
      return best;
   };

   /** Raises guide a's heads, row and column, and runs its steps; -1 stands the home guide back up. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const k0 = a < 0 ? CELLS.findIndex(isHome) : a;
      const [ai, aj] = CELLS[k0];
      CELLS.forEach((c, k) => {
         const dist = Math.abs(c[0] - ai) + Math.abs(c[1] - aj);
         const line = a >= 0 && (c[0] === ai || c[1] === aj);
         let to = k === a ? CH + GROW : CH;
         if (a < 0) to = restZ(c);
         if (line && k !== a) to += clamp(GROW * (0.36 - dist * 0.08), 1, GROW);
         tset(cz[k], to, t, dist * step);
         cells[k].el.sil.classList.toggle("hi", k === k0);
      });
      HEADS.forEach(([axis, n], k) => {
         const up = a >= 0 && n === (axis ? aj : ai);
         tset(hz[k], up ? 1 : 0, t, step);
      });
      if (k0 !== home) {
         home = k0;
         cells[home].el.g.appendChild(steps);
         drawn.d.fill(Number.NaN);
         on.forEach((w, k) => {
            w.from = 0;
            w.to = 0;
            tset(w, 1, t, (3 + k * 2) * step);
         });
      }
      act = a;
      read.textContent = a < 0 ? "rest" : `${FW[ai]}·${PF[aj]}`;
      B.wake();
   }

   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = hop(v);
   };
   return { set, destroy: bag.dispose };
};
