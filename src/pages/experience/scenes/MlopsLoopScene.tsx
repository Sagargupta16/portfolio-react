import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Pip,
   Wire,
} from "@pages/projects/covers/kit/primitives";
import {
   AMBER,
   COLUMNS,
   GREEN,
   NON_SCALING,
   W10,
   W25,
   W55,
   layer,
   line,
   lit,
   ride,
   route,
   sCurve,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Dashed, Draw, Frame, Slot } from "./SceneFrame";
import { END, GONE, beat, growX, growY, held, hop, play } from "./sceneParts";

/*
 * The SageMaker pipeline as one closed loop, clockwise in 6 s:
 *   train     data reaches training, where three models train in parallel
 *   gate      the model waits at the quality gate while its metrics rise
 *             past their thresholds, and the gate passes
 *   deploy    it lands on the endpoint's idle slot and traffic shifts to
 *             it (blue/green), then shifts back home while the loop resets
 *   monitor   captured traffic reaches the drift monitor, the score leaves
 *             its baseline, the drift alarm fires, and the retrain edge
 *             draws back to training, where the next run starts
 * 12 animated nodes, 4 labels.
 */

const RAIL_Y = 60;
const DATA: Pt = [36, RAIL_Y];
const TRAIN: Box = [70, 42, 58, 36];
const GATE: Box = [150, 38, 50, 44];
const ENDPOINT: Box = [222, 42, 72, 36];
const MONITOR: Box = [222, 112, 72, 40];
const right = ([x, , w]: Box) => x + w;
const centreX = ([x, , w]: Box) => x + w / 2;

/* ---------------- train ---------------- */

const TRACK_Y = [51, 59, 67];
const TRAINED = growX(0.09, 0.26);
const FEED = hop([DATA[0] + 11, RAIL_Y], [TRAIN[0], RAIL_Y], 0.02, 0.08);

const Bucket = ({ tint }: Readonly<TintProps>) => (
   <>
      <ellipse
         cx={DATA[0]}
         cy={53}
         rx={9}
         ry={2.6}
         fill="none"
         stroke={`${tint}cc`}
         vectorEffect={NON_SCALING}
      />
      <path
         d={`M${DATA[0] - 9},53 L${DATA[0] - 6.5},66 Q${DATA[0]},69.5 ${DATA[0] + 6.5},66 L${DATA[0] + 9},53`}
         fill="none"
         stroke={`${tint}88`}
         vectorEffect={NON_SCALING}
      />
   </>
);

const Train = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={TRAIN} rx={6} />
      {TRACK_Y.map((y) => (
         <Bar key={y} box={[78, y - 1.5, 42, 3]} fill={W10} />
      ))}
      {/* three models training in parallel: one node fills all three */}
      <motion.g style={{ originX: 0 }} {...play(TRAINED)}>
         {TRACK_Y.map((y) => (
            <Bar key={y} box={[78, y - 1.5, 42, 3]} fill={tint} />
         ))}
      </motion.g>
   </>
);

/* ---------------- quality gate ---------------- */

/* [bar x, final height, threshold height] */
const METRICS: [number, number, number][] = [
   [161, 18, 14],
   [169, 24, 19],
   [177, 15, 12],
   [185, 21, 17],
];
const METRIC_BASE = 76;
const SCORED = growY(0.36, 0.45);
const PASSED = held(0.46);
const TO_GATE = beat(
   ride(route(line([right(TRAIN), RAIL_Y], [GATE[0], RAIL_Y])), [
      [0.28, 0],
      [0.33, 1],
      [0.46, 1],
   ]),
);

const Gate = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={GATE} rx={6} />
      <motion.g style={{ originY: 1 }} {...play(SCORED)}>
         {METRICS.map(([x, h]) => (
            <rect
               key={x}
               x={x}
               y={METRIC_BASE - h}
               width={4}
               height={h}
               rx={1}
               fill={`${tint}cc`}
            />
         ))}
      </motion.g>
      {METRICS.map(([x, , tick]) => (
         <Wire
            key={x}
            d={`M${x - 1.5},${METRIC_BASE - tick} h7`}
            stroke={W55}
         />
      ))}
      <motion.g {...play(PASSED)}>
         <Panel box={GATE} rx={6} fill="none" stroke={`${GREEN}b3`} />
         <circle cx={right(GATE) - 7} cy={GATE[1] + 7} r={2.6} fill={GREEN} />
      </motion.g>
   </>
);

/* ---------------- endpoint ---------------- */

const LIVE: Box = [229, 50, 26, 16];
const IDLE: Box = [261, 50, 26, 16];
const SHIFT = IDLE[0] - LIVE[0];
const TO_ENDPOINT = hop(
   [right(GATE), RAIL_Y],
   [ENDPOINT[0], RAIL_Y],
   0.48,
   0.54,
);
const DEPLOYED = held(0.55);
/* traffic moves to the new slot, then home while the scene clears */
const TRAFFIC = beat({
   times: [0, 0.58, 0.64, END, GONE, 0.97, 1],
   x: [0, 0, SHIFT, SHIFT, SHIFT, 0, 0],
   opacity: [1, 1, 1, 1, 0, 0, 1],
});

const Endpoint = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={ENDPOINT} rx={6} />
      <Panel box={LIVE} rx={3} stroke={W25} />
      <Slot box={IDLE} />
      <motion.g {...play(DEPLOYED)}>
         <Panel box={IDLE} rx={3} fill={`${tint}33`} stroke={tint} />
      </motion.g>
      <motion.g {...play(TRAFFIC)}>
         <Bar box={[LIVE[0] + 3, 70, LIVE[2] - 6, 2.5]} fill={tint} />
      </motion.g>
   </>
);

/* ---------------- drift monitor and retraining ---------------- */

const BASELINE_Y = 136;
const CAPTURE = hop(
   [centreX(ENDPOINT), ENDPOINT[1] + ENDPOINT[3]],
   [centreX(ENDPOINT), MONITOR[1]],
   0.65,
   0.71,
);
const SCORE = route(
   line([230, BASELINE_Y], [250, BASELINE_Y]),
   sCurve([250, BASELINE_Y], [284, 121]),
);
const DRIFTING = beat(
   ride(SCORE, [
      [0.71, 0],
      [0.81, 1],
   ]),
);
const ALARM = held(0.81);
const RETRAIN = `M${MONITOR[0]},132 C160,132 ${centreX(TRAIN)},122 ${centreX(TRAIN)},${TRAIN[1] + TRAIN[3]}`;
const RETRAINING = beat(
   lit(
      [
         [0.82, 0],
         [0.9, 1],
      ],
      END,
   ),
);

const Monitor = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={MONITOR} rx={6} />
      <Dashed d={`M230,${BASELINE_Y} H286`} stroke={W25} />
      <Dashed d={RETRAIN} dash="3 4" />
      <Draw d={RETRAIN} color={tint} width={1.4} loop={RETRAINING} />
   </>
);

const Stage = ({ tint }: Readonly<TintProps>) => (
   <>
      <Wire d={`M${DATA[0] + 11},${RAIL_Y} H${TRAIN[0]}`} />
      <Wire d={`M${right(TRAIN)},${RAIL_Y} H${GATE[0]}`} />
      <Wire d={`M${right(GATE)},${RAIL_Y} H${ENDPOINT[0]}`} />
      <Wire
         d={`M${centreX(ENDPOINT)},${ENDPOINT[1] + ENDPOINT[3]} V${MONITOR[1]}`}
      />
      <Bucket tint={tint} />
      <Train tint={tint} />
      <Gate tint={tint} />
      <Endpoint tint={tint} />
      <Monitor tint={tint} />
   </>
);

export default function MlopsLoopScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="52% 40%"
         texture={COLUMNS}
         stage={<Stage tint={tint} />}
      >
         <Label at={[centreX(TRAIN), 32]} centered>
            TRAIN
         </Label>
         <Label at={[centreX(GATE), 28]} centered>
            GATE
         </Label>
         <Label at={[centreX(ENDPOINT), 32]} centered>
            ENDPOINT
         </Label>
         <Label at={[230, 122]} color={W25}>
            DRIFT
         </Label>
         <Packet color={tint} loop={FEED} />
         <Packet color={tint} loop={TO_GATE} />
         <Packet color={tint} loop={TO_ENDPOINT} />
         <Packet color={tint} loop={CAPTURE} />
         <Packet color={tint} loop={DRIFTING} />
         {/* drift detected: the score turns into the alarm */}
         <motion.div style={layer} {...play(ALARM)}>
            <Pip at={[284, 121]} color={AMBER} size={5} />
            <Label at={[230, 122]} color={AMBER}>
               DRIFT
            </Label>
         </motion.div>
      </Frame>
   );
}
