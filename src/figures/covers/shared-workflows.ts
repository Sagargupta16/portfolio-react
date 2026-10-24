/**
 * Shared Workflows (60): fan-in reuse. A cabinet of seven reusable
 * workflows (node-ci at the foot, then python-ci, gh-pages, docker scan,
 * security-scan, terraform-ci, release), each a drawer, behind one call port
 * on the floor. Four consumer repos lie in front as cards, a dot on each for
 * every `uses:` line in its ci.yml, and every call runs back into the same
 * trunk and the same port. At rest the last call is caught part way:
 * security-scan stands a little open and bright. The pointer picks a drawer
 * or a repo (both tested at rest). A drawer slides out and every repo that
 * calls it lights its run into the port and rises, nearest first; a repo
 * lights its run and the drawers it calls slide out after it, by distance up
 * the cabinet. Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, follow, inset, mk, now,
   open, place, proj, put, register, rrect, slab, solid, tdone, tset, tval,
   tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, Z0, PITCH, DT, OUT, CT, LIFT, CAP] = [3, 5, 5.4, 3.6, 16, 3, 4, 30];
const PLATE = rrect(-48, -32, 92, 46, 8, 8);
const BASE = rrect(41, -27, 87, 17, 5, 8);
const PORT = rrect(57, 25, 71, 35, 2.5, 8);
const NAMES = "node ci,py ci,pages,docker,scan,tf ci,release".split(",");
/** Each drawer's resting jitter in x, and how far it stands open at rest. */
const JIT = [-1.2, 0.8, -0.4, 1.4, 0, -1, 0.6];
const REST = [0, 0, 0, 0, 0.32, 0, 0];
const [SCAN, N] = [4, 7];
/** The consumer repos, back to front: read-out, card y, the drawers its ci.yml calls. */
const REPOS: [string, number, number[]][] = [
   ["stocksage", -20, [1, 4]],
   ["ledger", 0, [0, 4]],
   ["gitscope", 20, [4]],
   ["blue-green", 40, [5]],
];
const zOf = (j: number) => Z0 + j * PITCH;
const drawer = (j: number) => rrect(44 + JIT[j], -24, 84 + JIT[j], 14, 4, 8);
const card = (y: number) => rrect(-41, y - 7, -19, y + 7, 3, 8);
/** A repo's call: out of its card, down the shared trunk, into the port. */
const run = (y: number): Vec2[] => [
   [-19, y],
   [4, y],
   [4, 30],
   [57, 30],
];
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   drawer(6).map((q): Vec3 => [q.u, q.v + OUT, zOf(6) + DT]),
   card(40).map((q): Vec3 => [q.u, q.v, CT + LIFT]),
);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const band = NAMES.map((_, j) => P(64, 14, zOf(j) + DT));
   const spot = REPOS.map(([, y]) => P(-30, y, CT));
   return { C, P, front: facing(C), band, spot };
}

export const frame = FRAMES.cover;
/** security-scan, the ledger repo, terraform-ci, then away. */
export const tour: Tour = ((c) => [c.band[SCAN], c.spot[1], c.band[5], null])(
   camera(frame),
);

/** Delay per hop in ms: 50 at intensity 0, 110 at 0.5, 170 at 1. */
const hop = (v: number) => 50 + v * 120;

/** The read-out for a: rest, a drawer's name, or a repo's. */
function label(a: number) {
   if (a < 0) return "rest";
   return a < N ? NAMES[a] : REPOS[a - N][0];
}

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, band, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));

   // The calls lie on the floor, under every plate: a dim wire, and the same run lit over it.
   const runs = REPOS.map(([, y]) => open(run(y).map((q) => P(q[0], q[1], 0))));
   runs.forEach((d) => mk("path", { d, class: "nf lo" }, g));
   const lit = runs.map(() => mk("path", { class: "nf sil" }, g));
   put(solid(g), slab(P, front, PORT, inset(C, PORT, 1), 0, 2));
   put(solid(g), slab(P, front, BASE, inset(C, BASE, 1.3), 0, Z0 - 1));
   // Drawers bottom to top: the camera looks down, so a lower one never covers a higher.
   const drawers = NAMES.map((_, j) => {
      const [ring, el] = [drawer(j), solid(g)];
      const pull = mk("path", { class: "nf" }, el.g);
      return { ring, inner: inset(C, ring, 1.1), el, pull, tw: tween(REST[j]) };
   });
   const cards = REPOS.map(([, , uses], r) => {
      const [ring, el] = [card(REPOS[r][1]), solid(g)];
      const dots = uses.map(() => flatDot(el.g, C, 1.3, "dot off"));
      return {
         ring,
         inner: inset(C, ring, 1),
         el,
         dots,
         tw: tween(0),
         ln: tween(0),
      };
   });
   const dd = drawers.map(() => Number.NaN);
   const dc = cards.map(() => Number.NaN);
   const ld = cards.map(() => false);
   const marks = [...drawers, ...cards].map((p) => p.el.sil);
   marks[SCAN].classList.add("hi");

   const B = register(stage, (_dt, t) => {
      let moving = false;
      drawers.forEach((d, j) => {
         const u = tval(d.tw, t);
         moving ||= !tdone(d.tw, t);
         if (u === dd[j]) return;
         dd[j] = u;
         const [y, z] = [14 + u * OUT, zOf(j) + DT / 2];
         const ring = d.ring.map((q) => ({ ...q, v: q.v + u * OUT }));
         const inner = d.inner.map((q) => ({ ...q, v: q.v + u * OUT }));
         put(d.el, slab(P, front, ring, inner, zOf(j), zOf(j) + DT));
         // the pull, on the drawer's front
         d.pull.setAttribute("d", open([P(59, y, z), P(69, y, z)]));
      });
      cards.forEach((c, r) => {
         const [u, l] = [tval(c.tw, t), tval(c.ln, t)];
         moving ||= !tdone(c.tw, t) || !tdone(c.ln, t);
         if (ld[r] !== l > 0.5) {
            ld[r] = l > 0.5;
            lit[r].setAttribute("d", ld[r] ? runs[r] : "");
         }
         if (u === dc[r]) return;
         dc[r] = u;
         const z = u * LIFT;
         put(c.el, slab(P, front, c.ring, c.inner, z, z + CT));
         const x0 = -30 - (c.dots.length - 1) * 2.4;
         c.dots.forEach((d, k) => {
            place(d, P(x0 + k * 4.8, REPOS[r][1], z + CT));
            d.setAttribute("class", u > 0.6 ? "dot m" : "dot off");
         });
      });
      return moving;
   });
   bag.add(B.unregister);

   // Drawers by band, on the rest stack's heights; repos by their rest tops. Neither moves.
   const [xa, xb] = [P(41, 17, 0)[0] - 4, P(87, -27, 0)[0] + 4];
   const [ya, yb] = [band[N - 1][1] - 16, P(64, 17, 0)[1]];
   function hit([x, y]: Vec2) {
      if (x > xa && x < xb && y > ya && y < yb) {
         let j = 0;
         while (j < N - 1 && y < (band[j][1] + band[j + 1][1]) / 2) j++;
         return j;
      }
      const d = spot.map((s) => Math.hypot(s[0] - x, s[1] - y));
      const r = d.indexOf(Math.min(...d));
      return d[r] < CAP ? N + r : -1;
   }

   /** a: a drawer (0 to 6), a repo (N + r), or -1 for rest. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const r0 = a - N;
      const calls = REPOS.map(([, , u]) => (a < N ? u.includes(a) : false));
      if (r0 >= 0) calls[r0] = true;
      const used = r0 >= 0 ? REPOS[r0][2] : [];
      drawers.forEach((d, j) => {
         const on = j === a || used.includes(j);
         const delay = r0 >= 0 ? (2 + Math.abs(j - used[0])) * step : 0;
         const idle = a < 0 ? REST[j] : 0;
         tset(d.tw, on ? 1 : idle, t, on ? delay : 0);
      });
      // repos nearest the port first: the run from the right-hand card is the shortest
      cards.forEach((c, r) => {
         const on = calls[r];
         const k = r0 >= 0 ? 0 : REPOS.length - r;
         const [ln, tw] = r0 >= 0 ? [step, 0] : [k * step, (k + 1) * step];
         tset(c.ln, on ? 1 : 0, t, on ? ln : 0);
         tset(c.tw, on ? 1 : 0, t, on ? tw : 0);
      });
      marks[act < 0 ? SCAN : act].classList.remove("hi");
      marks[a < 0 ? SCAN : a].classList.add("hi");
      act = a;
      read.textContent = label(a);
      B.wake();
   }

   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = hop(v);
   };
   return { set, destroy: bag.dispose };
};
