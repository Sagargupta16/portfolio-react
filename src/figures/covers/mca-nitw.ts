/**
 * MCA NITW Website (23): the department portal, logged in. The SideNavBar
 * is a rail of five links (Your Profile, CR Cell, Placement Cell, Alumni,
 * Study Material); beside it the user grid, nine empty cells under the
 * search pill; behind it the server's reply, a deck of IndividualUser cards,
 * each with its avatar dot. The pointer picks a link (tested on the links'
 * rest tops, or anywhere along the rail): the cards that section shows are
 * dealt from the deck into the grid row by row, and the ones it does not
 * fly back onto the deck. At rest Study Material is open, six cards are
 * dealt and its link is bright. Intensity is the delay per card.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   place, pointer, poly, prism, proj, put, register, rings, ringAt, rrect,
   slab, solid, tdone, tset, tval, tween, unproj,
   type FigureMount, type Frame, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [PT, RAIL, LINK, CELL, CARD, CT, ARC] = [3, 4, 10, 16, 12, 1.4, 12];
const LINKS = ["profile", "cr cell", "placement", "alumni", "material"];
const COUNT = [1, 2, 4, 9, 6];
const REST = 4;
const [GX, GY, DX, DY, DZ] = [26, -10, 84, 4, 4];
const LY = -10;
const PLATE = rrect(-10, -26, 104, 44, 9, 8);
const RAILR = rings(-4, -12, 14, 5 * LINK - 9, 3.4, 1.2);
const SEARCH = rrect(GX + 6, GY - 10, GX + 3 * CELL - 8, GY - 5, 2.5);
const DECK = rings(DX - 2, DY - 2, DX + CARD + 2, DY + CARD + 2, 3, 1);
const cell = (i: number): Vec2 => [
   GX + (i % 3) * CELL,
   GY + Math.floor(i / 3) * CELL,
];
/** Where card i lies on the deck: the first to be dealt on top. */
const stackZ = (i: number) => DZ + (8 - i) * (CT + 0.4);

/** The most extreme pose (rule 03): the plate, a card at the top of its arc, the full deck. */
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [DX, DY, stackZ(0) + CT + ARC],
   [GX, GY, ARC + 4],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = LINKS.map((_, k) => P(5, LY + k * LINK + 4.5, RAIL + 1.6));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** Alumni, then CR Cell, then Placement Cell, then away. */
export const tour: Tour = ((s) => [s[3], s[1], s[2], null])(camera(frame).spot);

const per = (v: number) => 30 + v * 40;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = per(value);
   let act = -2;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));

   // The empty cells and the search pill, the deck's plinth, then the rail and its links.
   for (let i = 0; i < 9; i++) {
      const [x, y] = cell(i);
      mk(
         "path",
         {
            d: poly(ringAt(P, rrect(x, y, x + CARD, y + CARD, 2.4), 0)),
            class: "nf lo",
         },
         g,
      );
   }
   mk("path", { d: poly(ringAt(P, SEARCH, 0)), class: "nf" }, g);
   put(solid(g), prism(P, front, DECK[0], DECK[1], 0, DZ));
   put(solid(g), prism(P, front, RAILR[0], RAILR[1], 0, RAIL));
   const links = LINKS.map((_, k) => {
      const [ring, inner] = rings(
         0,
         LY + k * LINK + 1,
         10,
         LY + k * LINK + 8,
         2,
         0.7,
      );
      const el = solid(g);
      put(el, prism(P, front, ring, inner, RAIL, RAIL + 1.6));
      return el;
   });
   const cards = Array.from({ length: 9 }, (_, i) => ({
      el: solid(g),
      dot: flatDot(g, C, 1.8, "dot m"),
      p: tween(i < COUNT[REST] ? 1 : 0),
      drawn: Number.NaN,
      key: 0,
   }));
   let order = "";

   const B = register(stage, (_dt, t) => {
      let moving = false;
      cards.forEach((cd, i) => {
         const p = tval(cd.p, t);
         moving ||= !tdone(cd.p, t);
         const [cx, cy] = cell(i);
         const [x, y] = [lerp(DX, cx, p), lerp(DY, cy, p)];
         const z = lerp(stackZ(i), 0, p) + ARC * Math.sin(Math.PI * p);
         cd.key = x + y + 2 * z;
         if (p === cd.drawn) return;
         cd.drawn = p;
         const [ring, inner] = rings(x, y, x + CARD, y + CARD, 2.4, 0.9);
         put(cd.el, prism(P, front, ring, inner, z, z + CT));
         place(cd.dot, P(x + CARD / 2, y + CARD / 2 - 1, z + CT));
      });
      // Flying cards cross each other: repaint back to front, higher later.
      const next = cards
         .map((_, i) => i)
         .sort((a, b) => cards[a].key - cards[b].key);
      if (next.join() !== order) {
         order = next.join();
         for (const i of next) g.append(cards[i].el.g, cards[i].dot);
      }
      return moving;
   });
   bag.add(B.unregister);

   /** The link under p: on a link's rest top, or the nearest along the rail; -1 off it. */
   const hit = ([sx, sy]: Vec2) => {
      const [x, y] = unproj(C, sx, sy, RAIL + 1.6);
      if (x < -6 || x > 16 || y < LY - 2 || y > LY + 5 * LINK + 1) return -1;
      return Math.max(0, Math.min(4, Math.floor((y - LY) / LINK)));
   };

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const n = COUNT[a < 0 ? REST : a];
      // Dealt in reading order, row by row; returned last first.
      cards.forEach((cd, i) => {
         const delay = i < n ? i * step : (8 - i) * step * 0.6;
         tset(cd.p, i < n ? 1 : 0, t, delay);
      });
      links.forEach((el, k) =>
         el.sil.classList.toggle("hi", k === (a < 0 ? REST : a)),
      );
      act = a;
      read.textContent = a < 0 ? "rest" : `${LINKS[a]} ${n}`;
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
