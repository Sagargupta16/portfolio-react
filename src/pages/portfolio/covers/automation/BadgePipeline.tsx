import { motion } from "motion/react";
import {
   CENTER_Y,
   CYCLE,
   WHITE_03,
   WHITE_10,
   WHITE_35,
   WHITE_50,
   caption,
   secs,
} from "./sceneTokens";
import type { PipelineProps } from "./sceneTokens";
import {
   Hairline,
   PulseRing,
   STAGE_WIDTH,
   StageBox,
   SuccessDot,
   TravelDot,
} from "./primitives";

/* Credly Badge README Action: cron -> badges.json -> categorize into three
   rows -> splice between the START/END markers of README.md. */

const CATEGORIZE_LEFT_PCT = 52;
const README_RIGHT = "8%";
const README_WIDTH = 58;
const SORT_START = 2.6;
const SORT_STAGGER = 0.2;
const SORT_TRAVEL = 0.6;
const ROW_COUNTS = [5, 3, 4];
const ROW_TOPS = [15, 25, 35];
const MARKER_TOPS = ["18%", "84%"];

/* The main hairline stops at the categorize box. The fan wrapper then spans
   from that box's right edge to the README panel's left edge, so both ends
   meet their boxes at any card width instead of only near 343 px. */
const HAIRLINE_RIGHT = `calc(${100 - CATEGORIZE_LEFT_PCT}% - ${STAGE_WIDTH}px)`;
const FAN_LEFT = `calc(${CATEGORIZE_LEFT_PCT}% + ${STAGE_WIDTH}px)`;
const FAN_RIGHT = `calc(${README_RIGHT} + ${README_WIDTH}px)`;
const FAN_TOP = "42%";
const FAN_HEIGHT = "16%";
/* Lane end heights inside the fan wrapper: top, middle and bottom row. */
const FAN_TARGETS = [0, 50, 100];

interface SortLane {
   dy: -1 | 0 | 1;
   top: string;
   height: string;
}

/* Lane tracks inside the fan wrapper; every dot leaves from its middle. */
const SORT_LANES: SortLane[] = [
   { dy: -1, top: "0%", height: "50%" },
   { dy: 0, top: "50%", height: "0%" },
   { dy: 1, top: "50%", height: "50%" },
];

/* Fetched payload inside the first stage. */
const PayloadDots = () => (
   <motion.div
      animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [-3, -3, 0, 0, -3, -3] }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         ease: "easeInOut",
         times: secs(0, 0.8, 1.3, 5.4, 5.8, CYCLE),
      }}
      style={{ display: "flex", flexDirection: "column", gap: 3 }}
   >
      {[0, 1, 2].map((i) => (
         <div
            key={i}
            style={{
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: WHITE_50,
            }}
         />
      ))}
   </motion.div>
);

/* Static three-way split glyph inside the categorize stage. */
const ForkGlyph = () => (
   <svg width="16" height="12" viewBox="0 0 16 12" style={{ display: "block" }}>
      <path
         d="M0,6 L6,6 M6,6 L16,1 M6,6 L16,6 M6,6 L16,11"
         stroke={WHITE_35}
         strokeWidth="1"
         fill="none"
      />
   </svg>
);

/* Three hairlines from the wrapper's left middle to its right-edge rows. */
const FanLines = ({ tint }: { tint: string }) => (
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
      {FAN_TARGETS.map((y) => (
         <path
            key={y}
            d={`M0,50 L100,${y}`}
            stroke={`${tint}4d`}
            strokeWidth="1"
            fill="none"
            vectorEffect="non-scaling-stroke"
         />
      ))}
   </svg>
);

/* Fan lines plus the three sort dots, anchored to the boxes they connect. */
const SortFan = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: FAN_LEFT,
         right: FAN_RIGHT,
         top: FAN_TOP,
         height: FAN_HEIGHT,
      }}
   >
      <FanLines tint={tint} />
      {SORT_LANES.map((lane, i) => (
         <TravelDot
            key={lane.dy}
            tint={tint}
            left="0%"
            width="100%"
            top={lane.top}
            height={lane.height}
            dy={lane.dy}
            from={SORT_START + i * SORT_STAGGER}
            to={SORT_START + i * SORT_STAGGER + SORT_TRAVEL}
            size={4}
         />
      ))}
   </div>
);

/* Dashed START/END markers that flash once after the splice. */
const Markers = ({ tint }: { tint: string }) => (
   <motion.div
      animate={{ opacity: [0.5, 0.5, 1, 0.5, 0.5] }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         ease: "easeInOut",
         times: secs(0, 4.6, 4.85, 5.1, CYCLE),
      }}
      style={{ position: "absolute", inset: 0 }}
   >
      {MARKER_TOPS.map((top) => (
         <div
            key={top}
            style={{
               position: "absolute",
               left: 6,
               right: 6,
               top,
               borderTop: `1px dashed ${tint}e6`,
            }}
         />
      ))}
   </motion.div>
);

/* One badge row revealing left to right as its sort dot arrives. */
const BadgeRow = ({
   tint,
   count,
   top,
   at,
}: {
   tint: string;
   count: number;
   top: number;
   at: number;
}) => (
   <motion.div
      animate={{
         scaleX: [0, 0, 1, 1, 1, 0, 0],
         opacity: [1, 1, 1, 1, 0, 0, 1],
      }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         ease: "easeInOut",
         times: secs(0, at, at + 0.35, 5.4, 5.7, 5.75, CYCLE),
      }}
      style={{
         position: "absolute",
         left: 8,
         top,
         display: "flex",
         gap: 3,
         originX: 0,
      }}
   >
      {Array.from({ length: count }, (_, i) => (
         <div
            key={i}
            style={{
               width: 5,
               height: 5,
               borderRadius: "50%",
               border: `1px solid ${tint}59`,
               background: `${tint}1a`,
            }}
         />
      ))}
   </motion.div>
);

const ReadmePanel = ({ tint, text }: { tint: string; text: string }) => (
   <div
      style={{
         position: "absolute",
         right: README_RIGHT,
         top: "50%",
         transform: CENTER_Y,
      }}
   >
      <div
         style={{
            position: "relative",
            width: README_WIDTH,
            height: 54,
            borderRadius: 6,
            border: `1px solid ${WHITE_10}`,
            background: WHITE_03,
            overflow: "hidden",
         }}
      >
         <Markers tint={tint} />
         {ROW_COUNTS.map((count, r) => (
            <BadgeRow
               key={count}
               tint={tint}
               count={count}
               top={ROW_TOPS[r]}
               at={SORT_START + SORT_TRAVEL + r * SORT_STAGGER}
            />
         ))}
      </div>
      <div style={caption(tint)}>{text}</div>
   </div>
);

const BadgePipeline = ({ tint, stages }: PipelineProps) => (
   <>
      <Hairline tint={tint} left="24%" right={HAIRLINE_RIGHT} />
      <StageBox tint={tint} left="34%" text={stages[0]}>
         <PayloadDots />
      </StageBox>
      <StageBox tint={tint} left={`${CATEGORIZE_LEFT_PCT}%`} text={stages[1]}>
         <ForkGlyph />
         <PulseRing tint={tint} at={2} />
      </StageBox>
      <TravelDot
         tint={tint}
         left="24%"
         width="30%"
         top="50%"
         from={0.1}
         to={2.1}
      />
      <SortFan tint={tint} />
      <ReadmePanel tint={tint} text={stages[2]} />
      <SuccessDot at={4.6} />
   </>
);

export default BadgePipeline;
