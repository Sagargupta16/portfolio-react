/**
 * Instagram Autopilot (40): one board for the posting run. Three pillar
 * tiles stand by weight (explainer, stat story, timeline); routes join them
 * to the reel, a closed stack of portrait frames, with the source sheet in
 * front of it; the reel's route runs on to the day's dial, where two slot
 * pucks sit a quarter turn (180 minutes) apart. The pointer picks a pillar,
 * or a slot: the pillar rises, the reel renders frame by frame up off the
 * stack, then grounding checks the numbers on screen against the source one
 * dot at a time. Grounded, the pillar's slot rises: published. The stat
 * story has a number the source lacks: its third dot stays dark, the pillar
 * turns amber, the render drops back and nothing is published. At rest the
 * next slot is the bright mark. Intensity is the delay per stage.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, mk, now,
   open, place, pointer, proj, put, register, rrect, slab, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Solid, Tour, Tween, Vec2, Vec3 } from "@/figures/hairline";

const [PT, RISE, NF, FT, SPREAD, DIAL, DH, SR, SH] = [
   3, 6, 5, 1.6, 4.6, 17, 3, 3.8, 3.5,
];
const [CAP, STICK, FAIL] = [24, 8, 1];
const PILLARS = ["explainer", "stat", "timeline"];
/** Pillar heights by weight, their rows, and the slot each grounded pillar fills. */
const [WEIGHT, PY, SLOT_OF] = [
   [9, 6, 4],
   [4, 23, 42],
   [0, -1, 1],
];
const [RX, RY, SX, SY, DX, DY] = [44, 22, 44, 46, 82, 14];
const deg = (a: number, r: number): Vec2 => [
   r * Math.cos((a * Math.PI) / 180),
   r * Math.sin((a * Math.PI) / 180),
];
const SLOTS = [200, 290].map(
   (a): Vec2 => deg(a, 9).map((v, i) => v + [DX, DY][i]) as Vec2,
);
const REST_SLOT = [0.35, 0];
const BASE = rrect(-6, -8, DX + DIAL + 5, 58, 9, 8);
const pillar = (i: number) => rrect(3, PY[i] - 6, 17, PY[i] + 6, 3, 8);
const FRAME = rrect(RX - 7, RY - 9, RX + 7, RY + 9, 2.4, 6);
const SHEET = rrect(SX - 9, SY - 5, SX + 9, SY + 5, 2, 6);
const ROUTES = PY.map((y) => [17, y, 28, y, 28, RY, RX - 7, RY]).concat([
   [RX + 7, RY, 58, RY, 58, DY, DX - DIAL, DY],
]);
const ring = (r: number, [x, y]: Vec2, n = 48): Ring =>
   circ(r, n).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
const EXTENT = BASE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   PY.map((y, i): Vec3 => [3, y - 6, WEIGHT[i] + RISE]),
   [[RX - 7, RY - 9, (NF - 1) * SPREAD + FT]],
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = PY.map((y, i) => P(10, y, WEIGHT[i])).concat(
      SLOTS.map(([x, y]) => P(x, y, DH + SH)),
   );
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The explainer (published), the stat story (fails), the second slot, then away. */
export const tour: Tour = ((s) => [s[0], s[1], s[4], null])(camera(frame).spot);

/** Delay per stage in ms: 140 at intensity 0, 220 at 0.5, 300 at 1. */
const pace = (v: number) => 140 + v * 160;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let [hop, act, pick, checkAt, look] = [pace(value), -1, -1, Infinity, ""];
   const g = mk("g", {}, svg);
   const stand = (s: Solid, r: Ring, b: number, z0: number, h: number) =>
      put(s, slab(P, front, r, inset(C, r, b, 0.4), z0, z0 + h));
   const dot = (r: number, q?: Vec2, z = 0) => {
      const d = flatDot(g, C, r, "dot off");
      if (q) place(d, P(q[0], q[1], z));
      return d;
   };
   stand(solid(g), BASE, 1.4, -PT, PT);
   for (const r of ROUTES) {
      const pts = [0, 2, 4, 6].map((k) => P(r[k], r[k + 1], 0));
      mk("path", { d: open(pts), class: "nf dash" }, g);
   }
   // Back to front: pillars, the reel, the sheet and its dots, the dial with its hours and slots.
   const pills = PY.map(() => solid(g));
   const frames = Array.from({ length: NF }, () => solid(g));
   const shown = [0, 1, 2].map(() => dot(1.3));
   stand(solid(g), SHEET, 1, 0, 1.2);
   const src = [-5, 0, 5].map((d) => dot(1.3, [SX + d, SY], 1.2));
   stand(solid(g), ring(DIAL, [DX, DY], 64), 1.2, 0, DH);
   for (let k = 0; k < 8; k++)
      dot(0.8, deg(k * 45, 14).map((v, i) => v + [DX, DY][i]) as Vec2, DH);
   const slots = SLOTS.map(() => solid(g));

   const pz = PY.map(() => tween(0));
   const fz = frames.map(() => tween(0.12));
   const sz = REST_SLOT.map((v) => tween(v));
   const drawn = [pz, fz, sz].map((ws) => ws.map(() => Number.NaN));
   const draws = [
      (i: number, v: number) =>
         stand(pills[i], pillar(i), 1, v * RISE, WEIGHT[i]),
      (k: number, v: number) => {
         stand(frames[k], FRAME, 0.9, k * v * SPREAD, FT);
         if (k === NF - 1)
            shown.forEach((d, j) =>
               place(d, P(RX - 5 + j * 5, RY, k * v * SPREAD + FT)),
            );
      },
      (i: number, v: number) =>
         stand(slots[i], ring(SR, SLOTS[i], 32), 0.8, DH + v * 6, SH),
   ];
   const B = register(stage, (_dt, t) => {
      let moving = Number.isFinite(checkAt) && t < checkAt + 400;
      [pz, fz, sz].forEach((ws: Tween[], n) =>
         ws.forEach((w, i) => {
            const v = tval(w, t);
            moving ||= !tdone(w, t);
            if (v !== drawn[n][i]) draws[n](i, (drawn[n][i] = v));
         }),
      );
      // Grounding: each number on screen is found in the source, one dot at a
      // time; the stat story misses its third.
      const ok = [0, 1, 2].map(
         (j) => t >= checkAt + j * 130 && !(act === FAIL && j === 2),
      );
      const failed = act === FAIL && t >= checkAt + 260;
      const key = [ok, failed, pick, act].join();
      if (key !== look) {
         look = key;
         // A slot that fails grounding discards its render: the frames drop back onto the stack.
         if (failed) fz.forEach((w, j) => tset(w, 0.12, t, (NF - j) * 45));
         for (const ds of [src, shown])
            ds.forEach((d, j) =>
               d.setAttribute("class", ok[j] ? "dot m" : "dot off"),
            );
         pills.forEach((p, i) => {
            p.sil.classList.toggle("hi", i === act && pick < 0 && !failed);
            p.sil.classList.toggle("warn", i === act && failed);
         });
         slots.forEach((s, j) =>
            s.sil.classList.toggle("hi", act < 0 ? j === 1 : pick === j),
         );
      }
      return moving;
   });
   bag.add(B.unregister);

   const hit = (q: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - q[0], s[1] - q[1]));
      const best = d.indexOf(Math.min(...d));
      const cur = pick >= 0 ? 3 + pick : act;
      if (!(d[best] < CAP)) return -1;
      return cur >= 0 && d[cur] < CAP && d[cur] - d[best] < STICK ? cur : best;
   };

   /** Runs pillar k, or the pillar of slot k - 3 when k >= 3; -1 is rest. */
   function setActive(k: number) {
      const [a, s] = k >= 3 ? [SLOT_OF.indexOf(k - 3), k - 3] : [k, -1];
      if (a === act && s === pick) return;
      const t = now();
      pz.forEach((w, i) => tset(w, i === a ? 1 : 0, t, 0));
      fz.forEach((w, j) =>
         tset(w, a >= 0 ? 1 : 0.12, t, a >= 0 ? hop + j * 45 : (NF - j) * 45),
      );
      if (a !== act) checkAt = a >= 0 ? t + 2 * hop + NF * 45 : Infinity;
      sz.forEach((w, j) => {
         const fill = a >= 0 && SLOT_OF[a] === j;
         tset(
            w,
            a < 0 ? REST_SLOT[j] : fill ? 1 : 0,
            t,
            fill ? 3 * hop + NF * 45 : 0,
         );
      });
      [act, pick] = [a, s];
      const name = `${PILLARS[a]} ${a === FAIL ? 2 : 3}/3`;
      read.textContent = a < 0 ? "rest" : s >= 0 ? `slot ${s + 1}` : name;
      B.wake();
   }

   read.textContent = "rest";
   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (q) => setActive(hit(q)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (hop = pace(v)), destroy: bag.dispose };
};
