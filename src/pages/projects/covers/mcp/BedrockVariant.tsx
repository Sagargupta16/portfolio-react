import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Pip,
   Shell,
   Trace,
   Wire,
} from "../kit/primitives";
import {
   GREEN,
   INK,
   NON_SCALING,
   RAILS,
   W06,
   W10,
   W16,
   W40,
   clock,
   curveD,
   line,
   lit,
   loopProps,
   ride,
   route,
   sCurve,
} from "../kit/sceneTokens";
import type { Pt, Stop, TintProps } from "../kit/sceneTokens";

/*
 * Bedrock Multi-Model MCP, bedrock_compare: one prompt reaches the server,
 * fans out as parallel Converse calls to three model aliases, each answers at
 * its own latency, and Promise.allSettled holds the merge until the slowest
 * returns; then the side-by-side sections land at once.
 */

const beat = clock(5.6);
const HOLD = 0.9;
const GONE = 0.94;

const PROMPT_OUT: Pt = [66, 86];
const HUB_IN: Pt = [73, 86];
const HUB_OUT: Pt = [87, 86];
const MERGE_IN: Pt = [250, 86];
const LANE_X = 124;
const LANE_W = 92;
const LANE_H = 34;
const LANE_RIGHT = LANE_X + LANE_W;
const TRACK_X = 131;
const TRACK_W = 78;

interface Lane {
   name: string;
   top: number;
   /* when this model's Converse call resolves */
   done: number;
}

const LANES: Lane[] = [
   { name: "LLAMA4", top: 17, done: 0.42 },
   { name: "NOVA PRO", top: 69, done: 0.52 },
   { name: "DEEPSEEK", top: 121, done: 0.64 },
];
const center = (lane: Lane): number => lane.top + LANE_H / 2;

const TO_HUB = line(PROMPT_OUT, HUB_IN);
const THROUGH_HUB = line(HUB_IN, HUB_OUT);
const fanOut = (lane: Lane) => sCurve(HUB_OUT, [LANE_X, center(lane)]);
const fanIn = (lane: Lane) => sCurve([LANE_RIGHT, center(lane)], MERGE_IN);

/* the three requests leave together and split at the hub */
const requestKeys = (lane: Lane) => {
   const r = route(TO_HUB, THROUGH_HUB, fanOut(lane));
   const stops: Stop[] = [
      [0.08, 0],
      [0.15, r.ends[0]],
      [0.17, r.ends[1]],
      [0.27, 1],
   ];
   return beat(ride(r, stops));
};

/* latency: the track fills linearly until the model answers */
const latency = ({ done }: Lane) =>
   beat({
      times: [0, 0.28, done, HOLD, GONE, 1],
      scaleX: [0, 0, 1, 1, 1, 0],
      opacity: [0, 1, 1, 1, 0, 0],
      ease: "linear",
   });

/* each answer lights its way to the merge and waits there */
const answer = ({ done }: Lane) =>
   beat(
      lit(
         [
            [done, 0],
            [done + 0.06, 1],
         ],
         HOLD,
      ),
   );

const PROMPT_TYPE = beat({
   times: [0, 0.02, 0.07, HOLD, GONE, 1],
   scaleX: [0, 0, 1, 1, 1, 0],
   opacity: [0, 1, 1, 1, 0, 0],
});
/* allSettled: the merged sections land once the slowest has answered */
const SECTIONS = beat({
   times: [0, 0.7, 0.76, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   y: [4, 4, 0, 0, 0, 4],
});
const SETTLED = beat({
   times: [0, 0.72, 0.76, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   scale: [0.4, 0.4, 1, 1, 1, 0.4],
});

const SECTION_TOPS = [45, 78, 111];

/* `## Model` heading, two body lines; hairline separators between */
const Sections = ({ heading, body }: { heading: string; body: string }) => (
   <>
      {SECTION_TOPS.map((top) => (
         <g key={top}>
            <Bar box={[256, top, 16, 4]} fill={heading} />
            <Bar box={[256, top + 9, 32, 3]} fill={body} />
            <Bar box={[256, top + 15, 24, 3]} fill={body} />
         </g>
      ))}
   </>
);

const LaneRow = ({ tint, lane }: TintProps & { lane: Lane }) => (
   <>
      <Panel box={[LANE_X, lane.top, LANE_W, LANE_H]} rx={7} />
      <Bar box={[TRACK_X, lane.top + 23, TRACK_W, 3]} fill={W10} />
      <motion.rect
         x={TRACK_X}
         y={lane.top + 23}
         width={TRACK_W}
         height={3}
         rx={1.5}
         fill={`${tint}cc`}
         style={{ originX: 0 }}
         {...loopProps(latency(lane))}
      />
      <Wire d={curveD(fanOut(lane))} />
      <Wire d={curveD(fanIn(lane))} />
      <Trace
         d={curveD(fanIn(lane))}
         color={`${tint}80`}
         width={1.5}
         loop={answer(lane)}
      />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Panel box={[26, 68, 40, 36]} />
      <Wire d="M34,80 L40,86 L34,92" stroke={tint} />
      <motion.g style={{ originX: 0 }} {...loopProps(PROMPT_TYPE)}>
         <Bar box={[44, 84, 16, 4]} fill={W40} />
      </motion.g>
      <Wire d={`M${PROMPT_OUT} H${HUB_OUT[0]}`} />
      <circle
         cx={80}
         cy={86}
         r={7}
         fill={INK}
         stroke={`${tint}80`}
         vectorEffect={NON_SCALING}
      />
      <circle cx={80} cy={86} r={2.2} fill={tint} />
      {LANES.map((lane) => (
         <LaneRow key={lane.name} tint={tint} lane={lane} />
      ))}
      <Panel box={[250, 34, 44, 104]} />
      <Wire d="M256,70.5 H288 M256,103.5 H288" stroke={W06} />
      <Sections heading={W06} body={W06} />
      <motion.g {...loopProps(SECTIONS)}>
         <Sections heading={`${tint}99`} body={W16} />
      </motion.g>
   </>
);

const REQUESTS = LANES.map(requestKeys);

const BedrockVariant = ({ tint }: TintProps) => (
   <Shell
      tint={tint}
      focus="54% 43%"
      texture={RAILS}
      stage={<Stage tint={tint} />}
   >
      {LANES.map((lane, i) => (
         <Packet key={lane.name} color={tint} loop={REQUESTS[i]} />
      ))}
      <Pip at={[287, 43]} color={GREEN} loop={SETTLED} />
      {LANES.map((lane) => (
         <Label key={lane.name} at={[TRACK_X, lane.top + 12]}>
            {lane.name}
         </Label>
      ))}
      <Label at={[26, 114]}>CONVERSE</Label>
   </Shell>
);

export default BedrockVariant;
