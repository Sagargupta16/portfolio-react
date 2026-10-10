import { useMemo } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { EASING, MONO_FONT, TEXT_MUTED } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";

// Chart box in SVG units. The SVG scales uniformly (default meet), so stroke
// widths stay even and the HTML peak label can sit at percentages of it.
const W = 480;
const H = 150;
// Side padding clears the peak ring (r 7 plus stroke) at either end.
const PAD_X = 10;
const PAD_TOP = 28;
const PAD_BOTTOM = 8;
const BASELINE = H - PAD_BOTTOM;
// Past this share of the width the peak label hangs to the left of the point.
const LABEL_FLIP = 0.6;

// The line draws itself in (1.8 s), then the area fades up under it and the
// peak lands as the line arrives. A one-shot reveal on view; Reduced starts
// every part at its end state.
const DRAW: Variants = {
   hidden: { pathLength: 0, opacity: 0 },
   visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
         pathLength: { duration: 1.8, ease: "easeInOut" },
         opacity: { duration: 0.2 },
      },
   },
};
const FILL: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { delay: 1.6, duration: 0.6 } },
};
const LAND: Variants = {
   hidden: { opacity: 0, scale: 0.6 },
   visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 1.75, duration: 0.4, ease: EASING.cinematic },
   },
};
const SHOW: Variants = {
   hidden: { opacity: 0 },
   visible: { opacity: 1, transition: { delay: 1.9, duration: 0.3 } },
};
const MARK_ORIGIN = {
   transformBox: "fill-box",
   transformOrigin: "center",
} as const;

const toPoints = (ratings: number[]) => {
   const lo = Math.min(...ratings);
   const span = Math.max(Math.max(...ratings) - lo, 1);
   const last = Math.max(ratings.length - 1, 1);
   return ratings.map((rating, i) => ({
      x: PAD_X + ((W - 2 * PAD_X) * i) / last,
      y: PAD_TOP + (BASELINE - PAD_TOP) * (1 - (rating - lo) / span),
   }));
};

/** Line, area and marker positions for two or more [date, rating] pairs. */
const buildChart = (history: [string, number][]) => {
   const ratings = history.map(([, rating]) => rating);
   const points = toPoints(ratings);
   const line = points
      .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
   const first = points[0];
   const end = points.at(-1) ?? first;
   const peakRating = Math.max(...ratings);
   const peak = points[ratings.indexOf(peakRating)];
   return {
      line,
      area: `${line} L${end.x.toFixed(1)} ${BASELINE} L${first.x.toFixed(1)} ${BASELINE} Z`,
      end,
      peak,
      peakRating,
      flip: peak.x / W > LABEL_FLIP,
      firstYear: history[0][0].slice(0, 4),
      lastYear: history.at(-1)?.[0].slice(0, 4) ?? "",
      firstRating: ratings[0],
      lastRating: ratings.at(-1),
   };
};

interface RatingCurveProps {
   /** [date, rating] per attended contest, oldest first. */
   history: [string, number][];
   color: string;
}

/** Contest rating over every attended contest, with the peak marked. */
const RatingCurve = ({ history, color }: Readonly<RatingCurveProps>) => {
   const { reducedMotion } = useMotionPreference();

   const chart = useMemo(
      () => (history.length < 2 ? null : buildChart(history)),
      [history],
   );
   if (!chart) return null;

   const labelShift = chart.flip
      ? "translate(calc(-100% - 10px), -50%)"
      : "translate(10px, -50%)";

   return (
      <motion.div
         initial={reducedMotion ? "visible" : "hidden"}
         whileInView="visible"
         viewport={{ once: true, amount: 0.5 }}
      >
         <span className="sr-only">
            {`Contest rating from ${chart.firstRating} in ${chart.firstYear} to ${chart.lastRating} in ${chart.lastYear} over ${history.length} contests, peak ${chart.peakRating}.`}
         </span>
         <div aria-hidden="true" style={{ position: "relative" }}>
            <svg
               viewBox={`0 0 ${W} ${H}`}
               style={{ display: "block", width: "100%", height: "auto" }}
            >
               {[PAD_TOP, (PAD_TOP + BASELINE) / 2, BASELINE].map((y) => (
                  <line
                     key={y}
                     x1={PAD_X}
                     x2={W - PAD_X}
                     y1={y}
                     y2={y}
                     stroke="rgb(255 255 255 / 0.06)"
                  />
               ))}
               <motion.path
                  variants={FILL}
                  d={chart.area}
                  fill={`${color}14`}
               />
               <motion.path
                  variants={DRAW}
                  d={chart.line}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
               />
               <motion.circle
                  variants={LAND}
                  cx={chart.peak.x}
                  cy={chart.peak.y}
                  r={7}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                  style={MARK_ORIGIN}
               />
               <motion.circle
                  variants={LAND}
                  cx={chart.end.x}
                  cy={chart.end.y}
                  r={3.5}
                  fill={color}
                  style={MARK_ORIGIN}
               />
            </svg>
            <span
               style={{
                  position: "absolute",
                  left: `${(chart.peak.x / W) * 100}%`,
                  top: `${(chart.peak.y / H) * 100}%`,
                  transform: labelShift,
                  whiteSpace: "nowrap",
               }}
            >
               <motion.span
                  variants={SHOW}
                  style={{
                     display: "block",
                     fontFamily: MONO_FONT,
                     fontSize: 10,
                     fontWeight: 700,
                     letterSpacing: "0.12em",
                     color,
                  }}
               >
                  {`PEAK ${chart.peakRating}`}
               </motion.span>
            </span>
         </div>
         <div
            aria-hidden="true"
            style={{
               display: "flex",
               justifyContent: "space-between",
               marginTop: 6,
               fontFamily: MONO_FONT,
               fontSize: 10,
               color: TEXT_MUTED,
            }}
         >
            <span>{chart.firstYear}</span>
            <span>{`${history.length} contests`}</span>
            <span>{chart.lastYear}</span>
         </div>
      </motion.div>
   );
};

export default RatingCurve;
