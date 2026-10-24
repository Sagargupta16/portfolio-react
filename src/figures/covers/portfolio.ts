/**
 * Personal Portfolio (3): this site. A column of data/*.json files, each
 * numbered by its dots, feeds a section of the page (wires behind); the page
 * has its nav with the Contact Me pill, a loaded hero (logo tile, the
 * two-line headline) and, below the fold, sections that are dashed
 * placeholders until they near the viewport. Beside it the Ctrl+K palette
 * floats with a row per section and its highlight. The pointer picks a file,
 * a section or a palette row (tested at rest): the page scrolls there, every
 * section down to it lazy-loads into a solid in turn, staggered by hop, the
 * palette highlight steps to its row and the file lifts as it is read. At
 * rest only the hero is in and the palette highlight is bright. Intensity is
 * the delay per section.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   nearest, now, place, poly, proj, put, register, ringAt, rrect, seg, slab,
   solid, tdone, tset, tval, tween, type FigureMount, type Frame, type Ring,
   type Solid, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const NAMES = ["hero", "about", "projects", "stats", "contact"];
const [PT, H, PZ, CAP, STICK] = [3, 3, 9, 18, 6];
const SECT: Vec2[] = [
   [10, 24],
   [27, 35],
   [38, 48],
   [51, 57],
   [60, 66],
];
const fileY = (k: number) => 4 + k * 12.5;
const rowY = (k: number) => 14 + k * 5.6;
const DESK = rrect(-6, -4, 124, 74, 7, 8);
const EXTENT = DESK.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [92, 4, PZ + 4],
   [0, 4, 4],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [
      ...NAMES.map((_, k) => P(10, fileY(k) + 4.5, 1.6)),
      ...SECT.map(([a, b], k) => P(57, (a + b) / 2, k ? 0 : H)),
      ...NAMES.map((_, k) => P(105, rowY(k) + 2, PZ + 1.6)),
   ];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The palette's projects row, the stats section, the contact file, then away. */
export const tour: Tour = ((s) => [s[12], s[8], s[4], null])(
   camera(frame).spot,
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = 50 + 80 * value;
   let act = -2;
   const g = mk("g", {}, svg);
   const block = (el: Solid, r: Ring, z0: number, z1: number, b = 0) =>
      put(el, slab(P, front, r, b ? inset(C, r, b) : null, z0, z1));
   const line = (d: string, cls: string) => mk("path", { d, class: cls }, g);

   // The desk, the wires from each file to its section, then the files, each with its dots.
   block(solid(g), DESK, -PT, 0, 1.6);
   const wires = SECT.map(([a, b], k) =>
      seg(P(20, fileY(k) + 4.5, 0), P(30, (a + b) / 2, 0)),
   );
   line(wires.join(""), "nf lo");
   const files = NAMES.map((_, k) => {
      const fg = mk("g", {}, g);
      const el = solid(fg);
      const dots = NAMES.slice(0, k + 1).map(() =>
         flatDot(fg, C, 0.8, "dot off"),
      );
      return { el, dots, z: tween(0), drawn: -1 };
   });

   // The page: nav with the Contact Me pill, then each section over its dashed placeholder.
   block(solid(g), rrect(30, 0, 84, 70, 4, 8), 0, 0.8, 1.2);
   line(poly(ringAt(P, rrect(33, 2, 70, 7, 2.5, 4), 0.8)), "nf lo");
   block(solid(g), rrect(72, 2.6, 81, 6.4, 1.9, 4), 0.8, 2.2);
   const secs = SECT.map(([a, b], k) => {
      const ring = rrect(33, a, 81, b, 2.5, 6);
      line(poly(ringAt(P, ring, 0.8)), "nf dash");
      const sg = mk("g", {}, g);
      const marks = k
         ? []
         : [rrect(37, 13, 42, 18, 1.2, 3), rrect(37, 20, 72, 22.6, 1.3, 3)];
      const el = solid(sg);
      const mp = marks.map(() => mk("path", { class: "nf lo" }, sg));
      return {
         ring,
         inner: inset(C, ring, 0.6, 0.4),
         el,
         marks,
         mp,
         h: tween(k ? 0 : 1),
         drawn: -1,
      };
   });

   // The palette, floating: its search field, a row per section, and the highlight.
   const PAL = rrect(92, 4, 118, 44, 3.5, 6);
   block(solid(g), PAL, PZ, PZ + 1.6, 1.2);
   line(poly(ringAt(P, rrect(95, 7, 115, 11, 2, 4), PZ + 1.6)), "nf");
   const rows = NAMES.map((_, k) =>
      rrect(97, rowY(k), 113, rowY(k) + 3.2, 1.6, 4),
   );
   line(rows.map((r) => poly(ringAt(P, r, PZ + 1.6))).join(""), "nf lo");
   const hl = { el: solid(g), y: tween(rowY(0)), drawn: -1 };

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(hl.y, t);
      files.forEach((fl, k) => {
         const z = tval(fl.z, t);
         moving ||= !tdone(fl.z, t);
         if (z === fl.drawn) return;
         fl.drawn = z;
         block(
            fl.el,
            rrect(0, fileY(k), 20, fileY(k) + 9, 2, 4),
            z,
            z + 1.6,
            0.8,
         );
         fl.dots.forEach((d, j) =>
            place(d, P(4 + j * 2.6, fileY(k) + 4.5, z + 1.6)),
         );
      });
      for (const s of secs) {
         const h = tval(s.h, t) * H;
         moving ||= !tdone(s.h, t);
         if (h === s.drawn) continue;
         s.drawn = h;
         if (h < 0.05) put(s.el, { sil: "", crease: "" });
         else put(s.el, slab(P, front, s.ring, s.inner, 0.8, 0.8 + h));
         s.marks.forEach((r, j) =>
            s.mp[j].setAttribute(
               "d",
               h < 0.05 ? "" : poly(ringAt(P, r, 0.8 + h)),
            ),
         );
      }
      const y = tval(hl.y, t);
      if (y !== hl.drawn)
         block(
            hl.el,
            rrect(96, y - 0.6, 114, y + 3.8, 2, 4),
            PZ + 1.6,
            PZ + 2.6,
         );
      hl.drawn = y;
      return moving;
   });
   bag.add(B.unregister);

   /** Scrolls to section a (-1: rest, the hero only): sections down to it load in turn. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const k = Math.max(a, 0);
      secs.forEach((s, j) => {
         tset(s.h, j <= k ? 1 : 0, t, j <= k ? j * step : (4 - j) * step * 0.5);
         s.el.sil.classList.toggle("hi", j === a);
      });
      files.forEach((fl, j) => {
         tset(fl.z, j === a ? 3 : 0, t, 0);
         for (const d of fl.dots)
            d.setAttribute("class", j <= k ? "dot m" : "dot off");
      });
      tset(hl.y, rowY(k), t, 0);
      hl.el.sil.classList.toggle("hi", a < 0);
      act = a;
      read.textContent = a < 0 ? "rest" : NAMES[a];
      B.wake();
   }
   setActive(-1);

   // A file, a section or a palette row all pick the same section; -1 stays -1.
   const pick = nearest(spot, CAP, STICK);
   let held = -1;
   const hit = (p: Vec2) => {
      held = pick(p, held);
      return held % NAMES.length;
   };

   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = 50 + 80 * v;
   };
   return { set, destroy: bag.dispose };
};
