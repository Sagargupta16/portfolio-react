/**
 * agent-brain (59): three agent hosts stand behind one brain, a tray of
 * markdown fact pages that all of them read and write. One page is struck,
 * corrected, with a dashed superseded_by link along the floor to the page
 * that replaced it. The pointer picks a host (tested at rest): the first
 * remembers, its new page lifts out as it is written; the second corrects,
 * the link lights and the replacement rises; the third recalls, every
 * active page rises by its BM25 score, staggered by distance from the
 * host, the struck page stays down and the replacement tops the ranking.
 * At rest the newest page is the one bright mark. Intensity is the rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, mk, now, open,
   place, pointer, prism, proj, put, register, rings, rrect, seg, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [BT, TT, PH, CAP, STICK] = [3, 3, 1.6, 60, 14];
const BOARD = rrect(-14, -38, 130, 65, 10, 8);
const TRAY = rrect(-6, -7, 122, 57, 6, 8);
const HOSTS = [14, 59, 104].map((x) => rings(x - 9, -30, x + 9, -14, 4, 1.3));
const [PW, PD] = [24, 18];
/** The pages, row by row: corner, BM25 score (0: the struck page gets none). */
const SCORE = [0.35, 0, 0.25, 0.5, 0.2, 0.55, 0.3, 1];
const PAGES = SCORE.map((s, i) => ({
   x: 2 + (i % 4) * 30,
   y: Math.floor(i / 4) * 32,
   s,
}));
const [NEW, OLD, REP] = [0, 1, 7];
const LINK: [number, number][] = [
   [44, 18],
   [44, 25],
   [104, 25],
   [104, 32],
];
const RISE = 24;
const EXTENT: Vec3[] = BOARD.map((q): Vec3 => [q.u, q.v, -BT]).concat(
   PAGES.map((p): Vec3 => [p.x, p.y, TT + RISE + PH]),
   [[104, -30, 9]],
);

/** The camera fitted to a frame, and each host's rest lid on screen: the hit spots. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [14, 59, 104].map((x) => P(x, -22, 9));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** remember, correct, recall, away. */
export const tour: Tour = ((s) => [s[0], s[1], s[2], null])(camera(frame).spot);
const OPS = ["remember", "correct", "recall"];

/** Where page i stands, as a share of the rise, when host a acts (-1: rest). */
function lift(a: number, i: number) {
   if (a === 0) return i === NEW ? 0.8 : 0;
   if (a === 1) return i === REP ? 0.55 : 0;
   return a === 2 ? PAGES[i].s : 0;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let rise = RISE * (0.6 + value * 0.4);
   let act = -2; // nothing painted yet: the first setActive(-1) paints rest
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -BT, 0));
   // The hosts at the back, a dashed wire from each down to the tray, each numbered with dots.
   HOSTS.forEach(([r, ri], h) => {
      const x = 14 + h * 45;
      mk("path", { d: seg(P(x, -14, 0), P(x, -7, 0)), class: "nf dash" }, g);
      put(solid(g), prism(P, front, r, ri, 0, 9));
      for (let k = 0; k <= h; k++)
         place(flatDot(g, C, 1.3, "dot m"), P(x - h * 2.5 + k * 5, -22, 9));
   });
   put(solid(g), slab(P, front, TRAY, inset(C, TRAY, 1.2), 0, TT));
   // superseded_by: a dashed guide on the tray, painted before the pages it joins.
   const link = mk(
      "path",
      { d: open(LINK.map(([x, y]) => P(x, y, TT))), class: "nf dash" },
      g,
   );
   const pages = PAGES.map((p, i) => {
      const ring = rrect(p.x, p.y, p.x + PW, p.y + PD, 2.5, 6);
      const el = solid(g);
      const text = mk("path", { class: "nf lo" }, el.g);
      const strike = i === OLD ? mk("path", { class: "nf" }, el.g) : null;
      return { p, ring, inner: inset(C, ring, 1), el, text, strike };
   });

   const z = PAGES.map(() => tween(0));
   const drawn = PAGES.map(() => NaN);
   const B = register(stage, (_dt, t) => {
      let moving = false;
      pages.forEach((e, i) => {
         const h = TT + tval(z[i], t) * rise;
         moving ||= !tdone(z[i], t);
         if (h === drawn[i]) return;
         drawn[i] = h;
         const { x, y } = e.p;
         put(e.el, slab(P, front, e.ring, e.inner, h, h + PH));
         const top = h + PH;
         e.text.setAttribute(
            "d",
            seg(P(x + 4, y + 6, top), P(x + PW - 6, y + 6, top)) +
               seg(P(x + 4, y + 11, top), P(x + PW - 11, y + 11, top)),
         );
         e.strike?.setAttribute(
            "d",
            seg(P(x + 2, y + 8.5, top), P(x + PW - 2, y + 8.5, top)),
         );
      });
      return moving;
   });
   bag.add(B.unregister);

   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] - d[best] < STICK ? act : best;
   };

   /** Host a acts (-1: none); pages move staggered by their distance from that host. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const from = a >= 0 ? a : act;
      act = a;
      PAGES.forEach((p, i) => {
         const dist = Math.hypot(p.x + PW / 2 - (14 + from * 45), p.y + 22);
         tset(z[i], lift(a, i), t, (dist / 12) * 40);
      });
      const bright = a < 0 ? NEW : a === 0 ? NEW : REP;
      pages.forEach((e, i) =>
         e.el.sil.setAttribute(
            "class",
            i === bright ? "hi" : i === OLD ? "lo" : "sil",
         ),
      );
      link.setAttribute("class", a === 1 ? "nf sil dash" : "nf dash");
      read.textContent = a < 0 ? "rest" : OPS[a];
      B.wake();
   }
   setActive(-1);

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => void (rise = RISE * (0.6 + v * 0.4)),
      destroy: bag.dispose,
   };
};
