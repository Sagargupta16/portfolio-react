/**
 * Infrastructure as Code & CI/CD: one change promoted through four
 * environments. A bed carries four stage plates, plan, test, sandbox and
 * prod, stepping up toward prod, each numbered by dots on its lid; the
 * change is a small block on the 700 ms curve. At rest it is
 * caught just leaving test, bright. The pointer picks a stage (tested at
 * rest) and the block hops there gate by gate; each stage's dots light as it
 * passes, so the light spreads from where it was, and they go out again as it
 * rolls back. On arrival the stage takes the bright edge. Intensity is the hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, follow, inset, lerp, mk,
   nearest, now, place, prism, proj, put, register, rings, rrect, slab, solid,
   tdone, tset, tval, tween, type FigureMount, type Frame, type Tour,
   type Vec3,
} from "@/figures/hairline";

const [PITCH, HS, TS, TH, BT, CAP, STICK] = [44, 17, 7, 7, 3, 40, 12];
const H = [4, 6.5, 9, 11.5];
const NAMES = ["plan", "test", "sandbox", "prod"];
const REST = 1.3;
const BED = rrect(-HS - 7, -HS - 7, 3 * PITCH + HS + 7, HS + 7, 8, 8);
const STAGES = H.map((_, k) =>
   rrect(k * PITCH - HS, -HS, k * PITCH + HS, HS, 4, 8),
);
const [TOK, TOKIN] = rings(-TS, -TS, TS, TS, 2.6, 1.2);
/** Hop height in world units: 8 at intensity 0, 18 at 1. */
const hopOf = (v: number) => 8 + v * 10;
/** The most extreme pose (rule 03): the bed, and the block at full hop over every gate. */
const EXTENT = BED.map((q): Vec3 => [q.u, q.v, -BT]).concat(
   [-TS, 3 * PITCH + TS].flatMap((x): Vec3[] => [
      [x, -TS, H[3] + 18 + TH],
      [x, TS, H[3] + 18 + TH],
   ]),
);

/** The block's height over position p (in stages): the tops it rides, and an arc over each gate. */
function zAt(p: number, hop: number) {
   const i = clamp(Math.floor(p), 0, 2);
   const s = clamp(p - i, 0, 1);
   return lerp(H[i], H[i + 1], s) + hop * Math.sin(Math.PI * s);
}

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   return { C, P, front: facing(C), spot: H.map((h, k) => P(k * PITCH, 0, h)) };
}

export const frame = FRAMES.service;
/** sandbox, on to prod, back to plan, then away. */
export const tour: Tour = ((s) => [s[2], s[3], s[0], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let hop = hopOf(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The bed.
   put(solid(g), slab(P, front, BED, inset(C, BED, 1.4), -BT, 0));
   // The stages, back to front along x, each with its dot code along the lid's front edge.
   const plates = STAGES.map((r, k) => {
      const el = solid(g);
      put(el, slab(P, front, r, inset(C, r, 1.1), 0, H[k]));
      const dots = H.slice(0, k + 1).map((_, j) => {
         const d = mk("circle", { r: 1.25, class: "dot off" }, g);
         place(d, P(k * PITCH + HS - 5, (j - k / 2) * 4.4, H[k]));
         return d;
      });
      return { el, dots, on: false, hi: false };
   });
   const tok = solid(g);
   const pos = tween(REST);
   let drawn = Number.NaN;
   let tokHi = false;

   const B = register(stage, (_dt, t) => {
      const p = tval(pos, t);
      if (p !== drawn) {
         drawn = p;
         const z = zAt(p, hop);
         const at = TOK.map((q) => ({ ...q, u: q.u + p * PITCH }));
         const tin = TOKIN.map((q) => ({ ...q, u: q.u + p * PITCH }));
         put(tok, prism(P, front, at, tin, z, z + TH));
      }
      const landed = tdone(pos, t) || Math.abs(p - pos.to) < 0.04;
      plates.forEach((s, k) => {
         const on = k <= p + 0.02;
         if (on !== s.on) {
            s.on = on;
            for (const d of s.dots)
               d.setAttribute("class", on ? "dot m" : "dot off");
         }
         const hi = k === act && landed;
         if (hi !== s.hi) {
            s.hi = hi;
            s.el.sil.classList.toggle("hi", hi);
         }
      });
      // One bright place: the block, until a chosen stage has it.
      const rest = !plates.some((s) => s.hi);
      if (rest !== tokHi) {
         tokHi = rest;
         tok.sil.classList.toggle("hi", rest);
      }
      return !tdone(pos, t);
   });
   bag.add(B.unregister);

   // Hit test on the stages' rest tops, on screen; the block never moves the choice. Sticky by STICK.
   const hit = nearest(spot, CAP, STICK);

   /** Sends the block to stage a, or back to its rest just past test (-1). */
   function setActive(a: number) {
      if (a === act) return;
      tset(pos, a < 0 ? REST : a, now(), 0);
      act = a;
      read.textContent = a < 0 ? "rest" : NAMES[a];
      B.wake();
   }
   read.textContent = "rest";

   follow(bag, stage, svg, (q) => hit(q, act), setActive);
   return {
      set: (v) => {
         hop = hopOf(v);
         drawn = Number.NaN;
         B.wake();
      },
      destroy: bag.dispose,
   };
};
