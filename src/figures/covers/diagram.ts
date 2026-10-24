/**
 * orrery (57): a diagram.yaml laid out by ELK into nested AWS boundaries. A
 * canvas plate holds the cloud with its corner tile, a dashed region, icon
 * tiles and right-angle edges fanning out of the API on one trunk; dots
 * number the main path's steps. The pointer picks a tile (tested at rest)
 * and the path from users to it lights hop by hop, staggered by hop count;
 * the chosen tile takes the bright edge from the corner tile. Intensity is
 * the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   open, place, pointer, poly, proj, put, register, ringAt, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, TS, RISE, CAP, STICK] = [3, 10, 8, 40, 12];
const CANVAS = rrect(-50, -6, 156, 108, 8, 8);
const CORNER = rrect(2, 0, 13, 11, 0.8);
/** The cloud boundary, then the dashed region inside it. */
const BOUNDS = [
   [rrect(2, 0, 150, 102, 1.5), "nf"],
   [rrect(18, 13, 142, 90, 3), "nf dash"],
] as const;
/** [x, y, parent, height, round]: users, api, fn, table, queue, worker. Tiles 1 to 3 close the numbered steps. */
const NODES: [number, number, number, number, boolean][] = [
   [-34, 51, -1, 9, true],
   [34, 51, 0, 5, false],
   [80, 30, 1, 6, false],
   [124, 30, 2, 10, true],
   [80, 72, 1, 4, false],
   [124, 72, 4, 6, false],
];

const depth = (i: number): number => (i < 0 ? -1 : depth(NODES[i][2]) + 1);
/** The layout in plan, before any camera: each tile's ring, its route from the parent, where its step dots lie. */
const TILES = NODES.map(([x, y, par, h, round], i) => {
   const ring = round
      ? circ(TS, 48).map((q) => ({ ...q, u: q.u + x, v: q.v + y }))
      : rrect(x - TS, y - TS, x + TS, y + TS, 3.4, 8);
   const [px, py] = par < 0 ? [x, y] : NODES[par];
   const ex = (px + x) / 2;
   const route: Vec2[] = [
      [px + TS, py],
      [ex, py],
      [ex, y],
      [x - TS, y],
   ];
   const dep = depth(i);
   const mx = lerp(ex, x - TS, 0.55) - ((dep - 1) / 2) * 3.6;
   const dots: Vec2[] = [];
   for (let k = 0; i <= 3 && k < dep; k++) dots.push([mx + k * 3.6, y + 5]);
   const tag = i === 0 ? "users" : `step ${dep}`;
   return { par, h, ring, dep, dots, route: par < 0 ? [] : route, tag };
});
const ORDER = TILES.map((_, i) => i).sort(
   (a, b) => NODES[a][0] + NODES[a][1] - NODES[b][0] - NODES[b][1],
);
/** The most extreme pose (rule 03): the canvas, and every tile at full lift. */
const EXTENT = CANVAS.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   NODES.map(([x, y, , h]): Vec3 => [x, y, h + RISE]),
);

/** The camera fitted to a frame, and each tile's rest top on screen: the hit spots. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = NODES.map(([x, y, , h]) => P(x, y, h));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** fn, then on to table, then the queue branch's worker, then away. */
export const tour: Tour = ((s) => [s[2], s[3], s[5], null])(camera(frame).spot);

/** Delay per hop in ms: 40 at intensity 0, 120 at 0.5, 220 at 1. */
const hop = (v: number) => (v <= 0.5 ? 40 + v * 160 : 120 + (v - 0.5) * 200);

/** The first fraction l of a polyline, by length. */
function part(pts: Vec2[], l: number): Vec2[] {
   const lens = pts
      .slice(1)
      .map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
   let left = l * lens.reduce((s, d) => s + d, 0);
   const out = [pts[0]];
   for (let i = 0; i < lens.length && left > 0; left -= lens[i++]) {
      const [a, b, k] = [pts[i], pts[i + 1], Math.min(1, left / lens[i]) || 0];
      out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]);
   }
   return out;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   let cornerHi = false;
   const g = mk("g", {}, svg);

   // The canvas ELK lays out on; on it the cloud, the dashed region, and the cloud's corner tile.
   put(solid(g), slab(P, front, CANVAS, inset(C, CANVAS, 1.4), -PT, 0));
   for (const [r, cls] of BOUNDS)
      mk("path", { d: poly(ringAt(P, r, 0)), class: cls }, g);
   const corner = solid(g);
   put(corner, slab(P, front, CORNER, null, 0, 1.6));

   // Edges and step dots, painted before the tiles: a dim wire, and over it the line that grows.
   const scr = TILES.map((n) => n.route.map((q) => P(q[0], q[1], 0)));
   const lines = scr.map((pts) => {
      if (!pts.length) return null;
      mk("path", { d: open(pts), class: "nf lo" }, g);
      return mk("path", { class: "nf sil" }, g);
   });
   const dots = TILES.map((n) =>
      n.dots.map(() => flatDot(g, C, 1.4, "dot off")),
   );
   TILES.forEach((n, i) =>
      n.dots.forEach((q, k) => place(dots[i][k], P(q[0], q[1], 0))),
   );
   const inner = TILES.map((n) => inset(C, n.ring, 1));
   // The tiles, back to front by x + y, so appending is painting.
   const els = ORDER.map(() => solid(g));
   const el = (i: number) => els[ORDER.indexOf(i)];
   const [z, l] = [TILES.map(() => tween(0)), TILES.map(() => tween(0))];
   const drawn = TILES.map(() => ({ z: Number.NaN, l: Number.NaN, hi: false }));

   const B = register(stage, (_dt, t) => {
      let moving = false;
      TILES.forEach((n, i) => {
         const [zi, li, was] = [tval(z[i], t), tval(l[i], t), drawn[i]];
         if (li !== was.l) {
            was.l = li;
            lines[i]?.setAttribute(
               "d",
               li > 0.002 ? open(part(scr[i], li)) : "",
            );
            for (const d of dots[i])
               d.setAttribute("class", li > 0.5 ? "dot m" : "dot off");
         }
         if (zi !== was.z) {
            was.z = zi;
            put(
               el(i),
               slab(P, front, n.ring, inner[i], zi * RISE, zi * RISE + n.h),
            );
         }
         const hi = i === act && zi > 0.5;
         if (hi !== was.hi) el(i).sil.classList.toggle("hi", (was.hi = hi));
         moving ||= !tdone(z[i], t) || !tdone(l[i], t);
      });
      // One bright place: the corner tile at rest, the chosen tile once it has risen.
      const rest = !drawn.some((d) => d.hi);
      if (rest !== cornerHi)
         corner.sil.classList.toggle("hi", (cornerHi = rest));
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen, so a risen tile cannot flip the choice; sticky by STICK.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   const lit = new Set<number>();
   /** Lights the path from users to tile a (-1: none): joiners rise from users out, leavers fall from the far end in. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const want = new Set<number>();
      for (let i = a; i >= 0; i = TILES[i].par) want.add(i);
      const far = Math.max(0, ...[...lit].map((i) => TILES[i].dep));
      TILES.forEach((n, i) => {
         const on = want.has(i);
         if (on === lit.has(i)) return;
         const delay = on ? n.dep * step : (far - n.dep) * step * 0.6;
         tset(z[i], on ? 1 : 0, t, delay);
         tset(l[i], on ? 1 : 0, t, on ? delay - step : delay + step * 0.3);
      });
      lit.clear();
      want.forEach((i) => lit.add(i));
      act = a;
      read.textContent = a < 0 ? "rest" : TILES[a].tag;
      B.wake();
   }

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = hop(v)), destroy: bag.dispose };
};
