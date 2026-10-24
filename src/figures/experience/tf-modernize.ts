/**
 * tf-modernize (DTCC): a legacy Terraform configuration as one tall stack of
 * four layers at the back, four module tiles in a column beside it, each
 * wired by a right-angle run into a plan slab with a dot per module, and the
 * apply slab after it. At rest the stack is parted over layer 2 and module 2
 * stands a little up, bright: one block mid refactor. The pointer picks a
 * module, or its layer in the stack (both tested at rest): the layers above
 * it lift away, the module rises, its run draws into the plan, and plan and
 * apply rise after it, a hop each. The plan draws every module in; the apply
 * turns green. Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, mk, now,
   open, part, place, proj, put, register, rrect, slab, solid, tdone, tset,
   tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, LH, LIFT, MT, RISE, CAP, STICK, REST] = [3, 5, 9, 4, 8, 28, 4, 1];
const PLATE = rrect(-92, -42, 72, 42, 10, 8);
const LEGACY = rrect(-82, -12, -58, 12, 3, 8);
const MOD_Y = [-27, -9, 9, 27];
const MODS = MOD_Y.map((y) => rrect(-33, y - 8, -17, y + 8, 3, 8));
const PLAN = rrect(3, -12, 27, 12, 4, 8);
const APPLY = rrect(40, -12, 64, 12, 4, 8);
const [PH, AH] = [6, 8];
/** Each module's run into the plan: along x to the trunk, along y to the plan's middle. */
const RUNS: Vec2[][] = MOD_Y.map((y) => [
   [-17, y],
   [-5, y],
   [-5, 0],
   [3, 0],
]);
const TAGS = ["mod 1", "mod 2", "mod 3", "mod 4", "plan", "apply"];
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [-82, -12, 4 * LH + LIFT],
   ...MOD_Y.map((y): Vec3 => [-33, y - 8, RISE + MT]),
]);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = MOD_Y.map((y) => P(-25, y, MT));
   spot.push(P(15, 0, PH), P(52, 0, AH));
   for (let j = 0; j < 4; j++) spot.push(P(-70, 12, j * LH + 2.5));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.banner;
/** Layer 3 in the legacy stack, the plan, the apply, then away. */
export const tour: Tour = ((s) => [s[8], s[4], s[5], null])(camera(frame).spot);

const hopMs = (v: number) => 30 + v * 60;

/** Hops before run k draws: after the lift for a module, else the inner runs first. */
function runHop(k: number, mod: boolean) {
   if (mod) return 3;
   return k < 4 ? Math.abs(MOD_Y[k]) / 18 : 1;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hopMs(value);
   let act = -1;
   const g = mk("g", {}, svg);
   const floor = (pts: Vec2[]) => pts.map((q) => P(q[0], q[1], 0));

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   // Runs on the floor, behind every solid: a dim wire, and over it the line that grows.
   const wires = [...RUNS, [[27, 0] as Vec2, [40, 0] as Vec2]];
   for (const r of wires) mk("path", { d: open(floor(r)), class: "nf lo" }, g);
   const lines = wires.map(() => mk("path", { class: "nf sil" }, g));

   // Back to front: the legacy stack, bottom up, then modules, plan, apply.
   const layers = [0, 1, 2, 3].map(() => solid(g));
   const linner = inset(C, LEGACY, 1);
   const mods = MODS.map(() => solid(g));
   const minner = MODS.map((r) => inset(C, r, 1));
   const plan = solid(g);
   const apply = solid(g);
   const dots = MOD_Y.map(() => flatDot(g, C, 1.3, "dot off"));

   const lift = [0, 1, 2, 3].map((j) => tween(j > REST ? 0.35 : 0));
   const z = MODS.map((_, i) => tween(i === REST ? 0.35 : 0));
   const l = wires.map(() => tween(0));
   const [pz, az] = [tween(0), tween(0)];
   const all = [...lift, ...z, ...l, pz, az];
   let drawn = "";

   const B = register(stage, (_dt, t) => {
      const v = all.map((tw) => tval(tw, t));
      const key = v.join() + act;
      if (key !== drawn) {
         drawn = key;
         layers.forEach((el, j) => {
            const z0 = j * LH + v[j] * LIFT;
            put(el, slab(P, front, LEGACY, linner, z0, z0 + LH - 0.8));
         });
         mods.forEach((el, i) => {
            const z0 = v[4 + i] * RISE;
            put(el, slab(P, front, MODS[i], minner[i], z0, z0 + MT));
            const hi = i === (act < 0 ? REST : act);
            el.sil.classList.toggle("hi", hi && (act < 0 || v[4 + i] > 0.5));
         });
         wires.forEach((r, k) => {
            const lk = v[8 + k];
            lines[k].setAttribute(
               "d",
               lk > 0.01 ? open(floor(part(r, lk))) : "",
            );
            if (k < 4)
               dots[k].setAttribute("class", lk > 0.95 ? "dot m" : "dot off");
         });
         const [p, a] = [v[13] * RISE * 0.5, v[14] * RISE * 0.5];
         put(plan, slab(P, front, PLAN, inset(C, PLAN, 1.2), p, p + PH));
         put(apply, slab(P, front, APPLY, inset(C, APPLY, 1.2), a, a + AH));
         plan.sil.classList.toggle("hi", act === 4);
         apply.sil.classList.toggle("ok", act === 5 && v[14] > 0.5);
         dots.forEach((d, i) =>
            place(d, P(15 + (i - 1.5) * 4, -(i - 1.5) * 4, p + PH)),
         );
      }
      return all.some((tw) => !tdone(tw, t));
   });
   bag.add(B.unregister);

   // Hit test on the rest tops; a layer of the stack stands for its module. Sticky by STICK.
   const hit = (q: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - q[0], s[1] - q[1]));
      let best = d.indexOf(Math.min(...d));
      if (best < 0 || d[best] >= CAP) return -1;
      if (best > 5) best -= 6;
      const twin = act < 4 ? d[act + 6] : 1e9;
      const held = act >= 0 ? Math.min(d[act], twin) : 1e9;
      return held < CAP && held - Math.min(...d) < STICK ? act : best;
   };

   /** A module: the layers above it lift, it rises, its run draws, plan and apply follow. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const mod = a >= 0 && a < 4;
      const peak = a < 0 ? 0.35 : 1;
      lift.forEach((tw, j) => {
         const on = mod ? j > a : a < 0 && j > REST;
         tset(tw, on ? peak : 0, t, mod ? (3 - j) * step : 0);
      });
      z.forEach((tw, i) => {
         let on = 0;
         if (i === a) on = 1;
         else if (a < 0 && i === REST) on = 0.35;
         tset(tw, on, t, i === a ? 2 * step : 0);
      });
      l.forEach((tw, k) => {
         const on = k < 4 ? k === a || a === 4 || a === 5 : a >= 0;
         tset(tw, on ? 1 : 0, t, on ? runHop(k, mod) * step : 0);
      });
      tset(pz, a >= 0 ? 1 : 0, t, mod ? 5 * step : step);
      tset(az, a >= 0 && a !== 4 ? 1 : 0, t, mod ? 7 * step : 3 * step);
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = hopMs(v);
   };
   return { set, destroy: bag.dispose };
};
