import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import { Bar, Label, Packet, Panel, Shell, Wire } from "./kit/primitives";
import {
   DOTS,
   NON_SCALING,
   W03,
   W10,
   W16,
   W25,
   clock,
   line,
   loopProps,
   ride,
   route,
   shown,
} from "./kit/sceneTokens";
import type { Keys, Loop, TintProps } from "./kit/sceneTokens";

/*
 * svg-forge, in the order the plugin runs its scripts:
 *   forge.py      the command (--kind flow --data ...) writes an animated card
 *   the card      plays its own flow: a dot rides node to node
 *   validate      a pass over the file ticks the SV001 to SV023 rule groups
 *                 green and the report reads ok
 *   frames.py     the timeline renders as a contact sheet; the playhead steps
 *                 through the six sampled frames of the loop
 */

const beat = clock(6);
const GONE = 0.94;
const RAMP = 0.02;
const ROW_Y = 54;

const FORGE_PORT = route(line([98, ROW_Y], [120, ROW_Y]));
const SHEET_PORT = route(line([171, 84], [171, 108]));

/* the generated card's own flow: three nodes and the dot between them */
const NODE_X = [139, 171, 203];
const FLOW_FROM = NODE_X[0];
const FLOW_TO = NODE_X.at(-1) ?? FLOW_FROM;
const TRIPS: [number, number][] = [
   [0.24, 0.44],
   [0.46, 0.66],
   [0.68, 0.88],
];

/* one trip per window, sliding home while hidden between them */
const flowKeys = (): Keys => {
   const frames: [number, number, number][] = [[0, 0, 0]];
   const span = FLOW_TO - FLOW_FROM;
   for (const [on, off] of TRIPS) {
      const f = RAMP / (off - on);
      frames.push(
         [on, 0, 0],
         [on + RAMP, span * f, 1],
         [off - RAMP, span * (1 - f), 1],
         [off, span, 0],
      );
   }
   frames.push([1, 0, 0]);
   return {
      times: frames.map(([t]) => t),
      x: frames.map(([, x]) => x),
      opacity: frames.map(([, , o]) => o),
      ease: "linear",
   };
};

/* contact sheet: six sampled frames in one strip (--cols 6) */
const THUMB_COUNT = 6;
const THUMB_X0 = 32;
const THUMB_STEP = 44;
const THUMB_W = 36;
const THUMB_Y = 114;
const THUMB_H = 26;
const THUMB_MID = THUMB_Y + THUMB_H / 2;
const THUMBS = Array.from(
   { length: THUMB_COUNT },
   (_, i) => THUMB_X0 + i * THUMB_STEP,
);

/* the playhead lands on each frame in turn, then lets go */
const PLAY = 0.57;
const STEP = 0.055;
const playKeys = (): Keys => {
   const frames: [number, number, number][] = [
      [0, 0, 0],
      [PLAY - RAMP, 0, 0],
      [PLAY, 0, 1],
   ];
   for (let i = 1; i < THUMB_COUNT; i++) {
      const t = PLAY + i * STEP;
      frames.push([t - 0.015, (i - 1) * THUMB_STEP, 1], [t, i * THUMB_STEP, 1]);
   }
   const last = (THUMB_COUNT - 1) * THUMB_STEP;
   frames.push([0.9, last, 1], [0.92, last, 0], [1, 0, 0]);
   return {
      times: frames.map(([t]) => t),
      x: frames.map(([, x]) => x),
      opacity: frames.map(([, , o]) => o),
   };
};

const CARET: Loop = {
   duration: 1.2,
   times: [0, 0.45, 0.5, 0.95, 1],
   opacity: [1, 1, 0, 0, 1],
};
const FORGED = beat(
   ride(FORGE_PORT, [
      [0.1, 0],
      [0.2, 1],
   ]),
);
const CARD = beat(shown(0.2, GONE));
const FLOW = beat(flowKeys());
const SCAN = beat({
   times: [0, 0.28, 0.3, 0.44, 0.46, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   x: [0, 0, 0, 100, 100, 0],
});
const RULES = [0.33, 0.38, 0.43].map((on) => beat(shown(on, GONE)));
const VERDICT = beat(shown(0.48, GONE));
const RENDERED = beat(
   ride(SHEET_PORT, [
      [0.48, 0],
      [0.54, 1],
   ]),
);
const SHEET = beat(shown(0.54, GONE));
const PLAYHEAD = beat(playKeys());

const ForgePanel = ({ tint }: TintProps) => (
   <>
      <Panel box={[26, 22, 72, 62]} />
      <Wire d="M26,40 H98" />
      {/* the command line: prompt, script, --kind flow, --data */}
      <Bar box={[34, 46, 6, 4]} fill={tint} />
      <Bar box={[44, 46, 44, 4]} fill={W25} />
      <Bar box={[34, 56, 26, 4]} fill={W16} />
      <Bar box={[63, 56, 24, 4]} fill={`${tint}80`} />
      <Bar box={[34, 66, 38, 4]} fill={W16} />
      <motion.rect
         x={34}
         y={73}
         width={4}
         height={7}
         fill={tint}
         {...loopProps(CARET)}
      />
   </>
);

const GeneratedCard = ({ tint }: TintProps) => (
   <>
      {/* empty canvas until forge.py writes the file */}
      <rect
         x={120}
         y={22}
         width={102}
         height={62}
         rx={7}
         fill="none"
         stroke={W16}
         strokeDasharray="3 3"
         vectorEffect={NON_SCALING}
      />
      <motion.g {...loopProps(CARD)}>
         <Panel box={[120, 22, 102, 62]} stroke={`${tint}66`} />
         <Bar box={[128, 30, 34, 4]} fill={W25} />
         <Wire d="M147,54 H163 M179,54 H195" stroke={W25} />
         {NODE_X.map((x) => (
            <rect
               key={x}
               x={x - 8}
               y={ROW_Y - 5}
               width={16}
               height={10}
               rx={3}
               fill={W03}
               stroke={W25}
               vectorEffect={NON_SCALING}
            />
         ))}
         <Bar box={[128, 72, 50, 3]} fill={W10} />
      </motion.g>
      <motion.circle
         cx={FLOW_FROM}
         cy={ROW_Y}
         r={2.4}
         fill={tint}
         {...loopProps(FLOW)}
      />
      {/* the validator reads the file left to right */}
      <motion.rect
         x={120}
         y={23}
         width={1.5}
         height={60}
         fill={`${tint}cc`}
         {...loopProps(SCAN)}
      />
   </>
);

const RULE_ROWS = [50, 62, 74];

const ValidatorPanel = () => (
   <>
      <Panel box={[242, 22, 52, 62]} />
      <Wire d="M242,40 H294" />
      {RULE_ROWS.map((y, i) => (
         <g key={y}>
            <Bar box={[249, y - 2, 26, 4]} fill={W16} />
            <circle cx={284} cy={y} r={2.4} fill={W25} />
            <motion.circle
               cx={284}
               cy={y}
               r={2.4}
               fill={GREEN}
               {...loopProps(RULES[i])}
            />
         </g>
      ))}
   </>
);

/* one sampled moment of the card's flow, the dot at t / cycle */
const Thumb = ({ x, k, tint }: TintProps & { x: number; k: number }) => (
   <>
      <rect
         x={x}
         y={THUMB_Y}
         width={THUMB_W}
         height={THUMB_H}
         rx={2}
         fill={W03}
         stroke={W16}
         vectorEffect={NON_SCALING}
      />
      <Wire d={`M${x + 7},${THUMB_MID} H${x + 29}`} stroke={W10} />
      <circle cx={x + 7 + 22 * k} cy={THUMB_MID} r={1.8} fill={tint} />
   </>
);

const ContactSheet = ({ tint }: TintProps) => (
   <>
      <Wire d="M171,84 V108" />
      <motion.g {...loopProps(SHEET)}>
         <Panel box={[26, 108, 268, 38]} />
         {THUMBS.map((x, i) => (
            <Thumb key={x} x={x} k={i / (THUMB_COUNT - 1)} tint={tint} />
         ))}
      </motion.g>
      <motion.rect
         x={THUMB_X0 - 2}
         y={THUMB_Y - 2}
         width={THUMB_W + 4}
         height={THUMB_H + 4}
         rx={3}
         fill="none"
         stroke={tint}
         vectorEffect={NON_SCALING}
         {...loopProps(PLAYHEAD)}
      />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Wire d="M98,54 H120 M222,54 H242" />
      <ForgePanel tint={tint} />
      <GeneratedCard tint={tint} />
      <ValidatorPanel />
      <ContactSheet tint={tint} />
   </>
);

const ForgeScene = ({ tint }: Readonly<{ tint: string }>) => {
   const head = `${tint}b3`;
   return (
      <Shell
         tint={tint}
         focus="53% 30%"
         texture={DOTS}
         stage={<Stage tint={tint} />}
      >
         <Packet color={tint} loop={FORGED} />
         <Packet color={tint} loop={RENDERED} />
         <Label at={[33, 31]} color={head}>
            FORGE.PY
         </Label>
         <Label at={[248, 31]} color={head}>
            VALIDATE
         </Label>
         <Label at={[268, 96]} color={GREEN} centered loop={VERDICT}>
            OK
         </Label>
         <Label at={[26, 99]} color={head}>
            FRAMES.PY
         </Label>
      </Shell>
   );
};

export default ForgeScene;
