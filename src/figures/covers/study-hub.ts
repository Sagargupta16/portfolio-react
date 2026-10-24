/**
 * Noobathon (27): Study HUB's drill-down, course to year to subject to
 * notes. The course is the base; on it lie four year trays, Year 1 on top,
 * each with its folder tab out front (numbered by dots) and three subject
 * boxes on its lid. The pointer picks a year by its tab: the open tray slides
 * back into the stack and that year's slides out behind it, its subjects
 * rising, staggered by distance. On a subject box, the box takes the bright
 * edge and its three resources (Notes, Tutorials, Previous Year Papers) lift
 * out of it one above another, staggered by hop. Tabs are tested at rest,
 * boxes where their tray comes to rest. Like the site's own loop, rest is the
 * finished drill-down: Year 1 out, Java open and bright. Intensity is the
 * delay per step.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, mk, now, place,
   pointer, prism, proj, put, register, rings, rrect, slab, solid, tdone, tset,
   tval, tween,
   type FigureMount, type Frame, type Solid, type Tour, type Vec2, type Vec3,
} from "@/figures/hairline";

const [Y, PITCH, T, OUT, W, D, BH, RES] = [4, 4.5, 3, 50, 62, 40, 5, 3.6];
const [PT, CAP, STICK, REST, JAVA] = [3, 30, 10, 3, 1];
const SUBJ = ["c", "java", "ds"];
const DOCS = ["notes", "tuts", "papers"];
/** Each tray sits a little off the one below, so the closed stack is not a block. */
const OFF = [0, 0, 1.5, -1, -1, 1.2, 0.8, -0.4];
const PLATE = rrect(-8, -8 - OUT, W + 8, D + 11, 8, 8);
const year = (j: number) => Y - j;
const tabX = (j: number) => 6 + (Y - 1 - j) * 14;
const boxX = (s: number) => 5 + s * 19;
const z0 = (j: number) => j * PITCH;
/** Where tray j lies when it has slid out by u: straight back. */
const at = (j: number, u: number): Vec2 => [OFF[2 * j], OFF[2 * j + 1] - u];
/** The tray left on top of the stack when tray a is out. */
const exposed = (a: number) => (a === Y - 1 ? Y - 2 : Y - 1);

/** The most extreme pose (rule 03): the base, the stack, and the top tray out with its resources up. */
const TOP = z0(Y - 1) + T + BH + 3 * RES;
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   [0, W].flatMap((x): Vec3[] => [
      [x, -OUT, TOP],
      [x, D - OUT, TOP],
      [x, 0, z0(Y - 1) + T + BH],
   ]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const tab = [0, 1, 2, 3].map((j) =>
      P(tabX(j) + 6 + at(j, 0)[0], D + 3 + at(j, 0)[1], z0(j) + T),
   );
   const box = (j: number, s: number) =>
      P(boxX(s) + 7 + at(j, OUT)[0], 20 + at(j, OUT)[1], z0(j) + T + BH);
   return { C, P, front: facing(C), tab, box };
}

export const frame = FRAMES.cover;
/** Year 3's tab, its DS box, Year 2's tab, then away. */
export const tour: Tour = ((k) => [k.tab[1], k.box(1, 2), k.tab[2], null])(
   camera(frame),
);

const per = (v: number) => 40 + v * 40;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, tab, box } = camera(f);
   const bag = disposer();
   let step = per(value);
   let [yr, sub, ry, was] = [-2, -2, REST, REST];
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));

   // Trays bottom to top, each with its tab, its dots and its boxes; the resources ride in their box's group.
   const trays = [0, 1, 2, 3].map((j) => {
      const tg = mk("g", {}, g);
      const parts = [solid(tg), solid(tg)];
      const dots = Array.from({ length: year(j) }, () =>
         flatDot(tg, C, 1, "dot m"),
      );
      const boxes = SUBJ.map(() => {
         const el = solid(tg);
         const docs = DOCS.map(() => solid(el.g));
         const up = j === REST || j === exposed(REST);
         return { el, docs, h: tween(up ? 1 : 0), drawn: "" };
      });
      const u = tween(j === REST ? OUT : 0);
      return { parts, dots, boxes, u, drawn: Number.NaN };
   });
   const res = SUBJ.map((_, k) => DOCS.map(() => tween(k === JAVA ? 1 : 0)));
   const draw = (
      el: Solid,
      [x0, y0, x1, y1]: number[],
      za: number,
      zb: number,
   ) => put(el, prism(P, front, ...rings(x0, y0, x1, y1, 2.2, 0.9), za, zb));

   const B = register(stage, (_dt, t) => {
      let moving = false;
      trays.forEach((tr, j) => {
         const u = tval(tr.u, t);
         const [[x, y], z] = [at(j, u), z0(j)];
         moving ||= !tdone(tr.u, t);
         const tx = x + tabX(j);
         if (u !== tr.drawn) {
            tr.drawn = u;
            draw(tr.parts[0], [x, y, x + W, y + D], z, z + T);
            draw(tr.parts[1], [tx, y + D - 2, tx + 12, y + D + 6], z, z + T);
            const n = tr.dots.length;
            tr.dots.forEach((d, k) =>
               place(d, P(tx + 6 + (k - (n - 1) / 2) * 2.6, y + D + 3, z + T)),
            );
         }
         tr.boxes.forEach((b, s) => {
            const h = tval(b.h, t) * BH;
            const e = res[s].map((r) => (j === ry ? tval(r, t) : 0));
            moving ||= !tdone(b.h, t) || res[s].some((r) => !tdone(r, t));
            const key = `${u} ${h} ${e}`;
            if (key === b.drawn) return;
            b.drawn = key;
            const [bx, top] = [x + boxX(s), z + T + h];
            draw(
               b.el,
               [bx, y + 12, bx + 14, y + 28],
               z + T,
               Math.max(top, z + T + 0.4),
            );
            b.docs.forEach((el, k) => {
               if (e[k] < 0.01) return put(el, { sil: "", crease: "" });
               const zk = top + (k + 1) * RES * e[k];
               draw(el, [bx + 1.5, y + 13.5, bx + 12.5, y + 26.5], zk - 1, zk);
            });
         });
      });
      return moving;
   });
   bag.add(B.unregister);

   /** The nearest tab (at rest) or box of the tray that is out (where it rests out); sticky by STICK. */
   const hit = (p: Vec2): [number, number] => {
      const open = yr < 0 ? REST : yr;
      const spots: [number, number, Vec2][] = tab.map((q, j) => [j, -1, q]);
      SUBJ.forEach((_, s) => spots.push([open, s, box(open, s)]));
      const d = spots.map(
         ([, s, q]) => Math.hypot(q[0] - p[0], q[1] - p[1]) / (s < 0 ? 1 : 2),
      );
      let best = d.indexOf(Math.min(...d));
      const cur = spots.findIndex(([j, s]) => j === yr && s === sub);
      if (cur >= 0 && d[cur] < CAP && d[cur] - d[best] < STICK) best = cur;
      if (d[best] < CAP) return [spots[best][0], spots[best][1]];
      // Between a tab and its tray the open year holds, so the hand can travel.
      return yr >= 0 && d[best] < 3 * CAP ? [yr, -1] : [-1, -1];
   };

   function choose([a, s]: [number, number]) {
      if (a === yr && s === sub) return;
      const t = now();
      const [A, S] = a < 0 ? [REST, JAVA] : [a, s];
      const late = A !== was ? 500 : 0;
      trays.forEach((tr, j) => {
         tset(tr.u, j === A ? OUT : 0, t, j === A ? late * 0.4 : 0);
         tr.boxes.forEach((b, k) => {
            const up = j === A || j === exposed(A);
            tset(
               b.h,
               up ? 1 : 0,
               t,
               j === A ? late + Math.abs(k - Math.max(0, S)) * step : 0,
            );
            b.el.sil.classList.toggle("hi", j === A && k === S);
         });
         tr.parts[0].sil.classList.toggle("hi", j === A && S < 0);
      });
      if (S >= 0) ry = A;
      res.forEach((r, k) =>
         r.forEach((tw, n) =>
            tset(tw, k === S ? 1 : 0, t, late + (n + 1) * step),
         ),
      );
      [yr, sub, was] = [a, s, A];
      const label = s < 0 ? `year ${year(a)}` : `y${year(a)} ${SUBJ[s]}`;
      read.textContent = a < 0 ? "rest" : label;
      B.wake();
   }

   const leave = () => choose([-1, -1]);
   leave();
   bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         step = per(v);
      },
      destroy: bag.dispose,
   };
};
