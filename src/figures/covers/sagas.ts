/**
 * Sagas (46): a living library of unfinished books. One long shelf in three
 * sections, fantasy, fan fiction and essays, each a row of standing books of
 * their own thickness and height, spines to the front. In the fan fiction
 * section the chapter being written stands half out of its slot, the bright
 * mark, with three status dots on the shelf's lip beside it: draft, revising,
 * final. The pointer on a book pulls it out toward you, its neighbours a
 * little, staggered by distance. The pointer on the chapter publishes it: the
 * dots step to final one at a time, then it slides home into its slot on the
 * shelf. Intensity is how far a book is pulled.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fit, fitFrame, flatDot, inset, mk, now, place,
   pointer, proj, put, register, rrect, slab, solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, BD, GAP, SECTION, SL, CAP, STICK] = [3, 13, 1.2, 9, 9, 18, 6];
const GENRE = ["fantasy", "fanfic", "essays"];
/** Spines per section, thickness then height; the chapter is the 0. */
const SPINES = [
   [5, 19, 4, 16, 6, 21, 4, 17, 7, 20, 5, 15],
   [6, 17, 4, 20, 5, 15, 0, 19, 6, 21, 4, 16],
   [4, 18, 6, 21, 5, 16, 7, 19, 4, 15, 5, 20],
];
const FALL = [1, 0.32, 0.1];

type Book = { s: number; n: number; x0: number; x1: number; h: number };
const BOOKS: Book[] = [];
let x = 0;
SPINES.forEach((row, s) => {
   for (let k = 0; k < row.length; k += 2) {
      const n = BOOKS.filter((b) => b.s === s).length + 1;
      BOOKS.push({ s, n, x0: x, x1: x + (row[k] || 3), h: row[k + 1] });
      x += (row[k] || 3) + GAP;
   }
   x += SECTION;
});
const CH = BOOKS.findIndex((b) => SPINES[b.s][(b.n - 1) * 2] === 0);
const X1 = x - SECTION + 3;
const SHELF = rrect(-4, -2, X1, BD + 6, 3, 8);
/** The status dots, on the lip in front of the chapter's left neighbours. */
const DOTS: Vec2[] = [-16, -12.5, -9].map((d) => [BOOKS[CH].x0 + d, BD + 3.4]);
/** Rest: every book home except the chapter, which stands out of its slot. */
const REST = BOOKS.map((_, i) => (i === CH ? 1 : 0));
const EXTENT = SHELF.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   BOOKS.map((b): Vec3 => [b.x1, BD + SL, b.h]),
   BOOKS.map((b): Vec3 => [b.x0, 0, b.h]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   // Height binds here; give the read-out corner room above the first spines.
   C.S *= 0.84;
   fit(C, EXTENT, frame[0] / 2, frame[1] / 2 + 6);
   const P = proj(C);
   // Each book's rest pose: home, but the chapter stands out of its slot.
   const spot = BOOKS.map((b, i) =>
      P((b.x0 + b.x1) / 2, BD / 2 + REST[i] * SL, b.h * 0.75),
   );
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** A fantasy book, the chapter (it publishes), an essay, then away. */
export const tour: Tour = ((s) => [s[2], s[CH], s[13], null])(
   camera(frame).spot,
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let [pull, act, pubAt, lit] = [0.6 + value * 0.4, -1, Infinity, ""];
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, SHELF, inset(C, SHELF, 1.4), -PT, 0));
   const dots = DOTS.map((q) => {
      const d = flatDot(g, C, 1.4, "dot off");
      place(d, P(q[0], q[1], 0));
      return d;
   });
   const row = mk("g", {}, g);
   const els = BOOKS.map(() => solid(row));
   const rings = BOOKS.map((b) => rrect(b.x0, 0, b.x1, BD, 1.2, 4));
   const out = BOOKS.map((_, i) => tween(REST[i]));
   const drawn = BOOKS.map(() => Number.NaN);
   let ahead = "";

   const B = register(stage, (_dt, t) => {
      let moving = false;
      BOOKS.forEach((b, i) => {
         const oi = tval(out[i], t);
         moving ||= !tdone(out[i], t);
         if (oi === drawn[i]) return;
         const y = (drawn[i] = oi) * SL * (i === CH ? 1 : pull);
         const r = rings[i].map((q) => ({ ...q, v: q.v + y }));
         put(els[i], slab(P, front, r, inset(C, r, 0.5, 0.3), 0, b.h));
      });
      // A book pulled past its neighbour's thickness is nearer than it: paint it last.
      const order = drawn.map((d) => d * SL > 4).join();
      if (order !== ahead) {
         ahead = order;
         const o = BOOKS.map((_, i) => i).sort(
            (a, b) => +(drawn[a] * SL > 4) - +(drawn[b] * SL > 4) || a - b,
         );
         for (const i of o) row.appendChild(els[i].g);
      }
      // The status steps draft, revising, final, one dot at a time.
      const want = dots.map((_, j) => !j || t >= pubAt + j * 170).join();
      if (want !== lit) {
         lit = want;
         const on = want.split(",");
         dots.forEach((d, j) =>
            d.setAttribute("class", on[j] === "true" ? "dot m" : "dot off"),
         );
      }
      return moving || (Number.isFinite(pubAt) && t < pubAt + 400);
   });
   bag.add(B.unregister);

   const hit = (q: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - q[0], s[1] - q[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   /** Pulls book a out (its section-mates a little), or publishes the chapter; -1 is rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const pub = a === CH;
      BOOKS.forEach((b, i) => {
         const near =
            a >= 0 && !pub && b.s === BOOKS[a].s ? Math.abs(a - i) : 9;
         const to = i === CH ? (pub ? 0 : 1) : (FALL[near] ?? 0);
         tset(out[i], to, t, i === CH ? (pub ? 520 : 0) : near * 45);
      });
      pubAt = pub ? t : Infinity;
      els.forEach((e, i) =>
         e.sil.classList.toggle("hi", a < 0 ? i === CH : i === a),
      );
      act = a;
      const b = BOOKS[a];
      read.textContent =
         a < 0 ? "rest" : pub ? "final" : `${GENRE[b.s]} ${b.n}`;
      B.wake();
   }

   read.textContent = "rest";
   els[CH].sil.classList.add("hi");
   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (q) => setActive(hit(q)), leave }));
   bag.add(() => svg.replaceChildren());
   const set = (v: number) => {
      pull = 0.6 + v * 0.4;
      drawn.fill(Number.NaN);
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
