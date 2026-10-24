/**
 * svg-forge (58): the plugin's three scripts on one board. forge.py is the
 * block at the left; the card it writes lies beside it, three nodes on a
 * wire with the flow dot riding between them and the validator's three rule
 * groups by its edge; frames.py's contact sheet is the strip of six sampled
 * frames in front, each with the dot where that frame caught it. The
 * pointer picks a part (tested at rest): a frame rises with its neighbours,
 * staggered by distance, and the card's dot slides to that frame's sample;
 * the card ticks its rule groups green from the one nearest; the forge
 * raises the card's nodes hop by hop. At rest the flow dot is the one bright
 * mark. Intensity is the frames' rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   place, pointer, prism, proj, put, register, rings, rrect, seg, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CT, NH, POP, CAP, STICK] = [3, 3, 3, 7, 34, 8];
const BOARD = rrect(-14, -8, 112, 66, 9, 8);
const CARD = rrect(26, -2, 104, 34, 4, 8);
const FORGE = rings(-6, 6, 16, 28, 5, 1.4);
const NODES = [36, 60, 84];
const [WY, TICKX] = [16, 94];
const TICKS = [6, 16, 26];
/** The six sampled frames: each tile's left edge, and where its frame caught the dot, clear of the nodes. */
const SAMPLE = [0.14, 0.25, 0.36, 0.64, 0.75, 0.86];
const FR = SAMPLE.map((f, k) => ({ x: 20 + k * 15, f }));
const [FY0, FY1, FW] = [44, 58, 12];
const EXTENT: Vec3[] = BOARD.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [5, 17, 14],
   [NODES[0], WY, CT + NH + POP],
   ...FR.map((r): Vec3 => [r.x + FW / 2, FY0, 2 + 12]),
]);

const shift = (r: Ring, dx: number, dy: number): Ring =>
   r.map((q) => ({ ...q, u: q.u + dx, v: q.v + dy }));
const wireX = (f: number) => lerp(NODES[0], NODES[2], f);

/** The camera fitted to a frame; the hit spots, each with the part it names (0 forge, 1 card, 2 + k frame k). */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spots: [Vec2, number][] = [
      [P(5, 17, 12), 0],
      ...[44, 66, 88].map((x): [Vec2, number] => [P(x, 16, CT), 1]),
      ...FR.map((r, k): [Vec2, number] => [
         P(r.x + FW / 2, (FY0 + FY1) / 2, 2),
         2 + k,
      ]),
   ];
   return { C, P, front: facing(C), spots };
}

export const frame = FRAMES.cover;
/** A frame on the sheet, a later one, the card's rule groups, the forge, away. */
export const tour: Tour = ((s) => [s[5][0], s[9][0], s[2][0], s[0][0], null])(
   camera(frame).spots,
);
const NAMES = ["forge", "validate"];

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spots } = camera(f);
   const bag = disposer();
   let rise = 6 + value * 8;
   let act = -1;
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -PT, 0));
   // The forge: a block with its prompt scored on the lid, and the dashed port to the card.
   mk("path", { d: seg(P(16, 17, 0), P(26, 17, 0)), class: "nf dash" }, g);
   const forge = solid(g);
   put(forge, prism(P, front, FORGE[0], FORGE[1], 0, 12));
   mk("path", { d: seg(P(0, 12, 12), P(9, 12, 12)), class: "nf lo" }, g);
   // The card, its wire, its rule groups, the flow dot, then the nodes over it.
   const card = solid(g);
   put(card, slab(P, front, CARD, inset(C, CARD, 1.2), 0, CT));
   mk(
      "path",
      { d: seg(P(NODES[0], WY, CT), P(NODES[2], WY, CT)), class: "nf lo" },
      g,
   );
   const tickAt = TICKS.map((y) => P(TICKX, y, CT));
   const ticks = tickAt.map((q) => {
      const d = flatDot(g, C, 1.7, "dot off");
      place(d, q);
      return d;
   });
   const flow = flatDot(g, C, 2.2, "dot");
   const [nr, ni] = [circ(3.6, 24), circ(2.5, 24)];
   const nodes = NODES.map(() => solid(g));
   // The contact sheet, left to right, each frame a thin tile with its flow line and its sampled dot.
   const tiles = FR.map((r) => {
      const ring = rrect(r.x, FY0, r.x + FW, FY1, 2.2, 6);
      const el = solid(g);
      const ln = mk("path", { class: "nf lo" }, el.g);
      const dot = flatDot(el.g, C, 1.1, "dot m");
      return { r, ring, inner: inset(C, ring, 0.9), el, ln, dot };
   });

   const fz = FR.map(() => tween(0));
   const nz = NODES.map(() => tween(0));
   const tk = TICKS.map(() => tween(0));
   const fd = tween(0.25);
   const drawn = { f: NaN, fz: FR.map(() => NaN), nz: NODES.map(() => NaN) };
   const tickOn = TICKS.map(() => false);

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(fd, t);
      const fv = tval(fd, t);
      if (fv !== drawn.f) place(flow, P(wireX((drawn.f = fv)), WY, CT));
      tiles.forEach((e, k) => {
         const z = tval(fz[k], t) * rise;
         moving ||= !tdone(fz[k], t);
         if (z === drawn.fz[k]) return;
         drawn.fz[k] = z;
         put(e.el, slab(P, front, e.ring, e.inner, z, z + 2));
         const [a, b] = [e.r.x + 2.5, e.r.x + FW - 2.5];
         e.ln.setAttribute("d", seg(P(a, 51, z + 2), P(b, 51, z + 2)));
         place(e.dot, P(lerp(a, b, e.r.f), 51, z + 2));
      });
      NODES.forEach((x, k) => {
         const z = CT + tval(nz[k], t) * POP;
         moving ||= !tdone(nz[k], t);
         if (z === drawn.nz[k]) return;
         drawn.nz[k] = z;
         put(
            nodes[k],
            prism(P, front, shift(nr, x, WY), shift(ni, x, WY), CT, z + NH),
         );
      });
      tk.forEach((w, k) => {
         const on = tval(w, t) > 0.5;
         moving ||= !tdone(w, t);
         if (on === tickOn[k]) return;
         tickOn[k] = on;
         ticks[k].setAttribute("class", on ? "dot ok" : "dot off");
      });
      return moving;
   });
   bag.add(B.unregister);

   const hit = (p: Vec2) => {
      const d = spots.map(([s]) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      const held = spots.findIndex(
         ([, i], j) => i === act && d[j] - d[best] < STICK,
      );
      return held >= 0 ? act : spots[best][1];
   };

   /** Picks part a (-1: none). The tick anchor is the rule group nearest the pointer. */
   function setActive(a: number, p?: Vec2) {
      if (a === act) return;
      const t = now();
      act = a;
      const k = a - 2;
      FR.forEach((_, j) => {
         const lift = k < 0 ? 0 : 1 / (1 + 0.7 * (j - k) ** 2);
         tset(fz[j], lift, t, k < 0 ? 0 : Math.abs(j - k) * 45);
      });
      tset(fd, k < 0 ? 0.25 : FR[k].f, t, 0);
      NODES.forEach((_, j) =>
         tset(nz[j], a === 0 ? 1 : 0, t, a === 0 ? j * 90 : 0),
      );
      const on = a === 1;
      const d = tickAt.map((s) =>
         p ? Math.hypot(s[0] - p[0], s[1] - p[1]) : 0,
      );
      const near = d.indexOf(Math.min(...d));
      tk.forEach((w, j) =>
         tset(w, +on, t, on ? Math.abs(j - near) * 60 + 120 : 0),
      );
      forge.sil.classList.toggle("hi", a === 0);
      tiles.forEach((e, j) => e.el.sil.classList.toggle("hi", j === k));
      flow.setAttribute("class", a < 0 ? "dot" : "dot m");
      read.textContent = a < 0 ? "rest" : k < 0 ? NAMES[a] : `frame ${k + 1}`;
      B.wake();
   }

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p), p), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (rise = 6 + v * 8), destroy: bag.dispose };
};
