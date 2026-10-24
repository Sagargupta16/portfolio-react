/**
 * Kinfolk (50): two family trees, each on its own plate, because each
 * relative keeps their own record. Parentage hangs off a union puck (the DAG's
 * union row) between the partners; children route out of the union. The same
 * human is a child in tree A and a partner in tree B; a dashed person link
 * runs between those two records through the gap between the plates, sealed
 * by one bright dot (consent pending). The pointer picks a record and the
 * family rises hop by hop from it through the union rows; reaching a linked
 * record, the link draws solid and the rise crosses into the other tree,
 * both copies kept. Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   open, place, pointer, proj, put, register, rrect, slab, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, LIFT, CAP, STICK, OFF] = [3, 13, 30, 10, 72];
const [HX, HY, PH, UR, UH] = [9, 6.5, 5, 4.5, 2.5];
const FALL = [1, 0.62, 0.38, 0.2, 0.08];
/** Flat numbers to points. */
const pairs = (n: number[]): Vec2[] =>
   n.flatMap((v, i) => (i % 2 ? [] : [[v, n[i + 1]] as Vec2]));
/** One tree in plan, x, y, kind: two partners (0), their union (1), two children (2). */
const TREE = [0, 0, 0, 44, 0, 0, 22, 0, 1, 8, 36, 2, 36, 36, 2];
const NODES = [0, 1].flatMap((t) =>
   [0, 1, 2, 3, 4].map((j) => ({
      x: TREE[j * 3] + t * OFF,
      y: TREE[j * 3 + 1] - t * OFF,
      t,
      k: TREE[j * 3 + 2],
   })),
);
/** Tree A's second child and tree B's first partner are one human. */
const LINK = [4, 5] as const;
const EDGES = [0, 5].flatMap((o) =>
   pairs([0, 2, 1, 2, 2, 3, 2, 4]).map(([a, b]) => [a + o, b + o]),
);
const ADJ = NODES.map((_, i) =>
   [...EDGES, LINK].flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : [])),
);
const REST = NODES.map((_, i) => (i === LINK[0] || i === LINK[1] ? 0.22 : 0));
const PLATES = [0, OFF].map((o) =>
   rrect(-14 + o, -12 - o, 58 + o, 48 - o, 9, 8),
);
/** Partners meet at the union on their row; the union routes down and across to each child. */
const ROUTES = EDGES.map(([a, b]): Vec2[] => {
   const [p, q] = [NODES[a], NODES[b]];
   const my = (p.y + q.y) / 2;
   return q.k === 1
      ? pairs([p.x, p.y, q.x, q.y])
      : pairs([p.x, p.y, p.x, my, q.x, my, q.x, q.y]);
});
/** The person link, through the channel between the plates, and its seal. */
const BRIDGE = pairs([36, 36, 62, 36, 62, -72, 72, -72]);
const SEAL: Vec2 = [62, 4];
const ORDER = NODES.map((_, i) => i).sort(
   (a, b) => NODES[a].x + NODES[a].y - NODES[b].x - NODES[b].y,
);
const height = (i: number) => (NODES[i].k === 1 ? UH : PH);
const EXTENT = PLATES.flatMap((r) =>
   r.map((q): Vec3 => [q.u, q.v, -PT]),
).concat(NODES.map((n, i): Vec3 => [n.x, n.y, LIFT + height(i)]));

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = NODES.map((n, i) => P(n.x, n.y, height(i)));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The linked child in A, a child in B, a partner in A, then away. */
export const tour: Tour = ((s) => [s[4], s[9], s[0], null])(camera(frame).spot);

/** Delay per hop in ms: 50 at intensity 0, 100 at 0.5, 150 at 1. */
const hop = (v: number) => 50 + v * 100;

/** Hops from a to every record, through union rows and the link. */
function hops(a: number): number[] {
   const d = NODES.map(() => Infinity);
   d[a] = 0;
   for (let q = [a]; q.length;)
      q = q.flatMap((i) =>
         ADJ[i].filter((j) => d[j] === Infinity && (d[j] = d[i] + 1)),
      );
   return d;
}

/** The first fraction l of a polyline, by length. */
function part(pts: Vec2[], l: number): Vec2[] {
   const lens = pts
      .slice(1)
      .map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
   let left = l * lens.reduce((s, d) => s + d, 0);
   const out = [pts[0]];
   for (let i = 0; i < lens.length && left > 0; left -= lens[i++]) {
      const [a, b, k] = [pts[i], pts[i + 1], Math.min(1, left / lens[i]) || 0];
      out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]);
   }
   return out;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let [step, act, back, lastL] = [hop(value), -1, false, Number.NaN];
   const g = mk("g", {}, svg);
   const scr = (pts: Vec2[]) => pts.map((q) => P(q[0], q[1], 0));

   // Two plates, two records; on each its routes; between them the pending link and its seal.
   for (const r of PLATES)
      put(solid(g), slab(P, front, r, inset(C, r, 1.4), -PT, 0));
   for (const r of ROUTES) mk("path", { d: open(scr(r)), class: "nf" }, g);
   const bridge = scr(BRIDGE);
   mk("path", { d: open(bridge), class: "nf dash" }, g);
   const line = mk("path", { class: "nf sil" }, g);
   const seal = flatDot(g, C, 1.7, "dot");
   place(seal, P(SEAL[0], SEAL[1], 0));

   const rings = NODES.map((n) =>
      n.k === 1
         ? circ(UR, 32).map((q) => ({ ...q, u: q.u + n.x, v: q.v + n.y }))
         : rrect(n.x - HX, n.y - HY, n.x + HX, n.y + HY, 3, 8),
   );
   const inner = rings.map((r) => inset(C, r, 1));
   const els = ORDER.map(() => solid(g));
   const el = (i: number) => els[ORDER.indexOf(i)];
   const [z, l] = [REST.map((r) => tween(r)), tween(0)];
   const drawn = NODES.map(() => ({ z: Number.NaN, hi: false }));

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(l, t);
      NODES.forEach((_, i) => {
         const [zi, was] = [tval(z[i], t), drawn[i]];
         if (zi !== was.z) {
            was.z = zi;
            const b = zi * LIFT;
            put(el(i), slab(P, front, rings[i], inner[i], b, b + height(i)));
         }
         const hi = i === act && zi > 0.5;
         if (hi !== was.hi) el(i).sil.classList.toggle("hi", (was.hi = hi));
         moving ||= !tdone(z[i], t);
      });
      const li = tval(l, t);
      if (li !== lastL) {
         lastL = li;
         const pts = back ? bridge.slice().reverse() : bridge;
         line.setAttribute("d", li > 0.002 ? open(part(pts, li)) : "");
      }
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, sticky by STICK, so a risen record cannot flip the choice.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   /** Raises the family around record a (-1: rest), hop by hop; the link draws once the rise reaches it. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const h = hops(a >= 0 ? a : act);
      NODES.forEach((_, i) => {
         const to = a < 0 ? REST[i] : (FALL[h[i]] ?? 0);
         const wait = a < 0 ? Math.max(0, FALL.length - h[i]) * 0.5 : h[i];
         tset(z[i], to, t, wait * step);
      });
      const near = Math.min(h[LINK[0]], h[LINK[1]]);
      const on = a >= 0 && near < FALL.length - 1;
      if (on && l.to === 0) back = h[LINK[1]] < h[LINK[0]];
      tset(l, on ? 1 : 0, t, on ? near * step : 0);
      seal.setAttribute("class", a < 0 ? "dot" : "dot m");
      act = a;
      const n = NODES[a];
      read.textContent =
         a < 0
            ? "rest"
            : n.k === 1
              ? "union"
              : `${"ab"[n.t]} gen ${n.k ? 2 : 1}`;
      B.wake();
   }

   read.textContent = "rest";
   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = hop(v)), destroy: bag.dispose };
};
