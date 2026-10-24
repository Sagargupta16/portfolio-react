/**
 * LeetCode Card Action (54): the card leetcode_card.py renders, standing up.
 * A back plate holds the contest rating history as a line over dim grid
 * rules, its peak marked with a dot; in front, three columns are the problems
 * solved by difficulty, numbered with dots at their feet. The pointer picks a
 * contest on the line or a column (tested at rest): a contest draws the line
 * in up to it and the columns grow to what was solved by then, staggered one
 * after another; a column keeps its height and the other two sink, staggered
 * by distance. At rest the peak is the one bright mark. Intensity is how far
 * the other columns sink.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fillet, fitFrame, flatDot, follow, hull, inset,
   lerp, mk, now, open, place, poly, prism, proj, put, register, rings, rrect,
   seg, slab, tdone, tset, tval, tween, solid,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [BT, PX, PT, HP, CAP, STICK] = [3, 0, 2.2, 38, 22, 4];
const CARD = rrect(-10, -28, 48, 90, 8, 8);
/** The plate's face in its own (y, z), time running right along -y; ARC + 1 points per corner, EDGE its right side and top. */
const ARC = 5;
const FACE = fillet(
   [
      [-3, 0],
      [-3, HP],
      [84, HP],
      [84, 0],
   ],
   [0.6, 4, 4, 0.6],
   ARC,
);
const EDGE = [ARC, 3 * (ARC + 1)] as const;
const RATING = [
   1520, 1584, 1551, 1660, 1712, 1690, 1828, 1905, 1871, 2166, 2034, 2075,
];
const PEAK = RATING.indexOf(Math.max(...RATING));
const cy = (i: number) => 79 - i * 7;
const cz = (r: number) => 5 + ((r - 1450) / 760) * (HP - 9);
const LINE: Vec3[] = RATING.map((r, i) => [PX + PT, cy(i), cz(r)]);
/** The columns past the plate's end: x, solved share of the tallest. Easy, medium, hard. */
const COLS = [
   [9, 1],
   [22, 0.66],
   [35, 0.28],
] as const;
const [CY, CR, CH] = [-16, 4.6, 32];
const NAMES = ["easy", "med", "hard"];
const EXTENT: Vec3[] = CARD.map((q): Vec3 => [q.u, q.v, -BT]).concat([
   [PX, -3, HP],
   [PX, 84, HP],
   [9, CY, CH + 2],
]);

/** The camera fitted to a frame; the hit spots: contests 0-11 on the line, then the column tops 12-14. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [
      ...LINE.map((q) => P(...q)),
      ...COLS.map(([x, s]) => P(x, CY, 2 + s * CH)),
   ];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** An early contest, the peak, the hard column, away. */
export const tour: Tour = ((s) => [s[4], s[PEAK], s[14], null])(
   camera(frame).spot,
);

/** The first fraction l of a polyline, by vertex count. */
function upTo(pts: Vec2[], l: number): Vec2[] {
   const k = l * (pts.length - 1);
   const i = Math.floor(k);
   const out = pts.slice(0, i + 1);
   if (i < pts.length - 1) {
      const [a, b] = [pts[i], pts[i + 1]];
      out.push([lerp(a[0], b[0], k - i), lerp(a[1], b[1], k - i)]);
   }
   return out;
}

/** The read-out for pick a: rest, a contest's rating, or a column's name. */
function label(a: number, contest: boolean) {
   if (a < 0) return "rest";
   if (!contest) return NAMES[a - 12];
   return `${a === PEAK ? "peak " : ""}${RATING[a]}`;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let sink = 0.35 + value * 0.4;
   let act = -2; // nothing painted yet: the first setActive(-1) paints rest
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, CARD, inset(C, CARD, 1.4), -BT, 0));
   // The plate: its silhouette, the near face's right side and top for its thickness, then the grid rules on the face.
   const face = (x: number) => FACE.map(([y, z]) => P(x, y, z));
   put(solid(g), {
      sil: poly(hull(face(PX).concat(face(PX + PT)))),
      crease: open(face(PX + PT).slice(...EDGE)),
   });
   const at = (y: number, z: number) => P(PX + PT, y, z);
   const rules = [12, 20, 28].map((z) => seg(at(81, z), at(0, z))).join("");
   mk("path", { class: "nf lo", d: rules }, g);
   const scr = LINE.map((q) => P(...q));
   mk("path", { class: "nf", d: open(scr) }, g);
   const drawnIn = mk("path", { class: "nf hi" }, g);
   const peak = mk(
      "ellipse",
      { rx: 1.9 * C.S, ry: 1.9 * C.S, class: "dot" },
      g,
   );
   place(peak, scr[PEAK]);
   const cur = mk("ellipse", { rx: 1.5 * C.S, ry: 1.5 * C.S, class: "dot" }, g);
   // The columns, left to right, each with its dots at its foot.
   const cols = COLS.map(([x], b) => {
      for (let k = 0; k <= b; k++)
         place(flatDot(g, C, 1, "dot m"), P(x - b * 1.4 + k * 2.8, CY + 8, 0));
      return {
         el: solid(g),
         r: rings(x - CR, CY - CR, x + CR, CY + CR, CR, 1.2),
      };
   });

   const len = tween(1);
   const h = COLS.map(() => tween(1));
   const drawn = { len: Number.NaN, h: COLS.map(() => Number.NaN) };
   const B = register(stage, (_dt, t) => {
      let moving = !tdone(len, t);
      const l = tval(len, t);
      if (l !== drawn.len) {
         drawn.len = l;
         const pts = upTo(scr, l);
         drawnIn.setAttribute("d", act >= 0 && act < 12 ? open(pts) : "");
         place(cur, pts.at(-1)!);
      }
      cols.forEach((c, b) => {
         const z = 2 + tval(h[b], t) * COLS[b][1] * CH;
         moving ||= !tdone(h[b], t);
         if (z === drawn.h[b]) return;
         drawn.h[b] = z;
         put(c.el, prism(P, front, c.r[0], c.r[1], 0, z));
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

   /** Picks contest a (0-11), column a - 12 (12-14), or nothing (-1). */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const contest = a >= 0 && a < 12;
      act = a;
      tset(len, contest ? a / 11 : 1, t, 0);
      drawn.len = Number.NaN;
      COLS.forEach((_, b) => {
         let to = 1 - sink;
         if (contest) to = 0.3 + (0.7 * a) / 11;
         else if (a < 0 || a - 12 === b) to = 1;
         tset(
            h[b],
            to,
            t,
            contest ? 120 + b * 60 : Math.abs(b - (a - 12)) * 45,
         );
         cols[b].el.sil.classList.toggle("hi", a - 12 === b);
      });
      peak.setAttribute("class", a < 0 ? "dot" : "dot m");
      cur.setAttribute("class", contest ? "dot" : "dot m");
      read.textContent = label(a, contest);
      B.wake();
   }
   setActive(-1);

   follow(bag, stage, svg, hit, setActive);
   return {
      set: (v) => {
         sink = 0.35 + v * 0.4;
      },
      destroy: bag.dispose,
   };
};
