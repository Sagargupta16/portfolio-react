/**
 * Ledger Sync (15): an uploaded bank statement read row by row. A sheet holds
 * the export (a merged title bar, six rows, each with its hash as a dot code);
 * each imported row rides over the SHA-256 check into the next slot of the
 * ledger, and the Cash Flow Sankey beside it re-flows, its three bands
 * (savings, tax, expenses) widening by the rows that landed. Row five repeats
 * row four, same code: it stops over the check, which turns amber, and never
 * lands. The pointer picks a row, tested at rest: it and every row before it
 * import in order, staggered by hop; the rows after it go back to the sheet.
 * At rest three rows are in and the check holds the bright edge. Intensity
 * is how high a row rides.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, flatDot, inset, lerp, mk,
   now, place, pointer, poly, proj, put, register, rrect, slab, solid,
   tdone, tset, tval, tween, type FigureMount, type Frame, type Ring,
   type Solid, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [PT, TH, CAP, STICK, REST_K, DUP] = [3, 1.6, 22, 6, 2, 4];
/** Each row: its category (savings, tax, expenses), amount, and hash code as four bits. */
const CAT = [2, 0, 1, 2, 2, 0];
const AMT = [5, 3, 4, 4, 4, 6].map((v) => v * 1.6);
const CODE = [9, 5, 12, 6, 6, 3];
const PAGE = rrect(-6, -4, 152, 76, 7, 8);
const SHEET = rrect(0, 0, 36, 70, 4, 8);
const LEDGER = rrect(64, 8, 100, 58, 4, 8);
const BLOCK = rrect(44, 28, 56, 40, 3, 6);
const ROW = rrect(0, 0, 28, 5, 1.6, 4);
/** Where row k waits on the sheet, where the check is, and slot s in the ledger: plan points of a row's corner. */
const home = (k: number): Vec2 => [4, 14 + k * 8.6];
const slot = (s: number): Vec2 => [68, 12 + s * 9];
const PADS = [12, 36, 60];
const ease = (s: number) => s * s * (3 - 2 * s);
const lift = (v: number) => 4 + 6 * v;
const EXTENT = PAGE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [36, 0, lift(1) + TH],
   [100, 70, lift(1) + TH],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = CODE.map((_, k) => {
      const [x, y] = k <= REST_K ? slot(k) : home(k);
      return P(x + 14, y + 2.5, TH);
   });
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** Row four, the repeat, row six, then away. */
export const tour: Tour = ((s) => [s[3], s[DUP], s[5], null])(
   camera(frame).spot,
);

/** Where a row is at progress t on its ride from home to its slot: plan point and height. */
function ride(k: number, s: number, t: number, top: number): Vec3 {
   const pts = [home(k), [40, 31.5], [56, 31.5], slot(s)] as Vec2[];
   const at = clamp(t, 0, 1) * 3;
   const i = Math.min(2, Math.floor(at));
   const [a, b] = [pts[i], pts[i + 1]];
   const z = top * Math.sin(Math.PI * Math.min(1, t / 0.94));
   return [lerp(a[0], b[0], at - i), lerp(a[1], b[1], at - i), Math.max(0, z)];
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let top = lift(value);
   let act = -2;
   const g = mk("g", {}, svg);
   const plate = (r: Ring, z0: number, z1: number, b: number | null) => {
      const el = solid(g);
      put(el, slab(P, front, r, b ? inset(C, r, b) : null, z0, z1));
      return el;
   };
   const moved = (r: Ring, x: number, y: number) =>
      r.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

   // The desk, the sheet with its merged title bar, the ledger tray and the check.
   plate(PAGE, -PT, 0, 1.6);
   plate(SHEET, 0, 1, 1.2);
   plate(rrect(4, 3, 32, 9, 2, 4), 1, 1.8, null);
   plate(LEDGER, 0, 1, 1.2);
   const block = plate(BLOCK, 0, 4, 1);

   // The Sankey: a trunk, three bands, three pads, all redrawn when the tallies move.
   const trunk = solid(g);
   const bands = PADS.map(() => mk("path", {}, g));
   const pads = PADS.map(() => solid(g));
   const tally = (k: number, c: number) =>
      CAT.reduce(
         (s, r, i) => s + (i <= k && i !== DUP && r === c ? AMT[i] : 0),
         0,
      );
   const width = PADS.map((_, c) => tween(tally(REST_K, c)));
   let drawnW = "";
   const bar = (el: Solid, x: number, y: number, v: number) => {
      const r = rrect(x, y, x + 5, y + v, Math.min(1.2, v / 2), 3);
      put(el, slab(P, front, r, null, 0, 2));
   };
   function sankey(w: number[]) {
      let y = 36 - (w[0] + w[1] + w[2]) / 2;
      bar(trunk, 106, y, w[0] + w[1] + w[2]);
      w.forEach((v, c) => {
         const [a, b] = [y, PADS[c] - v / 2];
         const edge = (o: number) =>
            Array.from({ length: 13 }, (_, i): Vec2 =>
               P(111 + i * 2.42, lerp(a, b, ease(i / 12)) + o, 0),
            );
         bands[c].setAttribute("d", poly(edge(0).concat(edge(v).reverse())));
         bar(pads[c], 140, b, v);
         y += v;
      });
   }

   // The rows, each a thin slab with its code; reordered by depth as they ride.
   const rg = mk("g", {}, g);
   const rows = CODE.map((code, k) => {
      const el = solid(rg);
      const dots = [0, 1, 2, 3].map((j) =>
         flatDot(el.g, C, 0.8, code & (1 << j) ? "dot m" : "dot off"),
      );
      const t = tween(k <= REST_K ? 1 : 0);
      return { el, dots, k, t, key: 0, drawn: -1 };
   });

   const B = register(stage, (_dt, now) => {
      let moving = false;
      for (const r of rows) {
         const t = tval(r.t, now);
         moving ||= !tdone(r.t, now);
         if (t === r.drawn) continue;
         r.drawn = t;
         const [x, y, z] = ride(r.k, r.k > DUP ? r.k - 1 : r.k, t, top);
         r.key = x + y + z * 4;
         put(r.el, slab(P, front, moved(ROW, x, y), null, z, z + TH));
         r.dots.forEach((d, j) =>
            place(d, P(x + 17 + j * 2.6, y + 2.5, z + TH)),
         );
      }
      const order = rows.slice().sort((a, b) => a.key - b.key);
      if (order.some((r, i) => rg.children[i] !== r.el.g))
         rg.append(...order.map((r) => r.el.g));
      const w = PADS.map((_, c) => Math.max(0.8, tval(width[c], now)));
      moving ||= width.some((tw) => !tdone(tw, now));
      if (w.join() !== drawnW) sankey(w);
      drawnW = w.join();
      return moving;
   });
   bag.add(B.unregister);

   /** Imports rows 0 to a (-1: rest); the repeat rides only as far as the check. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const k = a < 0 ? REST_K : a;
      for (const r of rows) {
         const on = r.k <= k && (r.k !== DUP || a === DUP);
         const to = !on ? 0 : r.k === DUP ? 0.47 : 1;
         const delay = on ? r.k * 70 : Math.abs(r.k - k) * 50;
         tset(r.t, to, t, delay);
         r.el.sil.classList.toggle("hi", r.k === a && a !== DUP);
      }
      width.forEach((w, c) => tset(w, tally(k, c), t, k * 70 + 300));
      block.sil.classList.toggle("hi", a < 0);
      block.sil.classList.toggle("warn", a === DUP);
      act = a;
      read.textContent = a < 0 ? "rest" : a === DUP ? "dup" : `txn ${a + 1}`;
      B.wake();
   }
   setActive(-1);

   let held = -1;
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return (held = -1);
      if (held < 0 || d[held] >= CAP || d[held] - d[best] >= STICK) held = best;
      return held;
   };

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         top = lift(v);
         rows.forEach((r) => (r.drawn = -1));
         B.wake();
      },
      destroy: bag.dispose,
   };
};
