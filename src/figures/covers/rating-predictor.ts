/**
 * LeetCode Rating Predictor (2): the real form, a weekly and a biweekly
 * contest, each a tick box and a rank track, feeds the exported Dense network
 * (layers drawn five, seven, five, three and one wide for 15, 128, 64, 32 and
 * 1), and each answer lands on a result card as a delta bar from a centre
 * axis: right for a gain, left for a drop. The pointer picks a contest by its
 * row and slides its rank along the track (a spring, tested on the form's
 * plane); each new rank fires the network layer by layer, staggered by hop,
 * and when the output fires the card's bar springs to the new delta. At rest
 * both are ticked, the weekly rank is good and its handle is bright.
 * Intensity is the delay per layer.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, clamp, disposer, facing, fitFrame, flatDot, inset, lerp,
   mk, now, place, pointer, poly, proj, put, register, ringAt, rrect, seg, slab, solid,
   spring, stepS, unproj, type FigureMount, type Frame, type Ring, type Solid,
   type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [PT, TX0, TX1, AXIS, BAR, CY0] = [3, 13, 35, 130, 15, 30];
const NAMES = ["wk", "bw"];
const ROWY = [22, 42];
const CARDY = [19, 45];
const REST_R = [0.18, 0.74];
const LAYERS = [50, 64, 78, 92, 105].map((x, l) => {
   const n = [5, 7, 5, 3, 1][l];
   return Array.from({ length: n }, (_, i): Vec2 => [
      x,
      CY0 + (i - (n - 1) / 2) * 8.2,
   ]);
});
const PAGE = rrect(-6, -4, 152, 66, 7, 8);
/** A rank share along the track (0 the best) as a rating delta in -1..1. */
const delta = (r: number) => clamp((0.42 - r) * 2.4, -1, 1);
const hx = (r: number) => lerp(TX0 + 2, TX1 - 2, r);
/** A rounded bar from x0 to x1 about y, h either side. */
const band = (x0: number, x1: number, y: number, h: number, r: number) =>
   rrect(x0, y - h, x1, y + h, r, 4);
const at = (r: Ring, x: number, y: number): Ring =>
   r.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
const EXTENT = PAGE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [50, 0, 12],
   [105, 66, 12],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C), front: facing(C) };
}

export const frame = FRAMES.cover;
/** Weekly near the top, biweekly far down, weekly again mid-table, then away. */
export const tour: Tour = ((P) => [
   P(hx(0.08), ROWY[0], 1),
   P(hx(0.9), ROWY[1], 1),
   P(hx(0.55), ROWY[0], 1),
   null,
])(camera(frame).P);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = 40 + 60 * value;
   let act = -2;
   const g = mk("g", {}, svg);
   const line = (d: string, cls: string) => mk("path", { d, class: cls }, g);
   const block = (el: Solid, r: Ring, z0: number, z1: number, b = 0) =>
      put(el, slab(P, front, r, b ? inset(C, r, b) : null, z0, z1));

   // The desk and the form: the username field, then each contest's tick box and rank track.
   block(solid(g), PAGE, -PT, 0, 1.6);
   block(solid(g), rrect(0, 0, 40, 60, 4, 8), 0, 1, 1.2);
   block(solid(g), rrect(4, 5, 36, 11, 2, 4), 1, 2.2);
   const handles = ROWY.map((y, j) => {
      block(solid(g), band(4, 9, y, 2.5, 1.2), 1, 3);
      place(flatDot(g, C, 1.1, "dot m"), P(6.5, y, 3));
      line(poly(ringAt(P, band(TX0, TX1, y, 1.3, 1.3), 1)), "nf");
      return { el: solid(g), sp: spring(REST_R[j]), drawn: -1 };
   });

   // The network: every edge, dim, behind; then the neurons, each on a spring, kicked when its layer fires.
   const wires = LAYERS.slice(1).flatMap((to, l) =>
      LAYERS[l].flatMap((a) =>
         to.map((b) => seg(P(a[0], a[1], 0), P(b[0], b[1], 0))),
      ),
   );
   CARDY.forEach((y) => wires.push(seg(P(105, CY0, 0), P(112, y, 0))));
   line(wires.join(""), "nf lo");
   const nodes = LAYERS.flatMap((col, l) =>
      col.map(([x, y]) => {
         const ring = at(circ(l === 4 ? 3.4 : 2.3, 24), x, y);
         // Softer than the default (k 60, c 9) so a fired layer is still up as the next one fires.
         const sp = spring(0, { k: 60, c: 9 });
         return { l, ring, el: solid(g), sp, drawn: -1 };
      }),
   );
   const fireAt = LAYERS.map(() => Infinity);

   // The result cards, each with its centre axis and its delta bar.
   const cards = CARDY.map((y, j) => {
      block(solid(g), band(112, 148, y, 7, 3), 0, 2, 1);
      line(seg(P(AXIS, y - 5, 2), P(AXIS, y + 5, 2)), "nf");
      const sp = spring(delta(REST_R[j]));
      return { el: solid(g), sp, want: 0, at: Infinity, drawn: -1 };
   });

   const B = register(stage, (dt, t) => {
      let moving = false;
      handles.forEach((h, j) => {
         moving = stepS(h.sp, dt) || moving;
         if (h.sp.x === h.drawn) return;
         h.drawn = h.sp.x;
         const x = hx(h.sp.x);
         block(h.el, band(x - 2.2, x + 2.2, ROWY[j], 2.6, 1.6), 1, 4);
      });
      fireAt.forEach((ft, l) => {
         if (t < ft) return;
         fireAt[l] = Infinity;
         for (const n of nodes) if (n.l === l) n.sp.v = 55;
      });
      for (const n of nodes) {
         moving = stepS(n.sp, dt) || moving;
         const z = Math.max(0, n.sp.x);
         if (z === n.drawn) continue;
         n.drawn = z;
         block(n.el, n.ring, z, z + 2.4);
      }
      cards.forEach((c, j) => {
         if (t >= c.at) {
            c.sp.t = c.want;
            c.at = Infinity;
         }
         moving = stepS(c.sp, dt) || moving || c.at < Infinity;
         if (c.sp.x === c.drawn) return;
         c.drawn = c.sp.x;
         const [a, b] = [AXIS, AXIS + c.sp.x * BAR].sort((m, n) => m - n);
         block(c.el, band(a, Math.max(b, a + 0.6), CARDY[j], 1.6, 1), 2, 3.6);
      });
      return moving || fireAt.some((ft) => ft < Infinity);
   });
   bag.add(B.unregister);

   /** Contest j at rank share r (-1: rest); a new rank fires the layers, then the card. */
   let bucket = REST_R.map((r) => Math.round(delta(r) * 8)).join();
   function choose(j: number, r: number) {
      const t = now();
      if (j >= 0) handles[j].sp.t = r;
      else handles.forEach((h, k) => (h.sp.t = REST_R[k]));
      const want = handles.map((h) => delta(h.sp.t));
      const key = want.map((d) => Math.round(d * 8)).join();
      if (key !== bucket) {
         bucket = key;
         LAYERS.forEach(
            (_, l) => (fireAt[l] = Math.min(fireAt[l], t + l * step)),
         );
         cards.forEach((c, k) => {
            c.want = want[k];
            c.at = t + 5 * step;
         });
      }
      if (j !== act) {
         handles.forEach((h, k) =>
            h.el.sil.classList.toggle("hi", k === (j < 0 ? 0 : j)),
         );
         act = j;
      }
      const d = Math.round(want[j < 0 ? 0 : j] * 60);
      read.textContent =
         j < 0 ? "rest" : `${NAMES[j]} ${d < 0 ? "-" : "+"}${Math.abs(d)}`;
      B.wake();
   }
   choose(-1, 0);

   /** On the form's plane: the row by y, the rank by x along its track. */
   const move = (p: Vec2) => {
      const [x, y] = unproj(C, p[0], p[1], 1);
      const j = x > -4 && x < 44 && y > 12 && y < 54 ? (y < 32 ? 0 : 1) : -1;
      choose(j, clamp((x - TX0 - 2) / (TX1 - TX0 - 4), 0, 1));
   };

   bag.add(pointer(stage, { move, leave: () => choose(-1, 0) }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = 40 + 60 * v), destroy: bag.dispose };
};
