import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
   NON_SCALING,
   STAGE_H,
   STAGE_W,
   W03,
   W10,
   W55,
   dotAt,
   label,
   layer,
   loopProps,
   pctX,
   pctY,
} from "./sceneTokens";
import type { Box, Loop, Pt } from "./sceneTokens";

/* Components of the shared stage kit: the three-layer shell, static SVG
   chrome, scaling animated strokes, and fixed-px HTML packets, pips, labels. */

const BASE = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";
const VIEWBOX = `0 0 ${STAGE_W} ${STAGE_H}`;
const shell: CSSProperties = { ...layer, overflow: "hidden", background: BASE };
const svgFill: CSSProperties = { ...layer, width: "100%", height: "100%" };

interface ShellProps {
   tint: string;
   /* focal point of the single tint wash, as "x% y%" */
   focus: string;
   /* back-layer texture (DOTS, GRID, RAILS or COLUMNS) */
   texture: CSSProperties;
   stage: ReactNode;
   children?: ReactNode;
}

/* Back texture, one faint tint wash, the SVG stage, then the HTML front. */
export const Shell = ({
   tint,
   focus,
   texture,
   stage,
   children,
}: ShellProps) => (
   <div aria-hidden="true" style={shell}>
      <div style={{ ...layer, ...texture }} />
      <div
         style={{
            ...layer,
            background: `radial-gradient(circle at ${focus}, ${tint}1f, transparent 60%)`,
         }}
      />
      <svg viewBox={VIEWBOX} preserveAspectRatio="none" style={svgFill}>
         {stage}
      </svg>
      {children}
   </div>
);

interface PanelProps {
   box: Box;
   rx?: number;
   fill?: string;
   stroke?: string;
}

/* Mid-layer panel with a 1 px hairline border. */
export const Panel = ({
   box: [x, y, w, h],
   rx = 7,
   fill = W03,
   stroke = W10,
}: PanelProps) => (
   <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={fill}
      stroke={stroke}
      vectorEffect={NON_SCALING}
   />
);

/* Solid bar or chip without a border (rows, text stand-ins). */
export const Bar = ({
   box: [x, y, w, h],
   fill,
}: {
   box: Box;
   fill: string;
}) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;

interface WireProps {
   d: string;
   stroke?: string;
   width?: number;
}

/* Static hairline, 1 px at any slot width. */
export const Wire = ({ d, stroke = W10, width = 1 }: WireProps) => (
   <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      vectorEffect={NON_SCALING}
   />
);

interface TraceProps {
   d: string;
   color: string;
   width: number;
   loop: Loop;
}

/* Animated stroke (pathLength / pathOffset). It scales with the stage on
   purpose: no vector-effect, so the normalised dash lands where it should. */
export const Trace = ({ d, color, width, loop }: TraceProps) => (
   <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      {...loopProps(loop)}
   />
);

interface DotProps {
   color: string;
   size?: number;
   loop: Loop;
}

/* Data in flight. The wrapper fills the stage, so percent x / y keyframes
   are stage coordinates at any width while the dot keeps its px size. */
export const Packet = ({ color, size = 5, loop }: DotProps) => (
   <motion.div style={layer} {...loopProps(loop)}>
      <span style={dotAt([0, 0], size, color)} />
   </motion.div>
);

/* Status dot: pulses when it has a loop, otherwise sits still. */
export const Pip = ({
   at,
   color,
   size = 4,
   loop,
}: Partial<DotProps> & { at: Pt; color: string }) => {
   const style = dotAt(at, size, color);
   if (loop) return <motion.span style={style} {...loopProps(loop)} />;
   return <span style={style} />;
};

interface LabelProps {
   at: Pt;
   children: string;
   color?: string;
   centered?: boolean;
   loop?: Loop;
}

/* Mono micro-label hanging right of (or centred on) a stage point. */
export const Label = ({
   at: [x, y],
   children,
   color = W55,
   centered,
   loop,
}: LabelProps) => {
   const style: CSSProperties = {
      ...label,
      left: pctX(x),
      top: pctY(y),
      color,
      transform: centered ? "translate(-50%, -50%)" : "translateY(-50%)",
   };
   if (loop) {
      return (
         <motion.span style={style} {...loopProps(loop)}>
            {children}
         </motion.span>
      );
   }
   return <span style={style}>{children}</span>;
};
