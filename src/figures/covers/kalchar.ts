/**
 * Kalchar (44): the /work gallery. A rail of four style pills (Madhubani,
 * Pichwai, Lippan, Gond, numbered one to four dots) sits along the far edge of
 * the page, over a masonry wall of museum plates, each with its gold inset
 * line and its style's dots. The pointer picks a pill, or a plate (which
 * picks its style), tested at rest: that style's plates lift off the wall,
 * the rest settle flat, staggered by distance from the pill, and the pill
 * takes the bright edge. At rest the Madhubani filter is on, its plates a
 * little proud. Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, mk, now, place,
   pointer, proj, put, register, rrect, slab, solid, tdone, tset, tval, tween,
   type FigureMount, type Frame, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const STYLES = ["madhubani", "pichwai", "lippan", "gond"];
const [W, PT, TH, PILL, REST, MAX, CAP, STICK] = [
   124, 3, 1.6, 2.4, 4, 11, 30, 8,
];
/** Masonry: each column's plates top to bottom, their lengths and their styles. */
const LENS = [
   [34, 22, 40, 18],
   [24, 38, 28, 20],
   [30, 20, 36, 26],
   [22, 36, 24, 34],
];
const STY = [
   [0, 2, 1, 3],
   [1, 3, 0, 2],
   [3, 0, 2, 1],
   [2, 1, 3, 0],
];
const [CW, Y0, GAP] = [24, 26, 3.5];
const L = Y0 + 116 + 3 * GAP + 6;
const PILLS = STYLES.map((_, k) =>
   rrect(8 + k * 26, 8, 30 + k * 26, 17, 4.5, 6),
);
/** Every plate, in paint order (column by column, then down the page): ring, style, centre. */
const PLATES = LENS.flatMap((col, c) => {
   const x = 8 + c * 28;
   let y = Y0;
   return col.map((len, i) => {
      const s = STY[c][i];
      const p = { ring: rrect(x, y, x + CW, y + len, 3, 6), s, x, y, len };
      y += len + GAP;
      return p;
   });
});
const PAGE = rrect(0, 0, W, L, 7, 8);
const EXTENT = PAGE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   PLATES.map((p): Vec3 => [p.x, p.y, MAX + TH]),
);
const restZ = (s: number) => (s === 0 ? REST : 0);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [
      ...PILLS.map((_, k) => P(19 + k * 26, 12.5, PILL)),
      ...PLATES.map((p) => P(p.x + CW / 2, p.y + p.len / 2, restZ(p.s) + TH)),
   ];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The Pichwai pill, the Lippan pill, then a Gond plate, then away. */
export const tour: Tour = ((s) => [s[1], s[2], s[4 + 5], null])(
   camera(frame).spot,
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let lift = 4 + 7 * value;
   let act = -2;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PAGE, inset(C, PAGE, 1.6), -PT, 0));

   // The rail: each pill a low slab, numbered by its dots.
   const pills = PILLS.map((ring, k) => {
      const el = solid(g);
      put(el, slab(P, front, ring, null, 0, PILL));
      const dots = STYLES.slice(0, k + 1).map((_, j) => {
         const d = flatDot(g, C, 0.9, "dot off");
         place(d, P(19 + k * 26 + (j - k / 2) * 3.4, 12.5, PILL));
         return d;
      });
      return { el, dots };
   });

   // The wall, back to front: each plate in its own group, its dots after it.
   const plates = PLATES.map((p) => {
      const pg = mk("g", {}, g);
      const el = solid(pg);
      const dots = STYLES.slice(0, p.s + 1).map(() =>
         flatDot(pg, C, 0.9, "dot off"),
      );
      return {
         ...p,
         el,
         dots,
         inner: inset(C, p.ring, 1.3),
         z: tween(restZ(p.s)),
         drawn: Number.NaN,
      };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      for (const p of plates) {
         const z = tval(p.z, t);
         if (z !== p.drawn) {
            p.drawn = z;
            put(p.el, slab(P, front, p.ring, p.inner, z, z + TH));
            p.dots.forEach((d, j) =>
               place(d, P(p.x + 5 + j * 3.2, p.y + 4.5, z + TH)),
            );
         }
         moving ||= !tdone(p.z, t);
      }
      return moving;
   });
   bag.add(B.unregister);

   /** Filters the wall to style s (-1: back to rest, Madhubani a little proud). */
   function setActive(s: number) {
      if (s === act) return;
      const t = now();
      const on = s < 0 ? 0 : s;
      const from = PILLS[s < 0 ? Math.max(act, 0) : s][0];
      for (const p of plates) {
         const to = p.s !== on ? 0 : s < 0 ? REST : lift;
         const d = Math.hypot(p.x + CW / 2 - from.u, p.y + p.len / 2 - from.v);
         tset(p.z, to, t, (d / 24) * 45);
         for (const dot of p.dots)
            dot.setAttribute("class", p.s === on ? "dot m" : "dot off");
      }
      pills.forEach((pl, k) => {
         pl.el.sil.classList.toggle("hi", k === on);
         for (const dot of pl.dots)
            dot.setAttribute("class", k === on ? "dot m" : "dot off");
      });
      act = s;
      read.textContent = s < 0 ? "rest" : STYLES[s];
      B.wake();
   }
   setActive(-1);

   /** The nearest rest spot, pill or plate, as a style; sticky by STICK. */
   const style = (i: number) =>
      i < PILLS.length ? i : PLATES[i - PILLS.length].s;
   let held = -1;
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return (held = -1);
      if (held < 0 || d[held] >= CAP || d[held] - d[best] >= STICK) held = best;
      return style(held);
   };

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         lift = 4 + 7 * v;
         const a = act;
         act = -2;
         setActive(a);
      },
      destroy: bag.dispose,
   };
};
