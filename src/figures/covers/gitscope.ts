/**
 * GitScope (37): the Chrome extension on a GitHub profile. A browser plate
 * holds the toolbar with the extension's tile, the profile's sidebar (avatar,
 * name lines) and its main column (pinned repos, the contribution graph).
 * dashboard.js injects its panel into the sidebar under the avatar, one
 * section after another: the nine-stat grid, the languages bar, the activity
 * heatmap and the contribution donut, each over a dashed slot. The pointer
 * picks a section (tested at rest): it and every section before it drop into
 * their slots in injection order, staggered by hop, while the later ones hang
 * above; the extension's tile pulls the whole panel back up for a fresh query.
 * At rest the stat grid has landed and the avatar, the profile content.js
 * spotted, holds the bright edge. Intensity is the hang height.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   nearest, now, place, poly, proj, put, ringAt, register, rrect, seg, slab,
   solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type {
   FigureMount,
   Frame,
   Ring,
   Tour,
   Vec2,
   Vec3,
} from "@/figures/hairline";

const [W, L, PT, TH, CAP, STICK] = [132, 152, 3, 2, 30, 8];
const NAMES = ["stats", "langs", "heatmap", "donut", "graphql"];
const [SX0, SX1, MX0, MX1] = [6, 50, 58, 126];
/** The panel's sections down the sidebar, [y0, y1], in the order dashboard.js appends them. */
const SECT: Vec2[] = [
   [66, 90],
   [93, 102],
   [105, 122],
   [125, 146],
];
const at = (r: Ring, x: number, y: number): Ring =>
   r.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
/** n cells, cols across, from (x, y) at pitch (dx, dy): each cell's corner. */
const grid = (n: number, cols: number, [x, y]: Vec2, dx: number, dy: number) =>
   Array.from({ length: n }, (_, k): Vec2 => [
      x + (k % cols) * dx,
      y + Math.floor(k / cols) * dy,
   ]);
const box = ([x, y]: Vec2, w: number, h: number) =>
   rrect(x, y, x + w, y + h, 1, 3);
/** Each section's marks on its lid: the stat cells, the language shares, the donut's two rounds. */
const MARKS: Ring[][] = [
   grid(9, 3, [10, 69], 12.6, 6.8).map((q) => box(q, 10, 5)),
   [16, 9, 5, 3].map((w, k) => box([[10, 27, 37, 43][k], 96], w, 3)),
   [],
   [7.5, 4].map((r) => at(circ(r, 32), 28, 135.5)),
];
/** The heatmap's cells, and which are busy. */
const HEAT = grid(21, 7, [11, 109], 5.4, 4.6);
const REST_K = 2;
const PAGE = rrect(0, 0, W, L, 7, 8);
const TILE = rrect(W - 18, 3, W - 7, 12, 2.4, 4);
const AVATAR = at(circ(14, 48), 28, 34);
const PINS = grid(6, 2, [MX0, 20], 35, 21).map((q) => box(q, 33, 17));
const hang = (j: number, k: number, gap: number) =>
   j > k ? gap * (0.6 + 0.4 * (j - k)) : 0;
const EXTENT = PAGE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   SECT.map(([, y]): Vec3 => [SX0, y, hang(3, -1, 8) + TH]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = SECT.map(([a, b], j) =>
      P(28, (a + b) / 2, hang(j, REST_K, 6) + TH),
   );
   spot.push(P(W - 12.5, 7.5, 3));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The languages bar, the donut, then the extension's tile, then away. */
export const tour: Tour = ((s) => [s[1], s[3], s[4], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let gap = 4 + 4 * value;
   let act = -2;
   const g = mk("g", {}, svg);
   const flat = (r: Ring, z: number, cls: string) =>
      mk("path", { d: poly(ringAt(P, r, z)), class: cls }, g);

   // The browser: toolbar strip with the extension's tile, then the profile.
   put(solid(g), slab(P, front, PAGE, inset(C, PAGE, 1.6), -PT, 0));
   flat(rrect(5, 3, W - 22, 12, 4.5, 6), 0, "nf lo");
   const tile = solid(g);
   put(tile, slab(P, front, TILE, inset(C, TILE, 0.8), 0, 3));
   for (const [a, b] of SECT) flat(rrect(SX0, a, SX1, b, 2.5, 4), 0, "nf dash");
   const avatar = solid(g);
   put(avatar, slab(P, front, AVATAR, inset(C, AVATAR, 1), 0, 4));
   const lines = [52, 56.5].map((y, k) =>
      seg(P(SX0 + 4, y, 0), P(SX1 - 8 - k * 12, y, 0)),
   );
   mk("path", { d: lines.join(""), class: "nf" }, g);

   // The injected sections, top of the sidebar first: each its own group, its marks riding on its lid.
   const secs = SECT.map(([a, b], j) => {
      const sg = mk("g", {}, g);
      const ring = rrect(SX0, a, SX1, b, 2.5, 6);
      const el = solid(sg);
      const marks = MARKS[j].map(() => mk("path", { class: "nf lo" }, sg));
      const dots = (j === 2 ? HEAT : []).map((_, k) =>
         flatDot(sg, C, 0.9, (k * 7) % 5 < 2 ? "dot m" : "dot off"),
      );
      const z = tween(hang(j, REST_K, gap));
      return {
         ring,
         inner: inset(C, ring, 1.2),
         el,
         marks,
         dots,
         z,
         drawn: -1,
      };
   });
   // The main column, in front of the sidebar: pinned repos and the contribution graph.
   for (const r of PINS) put(solid(g), slab(P, front, r, null, 0, 1.6));
   flat(rrect(MX0, 86, MX1, 110, 2.5, 4), 0, "nf");
   for (let k = 0; k < 44; k++)
      place(
         flatDot(g, C, 0.9, "dot off"),
         P(MX0 + 5 + (k % 11) * 5.8, 91 + Math.floor(k / 11) * 4.8, 0),
      );

   const B = register(stage, (_dt, t) => {
      let moving = false;
      secs.forEach((s, j) => {
         const z = tval(s.z, t);
         moving ||= !tdone(s.z, t);
         if (z === s.drawn) return;
         s.drawn = z;
         const top = z + TH;
         put(s.el, slab(P, front, s.ring, s.inner, z, top));
         MARKS[j].forEach((r, k) =>
            s.marks[k].setAttribute("d", poly(ringAt(P, r, top))),
         );
         s.dots.forEach((d, k) => place(d, P(HEAT[k][0], HEAT[k][1], top)));
      });
      return moving;
   });
   bag.add(B.unregister);

   /** Section a and those before it land; 4 is the tile, which lifts them all; -1 is rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      let k = a;
      if (a < 0) k = REST_K;
      else if (a === 4) k = -1;
      secs.forEach((s, j) => {
         const delay = (j <= k ? j : j - Math.max(k, 0)) * 55;
         tset(s.z, hang(j, k, gap), t, delay);
         s.el.sil.classList.toggle("hi", j === a);
      });
      avatar.sil.classList.toggle("hi", a < 0);
      tile.sil.classList.toggle("hi", a === 4);
      act = a;
      read.textContent = a < 0 ? "rest" : NAMES[a];
      B.wake();
   }
   setActive(-1);

   // Sticky on the last hit, which a leave does not clear.
   let held = -1;
   const pick = nearest(spot, CAP, STICK);
   const hit = (p: Vec2) => {
      held = pick(p, held);
      return held;
   };
   follow(bag, stage, svg, hit, setActive);
   return {
      set: (v) => {
         gap = 4 + 4 * v;
         const a = act;
         act = -2;
         setActive(a);
      },
      destroy: bag.dispose,
   };
};
