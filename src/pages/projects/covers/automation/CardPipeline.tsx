import { motion } from "motion/react";
import type { Easing } from "motion/react";
import {
   CYCLE,
   WHITE_03,
   WHITE_10,
   WHITE_18,
   WHITE_35,
   WHITE_50,
   secs,
} from "./sceneTokens";
import type { PipelineProps } from "./sceneTokens";
import SvgPipeline, {
   DRAW_START,
   FADE_END,
   HOLD_END,
   RESET_AT,
} from "./SvgPipeline";

/* API card actions (GitHub stats, LeetCode, OSS contributions): a GraphQL
   response lands in the query braces, then a card.svg whose bars and line
   draw in. The shared stages and dots live in SvgPipeline. */

/* One ease per keyframe segment, so the WAAPI opacity track and the frameloop
   transform tracks share one schedule; see perSegment in primitives.tsx. */
const perSegment = (times: number[], ease: Easing = "easeInOut"): Easing[] =>
   times.slice(1).map(() => ease);

const BAR_STAGGER = 0.15;
const BAR_HEIGHTS = [12, 20, 15];
const LINE_START = 3.3;
const LINE_END = 4.1;

/* Chart line in a 100 x 100 box, peak at the fifth point. */
const LINE_POINTS = "0,82 20,64 38,72 58,40 76,18 100,36";
const PEAK = { left: "76%", top: "18%" };

/* Curly brace of the query glyph; the closing one is mirrored. */
const Brace = ({ flip }: { flip: boolean }) => (
   <svg
      width="4"
      height="14"
      viewBox="0 0 4 14"
      style={{ display: "block", transform: flip ? "scaleX(-1)" : undefined }}
   >
      <path
         d="M4,0 Q1,0 1,3 L1,5.5 Q1,7 0,7 Q1,7 1,8.5 L1,11 Q1,14 4,14"
         stroke={WHITE_35}
         strokeWidth="1"
         fill="none"
      />
   </svg>
);

/* Two response fields sliding into the query braces. */
const FIELD_TIMES = secs(0, 0.8, 1.2, HOLD_END, FADE_END, CYCLE);
const QueryGlyph = () => (
   <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      <Brace flip={false} />
      <motion.div
         animate={{ opacity: [0, 0, 1, 1, 0, 0], x: [-3, -3, 0, 0, 0, -3] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(FIELD_TIMES),
            times: FIELD_TIMES,
         }}
         style={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
         {[10, 7].map((w) => (
            <div
               key={w}
               style={{
                  width: w,
                  height: 2,
                  borderRadius: 1,
                  background: WHITE_50,
               }}
            />
         ))}
      </motion.div>
      <Brace flip />
   </div>
);

/* One bar growing up from the card baseline, then fading before the reset. */
const Bar = ({
   tint,
   index,
   height,
}: {
   tint: string;
   index: number;
   height: number;
}) => {
   const at = DRAW_START + index * BAR_STAGGER;
   const times = secs(0, at, at + 0.35, HOLD_END, FADE_END, RESET_AT, CYCLE);
   return (
      <motion.div
         animate={{
            scaleY: [0, 0, 1, 1, 1, 0, 0],
            opacity: [1, 1, 1, 1, 0, 0, 1],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(times),
            times,
         }}
         style={{
            width: 5,
            height,
            borderRadius: 1,
            background: `${tint}80`,
            originY: 1,
         }}
      />
   );
};

/* The line is uncovered left to right by a window sliding in while its
   content slides the opposite way, so the stroke stays put: transform only. */
const LINE_TIMES = secs(
   0,
   LINE_START,
   LINE_END,
   HOLD_END,
   FADE_END,
   RESET_AT,
   CYCLE,
);
const LINE_TRANSITION = {
   duration: CYCLE,
   repeat: Infinity,
   ease: perSegment(LINE_TIMES),
   times: LINE_TIMES,
};

const ChartLine = ({ tint }: { tint: string }) => (
   <motion.div
      animate={{
         x: ["-100%", "-100%", "0%", "0%", "0%", "-100%", "-100%"],
         opacity: [1, 1, 1, 1, 0, 0, 1],
      }}
      transition={LINE_TRANSITION}
      style={{
         position: "absolute",
         left: 30,
         right: 6,
         top: 16,
         bottom: 9,
         overflow: "hidden",
      }}
   >
      <motion.div
         animate={{ x: ["100%", "100%", "0%", "0%", "0%", "100%", "100%"] }}
         transition={LINE_TRANSITION}
         style={{ position: "absolute", inset: 0 }}
      >
         <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
               position: "absolute",
               inset: 0,
               width: "100%",
               height: "100%",
               overflow: "visible",
            }}
         >
            <polyline
               points={LINE_POINTS}
               stroke={tint}
               strokeWidth="1.25"
               fill="none"
               vectorEffect="non-scaling-stroke"
            />
         </svg>
         <div
            style={{
               position: "absolute",
               ...PEAK,
               width: 4,
               height: 4,
               margin: -2,
               borderRadius: "50%",
               background: tint,
            }}
         />
      </motion.div>
   </motion.div>
);

/* The card.svg face: static title strip, three bars and the chart line. */
const CardFace = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         inset: 0,
         borderRadius: 6,
         border: `1px solid ${WHITE_10}`,
         background: WHITE_03,
         overflow: "hidden",
      }}
   >
      <div
         style={{
            position: "absolute",
            left: 7,
            top: 7,
            width: 24,
            height: 2,
            borderRadius: 1,
            background: WHITE_18,
         }}
      />
      <div
         style={{
            position: "absolute",
            left: 7,
            bottom: 9,
            display: "flex",
            alignItems: "flex-end",
            gap: 3,
         }}
      >
         {BAR_HEIGHTS.map((height, i) => (
            <Bar key={height} tint={tint} index={i} height={height} />
         ))}
      </div>
      <ChartLine tint={tint} />
   </div>
);

const CardPipeline = ({ tint, stages }: PipelineProps) => (
   <SvgPipeline
      tint={tint}
      stages={stages}
      input={<QueryGlyph />}
      output={<CardFace tint={tint} />}
   />
);

export default CardPipeline;
