/**
 * SageMaker Image Classification MLOps (49): one closed loop on a plate, read
 * clockwise. Along the back the S3 bucket feeds three trainers side by side
 * (VGG16, DenseNet121, EfficientNet, in parallel), then the ensemble, then
 * the clinical quality gate with its four metric bars, then the model
 * registry; down the right to the endpoint, whose new fleet takes a canary
 * slice before the second half; back along the front through the PSI drift
 * monitor to the drift alarm; and up the left the retrain run back into the
 * bucket. The pointer's bearing round the loop, read on the floor, scrubs the
 * run on a spring: each rail grows, each stage answers in turn (the trainers
 * rise together, the gate's bars come up one by one, the canary tile before
 * the rest, the alarm turns amber) and past the alarm the loop closes. At
 * rest the run waits in the gate with one metric through, the gate bright.
 * Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, clamp, disposer, facing, fitFrame, inset, lerp, mk, open,
   pointer, proj, put, register, rrect, slab, solid, spring, stepS, unproj,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, REST, ALARM] = [3, 2.68, 8];
const PLATE = rrect(-62, -64, 62, 30, 8, 8);
/** Each stage's anchor on the rails, clockwise from the bucket: a bend at the front corner, then the retrain corner. */
const AT =
   "-48 -48,-24 -48,0 -48,24 -48,48 -48,48 -22,48 16,-10 16,-30 16,-48 16"
      .split(",")
      .map((q) => q.split(" ").map(Number) as Vec2);
/** A floor point's bearing round the loop's centre, in degrees clockwise from the bucket. */
const bearing = (x: number, y: number) =>
   (((Math.atan2(y + 16, x) - Math.atan2(-32, -48)) * 180) / Math.PI + 720) %
   360;
const ANG = AT.map(([x, y]) => bearing(x, y)).concat(360);
const READ =
   "s3,train x3,ensemble,gate,approve,canary,prod,psi,drift,retrain".split(",");
/** Stage s's share done at run position p. */
const share = (p: number, s: number) => clamp((p - s + 0.5) * 2, 0, 1);
/** A part: footprint, the stage it answers, its [z0, z1] by that share and the lift. */
type Part = [Ring, number, (s: number, L: number) => [number, number]];
const box = (x0: number, y0: number, x1: number, y1: number, r = 3.4) =>
   rrect(x0, y0, x1, y1, r, 8);
const rise =
   (h: number) =>
   (s: number, L: number): [number, number] => [s * L, s * L + h];
const grow =
   (z: number, h: number, a: number, b: number) =>
   (s: number): [number, number] => [
      z,
      z + Math.max(0.3, h * clamp((s - a) / (b - a), 0, 1)),
   ];
const fixed = (h: number) => (): [number, number] => [0, h];
/** Back to front by x + y, so appending is painting. */
const PARTS: Part[] = [
   [circ(9, 48).map((q) => ({ ...q, u: q.u - 48, v: q.v - 48 })), 0, fixed(10)],
   [box(-31, -60, -17, -52), 1, rise(4)],
   [box(-31, -49, -17, -41), 1, rise(4)],
   [box(-31, -38, -17, -30), 1, rise(4)],
   [box(-7, -55, 7, -41), 2, rise(5)],
   [box(13, -56, 35, -40, 4), 3, fixed(2)],
   ...[8, 10, 7, 9].map((h, k): Part => [
      box(15.5 + k * 5, -51, 19.5 + k * 5, -45, 1.3),
      3,
      grow(2, h, k * 0.22, k * 0.22 + 0.3),
   ]),
   [box(41, -55, 55, -41), 4, rise(4)],
   [box(-37, 10, -23, 22), ALARM, fixed(5)],
   [box(40, -32, 56, -12, 4), 5, fixed(2)],
   [box(43, -29, 53, -23, 2.4), 5, grow(2, 7, 0, 0.45)],
   [box(43, -20, 53, -14, 2.4), 5, grow(2, 7, 0.55, 1)],
   [box(-17, 10, -3, 22), 7, rise(4)],
];
/** The part whose stroke is the bright mark for each stage; the retrain corner hands it back to the bucket. */
const MARK = [0, 2, 4, 5, 10, 12, 12, 15, 11, 0];
const lift = (v: number) => 3 + v * 4;
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   AT.map(([x, y]): Vec3 => [x, y, lift(1) + 12]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C), front: facing(C) };
}

export const frame = FRAMES.cover;
/** Round the loop: the gate, the endpoint, the drift alarm, the retrain corner, then away. */
export const tour: Tour = ((P) => [
   ...[3, 5, 8, 9].map((i) => P(AT[i][0], AT[i][1], 0)),
   null,
])(camera(frame).P);

/** The run position for a bearing on the loop, in degrees from the bucket. */
function toRun(a: number) {
   let i = 0;
   while (i < AT.length - 1 && a >= ANG[i + 1]) i++;
   return i + (a - ANG[i]) / (ANG[i + 1] - ANG[i]);
}
const restAngle = lerp(ANG[2], ANG[3], REST - 2);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let L = lift(value);
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   // The rails lie on the floor, under every plate: a dim wire, and the run grown over it.
   const rails = AT.map((a, i) =>
      [a, AT[(i + 1) % AT.length]].map((q) => P(q[0], q[1], 0)),
   );
   rails.forEach((r) => mk("path", { d: open(r), class: "nf lo" }, g));
   const lines = rails.map(() => mk("path", { class: "nf sil" }, g));
   const parts = PARTS.map(([ring]) => {
      const inner = inset(C, ring, 1);
      return { ring, inner: inner.length > 2 ? inner : null, el: solid(g) };
   });
   const run = spring(REST);
   const drawn = PARTS.map(() => "");
   const ld = rails.map(() => Number.NaN);
   let [mark, cls, cur, over] = [parts[MARK[3]].el.sil, "hi", -1, false];

   const B = register(stage, (dt) => {
      const moving = stepS(run, dt);
      const p = run.x;
      rails.forEach((r, i) => {
         const l = clamp((p - i) / 0.6, 0, 1);
         if (l === ld[i]) return;
         ld[i] = l;
         const end: Vec2 = [
            lerp(r[0][0], r[1][0], l),
            lerp(r[0][1], r[1][1], l),
         ];
         lines[i].setAttribute("d", l > 0.01 ? open([r[0], end]) : "");
      });
      PARTS.forEach(([, s, pose], k) => {
         const [z0, z1] = pose(share(p, s), L);
         const key = `${z0}|${z1}`;
         if (key === drawn[k]) return;
         drawn[k] = key;
         const { ring, inner, el } = parts[k];
         put(el, slab(P, front, ring, z1 - z0 > 0.5 ? inner : null, z0, z1));
      });
      // One bright place: the stage the run has reached; amber when it is the drift alarm.
      const at = clamp(Math.round(p), 0, AT.length - 1);
      if (at !== cur) {
         cur = at;
         mark.classList.remove(cls);
         mark = parts[MARK[at]].el.sil;
         mark.classList.add((cls = at === ALARM ? "warn" : "hi"));
      }
      // The gate reads how many of its four metrics are through.
      const bars = PARTS.filter(
         ([, s, pose], k) => s === 3 && k > 5 && pose(share(p, 3), L)[1] > 6,
      );
      const text = !over
         ? "rest"
         : at === 3
           ? `gate ${bars.length}/4`
           : READ[at];
      if (read.textContent !== text) read.textContent = text;
      return moving;
   });
   bag.add(B.unregister);

   // The bearing on the floor, which never moves; once over, unwrapped so the run never jumps the seam.
   let raw = restAngle;
   const move = ([sx, sy]: Vec2) => {
      const [x, y] = unproj(C, sx, sy, 0);
      let a = bearing(x, y);
      if (over) a += 360 * Math.round((raw - a) / 360);
      raw = clamp(a, 0, 360);
      over = true;
      run.t = Math.min(AT.length - 0.01, toRun(raw));
      B.wake();
   };
   const leave = () => {
      raw = restAngle;
      run.t = REST;
      over = false;
      B.wake();
   };
   bag.add(pointer(stage, { move, leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         L = lift(v);
         drawn.fill("");
         B.wake();
      },
      destroy: bag.dispose,
   };
};
