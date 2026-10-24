/**
 * readme-kit (56): one profile.yml, one matched set of cards. The yml lies
 * at the left, its keys scored on the lid and theme.accent's swatch at the
 * end of the last one; dashed lines fan from it across the floor to the
 * README, where the cards it renders sit top to bottom: hero, section
 * header, terminal, two project cards, a row of buttons, each with one
 * accent mark. The pointer picks a part (tested at rest): the yml fans out,
 * every card rises and takes the accent, staggered hop by hop down the
 * README; a card rises with its neighbours, staggered by distance. At rest
 * the swatch is the one bright mark. Intensity is the rise.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, mk, now, place,
   pointer, proj, put, register, rrect, seg, slab, solid, tdone, tset, tval,
   tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [BT, RT, CT, CAP, STICK] = [3, 2, 2, 30, 8];
const BOARD = rrect(-12, -12, 98, 84, 9, 8);
const README = rrect(-4, -4, 88, 34, 4, 8);
const YML = rrect(28, 50, 56, 76, 3.5, 8);
/** The set, top of the README down: each card's pieces as [x0, y0, x1, y1]. */
const CARDS: [number, number, number, number][][] = [
   [[0, 0, 20, 30]],
   [[24, 0, 29, 30]],
   [[33, 0, 51, 30]],
   [
      [55, 0, 70, 14],
      [55, 16, 70, 30],
   ],
   [
      [74, 0, 80, 9],
      [74, 10.5, 80, 19.5],
      [74, 21, 80, 30],
   ],
];
const NAMES = ["hero", "header", "terminal", "projects", "buttons"];
const mid = (k: number) => (CARDS[k][0][0] + CARDS[k].at(-1)![2]) / 2;
const KEYS = [33, 37, 41, 45, 49];
const RISE = 16;
const EXTENT: Vec3[] = BOARD.map((q): Vec3 => [q.u, q.v, -BT]).concat(
   CARDS.map((_, k): Vec3 => [mid(k), 0, RT + RISE + CT]),
);

/** The camera fitted to a frame; the hit spots: the yml (0), then each card's middle (1-5). */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [P(42, 63, 3), ...CARDS.map((_, k) => P(mid(k), 15, RT + CT))];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The yml fanning out, the terminal card, the buttons, away. */
export const tour: Tour = ((s) => [s[0], s[3], s[5], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let rise = RISE * (0.5 + value * 0.5);
   let act = -2; // nothing painted yet: the first setActive(-1) paints rest
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.4), -BT, 0));
   // The fan: one dashed line from the yml to each card, on the floor, before both plates.
   const fan = CARDS.map((_, k) =>
      mk(
         "path",
         { d: seg(P(42, 50, 0), P(mid(k), 34, 0)), class: "nf dash" },
         g,
      ),
   );
   put(solid(g), slab(P, front, YML, inset(C, YML, 1.1), 0, 3));
   const keys = KEYS.map((x, i) => seg(P(x, 54, 3), P(x, 68 - (i % 3) * 3, 3)));
   mk("path", { d: keys.join(""), class: "nf lo" }, g);
   const swatch = flatDot(g, C, 1.8, "dot");
   place(swatch, P(KEYS[4], 72, 3));
   put(solid(g), slab(P, front, README, inset(C, README, 1.2), 0, RT));
   // The cards, top down; each piece a thin slab, each card one accent mark on its first piece.
   const cards = CARDS.map((pieces) => {
      const els = pieces.map(([x0, y0, x1, y1]) => {
         const ring: Ring = rrect(x0, y0, x1, y1, 1.6, 6);
         return { ring, el: solid(g) };
      });
      const acc = flatDot(els[0].el.g, C, 1.3, "dot off");
      return { pieces, els, acc, z: tween(0), a: tween(0), lit: false, d: NaN };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      cards.forEach((c) => {
         const z = RT + tval(c.z, t) * rise;
         moving ||= !tdone(c.z, t) || !tdone(c.a, t);
         if (z !== c.d) {
            c.d = z;
            c.els.forEach((e) =>
               put(e.el, slab(P, front, e.ring, null, z, z + CT)),
            );
            const [x0, , x1, y1] = c.pieces[0];
            place(c.acc, P((x0 + x1) / 2, y1 - 4, z + CT));
         }
         const on = tval(c.a, t) > 0.5;
         if (on === c.lit) return;
         c.lit = on;
         c.acc.setAttribute("class", on ? "dot" : "dot off");
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

   /** Picks the yml (0), card a - 1 (1-5), or nothing (-1). */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      const k = a - 1;
      cards.forEach((c, i) => {
         const lift =
            a === 0
               ? 0.7 - i * 0.06
               : k >= 0
                 ? 1 / (1 + 0.8 * (i - k) ** 2)
                 : 0;
         const delay =
            a === 0 ? 80 + i * 70 : k >= 0 ? Math.abs(i - k) * 45 : 0;
         tset(c.z, lift, t, delay);
         tset(c.a, a === 0 ? 1 : 0, t, a === 0 ? delay + 200 : 0);
         c.els.forEach((e) => e.el.sil.classList.toggle("hi", i === k));
      });
      fan.forEach((e) =>
         e.setAttribute("class", a === 0 ? "nf sil dash" : "nf dash"),
      );
      swatch.setAttribute("class", a <= 0 ? "dot" : "dot m");
      read.textContent = a < 0 ? "rest" : a === 0 ? "profile.yml" : NAMES[k];
      B.wake();
   }
   setActive(-1);

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => void (rise = RISE * (0.5 + v * 0.5)),
      destroy: bag.dispose,
   };
};
