/**
 * consulting-loop (AWS ProServe): one engagement as a staircase on a plate,
 * five steps climbing away from the customer (a drum at its foot): design,
 * code, the plan gate, ship and handover, each numbered by dots on its tread.
 * A floor run leads from the top step back to the customer. At rest the
 * first two steps are built, the third half way, and the customer, where the
 * need comes from, is bright. The pointer picks a step (tested at rest): the
 * stair builds up to it from the foot, a hop per step, and the steps past it
 * sink back. Handover draws the run home; the customer signs off in green.
 * Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, lerp,
   mk, nearest, now, open, part, place, proj, put, register, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, D, W, CAP, STICK, N, CU] = [3, 16, 14, 30, 8, 5, 5];
const PLATE = rrect(-56, -46, 28, 68, 10, 8);
/** Step k: its tread from y0 to y0 + D, built to 5 + 5k, unbuilt at 2 + 1.5k. */
const STEPS = Array.from({ length: N }, (_, k) => {
   const y0 = 30 - k * D;
   const ring = rrect(-W, y0, W, y0 + D, 3, 8);
   return { y0, ring, full: 5 + 5 * k, low: 2 + 1.5 * k };
});
const BUILT = [1, 1, 0.5, 0, 0];
const CUST: Vec2 = [-36, 52];
const DRUM = circ(10, 48).map((q) => ({
   ...q,
   u: q.u + CUST[0],
   v: q.v + CUST[1],
}));
const HOME: Vec2[] = [
   [-W, STEPS[N - 1].y0 + D / 2],
   [CUST[0], STEPS[N - 1].y0 + D / 2],
   [CUST[0], CUST[1] - 10],
];
const TAGS = ["design", "code", "plan", "ship", "handover", "sign-off"];
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   STEPS.map((s): Vec3 => [-W, s.y0, s.full]),
);
const height = (k: number, b: number) => lerp(STEPS[k].low, STEPS[k].full, b);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = STEPS.map((s, k) => P(0, s.y0 + D / 2, height(k, BUILT[k])));
   spot.push(P(CUST[0], CUST[1], 9));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.banner;
/** Code, then ship, then the customer's sign-off, then away. */
export const tour: Tour = ((s) => [s[1], s[3], s[CU], null])(
   camera(frame).spot,
);

const hopMs = (v: number) => 30 + v * 60;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hopMs(value);
   let act = -1;
   const g = mk("g", {}, svg);
   const floor = (pts: Vec2[]) => open(pts.map((q) => P(q[0], q[1], 0)));

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   mk("path", { d: floor(HOME), class: "nf dash" }, g);
   const home = mk("path", { class: "nf sil" }, g);

   // Back to front: the top step first, down to the foot, then the customer.
   const els = STEPS.map(() => solid(g)).reverse();
   const inner = STEPS.map((s) => inset(C, s.ring, 1));
   // Each tread's dots ride in its step's group, so a nearer step still covers them.
   const dots = STEPS.map((_, k) =>
      Array.from({ length: k + 1 }, () => flatDot(els[k].g, C, 1.2, "dot off")),
   );
   const cust = solid(g);
   put(cust, slab(P, front, DRUM, inset(C, DRUM, 1.2), 0, 9));

   const b = BUILT.map((v) => tween(v));
   const run = tween(0);
   const drawn = STEPS.map(() => Number.NaN);
   let [runDrawn, mark] = [Number.NaN, ""];

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(run, t);
      STEPS.forEach((s, k) => {
         const v = tval(b[k], t);
         moving ||= !tdone(b[k], t);
         if (v === drawn[k]) return;
         drawn[k] = v;
         const h = height(k, v);
         put(els[k], slab(P, front, s.ring, inner[k], 0, h));
         dots[k].forEach((d, j) => {
            place(d, P((j - k / 2) * 4.4, s.y0 + D / 2, h));
            d.setAttribute("class", v > 0.95 ? "dot m" : "dot off");
         });
      });
      const r = tval(run, t);
      if (r !== runDrawn) {
         runDrawn = r;
         home.setAttribute("d", r > 0.01 ? floor(part(HOME, r)) : "");
      }
      // One bright place: the chosen step once built; the customer at rest, green on sign-off.
      const pick = act < 0 ? CU : act;
      const ready = pick === CU ? act < 0 || r > 0.98 : drawn[pick] > 0.95;
      const cls = act === CU ? "ok" : "hi";
      const key = ready ? `${pick}${cls}` : "";
      if (key !== mark) {
         [...els, cust].forEach((e) => e.sil.classList.remove("hi", "ok"));
         if (ready)
            (pick === CU ? cust : els[pick]).sil.classList.add(key.slice(1));
         mark = key;
      }
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; sticky by STICK.
   const hit = nearest(spot, CAP, STICK);

   /** Builds the stair up to step a from the foot; handover and sign-off draw the run home. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const top = a === CU ? N - 1 : a;
      b.forEach((tw, k) => {
         const to = a < 0 ? BUILT[k] : Number(k <= top);
         tset(tw, to, t, to > tval(tw, t) ? k * step : (N - k) * step * 0.5);
      });
      tset(run, a >= N - 1 ? 1 : 0, t, a >= N - 1 ? N * step : 0);
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, (q) => hit(q, act), setActive);
   const set = (v: number) => {
      step = hopMs(v);
   };
   return { set, destroy: bag.dispose };
};
