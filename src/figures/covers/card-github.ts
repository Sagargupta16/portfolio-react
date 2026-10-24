/**
 * GitHub Stats Card Action (53): the card render_card draws, as an object.
 * Five stat tiles along the top, the contribution calendar under them, one
 * strip per week with seven days as dots, the current streak's ring at the
 * calendar's end and the top-languages bar along the bottom. The pointer
 * picks a part (tested at rest): a tile or a week rises with its
 * neighbours, staggered by distance; the streak ring rises and its run of
 * days goes live from today back, one day at a time. At rest the streak
 * ring is the one bright mark. Intensity is the rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, mk, now, place,
   pointer, prism, proj, put, register, rrect, seg, slab, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, TT, ST, RH, CAP, STICK] = [3, 4, 2, 6, 30, 7];
const CARD = rrect(-10, -10, 128, 66, 8, 8);
const TILES = [0, 1, 2, 3, 4].map((k) =>
   rrect(k * 23, 0, k * 23 + 20, 13, 3, 6),
);
const TILE_NAMES = ["contribs", "commits", "PRs", "stars", "followers"];
const [WN, WP, WW, CY0, CY1] = [10, 8, 5.5, 19, 50];
const WEEKS = Array.from({ length: WN }, (_, w) =>
   rrect(w * WP, CY0, w * WP + WW, CY1, 2, 6),
);
const dayY = (d: number) => CY0 + 3.5 + d * 4;
/** The streak: today is the last day of the last week, and the run goes back STREAK days. */
const STREAK = 10;
const inStreak = (w: number, d: number) => (WN - 1 - w) * 7 + (6 - d) < STREAK;
/** Activity per day: fixed, hash-scattered, hotter toward today. */
const busy = (w: number, d: number) =>
   inStreak(w, d) || ((w * 7 + d) * 2654435761) % 97 < 30 + w * 4;
const [SX, SY, SR] = [101, 34, 9];
const RING = circ(SR, 48).map((q) => ({ ...q, u: q.u + SX, v: q.v + SY }));
const RIN = circ(SR - 1.4, 48).map((q) => ({ ...q, u: q.u + SX, v: q.v + SY }));
const LANG = rrect(0, 55, 115, 60, 2.5, 6);
const RISE = 14;
const EXTENT: Vec3[] = CARD.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [0, 0, TT + RISE],
   [110, 0, TT + RISE],
   [SX, SY - SR, RH + RISE],
]);

/** The camera fitted to a frame; the hit spots, each with its part: tiles 0-4, weeks 5-14, the streak 15. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [
      ...TILES.map((_, k) => P(k * 23 + 10, 6.5, TT)),
      ...WEEKS.map((_, w) => P(w * WP + WW / 2, (CY0 + CY1) / 2, ST)),
      P(SX, SY, RH),
   ];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** A tile, a week in the calendar, a later week, the streak, away. */
export const tour: Tour = ((s) => [s[1], s[8], s[12], s[15], null])(
   camera(frame).spot,
);
const NAME = (a: number) =>
   a < 5 ? TILE_NAMES[a] : a < 15 ? `wk ${a + 29}` : "streak";

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let rise = RISE * (0.5 + value * 0.5);
   let act = -2; // nothing painted yet: the first setActive(-1) paints rest
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, CARD, inset(C, CARD, 1.4), -PT, 0));
   // Every moving part: [ring, its crease, base height, thickness]. Tiles, then weeks, then the streak ring.
   const parts: [Ring, Ring | null, number][] = [
      ...TILES.map((r): [Ring, Ring, number] => [r, inset(C, r, 1), TT]),
      ...WEEKS.map((r): [Ring, null, number] => [r, null, ST]),
      [RING, RIN, RH],
   ];
   const els = parts.map(() => solid(g));
   const days = WEEKS.map((_, w) =>
      Array.from({ length: 7 }, (_, d) =>
         flatDot(els[5 + w].g, C, 1.15, busy(w, d) ? "dot m" : "dot off"),
      ),
   );
   const marks = TILES.map((_, k) => mk("path", { class: "nf lo" }, els[k].g));
   // The languages bar, split where one language gives way to the next.
   put(solid(g), slab(P, front, LANG, null, 0, 1.6));
   mk(
      "path",
      {
         class: "nf lo",
         d: [52, 82, 100]
            .map((x) => seg(P(x, 55, 1.6), P(x, 60, 1.6)))
            .join(""),
      },
      g,
   );

   const z = parts.map(() => tween(0));
   const live = days.map((col) => col.map(() => tween(0)));
   const drawn = parts.map(() => NaN);
   const lit = days.map((col) => col.map(() => false));

   const B = register(stage, (_dt, t) => {
      let moving = false;
      parts.forEach(([r, ri, h], i) => {
         const zi = tval(z[i], t) * rise;
         moving ||= !tdone(z[i], t);
         if (zi === drawn[i]) return;
         drawn[i] = zi;
         put(
            els[i],
            i === 15
               ? prism(P, front, r, ri, zi, zi + h)
               : slab(P, front, r, ri, zi, zi + h),
         );
         if (i < 5) {
            const x = i * 23;
            marks[i].setAttribute(
               "d",
               seg(P(x + 4, 9, zi + h), P(x + 12 + i * 1.2, 9, zi + h)),
            );
         } else if (i < 15)
            days[i - 5].forEach((e, d) =>
               place(e, P((i - 5) * WP + WW / 2, dayY(d), zi + h)),
            );
      });
      live.forEach((col, w) =>
         col.forEach((tw, d) => {
            const on = tval(tw, t) > 0.5;
            moving ||= !tdone(tw, t);
            if (on === lit[w][d]) return;
            lit[w][d] = on;
            days[w][d].setAttribute("class", on ? "dot" : "dot m");
         }),
      );
      return moving;
   });
   bag.add(B.unregister);

   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] - d[best] < STICK ? act : best;
   };

   /** Picks part a (-1: none): its group rises, staggered by distance; the streak goes live from today back. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      parts.forEach((_, i) => {
         const same = a >= 0 && i < 5 === a < 5 && i < 15 === a < 15;
         const lift = same ? 1 / (1 + 0.8 * (i - a) ** 2) : 0;
         tset(z[i], lift, t, same ? Math.abs(i - a) * 45 : 0);
         els[i].sil.classList.toggle("hi", i === (a < 0 ? 15 : a));
      });
      live.forEach((col, w) =>
         col.forEach((tw, d) => {
            const back = (WN - 1 - w) * 7 + (6 - d);
            tset(
               tw,
               a === 15 && back < STREAK ? 1 : 0,
               t,
               a === 15 ? 260 + back * 50 : 0,
            );
         }),
      );
      read.textContent = a < 0 ? "rest" : NAME(a);
      B.wake();
   }
   setActive(-1);

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => void (rise = RISE * (0.5 + v * 0.5)),
      destroy: bag.dispose,
   };
};
