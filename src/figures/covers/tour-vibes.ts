/**
 * Tour Vibes (5): the New Journal form on the left, its photo already in the
 * drop zone above the title and location lines and the submit pill, and the
 * Journals feed on the right, newest first, five post cards (a photo window
 * and their likes in dots) and one empty skeleton slot. The pointer picks a
 * part, tested on the rest tops: on the form, the photo goes up through
 * Multer and lands as the first card while every card moves down one slot,
 * staggered by how far it sits from the top; on a card, that post lifts and
 * takes one more like. The waiting photo is the bright mark; the post the
 * pointer touched takes it. Intensity is the delay per slot.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, lerp, mk,
   now, place, poly, proj, put, register, ringAt, rrect, seg, slab, solid,
   tdone, tset, tval, tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, FORM_Z, CARD_Z, CW, CD, LIFT] = [4, 3, 1.6, 18, 20, 5];
/** Slot k of the feed: rows down the board, two posts to a row. */
const slot = (k: number): Vec2 => [
   42 + Math.floor(k / 2) * 21,
   2 + (k % 2) * 23,
];
const DROP: Vec2 = [7, 24];
const LIKES = [2, 0, 3, 1, 1, 0];
const BOARD = rrect(-6, -6, 108, 72, 7, 8);
const FORM = rrect(0, 20, 32, 68, 4, 8);
const PILL = rrect(17, 58, 29, 64, 3, 6);
/** The picks besides a post (0 to 4): rest, and the form, which posts the new photo. */
const [IDLE, UP] = [-1, -2];
/** Where a card stands at slot p, -1 being the drop zone, and how high its hop is. */
function at(p: number): [number, number, number] {
   const i = Math.floor(p);
   const [a, b] = [i < 0 ? DROP : slot(i), slot(i + 1)];
   const f = p - i;
   const hop = Math.sin(Math.PI * f) * (i < 0 ? 12 : 4);
   return [
      lerp(a[0], b[0], f),
      lerp(a[1], b[1], f),
      (i < 0 ? FORM_Z : 0) * (1 - f) + hop,
   ];
}

const EXTENT = BOARD.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   [0, 1, 2, 3, 4, 5].map((k): Vec3 => [...slot(k), CARD_Z + LIFT]),
   [[16, 34, 14]],
);
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const top = (k: number) =>
      P(slot(k)[0] + CW / 2, slot(k)[1] + CD / 2, CARD_Z);
   return { C, P, top };
}

/** The slot card i heads for when a is picked: on upload every post moves down one. */
function dest(a: number, i: number) {
   if (i === 5) return a === UP ? 0 : -1;
   return a === UP ? i + 1 : i;
}

/** Like dot k on a post with n likes: lit, the one just added, or off. */
function likeDot(k: number, n: number, liked: boolean) {
   if (k < n) return "dot m";
   return liked && k === n ? "dot" : "dot off";
}

function label(a: number) {
   if (a === IDLE) return "rest";
   return a === UP ? "upload" : `like ${LIKES[a] + 1}`;
}

export const frame = FRAMES.cover;
/** A post in the feed, then the form, then a post lower down, then away. */
export const tour: Tour = (({ P, top }) => [
   top(1),
   P(16, 48, FORM_Z),
   top(4),
   null,
])(camera(frame));

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P } = camera(f);
   const front = facing(C);
   const bag = disposer();
   let step = 40 + 80 * value;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.6), -PT, 0));
   // The empty slot's skeleton, then the form: drop zone, two fields, the submit pill.
   const sk = slot(5);
   mk(
      "path",
      {
         d: poly(
            ringAt(P, rrect(sk[0], sk[1], sk[0] + CW, sk[1] + CD, 3, 6), 0),
         ),
         class: "nf dash",
      },
      g,
   );
   put(solid(g), slab(P, front, FORM, inset(C, FORM, 1.2), 0, FORM_Z));
   const zone = rrect(DROP[0], DROP[1], DROP[0] + CW, DROP[1] + CD, 3, 6);
   mk("path", { d: poly(ringAt(P, zone, FORM_Z)), class: "nf dash" }, g);
   const fields = [49, 53.5]
      .map((y) => seg(P(5, y, FORM_Z), P(27, y, FORM_Z)))
      .join("");
   mk("path", { d: fields, class: "nf lo" }, g);
   put(solid(g), slab(P, front, PILL, null, FORM_Z, FORM_Z + 1.4));

   // Posts 0 to 4 in the feed, and post 5, the new one, waiting in the drop zone.
   const layer = mk("g", {}, g);
   const cards = LIKES.map((n, i) => {
      const el = solid(layer);
      const photo = mk("path", { class: "nf" }, el.g);
      const likes = [0, 1, 2, 3].map((k) =>
         flatDot(el.g, C, 0.9, k < n ? "dot m" : "dot off"),
      );
      return {
         n,
         el,
         photo,
         likes,
         p: tween(i < 5 ? i : -1),
         l: tween(0),
         d: "",
      };
   });
   let order = "";
   const B = register(stage, (_dt, t) => {
      let moving = false;
      const keys: [number, number][] = [];
      cards.forEach((c, i) => {
         const [x, y, z0] = at(tval(c.p, t));
         const z = z0 + tval(c.l, t) * LIFT;
         moving ||= !tdone(c.p, t) || !tdone(c.l, t);
         keys.push([x + y + 3 * z, i]);
         const d = `${x} ${y} ${z}`;
         if (d === c.d) return;
         c.d = d;
         const ring = rrect(x, y, x + CW, y + CD, 3, 6);
         put(c.el, slab(P, front, ring, null, z, z + CARD_Z));
         const win = rrect(x + 2.5, y + 2.5, x + CW - 6, y + CD - 2.5, 1.6, 4);
         c.photo.setAttribute("d", poly(ringAt(P, win, z + CARD_Z)));
         c.likes.forEach((e, k) =>
            place(e, P(x + CW - 3, y + 4 + k * 4, z + CARD_Z)),
         );
      });
      keys.sort((a, b) => a[0] - b[0]);
      const o = keys.map((k) => k[1]).join();
      if (o !== order) {
         order = o;
         if (o) for (const [, i] of keys) layer.appendChild(cards[i].el.g);
      }
      return moving;
   });
   bag.add(B.unregister);

   let act = -3;
   /** UP: post from the form; 0 to 4: like that post; IDLE: rest. */
   function choose(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      cards.forEach((c, i) => {
         const to = dest(a, i);
         tset(c.p, to, t, Math.max(0, to) * step);
         tset(c.l, i === a ? 1 : 0, t, 0);
         const liked = i === a;
         c.likes.forEach((e, k) =>
            e.setAttribute("class", likeDot(k, c.n, liked)),
         );
         c.el.sil.classList.toggle("hi", liked || (i === 5 && a < 0));
      });
      read.textContent = label(a);
      B.wake();
   }
   choose(IDLE);

   /** Rest tops: a feed slot at card height, else the form at its own height. */
   const hit = (p: Vec2) => {
      const [x, y] = unproj(C, p[0], p[1], CARD_Z);
      for (let k = 0; k < 5; k++) {
         const [sx, sy] = slot(k);
         if (x >= sx - 1 && x <= sx + CW + 1 && y >= sy - 1 && y <= sy + CD + 1)
            return k;
      }
      const [u, v] = unproj(C, p[0], p[1], FORM_Z);
      return u >= 0 && u <= 32 && v >= 20 && v <= 68 ? UP : IDLE;
   };
   follow(bag, stage, svg, hit, choose);
   const set = (v: number) => {
      step = 40 + 80 * v;
   };
   return { set, destroy: bag.dispose };
};
