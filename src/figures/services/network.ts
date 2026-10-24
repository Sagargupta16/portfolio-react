/**
 * Cloud Networking: a Transit Gateway hub with central inspection. The hub
 * is a thick plate with a recessed square set in its lid; four attachments
 * stand round it on dashed links: three spoke VPCs, each with its two
 * subnets marked on the lid, and the taller inspection VPC with its firewall
 * fins. The pointer picks an attachment (tested at rest): it rises and its
 * link draws solid to the hub, then the hub's link to inspection draws and
 * the inspection VPC lifts a little after it, so every route reads as passing
 * the firewall. The chosen VPC takes the bright edge from the hub's square.
 * Intensity is the rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, follow, inset, lerp, mk, nearest,
   now, poly, proj, put, register, ringAt, rrect, seg, slab, solid, tdone,
   tset, tval, tween, type FigureMount, type Frame, type Projector, type Solid,
   type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [D, HUB, HT, TS, CAP, STICK, STEP, FW] = [58, 18, 8, 14, 42, 12, 110, 3];
/** Attachments: vpc 1, vpc 2, vpc 3, then inspection (FW), the tall one at the back. */
const XY: Vec2[] = [
   [-D, 3],
   [2, D],
   [D, -2],
   [0, -D],
];
const HS = [4.5, 3.5, 5.5, 10];
const NAMES = ["vpc 1", "vpc 2", "vpc 3", "inspect"];
/** Rest: vpc 3 caught attaching, its link half drawn and its plate just off the floor. */
const [RL, RZ] = [
   [0, 0, 0.5, 0],
   [0, 0, 0.2, 0],
];
const HUBR = rrect(-HUB, -HUB, HUB, HUB, 7, 8);
const RINGS = XY.map(([x, y]) => rrect(x - TS, y - TS, x + TS, y + TS, 4, 8));
const SUBNETS = XY.map(([x, y]) =>
   [-9, 1].map((o) => rrect(x - 9, y + o, x + 9, y + o + 8, 1.6, 3)),
);
/** Lift in world units: 8 at intensity 0, 16 at 1. */
const riseOf = (v: number) => 8 + v * 8;
/** The most extreme pose (rule 03): every attachment at full lift. */
const EXTENT = RINGS.flatMap((r, i) =>
   r.flatMap((q): Vec3[] => [
      [q.u, q.v, 0],
      [q.u, q.v, HS[i] + 16],
   ]),
);
const along = (a: Vec2, b: Vec2, k: number): Vec2 => [
   lerp(a[0], b[0], k),
   lerp(a[1], b[1], k),
];

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = XY.map(([x, y], i) => P(x, y, HS[i]));
   return { C, P, front: facing(C), spot, hub: P(0, 0, HT) };
}

export const frame = FRAMES.service;
/** vpc 1, then vpc 3, then inspection itself, then away. */
export const tour: Tour = ((s) => [s[0], s[2], s[3], null])(camera(frame).spot);

/** Lid marks for attachment i at height z: two subnets on a VPC, a row of fins on inspection. */
function marks(i: number, z: number, P: Projector) {
   const [x, y] = XY[i];
   if (i !== FW) return SUBNETS[i].map((r) => poly(ringAt(P, r, z))).join("");
   return [-5, 0, 5]
      .map((o) => seg(P(x - 8, y + o, z), P(x + 8, y + o, z)))
      .join("");
}

/** Attachment i's share of the rise when a is picked: the chosen one up, inspection a little after it. */
function lifted(a: number, i: number) {
   if (a < 0) return RZ[i];
   if (i === a) return 1;
   return i === FW ? 0.4 : 0;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot, hub } = camera(f);
   const bag = disposer();
   let rise = riseOf(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // Links on the floor, from the hub's rim to each attachment: dashed, and over it the line that draws.
   const ends = XY.map(([x, y]): [Vec2, Vec2] => {
      const l = Math.hypot(x, y);
      return [
         P((x / l) * HUB, (y / l) * HUB, 0),
         P(x * (1 - TS / l), y * (1 - TS / l), 0),
      ];
   });
   for (const [a, b] of ends) {
      const d = [0, 1, 2, 3].map((j) =>
         seg(along(a, b, (j + 0.15) / 4), along(a, b, (j + 0.65) / 4)),
      );
      mk("path", { d: d.join(""), class: "nf" }, g);
   }
   const lines = ends.map(() => mk("path", { class: "nf sil" }, g));
   // Back to front by x + y: the two attachments behind the hub, the hub, then the two in front.
   const els: { el: Solid; mk: SVGPathElement }[] = [];
   let hubMark!: SVGPathElement;
   for (const i of [0, 3, -1, 1, 2]) {
      if (i >= 0) {
         const el = solid(g);
         els[i] = { el, mk: mk("path", { class: "nf lo" }, el.g) };
         continue;
      }
      put(solid(g), slab(P, front, HUBR, inset(C, HUBR, 1.3), 0, HT));
      mk(
         "path",
         { d: poly(ringAt(P, inset(C, HUBR, 3), HT)), class: "nf lo" },
         g,
      );
      hubMark = mk(
         "path",
         { d: poly(ringAt(P, rrect(-7, -7, 7, 7, 2, 8), HT)), class: "nf hi" },
         g,
      );
   }
   const inner = RINGS.map((r) => inset(C, r, 1.1));
   const [z, l] = [RZ.map((v) => tween(v)), RL.map((v) => tween(v))];
   const drawn = XY.map(() => ({ z: Number.NaN, l: Number.NaN, hi: false }));
   let markHi = true;

   const B = register(stage, (_dt, t) => {
      let moving = false;
      XY.forEach((_, i) => {
         const [zi, li, was] = [tval(z[i], t) * rise, tval(l[i], t), drawn[i]];
         if (li !== was.l) {
            was.l = li;
            const [a, b] = ends[i];
            lines[i].setAttribute(
               "d",
               li > 0.002 ? seg(a, along(a, b, li)) : "",
            );
         }
         if (zi !== was.z) {
            was.z = zi;
            put(els[i].el, slab(P, front, RINGS[i], inner[i], zi, zi + HS[i]));
            els[i].mk.setAttribute("d", marks(i, zi + HS[i], P));
         }
         const hi = i === act && tval(z[i], t) > 0.5;
         if (hi !== was.hi) {
            was.hi = hi;
            els[i].el.sil.classList.toggle("hi", hi);
         }
         moving ||= !tdone(z[i], t) || !tdone(l[i], t);
      });
      // One bright place: the hub's square at rest, the chosen attachment once it has risen.
      const rest = !drawn.some((d) => d.hi);
      if (rest !== markHi) {
         markHi = rest;
         hubMark.setAttribute("class", rest ? "nf hi" : "nf lo");
      }
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; the hub itself is rest. Sticky by STICK.
   const pick = nearest(spot, CAP, STICK);
   const hit = (p: Vec2) =>
      Math.hypot(p[0] - hub[0], p[1] - hub[1]) < 26 ? -1 : pick(p, act);

   /** Routes attachment a (-1: none): its link and rise first, then the hub's link to inspection, a hop later. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      XY.forEach((_, i) => {
         const on = i === a || (a >= 0 && i === FW);
         const hop = i === a ? 0 : 1;
         const idle = a < 0 ? RL[i] : 0;
         tset(l[i], on ? 1 : idle, t, on ? hop * STEP : 0);
         tset(z[i], lifted(a, i), t, on ? hop * 2 * STEP : 0);
      });
      act = a;
      read.textContent = a < 0 ? "rest" : NAMES[a];
      B.wake();
   }
   read.textContent = "rest";

   follow(bag, stage, svg, hit, setActive);
   return {
      set: (v) => {
         rise = riseOf(v);
         for (const d of drawn) d.z = Number.NaN;
         B.wake();
      },
      destroy: bag.dispose,
   };
};
