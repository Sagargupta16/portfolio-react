/**
 * MCP Toolkit (30): every with* call wraps the server's tool registration, so
 * a tool call runs an onion, outermost first: withCors, withAuth,
 * withRateLimit, withCache, then the handler at the core. The layers stand as
 * nested plates, each one inside and above the last; the rate limiter's band
 * holds its token bucket in dots and the cache's band its entry. The call
 * comes in on a wire from the left. The pointer picks a layer (tested on each
 * layer's rest top, innermost first): the call's wire lights, the layers
 * inside the chosen one lift away from it by distance so its band shows, and
 * it answers: amber where a bad key dies (withAuth), a token spent at the
 * limiter, the entry lit on a cache hit. At rest the handler is the bright
 * mark. Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, mk, now,
   open, place, proj, put, register, rrect, slab, solid, tdone, tset, tval,
   tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [H, STEP, R2] = [5, 50, Math.SQRT1_2];
const NAMES = ["withCors", "withAuth", "withRateLimit", "withCache", "handler"];
const RS = [46, 36, 26, 16, 8];
const LAYERS = RS.map((r) => rrect(-r, -r, r, r, Math.min(7, r * 0.45), 8));
/** Rest pose: the handler stands a little open from the cache. */
const REST = (i: number) => (i === 4 ? 0.35 : 0);
/** The call's wire, on the ground from the left into the outer layer's corner. */
const WIRE: Vec2[] = [-98, -62].map((u) => [u * R2, -u * R2]);
/** The most extreme pose (rule 03): the outer layer, and the core fully lifted. */
const EXTENT: Vec3[] = [
   ...LAYERS[0].map((q): Vec3 => [q.u, q.v, 0]),
   [WIRE[0][0], WIRE[0][1], 0],
   [-8, -8, 5 * H + 22],
];
const top = (i: number) => (i + 1) * H;

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C), front: facing(C) };
}

/** The layer under p: unprojected onto each rest top, innermost first, so a raised core is tested where it rests. */
function pick(C: ReturnType<typeof Cam>, p: Vec2, gap: number) {
   for (let i = RS.length - 1; i >= 0; i--) {
      const [x, y] = unproj(C, p[0], p[1], top(i) + REST(i) * gap);
      if (Math.max(Math.abs(x), Math.abs(y)) <= RS[i]) return i;
   }
   return -1;
}

/** Where layer i stands, as a share of the gap, when the call reaches layer a (-1: rest). */
function lifted(a: number, i: number) {
   if (a < 0) return REST(i);
   return i > a ? 1 + (i - a - 1) * 0.15 : 0;
}

/** How each layer answers: amber where a bad key dies, green on a cache hit, bright otherwise. */
const ANSWER = ["sil hi", "sil warn", "sil hi", "sil ok", "sil hi"];
/** Layer i's edge when the call reaches a: only the answering layer (the handler at rest) shows. */
function edge(a: number, i: number) {
   const on = a < 0 ? 4 : a;
   return i === on ? ANSWER[on] : "sil";
}

export const frame = FRAMES.cover;
/** withAuth's band, the rate limiter's, the cache's, then away. */
export const tour: Tour = ((P) => [
   P(0, 31, top(1)),
   P(0, 21, top(2)),
   P(0, 12, top(3)),
   null,
])(camera(frame).P);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let gap = 10 + value * 10;
   let act = -1;
   const g = mk("g", {}, svg);

   // The call's wire first, behind the plates: a dim guide and the line that grows over it.
   const wire = WIRE.map(([x, y]) => P(x, y, 0));
   mk("path", { d: open(wire), class: "nf lo" }, g);
   const line = mk("path", { class: "nf sil" }, g);
   // The layers, outer to inner, which is bottom to top; the bucket and the entry ride their bands.
   const els = LAYERS.map(() => solid(g));
   const inner = LAYERS.map((r) => inset(C, r, 1.1));
   const tokens = [-9, -3, 3, 9].map((x) => ({
      d: flatDot(g, C, 1.2, "dot m"),
      x,
   }));
   // In paint order the tokens go just after the limiter, under the cache plate.
   els[2].g.after(...tokens.map((t) => t.d));
   const entry = flatDot(g, C, 1.3, "dot off");
   place(entry, P(0, 12, top(3)));
   els[3].g.after(entry);

   const lift = LAYERS.map((_, i) => tween(REST(i)));
   const wl = tween(0);
   const drawn = LAYERS.map(() => Number.NaN);
   let wd = 0;

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(wl, t);
      LAYERS.forEach((r, i) => {
         const z = tval(lift[i], t) * gap;
         if (z !== drawn[i]) {
            drawn[i] = z;
            put(els[i], slab(P, front, r, inner[i], i * H + z, top(i) + z));
         }
         moving ||= !tdone(lift[i], t);
      });
      // The entry and tokens ride their plate when it lifts.
      tokens.forEach(({ d, x }) => place(d, P(x, 21, top(2) + drawn[2])));
      place(entry, P(0, 12, top(3) + drawn[3]));
      const l = tval(wl, t);
      if (l !== wd) {
         wd = l;
         line.setAttribute(
            "d",
            l > 0.01 ? open([wire[0], lerp2(wire, l)]) : "",
         );
      }
      return moving;
   });
   bag.add(B.unregister);
   els[4].sil.classList.add("hi");

   /** The call reaches layer a: its wire lights, the layers inside a open away from it, nearest first. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      tset(wl, a < 0 ? 0 : 1, t, 0);
      LAYERS.forEach((_, i) => {
         const delay = a < 0 ? (4 - i) * 30 : Math.abs(i - a) * STEP;
         tset(lift[i], lifted(a, i), t, delay);
         els[i].sil.setAttribute("class", edge(a, i));
      });
      // withRateLimit spends a token from the bucket; withCache lights its entry on a hit.
      tokens.forEach(({ d }, k) =>
         d.setAttribute("class", a === 2 && k === 3 ? "dot off" : "dot m"),
      );
      entry.setAttribute("class", a === 3 ? "dot m" : "dot off");
      read.textContent = a < 0 ? "rest" : NAMES[a];
      B.wake();
   }

   follow(bag, stage, svg, (p) => pick(C, p, gap), setActive);
   const set = (v: number) => {
      gap = 10 + v * 10;
      drawn.fill(Number.NaN);
      B.wake();
   };
   return { set, destroy: bag.dispose };
};

/** The point a fraction l along a two point wire. */
function lerp2([a, b]: Vec2[], l: number): Vec2 {
   return [a[0] + (b[0] - a[0]) * l, a[1] + (b[1] - a[1]) * l];
}
