/**
 * Landing Zones & Cloud Governance: an AWS Organization as nested plates. The
 * org plate holds the management account, a round tile in its back corner,
 * and two OU plates, each fenced by a dashed guardrail (its SCP) and holding
 * two member accounts. A trunk runs on the org plate from the management
 * account to each OU. The pointer picks an account (tested at rest): the
 * trunk to its OU draws, the OU lifts, then the account lifts off it and
 * takes the bright edge from the management account, so a guardrail reads as
 * inherited down the tree. Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, follow, inset, mk, nearest,
   now, open, part, poly, proj, put, register, ringAt, rrect, slab, solid, tdone,
   tset, tval, tween, type FigureMount, type Frame, type Solid, type Tour,
   type Vec2, type Vec3,
} from "@/figures/hairline";

const [PT, OT, MH, CAP, STICK, STEP] = [3, 3, 8, 44, 12, 90];
const ORG = rrect(-62, -62, 62, 62, 8, 8);
const CX = [-29, 29];
const OUS = CX.map((x) => rrect(x - 23, -36, x + 23, 54, 5, 8));
const FENCE = CX.map((x) => rrect(x - 19, -32, x + 19, 50, 3, 8));
/** Accounts, two per OU (i >> 1): y, height, rest lift; 2.2 rests a little up, just vended. */
const [AY, AH, AR] = [
   [-9, 29, -9, 29],
   [6, 4.5, 5.5, 7],
   [0, 0, 0, 3],
];
const RINGS = AY.map((y, i) => {
   const x = CX[i >> 1];
   return rrect(x - 15, y - 13, x + 15, y + 13, 3.4, 8);
});
const MG = circ(9, 40).map((q) => ({ ...q, u: q.u - 40, v: q.v - 49 }));
/** The trunk from the management account to each OU's back edge. */
const ROUTES = [-20, 29].map((x): Vec2[] => [
   [-31, -49],
   [x, -49],
   [x, -36],
]);
const RMAX = 18;
/** Lift in world units: 8 at intensity 0, 18 at 1. */
const rise = (v: number) => 8 + v * 10;
/** The most extreme pose (rule 03): the org plate, and every account on a lifted OU at full lift. */
const EXTENT = ORG.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   RINGS.flatMap((r, i) =>
      r.map((q): Vec3 => [q.u, q.v, 2 * RMAX + AH[i] + 6]),
   ),
   [[-40, -49, MH + RMAX]],
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = AY.map((y, i) => P(CX[i >> 1], y, OT + AR[i] + AH[i]));
   spot.push(P(-40, -49, MH));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.service;
/** The management account, then acct 1.2, then acct 2.1, then away. */
export const tour: Tour = ((s) => [s[4], s[1], s[2], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let lift = rise(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The org plate, then the trunk on it: a dim wire, and over it the line that draws.
   put(solid(g), slab(P, front, ORG, inset(C, ORG, 1.4), -PT, 0));
   const scr = ROUTES.map((r) => r.map((q) => P(q[0], q[1], 0)));
   for (const s of scr) mk("path", { d: open(s), class: "nf lo" }, g);
   const lines = scr.map(() => mk("path", { class: "nf sil" }, g));
   const mg = solid(g);
   const mgIn = inset(C, MG, 1);
   // Each OU, back to front: its plate, its dashed guardrail, then its accounts.
   const els: Solid[] = [];
   const ous = OUS.map((r, k) => {
      const el = solid(g);
      const fence = mk("path", { class: "nf dash" }, g);
      AY.forEach((_, i) => {
         if (i >> 1 === k) els[i] = solid(g);
      });
      return { el, fence, inner: inset(C, r, 1.2) };
   });
   const ai = RINGS.map((r) => inset(C, r, 1));
   const tw = () => ({ tw: tween(0), d: Number.NaN });
   const [lt, zo, za, zm] = [ROUTES.map(tw), OUS.map(tw), AY.map(tw), tw()];
   const lit = AY.map(() => false);
   let mgHi = false;
   /** Where a tween is now, and whether it moved since it was last drawn. */
   const step = (s: ReturnType<typeof tw>, t: number) => {
      const v = tval(s.tw, t);
      const moved = v !== s.d;
      s.d = v;
      return [v, moved] as const;
   };

   const B = register(stage, (_dt, t) => {
      scr.forEach((s, k) => {
         const [l, moved] = step(lt[k], t);
         if (moved)
            lines[k].setAttribute("d", l > 0.002 ? open(part(s, l)) : "");
      });
      const [m, mMoved] = step(zm, t);
      if (mMoved)
         put(mg, slab(P, front, MG, mgIn, m * lift * 0.6, m * lift * 0.6 + MH));
      const ou = OUS.map((r, k) => {
         const [v, moved] = step(zo[k], t);
         const z = v * lift * 0.7;
         if (moved) {
            put(ous[k].el, slab(P, front, r, ous[k].inner, z, z + OT));
            ous[k].fence.setAttribute("d", poly(ringAt(P, FENCE[k], z + OT)));
         }
         return [z + OT, moved] as const;
      });
      AY.forEach((_, i) => {
         const [v, moved] = step(za[i], t);
         const [z0, under] = ou[i >> 1];
         const z = z0 + AR[i] + v * lift;
         if (moved || under)
            put(els[i], slab(P, front, RINGS[i], ai[i], z, z + AH[i]));
         const hi = i === act && v > 0.5;
         if (hi === lit[i]) return;
         lit[i] = hi;
         els[i].sil.classList.toggle("hi", hi);
      });
      // One bright place: the management account, until an account has lifted.
      const rest = !lit.some(Boolean);
      if (rest !== mgHi) {
         mgHi = rest;
         mg.sil.classList.toggle("hi", rest);
      }
      return [...lt, ...zo, ...za, zm].some((s) => !tdone(s.tw, t));
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen, so a lifted account cannot flip the choice; sticky by STICK.
   const pick = nearest(spot, CAP, STICK);

   /** Picks account a (4: the management account, -1: none): trunk, then OU, then account, a hop apart; leavers fall the other way. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const ou = a >= 0 && a < 4 ? a >> 1 : -1;
      ROUTES.forEach((_, k) => {
         const on = a === 4 || k === ou;
         tset(lt[k].tw, on ? 1 : 0, t, on ? 0 : 2 * STEP);
         tset(zo[k].tw, k === ou ? 1 : 0, t, STEP);
      });
      za.forEach((s, i) =>
         tset(s.tw, i === a ? 1 : 0, t, i === a ? 2 * STEP : 0),
      );
      tset(zm.tw, a === 4 ? 1 : 0, t, 0);
      act = a;
      const name = a === 4 ? "mgmt" : `acct ${ou + 1}.${(a % 2) + 1}`;
      read.textContent = a < 0 ? "rest" : name;
      B.wake();
   }
   read.textContent = "rest";

   follow(bag, stage, svg, (p) => pick(p, act), setActive);
   return {
      set: (v) => {
         lift = rise(v);
         for (const s of [...zo, ...za, zm]) s.d = Number.NaN;
         B.wake();
      },
      destroy: bag.dispose,
   };
};
