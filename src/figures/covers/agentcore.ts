/**
 * AgentCore Harness Agent with Governed MCP Tools (61): MCP clients on the
 * left, each with its own run to the AgentCore Gateway, a long low wall whose
 * default-deny Cedar policy lets through only the listed callers and tools.
 * Past the wall one run enters the tools runtime, a tray of nine tool tiles
 * (eight tools and ask_architect), and in front of it lies the harness with
 * its run bar. At rest the gateway is the bright mark and render_diagram sits
 * a little proud, the last tool called. The pointer picks a part (tested at
 * rest) and the call goes hop by hop: a tool lights the first client's run,
 * the run past the wall, and rises; a listed client calls ask_architect and
 * the harness bar fills as its turn runs; the third client is not listed, so
 * its run stops at the wall and the wall takes the deny. Intensity is the
 * delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, inset, mk, now, open, pointer, proj,
   put, register, rrect, slab, solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CH, WH, TT, KT, RISE, HH, CAP, STICK] = [3, 4, 7, 2, 3, 6, 4, 24, 6];
const PLATE = rrect(-50, -12, 92, 76, 8, 8);
const WALL = rrect(1, -6, 10, 64, 3, 8);
const TRAY = rrect(30, -3, 84, 51, 5, 8);
const HARNESS = rrect(30, 57, 84, 69, 4, 8);
const [CY, COLS, ROWS] = [
   [6, 25, 44],
   [39, 57, 75],
   [6, 24, 42],
];
const [ASK, RENDER, STRANGER] = [6, 5, 2];
/** The tool tiles, row by row from the back; ask_architect at the front left, render_diagram mid right. */
const TOOLS = ROWS.flatMap((y) => COLS.map((x): Vec2 => [x, y]));
const tile = ([x, y]: Vec2) => rrect(x - 6.5, y - 6.5, x + 6.5, y + 6.5, 3, 8);
const pts = (...n: number[]) =>
   n.flatMap((v, i): Vec2[] => (i % 2 ? [] : [[v, n[i + 1]]]));
/** Client k's run to the wall, and for the two listed clients on past it into the runtime. */
const RUN_IN = CY.map((y) => pts(-31, y, 1, y));
const RUN_ON = [6, 25].map((y) => pts(10, y, 19, y, 19, 25, 30, 25));
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   TRAY.map((q): Vec3 => [q.u, q.v, TT + KT + RISE]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [
      ...CY.map((y) => P(-40, y, CH)),
      ...TOOLS.map(([x, y]) => P(x, y, TT + KT)),
      P(57, 63, HH),
   ];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** render_diagram, the stranger denied at the wall, a listed client asking the harness, then away. */
export const tour: Tour = ((s) => [s[3 + RENDER], s[STRANGER], s[1], null])(
   camera(frame).spot,
);

/** Delay per hop in ms: 60 at intensity 0, 150 at 0.5, 240 at 1. */
const hop = (v: number) => 60 + v * 180;
const NAMES: Record<number, string> = {
   [STRANGER]: "deny",
   [3 + ASK]: "ask",
   [3 + RENDER]: "render",
   12: "harness",
};
const NAME = (i: number) =>
   NAMES[i] ??
   (i < 3
      ? `client ${i + 1}`
      : `tool ${Math.floor((i - 3) / 3) + 1}.${(i % 3) + 1}`);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   const plate = (r: typeof PLATE, z0: number, z1: number, b = 1.2) => {
      const el = solid(g);
      put(el, slab(P, front, r, inset(C, r, b), z0, z1));
      return el;
   };
   plate(PLATE, -PT, 0, 1.4);
   // Runs on the floor, under every plate: a dim wire, and the same run lit over it.
   const runs = [...RUN_IN, ...RUN_ON].map((r) =>
      open(r.map((q) => P(q[0], q[1], 0))),
   );
   runs.forEach((d) => mk("path", { d, class: "nf lo" }, g));
   const lit = runs.map(() => mk("path", { class: "nf sil" }, g));
   CY.forEach((y) => plate(rrect(-49, y - 7, -31, y + 7, 3, 8), 0, CH));
   const wall = plate(WALL, 0, WH, 0.8);
   plate(TRAY, 0, TT);
   const tools = TOOLS.map((q, k) => {
      const ring = tile(q);
      return {
         ring,
         inner: inset(C, ring, 1),
         el: solid(g),
         tw: tween(k === RENDER ? 0.3 : 0),
      };
   });
   const harness = plate(HARNESS, 0, HH);
   const bar = solid(g);
   // Tweens: each run lit, each tool's rise, the harness bar, the deny.
   const [ln, bt, deny] = [runs.map(() => tween(0)), tween(0), tween(0)];
   const [ld, td] = [runs.map(() => false), tools.map(() => Number.NaN)];
   let [bd, mark, mc] = [Number.NaN, wall.sil, "hi"];
   mark.classList.add("hi");

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(bt, t) || !tdone(deny, t);
      ln.forEach((tw, k) => {
         moving ||= !tdone(tw, t);
         const on = tval(tw, t) > 0.5;
         if (on === ld[k]) return;
         ld[k] = on;
         lit[k].setAttribute("d", on ? runs[k] : "");
      });
      tools.forEach((tl, k) => {
         const u = tval(tl.tw, t);
         moving ||= !tdone(tl.tw, t);
         if (u === td[k]) return;
         const z = TT + (td[k] = u) * RISE;
         put(tl.el, slab(P, front, tl.ring, tl.inner, z, z + KT));
      });
      const b = tval(bt, t);
      if (b !== bd) {
         bd = b;
         const r = rrect(34, 61, 34 + Math.max(2.6, b * 46), 65, 1.3, 8);
         put(
            bar,
            b > 0.02
               ? slab(P, front, r, null, HH, HH + 1)
               : { sil: "", crease: "" },
         );
      }
      // One bright place: the gateway while a call crosses it (amber on the deny), then what it reached.
      const goal = act < 0 || act === STRANGER ? -1 : act < 3 ? 3 + ASK : act;
      const there = goal === 12 ? bd > 0.5 : goal > 0 && td[goal - 3] > 0.5;
      const next = there
         ? (goal === 12 ? harness : tools[goal - 3].el).sil
         : wall.sil;
      const cls = !there && tval(deny, t) > 0.5 ? "warn" : "hi";
      if (next !== mark || cls !== mc) {
         mark.classList.remove(mc);
         (mark = next).classList.add((mc = cls));
      }
      return moving;
   });
   bag.add(B.unregister);

   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   /** The call for part a, as hops: the client's run in, the run past the wall, the tool, the harness. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const tool =
         a >= 3 && a < 12 ? a - 3 : a >= 0 && a !== STRANGER ? ASK : -1;
      const client = a < 0 ? -1 : a < 3 ? a : 0;
      const pass = client >= 0 && client !== STRANGER;
      ln.forEach((tw, k) => {
         const on = k < 3 ? k === client : pass && k - 3 === client;
         tset(tw, on ? 1 : 0, t, on ? (k < 3 ? 0 : step) : 0);
      });
      tools.forEach((tl, k) => {
         const to = k === tool ? 1 : a < 0 && k === RENDER ? 0.3 : 0;
         tset(tl.tw, to, t, to === 1 ? 2 * step : 0);
      });
      const turn = tool === ASK && (a < 3 || a === 12);
      tset(bt, turn ? 1 : 0, t, turn ? 3 * step : 0);
      tset(deny, a === STRANGER ? 1 : 0, t, a === STRANGER ? step : 0);
      act = a;
      read.textContent = a < 0 ? "rest" : NAME(a);
      B.wake();
   }

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = hop(v)), destroy: bag.dispose };
};
