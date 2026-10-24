/**
 * AWS Organizations Governance on Control Tower (52): the OU tree as plates
 * stacked on plates. The organization root is a tray; on it the four level
 * one OUs (Security, Infrastructure, Workloads, Sandbox), and on Infrastructure
 * and Workloads their level two OUs (Network and Shared, Production and
 * Non-Production). Beside it the management account carries its two policy
 * cards, SCP and RCP; at rest the SCP card is the bright mark and Workloads
 * sits a little proud with Production on it. The pointer picks an OU (each
 * tested on its own rest top, deepest first): the matching card lifts off the
 * management account and the chosen OU rises off its parent with every OU
 * under it lifting off it in turn, a level at a time, because a policy
 * attached to an OU binds all of its children. The root takes the RCP and the
 * whole tree opens. Intensity is the gap between levels.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, follow, inset, mk, now, proj, put,
   register, rrect, slab, solid, tdone, tset, tval, tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, MH, CT, CARD_UP, STEP] = [3, 6, 1.6, 4, 70];
const PLATE = rrect(-46, -8, 126, 78, 8, 8);
const MGMT = rrect(-38, 16, -12, 54, 4, 8);
/** The SCP card behind the RCP card on the management account's lid. */
const CARDS = [rrect(-34, 20, -16, 33, 2, 8), rrect(-34, 37, -16, 50, 2, 8)];
/** [x0, y0, x1, y1, parent, thickness, read-out], in paint order: each OU before what stands on it. */
const OUS: [number, number, number, number, number, number, string][] = [
   [0, 0, 120, 70, -1, 3, "root rcp"],
   [6, 10, 26, 60, 0, 3, "security"],
   [31, 6, 61, 64, 0, 3, "infra"],
   [35, 11, 57, 32, 2, 2.5, "network"],
   [35, 38, 57, 59, 2, 2.5, "shared"],
   [66, 6, 96, 64, 0, 3, "workloads"],
   [70, 11, 92, 32, 5, 2.5, "prod"],
   [70, 38, 92, 59, 5, 2.5, "non-prod"],
   [101, 10, 115, 60, 0, 3, "sandbox"],
];
const [WORKLOADS, PROD] = [5, 6];
/** The rest pose: Workloads a little proud, Production a little more. */
const REST = OUS.map(() => 0);
REST[WORKLOADS] = 0.2;
REST[PROD] = 0.3;
const level = (i: number): number => (i ? 1 + level(OUS[i][4]) : 0);
const under = (a: number, i: number): boolean =>
   i === a || (i > 0 && under(a, OUS[i][4]));
/** The top of OU i when every OU stands gap[j] * G off its parent. */
function tops(gap: number[], G: number) {
   const top: number[] = [];
   OUS.forEach(([, , , , p, h], i) => {
      top[i] = (p < 0 ? 0 : top[p]) + gap[i] * G + h;
   });
   return top;
}
const gapOf = (v: number) => 3 + v * 6;

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   const high = tops(
      OUS.map(() => 1),
      gapOf(1),
   );
   const ext = PLATE.map((q): Vec3 => [q.u, q.v, -PT]);
   OUS.forEach(([x0, y0, x1, y1], i) =>
      ext.push([x0, y0, high[i]], [x1, y1, high[i]], [x0, y1, high[i]]),
   );
   fitFrame(C, ext, frame);
   const P = proj(C);
   const rest = tops(REST, gapOf(0.5));
   // a leaf at its middle; a parent on its bare front rim, clear of what stands on it
   const spot = OUS.map(([x0, y0, x1, y1], i) => {
      const leaf = !OUS.some((o) => o[4] === i);
      return P(leaf ? (x0 + x1) / 2 : x1 - 2.5, (y0 + y1) / 2, rest[i]);
   });
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** Workloads, then Production under it, then the root, then away. */
export const tour: Tour = ((s) => [s[WORKLOADS], s[PROD], s[0], null])(
   camera(frame).spot,
);

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front } = camera(f);
   const bag = disposer();
   let G = gapOf(value);
   let act = -1;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   put(solid(g), slab(P, front, MGMT, inset(C, MGMT, 1.2), 0, MH));
   const cards = CARDS.map((ring) => ({
      ring,
      inner: inset(C, ring, 0.8),
      el: solid(g),
      tw: tween(0),
   }));
   const ous = OUS.map(([x0, y0, x1, y1], i) => {
      const ring = rrect(x0, y0, x1, y1, i ? 3.4 : 6, 8);
      return { ring, inner: inset(C, ring, i ? 1 : 1.4), el: solid(g) };
   });
   const gap = OUS.map((_, i) => tween(REST[i]));
   const drawn = OUS.map(() => Number.NaN);
   const cd = cards.map(() => Number.NaN);
   let mark = cards[0].el.sil;
   mark.classList.add("hi");

   const B = register(stage, (_dt, t) => {
      let moving = false;
      cards.forEach((c, k) => {
         const u = tval(c.tw, t);
         moving ||= !tdone(c.tw, t);
         if (u === cd[k]) return;
         cd[k] = u;
         const z = MH + u * CARD_UP;
         put(c.el, slab(P, front, c.ring, c.inner, z, z + CT));
      });
      const now_ = gap.map((tw) => tval(tw, t));
      const top = tops(now_, G);
      OUS.forEach(([, , , , , h], i) => {
         moving ||= !tdone(gap[i], t);
         if (top[i] === drawn[i]) return;
         drawn[i] = top[i];
         const { ring, inner, el } = ous[i];
         put(el, slab(P, front, ring, inner, top[i] - h, top[i]));
      });
      return moving;
   });
   bag.add(B.unregister);

   // Each OU on its own rest top, deepest first, so a child is found before the parent it stands on.
   const byDepth = OUS.map((_, i) => i).sort((a, b) => level(b) - level(a));
   function hit([sx, sy]: Vec2) {
      const restTop = tops(REST, G);
      for (const i of byDepth) {
         const [x0, y0, x1, y1] = OUS[i];
         const [x, y] = unproj(C, sx, sy, restTop[i]);
         if (x > x0 && x < x1 && y > y0 && y < y1) return i;
      }
      return -1;
   }

   /** Opens the subtree under a, a level at a time from a down; what closes goes from the deepest up. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      OUS.forEach((_, i) => {
         const on = a >= 0 && under(a, i);
         const d = on ? (level(i) - level(a)) * STEP : (2 - level(i)) * STEP;
         const off = a < 0 ? REST[i] : 0;
         tset(gap[i], on ? 1 : off, t, Math.max(0, d));
      });
      tset(cards[0].tw, a > 0 ? 1 : 0, t, 0);
      tset(cards[1].tw, a === 0 ? 1 : 0, t, 0);
      mark.classList.remove("hi");
      mark = a < 0 ? cards[0].el.sil : ous[a].el.sil;
      mark.classList.add("hi");
      act = a;
      read.textContent = a < 0 ? "rest" : OUS[a][6];
      B.wake();
   }

   follow(bag, stage, svg, hit, setActive);
   return {
      set: (v) => {
         G = gapOf(v);
         drawn.fill(Number.NaN);
         B.wake();
      },
      destroy: bag.dispose,
   };
};
