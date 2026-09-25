import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { CYCLE, WHITE_03, WHITE_18, WHITE_35, secs } from "./sceneTokens";
import type { PipelineProps } from "./sceneTokens";
import SvgPipeline, {
   DRAW_START,
   FADE_END,
   HOLD_END,
   OUTPUT_HEIGHT,
   RESET_AT,
} from "./SvgPipeline";

/* readme-kit: three profile.yml keys type in, then a set of matching SVG
   cards stacks into place one after another. The shared stages and dots
   live in SvgPipeline. */

/* One ease per keyframe segment, so the WAAPI opacity track and the frameloop
   transform tracks share one schedule; see perSegment in primitives.tsx. */
const perSegment = (times: number[], ease: Easing = "easeInOut"): Easing[] =>
   times.slice(1).map(() => ease);

const TYPE_START = 0.3;
const TYPE_STAGGER = 0.3;
const TYPE_DURATION = 0.25;
/* Key and value widths of each yaml line, in px. */
const YAML_LINES = [
   { key: 8, value: 12 },
   { key: 10, value: 8 },
   { key: 6, value: 14 },
];

const STACK_STAGGER = 0.3;
const STACK_DROP = -6;
const CARD_COUNT = 3;
const CARD_GAP = 4;
const CARD_HEIGHT = (OUTPUT_HEIGHT - CARD_GAP * (CARD_COUNT - 1)) / CARD_COUNT;
/* Width of the static content strip inside each stacked card, in px. */
const CARD_STRIPS = [30, 22, 36];

/* One `key: value` line typing in left to right. */
const YamlLine = ({
   tint,
   index,
   keyWidth,
   valueWidth,
}: {
   tint: string;
   index: number;
   keyWidth: number;
   valueWidth: number;
}) => {
   const at = TYPE_START + index * TYPE_STAGGER;
   const times = secs(
      0,
      at,
      at + TYPE_DURATION,
      HOLD_END,
      FADE_END,
      RESET_AT,
      CYCLE,
   );
   return (
      <motion.div
         animate={{
            scaleX: [0, 0, 1, 1, 1, 0, 0],
            opacity: [1, 1, 1, 1, 0, 0, 1],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(times),
            times,
         }}
         style={{ display: "flex", gap: 2, originX: 0 }}
      >
         <div
            style={{
               width: keyWidth,
               height: 2,
               borderRadius: 1,
               background: `${tint}b3`,
            }}
         />
         <div
            style={{
               width: valueWidth,
               height: 2,
               borderRadius: 1,
               background: WHITE_35,
            }}
         />
      </motion.div>
   );
};

const YamlGlyph = ({ tint }: { tint: string }) => (
   <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {YAML_LINES.map((line, i) => (
         <YamlLine
            key={line.key}
            tint={tint}
            index={i}
            keyWidth={line.key}
            valueWidth={line.value}
         />
      ))}
   </div>
);

/* One card outline dropping into its slot of the stack, then fading. */
const StackedCard = ({
   tint,
   index,
   strip,
}: {
   tint: string;
   index: number;
   strip: number;
}) => {
   const at = DRAW_START + index * STACK_STAGGER;
   const times = secs(0, at, at + 0.35, HOLD_END, FADE_END, CYCLE);
   return (
      <motion.div
         animate={{
            y: [STACK_DROP, STACK_DROP, 0, 0, 0, STACK_DROP],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(times),
            times,
         }}
         style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: index * (CARD_HEIGHT + CARD_GAP),
            height: CARD_HEIGHT,
            borderRadius: 3,
            border: `1px solid ${tint}59`,
            background: WHITE_03,
            display: "flex",
            alignItems: "center",
            gap: 4,
            paddingLeft: 5,
         }}
      >
         <div
            style={{
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: tint,
            }}
         />
         <div
            style={{
               width: strip,
               height: 2,
               borderRadius: 1,
               background: WHITE_18,
            }}
         />
      </motion.div>
   );
};

const CardStack = ({ tint }: { tint: string }) => (
   <>
      {CARD_STRIPS.map((strip, i) => (
         <StackedCard key={strip} tint={tint} index={i} strip={strip} />
      ))}
   </>
);

const KitPipeline = ({ tint, stages }: PipelineProps) => (
   <SvgPipeline
      tint={tint}
      stages={stages}
      input={<YamlGlyph tint={tint} />}
      output={<CardStack tint={tint} />}
   />
);

export default KitPipeline;
