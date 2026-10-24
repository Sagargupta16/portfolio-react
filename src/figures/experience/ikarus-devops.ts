/**
 * ikarus-devops (Ikarus 3D): the GitHub Actions pipeline as one lane on a
 * plate that runs out from the code tile and turns: three checks wait behind
 * it (lint and test tiles, the quality scan's drum), each with a lamp; at the
 * turn the build pad, then the registry with a dot per image, and the ECS
 * cluster with its running tasks. Apart, a server is wired to the code by a
 * dashed playbook run. At rest the commit waits at lint, bright. The pointer
 * picks a stage (tested at rest) and the commit rides the lane to it: each
 * check bobs up as it passes and its lamp stays lit, the commit grows into
 * the image on the pad, lights the registry's newest dot and lands as a
 * task. The server draws its playbook and turns green. Intensity is the bob.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, lerp,
   mk, nearest, now, open, place, proj, put, register, rrect, slab, solid, tdone,
   tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CAP, STICK, LY, TX, SRV] = [3, 28, 8, 0, 44, 7];
const PLATE = rrect(-88, -30, 66, 62, 10, 8);
const sq = (x: number, y: number, h: number, r = 3) =>
   rrect(x - h, y - h, x + h, y + h, r, 8);
/** The lane: out of the code tile along x, then round the turn along y. */
const PATH: Vec2[] = [
   [-62, LY],
   [TX, LY],
   [TX, 50],
];
const L0 = TX + 62;
const TOTAL = L0 + 50;
/** code, lint, test, quality, build, registry, ecs: where each sits on the lane (0 to 1). */
const AT = [-62, -36, -12, 12, TX, 0, 0].map((x, i) =>
   i < 5 ? (x + 62) / TOTAL : (L0 + [0, 0, 0, 0, 0, 22, 46][i]) / TOTAL,
);
const CHECKS = [-36, -12, 12];
const TAGS = ["code", "lint", "test", "scan", "build", "ecr", "ecs", "ansible"];
const REST = AT[1] - 0.04;
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [-42, -22, 16],
   [18, -22, 16],
   [-70, 46, 14],
]);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = [[-62, LY, 6], ...CHECKS.map((x) => [x, -16, 5])];
   spot.push([TX, LY, 3], [TX, 22, 3], [TX, 46, 8], [-62, 38, 14]);
   return { C, P, front: facing(C), spot: spot.map(([x, y, z]) => P(x, y, z)) };
}

export const frame = FRAMES.banner;
/** The test check, the registry, the provisioned server, then away. */
export const tour: Tour = ((s) => [s[2], s[5], s[SRV], null])(
   camera(frame).spot,
);

/** The point a fraction u along the lane. */
function along(u: number): Vec2 {
   const d = u * TOTAL;
   return d < L0 ? [-62 + d, LY] : [TX, LY + d - L0];
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let bob = 3 + value * 8;
   let act = -1;
   const g = mk("g", {}, svg);
   const floor = (pts: Vec2[]) => open(pts.map((q) => P(q[0], q[1], 0)));
   const fixed = (r: ReturnType<typeof sq>, z: number) => {
      const el = solid(g);
      put(el, slab(P, front, r, inset(C, r, 1), 0, z));
      return el;
   };
   const lamp = (q: Vec3) => {
      const d = flatDot(g, C, 1.3, "dot off");
      place(d, P(...q));
      return d;
   };

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   mk("path", { d: floor(PATH), class: "nf lo" }, g);
   const book: Vec2[] = [
      [-62, 8],
      [-62, 30],
   ];
   mk("path", { d: floor(book), class: "nf dash" }, g);
   const lane = mk("path", { class: "nf sil" }, g);
   const play = mk("path", { class: "nf sil" }, g);

   // Back to front by x + y; the commit paints last, over the pad and the cluster it rides onto.
   const code = fixed(sq(-62, LY, 8), 6);
   const checks = CHECKS.map(() => solid(g));
   const lamps = CHECKS.map(() => flatDot(g, C, 1.3, "dot off"));
   const pad = fixed(sq(TX, LY, 10), 3);
   const ecr = fixed(rrect(TX - 16, 14, TX + 16, 30, 3, 8), 3);
   const imgs = [0, 1, 2].map((k) => lamp([TX + 11, 22 + (k - 1) * 4.5, 3]));
   fixed(rrect(TX - 20, 34, TX + 20, 58, 4, 8), 3);
   const tasks = [-12, 12].map((dx) => fixed(sq(TX + dx, 46, 4, 1.5), 8));
   const server = fixed(sq(-62, 38, 8), 14);
   const srvLamp = lamp([-62, 38, 14]);
   const box = solid(g);
   imgs.slice(0, 2).forEach((d) => d.setAttribute("class", "dot m"));
   let landed = false;

   const run = tween(REST);
   const pb = tween(0);
   let drawn = "";

   const B = register(stage, (_dt, t) => {
      const [u, p] = [tval(run, t), tval(pb, t)];
      const key = `${u},${p},${act},${bob}`;
      if (key === drawn) return !tdone(run, t) || !tdone(pb, t);
      drawn = key;
      const [hx, hy] = along(u);
      const pts =
         u < AT[4]
            ? [PATH[0], [hx, hy] as Vec2]
            : [...PATH.slice(0, 2), [hx, hy] as Vec2];
      lane.setAttribute("d", u > 0.005 ? floor(pts) : "");
      play.setAttribute(
         "d",
         p > 0.01 ? floor([book[0], [-62, lerp(8, 30, p)]]) : "",
      );
      CHECKS.forEach((x, k) => {
         const z = bob * Math.exp(-(((hx - x) / 9) ** 2)) * (hy === LY ? 1 : 0);
         const r = sq(x, -16, 6, 2.4);
         const shape =
            k === 2
               ? circ(6, 40).map((q) => ({ ...q, u: q.u + x, v: q.v - 16 }))
               : r;
         put(checks[k], slab(P, front, shape, inset(C, shape, 1), z, z + 5));
         place(lamps[k], P(x, -16, z + 5));
         lamps[k].setAttribute("class", u >= AT[1 + k] ? "dot m" : "dot off");
      });
      imgs[2].setAttribute("class", u >= AT[5] ? "dot m" : "dot off");
      const s = lerp(4, 6, Math.max(0, Math.min(1, (u - AT[4] + 0.03) / 0.06)));
      const cz = Math.max(0, Math.min(1, (u - AT[4] + 0.08) / 0.03)) * 3;
      if (u > AT[6] - 0.05 !== landed) {
         landed = u > AT[6] - 0.05;
         if (landed) tasks[0].g.after(box.g);
         else g.appendChild(box.g);
      }
      const ring = sq(hx, hy, s, 2);
      put(box, slab(P, front, ring, inset(C, ring, 0.9), cz, cz + s));
      srvLamp.setAttribute("class", p > 0.95 ? "dot ok" : "dot off");
      // One bright place: the chosen stage once the commit is there; the commit at rest.
      const sils = [code, ...checks, pad, ecr, box, server].map((e) => e.sil);
      const pick = act < 0 ? 6 : act;
      const there = act < 0 || (act === SRV ? p > 0.95 : u >= AT[act] - 0.01);
      sils.forEach((e, i) => {
         e.classList.toggle("hi", there && i === pick && i !== SRV);
         e.classList.toggle("ok", there && i === pick && i === SRV);
      });
      return !tdone(run, t) || !tdone(pb, t);
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; sticky by STICK.
   const hit = nearest(spot, CAP, STICK);

   /** The commit rides the lane to stage a; the server runs its playbook instead. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const to = a < 0 || a === SRV ? REST : Math.max(AT[a], 0.004);
      tset(run, to, t, 0);
      tset(pb, a === SRV ? 1 : 0, t, 0);
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, (q) => hit(q, act), setActive);
   const set = (v: number) => {
      bob = 3 + v * 8;
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
