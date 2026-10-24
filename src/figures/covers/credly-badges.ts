/**
 * Credly Badge README Action (42): fetch the Credly badges, split them by
 * category, write them out, commit. Left, badges.json: a small plate whose
 * two columns hold the badges as fetched. Middle, README.md with its dashed
 * CREDLY-BADGES START and END markers and three rows between them, one per
 * category: two certifications (larger), three partner, two knowledge.
 * Right, the SVG card, the same three groups tighter. The pointer picks a
 * plate (tested on rest centres): every badge hops to its seat there, row
 * by row and badge by badge, the plate takes the bright edge, and once they
 * land the commit dot on that output marks. At rest the README is written:
 * badges in their rows, its markers bright, its commit marked. Intensity is
 * the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk,
   nearest, now, open, place, proj, put, register, rrect, slab, solid, tdone,
   tset, tval, tween, follow,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, ARC, CAP, HOME] = [3, 14, 40, 1];
const CAT = [0, 0, 1, 1, 1, 2, 2];
const R = CAT.map((c) => (c === 0 ? 4.6 : 3.8));
const H = CAT.map((c) => (c === 0 ? 2.8 : 2.2));
const TAGS = ["json", "readme", "svg"];
// prettier-ignore
const PLATES = [rrect(-80, -6, -56, 28, 4, 8), rrect(-26, -24, 26, 24, 5, 8), rrect(37, -43, 75, -11, 4, 8)];
const CENTRES: Vec2[] = [
   [-68, 11],
   [0, 0],
   [56, -27],
];
/** Seats in rows, one row per category, centred on (cx, y0) with the given pitches. */
const rows = (cx: number, y0: number, dy: number, dx: number) =>
   CAT.map((c, k): Vec2 => {
      const mine = CAT.flatMap((d, i) => (d === c ? [i] : []));
      return [cx + (mine.indexOf(k) - (mine.length - 1) / 2) * dx, y0 + c * dy];
   });
/** The feed holds them in two columns, in fetch order. */
const FEED = CAT.map((_, k): Vec2 => [-73 + (k % 2) * 10, -1 + (k >> 1) * 8]);
const SEATS = [FEED, rows(0, -12, 12, 13), rows(56, -36, 8.5, 9.5)];
const MARKS = [-19, 19];
const EXTENT: Vec3[] = PLATES.flatMap((r) =>
   r.map((q): Vec3 => [q.u, q.v, -PT]),
).concat(
   [
      [-34, 5],
      [28, -13],
      [-6, -8],
   ].map(([x, y]): Vec3 => [x, y, ARC + 3]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   return { C, P, front: facing(C), spot: CENTRES.map(([x, y]) => P(x, y, 0)) };
}

export const frame = FRAMES.cover;
/** Back to the feed, out to the card, into the README, then away. */
export const tour: Tour = ((s) => [s[0], s[2], s[1], null])(camera(frame).spot);

/** Delay per hop in ms: 40 at intensity 0, 90 at 1. */
const hop = (v: number) => 40 + v * 50;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The three plates; README.md's markers; a commit dot by each output's front corner.
   const plates = PLATES.map((r) => {
      const el = solid(g);
      put(el, slab(P, front, r, inset(C, r, 1.2), -PT, 0));
      return el;
   });
   const marks = mk("path", { class: "nf lo dash" }, g);
   marks.setAttribute(
      "d",
      MARKS.map((y) => open([P(-21, y, 0), P(21, y, 0)])).join(""),
   );
   const commits = [null, P(21, 21, 0), P(71, -15, 0)].map((q) => {
      if (!q) return null;
      const d = flatDot(g, C, 1.4, "dot off");
      place(d, q);
      return d;
   });

   // The badges, re-ordered back to front by x + y whenever their flights change it.
   const badges = CAT.map((_, k) => ({
      el: solid(g),
      pos: SEATS[HOME][k],
      z: 0,
      from: SEATS[HOME][k],
      to: SEATS[HOME][k],
      go: tween(1),
   }));
   const out = tween(1);
   let [dest, order] = [HOME, ""];
   const drawn = { pos: badges.map(() => ""), out: -1 };

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(out, t);
      badges.forEach((b, k) => {
         const p = tval(b.go, t);
         b.pos = [lerp(b.from[0], b.to[0], p), lerp(b.from[1], b.to[1], p)];
         b.z = Math.sin(Math.PI * p) * ARC;
         const key = `${b.pos} ${b.z}`;
         moving ||= !tdone(b.go, t);
         if (key === drawn.pos[k]) return;
         drawn.pos[k] = key;
         const ring = circ(R[k], 40).map((q) => ({
            ...q,
            u: q.u + b.pos[0],
            v: q.v + b.pos[1],
         }));
         put(b.el, slab(P, front, ring, inset(C, ring, 0.8), b.z, b.z + H[k]));
      });
      const depth = (k: number) => badges[k].pos[0] + badges[k].pos[1];
      const now2 = CAT.map((_, k) => k).sort((a, c) => depth(a) - depth(c));
      if (now2.join() !== order) {
         order = now2.join();
         for (const k of now2) g.appendChild(badges[k].el.g);
      }
      const lit = tval(out, t) > 0.5 ? dest : 0;
      if (lit !== drawn.out) {
         drawn.out = lit;
         commits.forEach((d, i) =>
            d?.setAttribute("class", lit === i ? "dot m" : "dot off"),
         );
      }
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the plates' rest centres, on screen.
   const pick = nearest(spot, CAP, 0);

   /** Sends every badge to its seat on plate a (-1: the README, at rest), category by category. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const to = a < 0 ? HOME : a;
      if (to !== dest) {
         badges.forEach((b, k) => {
            const within = CAT.filter((c, i) => c === CAT[k] && i < k).length;
            [b.from, b.to, b.go] = [b.pos, SEATS[to][k], tween(0)];
            tset(b.go, 1, t, (CAT[k] * 3 + within) * step);
         });
         out.from = 0;
         out.to = 0;
         tset(out, 1, t, 10 * step);
         dest = to;
      }
      plates.forEach((p, i) =>
         p.sil.classList.toggle("hi", i !== HOME && i === a),
      );
      marks.setAttribute("class", to === HOME ? "nf hi dash" : "nf lo dash");
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }
   marks.setAttribute("class", "nf hi dash");

   follow(bag, stage, svg, (p) => pick(p, -1), setActive);
   return {
      set: (v) => {
         step = hop(v);
      },
      destroy: bag.dispose,
   };
};
