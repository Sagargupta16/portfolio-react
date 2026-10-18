import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { Panel, Shell } from "./kit/primitives";
import {
   DOTS,
   NON_SCALING,
   W03,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   label,
   loopProps,
   pctX,
   pctY,
} from "./kit/sceneTokens";
import type { Box, Keys, TintProps } from "./kit/sceneTokens";

/*
 * Kalchar: the /work gallery. A rail of style pills (Madhubani, Pichwai,
 * Lippan, Gond) sits over a masonry wall of museum plates, each with the
 * gold inset line and its tradition drawn in line work: a Madhubani fish
 * pair between kachni zigzag borders, a Pichwai lotus under a scalloped
 * arch, a Lippan mud-relief diamond set with mirrors, a Gond leaf filled
 * with dots over the bindu mark. The filter steps through the styles; the
 * active pill fills, its plates lift and the rest of the wall dims, and
 * the gold-leaf sheen crosses the featured Madhubani plate.
 * One 6 s loop, 9 animated nodes.
 */

const beat = clock(6);
const DIM = 0.28;
const LIFT = -2;
const RAMP = 0.04;

type Style = "madhubani" | "pichwai" | "lippan" | "gond";

/* filter order; each style holds the filter for a quarter of the loop */
const STYLES: Style[] = ["madhubani", "pichwai", "lippan", "gond"];
const PHASE = 1 / STYLES.length;

/*
 * Keyframes for one style: active through its quarter, crossfading with
 * the next at each boundary. The last style is active at t = 0, so the
 * frozen Reduced frame shows the Gond filter.
 */
const activeKeys = (k: number): { times: number[]; on: boolean[] } => {
   const start = k * PHASE;
   const end = start + PHASE;
   if (k === 0) {
      return {
         times: [0, RAMP, end, end + RAMP, 1],
         on: [false, true, true, false, false],
      };
   }
   if (k === STYLES.length - 1) {
      return {
         times: [0, RAMP, start, start + RAMP, 1],
         on: [true, false, false, true, true],
      };
   }
   return {
      times: [0, start, start + RAMP, end, end + RAMP, 1],
      on: [false, false, true, true, false, false],
   };
};

const plateLoop = (k: number) => {
   const { times, on } = activeKeys(k);
   const keys: Keys = {
      times,
      opacity: on.map((lit) => (lit ? 1 : DIM)),
      y: on.map((lit) => (lit ? LIFT : 0)),
   };
   return beat(keys);
};

const pillLoop = (k: number) => {
   const { times, on } = activeKeys(k);
   return beat({ times, opacity: on.map((lit) => (lit ? 1 : 0)) });
};

const PILLS: Record<Style, string> = {
   madhubani: "MADHUBANI",
   pichwai: "PICHWAI",
   lippan: "LIPPAN",
   gond: "GOND",
};

/* ---------- the wall ---------- */

const COL_X = [26, 94, 162, 230];
const COL_W = 62;
const TOP = 36;
const GAP = 6;
const ROW1_H = [74, 56, 66, 50];
const ROW2_H = 56;
const ROW1: Style[] = ["madhubani", "lippan", "pichwai", "gond"];
const ROW2: Style[] = ["gond", "madhubani", "lippan", "pichwai"];

interface Plate {
   art: Style;
   box: Box;
}

const PLATES: Plate[] = COL_X.flatMap((x, c) => [
   { art: ROW1[c], box: [x, TOP, COL_W, ROW1_H[c]] as const },
   {
      art: ROW2[c],
      box: [x, TOP + ROW1_H[c] + GAP, COL_W, ROW2_H] as const,
   },
]);

const FEATURED: Box = [COL_X[0], TOP, COL_W, ROW1_H[0]];

/* gold-leaf sheen: a slant band crossing the featured plate once */
const SHEEN_D = `M${FEATURED[0] + 16},${TOP} h7 l-16,${FEATURED[3]} h-7 Z`;
const SHEEN = beat({
   times: [0, 0.08, 0.22, 1],
   x: [-30, -30, COL_W + 12, COL_W + 12],
});

/* ---------- motifs, drawn in a 40 unit box round the origin ---------- */

interface InkProps {
   tint: string;
}

const lineInk = (stroke: string) => ({
   fill: "none",
   stroke,
   strokeWidth: 1,
   strokeLinecap: "round" as const,
   strokeLinejoin: "round" as const,
   vectorEffect: NON_SCALING,
});

/* kachni zigzag, a hatched band along one edge */
const ZIGZAG = Array.from({ length: 8 }, () => "l2,-2 l2,2").join(" ");
const zigzag = (y: number) => `M-16,${y} ${ZIGZAG}`;

const FISH_D =
   "M-14,0 Q-2,-8 8,0 Q-2,8 -14,0 Z M8,0 L14,-5 L14,5 Z M-4,-5 Q-1,0 -4,5 M1,-4 Q4,0 1,4";

const Fish = ({
   tint,
   dy,
   flip,
}: Readonly<InkProps & { dy: number; flip?: boolean }>) => (
   <g transform={`translate(0 ${dy})${flip ? " scale(-1 1)" : ""}`}>
      <path d={FISH_D} {...lineInk(`${tint}b3`)} />
      <circle cx={-9} cy={-1} r={1.2} fill={tint} />
   </g>
);

const Madhubani = ({ tint }: InkProps) => (
   <>
      <path d={`${zigzag(-18)} ${zigzag(18)}`} {...lineInk(W25)} />
      <Fish tint={tint} dy={-7} />
      <Fish tint={tint} dy={7} flip />
   </>
);

const LOTUS_D = [
   "M0,-9 Q5,-2 0,3 Q-5,-2 0,-9 Z",
   "M0,3 Q-10,0 -11,-5 Q-4,-5 0,3 Z",
   "M0,3 Q10,0 11,-5 Q4,-5 0,3 Z",
   "M-12,4 Q0,10 12,4",
].join(" ");
const ARCH_D =
   "M-16,-12 a4,4 0 0 1 8,0 a4,4 0 0 1 8,0 a4,4 0 0 1 8,0 a4,4 0 0 1 8,0";
const RIPPLE_D = "M-16,13 q4,-3 8,0 t8,0 t8,0 t8,0";

const Pichwai = ({ tint }: InkProps) => (
   <>
      <path d={ARCH_D} {...lineInk(W25)} />
      <path d={LOTUS_D} {...lineInk(`${tint}b3`)} />
      <path d={RIPPLE_D} {...lineInk(`${tint}66`)} />
   </>
);

const DIAMOND_D = "M0,-14 L14,0 L0,14 L-14,0 Z";
const AXES: [number, number][] = [
   [0, -14],
   [14, 0],
   [0, 14],
   [-14, 0],
];
const CORNERS: [number, number][] = [
   [-15, -15],
   [15, -15],
   [15, 15],
   [-15, 15],
];

const Lippan = ({ tint }: InkProps) => (
   <>
      <path d={DIAMOND_D} {...lineInk(`${tint}b3`)} />
      <circle r={6} {...lineInk(`${tint}80`)} />
      <circle r={2.2} fill={W40} />
      {AXES.map(([x, y]) => (
         <circle key={`${x},${y}`} cx={x} cy={y} r={1.6} fill={W40} />
      ))}
      {CORNERS.map(([x, y]) => (
         <g key={`${x},${y}`}>
            <circle cx={x} cy={y} r={2.6} {...lineInk(`${tint}66`)} />
            <circle cx={x} cy={y} r={0.9} fill={W25} />
         </g>
      ))}
   </>
);

const LEAF_D = "M0,-16 Q16,0 0,16 Q-16,0 0,-16 Z";

/* dot rows inside the leaf, inset from its outline at each height */
const GOND_DOTS: [number, number][] = [-9, -4, 1, 6, 11].flatMap((y) => {
   const t = (y + 16) / 32;
   const half = 32 * t * (1 - t);
   return [0.3, 0.62].flatMap((f): [number, number][] => [
      [half * f, y],
      [-half * f, y],
   ]);
});
const BINDU: [number, number][] = [
   [-6, 0.8],
   [0, 1.4],
   [6, 0.8],
];

const Gond = ({ tint }: InkProps) => (
   <>
      <path d={LEAF_D} {...lineInk(`${tint}b3`)} />
      <path d="M0,-13 V14" {...lineInk(W25)} strokeDasharray="1.5 2" />
      {GOND_DOTS.map(([x, y]) => (
         <circle key={`${x},${y}`} cx={x} cy={y} r={0.8} fill={`${tint}99`} />
      ))}
      {BINDU.map(([x, r]) => (
         <circle key={x} cx={x} cy={20} r={r} fill={W55} />
      ))}
   </>
);

const MOTIFS: Record<Style, (p: InkProps) => ReactNode> = {
   madhubani: Madhubani,
   pichwai: Pichwai,
   lippan: Lippan,
   gond: Gond,
};

/* A museum plate: hairline frame, gold inset line, its tradition inside. */
const PlateFrame = ({ tint, art, box }: Readonly<InkProps & Plate>) => {
   const [x, y, w, h] = box;
   const k = (Math.min(w, h) - 12) / 44;
   const Motif = MOTIFS[art];
   return (
      <>
         <Panel box={box} rx={4} fill={W03} stroke={W10} />
         <Panel
            box={[x + 3, y + 3, w - 6, h - 6]}
            rx={2.5}
            fill="none"
            stroke={`${tint}40`}
         />
         <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${k})`}>
            <Motif tint={tint} />
         </g>
      </>
   );
};

const Wall = ({ tint }: TintProps) => (
   <>
      {STYLES.map((art, k) => (
         <motion.g key={art} {...loopProps(plateLoop(k))}>
            {PLATES.filter((p) => p.art === art).map((p) => (
               <PlateFrame key={p.box[1]} tint={tint} {...p} />
            ))}
         </motion.g>
      ))}
   </>
);

const Sheen = ({ clipId }: Readonly<{ clipId: string }>) => (
   <>
      <defs>
         <clipPath id={clipId}>
            <rect
               x={FEATURED[0]}
               y={FEATURED[1]}
               width={FEATURED[2]}
               height={FEATURED[3]}
               rx={4}
            />
         </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
         <motion.path d={SHEEN_D} fill={W10} {...loopProps(SHEEN)} />
      </g>
   </>
);

/* ---------- the pill rail ---------- */

const rail: CSSProperties = {
   position: "absolute",
   left: pctX(26),
   top: pctY(14),
   display: "flex",
   gap: 4,
};

const chip = (color: string, border: string): CSSProperties => ({
   ...label,
   position: "relative",
   padding: "3px 6px",
   borderRadius: 999,
   border: `1px solid ${border}`,
   color,
});

const Pill = ({
   tint,
   art,
   k,
}: Readonly<InkProps & { art: Style; k: number }>) => (
   <span style={chip(W55, W16)}>
      {PILLS[art]}
      <motion.span
         style={{
            ...chip(W70, tint),
            position: "absolute",
            inset: -1,
            background: `${tint}33`,
         }}
         {...loopProps(pillLoop(k))}
      >
         {PILLS[art]}
      </motion.span>
   </span>
);

const GalleryScene = ({ tint }: Readonly<{ tint: string }>) => {
   const clipId = useId();
   return (
      <Shell
         tint={tint}
         focus="30% 45%"
         texture={DOTS}
         stage={
            <>
               <Wall tint={tint} />
               <Sheen clipId={clipId} />
            </>
         }
      >
         <div style={rail}>
            {STYLES.map((art, k) => (
               <Pill key={art} tint={tint} art={art} k={k} />
            ))}
         </div>
      </Shell>
   );
};

export default GalleryScene;
