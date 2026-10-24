/**
 * Agent Recipes (33): one markdown recipe, its prompt extracted and run by
 * an agent. A sheet lies on the desk with its fixed sections: When to Use
 * and the worked Example as dim rules, and between them the fenced block
 * under `## The Prompt`, a raised tile with two code lines on its lid.
 * Three agents (Claude Code, Cursor, Aider) stand to the right, each a puck
 * with a row of three task dots. The pointer picks a part (tested on rest
 * tops): on an agent the prompt lifts out of the sheet, the wire to that
 * agent draws, the agent rises and takes the bright edge, and its task dots
 * light in turn, every beat one hop later; on the sheet the prompt alone
 * lifts, bright. At rest the prompt sits just proud of the sheet, bright.
 * Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk,
   now, open, place, pointer, proj, put, register, rrect, slab, solid, tdone,
   tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, ST, FH, UP, AH, RISE, CAP] = [3, 2, 2.4, 9, 6, 6, 44];
const DESK = rrect(-10, -12, 116, 66, 8, 8);
const SHEET = rrect(0, 0, 40, 56, 2.6, 6);
const FENCE = rrect(5, 20, 35, 36, 2.4, 6);
/** The dim sections, When to Use and Example, as rules: y, then length. */
const RULES = [7, 12, 43, 48].map((y, i) => [y, [26, 18, 28, 22][i]]);
/** Code lines on the prompt's lid. */
const CODE = [25, 30].map((y, i) => [y, [18, 12][i]]);
const AGENTS: Vec2[] = [0, 1, 2].map((j) => [80, 2 + j * 26]);
const TAGS = ["claude", "cursor", "aider"];
/** Each agent's wire: out of the prompt's side, an elbow, into the puck. */
const WIRES: Vec2[][] = AGENTS.map(([x, y]) => [
   [40, 28],
   [56, 28],
   [56, y],
   [x - 9, y],
]);
const EXTENT: Vec3[] = DESK.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   AGENTS.map(([x, y]): Vec3 => [x, y - 9, AH + RISE]),
   [[5, 20, ST + FH + UP + 2]],
);

/** The camera fitted to a frame, and the rest tops on screen: the prompt, then each agent. */
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [P(20, 28, ST + FH), ...AGENTS.map(([x, y]) => P(x, y, AH))];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The prompt, then Claude Code, then Aider, then away. */
export const tour: Tour = ((s) => [s[0], s[1], s[3], null])(camera(frame).spot);

/** Delay per hop in ms: 40 at intensity 0, 100 at 1. */
const hop = (v: number) => 40 + v * 60;

/** The first fraction l of a polyline, by length. */
function part(pts: Vec2[], l: number): Vec2[] {
   const lens = pts
      .slice(1)
      .map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
   let left = l * lens.reduce((s, d) => s + d, 0);
   const out = [pts[0]];
   for (let i = 0; i < lens.length && left > 0; left -= lens[i++]) {
      const [a, b, k] = [pts[i], pts[i + 1], Math.min(1, left / lens[i]) || 0];
      out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]);
   }
   return out;
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   const rule = (x: number, y: number, z: number, n: number) =>
      open([P(x, y, z), P(x + n, y, z)]);

   // The desk, the sheet on it with its dim sections, the wires: a dim one, and the line that grows.
   put(solid(g), slab(P, front, DESK, inset(C, DESK, 1.4), -PT, 0));
   put(solid(g), slab(P, front, SHEET, inset(C, SHEET, 1), 0, ST));
   const rules = RULES.map(([y, n]) => rule(5, y, ST, n)).join("");
   mk("path", { d: rules, class: "nf lo" }, g);
   const scr = WIRES.map((w) => w.map((q) => P(q[0], q[1], 0)));
   const tree = [
      scr[0].slice(0, 2),
      [scr[0][2], scr[2][2]],
      ...scr.map((s) => s.slice(2)),
   ];
   mk("path", { d: tree.map(open).join(""), class: "nf lo" }, g);
   const lines = scr.map(() => mk("path", { class: "nf sil" }, g));

   // The prompt, its code lines riding on its lid.
   const fence = solid(g);
   const code = mk("path", { class: "nf lo" }, fence.g);
   const fin = inset(C, FENCE, 1);

   // The agents, back to front, each with its row of task dots to its right.
   const pucks = AGENTS.map(([x, y]) => {
      const ring = circ(9, 48).map((q) => ({ ...q, u: q.u + x, v: q.v + y }));
      const dots = [0, 1, 2].map((k) => {
         const d = flatDot(g, C, 1.4, "dot off");
         place(d, P(x + 15 + k * 4, y, 0));
         return d;
      });
      const el = solid(g);
      const on = [false, false, false];
      return { ring, inner: inset(C, ring, 1), el, dots, z: NaN, l: NaN, on };
   });

   const lift = tween(0.12);
   const z = AGENTS.map(() => tween(0));
   const l = AGENTS.map(() => tween(0));
   const run = AGENTS.map(() => [0, 1, 2].map(() => tween(0)));
   let drawn = Number.NaN;

   const B = register(stage, (_dt, t) => {
      const fz = ST + tval(lift, t) * UP;
      if (fz !== drawn) {
         drawn = fz;
         put(fence, slab(P, front, FENCE, fin, fz, fz + FH));
         code.setAttribute(
            "d",
            CODE.map(([y, n]) => rule(10, y, fz + FH, n)).join(""),
         );
      }
      let moving = !tdone(lift, t);
      pucks.forEach((p, j) => {
         const [zj, lj] = [tval(z[j], t), tval(l[j], t)];
         if (lj !== p.l) {
            p.l = lj;
            lines[j].setAttribute(
               "d",
               lj > 0.002 ? open(part(scr[j], lj)) : "",
            );
         }
         if (zj !== p.z) {
            p.z = zj;
            put(
               p.el,
               slab(P, front, p.ring, p.inner, zj * RISE, zj * RISE + AH),
            );
         }
         p.dots.forEach((d, k) => {
            const on = tval(run[j][k], t) > 0.5;
            if (on !== p.on[k])
               d.setAttribute("class", on ? "dot m" : "dot off");
            p.on[k] = on;
            moving ||= !tdone(run[j][k], t);
         });
         moving ||= !tdone(z[j], t) || !tdone(l[j], t);
      });
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops, on screen, so a risen part cannot flip the choice.
   const hit = (p: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]));
      const best = d.indexOf(Math.min(...d));
      return d[best] < CAP ? best : -1;
   };

   /** 0 lifts the prompt alone; 1 to 3 run it on that agent, hop by hop; -1 is rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      tset(lift, a < 0 ? 0.12 : a === 0 ? 1 : 0.7, t, 0);
      pucks.forEach((p, j) => {
         const on = a === j + 1;
         tset(l[j], on ? 1 : 0, t, on ? step : 0);
         tset(z[j], on ? 1 : 0, t, on ? 2 * step : 0);
         run[j].forEach((r, k) =>
            tset(r, on ? 1 : 0, t, on ? (4 + k * 2) * step : 0),
         );
         p.el.sil.classList.toggle("hi", on);
      });
      fence.sil.classList.toggle("hi", a <= 0);
      act = a;
      read.textContent = a < 0 ? "rest" : a === 0 ? "prompt" : TAGS[a - 1];
      B.wake();
   }
   fence.sil.classList.add("hi");

   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = hop(v)), destroy: bag.dispose };
};
