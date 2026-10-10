import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
   BASE_GRADIENT,
   HAIRLINE,
   NON_SCALING,
   STAGE_H,
   STAGE_W,
   VIEWBOX,
   WHITE_05,
   fill,
   loop,
   pctX,
   pctY,
   svgLayer,
   sweep,
} from "./tokens";
import type { Ease, Point, TintProps } from "./tokens";

/* Shared components for the Terraform on AWS covers: the stage shell with its
   three depth layers, static hairline wiring, and packets in flight. */

/* ---------------- back layer ---------------- */

export type Backdrop = "grid" | "dots";

const CELL = 20;
const DRIFT_SECONDS = 32;

const BACKDROPS: Record<Backdrop, CSSProperties> = {
   grid: {
      backgroundImage: `linear-gradient(${WHITE_05} 1px, transparent 1px), linear-gradient(90deg, ${WHITE_05} 1px, transparent 1px)`,
      backgroundSize: `${CELL}px ${CELL}px`,
   },
   dots: {
      backgroundImage:
         "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1.5px)",
      backgroundSize: `${CELL / 2}px ${CELL / 2}px`,
   },
};

/* The lattice fades out from the focal point; the mask stays on a static
   parent so a drifting lattice never drags its fade with it. */
const Lattice = ({
   kind,
   focus,
   drift,
}: {
   kind: Backdrop;
   focus: Point;
   drift: boolean;
}) => {
   const mask = `radial-gradient(ellipse at ${pctX(focus[0])} ${pctY(focus[1])}, #000 20%, transparent 78%)`;
   const pattern: CSSProperties = {
      position: "absolute",
      inset: -CELL,
      ...BACKDROPS[kind],
   };
   return (
      <div
         style={{
            ...fill,
            overflow: "hidden",
            maskImage: mask,
            WebkitMaskImage: mask,
         }}
      >
         {drift ? (
            <motion.div
               initial={{ x: 0, y: 0 }}
               animate={{ x: [0, CELL], y: [0, CELL] }}
               transition={sweep(DRIFT_SECONDS)}
               style={pattern}
            />
         ) : (
            <div style={pattern} />
         )}
      </div>
   );
};

/* ---------------- shell ---------------- */

const ROOT: CSSProperties = {
   ...fill,
   overflow: "hidden",
   background: BASE_GRADIENT,
   containerType: "size",
};

/* The 16:10 stage, letterboxed when the slot is taller (the spotlight card),
   so SVG and HTML share one coordinate space at every size. */
const STAGE: CSSProperties = {
   position: "absolute",
   left: "50%",
   top: "50%",
   width: `min(100cqw, ${(STAGE_W / STAGE_H) * 100}cqh)`,
   height: `min(100cqh, ${(STAGE_H / STAGE_W) * 100}cqw)`,
   transform: "translate(-50%, -50%)",
};

interface StageProps extends TintProps {
   focus: Point;
   backdrop: Backdrop;
   drift?: boolean;
   children: ReactNode;
}

export const Stage = ({
   tint,
   focus,
   backdrop,
   drift = false,
   children,
}: StageProps) => (
   <div aria-hidden="true" style={ROOT}>
      {/* light: one faint tint wash at the focal point */}
      <div
         style={{
            ...fill,
            background: `radial-gradient(circle at ${pctX(focus[0])} ${pctY(focus[1])}, ${tint}1f, transparent 60%)`,
         }}
      />
      <Lattice kind={backdrop} focus={focus} drift={drift} />
      <div style={STAGE}>{children}</div>
   </div>
);

/* Uniform stage SVG: pathLength draws live here, without vector-effect. */
export const StageSvg = ({ children }: { children: ReactNode }) => (
   <svg viewBox={VIEWBOX} style={svgLayer}>
      {children}
   </svg>
);

/* Static 1 px hairlines (non-scaling, so they stay crisp at every width). */
export const Wires = ({
   paths,
   stroke = HAIRLINE,
   dash,
}: {
   paths: string[];
   stroke?: string;
   dash?: string;
}) => (
   <>
      {paths.map((d) => (
         <path
            key={d}
            d={d}
            fill="none"
            stroke={stroke}
            strokeDasharray={dash}
            vectorEffect={NON_SCALING}
         />
      ))}
   </>
);

/* ---------------- front layer: packets in flight ---------------- */

export type Dir = "right" | "left" | "down" | "up";

const HEAD = 5;
const TRAIL_LEN = 15;
const TRAIL_W = 3;
const BEHIND = -HEAD / 2 - TRAIL_LEN;
const AHEAD = HEAD / 2;
const SIDE = -TRAIL_W / 2;

/* Trail box behind the 5 px head, and the gradient angle that fades it. */
const ALONG_X = { width: TRAIL_LEN, height: TRAIL_W, top: SIDE };
const ALONG_Y = { width: TRAIL_W, height: TRAIL_LEN, left: SIDE };
const TRAILS: Record<Dir, { box: CSSProperties; angle: number }> = {
   right: { box: { ...ALONG_X, left: BEHIND }, angle: 90 },
   left: { box: { ...ALONG_X, left: AHEAD }, angle: 270 },
   down: { box: { ...ALONG_Y, top: BEHIND }, angle: 180 },
   up: { box: { ...ALONG_Y, top: AHEAD }, angle: 0 },
};

export interface Track {
   /* offsets from the start point, in stage units */
   x?: number[];
   y?: number[];
   times: number[];
   xEase?: Ease;
   yEase?: Ease;
}

export interface Fade {
   opacity: number[];
   times: number[];
}

/* An overlay layer (inset 0 in its parent) fading on its own keyframes;
   every element inside it is one animated node. */
export const FadeLayer = ({
   cycle,
   fade,
   children,
}: {
   cycle: number;
   fade: Fade;
   children: ReactNode;
}) => (
   <motion.div
      initial={{ opacity: fade.opacity[0] }}
      animate={{ opacity: fade.opacity }}
      transition={loop(cycle, fade.times)}
      style={fill}
   >
      {children}
   </motion.div>
);

interface PacketProps {
   from: Point;
   color: string;
   dir: Dir;
   cycle: number;
   track: Track;
   fade: Fade;
}

const units = (values: number[]) => values.map((u) => `${u * 100}%`);

/*
 * A 5 px head with a short fading trail. The wrapper is one stage unit
 * square, so percent translates are stage units and nothing animates
 * left/top. An x track eased linear against a y track eased easeInOut
 * traces the same S as a curveH connector.
 */
export const Packet = ({
   from,
   color,
   dir,
   cycle,
   track,
   fade,
}: PacketProps) => {
   const still = track.times.map(() => 0);
   const xs = units(track.x ?? still);
   const ys = units(track.y ?? still);
   const trail = TRAILS[dir];
   return (
      <motion.div
         initial={{ x: xs[0], y: ys[0], opacity: fade.opacity[0] }}
         animate={{ x: xs, y: ys, opacity: fade.opacity }}
         transition={{
            x: loop(cycle, track.times, track.xEase),
            y: loop(cycle, track.times, track.yEase),
            opacity: loop(cycle, fade.times),
         }}
         style={{
            position: "absolute",
            left: pctX(from[0]),
            top: pctY(from[1]),
            width: `${100 / STAGE_W}%`,
            height: `${100 / STAGE_H}%`,
         }}
      >
         <div
            style={{
               position: "absolute",
               ...trail.box,
               borderRadius: TRAIL_W / 2,
               // color-mix fades any colour form (hex tint or rgba white)
               background: `linear-gradient(${trail.angle}deg, transparent, color-mix(in srgb, ${color} 65%, transparent))`,
            }}
         />
         <div
            style={{
               position: "absolute",
               left: -HEAD / 2,
               top: -HEAD / 2,
               width: HEAD,
               height: HEAD,
               borderRadius: "50%",
               background: color,
            }}
         />
      </motion.div>
   );
};
