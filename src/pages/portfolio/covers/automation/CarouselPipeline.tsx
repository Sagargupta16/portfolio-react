import { motion } from "motion/react";
import type { Easing } from "motion/react";
import {
   AMBER,
   CENTER_XY,
   CENTER_Y,
   CYCLE,
   WHITE_03,
   WHITE_06,
   WHITE_10,
   WHITE_18,
   WHITE_25,
   WHITE_35,
   WHITE_50,
   caption,
   secs,
} from "./sceneTokens";
import type { PipelineProps } from "./sceneTokens";
import { Hairline, SuccessDot, TravelDot } from "./primitives";

/* Instagram Autopilot: cron -> Bedrock prompt -> five slides, one filtered ->
   survivors publish to a phone -> history commits back to a file. */

/* One ease per keyframe segment, so the WAAPI opacity track and the frameloop
   transform tracks share one schedule; see perSegment in primitives.tsx. */
const perSegment = (times: number[], ease: Easing = "easeInOut"): Easing[] =>
   times.slice(1).map(() => ease);

const TILE = 14;
const TILE_GAP = 3;
const TILE_RADIUS = 3;
const FILTERED_INDEX = 2;
const SURVIVOR_SLIDE = 30;
const PROMPT_LINE_WIDTHS = [22, 16, 19];
const PHONE_RIGHT = "7%";
const PHONE_WIDTH = 22;
/* The hairline ends at the phone's left edge at any card width. */
const PHONE_LEFT_EDGE = `calc(${PHONE_RIGHT} + ${PHONE_WIDTH}px)`;

/* Three prompt lines typing in as one scaleX group. */
const PROMPT_TIMES = secs(0, 0.8, 1.7, 5.6, 5.95, CYCLE);
const PromptPanel = ({ tint, text }: { tint: string; text: string }) => (
   <div
      style={{
         position: "absolute",
         left: "30%",
         top: "50%",
         transform: CENTER_Y,
      }}
   >
      <div
         style={{
            position: "relative",
            width: 46,
            height: 34,
            borderRadius: 6,
            border: `1px solid ${tint}35`,
            background: `${tint}08`,
         }}
      >
         <motion.div
            animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               ease: perSegment(PROMPT_TIMES),
               times: PROMPT_TIMES,
            }}
            style={{
               position: "absolute",
               left: 8,
               top: 9,
               display: "flex",
               flexDirection: "column",
               gap: 5,
               originX: 0,
            }}
         >
            {PROMPT_LINE_WIDTHS.map((w) => (
               <div
                  key={w}
                  style={{
                     width: w,
                     height: 2,
                     borderRadius: 1,
                     background: WHITE_35,
                  }}
               />
            ))}
         </motion.div>
      </div>
      <div style={caption(tint)}>{text}</div>
   </div>
);

/* Lights up in sequence, then slides into the phone and resets. */
const SurvivorTile = ({ tint, index }: { tint: string; index: number }) => {
   const lit = 1.8 + 0.3 * index;
   const times = secs(0, lit, lit + 0.3, 3.4, 4.2, 5.7, CYCLE);
   return (
      <motion.div
         animate={{
            opacity: [0.12, 0.12, 0.9, 0.9, 0, 0, 0.12],
            scale: [0.7, 0.7, 1, 1, 0.45, 0.7, 0.7],
            x: [0, 0, 0, 0, SURVIVOR_SLIDE, 0, 0],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(times),
            times,
         }}
         style={{
            width: TILE,
            height: TILE,
            borderRadius: TILE_RADIUS,
            border: `1px solid ${tint}70`,
            background: `${tint}30`,
         }}
      />
   );
};

/* The content-filtered slide: dashed slot whose single amber flash kicks
   outward, so it reads as a rejection even when the tint is amber. */
const FLASH_TIMES = secs(0, 2.4, 2.47, 2.55, CYCLE);
const FilteredTile = () => (
   <div
      style={{
         position: "relative",
         width: TILE,
         height: TILE,
         borderRadius: TILE_RADIUS,
         border: `1px dashed ${WHITE_25}`,
      }}
   >
      <motion.div
         animate={{ opacity: [0, 0, 1, 0, 0], scale: [1, 1, 1.25, 1, 1] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(FLASH_TIMES),
            times: FLASH_TIMES,
         }}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: TILE_RADIUS,
            border: `1px solid ${AMBER}`,
         }}
      />
   </div>
);

const CarouselStrip = ({ tint, text }: { tint: string; text: string }) => (
   <div
      style={{
         position: "absolute",
         left: "50%",
         top: "50%",
         transform: CENTER_Y,
      }}
   >
      <div style={{ display: "flex", gap: TILE_GAP }}>
         {[0, 1, 2, 3, 4].map((i) =>
            i === FILTERED_INDEX ? (
               <FilteredTile key={i} />
            ) : (
               <SurvivorTile key={i} tint={tint} index={i} />
            ),
         )}
      </div>
      <div style={caption(tint)}>{text}</div>
   </div>
);

/* Phone frame: the published square fades in, then pagination dots. */
const PUBLISH_TIMES = secs(0, 3.9, 4.3, 5.7, 5.95, CYCLE);
const PAGINATION_TIMES = secs(0, 4.1, 4.4, 5.7, 5.95, CYCLE);
const PhoneOut = ({ tint, text }: { tint: string; text: string }) => (
   <div
      style={{
         position: "absolute",
         right: PHONE_RIGHT,
         top: "50%",
         transform: CENTER_Y,
      }}
   >
      <div
         style={{
            position: "relative",
            width: PHONE_WIDTH,
            height: 40,
            borderRadius: 5,
            border: `1px solid ${WHITE_18}`,
            background: WHITE_03,
         }}
      >
         <motion.div
            animate={{
               opacity: [0, 0, 1, 1, 0, 0],
               scale: [0.8, 0.8, 1, 1, 0.8, 0.8],
            }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               ease: perSegment(PUBLISH_TIMES),
               times: PUBLISH_TIMES,
            }}
            style={{
               position: "absolute",
               left: 2,
               top: 5,
               width: 16,
               height: 16,
               borderRadius: 2,
               background: `${tint}40`,
            }}
         />
         <motion.div
            animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               ease: perSegment(PAGINATION_TIMES),
               times: PAGINATION_TIMES,
            }}
            style={{
               position: "absolute",
               left: 3,
               top: 25,
               display: "flex",
               gap: 2,
            }}
         >
            {[0, 1, 2, 3].map((i) => (
               <div
                  key={i}
                  style={{
                     width: 2,
                     height: 2,
                     borderRadius: "50%",
                     background: WHITE_50,
                  }}
               />
            ))}
         </motion.div>
      </div>
      <div style={caption(tint)}>{text}</div>
   </div>
);

/* Lower return hairline from under the phone back to the history file. */
const ReturnPath = () => (
   <>
      <svg
         viewBox="0 0 100 100"
         preserveAspectRatio="none"
         style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
         }}
      >
         <path
            d="M89,70 L89,84 L12,84"
            stroke={WHITE_10}
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
         />
      </svg>
      <div
         style={{
            position: "absolute",
            left: "12%",
            top: "84%",
            transform: CENTER_XY,
            width: 10,
            height: 12,
            borderRadius: 2,
            border: `1px solid ${WHITE_18}`,
            background: WHITE_06,
         }}
      >
         <div
            style={{
               position: "absolute",
               top: -1,
               right: -1,
               width: 3,
               height: 3,
               background: WHITE_18,
               borderBottomLeftRadius: 1,
            }}
         />
      </div>
   </>
);

const CarouselPipeline = ({ tint, stages }: PipelineProps) => (
   <>
      <Hairline tint={tint} left="24%" right={PHONE_LEFT_EDGE} />
      <TravelDot
         tint={tint}
         left="24%"
         width="7%"
         top="50%"
         from={0.1}
         to={0.9}
      />
      <PromptPanel tint={tint} text={stages[0]} />
      <CarouselStrip tint={tint} text={stages[1]} />
      <PhoneOut tint={tint} text={stages[2]} />
      <SuccessDot at={4.4} />
      <ReturnPath />
      <TravelDot
         tint={tint}
         left="12%"
         width="77%"
         top="84%"
         reverse
         from={5}
         to={5.8}
      />
   </>
);

export default CarouselPipeline;
