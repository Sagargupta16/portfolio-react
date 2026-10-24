/**
 * Minesweeper Game Unity (16): an 8 x 6 field of raised tiles on a board,
 * seven mines under them. At rest the first click has already opened the
 * top corner: a run of sunk cells, each counting its neighbouring mines in
 * dots, and the frontier's two is the bright mark. The pointer picks a tile
 * (tested on the tiles' rest tops): a cell with no mines round it floods
 * open, ring by ring out from it; a numbered cell opens alone; a mine opens
 * every mine on the board, out from the one touched, which takes the warning
 * edge. Leaving closes it all back. Intensity is the delay per ring.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, hull, inset,
   lerp, mk, now, place, poly, prism, proj, put, register, rings,
   rrect, slab, solid, tdone, tset, tval, tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [COLS, ROWS, CELL, PT, UP, DOWN] = [8, 6, 10, 5, 3.4, 0.7];
// prettier-ignore
const MINES = new Set([[4, 0], [3, 2], [6, 2], [1, 4], [5, 4], [7, 5], [0, 2]].map(([i, j]) => j * COLS + i));
/** The rest board: the first click, already played, and the frontier cell that is the bright mark. */
const [FIRST, MARK] = [0, 1 * COLS + 3];
const BOARD = rrect(-4, -4, COLS * CELL + 4, ROWS * CELL + 4, 6, 8);
const xy = (c: number): Vec2 => [c % COLS, Math.floor(c / COLS)];
const mid = (c: number): Vec2 => xy(c).map((v) => (v + 0.5) * CELL) as Vec2;
const near = (c: number) => {
   const [i, j] = xy(c);
   const out: number[] = [];
   for (let a = -1; a <= 1; a++)
      for (let b = -1; b <= 1; b++) {
         const [x, y] = [i + a, j + b];
         if ((a || b) && x >= 0 && y >= 0 && x < COLS && y < ROWS)
            out.push(y * COLS + x);
      }
   return out;
};
const COUNT = Array.from(
   { length: COLS * ROWS },
   (_, c) => near(c).filter((n) => MINES.has(n)).length,
);
/** What a click on c opens: c, and while it counts no mines, its neighbours, flood fill. */
function flood(c: number): Set<number> {
   const out = new Set([c]);
   for (const x of out)
      if (!MINES.has(x) && !COUNT[x])
         for (const n of near(x)) if (!MINES.has(n)) out.add(n);
   return out;
}
const REST = flood(FIRST);
const ring = (a: number, b: number) => {
   const [p, q] = [xy(a), xy(b)];
   return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]));
};
/** What stands open once cell a is clicked (-1: the rest board). */
function opened(a: number): Set<number> {
   if (a < 0) return REST;
   return MINES.has(a) ? new Set([...REST, ...MINES]) : flood(a);
}
/** The read-out for a click on cell a. */
function label(a: number): string {
   if (a < 0) return "rest";
   const [i, j] = xy(a);
   return `${MINES.has(a) ? "mine" : "cell"} ${i}·${j}`;
}

const EXTENT = BOARD.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   BOARD.map((q): Vec3 => [q.u, q.v, UP]),
);
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const top = (c: number) => P(...mid(c), REST.has(c) ? DOWN : UP);
   return { C, P, top };
}

export const frame = FRAMES.cover;
/** An empty corner that floods, a numbered cell, a mine, then away. */
export const tour: Tour = (({ top }) => [
   top(7),
   top(3 * COLS + 7),
   top(2 * COLS + 6),
   null,
])(camera(frame));

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P } = camera(f);
   const front = facing(C);
   const bag = disposer();
   let step = 30 + 40 * value;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -PT, 0));

   // Cells back to front by x + y: each a tile, its count in dots, and its mine.
   const order = COUNT.map((_, c) => c).sort(
      (a, b) => mid(a)[0] + mid(a)[1] - mid(b)[0] - mid(b)[1],
   );
   const cells = COUNT.map((n, c) => {
      const [x, y] = mid(c);
      const [r, ri] = rings(x - 4.2, y - 4.2, x + 4.2, y + 4.2, 2, 1);
      const k = MINES.has(c) ? 0 : n;
      return {
         n: k,
         r,
         ri,
         x,
         y,
         o: tween(REST.has(c) ? 1 : 0),
         z: Number.NaN,
      };
   });
   const els = cells.map(() => solid(g));
   order.forEach((c) => g.appendChild(els[c].g));
   const dots = cells.map((m, c) =>
      Array.from({ length: m.n }, () =>
         flatDot(els[c].g, C, 1, c === MARK ? "dot" : "dot m"),
      ),
   );
   const bombs = cells.map((_, c) => (MINES.has(c) ? solid(els[c].g) : null));
   /** A mine: a ball, as rings of [radius, height] round its axis. */
   // prettier-ignore
   const BALL = [[2.4, 0], [2.9, 1.3], [2.5, 2.6], [1.2, 3.5]].map(([r, h]) => ({ q: circ(r, 32), h }));

   const B = register(stage, (_dt, t) => {
      let moving = false;
      cells.forEach((m, c) => {
         const o = tval(m.o, t);
         moving ||= !tdone(m.o, t);
         if (o === m.z) return;
         m.z = o;
         const z = lerp(UP, DOWN, o);
         put(els[c], prism(P, front, m.r, m.ri, 0, z));
         dots[c].forEach((d, k) => {
            const s = (k - (m.n - 1) / 2) * 2.6 * Math.SQRT1_2;
            place(d, P(m.x + s, m.y - s, z));
            d.setAttribute("display", o > 0.6 ? "inline" : "none");
         });
         const ball = BALL.flatMap((b) =>
            b.q.map((q) => P(m.x + q.u, m.y + q.v, z + b.h)),
         );
         bombs[c]?.sil.setAttribute("d", o > 0.4 ? poly(hull(ball)) : "");
      });
      return moving;
   });
   bag.add(B.unregister);

   let act = -1;
   const bright = (c: number, on: boolean) => {
      const cls = MINES.has(c) ? "warn" : "hi";
      els[c].sil.classList.toggle(cls, on);
      bombs[c]?.sil.classList.toggle(cls, on);
   };
   /** Clicks cell a (-1: back to the rest board); every cell opens or closes by its ring from a. */
   function click(a: number) {
      if (a === act) return;
      const t = now();
      const from = a >= 0 ? a : act;
      if (act >= 0) bright(act, false);
      const open = opened(a);
      cells.forEach((m, c) => {
         const on = REST.has(c) || open.has(c);
         tset(m.o, on ? 1 : 0, t, ring(c, from) * step);
      });
      if (a >= 0) bright(a, true);
      for (const d of dots[MARK])
         d.setAttribute("class", a < 0 ? "dot" : "dot m");
      act = a;
      read.textContent = label(a);
      B.wake();
   }

   /** The cell under p, read on the tiles' rest tops: closed tops first, as they stand over the open ones. */
   const hit = (p: Vec2) => {
      for (const z of [UP, DOWN]) {
         const [x, y] = unproj(C, p[0], p[1], z).map((v) =>
            Math.floor(v / CELL),
         );
         const c = y * COLS + x;
         if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
         if (z === DOWN || !REST.has(c)) return c;
      }
      return -1;
   };
   follow(bag, stage, svg, hit, click);
   const set = (v: number) => {
      step = 30 + 40 * v;
   };
   return { set, destroy: bag.dispose };
};
