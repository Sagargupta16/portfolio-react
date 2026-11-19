/* The street's score, with no DOM in it (index.ts plays it). Ported from
   the footer lab's rush-hour-night/score.js.

   Every actor walks one path per loop of L seconds. A path is a list of
   waypoints { x, y, t }: x in px across the street, y in px down from its
   lane line (only the desktop near lane uses y: those walkers take the steps
   down beside him, so they never cross in front of him), t in seconds from
   the moment the actor steps in. */

export type LaneId = "far" | "road" | "mid" | "near";
export type Kind = "walker" | "cyclist" | "scooter" | "bus";
export type Dir = 1 | -1;
/** What a walker wears and carries (people.ts draws each one). */
export type Look =
   | "pack"
   | "headphones"
   | "tote"
   | "cup"
   | "umbrella"
   | "commuter"
   | "call"
   | "longhair"
   | "parent";

export interface Tone {
   fill: string;
   back: string;
   rim: string;
   edge: string;
   cut: string;
}

/* Tones by depth, for a lit night street: true silhouettes, near-black and
   larger toward the viewer, the far lane a step lighter so it sits back.
   `rim` is the cool light on their top edges (the shop light behind them),
   `edge` a fainter hairline all round so a figure never sinks into a dark
   part of the painting, `cut` the cut-paper breaks (sleeve hem, belt, cuff,
   strap gap). Scene art, matched by eye to the painting: not site tokens. */
export const TONE: Record<LaneId, Tone> = {
   far: {
      fill: "#1c252b",
      back: "#161e23",
      rim: "rgba(190,218,244,0.34)",
      edge: "rgba(190,218,244,0.1)",
      cut: "#11181c",
   },
   road: {
      fill: "#151d22",
      back: "#10171b",
      rim: "rgba(190,218,244,0.34)",
      edge: "rgba(190,218,244,0.1)",
      cut: "#06090b",
   },
   mid: {
      fill: "#0b1013",
      back: "#070a0c",
      rim: "rgba(190,218,244,0.4)",
      edge: "rgba(190,218,244,0.12)",
      cut: "#020304",
   },
   near: {
      fill: "#040607",
      back: "#080b0d",
      rim: "rgba(190,218,244,0.42)",
      edge: "rgba(190,218,244,0.12)",
      cut: "rgba(255,255,255,0.12)",
   },
};

/** s: one stride for every walker, so every footfall lands on the beat. */
export const STEP = 1;
/** Half width of the focus brackets around him. */
export const BW = 74;

/* The painting (the lab's art/scene/street.json): its aspect ratio, its
   measured lines as fractions of its height, and the spots of light worth a
   slow glow. Each layout places it with `art`: P its height in px, top its
   top edge in scene px, cx the point of the painting (0 to 1) that sits at
   the scene centre. It is tiled with its own mirror image (it has no
   lettering), the tile behind him plain. Desktop: cx 0.72 puts him in front
   of the bookshop by the planter, and the one seam a 1280 stage needs is its
   right edge, a plain pillar, 260 px to his right, so the street is not
   mirrored about him. Phone: one tile is wider than a phone stage, so cx
   0.54 (the pillar between the two lit bookshops) shows no seam at all.
   Every ground line below is read from these. */
export const ART = {
   ratio: 2560 / 1070,
   door_top: 0.55,
   shop_base: 0.805,
   far_pavement: 0.85,
   lights: [
      { x: 0.17, y: 0.62 },
      { x: 0.43, y: 0.62 },
      { x: 0.655, y: 0.62 },
      { x: 0.9, y: 0.6 },
      { x: 0.43, y: 0.2 },
      { x: 0.74, y: 0.2 },
      { x: 0.315, y: 0.6 },
   ],
} as const;

export interface ArtPlace {
   P: number;
   top: number;
   cx: number;
}

/** One entry of a layout's cast. It is placed by `x` (px from the centre at
    the still, on its path) or by `enter` (seconds after the still it steps
    in). */
export type Cue =
   | {
        lane: "far" | "mid" | "near";
        look: Look;
        dir: Dir;
        x?: number;
        enter?: number;
        /** She waves at him on the beat. */
        wave?: boolean;
        /** Desktop near lane: which stairwell (left -1, right 1). */
        side?: Dir;
     }
   | {
        lane: "road";
        kind: Exclude<Kind, "walker">;
        h: number;
        ground: number;
        dir: Dir;
        enter: number;
        /** Seconds to cross a 1280 px street. */
        cross: number;
     };

export interface Layout {
   phone: boolean;
   /** The height the lines below were composed for. */
   band: number;
   /** The kerb line. */
   K: number;
   /** His ground, just behind the kerb edge. */
   G: number;
   /** His height. */
   H: number;
   art: ArtPlace;
   /** The near pavement, top and bottom. */
   pave: readonly [number, number];
   rail: { top: number; half: number };
   /** Seconds in one loop of the score. */
   L: number;
   /** The composed moment: the Reduced still, where motion starts, and the
       beat where the passer-by waves and he waves back. */
   still: number;
   lanes: {
      far: { ground: number; h: number; speed: number };
      mid: { ground: number; h: number };
      near: {
         top: number;
         h: number;
         speed?: number;
         /** A fixed pace in px per second (their feet are cropped). */
         px?: number;
         stairs?: { clear: number; run: number };
      };
   };
   cast: readonly Cue[];
}

const at = (art: ArtPlace, f: number): number =>
   Math.round(art.top + f * art.P);
// a far walker is 0.8 of a shop door (door_top to shop_base)
const farH = (art: ArtPlace): number =>
   Math.round(0.8 * (ART.shop_base - ART.door_top) * art.P);

const ART_DESK: ArtPlace = { P: 390, top: -150, cx: 0.72 };
const ART_PHONE: ArtPlace = { P: 300, top: -116, cx: 0.54 };

const DESKTOP: Layout = {
   phone: false,
   band: 350,
   K: 296,
   G: 292,
   H: 250,
   art: ART_DESK,
   pave: [256, 296],
   rail: { top: 236, half: 140 },
   L: 15,
   still: 6,
   lanes: {
      // feet on the far pavement of the painting
      far: {
         ground: at(ART_DESK, ART.far_pavement),
         h: farH(ART_DESK),
         speed: 1.3,
      },
      mid: { ground: 278, h: 190 },
      // near: big and cropped; they take the steps down beside him (or come
      // up them)
      near: { top: 207, h: 300, speed: 0.75, stairs: { clear: 104, run: 150 } },
   },
   // entry beats chosen (by a search over the score) so his frame is clear
   // most of the loop, the crossings come in groups, nobody piles up on
   // anyone in the mid lane, and four or more walkers are always out
   cast: [
      // she waves at him on the beat
      { lane: "mid", look: "tote", dir: -1, x: 170, wave: true },
      { lane: "mid", look: "headphones", dir: -1, enter: 14.2 },
      { lane: "mid", look: "parent", dir: 1, enter: 14.6 },
      { lane: "far", look: "call", dir: 1, enter: 0.2 },
      { lane: "far", look: "longhair", dir: -1, enter: 13.6 },
      { lane: "far", look: "umbrella", dir: -1, enter: 1.9 },
      // near: one goes down the stairwell on the left, one comes up it on
      // the right
      { lane: "near", look: "commuter", dir: 1, side: -1, enter: 12.5 },
      { lane: "near", look: "cup", dir: 1, side: 1, enter: 9.5 },
      // the bus runs in the painted road, then an e-scooter, then the
      // cyclist nearest
      {
         lane: "road",
         kind: "bus",
         h: 150,
         ground: at(ART_DESK, 0.95),
         dir: -1,
         enter: 0.3,
         cross: 13,
      },
      {
         lane: "road",
         kind: "scooter",
         h: 132,
         ground: 233,
         dir: -1,
         enter: 13.1,
         cross: 8,
      },
      {
         lane: "road",
         kind: "cyclist",
         h: 134,
         ground: 246,
         dir: 1,
         enter: 13.1,
         cross: 9,
      },
   ],
};

const PHONE: Layout = {
   phone: true,
   band: 280,
   K: 238,
   G: 235,
   H: 190,
   art: ART_PHONE,
   pave: [198, 238],
   rail: { top: 194, half: 104 },
   L: 16,
   still: 4,
   lanes: {
      far: {
         ground: at(ART_PHONE, ART.far_pavement),
         h: farH(ART_PHONE),
         speed: 0.92,
      },
      mid: { ground: 224, h: 146 },
      // near: big, cropped, slow; heads stay below 0.2 H above his ground
      near: { top: 198, h: 230, px: 100 },
   },
   // entry beats chosen the same way, plus: no near pass in front of him
   // within 0.75 s of a mid pass behind him, and no vehicle more than 30%
   // cut off by an edge at the still
   cast: [
      // the composed moment: she waves beside him
      { lane: "mid", look: "tote", dir: -1, x: 140, wave: true },
      { lane: "mid", look: "headphones", dir: 1, enter: 9.0 },
      { lane: "mid", look: "parent", dir: 1, enter: 7.8 },
      { lane: "mid", look: "longhair", dir: -1, enter: 0.0 },
      { lane: "far", look: "longhair", dir: -1, enter: 7.2 },
      { lane: "far", look: "call", dir: -1, enter: 11.7 },
      { lane: "far", look: "umbrella", dir: 1, enter: 11.0 },
      { lane: "far", look: "pack", dir: -1, enter: 0.7 },
      { lane: "far", look: "tote", dir: -1, enter: 7.8 },
      { lane: "near", look: "commuter", dir: 1, enter: 3.7 },
      { lane: "near", look: "cup", dir: 1, enter: 4.5 },
      // big and cropped, leaving him at the still
      { lane: "near", look: "call", dir: -1, x: -165 },
      {
         lane: "road",
         kind: "bus",
         h: 100,
         ground: at(ART_PHONE, 0.96),
         dir: -1,
         enter: 8.2,
         cross: 7,
      },
   ],
};

/** The wide layout needs its whole band of height and this much width (the
    lab draft switched at the same width). */
const WIDE_FROM = 640;

// The layouts were composed in the lab for a 350 and a 280 px band, read up
// from the bottom edge. In a taller (or shorter) stage every line moves by
// the difference, so the kerb keeps its place at the bottom and the painting
// shows that much more of its shopfronts at the top.
const shift = (base: Layout, dy: number): Layout =>
   dy === 0
      ? base
      : {
           ...base,
           band: base.band + dy,
           K: base.K + dy,
           G: base.G + dy,
           art: { ...base.art, top: base.art.top + dy },
           pave: [base.pave[0] + dy, base.pave[1] + dy],
           rail: { ...base.rail, top: base.rail.top + dy },
           lanes: {
              far: { ...base.lanes.far, ground: base.lanes.far.ground + dy },
              mid: { ...base.lanes.mid, ground: base.lanes.mid.ground + dy },
              near: { ...base.lanes.near, top: base.lanes.near.top + dy },
           },
           cast: base.cast.map((cue) =>
              cue.lane === "road" ? { ...cue, ground: cue.ground + dy } : cue,
           ),
        };

/** The layout for a stage of this size, read from the stage itself: the
    wide one where it fits (the shell makes the stage 360 px tall at 768 px
    and wider), the narrow one in a shorter or narrower stage. */
export const layoutFor = (width: number, height: number): Layout => {
   const h = Math.round(height);
   const base = h >= DESKTOP.band && width >= WIDE_FROM ? DESKTOP : PHONE;
   return shift(base, h - base.band);
};

export const mod = (a: number, n: number): number => ((a % n) + n) % n;

/** What people.ts is asked to draw for one actor. */
export interface StripSpec {
   kind: Kind;
   /** Figure height in px (ground to head top). */
   h: number;
   look?: Look;
   tone: Tone;
   frames: number;
   /** Room above the head for a raised hand (both her strips share one
       box). */
   tall: boolean;
   /** Near lane: px of the figure that can ever show, measured from the
       head top (the rest is never painted). 0 paints all of it. */
   crop: number;
   /** The raised-hand version of a walker. */
   wave?: boolean;
}

/** What the score needs to know about a drawn strip. */
export interface StripBox {
   /** One frame's width and height in px. */
   fw: number;
   fh: number;
   frames: number;
   /** The ground line and the figure's ground point inside a frame. */
   groundY: number;
   hipX: number;
   /** Ground speed that keeps the planted foot still, in figure heights per
       stride (0 for vehicles). */
   speed: number;
}

export interface Waypoint {
   x: number;
   y: number;
   t: number;
}

export interface Planned<S extends StripBox> {
   lane: LaneId;
   kind: Kind;
   dir: Dir;
   wave: boolean;
   h: number;
   st: S;
   /** Her raised-hand strip. */
   st2: S | null;
   /** The lane line: where its ground point sits, in scene px. */
   ground: number;
   path: Waypoint[];
   /** Seconds on the street per loop. */
   travel: number;
   /** Seconds per turn of its strip. */
   cycle: number;
   /** Left foot or right foot on the beat. */
   phase: number;
   /** Score time it steps in. */
   enter: number;
}

const FRAMES: Record<Kind, number> = {
   walker: 12,
   cyclist: 12,
   scooter: 6,
   bus: 4,
};

function timeAtX(path: readonly Waypoint[], X: number): number {
   for (let k = 1; k < path.length; k++) {
      const p = path[k - 1];
      const q = path[k];
      if (!p || !q) continue;
      if ((X - p.x) * (X - q.x) <= 0 && p.x !== q.x)
         return p.t + ((q.t - p.t) * (X - p.x)) / (q.x - p.x);
   }
   return 0;
}

/** Builds every actor's path for layout L at street width W. strip(spec)
    draws one figure (people.ts). */
export function plan<S extends StripBox>(
   L: Layout,
   W: number,
   strip: (spec: StripSpec) => S,
): Planned<S>[] {
   const c = W / 2;
   const squeeze = Math.min(1, W / (L.phone ? 375 : 1280));
   return L.cast.map((cue, i) => {
      const road = cue.lane === "road";
      const kind: Kind = road ? cue.kind : "walker";
      const h = road ? cue.h : L.lanes[cue.lane].h;
      const near = cue.lane === "near";
      const crop = near ? L.band - L.lanes.near.top : 0;
      const wave = !road && cue.wave === true;
      const spec: StripSpec = {
         kind,
         h,
         look: road ? undefined : cue.look,
         tone: TONE[cue.lane],
         frames: FRAMES[kind],
         tall: wave,
         crop,
      };
      const st = strip(spec);
      const st2 = wave ? strip({ ...spec, wave: true }) : null;
      const ground = road
         ? cue.ground
         : cue.lane === "near"
           ? L.lanes.near.top + h * 0.995
           : L.lanes[cue.lane].ground;
      const margin = st.fw - st.hipX + 8;
      const edge = (s: number): number => (s < 0 ? -margin : W + margin);
      // the bus rocks on its springs, the rider gives at the knees
      const cycle = kind === "bus" || kind === "scooter" ? 0.6 : STEP;
      let v: number;
      if (road) v = (W + 2 * margin) / (cue.cross * (L.phone ? 1 : W / 1280));
      else if (near && L.lanes.near.px) v = L.lanes.near.px;
      else {
         const pace =
            cue.lane === "far"
               ? L.lanes.far.speed
               : near
                 ? (L.lanes.near.speed ?? 1)
                 : 1;
         v = ((st.speed * h) / STEP) * pace;
      }
      const stairs = L.lanes.near.stairs;
      let pts: [number, number][];
      if (near && stairs) {
         const s = cue.side ?? -1;
         const top: [number, number] = [
            c + s * (stairs.clear + stairs.run) * squeeze,
            0,
         ];
         const low: [number, number] = [
            c + s * stairs.clear * squeeze,
            crop + 14,
         ];
         const out: [number, number] = [edge(s), 0];
         pts = cue.dir === -s ? [out, top, low] : [low, top, out];
      } else
         pts =
            cue.dir > 0
               ? [
                    [edge(-1), 0],
                    [edge(1), 0],
                 ]
               : [
                    [edge(1), 0],
                    [edge(-1), 0],
                 ];
      let t = 0;
      let lastX = pts[0]?.[0] ?? 0;
      const path: Waypoint[] = pts.map(([x, y], k) => {
         if (k) t += Math.abs(x - lastX) / v;
         lastX = x;
         return { x, y, t };
      });
      // a pass longer than the loop is walked a little faster
      const fit = Math.min(1, (L.L - 0.5) / t);
      for (const p of path) p.t *= fit;
      const enter =
         !road && cue.x !== undefined
            ? L.still - timeAtX(path, c + cue.x * squeeze)
            : L.still + (cue.enter ?? 0);
      return {
         lane: cue.lane,
         kind,
         dir: cue.dir,
         wave,
         h,
         st,
         st2,
         ground,
         path,
         travel: t * fit,
         cycle,
         phase: (i % 2) * 0.5 * cycle,
         enter: mod(enter, L.L),
      };
   });
}

type Timed = Pick<Planned<StripBox>, "enter" | "path" | "travel">;

/** Where an actor is at score time t (s), and whether it is on the street. */
export function laneAt(
   L: Layout,
   a: Timed,
   t: number,
): { x: number; y: number; on: boolean } {
   const into = mod(t - a.enter, L.L);
   const last = a.path.at(-1) ?? { x: 0, y: 0, t: 0 };
   if (into >= a.travel) return { x: last.x, y: last.y, on: false };
   for (let k = 1; k < a.path.length; k++) {
      const p = a.path[k - 1];
      const q = a.path[k];
      if (!p || !q || into > q.t) continue;
      const u = (into - p.t) / (q.t - p.t || 1);
      return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, on: true };
   }
   return { x: last.x, y: last.y, on: false };
}

type Placed = Timed & Pick<Planned<StripBox>, "lane" | "kind" | "h" | "st">;

/** Does this actor stand in his frame at score time t? Near, mid and road
    actors count, and far walkers right behind his head. The reach is his
    body half width (0.3 H) plus the actor's own half width, so on desktop a
    mid walker must stay outside c +/- (BW + 24) and a near walker outside
    c +/- 130. */
export function clashes(L: Layout, a: Placed, t: number, c: number): boolean {
   const p = laneAt(L, a, t);
   if (!p.on) return false;
   // a far walker is small and high: it only counts when its head would
   // peek out from behind his head and shoulders
   if (a.lane === "far") return Math.abs(p.x - c) < 0.15 * L.H + 0.12 * a.h;
   // gone below the stairwell lip
   if (a.lane === "near" && L.lanes.near.top + p.y >= L.K) return false;
   const own =
      a.kind === "cyclist"
         ? 0.45
         : a.kind === "bus"
           ? 1.32
           : a.kind === "scooter"
             ? 0.35
             : a.lane === "near"
               ? 0.15
               : 0.12;
   const reach = 0.3 * L.H + own * a.h + (a.lane === "near" ? 10 : 0);
   return Math.abs(p.x - c) < reach;
}

/** How much of a vehicle is cut off by the side edges of the street at time
    t (0 to 1; walkers and off-stage actors count 0). A fragment of a bus at
    the edge reads as a stray blob, so the freeze treats more than 0.3 as a
    reject. */
export function clipped(L: Layout, a: Placed, t: number, W: number): number {
   if (a.kind === "walker") return 0;
   const p = laneAt(L, a, t);
   if (!p.on) return 0;
   const l = p.x - a.st.hipX;
   const r = l + a.st.fw;
   return Math.max(
      0,
      Math.min(1, (Math.max(0, -l) + Math.max(0, r - W)) / a.st.fw),
   );
}
