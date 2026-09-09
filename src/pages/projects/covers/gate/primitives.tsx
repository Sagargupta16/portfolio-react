import { motion } from "motion/react";
import {
   CENTER,
   NON_SCALING,
   STAGE_H,
   STAGE_W,
   WHITE_08,
   dot,
   label,
   layer,
   loopProps,
} from "./sceneTokens";
import type { Loop, Statics, TintProps } from "./sceneTokens";

/* Shared components for the GateScene family: the stage shell, static SVG
   chrome, and the fixed-px HTML signal dots. */

const shell: React.CSSProperties = {
   ...layer,
   overflow: "hidden",
   background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
};
const glowAt = (glow: string, tint: string) =>
   `radial-gradient(ellipse at ${glow}, ${tint}14, transparent 62%)`;

interface ShellProps extends TintProps {
   glow: string;
   stage: React.ReactNode;
   children: React.ReactNode;
}

export const Shell = ({ tint, glow, stage, children }: ShellProps) => (
   <div aria-hidden="true" style={shell}>
      <div style={{ ...layer, background: glowAt(glow, tint) }} />
      <svg
         viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
         preserveAspectRatio="none"
         style={{ ...layer, width: "100%", height: "100%" }}
      >
         {stage}
      </svg>
      {children}
   </div>
);

export const Shapes = ({ lines = [], rects = [] }: Statics) => (
   <>
      {lines.map(([x1, y1, x2, y2, stroke = WHITE_08, strokeWidth = 1]) => (
         <line
            key={`${x1},${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            vectorEffect={NON_SCALING}
         />
      ))}
      {rects.map(([x, y, w, h, color, rx, stroke]) => (
         <rect
            key={`${x},${y}`}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={rx}
            fill={color}
            stroke={stroke}
            vectorEffect={NON_SCALING}
         />
      ))}
   </>
);

type LoopDotProps = Pick<
   React.SVGProps<SVGCircleElement>,
   "cx" | "cy" | "r" | "fill"
> & { loop: Loop };

/* SVG dot that scales with its neighbours (the commit graph node). */
export const LoopDot = ({ loop, ...circle }: LoopDotProps) => (
   <motion.circle {...circle} {...loopProps(loop)} />
);

interface DotProps {
   x: number;
   y: number;
   size: number;
   color: string;
   loop: Loop;
}

export const Dot = ({ x, y, size, color, loop }: DotProps) => (
   <motion.div style={dot(x, y, size, color)} {...loopProps(loop)} />
);

/* The rider box fills its track, so percent x moves the dot by track fractions. */
export const Rider = ({ size, color, loop }: Omit<DotProps, "x" | "y">) => (
   <motion.div style={layer} {...loopProps(loop)}>
      <div style={dot(0, 0, size, color)} />
   </motion.div>
);

type LabelProps = Pick<
   React.CSSProperties,
   "left" | "top" | "bottom" | "color"
> & { children: string };

export const Label = ({ left, top, bottom, color, children }: LabelProps) => (
   <span style={{ ...label, left, top, bottom, color, transform: CENTER }}>
      {children}
   </span>
);
