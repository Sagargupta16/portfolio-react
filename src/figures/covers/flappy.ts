/**
 * Flappy Bird Game Unity (18): five pipes along a ground strip, each a post
 * planted in the ground and a post hung from the sky with a capped gap
 * between them, every gap at its own height, and a bird about to reach the
 * first. The pointer picks a pipe by its rest centre's x (a single row): the
 * bird flies the gaps up to it, holding level through each pipe and arcing
 * between them, a flap and then gravity, and every pipe it clears lights its
 * score dot in turn. The chosen pipe takes the bright edge from the bird.
 * Intensity is the flap: how high each arc rises.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, clamp, disposer, facing, fitFrame, flatDot, lerp, mk,
   now, place, pointer, prism, proj, put, register, rrect, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
import type {
   FigureMount,
   Frame,
   Ring,
   Tour,
   Vec2,
   Vec3,
} from "@/figures/hairline";

const [SP, GAP, PR, CAP, TOP, GR, HOLD] = [34, 28, 5.5, 3, 96, 4, 0.34];
/** Each gap's centre height, and the height the bird comes in at. */
const GAPS = [44, 60, 36, 56, 40];
const [IN, REST] = [50, -0.55];
const s2 = Math.SQRT1_2;
/** A point t along the run and w toward the viewer: the run is level on screen. */
const at = (t: number, w = 0): Vec2 => [(t + w) * s2, (w - t) * s2];
/** A rounded rectangle in run coordinates, turned onto the ground. */
const turn = (t0: number, w0: number, t1: number, w1: number, r: number) =>
   rrect(t0, w0, t1, w1, r, 6).map((q) => {
      const [u, v] = at(q.u, q.v);
      return { u, v, nu: (q.nu + q.nv) * s2, nv: (q.nv - q.nu) * s2 };
   });
const shift = (ring: Ring, [x, y]: Vec2): Ring =>
   ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
const GROUND = turn(-SP * 1.3, -12, SP * 4.5, 12, 6);
const BODY = [turn(-5.8, -4.4, 5.8, 4.4, 3.6), turn(-4.6, -3.2, 4.6, 3.2, 2.4)];
const BEAK = [turn(5, -1.6, 9, 1.6, 1), turn(5.6, -0.9, 8.3, 0.9, 0.5)];

/** The bird's height at s, in pipes: level through a pipe, an arc between two. */
function fly(s: number, arc: number) {
   const i = Math.floor(s);
   const f = clamp((s - i - HOLD) / (1 - 2 * HOLD), 0, 1);
   const [a, b] = [GAPS[i] ?? IN, GAPS[i + 1] ?? IN];
   return lerp(a, b, f * f * (3 - 2 * f)) + arc * 4 * f * (1 - f);
}

const EXTENT = GROUND.map((q): Vec3 => [q.u, q.v, -GR]).concat(
   GROUND.map((q): Vec3 => [q.u, q.v, TOP]),
);
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = GAPS.map((g, i) => P(...at(i * SP), g));
   return { C, P, spot };
}

export const frame = FRAMES.cover;
/** The second pipe, the fourth, the last, then away. */
export const tour: Tour = (({ spot }) => [spot[1], spot[3], spot[4], null])(
   camera(frame),
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, spot } = camera(f);
   const front = facing(C);
   const bag = disposer();
   let arc = 4 + 8 * value;
   const g = mk("g", {}, svg);
   put(
      solid(g),
      prism(
         P,
         front,
         GROUND,
         turn(-SP * 1.3 + 1.4, -10.6, SP * 4.5 - 1.4, 10.6, 4.6),
         -GR,
         0,
      ),
   );
   const score = GAPS.map((_, i) => {
      const d = flatDot(g, C, 1.6, "dot off");
      place(d, P(...at(i * SP, 9.4), 0));
      return d;
   });

   // Each pipe: the ground post and its cap, the cap of the hung post and the post.
   const pipes = GAPS.map((gz, i) => {
      const o = at(i * SP);
      const [lo, hi] = [gz - GAP / 2, gz + GAP / 2];
      const parts: [number, number, number][] = [
         [PR, 0, lo - CAP],
         [PR + 1.3, lo - CAP, lo],
         [PR + 1.3, hi, hi + CAP],
         [PR, hi + CAP, TOP],
      ];
      return parts.map(([r, z0, z1]) => {
         const el = solid(g);
         put(
            el,
            prism(
               P,
               front,
               shift(circ(r, 40), o),
               shift(circ(r - 1, 40), o),
               z0,
               z1,
            ),
         );
         return el;
      });
   });
   const bird = solid(g);
   const beak = solid(g);
   const eye = flatDot(g, C, 1.1, "dot m");
   const s = tween(REST);
   let drawn = Number.NaN;

   const B = register(stage, (_dt, t) => {
      const u = tval(s, t);
      if (u !== drawn) {
         drawn = u;
         const o = at(u * SP);
         const z = fly(u, arc) - 3.8;
         put(
            bird,
            prism(P, front, shift(BODY[0], o), shift(BODY[1], o), z, z + 7.6),
         );
         put(
            beak,
            prism(
               P,
               front,
               shift(BEAK[0], o),
               shift(BEAK[1], o),
               z + 2.6,
               z + 4.6,
            ),
         );
         place(eye, P(...at(u * SP + 2.8, 1.8), z + 7.6));
         score.forEach((d, i) =>
            d.setAttribute("class", u > i - 0.05 ? "dot m" : "dot off"),
         );
      }
      return !tdone(s, t);
   });
   bag.add(B.unregister);

   let act = -1;
   /** Sends the bird to pipe a (-1: back to its approach); the chosen pipe takes the bright edge. */
   function choose(a: number) {
      if (a === act) return;
      pipes[act]?.forEach((el) => el.sil.classList.remove("hi"));
      pipes[a]?.forEach((el) => el.sil.classList.add("hi"));
      bird.sil.classList.toggle("hi", a < 0);
      act = a;
      tset(s, a < 0 ? REST : a, now(), 0);
      read.textContent = a < 0 ? "rest" : `pipe ${a + 1}`;
      B.wake();
   }
   bird.sil.classList.add("hi");

   /** The pipe whose rest centre is nearest the pointer's x; none past the ends of the run. */
   const hit = ([x]: Vec2) => {
      const d = spot.map((p) => Math.abs(p[0] - x));
      const best = d.indexOf(Math.min(...d));
      return d[best] < SP * C.S * 0.6 ? best : -1;
   };
   bag.add(
      pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }),
   );
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         arc = 4 + 8 * v;
         drawn = Number.NaN;
         B.wake();
      },
      destroy: bag.dispose,
   };
};
