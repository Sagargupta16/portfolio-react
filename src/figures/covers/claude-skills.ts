/**
 * Claude Skills (38): the sagar-dev-skills plugin marketplace. Left, the
 * marketplace lists its plugins as tiles; each tile carries a two by two dot
 * code of what the plugin ships (skills, commands, agents, hooks). Right, the
 * Claude Code client with one tray per kind in the same two by two. The
 * pointer picks a plugin (tested on the rest tops): it lifts, `/plugin
 * install` runs the wire across, and the client's trays for the kinds it
 * ships rise one after another while the rest settle. At rest dev-workflow
 * is installed and bright. Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   nearest, now, open, part, place, poly, proj, put, register, ringAt, rrect,
   slab, solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [MT, TH, RISE, TRAY, UP, CAP, STICK] = [3, 3, 7, 1.4, 6, 30, 8];
const MARKET = rrect(-66, 0, -14, 62, 6, 8);
const CLIENT = rrect(2, -62, 50, -14, 6, 8);
/** The plugins, [name, kinds shipped as bits: skills 1, commands 2, agents 4, hooks 8]. */
const PLUGINS: [string, number][] = [
   ["motion", 1],
   ["clean-code", 1],
   ["deps-audit", 7],
   ["docker-deploy", 7],
   ["dev-rules", 13],
   ["dev-workflow", 15],
];
const REST = 5;
/** Two by two: where each kind sits, on a tile's lid and in the client. */
const QUAD = [0, 1, 2, 3].map((k): Vec2 => [(k % 2) * 2 - 1, (k >> 1) * 2 - 1]);
const TILES = PLUGINS.map((_, i): Vec2 => [
   -52 + (i % 2) * 24,
   13 + (i >> 1) * 18,
]);
const TRAYS = QUAD.map(([u, v]): Vec2 => [26 + u * 11, -38 + v * 11]);
/** The install wire: out of the marketplace's near side, across, into the client. */
const WIRE: Vec3[] = [
   [-14, 31, 0],
   [-6, 31, 0],
   [-6, -38, 0],
   [2, -38, 0],
];
const EXTENT: Vec3[] = [
   ...MARKET.map((q): Vec3 => [q.u, q.v, 0]),
   ...CLIENT.map((q): Vec3 => [q.u, q.v, 0]),
   [-66, 0, MT + TH + RISE],
   [2, -62, MT + TRAY + UP],
];

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = TILES.map(([x, y]) => P(x, y, MT + TH));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** motion (skills only), docker-deploy, dev-rules (its hooks), then away. */
export const tour: Tour = (({ spot }) => [spot[0], spot[3], spot[4], null])(
   camera(frame),
);

/** Delay per hop in ms: 40 at intensity 0, 160 at 1. */
const hop = (v: number) => 40 + v * 120;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The wire on the ground, behind both plates: a dim guide and the line that grows over it.
   const route = WIRE.map(([x, y, z]) => P(x, y, z));
   mk("path", { d: open(route), class: "nf lo" }, g);
   const line = mk("path", { class: "nf sil" }, g);
   put(solid(g), slab(P, front, MARKET, inset(C, MARKET, 1.3), 0, MT));
   put(solid(g), slab(P, front, CLIENT, inset(C, CLIENT, 1.3), 0, MT));
   // Each tray's socket on the client's lid, then the trays, back to front.
   const trayRing = TRAYS.map(([x, y]) =>
      rrect(x - 7.5, y - 7.5, x + 7.5, y + 7.5, 2.4),
   );
   for (const r of trayRing)
      mk("path", { d: poly(ringAt(P, r, MT)), class: "nf lo" }, g);
   const trays = TRAYS.map(() => solid(g));
   const trayIn = trayRing.map((r) => inset(C, r, 0.9));

   // The plugin tiles back to front, each with its dot code on the lid.
   const tileRing = TILES.map(([x, y]) =>
      rrect(x - 9, y - 6.5, x + 9, y + 6.5, 2.4),
   );
   const tiles = PLUGINS.map(([, bits]) => ({
      s: solid(g),
      d: QUAD.map((_, k) =>
         flatDot(g, C, 1.1, bits & (1 << k) ? "dot m" : "dot off"),
      ),
   }));

   const zt = PLUGINS.map((_, i) => tween(i === REST ? 0.4 : 0));
   const zr = TRAYS.map(() => tween(1));
   const due = TRAYS.map(() => Infinity);
   const wl = tween(1);
   const drawn = {
      t: PLUGINS.map(() => Number.NaN),
      r: TRAYS.map(() => Number.NaN),
      w: Number.NaN,
   };

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(wl, t);
      PLUGINS.forEach((_, i) => {
         const z = MT + tval(zt[i], t) * RISE;
         if (z !== drawn.t[i]) {
            drawn.t[i] = z;
            put(tiles[i].s, slab(P, front, tileRing[i], null, z, z + TH));
            const [x, y] = TILES[i];
            tiles[i].d.forEach((d, k) =>
               place(d, P(x + QUAD[k][0] * 3.2, y + QUAD[k][1] * 2.2, z + TH)),
            );
         }
         moving ||= !tdone(zt[i], t);
      });
      TRAYS.forEach((_, k) => {
         if (t >= due[k]) {
            due[k] = Infinity;
            tset(zr[k], 1, t, 0);
         }
         const z = MT + TRAY + tval(zr[k], t) * UP;
         if (z !== drawn.r[k]) {
            drawn.r[k] = z;
            put(trays[k], slab(P, front, trayRing[k], trayIn[k], MT, z));
         }
         moving ||= !tdone(zr[k], t) || due[k] < Infinity;
      });
      const l = tval(wl, t);
      if (l !== drawn.w) {
         drawn.w = l;
         line.setAttribute("d", l > 0.01 ? open(part(route, l)) : "");
      }
      return moving;
   });
   bag.add(B.unregister);
   tiles[REST].s.sil.classList.add("hi");

   // Hit test on the tiles' rest tops, sticky by STICK so a lifted tile cannot flip the choice.
   const pick = nearest(spot, CAP, STICK);

   /** Installs plugin a (-1: back to dev-workflow at rest): tile up, then the wire, then its trays by hop. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      const p = a < 0 ? REST : a;
      const bits = PLUGINS[p][1];
      const peak = a < 0 ? 0.4 : 1;
      PLUGINS.forEach((_, i) => {
         tset(zt[i], i === p ? peak : 0, t, 0);
         tiles[i].s.sil.classList.toggle("hi", i === p);
      });
      // The wire runs again from the marketplace; trays the plugin ships dip, then rise by hop.
      Object.assign(wl, { from: 0, to: 0 });
      tset(wl, 1, t, step);
      let n = 0;
      TRAYS.forEach((_, k) => {
         const on = (bits & (1 << k)) !== 0;
         tset(zr[k], on ? 0.2 : 0, t, 0);
         due[k] = on ? t + (2 + n++) * step : Infinity;
      });
      read.textContent = a < 0 ? "rest" : PLUGINS[a][0];
      B.wake();
   }

   follow(bag, stage, svg, (p) => pick(p, act), setActive);
   const set = (v: number) => {
      step = hop(v);
   };
   return { set, destroy: bag.dispose };
};
