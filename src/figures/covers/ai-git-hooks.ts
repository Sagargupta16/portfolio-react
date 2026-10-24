/**
 * AI Git Hooks (34): a commit walks git's hooks before it may land. A plate
 * carries the branch as a rail: two earlier commits, HEAD, the new commit
 * staged after it, three stop lines across the rail and a dashed ring at
 * the tip. Behind each stop stands its hook, a block with its number in
 * dots: the model reviews the diff, the secret scan, the generated
 * message. The pointer picks a hook or the tip (by screen x, at rest): the
 * commit rolls up to that stop and the hook holding it takes the bright
 * edge (the secret scan in amber, the one that can block), the hooks it has
 * cleared mark their dots one hop apart, the branch grows behind it, and
 * past the message hook it carries its message tag. At the tip it lands,
 * green. At rest the staged commit is bright. Intensity is the delay per
 * hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, follow, inset, mk,
   now, open, place, poly, proj, put, register, ringAt, rrect, seg, slab,
   solid, tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CR, CH, HH, TAG] = [3, 6, 5, 8, 1.4];
const STOPS = [16, 40, 64];
const [HEAD, STAGED, TIP] = [-22, -6, 86];
const TAGS = ["review", "secrets", "feat:", "commit"];
const PLATE = rrect(-50, -32, 98, 14, 8, 8);
/** Where the commit waits for each pick: before a stop, or on the tip. */
const HOLD = [...STOPS.map((x) => x - 10), TIP];
const ring = (x: number, r = CR) =>
   circ(r, 48).map((q) => ({ ...q, u: q.u + x }));
const HOOK = (x: number) => rrect(x - 8, -28, x + 8, -12, 3, 6);
const EXTENT: Vec3[] = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat([
   [STOPS[0] - 8, -28, HH],
   [TIP, 0, CH + TAG + 1],
]);

function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   const P = proj(C);
   const spot = [...STOPS.map((x) => P(x, -20, HH)), P(TIP, 0, CH)];
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.cover;
/** The review hook, the secret scan, the tip, then away. */
export const tour: Tour = ((s) => [s[0], s[1], s[3], null])(camera(frame).spot);

/** Delay per hop in ms: 60 at intensity 0, 140 at 1. */
const hop = (v: number) => 60 + v * 80;

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hop(value);
   let act = -1;
   const g = mk("g", {}, svg);
   const on = (x: number, y: number) => P(x, y, 0);

   // The plate, the rail, the branch growing over it, the stop lines, the tip's ring.
   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   mk("path", { d: open([on(-44, 0), on(TIP, 0)]), class: "nf lo" }, g);
   const grown = mk("path", { class: "nf sil" }, g);
   const stops = STOPS.map((x) => seg(on(x, -8), on(x, 8))).join("");
   mk("path", { d: stops, class: "nf lo" }, g);
   mk(
      "path",
      { d: poly(ringAt(P, ring(TIP, CR + 1.4), 0)), class: "nf lo dash" },
      g,
   );

   // The hooks, back to front, each with its number in dots on its lid.
   const hooks = STOPS.map((x, k) => {
      const el = solid(g);
      put(el, slab(P, front, HOOK(x), inset(C, HOOK(x), 1), 0, HH));
      const dots = Array.from({ length: k + 1 }, (_, i) => {
         const d = flatDot(g, C, 1.3, "dot off");
         place(d, P(x - k * 1.7 + i * 3.4, -20, HH));
         return d;
      });
      return { el, dots };
   });

   // The branch's earlier commits, then the new one with its message tag.
   for (const x of [-40, HEAD]) {
      const r = ring(x);
      put(solid(g), slab(P, front, r, inset(C, r, 1), 0, CH));
   }
   const commit = solid(g);
   const tag = mk("path", { class: "sil" }, commit.g);

   const x = tween(STAGED);
   const pass = STOPS.map(() => tween(0));
   const drawn = { x: Number.NaN, pass: STOPS.map(() => false) };
   const B = register(stage, (_dt, t) => {
      const cx = tval(x, t);
      if (cx !== drawn.x) {
         drawn.x = cx;
         const r = ring(cx);
         put(commit, slab(P, front, r, inset(C, r, 1), 0, CH));
         grown.setAttribute("d", open([on(HEAD + CR, 0), on(cx - CR, 0)]));
         const tr = rrect(cx - 3.4, -2.2, cx + 3.4, 2.2, 1, 4);
         const msg =
            cx > STOPS[2] ? slab(P, front, tr, null, CH, CH + TAG) : null;
         tag.setAttribute("d", msg ? msg.sil : "");
      }
      let moving = !tdone(x, t);
      hooks.forEach((h, k) => {
         const ok = tval(pass[k], t) > 0.5;
         if (ok !== drawn.pass[k])
            for (const d of h.dots)
               d.setAttribute("class", ok ? "dot m" : "dot off");
         drawn.pass[k] = ok;
         moving ||= !tdone(pass[k], t);
      });
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest row: the hook or tip whose rest centre is nearest the pointer's x.
   const [y0, y1] = [spot[0][1] - 30, on(TIP, 14)[1] + 10];
   const hit = ([px, py]: Vec2) => {
      const d = spot.map((s) => Math.abs(s[0] - px));
      const best = d.indexOf(Math.min(...d));
      return d[best] < 30 && py > y0 && py < y1 ? best : -1;
   };

   /** Rolls the commit to stop a (3: the tip; -1: staged), clearing the hooks before it hop by hop. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      tset(x, a < 0 ? STAGED : HOLD[a], t, 0);
      hooks.forEach((h, k) => {
         tset(pass[k], a > k ? 1 : 0, t, a > k ? (k + 1) * step : 0);
         h.el.sil.classList.toggle(k === 1 ? "warn" : "hi", a === k);
      });
      commit.sil.classList.toggle("hi", a < 0);
      commit.sil.classList.toggle("ok", a === 3);
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }
   commit.sil.classList.add("hi");

   follow(bag, stage, svg, hit, setActive);
   const set = (v: number) => {
      step = hop(v);
   };
   return { set, destroy: bag.dispose };
};
