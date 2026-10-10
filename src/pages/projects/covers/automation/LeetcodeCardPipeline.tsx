import { useId } from "react";
import { motion } from "motion/react";
import {
   CYCLE,
   NON_SCALING,
   PANEL_SOLID,
   WHITE_07,
   WHITE_35,
   WHITE_55,
   loop,
} from "./sceneTokens";
import type { PipelineProps, Point } from "./sceneTokens";
import { Label, Panel, Rule, SceneSvg } from "./primitives";
import { QueryOverlay, QueryPanel } from "./QueryStage";

/* LeetCode Card Action (leetcode_card.py render_card): one query to
   leetcode.com/graphql, then the contest rating history draws itself in as a
   line, the area under it fills, the peak gets its pulsing ring, and the
   Easy, Medium and Hard solved bars grow beside the badge headline. */

const CARD = { x: 540, y: 110, w: 924, h: 690 };
const TARGETS: Point[] = [[CARD.x, CARD.y + CARD.h / 2]];

/* Rating chart box and the contest history drawn into it. */
const CHART = { x0: 584, x1: 1110, y0: 290, y1: 720 };
const HISTORY = [
   0.06, 0.14, 0.1, 0.24, 0.32, 0.27, 0.44, 0.52, 0.47, 0.7, 1, 0.86, 0.9, 0.84,
];
const PEAK_INDEX = HISTORY.indexOf(Math.max(...HISTORY));
const POINTS: Point[] = HISTORY.map((r, i) => [
   CHART.x0 + ((CHART.x1 - CHART.x0) * i) / (HISTORY.length - 1),
   CHART.y1 - (CHART.y1 - CHART.y0) * r,
]);
const [PEAK_X, PEAK_Y] = POINTS[PEAK_INDEX];
const [LAST_X, LAST_Y] = POINTS.at(-1) ?? POINTS[0];
const LINE_POINTS = POINTS.map(
   ([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`,
).join(" L");
const LINE = `M${LINE_POINTS}`;
const AREA = `${LINE} L${CHART.x1} ${CHART.y1} L${CHART.x0} ${CHART.y1} Z`;
const GRID_YS = [CHART.y0, (CHART.y0 + CHART.y1) / 2, CHART.y1];

/* Headline and solved panel: badge, rating line, then one bar per level. */
const SIDE_X = 1166;
const TRACK_W = 266;
const LEVELS = [
   { id: "easy", y: 494, share: 0.92, alpha: "ff" },
   { id: "medium", y: 584, share: 0.7, alpha: "b3" },
   { id: "hard", y: 674, share: 0.42, alpha: "73" },
];

/* Beats, cycle seconds. */
const DRAW_FROM = 1.7;
const DRAW_TO = 3.2;
const PEAK_AT = 3.3;
const RESET = 5.3;

/* Path draws need user-unit strokes: no non-scaling-stroke here (Chrome
   would measure the dash in user units and stroke it in screen units). */
const RatingLine = ({
   tint,
   gradientId,
}: {
   tint: string;
   gradientId: string;
}) => (
   <>
      <defs>
         <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={tint} stopOpacity={0.26} />
            <stop offset="1" stopColor={tint} stopOpacity={0} />
         </linearGradient>
      </defs>
      {GRID_YS.map((y) => (
         <Rule
            key={y}
            x={CHART.x0}
            y={y}
            w={CHART.x1 - CHART.x0}
            color={WHITE_07}
         />
      ))}
      <motion.path
         d={AREA}
         fill={`url(#${gradientId})`}
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(
            0,
            DRAW_TO - 0.2,
            DRAW_TO + 0.35,
            RESET,
            RESET + 0.3,
            CYCLE,
         )}
      />
      <motion.path
         d={LINE}
         fill="none"
         stroke={tint}
         strokeWidth={10}
         strokeLinecap="round"
         strokeLinejoin="round"
         animate={{
            pathLength: [0, 0, 1, 1, 1, 0],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={{
            pathLength: loop(0, DRAW_FROM, DRAW_TO, RESET, RESET + 0.3, CYCLE),
            opacity: loop(
               0,
               DRAW_FROM - 0.05,
               DRAW_FROM + 0.05,
               RESET,
               RESET + 0.3,
               CYCLE,
            ),
         }}
      />
      <motion.circle
         cx={LAST_X}
         cy={LAST_Y}
         r={13}
         fill={tint}
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(
            0,
            DRAW_TO - 0.05,
            DRAW_TO + 0.1,
            RESET,
            RESET + 0.3,
            CYCLE,
         )}
      />
      <motion.circle
         cx={PEAK_X}
         cy={PEAK_Y}
         r={20}
         fill="none"
         stroke={tint}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
         animate={{
            opacity: [0, 0, 0.9, 0, 0.9, 0, 0],
            scale: [1, 1, 1, 2.6, 1, 2.6, 1],
         }}
         transition={loop(0, PEAK_AT, PEAK_AT + 0.02, 4.2, 4.22, 5.1, CYCLE)}
      />
   </>
);

/* One difficulty: key line, track, and the solved share growing in. */
const Level = ({
   tint,
   level,
   index,
}: {
   tint: string;
   level: (typeof LEVELS)[number];
   index: number;
}) => {
   const at = 1.8 + index * 0.2;
   return (
      <>
         <Rule x={SIDE_X} y={level.y} w={60} color={`${tint}${level.alpha}`} />
         <rect
            x={SIDE_X}
            y={level.y + 18}
            width={TRACK_W}
            height={12}
            rx={6}
            fill={WHITE_07}
         />
         <motion.rect
            x={SIDE_X}
            y={level.y + 18}
            width={TRACK_W * level.share}
            height={12}
            rx={6}
            fill={`${tint}${level.alpha}`}
            animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
            transition={loop(0, at, at + 0.8, RESET, RESET + 0.35, CYCLE)}
            style={{ originX: 0 }}
         />
      </>
   );
};

const Headline = ({ tint }: { tint: string }) => (
   <>
      <rect x={SIDE_X} y={284} width={220} height={36} rx={7} fill={tint} />
      <Rule x={SIDE_X} y={362} w={240} color={WHITE_35} />
      <rect x={SIDE_X} y={396} width={136} height={26} rx={5} fill={WHITE_55} />
      {LEVELS.map((level, i) => (
         <Level key={level.id} tint={tint} level={level} index={i} />
      ))}
   </>
);

const LeetcodeCardPipeline = ({ tint }: PipelineProps) => {
   const gradientId = useId();
   return (
      <>
         <SceneSvg>
            <QueryPanel tint={tint} fields={[104, 128, 84]} targets={TARGETS} />
            <Panel {...CARD} fill={PANEL_SOLID} />
            <RatingLine tint={tint} gradientId={gradientId} />
            <Headline tint={tint} />
         </SceneSvg>
         <QueryOverlay tint={tint} label="GRAPHQL" targets={TARGETS} />
         <Label x={CARD.x + 32} y={CARD.y + 44} text="LEETCODE" color={tint} />
         <motion.div
            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
            transition={loop(
               0,
               PEAK_AT,
               PEAK_AT + 0.3,
               RESET,
               RESET + 0.3,
               CYCLE,
            )}
         >
            <Label
               x={PEAK_X}
               y={PEAK_Y - 44}
               text="PEAK"
               color={tint}
               align="center"
            />
         </motion.div>
      </>
   );
};

export default LeetcodeCardPipeline;
