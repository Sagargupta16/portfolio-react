/**
 * landing-zone (RWS): the organization as one plate, split by a dashed line
 * into two regions, each with a Transit Gateway hub (a drum with a dot per
 * route table) and three spoke VPC tiles round it; the hubs peer through a
 * firewall tile on the line. At rest a new spoke is half onboarded: lifted,
 * its link half drawn, bright. The pointer picks a spoke (tested at rest):
 * its link draws out of the hub, the tile rises a hop later and its
 * route-table dot lights. A hub lights its three spokes a hop apart and the
 * peering run through the firewall. Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, lerp,
   mk, nearest, now, open, place, poly, proj, put, ringAt, register, rrect, slab,
   solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, HR, HH, TS, RISE, CAP, STICK, NEW] = [3, 14, 9, 10, 9, 36, 10, 2];
const PLATE = rrect(-84, -84, 84, 84, 12, 8);
const WALL = rrect(-8, -8, 8, 8, 3, 8);
const HUBS: Vec2[] = [
   [-35, 35],
   [35, -35],
];
/** [x, y, hub, height, rest lift]: three spokes per hub, mirrored; spoke 2 is the new one. */
const SPOKES: [number, number, number, number, number][] = [
   [-65, -8, 0, 4, 0.12],
   [-65, 65, 0, 6, 0],
   [8, 65, 0, 4, 0.45],
   [-8, -65, 1, 6, 0.06],
   [65, -65, 1, 4, 0.2],
   [65, 8, 1, 5, 0],
];
const TAGS = SPOKES.map((s, i) => `vpc ${s[2] + 1}.${(i % 3) + 1}`);
TAGS.push("tgw 1", "tgw 2");
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   SPOKES.map(([x, y, , h]): Vec3 => [x - TS, y - TS, h + RISE]),
);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = SPOKES.map(([x, y, , h]) => P(x, y, h));
   spot.push(...HUBS.map(([x, y]) => P(x, y, HH)));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.banner;
/** A spoke in region 1, the hub of region 2, one of its spokes, then away. */
export const tour: Tour = ((s) => [s[0], s[7], s[4], null])(camera(frame).spot);

const hopMs = (v: number) => 30 + v * 60;
/** Where a link from a to b meets the edge of b's square tile. */
const edge = (a: Vec2, b: Vec2): Vec2 => {
   const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
   const k = 1 - TS / Math.max(Math.abs(dx), Math.abs(dy));
   return [a[0] + dx * k, a[1] + dy * k];
};
/** A spoke's [lift, link] targets: picked (fanned by its hub: 0.6), at rest, or off. */
function targets(on: boolean, fan: boolean, a: number, rest: number) {
   if (on) return [fan ? 0.6 : 1, 1];
   if (a < 0) return [rest, rest > 0.3 ? 0.5 : 0];
   return [0, 0];
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hopMs(value);
   let act = -1;
   const g = mk("g", {}, svg);
   /** The first fraction l of the floor run from a to b, on screen. */
   const run = ([a, b]: Vec2[], l: number) =>
      l < 0.01
         ? ""
         : open([
              P(a[0], a[1], 0),
              P(lerp(a[0], b[0], l), lerp(a[1], b[1], l), 0),
           ]);

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   const split = [P(-80, -80, 0), P(80, 80, 0)];
   mk("path", { d: open(split), class: "nf dash" }, g);
   // Links on the floor, behind every solid: a dim wire, and over it the line that grows.
   const ends = SPOKES.map(([x, y, k]) => [HUBS[k], edge(HUBS[k], [x, y])]);
   for (const e of [...ends, HUBS])
      mk("path", { d: run(e, 1), class: "nf lo" }, g);
   const peer = mk("path", { class: "nf sil" }, g);
   const lines = SPOKES.map(() => mk("path", { class: "nf sil" }, g));
   const slots = SPOKES.map(() => mk("path", { class: "nf lo" }, g));

   // Solids back to front by x + y: spokes, hubs, the firewall.
   const rings = SPOKES.map(([x, y]) =>
      rrect(x - TS, y - TS, x + TS, y + TS, 3.4, 8),
   );
   const inner = rings.map((r) => inset(C, r, 1));
   const drum = ([x, y]: Vec2) =>
      circ(HR, 48).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
   const order = [...SPOKES, ...HUBS, [0, 0]]
      .map((q, i) => [q[0] + q[1], i])
      .sort((a, b) => a[0] - b[0]);
   const els = order.map(() => solid(g));
   const el = (i: number) => els[order.findIndex((o) => o[1] === i)];
   HUBS.forEach((q, k) => {
      const r = drum(q);
      put(el(6 + k), slab(P, front, r, inset(C, r, 1.2), 0, HH));
   });
   put(el(8), slab(P, front, WALL, inset(C, WALL, 1), 0, 6));
   // A dot per route table on each hub's lid, one for each of its spokes.
   const dots = SPOKES.map(([, , k], i) => {
      const [x, y] = HUBS[k];
      const d = flatDot(g, C, 1.3, "dot off");
      place(d, P(x + ((i % 3) - 1) * 5, y - ((i % 3) - 1) * 5, HH));
      return d;
   });

   const z = SPOKES.map((s) => tween(s[4]));
   const l = SPOKES.map((s) => tween(s[4] > 0.3 ? 0.5 : 0));
   const pl = tween(0);
   const drawn = SPOKES.map(() => ({ z: Number.NaN, l: Number.NaN }));
   const lit = [...SPOKES, ...HUBS].map(() => false);
   let [from, peerDrawn] = [0, Number.NaN];

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(pl, t);
      SPOKES.forEach(([, , , h], i) => {
         const [zi, li, was] = [tval(z[i], t), tval(l[i], t), drawn[i]];
         if (li !== was.l) {
            was.l = li;
            lines[i].setAttribute("d", run(ends[i], li));
            dots[i].setAttribute("class", li > 0.9 ? "dot m" : "dot off");
         }
         if (zi !== was.z) {
            was.z = zi;
            put(
               el(i),
               slab(P, front, rings[i], inner[i], zi * RISE, zi * RISE + h),
            );
            slots[i].setAttribute(
               "d",
               zi > 0.3 ? poly(ringAt(P, rings[i], 0)) : "",
            );
         }
         moving ||= !tdone(z[i], t) || !tdone(l[i], t);
      });
      const p = tval(pl, t);
      if (p !== peerDrawn) {
         peerDrawn = p;
         peer.setAttribute("d", run(from ? [HUBS[1], HUBS[0]] : HUBS, p));
      }
      // One bright place: the chosen part once it has risen, the new spoke at rest.
      lit.forEach((was, i) => {
         const on = i === (act < 0 ? NEW : act) && (i > 5 || drawn[i].z > 0.3);
         if (on === was) return;
         lit[i] = on;
         el(i).sil.classList.toggle("hi", on);
      });
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; sticky by STICK.
   const pick = nearest(spot, CAP, STICK);

   /** Spoke a: link, then tile. Hub a: its spokes in fan order, a hop apart, and the peering run. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      SPOKES.forEach(([, , hub, , rest], i) => {
         const fan = a === 6 + hub;
         const on = a === i || fan;
         const k = fan ? i % 3 : 0;
         const [zt, lt] = targets(on, fan, a, rest);
         tset(l[i], lt, t, on ? k * step : 0);
         tset(z[i], zt, t, on ? (k + 1) * step : 0);
      });
      if (a >= 6) from = a - 6;
      tset(pl, a >= 6 ? 1 : 0, t, 0);
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, (q) => pick(q, act), setActive);
   return {
      set: (v) => {
         step = hopMs(v);
      },
      destroy: bag.dispose,
   };
};
