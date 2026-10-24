/**
 * Blue Green AWS Terraform (13): CodeDeploy ECS blue/green behind one ALB. An
 * ALB slab carries the prod listener as a knob on its lid; two routes run to
 * two target group trays, three task tiles in each, and request dots ride
 * the routes. At rest blue serves: its tasks stand, green's slots are empty,
 * and the knob is the bright mark. The pointer picks a part (tested at rest):
 * the ALB starts a canary, green's tasks rise and the knob slides a share of
 * the way; green finishes the shift, then blue's tasks drain; blue rolls
 * back. Tasks rise and drain staggered by distance. Intensity is the canary
 * share.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, lerp, mk,
   nearest, now, open, place, proj, put, register, ringAt, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, TT, TH, AH, STEP, CAP, STICK, ND] = [3, 2.5, 7, 9, 50, 64, 12, 6];
const PLATE = rrect(-30, -16, 132, 76, 8, 8);
const ALB = rrect(-18, 14, 6, 46, 4, 8);
/** Blue, then green: the tray, the listener route from the ALB, the three task footprints. */
const TGS = [8, 52].map((y, k) => ({
   tray: rrect(54, y - 14, 124, y + 14, 5, 8),
   route: [
      [6, 24 + k * 12],
      [30, 24 + k * 12],
      [30, y],
      [54, y],
   ] as Vec2[],
   tasks: [66, 89, 112].map((x) => rrect(x - 8, y - 8, x + 8, y + 8, 3.4, 8)),
}));
/** The listener knob at share s: on the blue side at 0, the green side at 1. */
const knob = (s: number) => {
   const y = lerp(21, 39, s);
   return rrect(-13, y - 4, -1, y + 4, 1.8, 8);
};
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   TGS.flatMap((t) => t.tray.map((q): Vec3 => [q.u, q.v, TT + TH])),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [P(89, 8, TT), P(-6, 30, AH), P(89, 52, TT)];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** Canary on the ALB, the full shift to green, the rollback to blue, then away. */
export const tour: Tour = ((s) => [s[1], s[2], s[0], null])(camera(frame).spot);

/** The point a fraction f along a polyline, by length. */
function along(pts: Vec2[], f: number): Vec2 {
   const lens = pts
      .slice(1)
      .map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
   let left = f * lens.reduce((s, d) => s + d, 0);
   for (let i = 0; i < lens.length; left -= lens[i++])
      if (left <= lens[i]) {
         const k = left / lens[i];
         return [
            lerp(pts[i][0], pts[i + 1][0], k),
            lerp(pts[i][1], pts[i + 1][1], k),
         ];
      }
   return pts.at(-1)!;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let canary = 0.1 + value * 0.4;
   let act = -1;
   const g = mk("g", {}, svg);

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   // Routes and request dots lie on the floor, so they go down before the plates.
   const scr = TGS.map((t) => t.route.map((q) => P(q[0], q[1], 0)));
   scr.forEach((pts) => mk("path", { d: open(pts), class: "nf lo" }, g));
   const lines = scr.map(() => mk("path", { class: "nf sil" }, g));
   const dots = TGS.map((t) =>
      Array.from({ length: ND }, (_, j) => {
         const d = flatDot(g, C, 1.5, "dot off");
         const q = along(t.route, (j + 0.6) / (ND + 0.4));
         place(d, P(q[0], q[1], 0));
         return d;
      }),
   );
   const alb = solid(g);
   put(alb, slab(P, front, ALB, inset(C, ALB, 1.3), 0, AH));
   const kn = solid(g);
   const trays = TGS.map((t) => {
      const el = solid(g);
      put(el, slab(P, front, t.tray, inset(C, t.tray, 1.2), 0, TT));
      return {
         el,
         tasks: t.tasks.map((ring) => {
            mk("path", { d: open(ringAt(P, ring, TT)), class: "nf lo" }, g);
            return { ring, inner: inset(C, ring, 1), el: solid(g) };
         }),
      };
   });
   const marks = [trays[0].el.sil, alb.sil, trays[1].el.sil];
   // Traffic to green is a canary share plus the rest; each task stands by its own tween.
   const [cs, fs] = [tween(0), tween(0)];
   const up = [0, 1].map((k) => [0, 1, 2].map(() => tween(k ? 0 : 1)));
   const drawnU = up.map((r) => r.map(() => Number.NaN));
   let drawnS = Number.NaN;

   const B = register(stage, (_dt, t) => {
      const s = tval(cs, t) + tval(fs, t);
      let moving = !tdone(cs, t) || !tdone(fs, t);
      if (s !== drawnS) {
         drawnS = s;
         put(kn, slab(P, front, knob(s), null, AH, AH + 2.2));
         [1 - s, s].forEach((w, k) => {
            lines[k].setAttribute("d", w > 0.01 ? open(scr[k]) : "");
            const lit = Math.round(w * ND);
            dots[k].forEach((d, j) =>
               d.setAttribute("class", j < lit ? "dot m" : "dot off"),
            );
         });
      }
      trays.forEach((tr, k) =>
         tr.tasks.forEach((tk, i) => {
            const u = tval(up[k][i], t);
            moving ||= !tdone(up[k][i], t);
            if (u === drawnU[k][i]) return;
            drawnU[k][i] = u;
            const h = TT + Math.max(0.05, u * TH);
            put(
               tk.el,
               slab(P, front, tk.ring, u > 0.1 ? tk.inner : null, TT, h),
            );
            tk.el.sil.classList.toggle("lo", u < 0.1);
         }),
      );
      return moving;
   });
   bag.add(B.unregister);

   const pick = nearest(spot, CAP, STICK);

   /** The incoming tasks rise, the traffic moves (green in two steps), then the outgoing tasks drain. */
   function retarget(a: number) {
      const t = now();
      const warm = a >= 1;
      const live = a === 2;
      tset(cs, warm ? canary : 0, t, 250);
      tset(fs, live ? 1 - canary : 0, t, live ? 850 : 250);
      up[0].forEach((w, i) =>
         tset(w, live ? 0 : 1, t, (live ? 1450 : 0) + i * STEP),
      );
      up[1].forEach((w, i) =>
         tset(w, warm ? 1 : 0, t, (warm ? 0 : 950) + (2 - i) * STEP),
      );
      B.wake();
   }

   function setActive(a: number) {
      if (a === act) return;
      (act < 0 ? kn.sil : marks[act]).classList.remove("hi");
      (a < 0 ? kn.sil : marks[a]).classList.add("hi");
      act = a;
      const names = ["blue", `canary ${Math.round(canary * 100)}`, "green"];
      read.textContent = a < 0 ? "rest" : names[a];
      retarget(a);
   }
   kn.sil.classList.add("hi");

   follow(bag, stage, svg, (p) => pick(p, act), setActive);
   return {
      set: (v) => {
         canary = 0.1 + v * 0.4;
         retarget(act);
      },
      destroy: bag.dispose,
   };
};
