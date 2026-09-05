import { motion } from "motion/react";
import { GREEN, MONO_FONT } from "@/constants/theme";

interface SortAnimProps {
   color: string;
}

interface Point {
   x: number;
   y: number;
}

type LoopEase = "linear" | "easeOut" | "easeInOut";

/* Competitive programming as a contest record, not an algorithms lecture.
   Four problem squares (Q1..Q4) turn Accepted one at a time, Q1/Q2 fast and
   Q3/Q4 slow like a real Weekly Contest. The rating dot then climbs the
   rating curve, crosses the dashed Knight threshold (hairline and label snap
   bright, dot pulses) and a rank ring locks on the peak. Every animated node
   fades in the last tenth of the loop and resets while invisible. */

const LOOP = 5;

/* Beats as fractions of LOOP (5 s):
   0.00 to 0.08  resting state, rating dot fades in on the first vertex
   0.08 / 0.18 / 0.30 / 0.44  Q1..Q4 turn Accepted
   0.46 to 0.80  rating dot climbs vertex to vertex
   0.71          dot crosses the Knight hairline, threshold snaps bright
   0.80 to 0.90  rank ring fades in around the peak and holds
   0.90 to 0.98  every animated node fades out
   0.98 to 1.00  dot snaps back to the first vertex while invisible */

const FADE_START = 0.9;
const FADE_END = 0.98;
const RESET_AT = 0.99;

const DOT_IN = 0.06;
const ACCEPTED_POP = 0.03;
const CLIMB_START = 0.46;
const CLIMB_END = 0.8;
/** The dot's y passes the hairline inside the fifth curve segment. */
const KNIGHT_CROSS = 0.71;
const PULSE = 0.03;
const SNAP = 0.01;
const RING_IN = 0.06;

const REST_ALPHA = 0.35;

/* Static geometry, canvas px (root is 80 x 80) */
const PROBLEM_SIZE = 10;
const PROBLEM_TOP = 12;

/* Q1..Q4: square position and the moment its verdict turns Accepted */
const PROBLEMS = [
   { left: 14, acceptedAt: 0.08 },
   { left: 28, acceptedAt: 0.18 },
   { left: 42, acceptedAt: 0.3 },
   { left: 56, acceptedAt: 0.44 },
];

const START: Point = { x: 6, y: 70 };
const PEAK: Point = { x: 74, y: 32 };
const CURVE: Point[] = [
   START,
   { x: 18, y: 62 },
   { x: 30, y: 66 },
   { x: 42, y: 54 },
   { x: 54, y: 46 },
   { x: 66, y: 36 },
   PEAK,
];
const CURVE_POINTS = CURVE.map((p) => `${p.x},${p.y}`).join(" ");

const THRESHOLD_Y = 42;
const THRESHOLD_X1 = 29;
const THRESHOLD_X2 = 76;

const DOT_SIZE = 5;
const RING_SIZE = 9;

/* Rating dot: waits on the first vertex, climbs with evenly spaced vertex
   times, holds the peak, fades, then returns to the start while invisible. */
const SEGMENTS = CURVE.length - 1;
const VERTEX_TIMES = CURVE.map(
   (_, i) => CLIMB_START + (i * (CLIMB_END - CLIMB_START)) / SEGMENTS,
);
const DOT_PATH = [START, ...CURVE, PEAK, START, START];
const DOT_X = DOT_PATH.map((p) => p.x);
const DOT_Y = DOT_PATH.map((p) => p.y);
const DOT_TIMES = [0, ...VERTEX_TIMES, FADE_END, RESET_AT, 1];
const DOT_OPACITY = [0, 1, 1, 0, 0];
const DOT_OPACITY_TIMES = [0, DOT_IN, FADE_START, FADE_END, 1];
const DOT_SCALE = [1, 1, 1.4, 1, 1];
const DOT_SCALE_TIMES = [
   0,
   KNIGHT_CROSS,
   KNIGHT_CROSS + PULSE,
   KNIGHT_CROSS + 2 * PULSE,
   1,
];

const ACCEPTED_OPACITY = [0, 0, 1, 1, 0, 0];
const ACCEPTED_SCALE = [0.8, 0.8, 1, 1, 1, 0.8];

const THRESHOLD_OPACITY = [
   REST_ALPHA,
   REST_ALPHA,
   1,
   1,
   REST_ALPHA,
   REST_ALPHA,
];
const THRESHOLD_TIMES = [
   0,
   KNIGHT_CROSS,
   KNIGHT_CROSS + SNAP,
   FADE_START,
   FADE_END,
   1,
];

const RING_OPACITY = [0, 0, 1, 1, 0, 0];
const RING_TIMES = [0, CLIMB_END, CLIMB_END + RING_IN, FADE_START, FADE_END, 1];

const label: React.CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 6,
   fontWeight: 700,
   letterSpacing: 0.3,
   lineHeight: 1,
   whiteSpace: "nowrap",
};

const fullCanvas: React.CSSProperties = {
   position: "absolute",
   inset: 0,
};

const problemBox = (left: number): React.CSSProperties => ({
   position: "absolute",
   left,
   top: PROBLEM_TOP,
   width: PROBLEM_SIZE,
   height: PROBLEM_SIZE,
   boxSizing: "border-box",
   borderRadius: 2,
});

/* One easing per segment, not one string: Motion applies a single `ease`
   across the whole iteration on WAAPI-accelerated values (opacity) but per
   segment on the JS clock (x, y, scale), so the tracks drift apart. */
const loop = (times: number[], ease: LoopEase = "easeInOut") => ({
   duration: LOOP,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

interface ProblemProps extends SortAnimProps {
   left: number;
   acceptedAt: number;
}

/* One contest problem: static outline plus an Accepted fill that pops in. */
const Problem = ({ color, left, acceptedAt }: ProblemProps) => (
   <>
      <div style={{ ...problemBox(left), border: `1px solid ${color}66` }} />
      <motion.div
         animate={{ opacity: ACCEPTED_OPACITY, scale: ACCEPTED_SCALE }}
         transition={loop(
            [0, acceptedAt, acceptedAt + ACCEPTED_POP, FADE_START, FADE_END, 1],
            "easeOut",
         )}
         style={{
            ...problemBox(left),
            background: `${GREEN}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <svg
            width={6}
            height={6}
            viewBox="0 0 6 6"
            style={{ display: "block" }}
         >
            <path
               d="M1 3.2 L2.5 4.6 L5 1.4"
               fill="none"
               stroke={GREEN}
               strokeWidth={1.1}
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </motion.div>
   </>
);

/* Faint rating curve the dot travels along. */
const RatingCurve = ({ color }: SortAnimProps) => (
   <svg
      viewBox="0 0 80 80"
      width={80}
      height={80}
      style={fullCanvas}
      fill="none"
   >
      <polyline
         points={CURVE_POINTS}
         stroke={`${color}4d`}
         strokeWidth={1}
         strokeLinejoin="round"
         strokeLinecap="round"
      />
   </svg>
);

/* Dashed Knight hairline and its label: rest at 35%, snap to full on cross. */
const KnightThreshold = ({ color }: SortAnimProps) => (
   <motion.div
      animate={{ opacity: THRESHOLD_OPACITY }}
      transition={loop(THRESHOLD_TIMES, "linear")}
      style={fullCanvas}
   >
      <span style={{ ...label, left: 4, top: THRESHOLD_Y - 3, color }}>
         KNIGHT
      </span>
      <svg viewBox="0 0 80 80" width={80} height={80} style={fullCanvas}>
         <line
            x1={THRESHOLD_X1}
            y1={THRESHOLD_Y}
            x2={THRESHOLD_X2}
            y2={THRESHOLD_Y}
            stroke={color}
            strokeWidth={0.75}
            strokeDasharray="2 2"
         />
      </svg>
   </motion.div>
);

const RatingDot = ({ color }: SortAnimProps) => (
   <motion.div
      animate={{ x: DOT_X, y: DOT_Y, scale: DOT_SCALE, opacity: DOT_OPACITY }}
      transition={{
         x: loop(DOT_TIMES),
         y: loop(DOT_TIMES),
         scale: loop(DOT_SCALE_TIMES),
         opacity: loop(DOT_OPACITY_TIMES, "linear"),
      }}
      style={{
         position: "absolute",
         left: -DOT_SIZE / 2,
         top: -DOT_SIZE / 2,
         width: DOT_SIZE,
         height: DOT_SIZE,
         borderRadius: "50%",
         background: color,
      }}
   />
);

/* Rank locked: outline ring around the peak vertex. */
const RankRing = ({ color }: SortAnimProps) => (
   <motion.div
      animate={{ opacity: RING_OPACITY }}
      transition={loop(RING_TIMES, "easeOut")}
      style={{
         position: "absolute",
         left: PEAK.x - RING_SIZE / 2,
         top: PEAK.y - RING_SIZE / 2,
         width: RING_SIZE,
         height: RING_SIZE,
         boxSizing: "border-box",
         borderRadius: "50%",
         border: `1px solid ${color}99`,
      }}
   />
);

const SortAnim = ({ color }: SortAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      <span style={{ ...label, left: 4, top: 3, color: `${color}e6` }}>
         CONTEST
      </span>

      {PROBLEMS.map((problem) => (
         <Problem key={problem.left} color={color} {...problem} />
      ))}

      <RatingCurve color={color} />
      <KnightThreshold color={color} />
      <RankRing color={color} />
      <RatingDot color={color} />
   </div>
);

export default SortAnim;
