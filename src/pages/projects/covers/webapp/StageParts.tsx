import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
   EASE,
   FILL,
   VIEWBOX,
   WHITE_05,
   WHITE_10,
   hCurve,
   hopEases,
   loop,
   vCurve,
   type Axis,
   type Pt,
} from "./shared";

/* Layers every stage composes: Backdrop (back), Wires (mid hairlines),
   Packet (front, data in flight). Only components live here; the geometry
   and timing helpers are in shared.ts. */

const NON_SCALING = "non-scaling-stroke";

const SVG_LAYER: CSSProperties = {
   position: "absolute",
   inset: 0,
   width: "100%",
   height: "100%",
   overflow: "visible",
   pointerEvents: "none",
};

export type Texture = "dots" | "grid" | "contour";

const LATTICE_CELL = 18;
const LATTICE_DRIFT = 32;

const LATTICE: Record<"dots" | "grid", CSSProperties> = {
   dots: {
      backgroundImage:
         "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1.5px)",
      backgroundSize: `${LATTICE_CELL}px ${LATTICE_CELL}px`,
   },
   grid: {
      backgroundImage:
         "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      backgroundSize: `${LATTICE_CELL}px ${LATTICE_CELL}px`,
   },
};

/* Topographic contours for the travel stage, in viewBox units. */
const CONTOURS = [
   "M 20 94 C 28 84 46 84 52 94 C 54 100 46 104 36 104",
   "M 6 86 C 22 70 52 72 64 88 C 70 96 60 104 40 104",
   "M 0 74 C 24 56 62 58 78 80 C 86 92 82 104 72 108",
   "M 104 -4 C 108 14 128 24 146 18 C 156 14 162 6 164 -2",
   "M 92 -6 C 96 22 126 36 152 30 C 160 28 166 22 168 16",
   "M 120 104 C 126 92 142 88 160 92",
];

const Contours = () => (
   <svg viewBox={VIEWBOX} preserveAspectRatio="none" style={SVG_LAYER}>
      {CONTOURS.map((d) => (
         <path
            key={d}
            d={d}
            fill="none"
            stroke={WHITE_05}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
   </svg>
);

/* Back layer: a faint lattice (optionally drifting one cell every 32 s so
   the loop is seamless) and one radial tint wash at the focal point. */
export const Backdrop = ({
   tint,
   focus,
   texture,
   drift = false,
}: {
   tint: string;
   focus: Pt;
   texture: Texture;
   drift?: boolean;
}) => {
   let lattice: ReactNode;
   if (texture === "contour") {
      lattice = <Contours />;
   } else if (drift) {
      lattice = (
         <motion.div
            initial={{ x: 0, y: 0 }}
            animate={{ x: -LATTICE_CELL, y: -LATTICE_CELL }}
            transition={{
               duration: LATTICE_DRIFT,
               repeat: Infinity,
               ease: "linear",
            }}
            style={{
               position: "absolute",
               inset: -LATTICE_CELL,
               ...LATTICE[texture],
            }}
         />
      );
   } else {
      lattice = <div style={{ ...FILL, ...LATTICE[texture] }} />;
   }
   return (
      <>
         {lattice}
         <div
            style={{
               ...FILL,
               background: `radial-gradient(circle at ${focus.x}% ${focus.y}%, ${tint}1f, transparent 60%)`,
            }}
         />
      </>
   );
};

/* Static hairlines between panels; children add animated strokes. */
export const Wires = ({
   paths,
   children,
}: {
   paths: string[];
   children?: ReactNode;
}) => (
   <svg viewBox={VIEWBOX} preserveAspectRatio="none" style={SVG_LAYER}>
      {paths.map((d) => (
         <path
            key={d}
            d={d}
            fill="none"
            stroke={WHITE_10}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
      ))}
      {children}
   </svg>
);

const TRAIL = 0.3;
const HEAD: CSSProperties = {
   position: "absolute",
   left: -2.5,
   top: -2.5,
   width: 5,
   height: 5,
   borderRadius: "50%",
};

const ends = (from: number, to: number): [string, string] =>
   from <= to ? ["0%", "100%"] : ["100%", "0%"];

/* The packet's box spans its two endpoints; the moving layer is the same
   size, so translating it by 100% carries the head corner to corner. */
const lane = (a: Pt, b: Pt): CSSProperties => ({
   position: "absolute",
   left: `${Math.min(a.x, b.x)}%`,
   top: `${Math.min(a.y, b.y)}%`,
   width: `${Math.abs(b.x - a.x)}%`,
   height: `${Math.abs(b.y - a.y)}%`,
   pointerEvents: "none",
});

export interface Hop {
   from: Pt;
   to: Pt;
   depart: number;
   arrive: number;
   axis?: Axis;
}

/* Front layer: a 5 px head riding the wire's exact S curve with a short
   tail behind it. The tail has no vector effect (Chrome sizes pathLength
   dashes in user units but lays a non-scaling stroke in screen space), and
   the head is HTML so it stays 5 px at every slot width. Both are hidden at
   frame 0, which is what the frozen Reduced mode shows. */
export const Packet = ({
   hop,
   color,
   cycle,
   head,
}: {
   hop: Hop;
   color: string;
   cycle: number;
   head?: CSSProperties;
}) => {
   const { from, to, depart, arrive, axis = "h" } = hop;
   const d = axis === "h" ? hCurve(from, to) : vCurve(from, to);
   const [x0, x1] = ends(from.x, to.x);
   const [y0, y1] = ends(from.y, to.y);
   const travel = [0, depart, arrive, arrive + 0.06, 1];
   const { along, across } = hopEases(from, to, axis);
   const xEase = [EASE, axis === "h" ? along : across, EASE, EASE];
   const yEase = [EASE, axis === "h" ? across : along, EASE, EASE];
   return (
      <>
         <svg viewBox={VIEWBOX} preserveAspectRatio="none" style={SVG_LAYER}>
            <motion.path
               d={d}
               fill="none"
               stroke={color}
               strokeWidth={1}
               strokeLinecap="round"
               initial={{
                  pathLength: TRAIL,
                  pathSpacing: 2,
                  pathOffset: -TRAIL,
                  opacity: 0,
               }}
               animate={{
                  pathOffset: [-TRAIL, -TRAIL, 1 - TRAIL, 1 - TRAIL, -TRAIL],
                  opacity: [0, 0, 0.5, 0.5, 0, 0],
               }}
               transition={{
                  pathOffset: loop(cycle, travel),
                  opacity: loop(cycle, [
                     0,
                     depart,
                     depart + 0.03,
                     arrive,
                     arrive + 0.03,
                     1,
                  ]),
               }}
            />
         </svg>
         <div style={lane(from, to)}>
            <motion.div
               initial={{ x: x0, y: y0, opacity: 0 }}
               animate={{
                  x: [x0, x0, x1, x1, x0],
                  y: [y0, y0, y1, y1, y0],
                  opacity: [0, 0, 1, 1, 0, 0],
               }}
               transition={{
                  x: loop(cycle, travel, xEase),
                  y: loop(cycle, travel, yEase),
                  opacity: loop(cycle, [
                     0,
                     depart - 0.02,
                     depart,
                     arrive,
                     arrive + 0.04,
                     1,
                  ]),
               }}
               style={FILL}
            >
               <span style={{ ...HEAD, background: color, ...head }} />
            </motion.div>
         </div>
      </>
   );
};
