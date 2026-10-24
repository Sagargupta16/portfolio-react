/**
 * MLOps & GenAI on AWS: the SageMaker loop, four stations on a square of
 * wires, read clockwise. Train is a stack of three thin plates (the
 * architectures trained side by side), the quality gate a plate with its
 * threshold bar across the lid, the live endpoint a round puck, and the
 * monitor a plate with its score dots. The pointer picks a station (tested at
 * rest): the wires from train round to it draw one after another, a hop
 * apart, then the station rises and takes the bright edge from the gate's
 * bar. Train itself answers with the last wire, monitor back to train: drift
 * triggers the retrain. Intensity is the rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk,
   now, open, place, pointer, proj, put, register, rrect, seg, slab, solid,
   tdone, tset, tval, tween, type FigureMount, type Frame, type Ring,
   type Solid, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [L, S, CAP, STICK, STEP] = [40, 17, 44, 12, 110];
/** Stations clockwise on screen: train (back), gate (right), endpoint (front), monitor (left). */
const XY = [0, 1, 2, 3].map((k): Vec2 => [k % 3 ? L : -L, k < 2 ? -L : L]);
const NAMES = ["train", "gate", "endpoint", "monitor"];
const HS = [2.4, 6, 7, 4.5];
/** The train stack: three plates, a little off each other: dx, dy, z0. */
const [TX, TY, TZ] = [
   [1.5, -1.5, 0.5],
   [-1, 1.2, 2],
   [0, 4.6, 9.2],
];
/** Score dots on the monitor's lid, along and across: the curve sliding off its baseline. */
const [SU, SV] = [
   [-10, -5, 0, 5, 10],
   [-1, -2, -1.5, 1.5, 5],
];
/** Wire k runs from station k to k + 1; the wires to light for each station, in order. */
const PATHS = [[3], [0], [0, 1], [0, 1, 2]];
const RINGS: Ring[] = XY.map(([x, y], i) =>
   i === 2
      ? circ(S, 48).map((q) => ({ ...q, u: q.u + x, v: q.v + y }))
      : rrect(x - S, y - S, x + S, y + S, 4, 8),
);
const TR = TX.map((dx, j) => {
   const [x, y] = [dx - L, TY[j] - L];
   return rrect(x - S, y - S, x + S, y + S, 4, 8);
});
const top = (i: number) => (i === 0 ? TZ[2] + HS[0] : HS[i]);
/** Rise in world units: 8 at intensity 0, 16 at 1. */
const riseOf = (v: number) => 8 + v * 8;
/** The most extreme pose (rule 03): every station at full rise, the train stack fanned. */
const EXTENT = RINGS.flatMap((r, i) =>
   r.flatMap((q): Vec3[] => [
      [q.u, q.v, 0],
      [q.u, q.v, top(i) + 16 * 1.6],
   ]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   return {
      C,
      P,
      front: facing(C),
      spot: XY.map(([x, y], i) => P(x, y, top(i))),
   };
}

export const frame = FRAMES.service;
/** The endpoint, then the monitor, then train (the retrain wire), then away. */
export const tour: Tour = ((s) => [s[2], s[3], s[0], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let rise = riseOf(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The wires on the floor, edge to edge: a dim run, and over it the line that draws.
   const wires = XY.map((a, k): [Vec2, Vec2] => {
      const b = XY[(k + 1) % 4];
      const d: Vec2 = [Math.sign(b[0] - a[0]) * S, Math.sign(b[1] - a[1]) * S];
      return [P(a[0] + d[0], a[1] + d[1], 0), P(b[0] - d[0], b[1] - d[1], 0)];
   });
   for (const [a, b] of wires) mk("path", { d: seg(a, b), class: "nf lo" }, g);
   const lines = wires.map(() => mk("path", { class: "nf sil" }, g));

   // Back to front by x + y: train, then gate and monitor, then the endpoint in front.
   const els: Solid[][] = [];
   for (const i of [0, 1, 3, 2])
      els[i] = i === 0 ? TR.map(() => solid(g)) : [solid(g)];
   const bar = mk("path", { class: "nf hi" }, els[1][0].g);
   const dots = SU.map(() => flatDot(els[3][0].g, C, 1.2, "dot off"));
   const inner = RINGS.map((r) => inset(C, r, 1.1));
   const trIn = TR.map((r) => inset(C, r, 1.1));

   /** Station i at rise z: its plates, and the marks on its lid. */
   function draw(i: number, z: number) {
      const [x, y] = XY[i];
      if (i === 0)
         TR.forEach((r, j) => {
            const z0 = TZ[j] + z * (0.6 + 0.4 * j);
            put(els[0][j], slab(P, front, r, trIn[j], z0, z0 + HS[0]));
         });
      else put(els[i][0], slab(P, front, RINGS[i], inner[i], z, z + HS[i]));
      const lid = z + HS[i];
      if (i === 1)
         bar.setAttribute(
            "d",
            open([P(x - 2, y - 12, lid), P(x - 2, y + 12, lid)]),
         );
      if (i === 3)
         SU.forEach((u, k) => place(dots[k], P(x + u, y + SV[k], lid)));
   }

   const [zt, lt] = [XY.map(() => tween(0)), wires.map(() => tween(0))];
   const drawn = XY.map(() => ({ z: Number.NaN, l: Number.NaN, hi: false }));
   let barHi = true;

   const B = register(stage, (_dt, t) => {
      let moving = false;
      XY.forEach((_, i) => {
         const [z, l, was] = [tval(zt[i], t), tval(lt[i], t), drawn[i]];
         if (l !== was.l) {
            was.l = l;
            const [a, b] = wires[i];
            lines[i].setAttribute(
               "d",
               l > 0.002
                  ? seg(a, [lerp(a[0], b[0], l), lerp(a[1], b[1], l)])
                  : "",
            );
         }
         if (z !== was.z) draw(i, (was.z = z) * rise);
         const hi = i === act && z > 0.5;
         if (hi !== was.hi) {
            els[i][els[i].length - 1].sil.classList.toggle("hi", (was.hi = hi));
            // the monitor's score dots come up with it
            if (i === 3)
               for (const d of dots)
                  d.setAttribute("class", hi ? "dot m" : "dot off");
         }
         moving ||= !tdone(zt[i], t) || !tdone(lt[i], t);
      });
      // One bright place: the gate's threshold bar at rest, the chosen station once it has risen.
      const rest = !drawn.some((d) => d.hi);
      if (rest !== barHi) {
         bar.classList.toggle("hi", (barHi = rest));
         bar.classList.toggle("lo", !rest);
      }
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen, so a risen station cannot flip the choice; sticky by STICK.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   /** Lights the wires to station a (-1: none) a hop apart, then raises it; leavers drop at once, the last wire first. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const path = a < 0 ? [] : PATHS[a];
      wires.forEach((_, k) => {
         const hop = path.indexOf(k);
         tset(lt[k], hop < 0 ? 0 : 1, t, hop < 0 ? (3 - k) * 40 : hop * STEP);
      });
      XY.forEach((_, i) =>
         tset(zt[i], i === a ? 1 : 0, t, i === a ? path.length * STEP : 0),
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
         rise = riseOf(v);
         drawn.forEach((d) => (d.z = Number.NaN));
         B.wake();
      },
      destroy: bag.dispose,
   };
};
