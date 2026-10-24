/**
 * ITR Agent (47): the LLM only interviews and calls tools; the numbers come
 * from a deterministic engine over a versioned rule pack. Left, the three
 * documents read on device (26AS, AIS, Form 16), each wired into the pack.
 * Middle, the rule pack: seven new-regime slab plates on a base, a dot per
 * slab along the base's edge. Right, the four forms recommend_itr_form
 * chooses between, numbered in dots. The pointer's height over the pack
 * picks a slab (tested on the rest bands): income climbs, the slab dots light
 * from the bottom up, and the plates above lift away to open the chosen one.
 * On a document its wire feeds the pack (26AS flags the amber mismatch); on
 * a form it rises, green for ITR-2 and amber for the forms ruled out. At rest
 * ITR-2 is the bright mark. Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   open, place, pointer, proj, put, register, rrect, seg, slab, solid, tdone,
   tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [BT, LT, Z0, PITCH, N, CAP, STEP] = [3, 1.6, 4.6, 4.6, 7, 30, 45];
const BASE = rrect(-22, -22, 22, 22, 6, 8);
const LAYER = rrect(-15, -15, 15, 15, 4.5, 8);
const RATES = ["nil", "5%", "10%", "15%", "20%", "25%", "30%"];
const TAGS = [...RATES.map((r) => `slab ${r}`), "26AS", "AIS", "Form 16"];
const tag = (a: number) => TAGS[a] ?? `ITR-${a - N - 2}`;
type Part = [number, number, number, number, number];
/** Side parts, [x, y, half width, half depth, height]: three documents, then four forms. */
const SIDE: Part[] = [
   ...[0, 1, 2].map((k): Part => [-58 + k * 16, 10 + k * 16, 6.5, 7.5, 0.9]),
   ...[0, 1, 2, 3].map((k): Part => [10 + k * 14, -62 + k * 14, 6, 6, 4]),
];
const RINGS = SIDE.map(([x, y, w, d]) => rrect(x - w, y - d, x + w, y + d, 2));
const zl = (k: number) => Z0 + k * PITCH;
/** Rest pose: the plates above the 15% slab stand a little open. */
const REST = (k: number) => (k > 3 ? 0.6 : 0);
/** The most extreme pose (rule 03): the base, the top plate fully lifted, every side part up. */
const EXTENT: Vec3[] = [
   ...BASE.map((q): Vec3 => [q.u, q.v, 0]),
   [-15, -15, zl(N) + 12],
   ...RINGS.flat().map((q): Vec3 => [q.u, q.v, 10]),
];

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = SIDE.map(([x, y, , , h]) => P(x, y, h));
   const bands = RATES.map((_, k) => P(0, 0, zl(k) + LT)[1]);
   return { C, P, front: facing(C), spot, bands };
}

export const frame = FRAMES.cover;
/** The 26AS sheet, the 25% slab, the ITR-2 verdict, then away. */
export const tour: Tour = (({ spot, bands, P }) => [
   spot[0],
   [P(0, 0, 0)[0], bands[5]],
   spot[4],
   null,
])(camera(frame));

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot, bands } = camera(f);
   const bag = disposer();
   let lift = 6 + value * 6;
   let act = -1;
   const g = mk("g", {}, svg);

   // Wires on the ground first: each side part to the pack's base, a dim guide and the line that grows.
   const wire = SIDE.map(([x, y]) => {
      const [ux, uy] = [x / Math.hypot(x, y), y / Math.hypot(x, y)];
      const pts = [P(x - ux * 11, y - uy * 11, 0), P(ux * 23, uy * 23, 0)];
      mk("path", { d: open(pts), class: "nf lo" }, g);
      return { pts, el: mk("path", { class: "nf sil" }, g) };
   });
   // Each side part, then its own marks: a sheet's text lines are its crease, a form's number is its dots.
   const sides = SIDE.map((_, i) => ({
      s: solid(g),
      d: Array.from({ length: Math.max(0, i - 2) }, () =>
         flatDot(g, C, 0.9, "dot m"),
      ),
   }));
   put(solid(g), slab(P, front, BASE, inset(C, BASE, 1.3), 0, BT));
   const dots = RATES.map((_, k) => {
      const d = flatDot(g, C, 1.3, "dot off");
      place(d, P(-15 + k * 5, 19.5, BT));
      return d;
   });
   const layers = RATES.map(() => solid(g));
   const inner = inset(C, LAYER, 1);

   const zs = SIDE.map(() => tween(0));
   const ls = SIDE.map(() => tween(0));
   const opened = RATES.map((_, k) => tween(REST(k)));
   const fill = RATES.map(() => tween(0));
   const drawn = { s: SIDE.map(() => NaN), l: SIDE.map(() => NaN) };
   const was = RATES.map(() => NaN);

   const B = register(stage, (_dt, t) => {
      let moving = false;
      SIDE.forEach(([x, y, , , h], i) => {
         const [z, l, el] = [tval(zs[i], t) * 6, tval(ls[i], t), sides[i]];
         if (z !== drawn.s[i]) {
            const { sil } = slab(P, front, RINGS[i], null, z, z + h);
            const lines = [0, 1, 2].map((k) =>
               i > 2
                  ? ""
                  : seg(
                       P(x - 3, y - 4 + k * 3.5, z + h),
                       P(x + 3 - k, y - 4 + k * 3.5, z + h),
                    ),
            );
            put(el.s, { sil, crease: lines.join("") });
            el.d.forEach((d, j) =>
               place(d, P(x + (j - (el.d.length - 1) / 2) * 2.6, y, z + h)),
            );
         }
         if (l !== drawn.l[i]) {
            const [a, b] = wire[i].pts;
            const end: Vec2 = [lerp(a[0], b[0], l), lerp(a[1], b[1], l)];
            wire[i].el.setAttribute("d", l > 0.01 ? open([a, end]) : "");
         }
         [drawn.s[i], drawn.l[i]] = [z, l];
         moving ||= !tdone(zs[i], t) || !tdone(ls[i], t);
      });
      RATES.forEach((_, k) => {
         const o = tval(opened[k], t) * lift;
         if (o !== was[k])
            put(
               layers[k],
               slab(P, front, LAYER, inner, zl(k) + o, zl(k) + o + LT),
            );
         was[k] = o;
         dots[k].setAttribute(
            "class",
            tval(fill[k], t) > 0.5 ? "dot m" : "dot off",
         );
         moving ||= !tdone(opened[k], t) || !tdone(fill[k], t);
      });
      return moving;
   });
   bag.add(B.unregister);
   sides[4].s.sil.classList.add("hi");

   /** The pack's column first, by the rest bands; then the nearest side part's rest top. */
   const [cx, foot] = [P(0, 0, 0)[0], P(22, 22, 0)[1]];
   const hit = (p: Vec2) => {
      if (Math.abs(p[0] - cx) < 22 && p[1] < foot && p[1] > bands[N - 1] - 20) {
         let k = 0;
         while (k < N - 1 && p[1] < (bands[k] + bands[k + 1]) / 2) k++;
         return k;
      }
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      return d[best] < CAP ? N + best : -1;
   };

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      const k = a < N ? a : -1;
      RATES.forEach((_, j) => {
         const to = k < 0 ? (a < 0 ? REST(j) : 0) : j > k ? 1 : 0;
         tset(opened[j], to, t, Math.abs(j - k) * STEP);
         tset(fill[j], j <= k ? 1 : 0, t, j * STEP);
      });
      SIDE.forEach((_, i) => {
         const on = a === N + i;
         tset(zs[i], on ? 1 : 0, t, 0);
         tset(ls[i], on ? 1 : 0, t, on ? STEP * 2 : 0);
      });
      // One bright place: ITR-2 at rest; 26AS and the forms ruled out answer amber.
      const cls =
         a < 0 || a === N + 4 ? "ok" : a === N || a > N + 2 ? "warn" : "hi";
      const mark = a < 0 ? N + 4 : a;
      [...layers, ...sides.map((s) => s.s)].forEach((s, i) => {
         const c = i === mark ? `sil ${a < 0 ? "hi" : cls}` : "sil";
         s.sil.setAttribute("class", c);
      });
      read.textContent = a < 0 ? "rest" : tag(a);
      B.wake();
   }

   bag.add(
      pointer(stage, {
         move: (p) => setActive(hit(p)),
         leave: () => setActive(-1),
      }),
   );
   bag.add(() => svg.replaceChildren());
   const set = (v: number) => {
      lift = 6 + v * 6;
      was.fill(NaN);
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
