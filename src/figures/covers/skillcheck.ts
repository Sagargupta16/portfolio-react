/**
 * skillcheck (45): `skillcheck lint` over a SKILL.md. The document plate holds
 * its frontmatter rows; a marker in the gutter stands at the row being
 * checked, and each row's dots say how many of the three modeled runtimes read that field.
 * Beside it the SARIF report holds one entry per row, wired to it. The
 * pointer picks a row (tested on the rest plane): the marker slides to it, the
 * row and its neighbours lift by distance, the row's runtime dots light, its
 * report entry rises, and the row takes the finding's stroke: amber for a
 * rule hit, green for a pass. At rest the marker is the bright mark.
 * Intensity is the lift.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   now, open, place, proj, put, register, rrect, slab, solid, tdone, tset,
   tval, tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, DT, RT, MZ, PITCH, Y0] = [3, 2, 1.4, 3.5, 14, 9];
const FALL = [1, 0.4, 0.14, 0, 0];
/** Row i's lift at rest: the description row sits a little proud. */
const restLift = (i: number) => (i === 1 ? 0.3 : 0);
const CANVAS = rrect(-10, -10, 124, 90, 7, 8);
const DOC = rrect(0, 0, 64, 80, 4, 8);
const REPORT = rrect(82, 0, 114, 80, 4, 8);
/** [length, runtimes reading it, finding]: name SC013, description, model SC301, paths SC301, license. */
const ROWS: [number, number, string][] = [
   [30, 3, "warn"],
   [40, 3, "ok"],
   [22, 1, "warn"],
   [34, 2, "warn"],
   [26, 3, "ok"],
];
const TAGS = ["name SC013", "description", "model SC301", "paths SC301"];
const tag = (i: number) => TAGS[i] ?? "license";
const yc = (i: number) => Y0 + i * PITCH + 3.5;
const ROW = ROWS.map(([len], i) =>
   rrect(6, yc(i) - 3.5, 6 + len, yc(i) + 3.5, 1.6),
);
const ENTRY = ROWS.map((_, i) => rrect(88, yc(i) - 2.5, 108, yc(i) + 2.5, 1.4));
const MARK = (y: number) => rrect(-9, y - 3.5, -3, y + 3.5, 1.6);
/** The most extreme pose (rule 03): the canvas, and the far row at full lift. */
const EXTENT: Vec3[] = [
   ...CANVAS.map((q): Vec3 => [q.u, q.v, -PT]),
   [6, 0, DT + 7 + RT],
   [36, 0, DT + 7 + RT],
];

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C), front: facing(C) };
}

/** The pointer on the rows' rest plane: the row whose band it falls in, on the doc or on its report entry. */
function pick(C: ReturnType<typeof Cam>, p: Vec2) {
   const [x, y] = unproj(C, p[0], p[1], DT + RT);
   if (x < -4 || x > 116 || (x > 66 && x < 80) || y < 2 || y > 78) return -1;
   return clamp(Math.round((y - yc(0)) / PITCH), 0, ROWS.length - 1);
}

export const frame = FRAMES.cover;
/** name, model, then the passing license row, then away. */
export const tour: Tour = ((P) => [
   P(20, yc(0), DT),
   P(17, yc(2), DT),
   P(19, yc(4), DT),
   null,
])(camera(frame).P);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let rise = 3 + value * 4;
   let act = -1;
   const g = mk("g", {}, svg);

   // The canvas, then the wires across it, behind the two plates they join.
   put(solid(g), slab(P, front, CANVAS, inset(C, CANVAS, 1.4), -PT, 0));
   const wires = ROWS.map((_, i) =>
      open([P(64, yc(i), 0), P(82, yc(i), 0)]),
   ).join("");
   mk("path", { d: wires, class: "nf lo" }, g);
   for (const r of [DOC, REPORT])
      put(solid(g), slab(P, front, r, inset(C, r, 1.2), 0, DT));
   const head = solid(g);

   // Rows and entries back to front by y; each row's runtime dots at its far end.
   const rows = ROWS.map(() => solid(g));
   const dots = ROWS.map(([, n], i) =>
      [0, 1, 2].map((k) => {
         const d = flatDot(g, C, 1.4, "dot off");
         place(d, P(52 + k * 4, yc(i), DT));
         return { d, on: k < n };
      }),
   );
   const entries = ROWS.map(() => solid(g));
   const inner = ROW.map((r) => inset(C, r, 0.8));
   const lift = ROWS.map((_, i) => tween(restLift(i)));
   const up = ROWS.map(() => tween(0));
   const hy = tween(1);
   const drawn = ROWS.map(() => ({ z: Number.NaN, e: Number.NaN }));
   let headAt = Number.NaN;
   let lit = -2;

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(hy, t);
      ROWS.forEach((_, i) => {
         const [z, e, was] = [
            tval(lift[i], t) * rise,
            tval(up[i], t),
            drawn[i],
         ];
         if (z !== was.z) {
            was.z = z;
            put(rows[i], slab(P, front, ROW[i], inner[i], DT + z, DT + z + RT));
         }
         if (e !== was.e) {
            was.e = e;
            put(entries[i], slab(P, front, ENTRY[i], null, DT, DT + 1 + e * 4));
         }
         moving ||= !tdone(lift[i], t) || !tdone(up[i], t);
      });
      const y = yc(0) + tval(hy, t) * PITCH;
      if (y !== headAt) {
         headAt = y;
         const ring = MARK(y);
         put(head, slab(P, front, ring, inset(C, ring, 0.5, 0.5), 0, MZ));
      }
      // One bright place: the marker at rest, the chosen row's finding once it has lifted.
      const a = act >= 0 && tval(lift[act], t) > 0.5 ? act : -1;
      if (a !== lit) {
         lit = a;
         head.sil.classList.toggle("hi", a < 0);
         rows.forEach((r, i) => {
            r.sil.setAttribute("class", i === a ? `sil ${ROWS[i][2]}` : "sil");
            for (const d of dots[i])
               d.d.setAttribute("class", i === a && d.on ? "dot m" : "dot off");
         });
      }
      return moving;
   });
   bag.add(B.unregister);

   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      act = a;
      tset(hy, a < 0 ? 1 : a, t, 0);
      ROWS.forEach((_, i) => {
         const d = Math.abs(i - (a < 0 ? 1 : a));
         tset(lift[i], a < 0 ? restLift(i) : FALL[d], t, d * 45);
         tset(up[i], i === a ? 1 : 0, t, i === a ? 160 : 0);
      });
      read.textContent = a < 0 ? "rest" : tag(a);
      B.wake();
   }

   follow(bag, stage, svg, (p) => pick(C, p), setActive);
   const set = (v: number) => {
      rise = 3 + v * 4;
      for (const d of drawn) d.z = Number.NaN;
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
