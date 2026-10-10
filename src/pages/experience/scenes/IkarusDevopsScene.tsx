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
   GRID,
   W10,
   W16,
   W25,
   line,
   ride,
   route,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Dashed, Frame, Gate, Layer, Slot } from "./SceneFrame";
import { containerGlyph, play, timeline } from "./sceneParts";

/*
 * Containerize and ship, as the internship's pipeline ran it, in 7 s:
 *   ci        a commit leaves the code and waits at each pipeline gate,
 *             lint, then tests, then the quality scan (its server below),
 *             each turning green before it moves on
 *   build     the image is built, pushed down to the registry, and
 *             deployed as a task in the ECS cluster
 *   provision a playbook runs against a server, whose light turns green
 * Sized for the compact timeline slot; 10 animated nodes, 4 labels.
 */

const { beat, held, hop } = timeline(7);

/* ---------------- continuous integration lane ---------------- */

const LANE_Y = 50;
const CODE: Box = [24, 24, 50, 52];
const BUILD: Box = [240, 34, 54, 32];
const BUILD_X = BUILD[0] + BUILD[2] / 2;
const GATES: { at: Pt; name: string }[] = [
   { at: [98, LANE_Y], name: "LINT" },
   { at: [140, LANE_Y], name: "TEST" },
   { at: [196, LANE_Y], name: "QUALITY" },
];
const SCAN_X = GATES[2].at[0];
const SCAN_HOST: Box = [SCAN_X - 12, 68, 24, 18];

const CI = route(
   line([CODE[0] + CODE[2], LANE_Y], GATES[0].at),
   line(GATES[0].at, GATES[1].at),
   line(GATES[1].at, GATES[2].at),
   line(GATES[2].at, [BUILD[0], LANE_Y]),
);
const [AT_LINT, AT_TEST, AT_SCAN] = CI.ends;
/* the commit holds at each gate while it runs */
const COMMIT = beat(
   ride(CI, [
      [0.03, 0],
      [0.1, AT_LINT],
      [0.15, AT_LINT],
      [0.2, AT_TEST],
      [0.25, AT_TEST],
      [0.3, AT_SCAN],
      [0.35, AT_SCAN],
      [0.41, 1],
   ]),
);
const PASSED = [0.11, 0.21, 0.31].map((at) => held(at));
const BUILT = held(0.41);

const CODE_LINES = [
   { y: 40, w: 32 },
   { y: 48, w: 24 },
   { y: 56, w: 34 },
   { y: 64, w: 20 },
];

const Ci = ({ tint }: Readonly<TintProps>) => (
   <>
      <Wire d={`M${CODE[0] + CODE[2]},${LANE_Y} H${BUILD[0]}`} />
      <Panel box={CODE} rx={6} />
      {CODE_LINES.map(({ y, w }) => (
         <Bar key={y} box={[32, y, w, 3]} fill={W16} />
      ))}
      {/* the quality scan's server, under its gate */}
      <Dashed d={`M${SCAN_X},${LANE_Y + 5} V${SCAN_HOST[1]}`} />
      <Panel box={SCAN_HOST} rx={3} />
      <Bar box={[SCAN_X - 7, 74, 14, 2]} fill={W25} />
      <Bar box={[SCAN_X - 7, 79, 9, 2]} fill={W16} />
      <Panel box={BUILD} rx={6} />
      <Slot box={[BUILD_X - 9, 44, 18, 12]} rx={2} />
      <motion.g {...play(BUILT)}>
         <Panel box={BUILD} rx={6} fill="none" stroke={`${tint}99`} />
      </motion.g>
   </>
);

/* ---------------- registry and cluster ---------------- */

const DEPLOY_Y = 146;
const REGISTRY: Box = [238, 122, 56, 48];
const ECS: Box = [116, 120, 84, 52];
const TASKS: Box[] = [125, 149, 173].map((x): Box => [x, 138, 18, 16]);
const DELIVERY = route(
   line([BUILD_X, LANE_Y], [BUILD_X, DEPLOY_Y]),
   line([BUILD_X, DEPLOY_Y], [158, DEPLOY_Y]),
);
/* built in place, pushed down to rest in the registry, then deployed */
const SHIPPED = beat(
   ride(DELIVERY, [
      [0.42, 0],
      [0.46, 0],
      [0.52, DELIVERY.ends[0]],
      [0.58, DELIVERY.ends[0]],
      [0.66, 1],
   ]),
);
const STORED = held(0.52);
const DEPLOYED = held(0.66);

/* three image layers, stacked */
const LAYERS: Box[] = [138, 144, 150].map((y): Box => [251, y, 30, 4]);

const Delivery = ({ tint }: Readonly<TintProps>) => (
   <>
      <Wire d={`M${BUILD_X},${BUILD[1] + BUILD[3]} V${REGISTRY[1]}`} />
      <Wire d={`M${REGISTRY[0]},${DEPLOY_Y} H${ECS[0] + ECS[2]}`} />
      <Panel box={REGISTRY} rx={6} />
      {LAYERS.map((box) => (
         <Bar key={box[1]} box={box} fill={W10} />
      ))}
      <motion.g {...play(STORED)}>
         {LAYERS.map((box) => (
            <Bar key={box[1]} box={box} fill={`${tint}b3`} />
         ))}
      </motion.g>
      <Panel box={ECS} rx={7} />
      {TASKS.map((box) => (
         <Slot key={box[0]} box={box} />
      ))}
      <motion.g {...play(DEPLOYED)}>
         <Panel box={ECS} rx={7} fill="none" stroke={`${tint}99`} />
         {TASKS.map((box) => (
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

/* ---------------- configuration management ---------------- */

const PLAYBOOK: Box = [24, 120, 76, 52];
const SERVER: Box = [70, 128, 20, 36];
const PROVISION = hop([58, 146], [SERVER[0], 146], 0.7, 0.77);
const PROVISIONED = held(0.78);

const Provision = () => (
   <>
      <Panel box={PLAYBOOK} rx={6} />
      {[134, 142, 150, 158].map((y, i) => (
         <Bar
            key={y}
            box={[31 + (i % 2) * 5, y, 22 - (i % 2) * 6, 2.5]}
            fill={W16}
         />
      ))}
      <Panel box={SERVER} rx={3} />
      {[136, 144].map((y) => (
         <Bar key={y} box={[74, y, 12, 2.5]} fill={W25} />
      ))}
      <circle cx={80} cy={156} r={2.4} fill={W25} />
      <motion.g {...play(PROVISIONED)}>
         <circle cx={80} cy={156} r={2.4} fill={GREEN} />
      </motion.g>
   </>
);

const Stage = ({ tint }: Readonly<TintProps>) => (
   <>
      <Ci tint={tint} />
      <Delivery tint={tint} />
      <Provision />
   </>
);

export default function IkarusDevopsScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="55% 45%"
         texture={GRID}
         stage={<Stage tint={tint} />}
      >
         {GATES.map(({ at, name }, i) => (
            <Gate key={name} at={at} loop={PASSED[i]} />
         ))}
         {GATES.map(({ at, name }) => (
            <Label key={name} at={[at[0], 37]} centered>
               {name}
            </Label>
         ))}
         <Label at={[124, 130]}>ECS</Label>
         <Packet color={tint} loop={COMMIT} />
         <Packet color={tint} size={4} loop={PROVISION} />
         <Layer loop={SHIPPED}>
            <span style={containerGlyph(tint)} />
         </Layer>
      </Frame>
   );
}
