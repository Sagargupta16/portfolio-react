import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/* Stock Market Prediction -- one LSTM, four tickers, a 5 day window walking
 * the training data, then a one step ahead backtest overlaid on the last 30
 * days. Predicted never runs past the actual line: it is an overlay, not a
 * forecast. */

const BASE_GRADIENT = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";
const HAIRLINE = "rgba(255,255,255,0.08)";
const GRIDLINE = "rgba(255,255,255,0.04)";
const SMA_STROKE = "rgba(255,255,255,0.12)";
const LABEL_DIM = "rgba(255,255,255,0.3)";
const LABEL_MID = "rgba(255,255,255,0.35)";
const LABEL_BRIGHT = "rgba(255,255,255,0.5)";
const TRACK_FILL = "rgba(255,255,255,0.1)";
const ACTUAL_BLUE = "#60a5fa";
const GREEN = "#22c55e";
const EASE = "easeInOut" as const;

/* Motion runs opacity loops through WAAPI, where a single ease is applied
 * across the whole iteration and the `times` offsets land at eased moments.
 * A per-segment ease array puts the easing on each keyframe instead, so the
 * WAAPI (opacity) and JS (transform, pathLength) loops share one schedule. */
const perSegment = (keyframeCount: number) =>
   Array.from({ length: keyframeCount - 1 }, () => EASE);

/* Loop timing. Everything returns to its start every 6 s; the ticker row and
 * the MSE bar walk four values on a 24 s schedule (6 s per ticker). */
const CYCLE = 6;
const SEGMENT = 6;
const TICKER_CYCLE = SEGMENT * 4;
const FADE = 0.3;
const at = (seconds: number) => seconds / TICKER_CYCLE;

const TEST_SPLIT = 65; // train | test divider, in chart percent

// viewBox 0 0 100 60, preserveAspectRatio none -- x/y map to % of chart area
const ACTUAL_D =
   "M 0 46 L 8 41 L 15 44 L 23 35 L 30 38 L 38 30 L 45 33 L 52 24 L 58 27 L 65 24 L 72 20 L 79 26 L 86 17 L 93 21 L 100 14";
const ACTUAL_AREA_D = `${ACTUAL_D} L 100 60 L 0 60 Z`;
const SMA_D = "M 0 47 L 15 44 L 30 39 L 45 33 L 65 28 L 80 23 L 100 18";
// same x nodes as the actual line across the test window, y visibly off
const PREDICTED_D = "M 65 27 L 72 24 L 79 22 L 86 23 L 93 18 L 100 19";
const TEST_START_Y = "40%"; // actual line y at x=65 (24 / 60)

const mono: CSSProperties = {
   fontFamily: MONO_FONT,
   fontWeight: 700,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

/* Ticker row: ticker i is lit during segment i, crossfading over FADE at each
 * boundary. The first and last segments wrap across the loop seam. */
const TICKERS = ["AAPL", "MSFT", "AMZN", "TSLA"];
const LO = 0.25;
const HI = 0.9;

const litWindow = (i: number): { opacity: number[]; times: number[] } => {
   const start = i * SEGMENT;
   const end = start + SEGMENT;
   if (i === 0) {
      return {
         opacity: [LO, HI, HI, LO, LO],
         times: [0, at(FADE), at(end), at(end + FADE), 1],
      };
   }
   if (end === TICKER_CYCLE) {
      return {
         opacity: [HI, LO, LO, HI, HI],
         times: [0, at(FADE), at(start), at(start + FADE), 1],
      };
   }
   return {
      opacity: [LO, LO, HI, HI, LO, LO],
      times: [0, at(start), at(start + FADE), at(end), at(end + FADE), 1],
   };
};

/* MSE bar: relative lengths per ticker in TICKERS order. Holds from t = 4
 * to 6 of each segment, spanning the readout's visible window (4.6..6), and
 * moves while the readout is hidden. No digits are rendered. */
const MSE_BAR_SCALE = [0.47, 0.79, 0.36, 1];
const MSE_BAR_KEYFRAMES = [
   MSE_BAR_SCALE[3],
   ...MSE_BAR_SCALE.flatMap((s) => [s, s]),
];
const MSE_BAR_TIMES = [
   0,
   ...MSE_BAR_SCALE.flatMap((_, i) => [
      at(i * SEGMENT + 4),
      at((i + 1) * SEGMENT),
   ]),
];

/* Sliding window: 9% wide, travels 620% of its own width so its right edge
 * parks on the divider (9 + 9 * 6.2 = 64.8). Snaps home while invisible. */
const BRACKET_X = ["0%", "0%", "620%", "620%", "0%"];
const BRACKET_X_TIMES = [0, 0.067, 0.467, 0.97, 1];
const BRACKET_OPACITY = [0, 0, 1, 1, 0, 0];
const BRACKET_OPACITY_TIMES = [0, 0.067, 0.117, 0.9, 0.97, 1];

/* Predicted overlay draws 2.6 s -> 4.6 s, holds, fades, rewinds unseen. */
const PREDICTED_TIMES = [0, 0.05, 0.433, 0.767, 0.9, 0.98, 1];
const PREDICTED_LENGTH = [0, 0, 0, 1, 1, 1, 0];
const PREDICTED_OPACITY = [0, 1, 1, 1, 1, 0, 0];

/* Readout fades in once the overlay has finished drawing (4.6 s -> 4.9 s),
 * holds, then fades out with it. */
const READOUT_OPACITY = [0, 0, 1, 1, 0];
const READOUT_TIMES = [0, 0.767, 0.817, 0.9, 1];

const FEATURES = ["O", "H", "L", "C", "V", "AVG"];

const CHIP_PULSE = [0.4, 1, 0.4];

const Backdrop = ({ tint }: { tint: string }) => (
   <>
      <div
         style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 72% 18%, ${tint}14, transparent 62%)`,
         }}
      />
      <div
         style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage: `radial-gradient(circle, ${ACTUAL_BLUE} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
         }}
      />
   </>
);

const LstmChip = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         top: "9%",
         left: "6%",
         display: "inline-flex",
         alignItems: "center",
         gap: 4,
         padding: "3px 7px",
         borderRadius: 5,
         border: `1px solid ${tint}35`,
         background: `${tint}0a`,
      }}
   >
      <motion.span
         animate={{ opacity: CHIP_PULSE }}
         transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: perSegment(CHIP_PULSE.length),
         }}
         style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: tint,
            display: "block",
         }}
      />
      <span
         style={{
            ...mono,
            fontSize: 7.5,
            letterSpacing: "0.12em",
            color: LABEL_BRIGHT,
         }}
      >
         LSTM
      </span>
   </div>
);

const TickerRow = () => (
   <div
      style={{
         position: "absolute",
         top: "10%",
         right: "6%",
         display: "flex",
         gap: 7,
      }}
   >
      {TICKERS.map((symbol, i) => {
         const lit = litWindow(i);
         return (
            <motion.span
               key={symbol}
               animate={{ opacity: lit.opacity }}
               transition={{
                  duration: TICKER_CYCLE,
                  times: lit.times,
                  repeat: Infinity,
                  ease: perSegment(lit.opacity.length),
               }}
               style={{
                  ...mono,
                  fontSize: 7.5,
                  letterSpacing: "0.08em",
                  color: ACTUAL_BLUE,
               }}
            >
               {symbol}
            </motion.span>
         );
      })}
   </div>
);

const ChartLines = ({ tint }: { tint: string }) => (
   <svg
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      style={{
         position: "absolute",
         inset: 0,
         width: "100%",
         height: "100%",
      }}
   >
      <path d={ACTUAL_AREA_D} fill={`${ACTUAL_BLUE}0a`} />
      <path
         d={SMA_D}
         fill="none"
         stroke={SMA_STROKE}
         strokeWidth={1}
         strokeLinejoin="round"
         vectorEffect="non-scaling-stroke"
      />
      <path
         d={ACTUAL_D}
         fill="none"
         stroke={ACTUAL_BLUE}
         strokeWidth={1.5}
         strokeLinecap="round"
         strokeLinejoin="round"
         vectorEffect="non-scaling-stroke"
      />
      <motion.path
         d={PREDICTED_D}
         fill="none"
         stroke={tint}
         strokeWidth={1.5}
         strokeLinecap="round"
         strokeLinejoin="round"
         vectorEffect="non-scaling-stroke"
         initial={{ pathLength: 0, opacity: 0 }}
         animate={{ pathLength: PREDICTED_LENGTH, opacity: PREDICTED_OPACITY }}
         transition={{
            duration: CYCLE,
            times: PREDICTED_TIMES,
            repeat: Infinity,
            ease: perSegment(PREDICTED_TIMES.length),
         }}
      />
   </svg>
);

/* Green test-start marker on the actual line at the divider: a pulsing dot
 * and an expanding ring. The ring fades in over its first 0.1 s so the loop
 * restart never pops a fresh ring into view. */
const MARKER_SIZE = 5;
const RING_SIZE = 12;
const MARKER_PULSE = [1, 1.4, 1];
const RING_SCALE = [1, 1, 2.4];
const RING_OPACITY = [0, 0.5, 0];
const RING_TIMES = [0, 0.05, 1];

const TestMarker = () => (
   <>
      <motion.div
         animate={{ scale: RING_SCALE, opacity: RING_OPACITY }}
         transition={{
            duration: 2,
            times: RING_TIMES,
            repeat: Infinity,
            ease: perSegment(RING_TIMES.length),
         }}
         style={{
            position: "absolute",
            left: `${TEST_SPLIT}%`,
            top: TEST_START_Y,
            width: RING_SIZE,
            height: RING_SIZE,
            margin: -RING_SIZE / 2,
            borderRadius: "50%",
            border: `1px solid ${GREEN}50`,
         }}
      />
      <motion.div
         animate={{ scale: MARKER_PULSE }}
         transition={{
            duration: 2,
            repeat: Infinity,
            ease: perSegment(MARKER_PULSE.length),
         }}
         style={{
            position: "absolute",
            left: `${TEST_SPLIT}%`,
            top: TEST_START_Y,
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            margin: -MARKER_SIZE / 2,
            borderRadius: "50%",
            background: GREEN,
         }}
      />
   </>
);

const SeqBracket = ({ tint }: { tint: string }) => (
   <motion.div
      initial={{ x: BRACKET_X[0], opacity: 0 }}
      animate={{ x: BRACKET_X, opacity: BRACKET_OPACITY }}
      transition={{
         x: {
            duration: CYCLE,
            times: BRACKET_X_TIMES,
            repeat: Infinity,
            ease: perSegment(BRACKET_X.length),
         },
         opacity: {
            duration: CYCLE,
            times: BRACKET_OPACITY_TIMES,
            repeat: Infinity,
            ease: perSegment(BRACKET_OPACITY.length),
         },
      }}
      style={{
         position: "absolute",
         left: 0,
         top: 0,
         bottom: 0,
         width: "9%",
         borderRadius: 3,
         border: `1px solid ${tint}55`,
         background: `${tint}10`,
      }}
   >
      <span
         style={{
            ...mono,
            position: "absolute",
            top: 3,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 6,
            letterSpacing: "0.08em",
            color: LABEL_BRIGHT,
         }}
      >
         SEQ 5
      </span>
   </motion.div>
);

const MseReadout = ({ tint }: { tint: string }) => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: READOUT_OPACITY }}
      transition={{
         duration: CYCLE,
         times: READOUT_TIMES,
         repeat: Infinity,
         ease: perSegment(READOUT_OPACITY.length),
      }}
      style={{
         position: "absolute",
         right: "3%",
         bottom: "6%",
         display: "flex",
         alignItems: "center",
         gap: 4,
      }}
   >
      <span
         style={{
            ...mono,
            fontSize: 7,
            letterSpacing: "0.1em",
            color: LABEL_BRIGHT,
         }}
      >
         MSE
      </span>
      <span
         style={{
            display: "block",
            width: 26,
            height: 3,
            borderRadius: 2,
            background: TRACK_FILL,
            overflow: "hidden",
         }}
      >
         <motion.span
            initial={{ scaleX: MSE_BAR_KEYFRAMES[0] }}
            animate={{ scaleX: MSE_BAR_KEYFRAMES }}
            transition={{
               duration: TICKER_CYCLE,
               times: MSE_BAR_TIMES,
               repeat: Infinity,
               ease: perSegment(MSE_BAR_KEYFRAMES.length),
            }}
            style={{
               display: "block",
               width: "100%",
               height: "100%",
               borderRadius: 2,
               background: tint,
               transformOrigin: "left center",
            }}
         />
      </span>
   </motion.div>
);

const PriceChart = ({ tint }: { tint: string }) => (
   <div
      style={{
         position: "absolute",
         left: "12%",
         right: "9%",
         top: "26%",
         bottom: "22%",
         borderLeft: `1px solid ${HAIRLINE}`,
         borderBottom: `1px solid ${HAIRLINE}`,
      }}
   >
      {["33%", "66%"].map((top) => (
         <div
            key={top}
            style={{
               position: "absolute",
               left: 0,
               right: 0,
               top,
               height: 1,
               background: GRIDLINE,
            }}
         />
      ))}

      <ChartLines tint={tint} />

      {/* train | test divider */}
      <div
         style={{
            position: "absolute",
            left: `${TEST_SPLIT}%`,
            top: 0,
            bottom: 0,
            borderLeft: `1px dashed ${tint}30`,
         }}
      />
      <span
         style={{
            ...mono,
            position: "absolute",
            left: `calc(${TEST_SPLIT}% + 4px)`,
            top: 2,
            fontSize: 6.5,
            letterSpacing: "0.1em",
            color: LABEL_MID,
         }}
      >
         TEST 30D
      </span>

      <TestMarker />
      <SeqBracket tint={tint} />
      <MseReadout tint={tint} />
   </div>
);

const FeatureRow = () => (
   <div
      style={{
         position: "absolute",
         left: "12%",
         bottom: "12%",
         display: "flex",
         gap: 6,
      }}
   >
      {FEATURES.map((f) => (
         <span
            key={f}
            style={{
               ...mono,
               fontSize: 6,
               letterSpacing: "0.14em",
               color: LABEL_DIM,
            }}
         >
            {f}
         </span>
      ))}
   </div>
);

const MlScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: BASE_GRADIENT,
      }}
   >
      <Backdrop tint={tint} />
      <LstmChip tint={tint} />
      <TickerRow />
      <PriceChart tint={tint} />
      <FeatureRow />
   </div>
);

export default MlScene;
