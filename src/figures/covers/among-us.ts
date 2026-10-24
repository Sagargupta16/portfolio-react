/**
 * LeetCode Among Us (4): the leaderboard as a table standing on a plate.
 * Five rows, one per handle (numbered by dots), each carrying one bar: the
 * metric of the open tab (Overview's solved, Problems, Contests' rating,
 * Consistency), from the batched GraphQL fetch. The four tabs lie at the
 * head, and three medal pegs stand fixed by places one to three. The
 * pointer's column picks a tab (read in world x on the rows' rest plane,
 * which no row ever leaves): every bar takes the new metric and the rows
 * re-sort by it, each lifting over the others as it climbs, staggered by the
 * place it lands in, while the medals stay where they are. At rest the
 * table is sorted by Overview and its tab is bright. Intensity is the delay
 * per place.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, mk, now, place, pointer,
   prism, proj, put, register, rings, rrect, slab, solid, tdone, tset, tval,
   tween, unproj,
   type FigureMount, type Frame, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [N, PITCH, RD, COL, BW, RT, PT, BUMP] = [5, 13, 9, 19, 12, 2, 3, 6];
/** Each handle's four metrics, 0 to 1, in tab order. */
const STAT = [
   [0.9, 0.5, 0.6, 0.3],
   [0.7, 0.9, 0.4, 0.8],
   [0.5, 0.3, 0.95, 0.5],
   [0.4, 0.7, 0.2, 0.95],
   [0.3, 0.2, 0.75, 0.6],
];
const TABS = ["overview", "problems", "contests", "streak"];
const [X0, LEN, HEAD] = [2, 4 * COL + 4, -15];
const PLATE = rrect(-20, -24, LEN + 8, N * PITCH + 4, 9, 8);
const MEDAL = [7, 5, 3.4];
const bx = (k: number) => X0 + 3 + k * COL;
const [BX, BH] = [X0 + 16, 3];
/** Each handle's place under tab k: 0 is first. */
const places = (k: number) => {
   const order = STAT.map((_, r) => r).sort((a, b) => STAT[b][k] - STAT[a][k]);
   return STAT.map((_, r) => order.indexOf(r));
};

/** The most extreme pose (rule 03): the plate and a row at its full lift with a tall block. */
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [LEN, 0, RT + BUMP + BH],
   [0, 0, RT + BUMP + BH],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const col = TABS.map((_, k) => P(bx(k) + BW / 2, 2 * PITCH, RT + 6));
   return { C, P, front: facing(C), col };
}

export const frame = FRAMES.cover;
/** Contests, Consistency, Problems, then away. */
export const tour: Tour = ((s) => [s[2], s[3], s[1], null])(camera(frame).col);

const per = (v: number) => 40 + v * 40;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = per(value);
   let act = -2;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));

   // The tabs at the head, the medal pegs by places one to three, then the rows.
   const tabs = TABS.map((_, k) => {
      const [ring, inner] = rings(bx(k), HEAD, bx(k) + BW, HEAD + 7, 2, 0.8);
      const el = solid(g);
      put(el, prism(P, front, ring, inner, 0, 1.6));
      return el;
   });
   MEDAL.forEach((h, s) => {
      const y = s * PITCH + RD / 2;
      const [ring, inner] = rings(-13, y - 4, -5, y + 4, 4, 1);
      put(solid(g), prism(P, front, ring, inner, 0, h));
   });
   const rows = STAT.map((_, r) => ({
      el: solid(g),
      bar: solid(g),
      dots: Array.from({ length: r + 1 }, () => flatDot(g, C, 0.95, "dot m")),
      y: tween(0),
      len: tween(0),
      drawn: "",
   }));
   const order: number[] = [];

   const B = register(stage, (_dt, t) => {
      let moving = false;
      const keys = rows.map((row) => {
         const [y, len] = [tval(row.y, t), tval(row.len, t)];
         const span = row.y.to - row.y.from;
         const p = span ? (y - row.y.from) / span : 1;
         // A row climbing the table lifts over the rows it passes; one falling slides under.
         const z = span < 0 ? BUMP * Math.sin(Math.PI * p) : 0;
         moving ||= !tdone(row.y, t) || !tdone(row.len, t);
         if (`${y} ${z} ${len}` !== row.drawn) {
            row.drawn = `${y} ${z} ${len}`;
            const [ring, inner] = rings(X0, y, X0 + LEN, y + RD, 2.6, 1);
            put(row.el, prism(P, front, ring, inner, z, z + RT));
            const [br, bi] = rings(BX, y + 2, BX + len, y + RD - 2, 1.6, 0.7);
            put(row.bar, prism(P, front, br, bi, z + RT, z + RT + BH));
            row.dots.forEach((d, j) =>
               place(d, P(X0 + 3 + j * 2.4, y + RD / 2, z + RT)),
            );
         }
         return y + 2 * z;
      });
      const next = rows.map((_, r) => r).sort((a, b) => keys[a] - keys[b]);
      if (next.join() !== order.join()) {
         order.splice(0, N, ...next);
         for (const r of next)
            g.append(rows[r].el.g, rows[r].bar.g, ...rows[r].dots);
      }
      return moving;
   });
   bag.add(B.unregister);

   /** The tab whose column holds p, read on the rows' rest plane; -1 off the table. */
   const hit = ([sx, sy]: Vec2) => {
      const [x, y] = unproj(C, sx, sy, RT + 5);
      const k = Math.floor((x - X0) / COL);
      return y > HEAD - 4 && y < N * PITCH + 2 && k >= 0 && k < TABS.length
         ? k
         : -1;
   };

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const k = Math.max(0, a);
      places(k).forEach((s, r) => {
         const delay = act < -1 ? -1e9 : s * step;
         tset(rows[r].y, s * PITCH, t, delay);
         tset(rows[r].len, 6 + STAT[r][k] * (LEN - BX - 4), t, delay);
      });
      tabs.forEach((el, j) => el.sil.classList.toggle("hi", j === k));
      act = a;
      read.textContent = a < 0 ? "rest" : TABS[a];
      B.wake();
   }

   setActive(-1);
   bag.add(
      pointer(stage, {
         move: (p) => setActive(hit(p)),
         leave: () => setActive(-1),
      }),
   );
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = per(v)), destroy: bag.dispose };
};
