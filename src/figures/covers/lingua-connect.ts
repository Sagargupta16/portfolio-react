/**
 * Lingua Connect (1): the Tutor page's language filter. Six tutor cards
 * stand in a row, each with three dot slots on its face, lit for the
 * languages it teaches (en, es, fr); in front lie the three Language
 * options of FILTERS, numbered by dots. The pointer picks an option: every
 * card that fails checkLanguage folds down flat, and the ones that pass
 * lean toward the learner, staggered by distance from the option. On a card
 * instead, that tutor is the one to book: the rest fold away. All picks are
 * tested at rest. At rest the cards lean back unevenly and the es option is
 * bright. Intensity is the delay per card.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, hull, inset, mk, now,
   place, pointer, poly, prism, proj, put, rad, register, rrect, slab, solid,
   tdone, tset, tval, tween, unproj,
   type FigureMount, type Frame, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [N, PITCH, CW, CH, T, Y0, PT] = [6, 16, 12, 22, 1.4, 8, 3];
const [FOLD, LEAN] = [80, -10];
/** Each tutor's languages, as slots 0 to 2: en, es, fr. */
const TEACH = [[0, 1], [2], [0], [1, 2], [0, 2], [1]];
const REST = [8, 14, 5, 11, 7, 16];
const LANG = ["en", "es", "fr"];
const OPT: [number, number][] = [16, 46, 76].map((x) => [x, 29]);
const [OR, OH] = [6, 4];
const PLATE = rrect(-10, -20, 106, 41, 9, 8);
const FACE = rrect(0, 0, CW, CH, 2.2, 4);
const LIP = rrect(1, 1, CW - 1, CH - 1, 1.4, 4);

/** The most extreme pose (rule 03): the plate, a card standing, a card folded flat. */
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [0, Y0 + 4, CH + 1],
   [N * PITCH, Y0 + 4, CH + 1],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const opt = OPT.map(([x, y]) => P(x, y, OH));
   const card = REST.map((_, i) => P(i * PITCH + CW / 2, Y0, CH * 0.6));
   return { C, P, front: facing(C), opt, card };
}

export const frame = FRAMES.cover;
/** The fr option, the es option, then a tutor's card, then away. */
export const tour: Tour = ((k) => [k.opt[2], k.opt[1], k.card[3], null])(
   camera(frame),
);

const per = (v: number) => 30 + v * 30;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let step = per(value);
   let act = -2;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));

   // The hinge slots in the plate, then the cards left to right, then the options in front.
   for (let i = 0; i < N; i++)
      mk(
         "path",
         {
            d: poly([0, CW].map((u) => P(i * PITCH + u, Y0, 0))),
            class: "nf lo",
         },
         g,
      );
   const cards = REST.map((th) => {
      const el = solid(g);
      const dots = LANG.map(() => flatDot(g, C, 1.2, "dot off"));
      return { el, dots, th: tween(th), drawn: Number.NaN };
   });
   const opts = OPT.map(([x, y], k) => {
      const ring = circ(OR, 48).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
      const el = solid(g);
      put(el, prism(P, front, ring, inset(C, ring, 1), 0, OH));
      for (let j = 0; j <= k; j++)
         place(flatDot(g, C, 1.1, "dot m"), P(x - k * 1.4 + j * 2.8, y, OH));
      return el;
   });

   /** Card i turned th degrees back on its hinge: a point at (u, w) on it, s off its middle toward its face. */
   function draw(i: number, th: number) {
      const [c, s] = [Math.cos(rad(th)), Math.sin(rad(th))];
      const at = (o: number) => (u: number, w: number) =>
         P(i * PITCH + u, Y0 - w * s + o * c, w * c + o * s);
      const [fr, bk] = [at(T / 2), at(-T / 2)];
      const face = FACE.map((q) => fr(q.u, q.v));
      cards[i].el.sil.setAttribute(
         "d",
         poly(hull(face.concat(FACE.map((q) => bk(q.u, q.v))))),
      );
      cards[i].el.cr.setAttribute("d", poly(LIP.map((q) => fr(q.u, q.v))));
      cards[i].dots.forEach((d, k) => place(d, fr(3 + k * 3, CH - 4)));
   }
   cards.forEach((cd, i) =>
      cd.dots.forEach((d, k) =>
         d.setAttribute("class", TEACH[i].includes(k) ? "dot m" : "dot off"),
      ),
   );

   const B = register(stage, (_dt, t) => {
      let moving = false;
      cards.forEach((cd, i) => {
         const th = tval(cd.th, t);
         if (th !== cd.drawn) draw(i, (cd.drawn = th));
         moving ||= !tdone(cd.th, t);
      });
      return moving;
   });
   bag.add(B.unregister);

   /** The world (x, z) on the upright plane y = Y0 under a screen point: the cards' plane at rest. */
   const onFace = ([x, y]: Vec2): Vec2 => {
      const [o, a, b] = [P(0, Y0, 0), P(1, Y0, 0), P(0, Y0, 1)];
      const [ex, ez, q] = [
         [a[0] - o[0], a[1] - o[1]],
         [b[0] - o[0], b[1] - o[1]],
         [x - o[0], y - o[1]],
      ];
      const det = ex[0] * ez[1] - ex[1] * ez[0];
      return [
         (q[0] * ez[1] - q[1] * ez[0]) / det,
         (ex[0] * q[1] - ex[1] * q[0]) / det,
      ];
   };
   /** An option (0 to 2) on its rest top, else a card (3 to 8) on its rest plane; -1 for none. */
   const hit = (p: Vec2) => {
      const [u, v] = unproj(C, p[0], p[1], OH);
      const k = OPT.findIndex(([x, y]) => Math.hypot(u - x, v - y) < OR + 2);
      if (k >= 0) return k;
      const [x, z] = onFace(p);
      const i = Math.floor((x + 2) / PITCH);
      return i >= 0 && i < N && z > 0 && z < CH + 2 && x - i * PITCH < CW + 2
         ? 3 + i
         : -1;
   };

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const from = a < 0 ? -1 : a < 3 ? OPT[a][0] : (a - 3) * PITCH + CW / 2;
      cards.forEach((cd, i) => {
         const pass = a < 3 ? TEACH[i].includes(a) : i === a - 3;
         const delay =
            from < 0 ? 0 : (Math.abs(i * PITCH + CW / 2 - from) / PITCH) * step;
         tset(cd.th, a < 0 ? REST[i] : pass ? LEAN : FOLD, t, delay);
         cd.el.sil.classList.toggle("hi", i === a - 3);
      });
      opts.forEach((el, k) =>
         el.sil.classList.toggle("hi", k === (a < 0 ? 1 : a)),
      );
      act = a;
      const n = TEACH.filter((l) => l.includes(a)).length;
      read.textContent =
         a < 0 ? "rest" : a < 3 ? `${LANG[a]} ${n}` : `tutor ${a - 2}`;
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
