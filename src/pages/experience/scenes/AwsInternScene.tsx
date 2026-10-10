import { motion } from "motion/react";
import { Bar, Label, Panel, Wire } from "@pages/projects/covers/kit/primitives";
import {
   COLUMNS,
   GREEN,
   INK,
   NON_SCALING,
   W10,
   W16,
   W25,
   line,
   lit,
   ride,
   route,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Dashed, Draw, Frame, Gate, Layer, Slot } from "./SceneFrame";
import { END, GONE, containerGlyph, play, timeline } from "./sceneParts";

/*
 * The DevOps internship, training to delivery, in 7 s:
 *   training   three modules tick off one by one
 *   certified  a certification shield stamps in (no count)
 *   poc        two blocks of a proof of concept wire up and light
 *   delivery   the production migration: a container leaves the old
 *              server along the pipeline lane, waits at the Terraform plan
 *              gate until it passes, and lands as a task in the ECS cluster
 * Sized for the compact timeline slot; 9 animated nodes, 4 labels.
 */

const { beat, held } = timeline(7);

/* ---------------- training and certification ---------------- */

const TRAINING: Box = [24, 22, 84, 70];
const MODULE_Y = [48, 62, 76];
const TICK_X = 96;
const TICKS = [0.06, 0.12, 0.18].map((at) => held(at));

const SHIELD =
   "M133,42 L145,47 V57 C145,65 139,70 133,73 C127,70 121,65 121,57 V47 Z";
const SHIELD_CHECK = "M127.5,57 L131.5,61 L139,53";
/* the shield lands a little large and settles: a stamp */
const STAMPED = beat({
   times: [0, 0.25, 0.28, 0.31, END, GONE, 1],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   scale: [1.35, 1.35, 0.94, 1, 1, 1, 1.35],
});

const Training = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={TRAINING} rx={7} />
      {MODULE_Y.map((y) => (
         <g key={y}>
            <Bar box={[32, y - 1.5, 46, 3]} fill={W16} />
            <circle
               cx={TICK_X}
               cy={y}
               r={4}
               fill="none"
               stroke={W25}
               vectorEffect={NON_SCALING}
            />
         </g>
      ))}
      {MODULE_Y.map((y, i) => (
         <motion.g key={y} {...play(TICKS[i])}>
            <circle cx={TICK_X} cy={y} r={4} fill={GREEN} />
            <path
               d={`M${TICK_X - 2},${y} L${TICK_X - 0.5},${y + 1.6} L${TICK_X + 2.2},${y - 1.6}`}
               fill="none"
               stroke={INK}
               strokeWidth={1.2}
            />
         </motion.g>
      ))}
      <Dashed d={SHIELD} />
      <motion.g {...play(STAMPED)}>
         <path
            d={SHIELD}
            fill={`${tint}2e`}
            stroke={tint}
            vectorEffect={NON_SCALING}
         />
         <path
            d={SHIELD_CHECK}
            fill="none"
            stroke={tint}
            strokeWidth={1.8}
            strokeLinecap="round"
         />
      </motion.g>
   </>
);

/* ---------------- proof of concept ---------------- */

const POC: Box = [158, 22, 136, 70];
const BLOCKS: Box[] = [
   [176, 46, 32, 28],
   [246, 46, 32, 28],
];
const POC_WIRE = "M208,60 H246";
const WIRED = beat(
   lit(
      [
         [0.33, 0],
         [0.41, 1],
      ],
      END,
   ),
);
const POC_LIT = held(0.41);

const Poc = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={POC} rx={7} />
      {BLOCKS.map((box) => (
         <Panel key={box[0]} box={box} rx={4} />
      ))}
      <Wire d={POC_WIRE} stroke={W10} />
      <Draw d={POC_WIRE} color={tint} width={1.4} loop={WIRED} />
      <motion.g {...play(POC_LIT)}>
         {BLOCKS.map((box) => (
            <Panel
               key={box[0]}
               box={box}
               rx={4}
               fill={`${tint}2e`}
               stroke={tint}
            />
         ))}
      </motion.g>
   </>
);

/* ---------------- production migration ---------------- */

const LANE_Y = 146;
const OLD: Box = [24, 122, 52, 48];
const PLAN: Pt = [148, LANE_Y];
const ECS: Box = [206, 116, 88, 54];
const SLOTS: Box[] = [214, 240, 266].map((x): Box => [x, 138, 20, 16]);
const LANDING: Pt = [250, LANE_Y];
const DEPART: Pt = [50, LANE_Y];

const LANE = route(line(DEPART, PLAN), line(PLAN, LANDING));
const AT_PLAN = LANE.ends[0];
const MIGRATED = beat(
   ride(LANE, [
      [0.5, 0],
      [0.58, AT_PLAN],
      [0.66, AT_PLAN],
      [0.74, 1],
   ]),
);
const PLANNED = held(0.61);
const RUNNING = held(0.74);

const Migration = ({ tint }: Readonly<TintProps>) => (
   <>
      {/* the pipeline lane from the old server to the cluster */}
      <Dashed d={`M${OLD[0] + OLD[2]},${LANE_Y} H${ECS[0]}`} />
      {[100, 182].map((x) => (
         <Wire key={x} d={`M${x},${LANE_Y - 4} V${LANE_Y + 4}`} stroke={W25} />
      ))}
      <Panel box={OLD} rx={5} />
      {[132, 160].map((y) => (
         <Bar key={y} box={[32, y, 36, 3]} fill={W16} />
      ))}
      <Panel box={ECS} rx={7} />
      {SLOTS.map((box) => (
         <Slot key={box[0]} box={box} />
      ))}
      <motion.g {...play(RUNNING)}>
         <Panel box={ECS} rx={7} fill="none" stroke={`${tint}99`} />
         {SLOTS.map((box) => (
            <Panel
               key={box[0]}
               box={box}
               rx={3}
               fill={`${tint}2e`}
               stroke={tint}
            />
         ))}
      </motion.g>
   </>
);

const Stage = ({ tint }: Readonly<TintProps>) => (
   <>
      <Training tint={tint} />
      <Poc tint={tint} />
      <Migration tint={tint} />
   </>
);

export default function AwsInternScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="50% 50%"
         texture={COLUMNS}
         stage={<Stage tint={tint} />}
      >
         <Label at={[32, 32]}>TRAINING</Label>
         <Label at={[166, 32]}>POC</Label>
         <Label at={[PLAN[0], 131]} centered>
            PLAN
         </Label>
         <Label at={[214, 126]}>ECS</Label>
         <Gate at={PLAN} loop={PLANNED} />
         <Layer loop={MIGRATED}>
            <span style={containerGlyph(tint)} />
         </Layer>
      </Frame>
   );
}
