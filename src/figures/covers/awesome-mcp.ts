/**
 * Awesome MCP Servers (31): a categorised list with CI entry rules, feeding
 * a searchable site rebuilt every hour. Left, a new entry waits before the
 * CI gate, a block with three check dots (format, licence, links). In the
 * middle, README.md: a sheet of four category sections, each a bar holding
 * its entries as dots, with a dashed slot at its end. Right, the site: a
 * search bar over four category tiles. The pointer picks a category, on the
 * list or on the site (tested on rest tops): the checks pass one by one,
 * the entry hops the gate into that section's slot, and the rebuild runs
 * out across the site from that category's tile, which rises highest and
 * takes the bright edge. On the gate the checks alone run. At rest the new
 * entry, bright, waits at the gate. Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, flatDot, inset, lerp, mk,
   now, place, pointer, poly, proj, put, register, ringAt, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, BH, EH, GH, SH, TH, RISE, ARC, CAP] = [
   3, 1.6, 2.6, 7, 2.4, 3, 7, 16, 30,
];
const TAGS = ["data", "devtools", "cloud", "search"];
const GATE = rrect(-12, 52, 4, 68, 3, 6);
const WAIT: Vec3 = [-22, 74, 0];
const LIST = rrect(12, 0, 62, 52, 3, 6);
const SITE = rrect(76, -26, 128, 30, 4, 8);
const SEARCH = rrect(82, -21, 122, -15, 2, 4);
/** Each section's bar centre on the list, and where its new entry lands. */
const ROWS: Vec2[] = [0, 1, 2, 3].map((j) => [31, 8 + j * 12]);
const SLOTS: Vec3[] = ROWS.map(([, y]) => [53, y, SH]);
/** The site's category tiles, 2 x 2: [x0, y0]. */
const TILES: Vec2[] = [0, 1, 2, 3].map((i) => [
   82 + (i % 2) * 22,
   -9 + (i >> 1) * 19,
]);
const tile = ([x, y]: Vec2) => rrect(x, y, x + 18, y + 15, 2.6, 6);
const box = ([x, y]: readonly number[], h: number) =>
   rrect(x - h, y - h, x + h, y + h, 1.6, 6);
const EXTENT: Vec3[] = [GATE, LIST, SITE]
   .flatMap((r) => r.map((q): Vec3 => [q.u, q.v, -PT]))
   .concat([
      [WAIT[0], WAIT[1] + 4, -PT],
      [WAIT[0], WAIT[1], ARC + EH],
      [82, -9, SH + TH + RISE],
   ]);

/** The camera fitted to a frame, and the rest tops: the gate, the four sections, the four tiles. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [P(-4, 60, GH)]
      .concat(ROWS.map(([x, y]) => P(x, y, SH + BH)))
      .concat(TILES.map(([x, y]) => P(x + 9, y + 7.5, SH + TH)));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The gate, the cloud section, the search tile on the site, then away. */
export const tour: Tour = ((s) => [s[0], s[3], s[8], null])(camera(frame).spot);

/** Delay per hop in ms: 50 at intensity 0, 110 at 1. */
const hop = (v: number) => 50 + v * 60;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   const plate = (
      r: ReturnType<typeof rrect>,
      z0: number,
      z1: number,
      b = 1.2,
   ) => put(solid(g), slab(P, front, r, inset(C, r, b), z0, z1));

   // The gate and its checks.
   plate(GATE, 0, GH, 1);
   const checks = [-8, -4, 0].map((x) => {
      const d = flatDot(g, C, 1.3, "dot off");
      place(d, P(x, 60, GH));
      return d;
   });

   // README.md: the sheet, each section's bar with its entries, the slot for the new one.
   plate(LIST, -PT, SH);
   ROWS.forEach(([x, y], j) => {
      plate(rrect(x - 13, y - 3.6, x + 13, y + 3.6, 1.6, 6), SH, SH + BH, 0.8);
      for (let k = 0; k < 4 - (j % 2); k++)
         place(flatDot(g, C, 1.1, "dot off"), P(x - 9 + k * 5, y, SH + BH));
      mk(
         "path",
         { d: poly(ringAt(P, box(SLOTS[j], 4.6), SH)), class: "nf lo dash" },
         g,
      );
   });

   // The new entry, painted after the list it hops over.
   const entry = solid(g);

   // The site: its plate, the search bar, the four category tiles.
   plate(SITE, -PT, SH, 1.4);
   mk("path", { d: poly(ringAt(P, SEARCH, SH)), class: "nf lo" }, g);
   const tiles = TILES.map((q) => {
      const ring = tile(q);
      return { ring, inner: inset(C, ring, 1), el: solid(g) };
   });

   const lit = checks.map(() => tween(0));
   const z = tiles.map(() => tween(0));
   const go = tween(0);
   let [from, to]: Vec3[] = [WAIT, WAIT];
   const drawn = {
      p: Number.NaN,
      z: tiles.map(() => Number.NaN),
      c: checks.map(() => false),
   };
   const at = (p: number): Vec3 => [
      lerp(from[0], to[0], p),
      lerp(from[1], to[1], p),
      lerp(from[2], to[2], p) + Math.sin(Math.PI * p) * ARC,
   ];

   const B = register(stage, (_dt, t) => {
      const p = tval(go, t);
      if (p !== drawn.p) {
         drawn.p = p;
         const [x, y, z0] = at(p);
         const ring = box([x, y], 4);
         put(entry, slab(P, front, ring, inset(C, ring, 0.9), z0, z0 + EH));
      }
      let moving = !tdone(go, t);
      checks.forEach((d, k) => {
         const on = tval(lit[k], t) > 0.5;
         if (on !== drawn.c[k])
            d.setAttribute("class", on ? "dot m" : "dot off");
         drawn.c[k] = on;
         moving ||= !tdone(lit[k], t);
      });
      tiles.forEach((e, i) => {
         const zi = SH + tval(z[i], t) * RISE;
         if (zi !== drawn.z[i])
            put(
               e.el,
               slab(P, front, e.ring, e.inner, (drawn.z[i] = zi), zi + TH),
            );
         moving ||= !tdone(z[i], t);
      });
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; a section and its site tile are one category.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      return d[best] < CAP ? (best === 0 ? 4 : (best - 1) % 4) : -1;
   };

   /** 0 to 3: that category, checks, hop, rebuild; 4: the checks alone; -1: rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const cat = a >= 0 && a < 4;
      lit.forEach((w, k) => tset(w, a >= 0 ? 1 : 0, t, a >= 0 ? k * step : 0));
      const dest = cat ? SLOTS[a] : WAIT;
      if (dest !== to) {
         [from, to] = [at(tval(go, t)), dest];
         go.from = go.to = 0;
         tset(go, 1, t, cat ? 3 * step : 0);
      }
      tiles.forEach((e, i) => {
         const dist = cat
            ? Math.abs((i % 2) - (a % 2)) + Math.abs((i >> 1) - (a >> 1))
            : 0;
         tset(
            z[i],
            cat ? clamp(1 - dist * 0.4, 0.2, 1) : 0,
            t,
            cat ? (6 + dist) * step : 0,
         );
         e.el.sil.classList.toggle("hi", i === a);
      });
      entry.sil.classList.toggle("hi", !cat);
      act = a;
      read.textContent = a < 0 ? "rest" : cat ? TAGS[a] : "ci";
      B.wake();
   }
   entry.sil.classList.add("hi");

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = hop(v)), destroy: bag.dispose };
};
