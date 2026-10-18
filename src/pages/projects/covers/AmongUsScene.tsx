import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Shell, Wire } from "./kit/primitives";
import {
   RAILS,
   W03,
   W16,
   W25,
   W40,
   W55,
   clock,
   curveD,
   line,
   loopProps,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Box, Loop, Pt, Stop } from "./kit/sceneTokens";

/*
 * LeetCode Among Us: the roster in leetcoders_data.json is fetched in
 * batches through /leetcode/batch-user-data, which asks LeetCode GraphQL for
 * each profile. The leaderboard shows its loader until every batch is in,
 * then renders the table ranked by the Overview tab's totalSolved, with the
 * Mix bar (Easy, Medium, Hard) on every row and medals on the top three
 * places. Switching to Contests re-sorts by globalContestRating: the rows
 * trade places while the medals stay on positions one to three.
 * 1. Batch one is bracketed and rides through GraphQL; the loader fills half.
 * 2. Batch two follows; the loader completes and the table appears.
 * 3. The tab moves to Contests and the rows re-sort by rating.
 * One 6 s loop, 10 animated nodes.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

/* roster, left: six handles with their batch chip, fetched three at a time */
const ROSTER: Box = [26, 18, 70, 128];
const ROSTER_RIGHT = ROSTER[0] + ROSTER[2];
const HANDLES = [44, 60, 76, 92, 108, 124];
const HANDLE_W = [28, 22, 26, 20, 24, 18];
const BATCH_SHIFT = HANDLES[3] - HANDLES[0];
const BATCH_MID = [HANDLES[1], HANDLES[4]];

/* GraphQL tile, centre */
const GQL: Pt = [128, 80];
const GQL_R = 8;

/* leaderboard table, right */
const TABLE: Box = [160, 18, 134, 128];
const TABLE_RIGHT = TABLE[0] + TABLE[2];
const HEAD_Y = 36;
const TAB_X = [168, 224];
const SLOTS = [50, 68, 86, 104, 122];
const SLOT_STEP = SLOTS[1] - SLOTS[0];
const MIX_X = 214;
const RATING_X = 256;

interface Coder {
   name: number;
   /* Easy, Medium, Hard */
   mix: readonly [number, number, number];
   rating: number;
}

/* in Overview order (totalSolved, the Mix length, falls down the table) */
const CODERS: Coder[] = [
   { name: 26, mix: [14, 10, 6], rating: 18 },
   { name: 20, mix: [12, 9, 5], rating: 12 },
   { name: 24, mix: [10, 8, 4], rating: 26 },
   { name: 18, mix: [8, 7, 3], rating: 22 },
   { name: 22, mix: [6, 5, 3], rating: 8 },
];

/* the Contests tab ranks by rating: each coder's new slot */
const BY_RATING = CODERS.map((c, i) => ({ c, i }))
   .sort((a, b) => b.c.rating - a.c.rating)
   .map(({ i }) => i);
const contestSlot = (i: number) => BY_RATING.indexOf(i);

/* batch handles, into GraphQL, out to the table's loader */
const fetchRoute = (y: number) =>
   route(sCurve([ROSTER_RIGHT, y], GQL), line(GQL, [TABLE[0], GQL[1]]));
const ROUTES = BATCH_MID.map(fetchRoute);
const AT_GQL = ROUTES[0].ends[0];

/* each batch: leaves the roster at t0, is resolved in GraphQL, lands */
const fetchStops = (t0: number): Stop[] => [
   [t0, 0],
   [t0 + 0.08, AT_GQL],
   [t0 + 0.12, AT_GQL],
   [t0 + 0.18, 1],
];
const BATCHES = [0.08, 0.3].map((t0, i) =>
   beat(ride(ROUTES[i], fetchStops(t0))),
);

/* the bracket marks batch one, slides to batch two, then clears */
const BRACKET = beat({
   times: [0, 0.06, 0.08, 0.27, 0.3, 0.48, 0.5, 1],
   opacity: [0, 0, 1, 1, 1, 1, 0, 0],
   y: [0, 0, 0, 0, BATCH_SHIFT, BATCH_SHIFT, BATCH_SHIFT, 0],
});

/* loader progress on the header rule: half per batch, then gone */
const LOADER = beat({
   times: [0, 0.24, 0.27, 0.46, 0.49, 0.5, 0.53, 1],
   scaleX: [0, 0, 0.5, 0.5, 1, 1, 1, 0],
   opacity: [1, 1, 1, 1, 1, 1, 0, 0],
});
const TABLE_IN = beat({
   times: [0, 0.52, 0.56, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});
const TAB_MOVE = beat({
   times: [0, 0.62, 0.66, GONE, 0.98, 1],
   x: [0, 0, TAB_X[1] - TAB_X[0], TAB_X[1] - TAB_X[0], 0, 0],
});
/* a coder who keeps their place under Contests gets no animated node */
const resort = (i: number): Loop | null => {
   const dy = (contestSlot(i) - i) * SLOT_STEP;
   if (dy === 0) return null;
   return beat({
      times: [0, 0.66, 0.73, GONE, 0.98, 1],
      y: [0, 0, dy, dy, 0, 0],
   });
};
const RESORTS = CODERS.map((_, i) => resort(i));

/* GraphQL's mark: a hexagon with its inscribed triangle */
const vertex = (k: number): Pt => {
   const a = ((k * 60 - 90) * Math.PI) / 180;
   return [GQL[0] + GQL_R * Math.cos(a), GQL[1] + GQL_R * Math.sin(a)];
};
const pt = ([x, y]: Pt) => `${x.toFixed(2)},${y.toFixed(2)}`;
const HEX = [0, 1, 2, 3, 4, 5].map(vertex);
const HEX_D = `M${HEX.map(pt).join(" L")} Z`;
const TRI_D = `M${[0, 2, 4].map((k) => pt(HEX[k])).join(" L")} Z`;

/* medals by position: the shades of one tint, not gold, silver, bronze */
const MEDALS = ["cc", "88", "55"];

const Moving = ({
   loop,
   children,
}: Readonly<{ loop: Loop; children: ReactNode }>) => (
   <motion.g {...loopProps(loop)}>{children}</motion.g>
);

const Roster = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={ROSTER} rx={7} />
      <Wire d={`M${ROSTER[0]},34 H${ROSTER_RIGHT}`} />
      {HANDLES.map((y, i) => (
         <g key={y}>
            <circle cx={33} cy={y} r={2.5} fill={W25} />
            <Bar box={[39, y - 1.5, HANDLE_W[i], 3]} fill={W16} />
            <Panel box={[74, y - 3, 16, 6]} rx={3} />
         </g>
      ))}
      <Moving loop={BRACKET}>
         <rect
            x={29}
            y={HANDLES[0] - 7}
            width={64}
            height={BATCH_SHIFT - 2}
            rx={5}
            fill={`${tint}14`}
            stroke={`${tint}88`}
            vectorEffect="non-scaling-stroke"
         />
      </Moving>
   </>
);

const GraphQL = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={[GQL[0] - 14, GQL[1] - 14, 28, 28]} rx={6} />
      <Wire d={HEX_D} stroke={`${tint}99`} />
      <Wire d={TRI_D} stroke={`${tint}55`} />
   </>
);

/* one leaderboard row: avatar, handle, Mix bar, contest rating */
const CoderRow = ({
   coder,
   y,
   tint,
}: Readonly<{ coder: Coder; y: number; tint: string }>) => {
   const [easy, medium, hard] = coder.mix;
   return (
      <>
         <circle cx={180} cy={y} r={2.5} fill={W25} />
         <Bar box={[186, y - 1.5, coder.name, 3]} fill={W16} />
         <rect x={MIX_X} y={y - 2} width={easy} height={4} fill={`${tint}cc`} />
         <rect
            x={MIX_X + easy}
            y={y - 2}
            width={medium}
            height={4}
            fill={`${tint}77`}
         />
         <rect
            x={MIX_X + easy + medium}
            y={y - 2}
            width={hard}
            height={4}
            fill={`${tint}33`}
         />
         <Bar box={[RATING_X, y - 1.5, coder.rating, 3]} fill={W40} />
      </>
   );
};

const Leaderboard = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={TABLE} rx={7} />
      <Wire d={`M${TABLE[0]},${HEAD_Y} H${TABLE_RIGHT}`} />
      <Moving loop={TAB_MOVE}>
         <Bar box={[TAB_X[0], HEAD_Y - 3, 44, 1.5]} fill={tint} />
      </Moving>
      <motion.g style={{ originX: 0 }} {...loopProps(LOADER)}>
         <rect
            x={TABLE[0]}
            y={HEAD_Y - 0.75}
            width={TABLE[2]}
            height={1.5}
            fill={`${tint}cc`}
         />
      </motion.g>
      <Moving loop={TABLE_IN}>
         {SLOTS.map((y, i) => (
            <g key={y}>
               <rect
                  x={164}
                  y={y - 7}
                  width={126}
                  height={14}
                  rx={3}
                  fill={i % 2 === 0 ? W03 : "none"}
               />
               {i < MEDALS.length ? (
                  <circle
                     cx={170}
                     cy={y}
                     r={3.5}
                     fill={`${tint}${MEDALS[i]}`}
                  />
               ) : (
                  <circle cx={170} cy={y} r={1.5} fill={W16} />
               )}
            </g>
         ))}
         {CODERS.map((coder, i) => {
            const row = <CoderRow coder={coder} y={SLOTS[i]} tint={tint} />;
            const loop = RESORTS[i];
            if (!loop) return <g key={SLOTS[i]}>{row}</g>;
            return (
               <Moving key={SLOTS[i]} loop={loop}>
                  {row}
               </Moving>
            );
         })}
      </Moving>
   </>
);

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      {BATCH_MID.map((y) => (
         <Wire key={y} d={curveD(sCurve([ROSTER_RIGHT, y], GQL))} />
      ))}
      <Wire d={`M${GQL[0]},${GQL[1]} H${TABLE[0]}`} />
      <Roster tint={tint} />
      <GraphQL tint={tint} />
      <Leaderboard tint={tint} />
   </>
);

const AmongUsScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="66% 45%"
      texture={RAILS}
      stage={<Stage tint={tint} />}
   >
      {BATCHES.map((loop, i) => (
         <Packet key={BATCH_MID[i]} color={tint} loop={loop} />
      ))}
      <Label at={[32, 26]} color={W55}>
         LEETCODERS
      </Label>
      <Label at={[GQL[0], 102]} color={W55} centered>
         GRAPHQL
      </Label>
      <Label at={[TAB_X[0], 27]} color={W55}>
         OVERVIEW
      </Label>
      <Label at={[TAB_X[1], 27]} color={W55}>
         CONTESTS
      </Label>
   </Shell>
);

export default AmongUsScene;
