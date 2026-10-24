/**
 * aws-intern (AWS internship): training to delivery along one lane on a
 * plate. A training tile with a dot per module, a certification medal, a
 * proof of concept (two tiles and their link), the on-prem server, the
 * Terraform plan gate (two posts and a bar), and the ECS cluster: a plate
 * with two running tasks and an empty slot between them. At rest the lane
 * is drawn to the server and the container beside it is bright. The pointer
 * picks a stage (tested at rest) and the lane draws to it, each stage
 * answering as it arrives; past the server the container rides the lane's
 * head, the gate's bar lifts as it reaches the gate (green for the plan),
 * and it lands in the empty slot. Intensity is how high the bar lifts.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, lerp,
   mk, nearest, now, open, place, poly, proj, put, register, ringAt, rrect,
   slab, solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CAP, STICK, PH, GX, X0, X1] = [3, 30, 8, 12, 12, -100, 50];
const PLATE = rrect(-112, -30, 74, 30, 10, 8);
const sq = (x: number, y: number, h: number, r = 3) =>
   rrect(x - h, y - h, x + h, y + h, r, 8);
/** train, cert, poc, on-prem, plan, ecs: where each stands on the lane, its top. */
const ST: [number, number][] = [
   [-90, 5],
   [-66, 4],
   [-42, 5],
   [-16, 18],
   [GX, PH],
   [X1, 5],
];
const TAGS = ["train", "cert", "poc", "on-prem", "plan", "ecs"];
const reachOf = (x: number) => (x - X0) / (X1 - X0);
const [TRAIN, MEDAL, SERVER] = [sq(-90, 0, 10), circ(8, 48), sq(-16, 0, 9)];
const POC = [sq(-42, -10, 6, 2), sq(-42, 10, 6, 2)];
const CLUSTER = rrect(34, -22, 66, 22, 4, 8);
const TASKS = [sq(50, -13, 5, 2), sq(50, 13, 5, 2)];
const POSTS = [-9, 9].map((y) => sq(GX, y, 2.4, 1.2));
const BAR = rrect(GX - 3, -13, GX + 3, 13, 1.5, 4);
const REST = reachOf(-4);
/** How far the lane runs for stage a (-1: rest); the cluster is the far end. */
function reach(a: number) {
   if (a < 0) return REST;
   return a === 5 ? 1 : reachOf(ST[a][0] + 1);
}
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [-25, -9, 18],
   [GX - 3, -13, PH + 9],
]);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = ST.map(([x, z]) => P(x, 0, z));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.banner;
/** The proof of concept, the plan gate, the cluster, then away. */
export const tour: Tour = ((s) => [s[2], s[4], s[5], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let lift = 4 + value * 8;
   let act = -1;
   const g = mk("g", {}, svg);
   const floor = (a: Vec2, b: Vec2) =>
      open([P(a[0], a[1], 0), P(b[0], b[1], 0)]);
   const fixed = (r: typeof TRAIN, z: number, crease = true) => {
      const el = solid(g);
      put(el, slab(P, front, r, crease ? inset(C, r, 1) : null, 0, z));
      return el;
   };

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   mk("path", { d: floor([X0, 0], [X1, 0]), class: "nf lo" }, g);
   const lane = mk("path", { class: "nf sil" }, g);
   const pocLink = mk("path", { class: "nf lo" }, g);
   pocLink.setAttribute("d", floor([-42, -4], [-42, 4]));

   // Back to front by x + y; the container's group moves as it passes the gate.
   const train = fixed(TRAIN, 5);
   const mods = [0, 1, 2].map(() => flatDot(g, C, 1.3, "dot off"));
   mods.forEach((d, k) => place(d, P(-90 + (k - 1) * 4.5, -(k - 1) * 4.5, 5)));
   const medal = fixed(
      MEDAL.map((q) => ({ ...q, u: q.u - 66 })),
      4,
   );
   const poc = POC.map((r) => fixed(r, 5));
   const server = fixed(SERVER, 18);
   const post0 = fixed(POSTS[0], PH, false);
   const box = solid(g);
   fixed(POSTS[1], PH, false);
   const bar = solid(g);
   fixed(CLUSTER, 3);
   const slot = poly(ringAt(P, sq(50, 0, 5, 2), 3));
   mk("path", { d: slot, class: "nf dash" }, g);
   const task0 = fixed(TASKS[0], 8);
   fixed(TASKS[1], 8);
   let past = false;
   const sils = [train, medal, poc[1], server, bar, box].map((e) => e.sil);

   const run = tween(REST);
   let drawn = Number.NaN;

   const B = register(stage, (_dt, t) => {
      const l = tval(run, t);
      if (l === drawn) return !tdone(run, t);
      drawn = l;
      const head = lerp(X0, X1, l);
      lane.setAttribute("d", l > 0.005 ? floor([X0, 0], [head, 0]) : "");
      const r = ST.map(([x]) => Math.max(0, Math.min(1, (head - x) / 6 + 1)));
      mods.forEach((d, k) =>
         d.setAttribute("class", r[0] > 0.3 * (k + 1) ? "dot m" : "dot off"),
      );
      pocLink.setAttribute("class", r[2] > 0.9 ? "nf sil" : "nf lo");
      // The container waits by the server, then rides the head; past the gate it paints after the front post.
      const cx = Math.max(-1, head);
      const cz = Math.max(0, Math.min(1, (cx - 30) / 6)) * 3;
      const ring = sq(cx, 0, 5, 2);
      put(box, slab(P, front, ring, inset(C, ring, 0.9), cz, cz + 5));
      if (cx > GX + 6 !== past) {
         past = cx > GX + 6;
         (past ? task0 : post0).g.after(box.g);
      }
      const up = Math.max(0, Math.min(1, (cx - GX + 12) / 10)) * lift;
      put(bar, slab(P, front, BAR, null, PH + up, PH + up + 1.6));
      // One bright place: the chosen stage once the lane is there; the container at rest.
      const pick = act < 0 ? 5 : act;
      sils.forEach((s, i) => {
         const on = i === pick && (act < 0 || r[pick] > 0.9);
         s.classList.toggle("hi", on && i !== 4);
         s.classList.toggle("ok", on && i === 4);
      });
      return !tdone(run, t);
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen; sticky by STICK.
   const hit = nearest(spot, CAP, STICK);

   /** The lane draws to stage a; the cluster carries the container home. */
   function setActive(a: number) {
      if (a === act) return;
      tset(run, reach(a), now(), 0);
      act = a;
      drawn = Number.NaN;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   follow(bag, stage, svg, (q) => hit(q, act), setActive);
   const set = (v: number) => {
      lift = 4 + v * 8;
      drawn = Number.NaN;
      B.wake();
   };
   return { set, destroy: bag.dispose };
};
