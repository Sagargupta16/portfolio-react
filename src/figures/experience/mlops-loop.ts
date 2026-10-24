/**
 * mlops-loop (SageMaker): a closed track on a plate. Data (a drum) feeds the
 * training station, three model plates stacked; the loop runs on to the
 * quality gate (two posts and a bar), the endpoint's blue and green tiles,
 * the drift monitor (a tile with a dot per score) and back to training. At
 * rest the run is drawn up to the gate, which is bright: a model waiting on
 * its metrics. The pointer picks a station (tested at rest) and the run
 * draws round the loop to it; each station answers as the line reaches it:
 * the models fan out, the gate's bar lifts, traffic shifts to green, the
 * drift scores fill and the monitor's alarm fires amber as the retrain edge
 * closes the loop. Intensity is how far the models fan.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   nearest, now, open, part, place, proj, put, register, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CAP, STICK, RISE, PH] = [3, 34, 10, 5, 13];
const PLATE = rrect(-92, -44, 70, 44, 10, 8);
const arc = (cx: number, cy: number, a: number): Vec2[] =>
   [0, 1, 2, 3, 4].map((k) => {
      const t = a + (k * Math.PI) / 8;
      return [cx + 14 * Math.cos(t), cy + 14 * Math.sin(t)];
   });
/** The run: data into training, then clockwise round the loop and back into training. */
const PATH: Vec2[] = [
   [-70, 0],
   [-30, 0],
   ...arc(-16, -10, Math.PI),
   [10, -24],
   ...arc(36, -10, 1.5 * Math.PI),
   [50, 0],
   ...arc(36, 10, 0),
   [10, 24],
   ...arc(-16, 10, Math.PI / 2),
   [-30, 0],
];
const LEN = PATH.slice(1).map((b, i) =>
   Math.hypot(b[0] - PATH[i][0], b[1] - PATH[i][1]),
);
const TOTAL = LEN.reduce((s, d) => s + d, 0);
const at = (i: number) => LEN.slice(0, i).reduce((s, d) => s + d, 0) / TOTAL;
/** data, train, gate, endpoint, monitor: centre and where the run reaches it (0 to 1). */
const ST: [number, number, number][] = [
   [-70, 0, 0],
   [-30, 0, at(1)],
   [10, -24, at(7)],
   [50, 0, at(13)],
   [10, 24, at(19)],
];
const TAGS = ["data", "train", "gate", "deploy", "drift"];
const REST = ST[2][2] - 0.05;
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [-40, -10, 20],
   [10, -32, PH + 8],
]);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = ST.map(([x, y], i) => P(x, y, [8, 9, PH, 5, 5][i]));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.banner;
/** Training, the endpoint, the monitor, then away. */
export const tour: Tour = ((s) => [s[1], s[3], s[4], null])(camera(frame).spot);

const sq = (x: number, y: number, h: number) =>
   rrect(x - h, y - h, x + h, y + h, Math.min(3, h * 0.4), 8);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let fan = 1 + value * 4;
   let act = -1;
   const g = mk("g", {}, svg);
   const floor = (pts: Vec2[]) => open(pts.map((q) => P(q[0], q[1], 0)));

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   mk("path", { d: floor(PATH), class: "nf lo" }, g);
   const line = mk("path", { class: "nf sil" }, g);

   // Parts back to front by x + y; each is redrawn from its station's reach.
   const drum = circ(9, 48).map((q) => ({ ...q, u: q.u - 70 }));
   const parts = {
      data: solid(g),
      models: [0, 1, 2].map(() => solid(g)),
      posts: [-8, 8].map(() => solid(g)),
      bar: solid(g),
      mon: solid(g),
      blue: solid(g),
      green: solid(g),
   };
   put(parts.data, slab(P, front, drum, inset(C, drum, 1), 0, 8));
   const MODEL = sq(-30, 0, 11);
   const [BLUE, GREEN, MON] = [sq(50, -8, 7), sq(50, 8, 7), sq(10, 24, 10)];
   const BAR = rrect(7, -33, 13, -15, 1.5, 4);
   parts.posts.forEach((el, k) => {
      const r = sq(10, -24 + [-8, 8][k], 2.4);
      put(el, slab(P, front, r, null, 0, PH));
   });
   const dots = [0, 1, 2, 3].map(() => flatDot(g, C, 1.2, "dot off"));

   const run = tween(REST);
   let drawn = Number.NaN;
   const reach = (l: number, i: number) =>
      Math.max(0, Math.min(1, (l - ST[i][2]) / 0.06 + 1));

   const B = register(stage, (_dt, t) => {
      const l = tval(run, t);
      if (l === drawn) return !tdone(run, t);
      drawn = l;
      line.setAttribute("d", l > 0.005 ? floor(part(PATH, l)) : "");
      const r = ST.map((_, i) => reach(l, i));
      parts.models.forEach((el, k) => {
         const z = k * (1.6 + r[1] * fan) + r[1] * 2;
         put(el, slab(P, front, MODEL, inset(C, MODEL, 1), z, z + 1.6));
      });
      const bz = PH + r[2] * 6;
      put(parts.bar, slab(P, front, BAR, null, bz, bz + 1.6));
      const [bl, gr] = [(1 - r[3]) * RISE * 0.5, r[3] * RISE];
      put(parts.blue, slab(P, front, BLUE, inset(C, BLUE, 1), bl, bl + 5));
      put(parts.green, slab(P, front, GREEN, inset(C, GREEN, 1), gr, gr + 5));
      put(parts.mon, slab(P, front, MON, inset(C, MON, 1), 0, 5));
      dots.forEach((d, k) => {
         place(d, P(10 + (k - 1.5) * 4.2, 24 - (k - 1.5) * 4.2, 5));
         const on = l >= ST[4][2] + ((k + 0.5) * (1 - ST[4][2])) / 4;
         d.setAttribute("class", on ? "dot m" : "dot off");
      });
      // One bright place: the chosen station once the run has reached it; the gate at rest.
      const pick = act < 0 ? 2 : act;
      const lit = act < 0 || r[pick] > 0.5;
      const sil = [
         parts.data.sil,
         parts.models[2].sil,
         parts.bar.sil,
         parts.green.sil,
         parts.mon.sil,
      ];
      sil.forEach((s, i) => {
         s.classList.toggle("hi", lit && i === pick && i !== 4);
         s.classList.toggle("warn", lit && i === pick && i === 4 && l > 0.995);
      });
      return !tdone(run, t);
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; sticky by STICK.
   const pick = nearest(spot, CAP, STICK);

   /** The run draws to station a; the monitor closes the loop. */
   function setActive(a: number) {
      if (a === act) return;
      let to = REST;
      if (a === 4) to = 1;
      else if (a >= 0) to = ST[a][2] + 0.02;
      tset(run, to, now(), 0);
      act = a;
      drawn = Number.NaN;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, (q) => pick(q, act), setActive);
   const set = (v: number) => {
      fan = 1 + v * 4;
      drawn = Number.NaN;
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
