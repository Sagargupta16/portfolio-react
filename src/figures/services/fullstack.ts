/**
 * Full-Stack Product Builds: one product as a stack on its host. A hosting
 * plate carries the Postgres database, a drum with its band, the API, a slab
 * with three routes on its lid, and the frontend, a window with its title
 * bar, three lights and a sidebar. Each layer floats a little over the one
 * below, held by dashed drops painted behind it. The pointer's height, read
 * on the resting stack, picks a layer: the layers above it lift away on the
 * 700 ms curve, staggered out from it, so its lid opens to the eye, and it takes
 * the bright edge from the frontend. Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, extremes, facing, fitFrame, flatDot, inset,
   mk, now, open, place, pointer, poly, proj, put, register, ringAt, rrect,
   run, seg, slab, solid, tdone, tset, tval, tween, type FigureMount,
   type Frame, type Projector, type Ring, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [BT, STEP, HYS] = [4, 50, 6];
const BASE = rrect(-44, -44, 44, 44, 9, 8);
/** db, api, ui: footprint, thickness, and where each rests. */
const RINGS: Ring[] = [
   circ(21, 48),
   rrect(-29, -29, 29, 29, 6, 8),
   rrect(-36, -28, 36, 28, 6, 8),
];
const TK = [15, 6, 4.5];
const Z0 = [BT + 5, BT + 26, BT + 40];
const NAMES = ["db", "api", "ui"];
const LIT = 2;
/** Lift in world units: 24 at intensity 0, 40 at 1. */
const liftOf = (v: number) => 24 + v * 16;
/** How far layer j stands above its place when layer a is chosen: the top one furthest, and a itself a touch. */
const up = (j: number, a: number, g: number) =>
   a < 0 || j < a
      ? 0
      : j === a
        ? g * 0.2
        : g * (0.6 + (0.4 * (j - a)) / (2 - a));
/** The most extreme pose (rule 03): the base, and the frontend lifted all the way. */
const EXTENT = BASE.map((q): Vec3 => [q.u, q.v, 0]).concat(
   RINGS[2].map((q): Vec3 => [q.u, q.v, Z0[2] + TK[2] + 40]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   return {
      C,
      P,
      front: facing(C),
      mid: Z0.map((z, i) => P(0, 0, z + TK[i])[1]),
   };
}

export const frame = FRAMES.service;
const STOPS = ((c) => [2, 0, 1].map((i): Vec2 => [frame[0] / 2, c.mid[i] + 4]))(
   camera(frame),
);
/** The frontend, then down to the database, then the API, then away. */
export const tour: Tour = [...STOPS, null];

/** Lid marks for layer i with its lid at z: the drum's band, three routes, the window's chrome. */
function marks(i: number, z: number, P: Projector, front: Ring) {
   const ring = (r: Ring, h: number) => poly(ringAt(P, r, h));
   if (i === 0) return open(ringAt(P, front, z - TK[0] / 2));
   if (i === 1)
      return [-16, 0, 16]
         .map((x) => ring(rrect(x - 5, -12, x + 5, 12, 2, 3), z))
         .join("");
   return (
      seg(P(-31, -18, z), P(31, -18, z)) +
      ring(rrect(-31, -13, -16, 23, 2, 3), z) +
      ring(rrect(-11, -13, 31, 4, 2, 3), z)
   );
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, mid } = camera(f);
   const bag = disposer();
   let lift = liftOf(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The host, then each layer bottom to top: its dashed drops first, so its own plate hides them.
   put(solid(g), slab(P, front, BASE, inset(C, BASE, 1.4), 0, BT));
   const drum = run(RINGS[0], front);
   const layers = RINGS.map((ring, i) => {
      const guide = mk("path", { class: "nf dash" }, g);
      const el = solid(g);
      const lid = mk("path", { class: "nf lo" }, el.g);
      const lights =
         i === 2
            ? [-28, -24.5, -21].map(() => flatDot(el.g, C, 0.9, "dot off"))
            : [];
      const ext = extremes(P, ring);
      return {
         ring,
         inner: inset(C, ring, 1.2),
         guide,
         el,
         lid,
         lights,
         ext,
         tw: tween(0),
         drawn: Number.NaN,
         hi: false,
      };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      const zs = layers.map((L, i) => Z0[i] + tval(L.tw, t));
      layers.forEach((L, i) => {
         const z = zs[i];
         if (z !== L.drawn) {
            L.drawn = z;
            const zt = z + TK[i];
            put(L.el, slab(P, front, L.ring, L.inner, z, zt));
            L.lid.setAttribute("d", marks(i, zt, P, drum));
            L.lights.forEach((d, k) => place(d, P(-28 + k * 3.5, -22.5, zt)));
            const below = i ? zs[i - 1] + TK[i - 1] : BT;
            L.guide.setAttribute(
               "d",
               L.ext
                  .map((q) => seg(P(q.u, q.v, z), P(q.u, q.v, below)))
                  .join(""),
            );
         }
         const hi = act < 0 ? i === LIT : i === act;
         if (hi !== L.hi) L.el.sil.classList.toggle("hi", (L.hi = hi));
         moving ||= !tdone(L.tw, t);
      });
      return moving;
   });
   bag.add(B.unregister);

   // Hit bands: the resting stack's lid heights on screen, which never move; held by HYS until clearly in another.
   const xs = ringAt(P, BASE, 0).map((q) => q[0]);
   const [xa, xb] = [Math.min(...xs), Math.max(...xs)];
   const bottom = Math.max(...ringAt(P, BASE, 0).map((q) => q[1]));
   function hit([x, y]: Vec2) {
      if (x < xa || x > xb || y > bottom || y < mid[2] - 70) return -1;
      const d = mid.map((m) => Math.abs(m - y));
      const best = d.indexOf(Math.min(...d));
      return act >= 0 && d[act] - d[best] < HYS ? act : best;
   }

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const from = a < 0 ? act : a;
      layers.forEach((L, j) =>
         tset(L.tw, up(j, a, lift), t, Math.abs(j - from) * STEP),
      );
      act = a;
      read.textContent = a < 0 ? "rest" : NAMES[a];
      B.wake();
   }
   read.textContent = "rest";

   bag.add(
      pointer(stage, {
         move: (p) => setActive(hit(p)),
         leave: () => setActive(-1),
      }),
   );
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         lift = liftOf(v);
         const t = now();
         layers.forEach((L, j) => tset(L.tw, up(j, act, lift), t, 0));
         B.wake();
      },
      destroy: bag.dispose,
   };
};
