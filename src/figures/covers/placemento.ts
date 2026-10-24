/**
 * Placemento (21): the placement portal as one board, read back to front:
 * the companies (blocks, numbered by dots on the lid), the batch's students
 * (a grid of tiles, each with its placed dot), and the stats pie, a disc cut
 * into one sector per company and one for the students not yet placed. The
 * pointer picks a company, on its block, a student or its sector (each
 * tested at rest): the students placed there stand up, staggered by hops
 * from the company's row, and once they are up its sector slides out of the
 * pie. At rest the first company's sector stands ajar and bright. Intensity
 * is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fillet, fitFrame, flatDot, follow, inset, mk,
   now, place, prism, proj, put, register, rings, rrect, slab, solid, tdone,
   tset, tval, tween, unproj,
   type FigureMount, type Frame, type Ring, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [PT, TP, ROW, COL, RISE] = [3, 10, 16, 14, 9];
/** Each company's height; company c stands at row c. */
const CH = [9, 6, 11];
/** Each student's company, row by row; 3 is not placed yet. */
const STU = [0, 1, 3, 0, 2, 1, 0, 3, 2];
const [PX, PY, R, PH] = [98, -12, 20, 6];
const PLATE = rrect(-8, -38, 126, 50, 10, 8);
const sx = (i: number) => 32 + (i % 3) * COL;
const sy = (i: number) => Math.floor(i / 3) * ROW;
const foot = (i: number) => [sx(i), sy(i), sx(i) + TP, sy(i) + TP] as const;
const within = (u: number, v: number, [x0, y0, x1, y1]: readonly number[]) =>
   u > x0 - 2 && u < x1 + 2 && v > y0 - 2 && v < y1 + 2;
const shift = (r: Ring, d: Vec2) =>
   r.map((q) => ({ ...q, u: q.u + d[0], v: q.v + d[1] }));
const count = [0, 1, 2, 3].map((c) => STU.filter((s) => s === c).length);
const start = count.map((_, c) => count.slice(0, c).reduce((a, b) => a + b, 0));
const ang = (k: number) => -Math.PI / 2 + (k / STU.length) * Math.PI * 2;
const mid = (c: number) => ang(start[c] + count[c] / 2);

/** A pie sector as a ring, inset by b: arc samples and the centre, rounded, with outward normals. */
function sector(c: number, b = 0): Ring {
   const [a0, a1] = [ang(start[c]), ang(start[c] + count[c])];
   const o = b / Math.sin((a1 - a0) / 2);
   const pts: Vec2[] = [[PX + o * Math.cos(mid(c)), PY + o * Math.sin(mid(c))]];
   for (let k = 0; k <= 12; k++) {
      const a = a0 + ((a1 - a0) * k) / 12;
      pts.push([PX + (R - b) * Math.cos(a), PY + (R - b) * Math.sin(a)]);
   }
   const rs = pts.map((_, k): number => (k === 1 || k === 13 ? 1.4 : 0));
   rs[0] = 2;
   const f = fillet(pts, rs, 3).filter(
      (q, k, a) =>
         k === 0 || Math.hypot(q[0] - a[k - 1][0], q[1] - a[k - 1][1]) > 1e-6,
   );
   return f.map(([u, v], k) => {
      const [a, b] = [f[(k + f.length - 1) % f.length], f[(k + 1) % f.length]];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return { u, v, nu: (b[1] - a[1]) / l, nv: (a[0] - b[0]) / l };
   });
}

/** The most extreme pose (rule 03): the plate, the tall company, risen students, a sector out. */
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [0, 0, 11],
   [PX + R + 8, PY - R - 8, PH + 4],
   [sx(0), sy(0), RISE + 2],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = CH.map((h, r) => P(TP / 2 + 2, r * ROW + 5, h));
   const cut = [0, 1, 2, 3].map((c): Vec2 =>
      P(PX + R * 0.6 * Math.cos(mid(c)), PY + R * 0.6 * Math.sin(mid(c)), PH),
   );
   return { C, P, front: facing(C), spot, cut };
}

export const frame = FRAMES.cover;
/** The second company, its sector, the third company, then away. */
export const tour: Tour = ((k) => [k.spot[1], k.cut[1], k.spot[2], null])(
   camera(frame),
);

const per = (v: number) => 30 + v * 30;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = per(value);
   let [act, painted] = [-2, ""];
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));

   // Companies, then students, back to front by x + y; each with its dots on the lid.
   const cos = CH.map((h, r) => {
      const [ring, inner] = rings(2, r * ROW, 2 + TP, r * ROW + TP, 2.6, 1);
      const el = solid(g);
      put(el, prism(P, front, ring, inner, 0, h));
      for (let k = 0; k <= r; k++)
         place(flatDot(g, C, 1.1, "dot m"), P(4.6 + k * 2.6, r * ROW + 5, h));
      return el;
   });
   const stu = STU.map((s, i) => {
      const [ring, inner] = rings(...foot(i), 2.2, 0.8);
      const el = solid(g);
      const dot = flatDot(g, C, 1.2, s < 3 ? "dot m" : "dot off");
      return { ring, inner, el, dot, z: tween(0), drawn: Number.NaN };
   });
   const pie = [0, 1, 2, 3].map((c) => {
      const ring = sector(c);
      const inner = sector(c, 1);
      return { ring, inner, el: solid(g), out: tween(c ? 0 : 0.5), drawn: -1 };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      stu.forEach((s, i) => {
         const z = tval(s.z, t);
         moving ||= !tdone(s.z, t);
         if (z === s.drawn) return;
         s.drawn = z;
         put(s.el, prism(P, front, s.ring, s.inner, z * RISE, z * RISE + 2));
         place(s.dot, P(sx(i) + TP / 2, sy(i) + TP / 2, z * RISE + 2));
      });
      // A sector slides out along its middle and lifts; the pie repaints back to front.
      const keys = pie.map((s, c) => {
         const o = tval(s.out, t);
         const d: Vec2 = [8 * o * Math.cos(mid(c)), 8 * o * Math.sin(mid(c))];
         moving ||= !tdone(s.out, t);
         if (o !== s.drawn) {
            s.drawn = o;
            const [r, n] = [shift(s.ring, d), shift(s.inner, d)];
            put(s.el, prism(P, front, r, n, o * 3, o * 3 + PH));
         }
         return (Math.cos(mid(c)) + Math.sin(mid(c))) * (R + 8 * o) + o * 9;
      });
      const order = [0, 1, 2, 3].sort((a, b) => keys[a] - keys[b]);
      if (order.join() !== painted) {
         painted = order.join();
         order.forEach((c) => g.append(pie[c].el.g));
      }
      return moving;
   });
   bag.add(B.unregister);

   /** The group under p (company 0 to 2, 3 not placed): company tops, students, then the pie, all at rest. */
   const hit = ([x, y]: Vec2) => {
      for (let c = 2; c >= 0; c--) {
         const [u, v] = unproj(C, x, y, CH[c]);
         if (within(u, v, [2, c * ROW, 2 + TP, c * ROW + TP])) return c;
      }
      const [u, v] = unproj(C, x, y, 2);
      const i = STU.findIndex((_, k) => within(u, v, foot(k)));
      if (i >= 0) return STU[i];
      const [pu, pv] = unproj(C, x, y, PH);
      if (Math.hypot(pu - PX, pv - PY) > R + 4) return -1;
      const a = Math.atan2(pv - PY, pu - PX) + Math.PI / 2;
      const k = (((a / (Math.PI * 2)) % 1) + 1) % 1;
      return count.filter((_, c) => start[c] <= k * STU.length).length - 1;
   };

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const row = a >= 0 && a < 3 ? a : 1;
      let far = 0;
      stu.forEach((s, i) => {
         const hop = 1 + (i % 3) + Math.abs(Math.floor(i / 3) - row);
         if (STU[i] === a) far = Math.max(far, hop);
         tset(s.z, STU[i] === a ? 1 : 0, t, hop * step);
      });
      cos.forEach((el, c) => el.sil.classList.toggle("hi", c === a));
      pie.forEach((s, c) => {
         let to = c === a ? 1 : 0;
         if (a < 0 && c === 0) to = 0.5;
         tset(s.out, to, t, c === a ? (far + 1) * step : 0);
         s.el.sil.classList.toggle("hi", a < 0 ? c === 0 : a === 3 && c === 3);
      });
      act = a;
      const name = a < 3 ? `co${a + 1}` : "open";
      read.textContent = a < 0 ? "rest" : `${name} ${count[a]}/${STU.length}`;
      B.wake();
   }

   setActive(-1);
   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = per(v);
   };
   return { set, destroy: bag.dispose };
};
