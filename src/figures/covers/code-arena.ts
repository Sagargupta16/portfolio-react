/**
 * Code Arena (39): a race of four players on a track bed. The Judge0 runner
 * is the starting gate across every lane; each lane holds its player's four
 * test cases as dots, the player's token at how far they have got, a dashed
 * finish line, and at the far end a rank pad that counts the player's place
 * in dots, read live from where the tokens stand. The pointer picks a lane
 * (tested on the tokens' rest tops, then the lane strips): that player's
 * submission comes back from the runner, the test dots pass one by one in
 * green, then the token runs to the finish and the pads reorder as it
 * overtakes. At rest the leader's token is bright. Intensity is the delay
 * per test case.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, mk, now,
   place, poly, prism, proj, put, register, rings, ringAt, rrect, seg, slab,
   solid, tdone, tset, tval, tween, unproj,
} from "@/figures/hairline";
import type {
   Camera,
   FigureMount,
   Frame,
   Tour,
   Vec2,
   Vec3,
} from "@/figures/hairline";

const [N, PITCH, LW, LEN, TL, TH] = [4, 14, 10, 100, 12, 6];
const [FINISH, GOAL, PT] = [96, 82, 3];
/** Each lane's token at rest (its x) and the tests it has passed. */
const REST = [52, 34, 64, 24];
const PASSED = [2, 1, 3, 1];
const TESTS = [3, 7.5, 12, 16.5];
const PLATE = rrect(-34, -8, 122, 60, 8, 8);
const GATE = rings(-28, 0, -8, 52, 4, 1.4);
const CHIPS = [rrect(-24, 10, -12, 22, 2), rrect(-24, 30, -12, 42, 2)];
const y0 = (l: number) => l * PITCH;
const LEAD = REST.indexOf(Math.max(...REST));

/** The most extreme pose (rule 03): the bed, the gate's top, every token at the finish. */
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   [0, 1, 2, 3].map((l): Vec3 => [GOAL + TL, y0(l) + LW, TH]),
   [[-28, 0, 9]],
);

function camera(frame: Frame) {
   const C: Camera = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = REST.map((x, l) => P(x + TL / 2, y0(l) + LW / 2, TH));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The back marker, then the runner-up, then the leader, then away. */
export const tour: Tour = ((s) => [s[3], s[1], s[2], null])(camera(frame).spot);

const per = (v: number) => 30 + v * 30;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = per(value);
   let act = -1;
   const g = mk("g", {}, svg);

   // The bed, then the runner gate with its two language chips, then the finish line.
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   put(solid(g), prism(P, front, GATE[0], GATE[1], 0, 9));
   for (const r of CHIPS)
      mk("path", { d: poly(ringAt(P, r, 9)), class: "nf" }, g);
   mk(
      "path",
      { d: seg(P(FINISH, -3, 0), P(FINISH, 55, 0)), class: "nf dash" },
      g,
   );

   // Lanes back to front: strip, test dots, token, rank pad.
   const lanes = REST.map((x, l) => {
      const strip = rrect(0, y0(l), LEN, y0(l) + LW, 3);
      mk("path", { d: poly(ringAt(P, strip, 0)), class: "nf lo" }, g);
      const dots = TESTS.map((tx) => {
         const d = flatDot(g, C, 1.3, "dot off");
         place(d, P(tx, y0(l) + LW / 2, 0));
         return d;
      });
      const el = solid(g);
      const pad = rrect(102, y0(l) + 1, 118, y0(l) + LW - 1, 2);
      mk("path", { d: poly(ringAt(P, pad, 0)), class: "nf lo" }, g);
      const ranks = [0, 1, 2, 3].map((k) => {
         const d = flatDot(g, C, 1, "dot off");
         place(d, P(105 + k * 3.4, y0(l) + LW / 2, 0));
         return d;
      });
      const pass = TESTS.map(() => tween(0));
      return { el, dots, ranks, x: tween(x), pass, drawn: Number.NaN, rank: 0 };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      const xs = lanes.map((L) => tval(L.x, t));
      lanes.forEach((L, l) => {
         const x = xs[l];
         if (x !== L.drawn) {
            L.drawn = x;
            const [ring, inner] = rings(
               x,
               y0(l) + 1,
               x + TL,
               y0(l) + LW - 1,
               2.4,
               1,
            );
            put(L.el, prism(P, front, ring, inner, 0, TH));
         }
         L.pass.forEach((p, k) => {
            const on = tval(p, t) > 0.5;
            const was = k < PASSED[l] ? "dot m" : "dot off";
            const cls = on ? "dot ok" : was;
            if (L.dots[k].getAttribute("class") !== cls)
               L.dots[k].setAttribute("class", cls);
            moving ||= !tdone(p, t);
         });
         // The live board: a player's place is one more than the tokens ahead of theirs.
         const rank =
            1 + xs.filter((o, m) => o > x || (o === x && m < l)).length;
         if (rank !== L.rank) {
            L.rank = rank;
            L.ranks.forEach((d, k) =>
               d.setAttribute("class", k < rank ? "dot m" : "dot off"),
            );
         }
         L.el.sil.classList.toggle("hi", l === (act < 0 ? LEAD : act));
         moving ||= !tdone(L.x, t);
      });
      return moving;
   });
   bag.add(B.unregister);

   /** The lane under p: a token's rest top first, front lane first, then the lane strips on the bed. */
   const hit = ([sx, sy]: Vec2) => {
      for (let l = N - 1; l >= 0; l--) {
         const [x, y] = unproj(C, sx, sy, TH);
         if (
            x > REST[l] - 1 &&
            x < REST[l] + TL + 1 &&
            y > y0(l) &&
            y < y0(l) + LW
         )
            return l;
      }
      const [x, y] = unproj(C, sx, sy, 0);
      const l = Math.floor((y + 2) / PITCH);
      return x > -8 && x < 120 && l >= 0 && l < N ? l : -1;
   };

   /** Runs lane a's submission (-1: everyone back to where they were). */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      lanes.forEach((L, l) => {
         const on = l === a;
         L.pass.forEach((p, k) =>
            tset(p, on ? 1 : 0, t, on ? (k + 1) * step : 0),
         );
         tset(L.x, on ? GOAL : REST[l], t, on ? (TESTS.length + 1) * step : 0);
      });
      act = a;
      read.textContent = a < 0 ? "rest" : `p${a + 1} AC`;
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, hit, setActive);
   return {
      set: (v) => {
         step = per(v);
      },
      destroy: bag.dispose,
   };
};
