import { motion } from "motion/react";
import type { Easing } from "motion/react";
import type { ReactNode } from "react";
import {
   CYCLE,
   GREEN,
   NON_SCALING,
   PANEL_RX,
   VIEW_BOX,
   WHITE_03,
   WHITE_10,
   labelText,
   loop,
   secs,
   travelStamps,
   xPct,
   yPct,
} from "./sceneTokens";
import type { Point } from "./sceneTokens";

/* Shared building blocks for the AutomationScene family: the scene SVG, the
   mid-layer panels and wires, and the front-layer packets, status dots and
   labels that sit over it in slot percentages. */

const FILL_SLOT = {
   position: "absolute",
   inset: 0,
   width: "100%",
   height: "100%",
} as const;

/** Full-slot SVG in the shared viewBox; draws back to front in DOM order. */
export const SceneSvg = ({ children }: { children: ReactNode }) => (
   <svg viewBox={VIEW_BOX} preserveAspectRatio="none" style={FILL_SLOT}>
      {children}
   </svg>
);

interface PanelProps {
   x: number;
   y: number;
   w: number;
   h: number;
   fill?: string;
   stroke?: string;
   rx?: number;
}

/** Mid-layer panel: 1px hairline border over a faint fill. */
export const Panel = ({
   x,
   y,
   w,
   h,
   fill = WHITE_03,
   stroke = WHITE_10,
   rx = PANEL_RX,
}: PanelProps) => (
   <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      vectorEffect={NON_SCALING}
   />
);

/** Horizontal rule with round ends: a line of text inside a panel. */
export const Rule = ({
   x,
   y,
   w,
   color,
   weight = 1.5,
}: {
   x: number;
   y: number;
   w: number;
   color: string;
   /** Stroke in screen px; non-scaling, so it holds at every card width. */
   weight?: number;
}) => (
   <line
      x1={x}
      x2={x + w}
      y1={y}
      y2={y}
      stroke={color}
      strokeWidth={weight}
      strokeLinecap="round"
      vectorEffect={NON_SCALING}
   />
);

/** Static 1px connector; pair it with `curve` for the S-shaped links. */
export const Wire = ({ d, color }: { d: string; color: string }) => (
   <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1}
      vectorEffect={NON_SCALING}
   />
);

interface PacketProps {
   tint: string;
   /** Route in viewBox units, usually `curvePoints` of the wire it rides. */
   points: readonly Point[];
   /** Cycle seconds when it leaves the first point and reaches the last. */
   from: number;
   to: number;
   size?: number;
   /** Tail side: behind a dot heading right, or above one heading down. */
   heading?: "right" | "down";
}

const TRAIL = 16;

const TAILS = {
   right: (tint: string): React.CSSProperties => ({
      position: "absolute",
      left: -TRAIL,
      top: -1,
      width: TRAIL,
      height: 2,
      borderRadius: 1,
      background: `linear-gradient(90deg, transparent, ${tint}99)`,
   }),
   down: (tint: string): React.CSSProperties => ({
      position: "absolute",
      left: -1,
      top: -TRAIL,
      width: 2,
      height: TRAIL,
      borderRadius: 1,
      background: `linear-gradient(180deg, transparent, ${tint}99)`,
   }),
};

/* Ease the first and last legs, glide through the sampled middle ones. */
const legEase = (legs: number): Easing[] =>
   Array.from({ length: legs }, (_, i) => {
      if (legs === 1) return "easeInOut";
      if (i === 0) return "easeIn";
      if (i === legs - 1) return "easeOut";
      return "linear";
   });

/* Data in flight: a 5px dot with a short fading tail. The moving box spans
   the whole slot, so its percent translate is a slot percentage and the dot
   rides the wire at any card width. It holds at the end while it fades, then
   slips back to the start unseen. */
export const Packet = ({
   tint,
   points,
   from,
   to,
   size = 5,
   heading = "right",
}: PacketProps) => {
   const last = points.length - 1;
   const stamps = travelStamps(points, from, to);
   const moveTimes = secs(0, ...stamps, to + 0.25, CYCLE);
   const moveEase: Easing[] = ["linear", ...legEase(last), "linear", "linear"];
   const move = {
      duration: CYCLE,
      repeat: Infinity,
      times: moveTimes,
      ease: moveEase,
   };
   const xs = points.map(([x]) => xPct(x));
   const ys = points.map(([, y]) => yPct(y));
   return (
      <motion.div
         animate={{
            x: [xs[0], ...xs, xs[last], xs[0]],
            y: [ys[0], ...ys, ys[last], ys[0]],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={{
            x: move,
            y: move,
            opacity: loop(0, from, from + 0.1, to - 0.05, to + 0.2, CYCLE),
         }}
         style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
         <div style={TAILS[heading](tint)} />
         <div
            style={{
               position: "absolute",
               left: -size / 2,
               top: -size / 2,
               width: size,
               height: size,
               borderRadius: "50%",
               background: tint,
            }}
         />
      </motion.div>
   );
};

/* Small cron dial: the hand sweeps once per cycle, so the loop is the
   schedule tick that starts the run. */
export const CronGlyph = ({
   tint,
   x,
   y,
}: {
   tint: string;
   x: number;
   y: number;
}) => (
   <div
      style={{
         position: "absolute",
         left: xPct(x),
         top: yPct(y),
         width: 12,
         height: 12,
         margin: -6,
         borderRadius: "50%",
         border: `1px solid ${tint}8c`,
      }}
   >
      <motion.div
         animate={{ rotate: 360 }}
         transition={{ duration: CYCLE, repeat: Infinity, ease: "linear" }}
         style={{
            position: "absolute",
            left: 4.25,
            top: 0.75,
            width: 1.5,
            height: 4.25,
            borderRadius: 1,
            background: tint,
            originX: 0.5,
            originY: 1,
         }}
      />
   </div>
);

interface PopProps {
   x: number;
   y: number;
   /** Cycle seconds it pops on and starts fading off. */
   at: number;
   until: number;
   color?: string;
   size?: number;
}

/** Status dot that pops on, holds, then fades before the reset. */
export const Pop = ({
   x,
   y,
   at,
   until,
   color = GREEN,
   size = 6.5,
}: PopProps) => (
   <motion.div
      animate={{
         opacity: [0, 0, 1, 1, 1, 0, 0],
         scale: [0.4, 0.4, 1.4, 1, 1, 0.6, 0.4],
      }}
      transition={loop(0, at, at + 0.18, at + 0.45, until, until + 0.3, CYCLE)}
      style={{
         position: "absolute",
         left: xPct(x),
         top: yPct(y),
         width: size,
         height: size,
         margin: -size / 2,
         borderRadius: "50%",
         background: color,
      }}
   />
);

const ALIGN = {
   start: "translateY(-50%)",
   center: "translate(-50%, -50%)",
   end: "translate(-100%, -50%)",
} as const;

interface LabelProps {
   x: number;
   y: number;
   text: string;
   color: string;
   align?: keyof typeof ALIGN;
}

/** Static mono micro-label anchored to a viewBox point. */
export const Label = ({ x, y, text, color, align = "start" }: LabelProps) => (
   <div
      style={{
         ...labelText(color),
         position: "absolute",
         left: xPct(x),
         top: yPct(y),
         transform: ALIGN[align],
      }}
   >
      {text}
   </div>
);
