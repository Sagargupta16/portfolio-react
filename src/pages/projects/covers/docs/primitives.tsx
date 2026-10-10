import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import {
   BASE_BG,
   FILL,
   GREEN,
   LABEL,
   LINEAR,
   SOLID_FILL,
   VIEW_BOX,
   VIEW_W,
   W03,
   W05,
   W10,
   hair,
   loop,
   packetTrack,
   pin,
   px,
   py,
   rect,
   windowKeys,
   windowTimes,
   type Leg,
} from "./kit";

/* Shared components for the Docs family and the Guide and Tax scenes. Three
   depth layers: a static lattice at ~5% white (back), bordered panels and
   hairline wires (mid), packets and status marks (front). */

/* ---------- back layer ---------- */

export type LatticeKind = "grid" | "rules" | "dots" | "crosses";

const range = (from: number, to: number, step: number) =>
   Array.from(
      { length: Math.floor((to - from) / step) + 1 },
      (_, i) => from + i * step,
   );

const GRID_D = [
   ...range(10, 150, 10).map((x) => `M ${x} 0 V 100`),
   ...range(10, 90, 10).map((y) => `M 0 ${y} H 160`),
].join(" ");
const RULES_D = range(8, 96, 8)
   .map((y) => `M 0 ${y} H 160`)
   .join(" ");
const CROSSES_D = range(10, 150, 20)
   .flatMap((x) =>
      range(10, 90, 20).map(
         (y) => `M ${x - 1.2} ${y} H ${x + 1.2} M ${x} ${y - 1.2} V ${y + 1.2}`,
      ),
   )
   .join(" ");
const LATTICE_D: Record<Exclude<LatticeKind, "dots">, string> = {
   grid: GRID_D,
   rules: RULES_D,
   crosses: CROSSES_D,
};
const DOTS: CSSProperties = {
   ...FILL,
   opacity: 0.08,
   backgroundImage:
      "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
   backgroundSize: "14px 14px",
};

/** Full-slot SVG in the shared viewBox. The slot is a fixed 16:10, so
    `none` scales uniformly. */
export const Wires = ({ children }: { children: ReactNode }) => (
   <svg
      viewBox={VIEW_BOX}
      preserveAspectRatio="none"
      style={{ ...FILL, width: "100%", height: "100%" }}
   >
      {children}
   </svg>
);

const Lattice = ({ kind }: { kind: LatticeKind }) => {
   if (kind === "dots") return <div style={DOTS} />;
   return (
      <Wires>
         <path d={LATTICE_D[kind]} {...hair(W05)} />
      </Wires>
   );
};

interface SceneRootProps {
   tint: string;
   /** Focal point of the single radial tint wash, e.g. "68% 36%". */
   focus: string;
   lattice?: LatticeKind;
   children?: ReactNode;
}

/** Root every scene in this kit renders: base gradient, one tint wash at the
    focal point, optional lattice, then the scene layers. */
export const SceneRoot = ({
   tint,
   focus,
   lattice,
   children,
}: SceneRootProps) => (
   <div
      aria-hidden="true"
      style={{
         ...FILL,
         overflow: "hidden",
         background: `radial-gradient(circle at ${focus}, ${tint}1f, transparent 60%), ${BASE_BG}`,
      }}
   >
      {lattice && <Lattice kind={lattice} />}
      {children}
   </div>
);

/* ---------- mid layer ---------- */

interface PanelProps {
   x: number;
   y: number;
   w: number;
   h: number;
   edge?: string;
   /** Opaque fill, for panels that wires pass under or covers sit on. */
   solid?: boolean;
   radius?: number;
}

export const Panel = ({
   x,
   y,
   w,
   h,
   edge = W10,
   solid = false,
   radius = 7,
}: PanelProps) => (
   <div
      style={{
         ...rect(x, y, w, h),
         borderRadius: radius,
         border: `1px solid ${edge}`,
         background: solid ? SOLID_FILL : W03,
      }}
   />
);

interface LabelProps {
   x: number;
   y: number;
   text: string;
   color: string;
   size?: number;
   /** `end` pins the label's right edge to x. */
   anchor?: "start" | "end";
}

/** Mono micro-label vertically centred on y. */
export const Label = ({
   x,
   y,
   text,
   color,
   size = 9,
   anchor = "start",
}: LabelProps) => {
   const horizontal =
      anchor === "end" ? { right: px(VIEW_W - x) } : { left: px(x) };
   return (
      <span
         style={{
            ...LABEL,
            position: "absolute",
            ...horizontal,
            top: py(y),
            marginTop: -size / 2,
            fontSize: size,
            color,
         }}
      >
         {text}
      </span>
   );
};

/** Inline mono label for flex rows (no positioning of its own). */
export const Text = ({
   text,
   color,
   size = 9,
}: {
   text: string;
   color: string;
   size?: number;
}) => <span style={{ ...LABEL, fontSize: size, color }}>{text}</span>;

interface BarProps {
   x: number;
   y: number;
   w: number;
   color: string;
}

/** 3 px text line, width in units, centred on y. */
export const Bar = ({ x, y, w, color }: BarProps) => (
   <span
      style={{
         ...pin(x, y),
         width: px(w),
         height: 3,
         marginTop: -1.5,
         borderRadius: 1.5,
         background: color,
      }}
   />
);

interface DotProps {
   x: number;
   y: number;
   color: string;
   size?: number;
   ring?: boolean;
}

/** Static dot (or ring) centred on a viewBox point. */
export const Dot = ({ x, y, color, size = 5, ring = false }: DotProps) => (
   <span
      style={{
         ...pin(x, y),
         width: size,
         height: size,
         margin: -size / 2,
         borderRadius: "50%",
         boxSizing: "border-box",
         ...(ring ? { border: `1px solid ${color}` } : { background: color }),
      }}
   />
);

/* ---------- front layer ---------- */

interface PacketProps {
   tint: string;
   legs: readonly Leg[];
   cycle: number;
   /** Replaces the default head + trail, e.g. a file glyph. */
   children?: ReactNode;
}

const HEAD = 5;

/** Data in flight: a slot-sized box translated by percentages of itself, so
    the 5 px head keeps its size and lands on the wire at any width. The
    trail is a short horizontal fade; every route in this kit runs left to
    right, so it always sits behind the head. */
export const Packet = ({ tint, legs, cycle, children }: PacketProps) => {
   const track = packetTrack(legs);
   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ x: track.x, y: track.y, opacity: track.opacity }}
         transition={loop(cycle, track.times, LINEAR)}
         style={FILL}
      >
         {children ?? (
            <>
               <span
                  style={{
                     position: "absolute",
                     left: -20,
                     top: -0.75,
                     width: 19,
                     height: 1.5,
                     background: `linear-gradient(90deg, transparent, ${tint}aa)`,
                  }}
               />
               <span
                  style={{
                     position: "absolute",
                     width: HEAD,
                     height: HEAD,
                     margin: -HEAD / 2,
                     borderRadius: "50%",
                     background: tint,
                  }}
               />
            </>
         )}
      </motion.div>
   );
};

interface PopProps {
   x: number;
   y: number;
   cycle: number;
   on: number;
   off: number;
   /** Box size in px; the box is centred on (x, y). */
   size: number;
   /** Opacity between beats; above 0 leaves a ghost of the last run so the
       resting frame never looks empty. */
   rest?: number;
   children?: ReactNode;
   style?: CSSProperties;
}

/** A mark that pops in on its beat, holds, and releases with the reset. */
export const Pop = ({
   x,
   y,
   cycle,
   on,
   off,
   size,
   rest = 0,
   children,
   style,
}: PopProps) => {
   /* A ghost brightens in place; a hidden mark grows in as it appears. */
   const restScale = rest > 0 ? 1 : 0.6;
   return (
      <motion.div
         initial={{ opacity: rest, scale: restScale }}
         animate={{
            opacity: windowKeys(rest, 1),
            scale: windowKeys(restScale, 1),
         }}
         transition={loop(cycle, windowTimes(on, off))}
         style={{
            ...pin(x, y),
            width: size,
            height: size,
            margin: -size / 2,
            display: "grid",
            placeItems: "center",
            ...style,
         }}
      >
         {children}
      </motion.div>
   );
};

/** CSS check glyph, 6 x 3 px before rotation. */
export const CheckGlyph = ({ color = GREEN }: { color?: string }) => (
   <span
      style={{
         display: "block",
         width: 6,
         height: 3,
         marginTop: -1.5,
         borderLeft: `1.75px solid ${color}`,
         borderBottom: `1.75px solid ${color}`,
         transform: "rotate(-45deg)",
      }}
   />
);

/** Green ring + check: a step done, a return verified. */
export const OkRing = ({ size = 12 }: { size?: number }) => (
   <span
      style={{
         width: size,
         height: size,
         borderRadius: "50%",
         border: `1px solid ${GREEN}88`,
         background: `${GREEN}14`,
         display: "grid",
         placeItems: "center",
      }}
   >
      <CheckGlyph />
   </span>
);
