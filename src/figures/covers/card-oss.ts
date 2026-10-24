/**
 * OSS Contributions Card Action (55): two GraphQL searches feed two cards.
 * The is:merged and is:open queries stand at the back, each wired to its
 * card; the merged card lists pull requests newest first with a filled
 * mark, the in-review card lists the open ones with a hollow one. The
 * pointer picks a query or an open row (tested at rest): a query lifts its
 * card's rows, staggered from the top row down, as the search finds them;
 * an open row lands, it rises out of review, crosses into the merged
 * card's first slot and its mark turns green while the merged rows step
 * down a slot, staggered by distance. At rest the is:merged query is the
 * one bright mark. Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, lerp, mk, now,
   place, prism, proj, put, register, rings, rrect, seg, slab, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [BT, TT, RT, QH, CAP, STICK] = [3, 2.4, 1.8, 8, 26, 6];
const BOARD = rrect(-12, -40, 124, 54, 9, 8);
const TRAYS = [rrect(-2, -6, 52, 48, 4, 8), rrect(60, -6, 114, 48, 4, 8)];
const QX = [25, 87];
const QUERY = QX.map((x) => rings(x - 7, -32, x + 7, -18, 6.5, 1.3));
const [RW, RD, PITCH] = [46, 6, 10];
const slotY = (s: number) => -1 + s * PITCH;
const [MERGED, OPEN] = [4, 3];
const [ARC, RISE] = [14, 12];
const EXTENT: Vec3[] = BOARD.map((q): Vec3 => [q.u, q.v, -BT]).concat([
   [QX[0], -32, QH],
   [2, slotY(0), TT + RISE + ARC + RT],
   [64, slotY(0), TT + RISE + RT],
]);

/** The camera fitted to a frame; the hit spots: queries 0-1, then the open rows 2-4 at rest. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [
      ...QX.map((x) => P(x, -25, QH)),
      ...[0, 1, 2].map((r) => P(64 + RW / 2, slotY(r) + RD / 2, TT + RT)),
   ];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** is:open, the open row that lands, is:merged, away. */
export const tour: Tour = ((s) => [s[1], s[2], s[0], null])(camera(frame).spot);
/** The read-out per active value, -1 (rest) to 4 (the third open row). */
const NAMES = ["rest", "is:merged", "is:open", "pr 1", "pr 2", "pr 3"];

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let rise = RISE * (0.5 + value * 0.5);
   let act = -2; // nothing painted yet: the first setActive(-1) paints rest
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -BT, 0));
   // Each query, its dashed wire down to its card, painted before the card it feeds.
   const wires = QX.map((x) =>
      mk("path", { d: seg(P(x, -18, 0), P(x, -6, 0)), class: "nf dash" }, g),
   );
   const queries = QUERY.map(([r, ri]) => {
      const el = solid(g);
      put(el, prism(P, front, r, ri, 0, QH));
      return el;
   });
   TRAYS.forEach((r) =>
      put(solid(g), slab(P, front, r, inset(C, r, 1.2), 0, TT)),
   );
   /** The rows, merged then open, far to near: each a thin slab, a title rule and its status mark. */
   const rows = Array.from({ length: MERGED + OPEN }, (_, i) => {
      const el = solid(g);
      const ln = mk("path", { class: "nf lo" }, el.g);
      const dot = flatDot(el.g, C, 1.4, i < MERGED ? "dot m" : "dot off");
      return { el, ln, dot, z: tween(0), mv: tween(0), ok: false, d: "" };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      rows.forEach((w, i) => {
         const [z, m] = [tval(w.z, t) * rise, tval(w.mv, t)];
         moving ||= !tdone(w.z, t) || !tdone(w.mv, t);
         const open = i >= MERGED;
         const s = open ? lerp(i - MERGED, 0, m) : i + m;
         const x = open ? lerp(64, 2, m) : 2;
         const h = TT + z + (open ? Math.sin(Math.PI * m) * ARC : 0);
         const y = slotY(s);
         const key = `${x} ${y} ${h}`;
         if (key === w.d) return;
         w.d = key;
         put(
            w.el,
            slab(P, front, rrect(x, y, x + RW, y + RD, 2, 6), null, h, h + RT),
         );
         w.ln.setAttribute(
            "d",
            seg(P(x + 8, y + 3, h + RT), P(x + RW - 6 - i * 2, y + 3, h + RT)),
         );
         place(w.dot, P(x + 4, y + 3, h + RT));
         const ok = open && m > 0.9;
         if (ok === w.ok) return;
         w.ok = ok;
         w.dot.setAttribute("class", ok ? "dot ok" : "dot off");
      });
      return moving;
   });
   bag.add(B.unregister);

   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (best < 0 || d[best] >= CAP) return -1;
      return act >= 0 && d[act] - d[best] < STICK ? act : best;
   };

   /** Picks query a (0-1), open row a - 2 (2-4), or nothing (-1). */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      const land = a >= 2 ? MERGED + a - 2 : -1;
      rows.forEach((w, i) => {
         const tray = i < MERGED ? 0 : 1;
         const k = tray ? i - MERGED : i;
         tset(w.z, a === tray ? 1 - k * 0.12 : 0, t, a === tray ? k * 55 : 0);
         // landing: the open row goes, the merged rows step down from the top one first
         const go = land >= 0 && (i === land || i < MERGED);
         tset(w.mv, go ? 1 : 0, t, i < MERGED ? 300 + i * 45 : 0);
         w.el.sil.classList.toggle("hi", i === land);
      });
      queries.forEach((q, k) =>
         q.sil.classList.toggle("hi", k === Math.max(a, 0)),
      );
      wires.forEach((e, k) =>
         e.setAttribute("class", k === a ? "nf sil dash" : "nf dash"),
      );
      read.textContent = NAMES[a + 1];
      B.wake();
   }
   setActive(-1);

   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      rise = RISE * (0.5 + v * 0.5);
   };
   return { set, destroy: bag.dispose };
};
