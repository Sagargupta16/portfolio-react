import type { CSSProperties } from "react";
import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Shell,
   Trace,
   Wire,
} from "./kit/primitives";
import {
   GRID,
   INK,
   NON_SCALING,
   W10,
   W16,
   W25,
   W40,
   W55,
   clock,
   comet,
   label,
   line,
   lit,
   loopProps,
   pctX,
   pctY,
   ride,
   route,
   shown,
} from "./kit/sceneTokens";
import type { Pt, Stop, TintProps } from "./kit/sceneTokens";

/*
 * orrery: a short diagram.yaml (groups, nodes, edges) is read top to bottom,
 * handed to the ELK layout, and comes out as a diagram drawn to the AWS deck:
 * a solid cloud boundary with its corner tile, a dashed region inside it,
 * icon tiles and right-angle edges with open arrowheads.
 * 1. The spec is parsed row by row.
 * 2. ELK lays it out: the boundaries light, then the icon tiles.
 * 3. Animated by default: a packet travels each numbered edge in step order
 *    (users, API, function, table), and each step badge lights as its packet
 *    leaves. The unnumbered API to queue edge runs on its own clock.
 * One 6 s loop, 11 animated nodes, all of it fading out together.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

/* spec panel, left */
const SPEC_X = 26;
const SPEC_W = 74;
const SPEC_RIGHT = SPEC_X + SPEC_W;
const SCAN_TOP = 43;
const SCAN_RUN = 89;

type RowKind = "key" | "item";

/* [row centre, kind, value bar width] in the order the spec reads */
const ROWS: [number, RowKind, number][] = [
   [48, "key", 0],
   [57, "item", 30],
   [66, "item", 24],
   [77, "key", 0],
   [86, "item", 22],
   [95, "item", 34],
   [104, "item", 28],
   [115, "key", 0],
   [124, "item", 32],
   [133, "item", 26],
];

/* AWS groups: the cloud boundary holds a dashed region */
const LANE_Y = 44;
const CLOUD = { x: 140, y: 20, w: 154, h: 126 };
const REGION = { x: 158, y: 48, w: 130, h: 92 };
const CORNER = 11;

/* icon tile centres */
const TILE = 18;
const USERS: Pt = [124, 100];
const API: Pt = [182, 100];
const FN: Pt = [226, 74];
const TABLE: Pt = [268, 74];
const QUEUE: Pt = [226, 124];
const ELBOW_X = 204;
const TILES = [USERS, API, FN, TABLE, QUEUE];

/* numbered edges, one route: users -> api -> fn -> table */
const STEPPED = route(
   line(USERS, API),
   line(API, [ELBOW_X, API[1]]),
   line([ELBOW_X, API[1]], [ELBOW_X, FN[1]]),
   line([ELBOW_X, FN[1]], FN),
   line(FN, TABLE),
);
const AT_API = STEPPED.ends[0];
const AT_FN = STEPPED.ends[3];
const STEP_STOPS: Stop[] = [
   [0.42, 0],
   [0.5, AT_API],
   [0.54, AT_API],
   [0.64, AT_FN],
   [0.68, AT_FN],
   [0.76, 1],
];

/* the unnumbered edge loops on its own, staggered off the story */
const FREE = route(
   line(API, [API[0], QUEUE[1]]),
   line([API[0], QUEUE[1]], QUEUE),
);
const FREE_STOPS: Stop[] = [
   [0.58, 0],
   [0.7, 1],
];

const STEPPED_WIRE = `M${USERS[0]},${USERS[1]} H${ELBOW_X} V${FN[1]} H${TABLE[0]}`;
const FREE_WIRE = `M${API[0]},${API[1]} V${QUEUE[1]} H${QUEUE[0]}`;
const ELK_WIRE = `M${SPEC_RIGHT},${LANE_Y} H${CLOUD.x}`;

/* open arrowhead on a tile's left edge */
const arrowAt = ([x, y]: Pt) => {
   const tip = x - TILE / 2;
   return `M${tip - 4},${y - 3} L${tip},${y} L${tip - 4},${y + 3}`;
};
const ARROWS = [API, FN, TABLE, QUEUE].map(arrowAt);

interface Step {
   n: string;
   at: Pt;
   /* when its packet leaves */
   on: number;
}

const STEPS: Step[] = [
   { n: "1", at: [149, 90], on: STEP_STOPS[0][0] },
   { n: "2", at: [196, 84], on: STEP_STOPS[2][0] },
   { n: "3", at: [247, 64], on: STEP_STOPS[4][0] },
];

/* ---------------- timeline ---------------- */

const SCAN = beat({
   times: [0, 0.03, 0.05, 0.17, 0.19, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   y: [0, 0, 0, SCAN_RUN, SCAN_RUN, 0],
});
const TO_ELK = beat(
   lit(
      [
         [0.17, 0],
         [0.25, 1],
      ],
      HOLD,
   ),
);
const GROUPS_LIT = beat(shown(0.24, GONE));
const TILES_LIT = beat(shown(0.3, GONE));
const ROUTE_LIT = beat(lit(STEP_STOPS, HOLD));
const TRAIL = beat(comet(STEP_STOPS, 0.12));
const PACKET = beat(ride(STEPPED, STEP_STOPS));
const FREE_PACKET = beat(ride(FREE, FREE_STOPS));

const badgeKeys = (on: number) =>
   beat({
      times: [0, on, on + 0.03, on + 0.06, HOLD, GONE, 1],
      opacity: [0, 0, 1, 1, 1, 0, 0],
      scale: [0.4, 0.4, 1.3, 1, 1, 1, 0.4],
   });

/* ---------------- spec ---------------- */

const SpecRow = ({
   tint,
   y,
   kind,
   width,
}: TintProps & { y: number; kind: RowKind; width: number }) => {
   if (kind === "key") {
      return <Bar box={[SPEC_X + 7, y - 1.75, 22, 3.5]} fill={`${tint}99`} />;
   }
   return (
      <>
         <Bar box={[SPEC_X + 13, y - 1.5, 12, 3]} fill={W25} />
         <Bar box={[SPEC_X + 29, y - 1.5, width, 3]} fill={W10} />
      </>
   );
};

const Spec = ({ tint }: TintProps) => (
   <>
      <Panel box={[SPEC_X, 20, SPEC_W, 122]} rx={8} />
      <Wire d={`M${SPEC_X},38 H${SPEC_RIGHT}`} />
      {ROWS.map(([y, kind, width]) => (
         <SpecRow key={y} tint={tint} y={y} kind={kind} width={width} />
      ))}
      <motion.g {...loopProps(SCAN)}>
         <rect
            x={SPEC_X + 1}
            y={SCAN_TOP}
            width={SPEC_W - 2}
            height={10}
            fill={`${tint}14`}
         />
         <Wire
            d={`M${SPEC_X + 1},${SCAN_TOP} H${SPEC_RIGHT - 1}`}
            stroke={`${tint}80`}
         />
      </motion.g>
      <Wire d={ELK_WIRE} />
      <Trace d={ELK_WIRE} color={`${tint}99`} width={1.2} loop={TO_ELK} />
   </>
);

/* ---------------- groups ---------------- */

const DASH = "3 3";

const Groups = ({ tint }: TintProps) => (
   <>
      <Panel box={[CLOUD.x, CLOUD.y, CLOUD.w, CLOUD.h]} rx={2} stroke={W16} />
      <Bar box={[CLOUD.x, CLOUD.y, CORNER, CORNER]} fill={W16} />
      <rect
         x={REGION.x}
         y={REGION.y}
         width={REGION.w}
         height={REGION.h}
         fill="none"
         stroke={W16}
         strokeDasharray={DASH}
         vectorEffect={NON_SCALING}
      />
      <motion.g {...loopProps(GROUPS_LIT)}>
         <Panel
            box={[CLOUD.x, CLOUD.y, CLOUD.w, CLOUD.h]}
            rx={2}
            fill={`${tint}08`}
            stroke={`${tint}99`}
         />
         <rect
            x={CLOUD.x}
            y={CLOUD.y}
            width={CORNER}
            height={CORNER}
            fill={tint}
         />
         <rect
            x={REGION.x}
            y={REGION.y}
            width={REGION.w}
            height={REGION.h}
            fill={`${tint}0a`}
            stroke={`${tint}80`}
            strokeDasharray={DASH}
            vectorEffect={NON_SCALING}
         />
      </motion.g>
   </>
);

/* ---------------- edges and tiles ---------------- */

const Edges = ({ tint }: TintProps) => (
   <>
      <Wire d={STEPPED_WIRE} stroke={W25} />
      <Wire d={FREE_WIRE} stroke={W25} />
      {ARROWS.map((d) => (
         <Wire key={d} d={d} stroke={W40} />
      ))}
      <Trace d={STEPPED.d} color={`${tint}80`} width={1.2} loop={ROUTE_LIT} />
      <Trace d={STEPPED.d} color={`${tint}99`} width={2.4} loop={TRAIL} />
   </>
);

const tileBox = ([x, y]: Pt) => ({
   x: x - TILE / 2,
   y: y - TILE / 2,
   width: TILE,
   height: TILE,
   rx: 3,
});

/* service glyphs: person, API chevrons, lambda, table cylinder, queue */
const glyphs = (): string[] => {
   const [ux, uy] = USERS;
   const [ax, ay] = API;
   const [fx, fy] = FN;
   const [tx, ty] = TABLE;
   const [qx, qy] = QUEUE;
   return [
      `M${ux - 5},${uy + 5} Q${ux},${uy - 2} ${ux + 5},${uy + 5}`,
      `M${ax - 2},${ay - 4} L${ax - 5},${ay} L${ax - 2},${ay + 4} M${ax + 2},${ay - 4} L${ax + 5},${ay} L${ax + 2},${ay + 4}`,
      `M${fx - 4},${fy - 5} H${fx - 2} L${fx + 4},${fy + 5} M${fx - 0.5},${fy - 1} L${fx - 4},${fy + 5}`,
      `M${tx - 5},${ty - 3} V${ty + 3} A5,1.8 0 0 0 ${tx + 5},${ty + 3} V${ty - 3} M${tx - 5},${ty} A5,1.8 0 0 0 ${tx + 5},${ty}`,
      `M${qx - 5},${qy - 3} H${qx + 5} M${qx - 5},${qy} H${qx + 5} M${qx - 5},${qy + 3} H${qx + 5}`,
   ];
};
const GLYPHS = glyphs();

const Tiles = ({ tint }: TintProps) => (
   <>
      {TILES.map((p) => (
         <rect
            key={p[0] * 1000 + p[1]}
            {...tileBox(p)}
            fill={INK}
            stroke={W16}
            vectorEffect={NON_SCALING}
         />
      ))}
      <motion.g {...loopProps(TILES_LIT)}>
         {TILES.map((p) => (
            <rect
               key={p[0] * 1000 + p[1]}
               {...tileBox(p)}
               fill={`${tint}26`}
               stroke={`${tint}a6`}
               vectorEffect={NON_SCALING}
            />
         ))}
      </motion.g>
      <circle
         cx={USERS[0]}
         cy={USERS[1] - 2.5}
         r={2.4}
         fill="none"
         stroke={W55}
         vectorEffect={NON_SCALING}
      />
      <ellipse
         cx={TABLE[0]}
         cy={TABLE[1] - 3}
         rx={5}
         ry={1.8}
         fill="none"
         stroke={W55}
         vectorEffect={NON_SCALING}
      />
      {GLYPHS.map((d) => (
         <Wire key={d} d={d} stroke={W55} />
      ))}
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Spec tint={tint} />
      <Groups tint={tint} />
      <Edges tint={tint} />
      <Tiles tint={tint} />
   </>
);

/* ---------------- step badges and the ELK chip ---------------- */

const BADGE = 11;

const badgeStyle = (
   [x, y]: Pt,
   fill: string,
   color: string,
): CSSProperties => ({
   ...label,
   left: pctX(x),
   top: pctY(y),
   width: BADGE,
   height: BADGE,
   marginLeft: -BADGE / 2,
   marginTop: -BADGE / 2,
   display: "grid",
   placeItems: "center",
   borderRadius: "50%",
   fontSize: 7,
   letterSpacing: 0,
   background: fill,
   color,
});

const StepBadge = ({ tint, step }: TintProps & { step: Step }) => (
   <>
      <span
         style={{
            ...badgeStyle(step.at, INK, W40),
            border: `1px solid ${W16}`,
         }}
      >
         {step.n}
      </span>
      <motion.span
         style={badgeStyle(step.at, tint, INK)}
         {...loopProps(badgeKeys(step.on))}
      >
         {step.n}
      </motion.span>
   </>
);

const elkChip = (tint: string): CSSProperties => ({
   ...label,
   left: pctX((SPEC_RIGHT + CLOUD.x) / 2),
   top: pctY(LANE_Y),
   transform: "translate(-50%, -50%)",
   padding: "2px 4px",
   borderRadius: 3,
   border: `1px solid ${tint}80`,
   background: INK,
   color: tint,
});

export default function DiagramScene({ tint }: Readonly<TintProps>) {
   return (
      <Shell
         tint={tint}
         focus="68% 45%"
         texture={GRID}
         stage={<Stage tint={tint} />}
      >
         <Label at={[SPEC_X + 6, 29]} color={`${tint}b3`}>
            DIAGRAM.YAML
         </Label>
         <span style={elkChip(tint)}>ELK</span>
         <Label at={[REGION.x + 6, REGION.y + 7]} color={W55}>
            REGION
         </Label>
         <Packet color={tint} loop={FREE_PACKET} size={4} />
         <Packet color={tint} loop={PACKET} />
         {STEPS.map((s) => (
            <StepBadge key={s.n} tint={tint} step={s} />
         ))}
      </Shell>
   );
}
