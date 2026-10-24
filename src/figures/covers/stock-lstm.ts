/**
 * Stock Market Prediction (14): an LSTM over a closing-price series. On one
 * base, three lanes run along the days: the actual Close bars at the back,
 * the predicted bars in the middle (standing only as far as the model has
 * predicted), and in front the rig, five unrolled LSTM cells and a Linear
 * head on one hidden-state rail, inside a window outline five days wide.
 * The pointer picks the day to predict: the rig slides there so the window
 * covers the five days before it, the cells fire one after another along
 * the rail (seq_length 5), and the head's prediction grows as that day's
 * bar, the bright mark, while the predicted line fills in or falls back
 * around it. Intensity is the delay per cell.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, follow, inset, mk, now, open,
   poly, proj, put, register, ringAt, rrect, slab, solid, tdone, tset, tval,
   tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Solid, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, PX, BW, SEQ, CW, CHT, PULSE] = [3, 11, 6, 5, 8, 5, 4];
const [YA, YP, YR] = [0, 9, 27];
const CLOSE = [5, 6.4, 5.8, 7.6, 7, 8.8, 8.2, 10, 9.4, 11.2];
const PRED = [0, 0, 0, 0, 0, 8.3, 8.7, 9.5, 9.9, 10.5];
const N = CLOSE.length;
const REST_W = 2;
const bar = (i: number, y: number) =>
   rrect(i * PX - BW / 2, y - BW / 2, i * PX + BW / 2, y + BW / 2, 1.6, 4);
const cell = (x: number, w = CW) =>
   rrect(x - w / 2, YR - w / 2, x + w / 2, YR + w / 2, 2.2, 6);
const BASE = rrect(-9, -8, (N - 1) * PX + 9, YR + 8, 7, 8);
const EXTENT = BASE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   CLOSE.map((h, i): Vec3 => [i * PX - BW / 2, YA - BW / 2, h]),
   [[(N - 1) * PX, YR + CW / 2, CHT + PULSE]],
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const at = CLOSE.map((h, i) => P(i * PX, YP, h / 2));
   return { C, P, front: facing(C), at };
}

export const frame = FRAMES.cover;
/** Predict day 9, then day 6, then day 10, then away. */
export const tour: Tour = ((s) => [s[8], s[5], s[9], null])(camera(frame).at);

/** Delay per cell in ms: 40 at intensity 0, 80 at 0.5, 120 at 1. */
const pace = (v: number) => 40 + v * 80;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, at } = camera(f);
   const bag = disposer();
   let [step, w] = [pace(value), -1];
   const g = mk("g", {}, svg);
   const stand = (s: Solid, r: Ring, z0: number, h: number) =>
      put(s, slab(P, front, r, inset(C, r, 0.7, 0.4), z0, z0 + h));
   stand(solid(g), BASE, -PT, PT);
   // The window and the rail, on the floor, behind every bar: redrawn as the rig slides.
   const guide = mk("path", { class: "nf" }, g);
   const rail = mk("path", { class: "nf lo" }, g);
   const actual = CLOSE.map(() => solid(g));
   CLOSE.forEach((h, i) => stand(actual[i], bar(i, YA), 0, h));
   const pred = PRED.map(() => solid(g));
   const cells = Array.from({ length: SEQ + 1 }, () => solid(g));

   const x = tween(REST_W);
   const ph = PRED.map((v, i) => tween(i >= SEQ && i <= REST_W + SEQ ? v : 0));
   const pulse = cells.map(() => tween(1));
   const drawn = {
      x: Number.NaN,
      p: PRED.map(() => Number.NaN),
      c: cells.map(() => Number.NaN),
   };
   const B = register(stage, (_dt, t) => {
      let moving = !tdone(x, t);
      const xi = tval(x, t);
      const slid = xi !== drawn.x;
      if (slid) {
         drawn.x = xi;
         const [x0, x1] = [xi * PX - 6, (xi + SEQ - 1) * PX + 6];
         const win = rrect(x0, YA - 6, x1, YR + 6, 5, 8);
         const days = Array.from({ length: SEQ }, (_, k) => (xi + k) * PX);
         guide.setAttribute("d", poly(ringAt(P, win, 0)));
         rail.setAttribute(
            "d",
            open([P(x0 + 6, YR, CHT / 2), P((xi + SEQ) * PX, YR, CHT / 2)]) +
               days.map((d) => open([P(d, YA, 0), P(d, YR, 0)])).join(""),
         );
      }
      cells.forEach((c, k) => {
         const v = tval(pulse[k], t);
         moving ||= !tdone(pulse[k], t);
         if (v === drawn.c[k] && !slid) return;
         drawn.c[k] = v;
         const lift = Math.sin(Math.PI * clamp(v, 0, 1)) * PULSE;
         const head = k === SEQ;
         stand(
            c,
            cell((xi + k) * PX, head ? CW - 2 : CW),
            lift,
            head ? CHT - 2 : CHT,
         );
      });
      PRED.forEach((_, i) => {
         const v = tval(ph[i], t);
         moving ||= !tdone(ph[i], t);
         if (v === drawn.p[i] || i < SEQ) return;
         // A day not yet predicted has no bar at all.
         drawn.p[i] = v;
         if (v < 0.05) put(pred[i], { sil: "", crease: "" });
         else stand(pred[i], bar(i, YP), 0, v);
      });
      return moving;
   });
   bag.add(B.unregister);

   /** Slides the rig so its window ends the day before day d, fires the cells, grows day d. */
   function predict(nw: number) {
      if (nw === w && x.to === nw) return;
      const t = now();
      const travel = Math.abs(nw - tval(x, t)) > 0.01 ? 380 : 0;
      tset(x, nw, t, 0);
      pulse.forEach((pk, k) =>
         Object.assign(pk, { from: 0, to: 1, t0: t + travel + k * step }),
      );
      const grow = travel + (SEQ + 0.6) * step;
      PRED.forEach((v, i) => {
         const near = Math.abs(i - (nw + SEQ));
         tset(
            ph[i],
            i >= SEQ && i <= nw + SEQ ? v : 0,
            t,
            i === nw + SEQ ? grow : near * 45,
         );
      });
      pred.forEach((p, i) => p.sil.classList.toggle("hi", i === nw + SEQ));
      w = nw;
      B.wake();
   }
   const mid = (at[0][1] + at[N - 1][1]) / 2;
   const pick = (p: Vec2) => {
      if (Math.abs(p[1] - mid) > 70) return -1;
      const d = at.map((q) => Math.abs(q[0] - p[0]));
      return d.indexOf(Math.min(...d));
   };
   /** The rest pose is the last prediction already made: no cell fires. */
   const rest = () => {
      read.textContent = "rest";
      predict(REST_W);
      pulse.forEach((pk) => Object.assign(pk, { from: 1, to: 1, t0: -1e9 }));
   };
   let day = -1;
   /** Predicts for the day under the pointer (-1: rest). */
   function choose(i: number) {
      if (i === day) return;
      day = i;
      if (i < 0) rest();
      else {
         const nw = clamp(i - SEQ, 0, N - 1 - SEQ);
         read.textContent = `day ${nw + SEQ + 1}`;
         predict(nw);
      }
   }

   rest();
   follow(bag, stage, svg, pick, choose);
   const set = (v: number) => {
      step = pace(v);
   };
   return { set, destroy: bag.dispose };
};
