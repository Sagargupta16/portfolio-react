/**
 * AI Agents & Developer Tooling: an MCP server's tool registry as a tray of
 * five tool cartridges standing in their slots, each numbered by dots near
 * the top of its face. The pointer's place along the row, read against the
 * cartridges' rest tops, pulls them up out of the tray on a spring each: the
 * one under it all the way, its neighbours less the further they stand, and
 * it takes the bright edge. At rest the last call is still in hand: tool 3
 * half out and bright, tool 4 caught on its way. Intensity is the reach, in
 * cartridges.
 */

// prettier-ignore
import {
   Cam, FRAMES, clamp, disposer, facing, fitFrame, inset, mk, place, pointer,
   poly, prism, proj, put, register, ringAt, rings, rrect, slab, solid,
   spring, stepS, type FigureMount, type Frame, type Tour, type Vec2,
   type Vec3,
} from "@/figures/hairline";

const [N, PITCH, T, W, TH, CH, LIFT] = [5, 8, 3.2, 26, 7, 24, 15];
/** Where the last call stopped: tool 3 half out, tool 4 a little. */
const REST = [0, 0.08, 0.55, 0.22, 0];
const LIT = 2;
const TRAY = rrect(-6, -6, W + 6, (N - 1) * PITCH + T + 6, 5, 8);
const CARDS = REST.map((_, k) =>
   rings(0, k * PITCH, W, k * PITCH + T, 1.4, 0.7),
);
const SLOTS = REST.map((_, k) =>
   rrect(-1, k * PITCH - 1, W + 1, k * PITCH + T + 1, 1.8, 3),
);
/** The share of its lift a cartridge takes, u cartridges past the nearest: all of it, down to none past the reach. */
const falloff = (u: number) => (u >= 1 ? 0 : (1 - u) * (1 - u));
/** The reach in cartridges: 1.2 at intensity 0, 3 at 1. */
const reachOf = (v: number) => 1.2 + v * 1.8;
/** The most extreme pose (rule 03): the tray, and every cartridge all the way up. */
const EXTENT = TRAY.map((q): Vec3 => [q.u, q.v, 0]).concat(
   CARDS.flatMap(([r]) => r.map((q): Vec3 => [q.u, q.v, TH + CH + LIFT])),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = REST.map((r, k) =>
      P(W / 2, k * PITCH + T / 2, TH + CH + r * LIFT),
   );
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.service;
/** tool 1 at the back, across to tool 5, back to tool 3, then away. */
export const tour: Tour = ((s) => [s[0], s[4], s[2], null])(camera(frame).spot);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let reach = reachOf(value);
   let over: number | null = null;
   let lit = -1;
   const g = mk("g", {}, svg);

   // The tray, and the slots in its lid that a lifted cartridge leaves open.
   put(solid(g), slab(P, front, TRAY, inset(C, TRAY, 1.4), 0, TH));
   for (const s of SLOTS)
      mk("path", { d: poly(ringAt(P, s, TH)), class: "nf lo" }, g);
   // Back to front along y: a nearer cartridge covers the one behind it.
   const cards = CARDS.map(([ring, inner], k) => {
      const el = solid(g);
      const dots = REST.slice(0, k + 1).map(() =>
         mk("circle", { r: 1.2, class: "dot off" }, el.g),
      );
      return {
         ring,
         inner,
         el,
         dots,
         sp: spring(REST[k] * LIFT, { eps: 0.02 }),
         drawn: Number.NaN,
      };
   });

   const B = register(stage, (dt) => {
      let moving = false;
      cards.forEach((c, k) => {
         moving = stepS(c.sp, dt) || moving;
         if (c.sp.x === c.drawn) return;
         const z = TH + (c.drawn = c.sp.x);
         put(c.el, prism(P, front, c.ring, c.inner, z, z + CH));
         c.dots.forEach((d, j) =>
            place(d, P(4 + j * 3.2, k * PITCH + T, z + CH - 3.6)),
         );
      });
      return moving;
   });
   bag.add(B.unregister);

   function light(k: number) {
      if (k === lit) return;
      if (lit >= 0) {
         cards[lit].el.sil.classList.remove("hi");
         for (const d of cards[lit].dots) d.setAttribute("class", "dot off");
      }
      lit = k;
      cards[k].el.sil.classList.add("hi");
      for (const d of cards[k].dots) d.setAttribute("class", "dot m");
   }

   // The hit test: the pointer's place along the line through the rest tops, in cartridges. The tops never move.
   const [a, b] = [spot[0], spot[N - 1]];
   const dir: Vec2 = [b[0] - a[0], b[1] - a[1]];
   const len2 = dir[0] * dir[0] + dir[1] * dir[1];
   const along = (p: Vec2) =>
      clamp(
         (((p[0] - a[0]) * dir[0] + (p[1] - a[1]) * dir[1]) / len2) * (N - 1),
         0,
         N - 1,
      );

   function retarget() {
      if (over === null) {
         cards.forEach((c, k) => (c.sp.t = REST[k] * LIFT));
         light(LIT);
         read.textContent = "rest";
      } else {
         const u = over;
         cards.forEach(
            (c, k) =>
               (c.sp.t =
                  LIFT * falloff(Math.max(0, Math.abs(k - u) - 0.5) / reach)),
         );
         light(Math.round(u));
         read.textContent = `tool ${Math.round(u) + 1}`;
      }
      B.wake();
   }
   retarget();

   bag.add(
      pointer(stage, {
         move: (p) => {
            over = along(p);
            retarget();
         },
         leave: () => {
            over = null;
            retarget();
         },
      }),
   );
   bag.add(() => svg.replaceChildren());
   return {
      set: (v) => {
         reach = reachOf(v);
         if (over !== null) retarget();
      },
      destroy: bag.dispose,
   };
};
