import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { CENTER_Y, CYCLE, GREEN, caption, secs } from "./sceneTokens";

/* Shared building blocks for the AutomationScene family. */

/* Motion eases a keyframe array per segment on its frameloop (x, y, scale)
   but across the whole iteration on WAAPI values (opacity), so a single ease
   pulls the two tracks out of phase. One ease per segment keeps them in step;
   every keyframed node in this family builds it from its `times`. */
const perSegment = (times: number[], ease: Easing = "easeInOut"): Easing[] =>
   times.slice(1).map(() => ease);

export const Hairline = ({
   tint,
   left,
   right,
}: {
   tint: string;
   left: string;
   right: string;
}) => (
   <div
      style={{
         position: "absolute",
         left,
         right,
         top: "50%",
         height: 1,
         background: `${tint}22`,
      }}
   />
);

interface TravelDotProps {
   tint: string;
   /** Track box in slot percentages; the dot crosses its full width. */
   left: string;
   width: string;
   top: string;
   height?: string;
   /** Vertical direction across the track height: -1 up, 0 flat, 1 down. */
   dy?: -1 | 0 | 1;
   /** Travel right to left instead. */
   reverse?: boolean;
   /** Cycle seconds when the dot appears and when it fades. */
   from: number;
   to: number;
   size?: number;
}

const pct = (sign: number, fraction: number) => `${sign * fraction * 100}%`;

/* Percent transforms are relative to the moving box, which spans the whole
   track, so the dot travels exactly the track distance at any card width. */
const trackPath = (sign: number) =>
   [0, 0, 0.1, 0.9, 1, 0].map((f) => pct(sign, f));

export const TravelDot = ({
   tint,
   left,
   width,
   top,
   height = "0%",
   dy = 0,
   reverse = false,
   from,
   to,
   size = 5,
}: TravelDotProps) => {
   const sx = reverse ? -1 : 1;
   const anchorX = reverse ? { right: 0 } : { left: 0 };
   const anchorY = dy < 0 ? { bottom: 0 } : { top: 0 };
   const times = secs(0, from, from + 0.08, to - 0.08, to, CYCLE);
   return (
      <div style={{ position: "absolute", left, width, top, height }}>
         <motion.div
            animate={{
               x: trackPath(sx),
               y: trackPath(dy),
               opacity: [0, 0, 1, 1, 0, 0],
            }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               ease: perSegment(times),
               times,
            }}
            style={{ position: "absolute", inset: 0 }}
         >
            <div
               style={{
                  position: "absolute",
                  ...anchorX,
                  ...anchorY,
                  width: size,
                  height: size,
                  margin: -size / 2,
                  borderRadius: "50%",
                  background: tint,
               }}
            />
         </motion.div>
      </div>
   );
};

/** Fixed stage box width; pipelines derive connector edges from it. */
export const STAGE_WIDTH = 46;

export const StageBox = ({
   tint,
   left,
   text,
   children,
}: {
   tint: string;
   left: string;
   text: string;
   children?: React.ReactNode;
}) => (
   <div style={{ position: "absolute", left, top: "50%", transform: CENTER_Y }}>
      <div
         style={{
            position: "relative",
            width: STAGE_WIDTH,
            height: 30,
            borderRadius: 6,
            border: `1px solid ${tint}35`,
            background: `${tint}08`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         {children}
      </div>
      <div style={caption(tint)}>{text}</div>
   </div>
);

/* One-shot border flash laid over a StageBox when the pipeline reaches it. */
export const PulseRing = ({ tint, at }: { tint: string; at: number }) => {
   const times = secs(0, at, at + 0.25, at + 0.9, CYCLE);
   return (
      <motion.div
         animate={{ opacity: [0, 0, 1, 0, 0], scale: [1, 1, 1.08, 1, 1] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(times),
            times,
         }}
         style={{
            position: "absolute",
            inset: -1,
            borderRadius: 6,
            border: `1px solid ${tint}cc`,
         }}
      />
   );
};

/* Green pop at cycle end for the publish / changed=true signal. */
export const SuccessDot = ({ at }: { at: number }) => {
   const times = secs(0, at, at + 0.2, at + 0.7, at + 1.1, CYCLE);
   return (
      <motion.div
         animate={{
            opacity: [0, 0, 1, 1, 0, 0],
            scale: [0.6, 0.6, 1.3, 1, 0.6, 0.6],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            ease: perSegment(times),
            times,
         }}
         style={{
            position: "absolute",
            right: "4%",
            top: "24%",
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: GREEN,
         }}
      />
   );
};
