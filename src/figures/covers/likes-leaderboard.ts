/**
 * Instagram Likes Leaderboard (20): the scanner walks your profile's post
 * grid one post at a time and tallies each post's likers into a ranked board,
 * with two tabs (everyone, and accounts you do not follow) over five rows,
 * each an avatar, an identified-likes bar and the account's dot code. The
 * pointer picks a post (tested at rest): the scan runs to it, each scanned
 * post takes a dot, the bars grow to the new tallies and any account that
 * passes the one above arcs over it into its new rank, staggered by rank.
 * The second tab folds the accounts you follow to the foot of the board. At
 * rest five posts are scanned and the leader's bar is bright. Intensity is
 * how high an overtaking row arcs.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   nearest, now, place, proj, put, register, rrect, slab, solid, tdone, tset,
   tval, tween, type FigureMount, type Frame, type Ring, type Solid, type Tour,
   type Vec2, type Vec3,
} from "@/figures/hairline";

const [PT, TH, U, CAP, STICK, REST_K] = [3, 1.4, 3.6, 22, 6, 3];
/** Each post's likers, as bits over the five accounts. */
const LIKES = [
   0b00011, 0b01101, 0b10111, 0b01100, 0b10100, 0b00101, 0b01110, 0b10100,
   0b11101,
];
/** The accounts you follow: they fold away on the second tab. */
const FOLLOWED = [false, true, false, true, false];
const POSTS = LIKES.map((_, i): Vec2 => [
   4 + (i % 3) * 14.5,
   17 + Math.floor(i / 3) * 14.5,
]);
const PAGE = rrect(-6, -4, 126, 70, 7, 8);
const slotY = (s: number) => 15 + s * 10;
const arc = (v: number) => 3 + 5 * v;
const EXTENT = PAGE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [64, 14, arc(1) + 5],
]);
const at = (r: Ring, x: number, y: number): Ring =>
   r.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

/** Tallies after posts 0..k, and each account's rank on tab t. */
function board(k: number, t: number) {
   const n = [0, 1, 2, 3, 4].map(
      (a) =>
         LIKES.slice(0, k + 1).filter((m) => m & (1 << a)).length *
         +!(t && FOLLOWED[a]),
   );
   const order = [0, 1, 2, 3, 4].sort((a, b) => n[b] - n[a] || a - b);
   return { n, rank: [0, 1, 2, 3, 4].map((a) => order.indexOf(a)) };
}

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = POSTS.map(([x, y]) => P(x + 6, y + 6, TH));
   spot.push(P(75, 6.5, 2), P(99, 6.5, 2));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The fifth post (the lead changes hands), the last post, the second tab, then away. */
export const tour: Tour = ((s) => [s[4], s[8], s[10], null])(
   camera(frame).spot,
);

/** The read-out for pick a: a post, a tab, or rest. */
function label(a: number) {
   if (a < 0) return "rest";
   return a > 8 ? ["all", "not fol"][a - 9] : `post ${a + 1}`;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let high = arc(value);
   let act = -2;
   const g = mk("g", {}, svg);
   const block = (el: Solid, r: Ring, z0: number, z1: number, b = 0) =>
      put(el, slab(P, front, r, b ? inset(C, r, b) : null, z0, z1));

   // The profile: its avatar and the post grid, each post with a scan dot.
   block(solid(g), PAGE, -PT, 0, 1.6);
   block(solid(g), rrect(0, 0, 48, 62, 4, 8), 0, 1, 1.2);
   block(solid(g), at(circ(4.5, 32), 9, 8), 1, 3.4, 0.8);
   const posts = POSTS.map(([x, y]) => {
      const el = solid(g);
      block(el, rrect(x, y, x + 12, y + 12, 2, 4), 1, 1 + TH, 0.9);
      const dot = flatDot(g, C, 1, "dot off");
      place(dot, P(x + 9, y + 3, 1 + TH));
      return { el, dot };
   });

   // The board: two tabs, then five rows that move between rank slots.
   block(solid(g), rrect(60, 0, 120, 64, 4, 8), 0, 1, 1.2);
   const tabs = [0, 1].map(() => solid(g));
   const rg = mk("g", {}, g);
   const rows = [0, 1, 2, 3, 4].map((a) => {
      const row = mk("g", {}, rg);
      const [plate, face, bar] = [solid(row), solid(row), solid(row)];
      const dots = [0, 1, 2, 3, 4]
         .slice(0, a + 1)
         .map(() => flatDot(row, C, 0.75, "dot m"));
      return {
         a,
         row,
         plate,
         face,
         bar,
         dots,
         y: tween(0),
         n: tween(0),
         key: 0,
         drawn: "",
      };
   });
   const ring = rrect(0, 0, 52, 7.4, 2.2, 4);

   const B = register(stage, (_dt, t) => {
      let moving = false;
      for (const r of rows) {
         const [y, n] = [tval(r.y, t), tval(r.n, t)];
         moving ||= !tdone(r.y, t) || !tdone(r.n, t);
         const span = r.y.to - r.y.from;
         const z =
            span < 0 ? high * Math.sin((Math.PI * (y - r.y.from)) / span) : 0;
         if (`${y} ${n}` === r.drawn) continue;
         r.drawn = `${y} ${n}`;
         r.key = y + z;
         block(r.plate, at(ring, 63, y), z + 1, z + 2.4);
         block(r.face, at(circ(2.4, 24), 67.5, y + 3.7), z + 2.4, z + 4);
         block(
            r.bar,
            rrect(72, y + 2.4, 72.6 + n * U, y + 5, 1.2, 3),
            z + 2.4,
            z + 3.4,
         );
         r.dots.forEach((d, j) => place(d, P(112 - j * 2.4, y + 3.7, z + 2.4)));
      }
      const order = rows.slice().sort((a, b) => a.key - b.key);
      if (order.some((r, i) => rg.children[i] !== r.row))
         rg.append(...order.map((r) => r.row));
      return moving;
   });
   bag.add(B.unregister);

   /** Posts 0..8 are the scan; 9 and 10 are the tabs; -1 is rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const [k, tab] = a < 0 || a > 8 ? [REST_K, a === 10 ? 1 : 0] : [a, 0];
      const b = board(k, tab);
      for (const r of rows) {
         const s = b.rank[r.a];
         tset(r.y, slotY(s), t, s * 50);
         tset(r.n, b.n[r.a], t, s * 50);
         r.bar.sil.classList.toggle("hi", a < 0 && s === 0);
      }
      posts.forEach((p, i) => {
         p.dot.setAttribute("class", i <= k ? "dot m" : "dot off");
         p.el.sil.classList.toggle("hi", i === a);
      });
      tabs.forEach((el, i) => {
         const x = [64, 88][i];
         block(el, rrect(x, 3, x + 22, 10, 3, 4), 1, i === tab ? 3.4 : 2);
         el.sil.classList.toggle("hi", a === 9 + i);
      });
      act = a;
      read.textContent = label(a);
      B.wake();
   }
   setActive(-1);
   for (const r of rows) [r.y, r.n].forEach((tw) => (tw.t0 = -1e9));

   // Sticky on the last hit, which a leave does not clear.
   let held = -1;
   const pick = nearest(spot, CAP, STICK);
   const hit = (p: Vec2) => {
      held = pick(p, held);
      return held;
   };
   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      high = arc(v);
   };
   return { set, destroy: bag.dispose };
};
