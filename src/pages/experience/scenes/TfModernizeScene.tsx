import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Wire,
} from "@pages/projects/covers/kit/primitives";
import {
   GREEN,
   NON_SCALING,
   RAILS,
   W06,
   W10,
   W16,
   W25,
   curveD,
   ride,
   route,
   sCurve,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Frame } from "./SceneFrame";
import { beat, held, hop, play } from "./sceneParts";

/*
 * Legacy Terraform modernized, read left to right in one 6 s loop:
 *   analysis   a scan reads the legacy configuration top to bottom
 *   refactor   as it passes each region, that block moves out into its own
 *              module, which lights and passes its test
 *   pipeline   the modules feed a plan, the plan shows its diff, and the
 *              apply turns green
 * 11 animated nodes, 4 labels.
 */

/* ---------------- legacy configuration ---------------- */

const LEGACY: Box = [26, 30, 72, 132];
const LINE_X = 33;
/* uneven line lengths: one long file */
const LINES = [58, 44, 52, 30, 56, 40, 54, 34, 48, 26, 50].map((w, i) => ({
   y: 60 + i * 8.5,
   w,
   fill: i % 3 === 1 ? W10 : W16,
}));

const SCAN_TRAVEL = 94;
const SCAN = beat({
   times: [0, 0.04, 0.06, 0.32, 0.34, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   y: [0, 0, 0, SCAN_TRAVEL, SCAN_TRAVEL, 0],
});

const Legacy = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={LEGACY} rx={7} />
      <Wire d={`M${LEGACY[0]},52 H${LEGACY[0] + LEGACY[2]}`} />
      {LINES.map(({ y, w, fill }) => (
         <Bar key={y} box={[LINE_X, y, w, 3]} fill={fill} />
      ))}
      {/* the analysis pass, top of the file to the bottom */}
      <motion.g {...play(SCAN)}>
         <rect x={27} y={53} width={70} height={11} fill={`${tint}14`} />
         <Wire d="M27,53 H97" stroke={`${tint}80`} />
      </motion.g>
   </>
);

/* ---------------- modules with tests ---------------- */

const MODULE_X = 122;
const MODULE_W = 66;
const MODULE_H = 32;
const MODULE_Y = [36, 82, 128];
const PORT_IN = MODULE_X;
const PORT_OUT = MODULE_X + MODULE_W;
const mid = (y: number) => y + MODULE_H / 2;

/* [legacy region the block leaves from, departure] per module */
const BLOCKS: [number, number][] = [
   [72, 0.12],
   [104, 0.21],
   [136, 0.3],
];
const FLIGHT = 0.08;

const modules = MODULE_Y.map((y, i) => {
   const [from, t] = BLOCKS[i];
   const lane = sCurve([LEGACY[0] + LEGACY[2], from], [PORT_IN, mid(y)]);
   return {
      y,
      lane: curveD(lane),
      block: beat(
         ride(route(lane), [
            [t, 0],
            [t + FLIGHT, 1],
         ]),
      ),
      tested: held(t + FLIGHT),
   };
});

const Module = ({ y, first }: Readonly<{ y: number; first: boolean }>) => (
   <>
      <Panel box={[MODULE_X, y, MODULE_W, MODULE_H]} rx={5} />
      {!first && <Bar box={[MODULE_X + 7, y + 7, 22, 3]} fill={W25} />}
      <Bar box={[MODULE_X + 7, y + 16, 40, 2.5]} fill={W16} />
      <Bar box={[MODULE_X + 7, y + 22, 28, 2.5]} fill={W10} />
      <circle
         cx={PORT_OUT - 8}
         cy={y + 8}
         r={2.6}
         fill="none"
         stroke={W25}
         vectorEffect={NON_SCALING}
      />
   </>
);

const Modules = ({ tint }: Readonly<TintProps>) => (
   <>
      {modules.map(({ y, lane }, i) => (
         <g key={y}>
            <Wire d={lane} />
            <Module y={y} first={i === 0} />
         </g>
      ))}
      {/* each module lights as its block lands, and its test passes */}
      {modules.map(({ y, tested }) => (
         <motion.g key={y} {...play(tested)}>
            <Panel
               box={[MODULE_X, y, MODULE_W, MODULE_H]}
               rx={5}
               fill={`${tint}14`}
               stroke={`${tint}99`}
            />
            <circle cx={PORT_OUT - 8} cy={y + 8} r={2.6} fill={GREEN} />
         </motion.g>
      ))}
   </>
);

/* ---------------- plan and apply ---------------- */

const PLAN: Box = [214, 40, 80, 48];
const APPLY: Box = [214, 112, 80, 36];
const PLAN_PORT: Pt = [PLAN[0], 64];
const PLAN_OUT: Pt = [254, PLAN[1] + PLAN[3]];
const APPLY_IN: Pt = [254, APPLY[1]];
const DIFF_Y = [62, 70, 78];
const DIFF_W = [40, 32, 46];

const FEEDS = MODULE_Y.map((y) =>
   curveD(sCurve([PORT_OUT, mid(y)], PLAN_PORT)),
);
/* the module bundle rides the middle feed into the plan */
const BUNDLE_LANE = route(sCurve([PORT_OUT, mid(MODULE_Y[1])], PLAN_PORT));
const BUNDLE_RIDE = beat(
   ride(BUNDLE_LANE, [
      [0.42, 0],
      [0.5, 1],
   ]),
);
const DIFF = held(0.5);
const PROMOTE = hop(PLAN_OUT, APPLY_IN, 0.6, 0.66);
const APPLIED = held(0.66);

const Pipeline = ({ tint }: Readonly<TintProps>) => (
   <>
      {FEEDS.map((d) => (
         <Wire key={d} d={d} />
      ))}
      <Wire d={`M${PLAN_OUT[0]},${PLAN_OUT[1]} V${APPLY_IN[1]}`} />
      <Panel box={PLAN} rx={7} />
      {DIFF_Y.map((y, i) => (
         <Bar key={y} box={[232, y - 1.25, DIFF_W[i], 2.5]} fill={W06} />
      ))}
      {/* the plan's diff: every change is an addition */}
      <motion.g {...play(DIFF)}>
         {DIFF_Y.map((y, i) => (
            <g key={y}>
               <Wire
                  d={`M221,${y} H227 M224,${y - 3} V${y + 3}`}
                  stroke={tint}
               />
               <Bar box={[232, y - 1.25, DIFF_W[i], 2.5]} fill={`${tint}99`} />
            </g>
         ))}
      </motion.g>
      <Panel box={APPLY} rx={7} />
      <motion.g {...play(APPLIED)}>
         <Panel box={APPLY} rx={7} fill={`${GREEN}14`} stroke={GREEN} />
         <circle cx={APPLY[0] + APPLY[2] - 10} cy={130} r={2.6} fill={GREEN} />
      </motion.g>
   </>
);

const Stage = ({ tint }: Readonly<TintProps>) => (
   <>
      <Legacy tint={tint} />
      <Modules tint={tint} />
      <Pipeline tint={tint} />
   </>
);

export default function TfModernizeScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="50% 50%"
         texture={RAILS}
         stage={<Stage tint={tint} />}
      >
         {modules.map(({ y, block }) => (
            <Packet key={y} color={tint} loop={block} />
         ))}
         <Packet color={tint} loop={BUNDLE_RIDE} />
         <Packet color={tint} loop={PROMOTE} />
         <Label at={[33, 42]}>LEGACY</Label>
         <Label at={[MODULE_X + 7, MODULE_Y[0] + 8.5]}>MODULE</Label>
         <Label at={[221, 50]}>PLAN</Label>
         <Label at={[221, 130]}>APPLY</Label>
      </Frame>
   );
}
