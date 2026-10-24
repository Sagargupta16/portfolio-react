/**
 * security-controls (State Street): an organization plate holding a grid of
 * member accounts, three rows of four, each a tile with a guardrail lid
 * hovering over it, and the audit account, a long slab across the row ends
 * with a dot per account on its lid. At rest the lids stand open in a dune
 * and a new account waits beside its empty slot, bright. The pointer picks
 * an account (tested at rest): the guardrail sweep spreads from it, every
 * lid closing a hop later per grid step, and its finding arcs over its row
 * to the audit account, whose dot for it lights. The audit account lights
 * its dot map, nearest column first; the new account slides in, locked and
 * enrolled.
 * Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, disposer, facing, fitFrame, flatDot, inset, lerp, mk, now,
   open, place, pointer, poly, proj, put, ringAt, register, rrect, slab, solid,
   tdone, tset, tval, tween,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, PITCH, TS, H, LT, AH, OFF, ARC] = [3, 22, 8, 4, 1.6, 12, 30, 14];
const [CAP, STICK, NEW, AUD, AX] = [30, 8, 8, 12, 92];
const PLATE = rrect(-50, -20, 128, 64, 10, 8);
const AUDIT = rrect(AX, -10, 116, 54, 4, 8);
/** The twelve slots, row by row; slot 8, front left, is the account that joins. */
const SLOTS = Array.from({ length: 12 }, (_, i): Vec2 => [
   (i % 4) * PITCH,
   Math.floor(i / 4) * PITCH,
]);
/** Each lid's open gap at rest: a dune, highest at the back left. */
const GAP = SLOTS.map(
   ([x, y]) => 1.5 + 8 * Math.exp(-((x - 18) ** 2 + (y - 8) ** 2) / 900),
);
const TAGS = SLOTS.map(
   (_, i) => `acct ${Math.floor(i / 4) + 1}.${(i % 4) + 1}`,
);
TAGS[NEW] = "new";
TAGS.push("audit");
const EXTENT = PLATE.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   SLOTS.map(([x, y]): Vec3 => [x, y - TS, H + 9.5 + LT]),
   SLOTS.map(([x, y]): Vec3 => [(x + AX) / 2, y, 9 + ARC + 1]),
   [[-OFF - TS, 44 + TS, 0]],
);

/** Fitted to the frame's middle 2:1 band, so a 2:1 slot can crop to it. */
function camera([w, h]: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, [w, w / 2]);
   C.oy += (h - w / 2) / 2;
   const P = proj(C);
   const spot = SLOTS.map(([x, y]) => P(x, y, H));
   spot.push(P(104, 22, AH));
   return { C, P, front: facing(C), spot };
}

export const frame = FRAMES.banner;
/** The back corner account, the audit account, the new one, then away. */
export const tour: Tour = ((s) => [s[0], s[AUD], s[NEW], null])(
   camera(frame).spot,
);

const hopMs = (v: number) => 30 + v * 60;
const grid = (i: number, a: number) =>
   Math.abs((i % 4) - (a % 4)) +
   Math.abs(Math.floor(i / 4) - Math.floor(a / 4));

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P, front, spot } = camera(f);
   const bag = disposer();
   let step = hopMs(value);
   let act = -1;
   const g = mk("g", {}, svg);
   /** The first fraction l of the finding's arc from account i to its dot on the audit lid. */
   const arc = (i: number, l: number) => {
      const [[x, y], dx] = [SLOTS[i], AX + 5 + (i % 4) * 4.6];
      const pts = Array.from({ length: 1 + Math.round(l * 18) }, (_, k) => {
         const s = k / 18;
         const z = lerp(H + 2, AH, s) + Math.sin(Math.PI * s) * ARC;
         return P(lerp(x, dx, s), y, z);
      });
      return open(pts);
   };

   put(solid(g), slab(P, front, PLATE, inset(C, PLATE, 1.4), -PT, 0));
   const [nx, ny] = SLOTS[NEW];
   const slot = rrect(nx - TS, ny - TS, nx + TS, ny + TS, 2.6, 8);
   mk("path", { d: poly(ringAt(P, slot, 0)), class: "nf dash" }, g);

   // Tiles back to front by x + y: each a body and, over it, its lid.
   const rings = SLOTS.map(([x, y]) =>
      rrect(x - TS, y - TS, x + TS, y + TS, 2.6, 8),
   );
   const order = SLOTS.map((q, i) => [q[0] + q[1], i]).sort(
      (a, b) => a[0] - b[0],
   );
   const body = SLOTS.map(() => null as unknown as ReturnType<typeof solid>);
   const lid = body.slice();
   for (const [, i] of order) [body[i], lid[i]] = [solid(g), solid(g)];
   const audit = solid(g);
   put(audit, slab(P, front, AUDIT, inset(C, AUDIT, 1.2), 0, AH));
   // The audit lid's dot map: one dot per account, on its row, in its column.
   const dots = SLOTS.map((_, i) => {
      const d = flatDot(g, C, 1.2, "dot off");
      place(d, P(AX + 5 + (i % 4) * 4.6, Math.floor(i / 4) * PITCH, AH));
      return d;
   });
   // The findings fly over everything, so they paint last.
   const runs = SLOTS.map(() => mk("path", { class: "nf sil" }, g));

   const gap = SLOTS.map(() => tween(1));
   const run = SLOTS.map(() => tween(0));
   const land = tween(0);
   const mark = SLOTS.map(() => tween(0, 200));
   const drawn = SLOTS.map(() => ({ g: NaN, l: NaN, x: NaN, m: false }));
   const lit = SLOTS.map(() => false);
   let audHi = false;

   const B = register(stage, (_dt, t) => {
      let moving = !tdone(land, t);
      const slide = (1 - tval(land, t)) * -OFF;
      SLOTS.forEach(([x, y], i) => {
         const [gi, li, was] = [tval(gap[i], t), tval(run[i], t), drawn[i]];
         const dx = i === NEW ? slide : 0;
         if (li !== was.l) {
            was.l = li;
            runs[i].setAttribute("d", li > 0.01 ? arc(i, li) : "");
         }
         const m = li > 0.95 || tval(mark[i], t) > 0.5;
         if (m !== was.m) {
            was.m = m;
            dots[i].setAttribute("class", m ? "dot m" : "dot off");
         }
         if (gi !== was.g || dx !== was.x) {
            [was.g, was.x] = [gi, dx];
            const r = dx
               ? rrect(x + dx - TS, y - TS, x + dx + TS, y + TS, 2.6, 8)
               : rings[i];
            const lz = H + lerp(0.4, GAP[i], gi);
            put(body[i], slab(P, front, r, inset(C, r, 0.9), 0, H));
            put(lid[i], slab(P, front, r, null, lz, lz + LT));
         }
         // One bright place: the chosen account; at rest the one still joining.
         const on = i === (act < 0 || act === NEW ? NEW : act);
         if (on !== lit[i]) lid[i].sil.classList.toggle("hi", (lit[i] = on));
         moving ||=
            !tdone(gap[i], t) || !tdone(run[i], t) || !tdone(mark[i], t);
      });
      if ((act === AUD) !== audHi)
         audit.sil.classList.toggle("hi", (audHi = act === AUD));
      return moving;
   });
   bag.add(B.unregister);

   // Hit test on the rest tops (the new account at its slot, its target); sticky by STICK.
   const hit = (q: Vec2) => {
      const d = spot.map((s) => Math.hypot(s[0] - q[0], s[1] - q[1]));
      const best = d.indexOf(Math.min(...d));
      if (!(d[best] < CAP)) return -1;
      return act >= 0 && d[act] < CAP && d[act] - d[best] < STICK ? act : best;
   };

   /** An account: the sweep spreads by grid steps, then its finding runs. The audit account: every finding, nearest column first. */
   function setActive(a: number) {
      if (a === act) return;
      const t = now();
      const sweep = a >= 0 && a < AUD;
      SLOTS.forEach((_, i) => {
         const hop = sweep ? grid(i, a) : 0;
         tset(
            gap[i],
            sweep ? 0 : 1,
            t,
            sweep ? hop * step : (3 - (i % 4)) * 20,
         );
         const at = i === NEW ? 700 : 3 * step;
         tset(run[i], sweep && i === a ? 1 : 0, t, at);
         tset(
            mark[i],
            a === AUD ? 1 : 0,
            t,
            a === AUD ? (3 - (i % 4)) * step : 0,
         );
      });
      tset(land, a === NEW ? 1 : 0, t, 0);
      act = a;
      read.textContent = a < 0 ? "rest" : TAGS[a];
      B.wake();
   }

   read.textContent = "rest";
   const leave = () => setActive(-1);
   bag.add(pointer(stage, { move: (q) => setActive(hit(q)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = hopMs(v)), destroy: bag.dispose };
};
