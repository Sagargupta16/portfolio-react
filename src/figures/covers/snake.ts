/**
 * Snake Game Unity (17): a 10 x 6 arena on a board, a dim grid of cells, a
 * snake of rounded cubes coiled tail to head and one food cube ahead of it.
 * The pointer drops the food on a cell (tested on the ground plane, which
 * never moves): the head walks the shortest way round its own body, and every
 * segment steps into the cell the one ahead of it left, so the turn runs
 * down the body one hop at a time, as Move() hands the tail on. When the head
 * reaches the food the next step leaves a new tail square behind: the snake
 * grows by one. Leaving plays the run back to the coil. The food is the
 * bright place; once eaten, the head takes it. Intensity: the start delay.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   place, pointer, prism, proj, put, register, rings, rrect, seg, slab, solid,
   tdone, tset, tval, tween, unproj, type FigureMount, type Frame,
   type PrismPaths, type Solid, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [COLS, ROWS, CELL, PT, MAX] = [10, 6, 10, 5, 24];
const [HEAD, BODY, FOOD] = [5.6, 4.2, 3.4];
/** The rest pose, tail to head: a coil heading right, the food ahead of it. */
// prettier-ignore
const REST: Vec2[] = [[1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [4, 2], [5, 2], [6, 2]];
const BAIT: Vec2 = [8, 3];
const BOARD = rrect(-4, -4, COLS * CELL + 4, ROWS * CELL + 4, 6, 8);
// prettier-ignore
const DIRS: Vec2[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const NONE = { sil: "", crease: "" };
const mid = (c: Vec2): Vec2 => [(c[0] + 0.5) * CELL, (c[1] + 0.5) * CELL];
const key = (c: Vec2) => c[0] * 16 + c[1];
const inside = (c: Vec2) =>
   c[0] >= 0 && c[1] >= 0 && c[0] < COLS && c[1] < ROWS;

/** The shortest walk from a to b on the grid, round the blocked cells; null when there is none. */
function bfs(a: Vec2, b: Vec2, blocked: Set<number>): Vec2[] | null {
   const prev = new Map<number, Vec2 | null>([[key(a), null]]);
   const q = [a];
   for (let c = q.shift(); c; c = q.shift()) {
      if (key(c) === key(b)) {
         const out: Vec2[] = [];
         for (let p: Vec2 | null = c; p; p = prev.get(key(p)) ?? null)
            out.unshift(p);
         return out;
      }
      for (const [dx, dy] of DIRS) {
         const n: Vec2 = [c[0] + dx, c[1] + dy];
         if (!inside(n) || prev.has(key(n)) || blocked.has(key(n))) continue;
         prev.set(key(n), c);
         q.push(n);
      }
   }
   return null;
}

const EXTENT = BOARD.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   BOARD.map((q): Vec3 => [q.u, q.v, HEAD]),
);
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C) };
}

export const frame = FRAMES.cover;
/** Food at the far corner, then down the near edge, then behind the tail, then away. */
export const tour: Tour = (({ P }) =>
   [[8, 1], [6, 5], [1, 1], null].map((c) =>
      c ? P(...mid(c as Vec2), 0) : null,
   ))(camera(frame));

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P } = camera(f);
   const front = facing(C);
   const bag = disposer();
   let wait = 40 + 180 * value;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -PT, 0));
   let d = "";
   for (let i = 0; i <= COLS; i++)
      d += seg(P(i * CELL, 0, 0), P(i * CELL, ROWS * CELL, 0));
   for (let j = 0; j <= ROWS; j++)
      d += seg(P(0, j * CELL, 0), P(COLS * CELL, j * CELL, 0));
   mk("path", { d, class: "nf lo" }, g);

   // The snake and the food share one layer, re-ordered by x + y as they move.
   const layer = mk("g", {}, g);
   const segs = Array.from({ length: MAX }, () => solid(layer));
   const eyes = [1, -1].map(() => flatDot(segs[0].g, C, 0.9, "dot m"));
   const food = solid(layer);
   const R = REST.length - 1;
   let trail = REST.slice();
   let eats: number[] = [];
   let aim: Vec2 | null = null;
   const h = tween(R);
   const drawn = [...segs, food].map(() => "-");
   const lit = { food: false, head: false, order: "" };

   /** A point u along the trail, between cells. */
   const pos = (u: number): Vec2 => {
      const v = Math.max(0, Math.min(trail.length - 1, u));
      const i = Math.floor(v);
      const [a, b] = [mid(trail[i]), mid(trail[i + 1] ?? trail[i])];
      return [lerp(a[0], b[0], v - i), lerp(a[1], b[1], v - i)];
   };
   const cube = (x: number, y: number, h: number, z: number) =>
      prism(P, front, ...rings(x - h, y - h, x + h, y + h, 2.4, 1), 0, z);
   /** Redraws solid i only when its key moved; an empty key empties it. */
   const paint = (el: Solid, i: number, k: string, make: () => PrismPaths) => {
      if (k === drawn[i]) return;
      drawn[i] = k;
      put(el, k ? make() : NONE);
   };

   const B = register(stage, (_dt, t) => {
      const u = segs.map((_, k) => tval(h, t) - k);
      const len = REST.length + eats.filter((e) => e <= u[0] + 0.5).length;
      const items: [number, number][] = [];
      segs.forEach((el, k) => {
         const [x, y] = pos(u[k]);
         const on = k < len;
         const z = k ? BODY : HEAD;
         paint(el, k, on ? `${x} ${y}` : "", () => cube(x, y, k ? 4 : 4.5, z));
         if (on) items.push([x + y, k]);
      });
      // Eyes on the head's lid, looking the way it goes.
      const [hx, hy] = pos(u[0]);
      const [bx, by] = pos(u[0] - 0.3);
      const l = Math.hypot(hx - bx, hy - by);
      const [dx, dy] = l > 0.01 ? [(hx - bx) / l, (hy - by) / l] : [1, 0];
      eyes.forEach((e, i) =>
         place(e, P(hx + (dx - dy * i) * 2, hy + (dy + dx * i) * 2, HEAD)),
      );
      const moving = !tdone(h, t);
      const eaten = aim !== null && u[0] > trail.length - 1.5;
      const showFood = aim ? !eaten : !moving;
      const fc = mid(aim ?? BAIT);
      paint(food, MAX, showFood ? `${fc}` : "", () => cube(...fc, 3, FOOD));
      if (showFood) items.push([fc[0] + fc[1], -1]);
      if (showFood !== lit.food) food.sil.classList.toggle("hi", showFood);
      if (eaten !== lit.head) segs[0].sil.classList.toggle("hi", eaten);
      [lit.food, lit.head] = [showFood, eaten];
      items.sort((a, b) => a[0] - b[0]);
      const order = items.map((it) => it[1]).join();
      const fresh = order !== lit.order && order !== "";
      lit.order = order;
      if (fresh)
         for (const [, k] of items) layer.appendChild((segs[k] ?? food).g);
      return moving;
   });
   bag.add(B.unregister);

   /** Food on cell c: the head walks to it round the body. Null plays the run back to the coil, tail first. */
   function drop(c: Vec2 | null) {
      const t = now();
      const u0 = tval(h, t);
      const len = REST.length + eats.filter((e) => e <= u0 + 0.5).length;
      if (!c) {
         aim = null;
         read.textContent = "rest";
         tset(h, R, t, 0);
         return B.wake();
      }
      const i0 = Math.min(trail.length - 1, Math.ceil(u0 - 1e-3));
      const body = new Set<number>();
      for (let k = 0; k < len; k++) body.add(key(trail[Math.max(0, i0 - k)]));
      const path = body.has(key(c)) ? null : bfs(trail[i0], c, body);
      if (!path) {
         read.textContent = "tail";
         return;
      }
      trail = trail.slice(0, i0 + 1).concat(path.slice(1));
      eats = eats.filter((e) => e <= i0).concat(trail.length - 1);
      aim = c;
      read.textContent = `food ${c[0]}·${c[1]}`;
      tset(h, trail.length - 1, t, wait);
      B.wake();
   }

   let cur = -1;
   const move = (p: Vec2) => {
      const [x, y] = unproj(C, p[0], p[1], 0);
      const c: Vec2 = [Math.floor(x / CELL), Math.floor(y / CELL)];
      const k = inside(c) ? key(c) : -1;
      if (k === cur) return;
      cur = k;
      drop(k < 0 ? null : c);
   };
   const leave = () => {
      cur = -1;
      drop(null);
   };
   bag.add(pointer(stage, { move, leave }));
   bag.add(() => svg.replaceChildren());
   const set = (v: number) => {
      wait = 40 + 180 * v;
   };
   return { set, destroy: bag.dispose };
};
