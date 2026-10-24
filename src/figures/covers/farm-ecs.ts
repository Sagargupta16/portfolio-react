/**
 * AWS DevOps Infrastructure (7): the GitHub Actions job graph of main.yml,
 * then deploy.yml's push to ECR and a rolling ECS update. A push puck feeds
 * two lanes (Python lint then pytest, Node lint then the client build) that
 * meet at the Sonar scan, then build-and-publish; the image goes onto the
 * ECR stack of layers and on to the ECS service tray, where one task runs.
 * At rest the push puck is the bright mark. The pointer picks a job (tested
 * at rest): it and every job it needs run in dependency order, a column at a
 * time, each rising with its status dot passed and the edge into it lit.
 * Picking ECR drops a new layer on the stack; picking ECS also rolls the
 * service: the new task rises in the spare slot, then the old one drains.
 * Intensity is the delay per column.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, clamp, disposer, facing, fitFrame, flatDot, follow, inset,
   mk, nearest, now, open, place, proj, put, register, ringAt, rrect, slab,
   solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, JT, RISE, LT, LP, DROP, TT, TH] = [3, 4, 5, 2.4, 3.2, 10, 2, 7];
const [CAP, STICK, ECS, ECR] = [34, 9, 6, 8];
const PLATE = rrect(-40, -50, 136, 30, 8, 8);
/** [x, y, needs, read-out]: push, two lanes of two jobs, sonar, publish, ECR, ECS. */
const NODES: [number, number, number[], string][] = [
   [-26, 0, [], "push"],
   [0, -14, [0], "lint py"],
   [0, 14, [0], "lint js"],
   [28, -14, [1], "pytest"],
   [28, 14, [2], "client"],
   [56, 0, [3, 4], "sonar"],
   [112, -34, [8], "ecs roll"],
   [84, 0, [5], "publish"],
   [112, 0, [7], "ecr push"],
];
const depth = (i: number): number =>
   i ? 1 + Math.max(...NODES[i][2].map(depth)) : 0;
const DEP = NODES.map((_, i) => depth(i));
const EDGES = NODES.flatMap((n, c) => n[2].map((p) => [p, c]));
const pairs = (...n: number[]) =>
   n.flatMap((v, i): Vec2[] => (i % 2 ? [] : [[v, n[i + 1]]]));
/** A right-angle run on the floor from one footprint's edge to the next. */
function route(p: number, c: number): Vec2[] {
   const [[ax, ay], [bx, by]] = [NODES[p], NODES[c]];
   const [s, ex] = [Math.sign(by - ay), (ax + bx) / 2];
   if (ax === bx) return pairs(ax, ay + 8 * s, bx, by - 10 * s);
   return pairs(ax + (p ? 8 : 7), ay, ex, ay, ex, by, bx - 8, by);
}
const LAYER = rrect(104, -8, 120, 8, 3, 8);
const TRAY = rrect(97, -43, 127, -25, 4, 8);
const SLOTS = [104.5, 119.5].map((x) => rrect(x - 6, -40, x + 6, -28, 2.6, 8));
const PUCK = circ(7, 40).map((q) => ({ ...q, u: q.u - 26 }));
/** Each node's footprint: the push puck, a tile per job, ECR's new layer, ECS's new task. */
const RINGS = NODES.map(
   ([x, y], i) =>
      [PUCK, LAYER, SLOTS[1]][[0, ECR, ECS].indexOf(i)] ??
      rrect(x - 8, y - 6, x + 8, y + 6, 3, 8),
);
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   LAYER.map((q): Vec3 => [q.u, q.v, 3 * LP + LT + DROP]),
   NODES.map(([x, y]): Vec3 => [x, y, JT + RISE]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = NODES.map(([x, y], i) => P(x, y, i === ECR ? 3 * LP : JT));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** pytest, then sonar where the lanes meet, then the ECS roll, then away. */
export const tour: Tour = ((s) => [s[3], s[5], s[ECS], null])(
   camera(frame).spot,
);

/** Delay per column in ms: 70 at intensity 0, 130 at 0.5, 190 at 1. */
const hop = (v: number) => 70 + v * 120;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   // The edges lie on the floor, under every plate.
   const edges = EDGES.map(([p, c]) => {
      const d = open(route(p, c).map((q) => P(q[0], q[1], 0)));
      return mk("path", { d, class: "nf lo" }, g);
   });
   // Back to front by x + y, the order NODES is in: appending is painting.
   let old: ReturnType<typeof solid> | null = null;
   const els = RINGS.map((ring, i) => {
      const inner = inset(C, ring, 1);
      if (i === ECR)
         for (const z of [0, LP, 2 * LP])
            put(solid(g), slab(P, front, ring, inner, z, z + LT));
      if (i === ECS) {
         put(solid(g), slab(P, front, TRAY, inset(C, TRAY, 1.2), 0, TT));
         SLOTS.forEach((r) =>
            mk("path", { d: open(ringAt(P, r, TT)), class: "nf lo" }, g),
         );
         old = solid(g);
      }
      const el = solid(g);
      const dot = [0, ECS, ECR].includes(i)
         ? null
         : flatDot(el.g, C, 1.3, "dot off");
      return { el, dot, inner };
   });
   put(els[0].el, slab(P, front, RINGS[0], els[0].inner, 0, 6));
   const z = NODES.map(() => tween(0));
   const drawn = NODES.map(() => Number.NaN);
   let mark = els[0].el.sil;
   mark.classList.add("hi");

   /** A task standing to share u of its height in slot k; a drained one is its dim footprint. */
   const sin = SLOTS.map((r) => inset(C, r, 1));
   const task = (el: ReturnType<typeof solid>, k: number, u: number) => {
      const h = TT + Math.max(0.05, u * TH);
      put(el, slab(P, front, SLOTS[k], u > 0.1 ? sin[k] : null, TT, h));
      el.sil.classList.toggle("lo", u < 0.1);
   };
   function draw(i: number, u: number) {
      const { el, dot, inner } = els[i];
      if (i === ECR) {
         const zb = 3 * LP + (1 - u) * DROP;
         const lay = slab(P, front, LAYER, inner, zb, zb + LT);
         put(el, u > 0.01 ? lay : { sil: "", crease: "" });
      } else if (i === ECS) {
         // the roll: the new task rises in the first half, the old drains in the second
         task(el, 1, clamp(u * 2, 0, 1));
         task(old!, 0, 1 - clamp(u * 2 - 1, 0, 1));
      } else {
         put(el, slab(P, front, RINGS[i], inner, u * RISE, u * RISE + JT));
         place(dot!, P(NODES[i][0] + 3, NODES[i][1] + 1, u * RISE + JT));
         dot!.setAttribute("class", u > 0.9 ? "dot m" : "dot off");
      }
   }

   const B = register(stage, (_dt, t) => {
      let moving = false;
      for (let i = 1; i < NODES.length; i++) {
         const u = tval(z[i], t);
         moving ||= !tdone(z[i], t);
         if (u !== drawn[i]) {
            drawn[i] = u;
            draw(i, u);
         }
      }
      EDGES.forEach(([, c], e) => {
         const lit = drawn[c] > 0.3;
         edges[e].classList.toggle("sil", lit);
         edges[e].classList.toggle("lo", !lit);
      });
      // One bright place: the push puck, until the chosen job has run.
      const next =
         act > 0 && drawn[act] > 0.5 ? els[act].el.sil : els[0].el.sil;
      if (next !== mark) {
         mark.classList.remove("hi");
         mark = next;
         mark.classList.add("hi");
      }
      return moving;
   });
   bag.add(B.unregister);

   const pick = nearest(spot, CAP, STICK);

   /** Runs job a and everything it needs, a column at a time; what leaves goes back from the far end. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const want = new Set<number>();
      const add = (i: number) => {
         want.add(i);
         NODES[i][2].forEach(add);
      };
      if (a > 0) add(a);
      const far = act > 0 ? DEP[act] : 0;
      NODES.forEach((_, i) => {
         const on = want.has(i);
         const delay = on ? DEP[i] * step : (far - DEP[i]) * step * 0.5;
         tset(z[i], on ? 1 : 0, t, delay);
      });
      act = a;
      read.textContent = a < 0 ? "rest" : NODES[a][3];
      B.wake();
   }

   follow(bag, stage, svg, (p) => pick(p, act), setActive);
   const set = (v: number) => {
      step = hop(v);
   };
   return { set, destroy: bag.dispose };
};
