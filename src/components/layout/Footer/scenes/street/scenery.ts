/* The parts of the street that stand still: the painting and its lights,
   the near pavement, the lanes the crowd walks in, the rail, the kerb, the
   stairwells, him, and the freeze brackets with their stamp. Ported from
   build() and painting() in the footer lab's rush-hour-night/street.js. */

import type { MemberFrames, Pose } from "../cast/art";
import { svgEl } from "./people";
import { ART, BW, type LaneId, type Layout, TONE, type Tone } from "./score";

/** His poses on the street. */
export const ME_POSES = [
   "idle",
   "wink",
   "wave",
   "sit",
   "sleep",
] as const satisfies readonly Pose[];
export type MePose = (typeof ME_POSES)[number];

/** His body centre in a frame, as a fraction of its width (px 177 of 372). */
const BODY_X = 177 / 372;
/** px of the top edge of the scene that fade into the page. */
const FADE = 84;

const div = (className: string, style: Partial<CSSStyleDeclaration> = {}) => {
   const el = document.createElement("div");
   el.className = className;
   Object.assign(el.style, style);
   return el;
};
const bit = (className = "", style: Partial<CSSStyleDeclaration> = {}) => {
   const el = document.createElement("i");
   if (className) el.className = className;
   Object.assign(el.style, style);
   return el;
};
const px = (v: number): string => `${v.toFixed(1)}px`;

/** The custom properties a strip reads its body tones from. */
export const setTone = (el: HTMLElement, tone: Tone): void => {
   el.style.setProperty("--st-wf", tone.fill);
   el.style.setProperty("--st-wb", tone.back);
   el.style.setProperty("--st-wc", tone.cut);
};

/* The painted street, tiled with its own mirror image at the scale of the
   layout: tile k spans [base + k w, base + (k + 1) w], plain when k is even,
   mirrored when odd, so every seam joins an edge to its own reflection. The
   painted road goes on below the painting as a flat band in its own
   bottom-row colour. One flat dark layer seats it in the page; its top edge
   fades into the page. A few of its lit windows glow and dim on slow,
   different periods. */
function painting(L: Layout, W: number): HTMLElement {
   const A = L.art;
   const w = A.P * ART.ratio;
   const c = W / 2;
   const base = c - A.cx * w;
   const k0 = Math.floor(-base / w);
   const k1 = Math.ceil((W - base) / w);
   // the stage top in the box of the painting
   const cut = Math.max(0, -A.top);
   const fade = `linear-gradient(180deg, transparent ${cut}px, #000 ${cut + FADE}px)`;
   const art = div("st-art", {
      top: `${A.top}px`,
      height: `${L.pave[0] - A.top}px`, // the painting and the road below it
      maskImage: fade,
   });
   for (let k = k0; k < k1; k++)
      art.append(
         bit(k % 2 ? "st-tile st-flip" : "st-tile", {
            left: px(base + k * w),
            width: px(w),
            height: `${A.P}px`,
         }),
      );
   art.append(bit("st-road-on", { top: `${A.P}px` }), bit("st-shade"));
   // the lights: the measured spots of the painting, wherever a tile shows
   // them, clear of him and of the top fade; at most five, spread out
   const clear = L.phone ? 60 : 110; // his head and shoulders cover nearer spots
   const spots: { x: number; y: number }[] = [];
   for (let k = k0; k < k1; k++)
      for (const s of ART.lights) {
         const x = base + (k + (k % 2 ? 1 - s.x : s.x)) * w;
         const y = s.y * A.P; // in the art box
         if (
            x < 24 ||
            x > W - 24 ||
            Math.abs(x - c) < clear ||
            y + A.top < FADE * 0.7
         )
            continue;
         spots.push({ x, y });
      }
   spots.sort((a, b) => a.x - b.x);
   const PERIODS = [11, 7.5, 13, 9, 15.5];
   const OFFSETS = [0.3, 0.7, 0.1, 0.5, 0.85];
   let lastX = -Infinity;
   let lit = 0;
   for (const s of spots) {
      if (lit >= PERIODS.length) break;
      if (s.x - lastX <= W / 7) continue;
      lastX = s.x;
      const period = PERIODS[lit] ?? 11;
      // an ellipse the size of the lit middle of a shop window
      const glow = bit("st-glow", {
         left: px(s.x),
         top: px(s.y),
         width: px(0.34 * A.P),
         height: px(0.24 * A.P),
      });
      glow.style.setProperty("--st-p", `${period}s`);
      glow.style.setProperty(
         "--st-d",
         `${(-period * (OFFSETS[lit] ?? 0)).toFixed(2)}s`,
      );
      art.append(glow);
      lit++;
   }
   return art;
}

/* The stairwell the wide layout's near walkers go down (and come up): an
   opening in the kerb face on each side of him, with steps going down
   towards him. Flat pieces: a lip in the slab tone of the pavement, treads
   a step lighter than the risers with a 1 px nosing, and a handrail along
   the open side in the colours of the rail, its top post on the pavement.
   It sits above the near lane, so a walker on the stairs is cut by the lip
   (and passes behind the handrail) instead of sinking into the bottom edge
   of the scene. */
function stairwells(L: Layout, W: number): HTMLElement[] {
   const stairs = L.lanes.near.stairs;
   if (!stairs) return [];
   const c = W / 2;
   const squeeze = Math.min(1, W / 1280);
   const w = stairs.run * squeeze;
   const h = L.band - L.K;
   const n = 4;
   const R = 20; // headroom above the kerb line for the top post of the handrail
   const f = (v: number): string => v.toFixed(1);
   const rise = h / n;
   const run = w / n;
   // the solid steps, outer top to inner bottom: riser, tread, riser, ...
   let prof = "";
   for (let k = 0; k < n; k++)
      prof += `V${f(R + (k + 1) * rise)}H${f((k + 1) * run)}`;
   let treads = "";
   let nosings = "";
   for (let k = 0; k < n - 1; k++) {
      const y = R + (k + 1) * rise;
      treads += `M${f(k * run)} ${f(y)}h${f(run)}v3h${f(-run)}Z`;
      nosings += `M${f(k * run)} ${f(y + 0.5)}h${f(run - 0.5)}`;
   }
   // the handrail: parallel to the nosings, 15 px above them
   const x0 = 5;
   const x1 = w - 9;
   const y0 = R - 15;
   const y1 = y0 + ((x1 - x0) * h) / w;
   const rail = `M${f(x0)} ${f(R)}V${f(y0)}L${f(x1)} ${f(y1)}V${f(R + h)}`;
   const hair = "rgba(255,255,255,";
   return ([-1, 1] as const).map((side) => {
      const well = bit("st-stairwell", {
         left: px(
            side < 0
               ? c - (stairs.clear + stairs.run) * squeeze
               : c + stairs.clear * squeeze,
         ),
         top: `${L.K - R}px`,
         width: px(w),
         height: px(h + R),
      });
      // drawn for the left side; the right side is its mirror
      const svg = svgEl("svg", {
         width: f(w),
         height: f(h + R),
         viewBox: `0 0 ${f(w)} ${f(h + R)}`,
         "aria-hidden": "true",
         focusable: "false",
      });
      if (side > 0) svg.style.transform = "scaleX(-1)";
      svg.append(
         svgEl("rect", { y: R, width: f(w), height: f(h), fill: "#06080a" }),
         svgEl("path", { d: `M0 ${R}${prof}H0Z`, fill: "#141c20" }),
         svgEl("path", { d: treads, fill: "#1f292e" }),
         svgEl("path", {
            d: nosings,
            stroke: `${hair}0.10)`,
            "stroke-width": 1,
            fill: "none",
         }),
         svgEl("rect", { y: R, width: f(w), height: 4, fill: "#1b2226" }),
         svgEl("path", {
            d: `M0 ${R + 0.5}H${f(w)}`,
            stroke: `${hair}0.16)`,
            "stroke-width": 1,
         }),
         svgEl("path", {
            d: rail,
            fill: "none",
            stroke: `${hair}0.12)`,
            "stroke-width": 5,
            "stroke-linejoin": "round",
         }),
         svgEl("path", {
            d: rail,
            fill: "none",
            stroke: "#172024",
            "stroke-width": 3,
            "stroke-linejoin": "round",
         }),
      );
      well.append(svg);
      return well;
   });
}

export interface Scenery {
   lanes: Record<LaneId, HTMLElement>;
   kerb: HTMLElement;
   /** Layers of him, outside in: the entrance, his breath, his pose. */
   me: { inner: HTMLElement; breath: HTMLElement; pose: HTMLElement };
   cuts: Partial<Record<MePose, HTMLElement>>;
   brackets: HTMLElement;
   stamp: HTMLElement;
   /** The box of the button over him, in scene px. */
   hit: { left: number; top: number; width: number; height: number };
   /** How far a sitting cut travels between his standing hip and the rail. */
   hipDrop: number;
}

/** Fills `street` with the scenery of layout L at width W. `frames` are his
    frames at the height of the layout (memberFrames). */
export function buildScenery(
   street: HTMLElement,
   L: Layout,
   W: number,
   frames: MemberFrames,
): Scenery {
   const c = W / 2;
   const { K, G, H } = L;
   const lane = (id: LaneId): HTMLElement => {
      const el = div(`st-lane st-lane-${id}`);
      // each lane carries the tones of its depth
      setTone(el, TONE[id]);
      return el;
   };
   const lanes: Record<LaneId, HTMLElement> = {
      far: lane("far"),
      road: lane("road"),
      mid: lane("mid"),
      near: lane("near"),
   };
   // the far tone is also what a walker in his frame steps back to in the
   // freeze (st-soft)
   street.style.setProperty("--st-sf", TONE.far.fill);
   street.style.setProperty("--st-sb", TONE.far.back);
   street.style.setProperty("--st-sc", TONE.far.cut);

   // a short kerbside rail behind him (he sits on it when the street empties)
   const rail = div("st-rail", {
      left: `${c - L.rail.half}px`,
      width: `${2 * L.rail.half}px`,
      top: `${L.rail.top}px`,
      height: `${G - L.rail.top + 2}px`,
   });
   rail.append(bit(), bit(), bit(), bit());

   // the kerb: the line he stands on and its painted face
   const kerb = bit("st-kerb", { top: `${K}px`, height: `${L.band - K}px` });

   // him: the only colour on the street
   const bodyX = BODY_X * frames.width;
   const origin = `${bodyX.toFixed(1)}px ${G}px`;
   const meEl = div("st-me", {
      left: px(c - bodyX),
      width: `${frames.width}px`,
      height: `${L.band}px`,
   });
   const inner = div("st-me-in", { transformOrigin: origin });
   const breath = div("st-me-breath", { transformOrigin: origin });
   const pose = div("st-me-pose", { transformOrigin: origin });
   const cuts: Partial<Record<MePose, HTMLElement>> = {};
   const seat = frames.ground.sit ?? 0.584;
   for (const name of ME_POSES) {
      const at = frames.order.indexOf(name);
      if (at < 0) continue;
      const seated = name === "sit" || name === "sleep";
      const row = frames.ground[name] ?? (seated ? seat : 1);
      const cut = div("st-cut", {
         top: px((seated ? L.rail.top : G) - row * H),
         width: `${frames.width}px`,
         height: `${frames.height}px`,
         backgroundImage: `url("${frames.src}")`,
         backgroundSize: `${frames.width * frames.order.length}px ${frames.height}px`,
         backgroundPosition: `${-at * frames.width}px 0`,
      });
      cuts[name] = cut;
      pose.append(cut);
   }
   breath.append(pose);
   inner.append(breath);
   meEl.append(inner);

   // focus brackets and the photo stamp (the freeze)
   const bTop = G - H - (L.phone ? 10 : 12);
   const bBottom = G + (L.phone ? 6 : 8);
   const brackets = div("st-brackets", {
      left: `${c - BW}px`,
      top: `${bTop}px`,
      width: `${2 * BW}px`,
      height: `${bBottom - bTop}px`,
   });
   brackets.append(bit(), bit(), bit(), bit());
   const stamp = document.createElement("span");
   stamp.className = "st-stamp";
   // narrow: centred above the brackets; wide: beside the top right corner
   Object.assign(
      stamp.style,
      L.phone
         ? { left: `${c}px`, top: `${bTop - 18}px`, translate: "-50% 0" }
         : { left: `${c + BW + 10}px`, top: `${bTop + 1}px` },
   );

   street.replaceChildren(
      painting(L, W),
      bit("st-pave", {
         top: `${L.pave[0]}px`,
         height: `${L.pave[1] - L.pave[0]}px`,
      }),
      lanes.far,
      lanes.road,
      lanes.mid,
      rail,
      kerb,
      meEl,
      brackets,
      stamp,
      lanes.near,
      ...stairwells(L, W),
   );
   const s = H / 500;
   return {
      lanes,
      kerb,
      me: { inner, breath, pose },
      cuts,
      brackets,
      stamp,
      hit: { left: c - 100 * s, top: G - H, width: 200 * s, height: H },
      hipDrop: G - seat * H - L.rail.top,
   };
}
