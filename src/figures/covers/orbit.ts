/**
 * Orbit (51): the people in your orbit. A round plate with you at its hub
 * and three circles drawn on the floor (family, friends, work), each contact
 * a puck on its circle, joined to you by a dashed connection. Beside it the
 * Contacts table: a base with one row per contact, the newest one at the top
 * still standing proud. The pointer picks a contact on the orbit or its row
 * in the table, one record either way: the puck lifts off its circle (its
 * circle-mates a little), the connection draws solid from you with the
 * record's interaction history as dots along it, and its row slides out of
 * the table toward the orbit and rises, staggered by distance. At rest the
 * hub is the bright mark. Intensity is how far the row slides.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   open, place, pointer, poly, proj, put, register, ringAt, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Solid, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, R, HUB, HH, CR, CH, LIFT, CAP, STICK] = [
   3, 46, 7, 7, 4.5, 4, 12, 26, 8,
];
const [X0, X1, Y0, PITCH, RW, RH, RZ, SL] = [56, 98, -96, 9.5, 7, 2.5, 9, 16];
const CIRCLES = [17, 29, 40];
const NAMES = ["family", "friend", "work"];
/** Each contact: circle, angle in degrees, interactions logged. Row i is contact i. */
const PEOPLE = [0, 205, 3, 1, 70, 2, 1, 255, 4, 2, 15, 1, 2, 135, 2, 2, 300, 3];
const N = PEOPLE.length / 3;
const circle = (i: number) => PEOPLE[i * 3];
const logged = (i: number) => PEOPLE[i * 3 + 2];
const SPOT = [...Array(N).keys()].map((i): Vec2 => {
   const [r, a] = [CIRCLES[circle(i)], (PEOPLE[i * 3 + 1] * Math.PI) / 180];
   return [r * Math.cos(a), r * Math.sin(a)];
});
/** Row i, slid by s along -x toward the orbit. */
const ROW = (i: number, s = 0) =>
   rrect(X0 - s, Y0 + i * PITCH, X1 - s, Y0 + i * PITCH + RW, 2, 6);
const BASE = rrect(X0 - 6, Y0 - 5, X1 + 6, Y0 + (N - 1) * PITCH + RW + 5, 6, 8);
const REST = [0.3, 0, 0, 0, 0, 0];
const EXTENT = circ(R, 48)
   .concat(BASE)
   .map((q): Vec3 => [q.u, q.v, -PT])
   .concat(SPOT.map(([x, y]): Vec3 => [x, y, LIFT + CH]))
   .concat(ROW(0, SL).map((q): Vec3 => [q.u, q.v, RZ + RH]));

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = SPOT.map(([x, y]) => P(x, y, CH)).concat(
      SPOT.map((_, i) => P((X0 + X1) / 2, Y0 + i * PITCH + RW / 2, RH)),
   );
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** A work contact on the orbit, the last row in the table, a friend, then away. */
export const tour: Tour = ((s) => [s[4], s[11], s[2], null])(
   camera(frame).spot,
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let [slide, act, picked, lastL] = [0.5 + value * 0.5, -1, -2, Number.NaN];
   const g = mk("g", {}, svg);
   const disc = circ(R, 96);
   put(solid(g), slab(P, front, disc, inset(C, disc, 1.4), -PT, 0));
   for (const r of CIRCLES)
      mk("path", { d: poly(ringAt(P, circ(r, 96), 0)), class: "nf lo" }, g);
   // Connections, behind the hub and the pucks: dashed to everyone, and the one that draws.
   const spoke = (i: number, k: number): Vec2 => {
      const [x, y] = SPOT[i];
      const s = HUB / Math.hypot(x, y);
      return P(lerp(x * s, x, k), lerp(y * s, y, k), 0);
   };
   for (let i = 0; i < N; i++)
      mk("path", { d: open([spoke(i, 0), spoke(i, 1)]), class: "nf dash" }, g);
   const line = mk("path", { class: "nf sil" }, g);
   // Interaction dots; the unused ones wait under the hub, which covers them.
   const under = P(0, 0, 0);
   const dots = [0, 1, 2, 3].map(() => flatDot(g, C, 1.25, "dot off"));
   const park = () => dots.forEach((d) => place(d, under));
   park();

   // The hub and the pucks, back to front by x + y.
   const dep = (i: number) => (i < 0 ? 0 : SPOT[i][0] + SPOT[i][1]);
   const order = [-1, ...SPOT.keys()].sort((a, b) => dep(a) - dep(b));
   const els = order.map(() => solid(g));
   const el = (i: number) => els[order.indexOf(i)];
   /** A solid on ring from z0, h tall, with its lip inset by b. */
   const stand = (s: Solid, ring: Ring, b: number, z0: number, h: number) =>
      put(s, slab(P, front, ring, inset(C, ring, b), z0, z0 + h));
   stand(el(-1), circ(HUB, 48), 1.1, 0, HH);
   const pucks = SPOT.map(([x, y]) =>
      circ(CR, 32).map((q) => ({ ...q, u: q.u + x, v: q.v + y })),
   );
   stand(solid(g), BASE, 1.4, -PT, PT);
   const rows = SPOT.map(() => solid(g));

   const [z, l] = [SPOT.map(() => tween(0)), tween(0)];
   const r = REST.map((v) => tween(v));
   const drawn = SPOT.map(() => ({ z: Number.NaN, r: Number.NaN }));
   const B = register(stage, (_dt, t) => {
      let moving = !tdone(l, t);
      SPOT.forEach((_, i) => {
         const [zi, ri, was] = [tval(z[i], t), tval(r[i], t), drawn[i]];
         if (zi !== was.z) stand(el(i), pucks[i], 0.9, (was.z = zi) * LIFT, CH);
         if (ri !== was.r)
            stand(rows[i], ROW(i, (was.r = ri) * SL * slide), 0.8, ri * RZ, RH);
         moving ||= !tdone(z[i], t) || !tdone(r[i], t);
      });
      const li = tval(l, t);
      if (li !== lastL && act >= 0) {
         lastL = li;
         line.setAttribute(
            "d",
            li > 0.002 ? open([spoke(act, 0), spoke(act, li)]) : "",
         );
         const n = logged(act);
         const lit = (k: number) => k < n && li > (k + 1) / (n + 1);
         dots.forEach((d, k) =>
            d.setAttribute("class", `dot ${lit(k) ? "m" : "off"}`),
         );
      }
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on rest poses: puck tops and row centres, sticky to the record already picked.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return picked >= 0 && d[picked] < CAP && d[picked] - d[best] < STICK
         ? picked
         : best;
   };

   /** Picks a record through its puck (k < N) or its row (k >= N); -1 is rest. */
   function setActive(k: number) {
      if (k === picked) return;
      const t = now();
      const a = k < 0 ? -1 : k % N;
      SPOT.forEach((_, i) => {
         const near = Math.abs(i - (a < 0 ? act : a));
         const mate = a >= 0 && i !== a && circle(i) === circle(a) ? 0.3 : 0;
         tset(z[i], i === a ? 1 : mate, t, near * 45);
         const out = a < 0 ? REST[i] : i === a ? 1 : near === 1 ? 0.15 : 0;
         tset(r[i], out, t, near * 45);
      });
      if (a !== act) {
         l.from = l.to = 0;
         lastL = Number.NaN;
         line.setAttribute("d", "");
         park();
         if (a >= 0) {
            const n = logged(a);
            dots.forEach(
               (d, j) => j < n && place(d, spoke(a, (j + 1) / (n + 1))),
            );
            tset(l, 1, t, 120);
         }
      }
      el(-1).sil.classList.toggle("hi", k < 0);
      SPOT.forEach((_, i) => el(i).sil.classList.toggle("hi", k === i));
      rows.forEach((row, i) => row.sil.classList.toggle("hi", k === i + N));
      [picked, act] = [k, a];
      const nth = [...Array(a + 1).keys()].filter(
         (i) => circle(i) === circle(a),
      );
      read.textContent = a < 0 ? "rest" : `${NAMES[circle(a)]} ${nth.length}`;
      B.wake();
   }

   setActive(-1);
   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   const set = (v: number) => {
      slide = 0.5 + v * 0.5;
      drawn.forEach((d) => (d.r = Number.NaN));
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
