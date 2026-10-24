/**
 * PacMan Game Unity (12): an 11 x 7 maze, a Pacdot on every corridor cell, the
 * power pellet bright in the far corner, Pac-Man eaten in along the top edge
 * and the ghost between the centre pillars. The pointer picks a corridor cell
 * (a wall's top hands over to the nearest one): Pac-Man runs there the
 * shortest way, mouth working, the dots going out as he passes; the ghost
 * follows a beat later at 0.3 to his 0.4 and stops two tiles short. Leaving
 * plays it back. Intensity is the ghost's delay.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, hull, inset, lerp,
   mk, now, open, place, pointer, poly, prism, proj, put, register, ringAt,
   rings, rrect, run, slab, solid, tdone, tset, tval, tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2 } from "@/figures/hairline";

const [COLS, ROWS, CELL, PT, WALL, PAC, R0] = [11, 7, 10, 5, 4.4, 4.8, 3.9];
/** Wall blocks [i0, j0, i1, j1], inclusive cells, back to front. */
// prettier-ignore
const WALLS = [[1, 1, 2, 2], [4, 1, 6, 1], [1, 4, 2, 5], [4, 3, 4, 3], [6, 3, 6, 3], [8, 1, 9, 2], [4, 5, 6, 5], [8, 4, 9, 5]]
   .map(([a, b, c, d]) => [a, b, c + 1, d + 1].map((v) => v * CELL));
// prettier-ignore
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const key = (c: Vec2) => c[0] * 16 + c[1];
const mid = (c: Vec2): Vec2 => [(c[0] + 0.5) * CELL, (c[1] + 0.5) * CELL];
const walled = ([x, y]: Vec2) =>
   WALLS.some((w) => x > w[0] && x < w[2] && y > w[1] && y < w[3]);
const OPEN: Vec2[] = [];
for (let j = 0; j < ROWS; j++)
   for (let i = 0; i < COLS; i++) if (!walled(mid([i, j]))) OPEN.push([i, j]);
/** Pac-Man's way in, eaten already; the ghost's cell; the power pellet. */
// prettier-ignore
const [IN, GHOST, POWER]: [Vec2[], Vec2, number] = [[[0, 0], [1, 0], [2, 0], [3, 0]], [5, 3], key([10, 0])];
const BOARD = rrect(-4, -4, COLS * CELL + 4, ROWS * CELL + 4, 6, 8);
const disc = (r: number, [x, y]: Vec2) =>
   circ(r, 36).map((s) => ({ ...s, u: s.u + x, v: s.v + y }));

/** The shortest walk from a to b through the corridors. */
function bfs(a: Vec2, b: Vec2): Vec2[] {
   const prev = new Map<number, Vec2 | null>([[key(a), null]]);
   const q = [a];
   for (const c of q) {
      if (key(c) === key(b)) break;
      for (const [dx, dy] of DIRS) {
         const n: Vec2 = [c[0] + dx, c[1] + dy];
         if (!OPEN.some((o) => key(o) === key(n)) || prev.has(key(n))) continue;
         prev.set(key(n), c);
         q.push(n);
      }
   }
   const out: Vec2[] = [];
   for (let p: Vec2 | null = b; p; p = prev.get(key(p)) ?? null) out.unshift(p);
   return out;
}

const EXTENT = [-PT, PAC + 3].flatMap((z) =>
   BOARD.map((q): [number, number, number] => [q.u, q.v, z]),
);
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C) };
}

export const frame = FRAMES.cover;
/** Down the right edge, round to the near corridor, back up the left, then away. */
export const tour: Tour = (({ P }) =>
   [[10, 3], [7, 6], [0, 2], null].map((c) =>
      c ? P(...mid(c as Vec2), 0) : null,
   ))(camera(frame));

/** A runner on a trail of cells, at a tween's index along it. */
const runner = (trail: Vec2[], dur = 700) => ({
   trail,
   tw: tween(trail.length - 1, dur),
   drawn: NaN,
});
type Runner = ReturnType<typeof runner>;
const pos = (r: Runner, u: number): Vec2 => {
   const v = Math.max(0, Math.min(r.trail.length - 1, u));
   const i = Math.floor(v);
   const [a, b] = [mid(r.trail[i]), mid(r.trail[i + 1] ?? r.trail[i])];
   return [lerp(a[0], b[0], v - i), lerp(a[1], b[1], v - i)];
};

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P } = camera(f);
   const front = facing(C);
   const bag = disposer();
   let wait = 40 + 180 * value;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -PT, 0));
   const dots = OPEN.map((c) => {
      const d = flatDot(g, C, key(c) === POWER ? 2 : 1, "dot m");
      place(d, P(...mid(c), 0));
      return { c, d, cls: "" };
   });
   const layer = mk("g", {}, g);
   const walls = WALLS.map(([x0, y0, x1, y1]) => {
      const el = solid(layer);
      const [r, ri] = rings(x0 + 1, y0 + 1, x1 - 1, y1 - 1, 3, 1.1);
      put(el, prism(P, front, r, ri, 0, WALL));
      return el;
   });
   const pacEl = solid(layer);
   const mouth = mk("path", { class: "nf" }, pacEl.g);
   const ghostEl = solid(layer);
   const eyes = [0, 1].map(() =>
      mk("circle", { r: 0.8 * C.S, class: "dot m" }, ghostEl.g),
   );
   const [pac, ghost] = [runner(IN.slice()), runner([GHOST], 700 * (4 / 3))];
   // prettier-ignore
   const dome = [[R0, 0], [R0, 4.8], [2.8, 6.6], [1.4, 7.6]];
   let [slots, act] = ["", -1];

   const B = register(stage, (_dt, t) => {
      const [u, w] = [tval(pac.tw, t), tval(ghost.tw, t)];
      const [p, q] = [pos(pac, u), pos(ghost, w)];
      if (u !== pac.drawn) {
         pac.drawn = u;
         const b = pos(pac, u - 0.3);
         const a0 = Math.atan2(p[1] - b[1], p[0] - b[0]) || 0;
         const m = 0.15 + 0.5 * Math.abs(Math.cos(Math.PI * u));
         put(pacEl, prism(P, front, disc(R0, p), null, 0, PAC));
         const lid = Array.from({ length: 15 }, (_, k) => {
            const a = a0 + m + ((2 * Math.PI - 2 * m) * k) / 14;
            return P(p[0] + Math.cos(a) * 2.9, p[1] + Math.sin(a) * 2.9, PAC);
         });
         mouth.setAttribute("d", open([P(...p, PAC), ...lid, P(...p, PAC)]));
         const ate = new Set(pac.trail.slice(0, u + 1.3).map(key));
         for (const o of dots) {
            const lit = key(o.c) === POWER && act < 0;
            const cls = ate.has(key(o.c)) ? "dot off" : lit ? "dot" : "dot m";
            if (cls !== o.cls) o.d.setAttribute("class", (o.cls = cls));
         }
      }
      if (w !== ghost.drawn) {
         ghost.drawn = w;
         const body = dome.flatMap(([r, z]) => ringAt(P, disc(r, q), z));
         const waist = ringAt(P, run(disc(R0 - 1, q), front), 4.8);
         put(ghostEl, { sil: poly(hull(body)), crease: open(waist) });
         eyes.forEach((e, i) => {
            const [a, s] = [3.2 * Math.SQRT1_2, (i - 0.5) * 2.4 * Math.SQRT1_2];
            place(e, P(q[0] + a + s, q[1] + a - s, 5.8));
         });
      }
      // Paint order: each runner goes in just after the last wall behind it.
      const back = (c: Vec2) =>
         WALLS.findLastIndex((v) => v[2] <= c[0] - R0 || v[3] <= c[1] - R0) +
         (c[0] + c[1]) / 1e3;
      const rs = [[back(p), pacEl.g] as const, [back(q), ghostEl.g] as const];
      if (rs[1][0] < rs[0][0]) rs.reverse();
      const s = `${rs.map(([k]) => Math.floor(k))}${rs[0][1] === pacEl.g}`;
      if (s !== slots && (slots = s))
         for (const [k, el] of rs)
            layer.insertBefore(el, walls[Math.floor(k) + 1]?.g ?? null);
      return !tdone(pac.tw, t) || !tdone(ghost.tw, t);
   });
   bag.add(B.unregister);
   /** Sends r on from the cell it is entering to c, the shortest way, stopping `short` cells before it. */
   function send(r: Runner, c: Vec2, short: number, delay: number, t: number) {
      const i0 = Math.min(r.trail.length - 1, Math.ceil(tval(r.tw, t) - 1e-3));
      const path = bfs(r.trail[i0], c).slice(1);
      path.length = Math.max(0, path.length - short);
      r.trail = r.trail.slice(0, i0 + 1).concat(path);
      tset(r.tw, r.trail.length - 1, t, delay);
   }
   function choose(c: Vec2 | null) {
      const k = c ? key(c) : -1;
      if (k === act) return;
      act = k;
      const t = now();
      pacEl.sil.classList.toggle("hi", !!c);
      pac.drawn = NaN;
      read.textContent = c ? `dot ${c[0]}·${c[1]}` : "rest";
      if (!c) {
         tset(pac.tw, IN.length - 1, t, 0);
         tset(ghost.tw, 0, t, wait);
         return B.wake();
      }
      send(pac, c, 0, 0, t);
      send(ghost, c, 2, wait, t);
      B.wake();
   }

   /** The corridor cell nearest the point under p: a wall's top, else the ground. */
   const hit = (p: Vec2): Vec2 | null => {
      const top = unproj(C, p[0], p[1], WALL);
      const at = walled(top) ? top : unproj(C, p[0], p[1], 0);
      const d = (c: Vec2) => Math.hypot(mid(c)[0] - at[0], mid(c)[1] - at[1]);
      const best = OPEN.reduce((b, c) => (d(c) < d(b) ? c : b));
      return d(best) < CELL ? best : null;
   };
   const leave = () => choose(null);
   bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (wait = 40 + 180 * v), destroy: bag.dispose };
};
