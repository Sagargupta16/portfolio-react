/**
 * Brainstorm Verse (11): the idea feed. On the left the PostIdea form, a
 * plate with the drafted idea card lying on it, the bright mark. On the
 * right the Home feed, a long plate holding four idea cards newest first,
 * each with its community reactions as dots on its face. The pointer on the
 * form posts the idea: the server action sends the card across in an arc to
 * the top of the feed while revalidation shifts every older card down a
 * place, staggered from the top, and the oldest slides out of view. The
 * pointer on a feed card lifts it to react, its neighbours a little, and a
 * reaction dot pops on it: yours. Intensity is the arc's height.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, flatDot, follow, inset, lerp,
   mk, nearest, now, place, proj, put, register, rrect, slab, solid, tdone,
   tset, tval, tween,
} from "@/figures/hairline";
// prettier-ignore
import type { FigureMount, Frame, Ring, Solid, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CT, PITCH, HW, HD, LIFT, ARC, CAP, STICK] = [
   3, 1.6, 26, 11, 7, 8, 12, 26, 8,
];
const FY = 7;
const N = 4;
/** Reactions so far, per feed card (newest first). */
const REACT = [1, 3, 2, 3];
const FALL = [1, 0.3, 0.1];
const DRAFT: Vec3 = [-26, 32, 3];
const slot = (k: number): Vec3 => [11 + k * PITCH, FY, 2];
const FORM = rrect(-44, 18, -8, 46, 6, 8);
const FEED = rrect(-4, -6, 11 + (N - 1) * PITCH + 15, 20, 7, 8);
/** An idea card about a centre, scaled by s; d is its half depth, as long as its text. */
const card = ([x, y]: Vec3 | Vec2, s: number, d: number) =>
   rrect(x - HW * s, y - d * s, x + HW * s, y + d * s, 3 * s + 0.1, 6);
const DEPTH = [5.4, 7, 6, 4.8];
/** The read-out for part a: rest, the post, or the feed card it lifts. */
function label(a: number) {
   if (a < 0) return "rest";
   return a === 0 ? "post" : `idea ${a}`;
}
const EXTENT = FORM.concat(FEED)
   .map((q): Vec3 => [q.u, q.v, -PT])
   .concat([
      [DRAFT[0], DRAFT[1] - HD, 14 + ARC],
      [11, FY - HD, 2 + LIFT + CT],
   ]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [P(DRAFT[0], DRAFT[1], DRAFT[2] + CT)].concat(
      Array.from({ length: N }, (_, k) => P(slot(k)[0], FY, 2 + CT)),
   );
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The form (post), the second idea, the fourth, then away. */
export const tour: Tour = ((s) => [s[0], s[2], s[4], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let [arc, act] = [ARC * (0.5 + value * 0.5), -1];
   const g = mk("g", {}, svg);
   /** A slab with its lip, or none once the outline is too small to hold one. */
   const stand = (s: Solid, r: Ring, z0: number, h: number) => {
      const lip = inset(C, r, 0.8, 0.5);
      put(s, slab(P, front, r, lip.length > 2 ? lip : null, z0, z0 + h));
   };
   stand(solid(g), FORM, -PT, PT + 3);
   stand(solid(g), FEED, -PT, PT + 2);
   // The feed cards (oldest last), then the draft, which flies above them all.
   const cards = DEPTH.map((hd) => ({
      hd,
      el: solid(g),
      dots: [0, 1, 2].map(() => flatDot(g, C, 1.2, "dot off")),
   }));
   const draft = {
      hd: 6,
      el: solid(g),
      dots: [0, 1, 2].map(() => flatDot(g, C, 1.2, "dot off")),
   };
   const shift = cards.map(() => tween(0));
   const lift = cards.map(() => tween(0));
   const fly = tween(0, 900);
   const drawn = cards.map(() => ({ s: Number.NaN, z: Number.NaN }));
   let [lastF, lit, litAt] = [Number.NaN, "", Infinity];

   /** A card at a world centre, scaled by s, its reaction dots on its face. */
   function draw(c: typeof draft, at: Vec3, s: number) {
      // Too small to hold a lip: gone from view.
      if (s < 0.15) s = 0;
      if (s) stand(c.el, card(at, s, c.hd), at[2], CT * s);
      else put(c.el, { sil: "", crease: "" });
      c.dots.forEach((d, j) => {
         place(
            d,
            P(at[0] + (2 + j * 3.4) * s, at[1] + 2.5 * s, at[2] + CT * s),
         );
         d.setAttribute("rx", String(1.2 * C.S * s));
         d.setAttribute("ry", String(1.2 * C.S * C.k * s));
      });
   }

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(fly, t);
      cards.forEach((c, k) => {
         const [s, z] = [tval(shift[k], t), tval(lift[k], t)];
         moving ||= !tdone(shift[k], t) || !tdone(lift[k], t);
         if (s === drawn[k].s && z === drawn[k].z) return;
         [drawn[k].s, drawn[k].z] = [s, z];
         const [x, y] = slot(k + s);
         // The oldest card slides off the end of the feed as it shrinks away.
         const size = k === N - 1 ? 1 - clamp(s, 0, 1) : 1;
         draw(c, [x, y, 2 + z * LIFT], size);
      });
      const fi = tval(fly, t);
      if (fi !== lastF) {
         lastF = fi;
         const [x0, y0] = [
            lerp(DRAFT[0], slot(0)[0], fi),
            lerp(DRAFT[1], FY, fi),
         ];
         const z0 = lerp(DRAFT[2], 2, fi) + Math.sin(Math.PI * fi) * arc;
         draw(draft, [x0, y0, z0], 1);
      }
      // Reactions: each card shows its count less one; lifting it adds yours.
      const pop = t >= litAt;
      if (`${act},${pop}` !== lit) {
         lit = `${act},${pop}`;
         cards.forEach((c, k) => {
            const n = REACT[k] - (k === act - 1 && pop ? 0 : 1);
            c.dots.forEach((d, j) =>
               d.setAttribute("class", j < n ? "dot m" : "dot off"),
            );
         });
      }
      return moving || (Number.isFinite(litAt) && t < litAt + 50);
   });
   bag.add(B.unregister);

   const pick = nearest(spot, CAP, STICK);

   /** 0 posts the draft; k in 1..N lifts feed card k - 1; -1 is rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const post = a === 0;
      tset(fly, post ? 1 : 0, t, 0);
      cards.forEach((_, k) => {
         tset(
            shift[k],
            post ? 1 : 0,
            t,
            (post ? k : N - 1 - k) * 45 + (post ? 280 : 0),
         );
         const near = a > 0 ? Math.abs(k - (a - 1)) : 9;
         tset(lift[k], FALL[near] ?? 0, t, near * 45);
      });
      litAt = a > 0 ? t + 160 : Infinity;
      draft.el.sil.classList.toggle("hi", a <= 0);
      cards.forEach((c, k) => c.el.sil.classList.toggle("hi", a === k + 1));
      act = a;
      read.textContent = label(a);
      B.wake();
   }

   read.textContent = "rest";
   draft.el.sil.classList.add("hi");
   follow(bag, stage, svg, (q) => pick(q, act), setActive);
   return {
      set: (v) => {
         arc = ARC * (0.5 + v * 0.5);
         lastF = Number.NaN;
         B.wake();
      },
      destroy: bag.dispose,
   };
};
