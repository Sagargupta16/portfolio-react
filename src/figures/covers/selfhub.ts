/**
 * SelfHub (22): two MCP clients, numbered one and two by dots on their lids,
 * dashed stdio links into the SelfHub server, and the MongoDB `memories`
 * collection beyond it, a stack of documents, newest on top, each dotted
 * with the client that wrote it. The pointer picks a part, tested at rest: on
 * a client, store_memory lights its link and then the server's, hop by hop,
 * and a new document drops on the stack in that client's dots; on a
 * document (each read on its own rest lid), it slides out toward the server,
 * the ones above lift, and the hit rides back to the other client: written
 * by one, recalled by the other. The server's lid mark is bright at rest.
 * Intensity is the delay per hop.
 */

// prettier-ignore
import {
   Cam, FRAMES, circ, disposer, facing, fitFrame, flatDot, inset, lerp, mk,
   now, open, place, pointer, poly, proj, put, register, ringAt, rrect, slab,
   solid, tdone, tset, tval, tween, unproj,
} from "@/figures/hairline";
import type { FigureMount, Frame, Tour, Vec2, Vec3 } from "@/figures/hairline";

const [PT, CT, HUB, HZ, SX, DZ, GZ, SLIDE] = [4, 6, 9, 7, 44, 1.6, 3.4, 12];
/** Who wrote each document, bottom to top. */
const AUTHORS = [1, 0, 1, 1, 0];
const [YS, N] = [[-16, 16], AUTHORS.length];
const docZ = (k: number) => 2 + k * GZ;
const BOARD = rrect(-58, -32, 62, 32, 8, 8);
const TRAY = rrect(SX - 15, -13, SX + 15, 13, 4, 6);
const client = (y: number) => rrect(-50, y - 8, -30, y + 8, 4, 6);
/** The links: client one's, client two's, then the server's out to the stack. */
const LINKS: Vec2[][] = [
   ...YS.map((y): Vec2[] => [
      [-30, y],
      [-20, y],
      [-20, 0],
      [-HUB, 0],
   ]),
   [
      [HUB, 0],
      [SX - 15, 0],
   ],
];
const disc = (r: number) => circ(r, 48);

const EXTENT = BOARD.map((q): Vec3 => [q.u, q.v, -PT]).concat(
   TRAY.map((q): Vec3 => [q.u, q.v, docZ(N) + 2.4 + DZ]),
);
function camera(frame: Frame) {
   const C = Cam(45, 0.5, 1);
   fitFrame(C, EXTENT, frame);
   return { C, P: proj(C) };
}

export const frame = FRAMES.cover;
/** Client one stores, a document is recalled, client two stores, then away. */
export const tour: Tour = (({ P }) => [
   P(-40, YS[0], CT),
   P(SX, 4, docZ(2) + DZ),
   P(-40, YS[1], CT),
   null,
])(camera(frame));

export const mount: FigureMount = ({ stage, svg, read, frame: f }, value) => {
   const { C, P } = camera(f);
   const front = facing(C);
   const bag = disposer();
   let step = 60 + 100 * value;
   const g = mk("g", {}, svg);
   put(solid(g), slab(P, front, BOARD, inset(C, BOARD, 1.6), -PT, 0));
   // Links on the board, dashed, each with the line that grows over it.
   const scr = LINKS.map((l) => l.map(([x, y]) => P(x, y, 0)));
   const lines = scr.map((pts) => {
      mk("path", { d: open(pts), class: "nf lo dash" }, g);
      const el = mk("path", { class: "nf sil" }, g);
      return { el, tw: tween(0), d: -1, rev: false };
   });
   // The clients, numbered by dots; the server with its mark; the collection's tray.
   YS.forEach((y, i) => {
      put(solid(g), slab(P, front, client(y), inset(C, client(y), 1.4), 0, CT));
      for (let k = 0; k <= i; k++)
         place(flatDot(g, C, 1.1, "dot m"), P(-40, y + (k - i / 2) * 4, CT));
   });
   put(solid(g), slab(P, front, disc(HUB), inset(C, disc(HUB), 1.2), 0, HZ));
   const mark = mk(
      "path",
      { d: poly(ringAt(P, disc(3.4), HZ)), class: "nf hi" },
      g,
   );
   put(solid(g), slab(P, front, TRAY, inset(C, TRAY, 1.2), 0, 2));
   // The documents, bottom to top, and the next one, waiting above the stack.
   const docs = [...AUTHORS, -1].map((a, k) => {
      const el = solid(g);
      const dots = [0, 1].map(() => flatDot(el.g, C, 0.95, "dot m"));
      return {
         a,
         el,
         dots,
         s: tween(0),
         l: tween(0),
         z: tween(k < N ? 0 : 1),
         d: "-",
      };
   });

   const B = register(stage, (_dt, t) => {
      let moving = false;
      lines.forEach((ln, i) => {
         const k = tval(ln.tw, t);
         moving ||= !tdone(ln.tw, t);
         if (k === ln.d) return;
         ln.d = k;
         const pts = ln.rev ? scr[i].toReversed() : scr[i];
         const u = k * (pts.length - 1);
         const n = Math.min(pts.length - 1, Math.floor(u) + 1);
         const [a, b] = [pts[n - 1], pts[n]];
         const end: Vec2 = [
            lerp(a[0], b[0], u - n + 1),
            lerp(a[1], b[1], u - n + 1),
         ];
         ln.el.setAttribute(
            "d",
            k > 0.01 ? open([...pts.slice(0, n), end]) : "",
         );
      });
      docs.forEach((dc, k) => {
         const [s, l, drop] = [tval(dc.s, t), tval(dc.l, t), tval(dc.z, t)];
         moving ||= !tdone(dc.s, t) || !tdone(dc.l, t) || !tdone(dc.z, t);
         const z = docZ(k) + l * 2.4 + drop * 10;
         const d = dc.a < 0 || drop > 0.95 ? "" : `${s} ${z} ${dc.a}`;
         if (d === dc.d) return;
         dc.d = d;
         const x = SX - s * SLIDE + (k % 2 ? 0.8 : -0.8);
         const ring = rrect(x - 13, -11, x + 13, 11, 3.4, 6);
         put(
            dc.el,
            d ? slab(P, front, ring, null, z, z + DZ) : { sil: "", crease: "" },
         );
         dc.dots.forEach((e, j) => {
            e.setAttribute("display", d && j <= dc.a ? "inline" : "none");
            place(e, P(x + 8, -7 + j * 3.4, z + DZ));
         });
      });
      return moving;
   });
   bag.add(B.unregister);

   let act = "";
   /** "c0"/"c1": that client stores; "d<k>": document k is recalled; "": rest. */
   function choose(a: string) {
      if (a === act) return;
      act = a;
      const t = now();
      const k = a[0] === "d" ? Number(a.slice(1)) : -1;
      const by = a[0] === "c" ? Number(a[1]) : -1;
      const to = k >= 0 ? 1 - docs[k].a : by;
      // A store runs client link then server link; a recall runs them back.
      lines.forEach((ln, i) => {
         const on = i === to || (i === 2 && to >= 0);
         if (on && ln.d <= 0) ln.rev = k >= 0;
         const hop = (i === 2) === by >= 0 ? 1 : 0;
         tset(ln.tw, on ? 1 : 0, t, on ? hop * step : 0);
      });
      const top = docs[N];
      if (by >= 0) top.a = by;
      tset(top.z, by >= 0 ? 0 : 1, t, by >= 0 ? 2 * step : 0);
      docs.forEach((dc, j) => {
         tset(dc.s, j === k ? 1 : 0, t, 0);
         tset(dc.l, k >= 0 && j > k ? 1 : 0, t, Math.abs(j - k) * step * 0.5);
         dc.el.sil.classList.toggle("hi", j === k || (j === N && by >= 0));
      });
      mark.setAttribute("class", a ? "nf lo" : "nf hi");
      read.textContent =
         by >= 0 ? "store" : k >= 0 ? `search ${N - k}` : "rest";
      B.wake();
   }

   /** Documents on each one's own rest lid, the top one first; then the clients' lids. */
   const hit = (p: Vec2): string => {
      for (let k = N - 1; k >= 0; k--) {
         const [x, y] = unproj(C, p[0], p[1], docZ(k) + DZ);
         if (Math.abs(x - SX) < 13 && Math.abs(y) < 11) return `d${k}`;
      }
      const [x, y] = unproj(C, p[0], p[1], CT);
      const i = YS.findIndex((cy) => Math.abs(y - cy) < 9);
      return x > -51 && x < -29 && i >= 0 ? `c${i}` : "";
   };
   const leave = () => choose("");
   bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave }));
   bag.add(() => svg.replaceChildren());
   return { set: (v) => void (step = 60 + 100 * v), destroy: bag.dispose };
};
