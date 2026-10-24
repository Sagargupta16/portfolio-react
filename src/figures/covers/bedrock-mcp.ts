/**
 * Bedrock Multi-Model MCP (43): one MCP server in front of many Bedrock model
 * families. Left, the client's prompt tile, wired to the server: a round hub.
 * Right, a fan of model families, each linked to the hub by a dashed route
 * and numbered in dots by what it makes: one for text, two for image, three
 * for video. The pointer picks a family (tested on the rest tops): the
 * prompt's wire lights into the hub, then the hub's route to that family and
 * to its neighbours (bedrock_compare sends one prompt to several), and the
 * tiles rise, the chosen one furthest and bright, the rest less by distance
 * round the fan. At rest the hub's inset mark is the bright place. Intensity
 * is the rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, lerp,
   mk, nearest, now, open, place, poly, proj, put, register, ringAt, rrect,
   slab, seg, solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [TH, HUB, HH, TS, CAP, STEP, R2] = [3, 15, 8, 7, 26, 50, Math.SQRT1_2];
const FALL = [1, 0.4, 0.12, 0];
/** A point by screen column u and depth w, to plan x and y. */
const at = (u: number, w: number): Vec2 => [(u + w) * R2, (w - u) * R2];
/** [family, dots: 1 text, 2 image, 3 video], round the fan from back to front. */
const MODELS: [string, number][] = [
   ["claude", 1],
   ["llama 4", 1],
   ["mistral", 1],
   ["nova", 1],
   ["deepseek", 1],
   ["qwen", 1],
   ["stability", 2],
   ["luma ray 2", 3],
];
const HUBAT = at(-18, 0);
const CLIENT = at(-92, 0);
const FAN = MODELS.map((_, i) => {
   const th = ((-72 + (144 * i) / (MODELS.length - 1)) * Math.PI) / 180;
   return at(-18 + 84 * Math.cos(th), 64 * Math.sin(th));
});
const shift = (r: ReturnType<typeof circ>, [x, y]: Vec2) =>
   r.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
const tile = ([x, y]: Vec2, h = TS) => rrect(x - h, y - h, x + h, y + h, 2.4);
const HRING = shift(circ(HUB, 64), HUBAT);
const CRING = tile(CLIENT, 10);
/** Each plate's plan centre by paint index: a family, then -2 the client and -1 the hub, read with at(). */
const SITE = [...FAN, CLIENT, HUBAT];
/** The most extreme pose (rule 03): every plate, at the top of the rise. */
const EXTENT: Vec3[] = [...FAN.map((c) => tile(c)), CRING].flatMap((r) =>
   r.flatMap((q): Vec3[] => [
      [q.u, q.v, 0],
      [q.u, q.v, 16],
   ]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   return { C, P, front: facing(C), spot: FAN.map(([x, y]) => P(x, y, TH)) };
}

export const frame = FRAMES.cover;
/** claude at the back, stability, then nova mid-fan, then away. */
export const tour: Tour = (({ spot }) => [spot[0], spot[6], spot[3], null])(
   camera(frame),
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let rise = 3 + value * 6;
   let act = -1;
   const g = mk("g", {}, svg);

   // Routes on the ground, behind every plate: the client's wire, then a dashed route to each family.
   const ends = (b: Vec2, r0: number, r1: number) => {
      const l = Math.hypot(b[0] - HUBAT[0], b[1] - HUBAT[1]);
      const k = (r: number) =>
         P(lerp(HUBAT[0], b[0], r / l), lerp(HUBAT[1], b[1], r / l), 0);
      return [k(r0), k(l - r1)];
   };
   const routes = [ends(CLIENT, 0, 10), ...FAN.map((b) => ends(b, HUB, TS))];
   routes.forEach((r, i) =>
      mk("path", { d: open(r), class: i ? "nf lo dash" : "nf lo" }, g),
   );
   const lines = routes.map(() => mk("path", { class: "nf sil" }, g));
   // A risen tile leaves its footprint on the ground, where its route ends.
   const rings = FAN.map((c) => tile(c));
   const slots = rings.map(() => mk("path", { class: "nf lo" }, g));

   // Plates back to front by depth: the client, the hub with its mark, the family tiles.
   const order = [-2, -1, ...FAN.keys()].sort((a, b) => {
      const [pa, pb] = [SITE.at(a)!, SITE.at(b)!];
      return pa[0] + pa[1] - pb[0] - pb[1];
   });
   const tiles: { s: ReturnType<typeof solid>; d: SVGEllipseElement[] }[] = [];
   let mark!: SVGPathElement;
   for (const i of order) {
      if (i === -2) {
         // The prompt: its text lines are the crease.
         const [x, y] = CLIENT;
         const row = (k: number) =>
            seg(
               P(x - 5, y - 4 + k * 4, TH + 1),
               P(x + 5 - k * 2, y - 4 + k * 4, TH + 1),
            );
         const { sil } = slab(P, front, CRING, null, 0, TH + 1);
         put(solid(g), { sil, crease: [0, 1, 2].map(row).join("") });
      } else if (i === -1) {
         put(solid(g), slab(P, front, HRING, inset(C, HRING, 1.2), 0, HH));
         const ring = ringAt(P, shift(circ(6, 48), HUBAT), HH);
         mark = mk("path", { d: poly(ring), class: "nf hi" }, g);
      } else
         tiles[i] = {
            s: solid(g),
            d: Array.from({ length: MODELS[i][1] }, () =>
               flatDot(g, C, 1, "dot m"),
            ),
         };
   }
   const inner = rings.map((r) => inset(C, r, 0.9));
   const z = FAN.map(() => tween(0));
   const l = routes.map(() => tween(0));
   const drawn = {
      z: FAN.map(() => Number.NaN),
      l: routes.map(() => Number.NaN),
   };

   const B = register(stage, (_dt, t) => {
      let moving = false;
      FAN.forEach(([x, y], i) => {
         const zi = tval(z[i], t) * rise;
         if (zi !== drawn.z[i]) {
            drawn.z[i] = zi;
            const foot = zi > 0.6 ? poly(ringAt(P, rings[i], 0)) : "";
            slots[i].setAttribute("d", foot);
            put(tiles[i].s, slab(P, front, rings[i], inner[i], zi, zi + TH));
            const d = tiles[i].d;
            d.forEach((e, j) =>
               place(e, P(x + (j - (d.length - 1) / 2) * 2.8, y, zi + TH)),
            );
         }
         moving ||= !tdone(z[i], t);
      });
      routes.forEach(([a, b], i) => {
         const li = tval(l[i], t);
         if (li === drawn.l[i]) return;
         drawn.l[i] = li;
         const e: Vec2 = [lerp(a[0], b[0], li), lerp(a[1], b[1], li)];
         lines[i].setAttribute("d", li > 0.01 ? open([a, e]) : "");
         moving ||= !tdone(l[i], t);
      });
      return moving || l.some((w) => !tdone(w, t));
   });
   bag.add(B.unregister);

   // Hit test on the tiles' rest tops, not sticky; the hub and client read as rest.
   const pick = nearest(spot, CAP, 0);

   /** Sends the prompt to family a and its neighbours: the client's wire, then the routes out by distance. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      tset(l[0], a < 0 ? 0 : 1, t, 0);
      FAN.forEach((_, i) => {
         const d = Math.min(3, Math.abs(i - a));
         tset(z[i], a < 0 ? 0 : FALL[d], t, (1 + d) * STEP);
         tset(
            l[i + 1],
            a >= 0 && d < 2 ? 1 : 0,
            t,
            a < 0 ? 0 : (1 + d) * STEP - STEP,
         );
         tiles[i].s.sil.classList.toggle("hi", i === a);
      });
      mark.setAttribute("class", a < 0 ? "nf hi" : "nf lo");
      read.textContent = a < 0 ? "rest" : MODELS[a][0];
      B.wake();
   }

   follow(bag, stage, svg, (p) => pick(p, -1), setActive);
   const set = (v: number) => {
      rise = 3 + v * 6;
      drawn.z.fill(Number.NaN);
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
