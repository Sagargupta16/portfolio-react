import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
}

/*
 * Kinfolk: two family trees that turn out to share a person. Left tree is
 * yours, right tree is a relative's, and the dashed link between the two
 * matching nodes resolves into a solid join. That consent-gated merge is the
 * whole product, so it gets the beat.
 *
 * Coordinates are viewBox units (0..100 x, 0..60 y) so the graph scales with
 * the 16:10 slot instead of drifting on narrow cards.
 */

const CYCLE = 6.5;

/* Left tree: a union with two children. Right tree: same shape, mirrored. */
const LEFT = {
   a: { x: 16, y: 15 },
   b: { x: 34, y: 15 },
   c1: { x: 13, y: 40 },
   c2: { x: 31, y: 40 },
   union: { x: 25, y: 24 },
};
const RIGHT = {
   a: { x: 66, y: 15 },
   b: { x: 84, y: 15 },
   c1: { x: 69, y: 40 },
   c2: { x: 87, y: 40 },
   union: { x: 75, y: 24 },
};

/* The shared human: LEFT.b and RIGHT.a are the same person in both trees. */
const SHARED_FROM = LEFT.b;
const SHARED_TO = RIGHT.a;

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 6.5,
   fontWeight: 700,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
};

const Person = ({
   cx,
   cy,
   tint,
   delay,
   highlight,
}: {
   cx: number;
   cy: number;
   tint: string;
   delay: number;
   highlight?: boolean;
}) => (
   <motion.circle
      cx={cx}
      cy={cy}
      r={3.4}
      fill={highlight ? `${tint}30` : `${tint}12`}
      stroke={highlight ? tint : `${tint}55`}
      strokeWidth={highlight ? 1.2 : 0.9}
      vectorEffect="non-scaling-stroke"
      initial={{ opacity: 0.55 }}
      animate={{ opacity: highlight ? [0.6, 1, 0.6] : [0.5, 0.85, 0.5] }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         delay,
         times: [0, 0.3, 0.7],
         ease: "easeInOut",
      }}
   />
);

/* Parentage hangs off the union node, never off a parent pair. */
const Family = ({
   t,
   tint,
   delay,
   sharedKey,
}: {
   t: typeof LEFT;
   tint: string;
   delay: number;
   sharedKey: "a" | "b";
}) => (
   <>
      {/* partner bar into the union node */}
      <path
         d={`M ${t.a.x} ${t.a.y} L ${t.b.x} ${t.b.y}`}
         stroke={`${tint}30`}
         strokeWidth={0.8}
         fill="none"
         vectorEffect="non-scaling-stroke"
      />
      {/* union -> each child */}
      <path
         d={`M ${t.union.x} ${t.union.y} L ${t.union.x} ${t.union.y + 6} L ${t.c1.x} ${t.union.y + 6} L ${t.c1.x} ${t.c1.y}`}
         stroke={`${tint}2e`}
         strokeWidth={0.8}
         fill="none"
         vectorEffect="non-scaling-stroke"
      />
      <path
         d={`M ${t.union.x} ${t.union.y} L ${t.union.x} ${t.union.y + 6} L ${t.c2.x} ${t.union.y + 6} L ${t.c2.x} ${t.c2.y}`}
         stroke={`${tint}2e`}
         strokeWidth={0.8}
         fill="none"
         vectorEffect="non-scaling-stroke"
      />
      {/* the union itself, drawn small so it reads as a joint not a person */}
      <rect
         x={t.union.x - 1.3}
         y={t.union.y - 1.3}
         width={2.6}
         height={2.6}
         rx={0.6}
         fill={`${tint}45`}
      />
      <Person
         cx={t.a.x}
         cy={t.a.y}
         tint={tint}
         delay={delay}
         highlight={sharedKey === "a"}
      />
      <Person
         cx={t.b.x}
         cy={t.b.y}
         tint={tint}
         delay={delay + 0.2}
         highlight={sharedKey === "b"}
      />
      <Person cx={t.c1.x} cy={t.c1.y} tint={tint} delay={delay + 0.4} />
      <Person cx={t.c2.x} cy={t.c2.y} tint={tint} delay={delay + 0.6} />
   </>
);

const GraphScene = ({ tint }: CoverSceneProps) => (
   <div
      aria-hidden="true"
      style={{
         position: "absolute",
         inset: 0,
         overflow: "hidden",
         background: `radial-gradient(ellipse at 50% 8%, ${tint}12 0%, transparent 60%), linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)`,
      }}
   >
      {/* dot grid for depth */}
      <div
         style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            backgroundImage:
               "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
         }}
      />

      <svg
         viewBox="0 0 100 60"
         preserveAspectRatio="xMidYMid meet"
         style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
         }}
      >
         <Family t={LEFT} tint={tint} delay={0} sharedKey="b" />
         <Family t={RIGHT} tint={tint} delay={0.5} sharedKey="a" />

         {/* the candidate match, dashed until both sides consent */}
         <path
            d={`M ${SHARED_FROM.x} ${SHARED_FROM.y} L ${SHARED_TO.x} ${SHARED_TO.y}`}
            stroke={`${tint}2a`}
            strokeWidth={1}
            strokeDasharray="2 2"
            fill="none"
            vectorEffect="non-scaling-stroke"
         />
         {/* consent lands: the link resolves solid, then releases */}
         <motion.path
            d={`M ${SHARED_FROM.x} ${SHARED_FROM.y} L ${SHARED_TO.x} ${SHARED_TO.y}`}
            stroke="#22c55e"
            strokeWidth={1.4}
            strokeLinecap="round"
            fill="none"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0.35, 0.55, 0.85, 1],
               ease: "easeInOut",
            }}
         />
         {/* the fused identity pulses once the join completes */}
         <motion.circle
            cx={(SHARED_FROM.x + SHARED_TO.x) / 2}
            cy={SHARED_FROM.y}
            r={2}
            fill="#22c55e"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0, 1, 0], scale: [0.4, 0.4, 1.5, 0.4] }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: [0, 0.52, 0.62, 0.8],
               ease: "easeOut",
            }}
         />
      </svg>

      {/* which tree is which */}
      <div
         style={{
            ...label,
            position: "absolute",
            left: "7%",
            bottom: "9%",
            color: "rgba(255,255,255,0.34)",
         }}
      >
         my tree
      </div>
      <div
         style={{
            ...label,
            position: "absolute",
            right: "7%",
            bottom: "9%",
            color: "rgba(255,255,255,0.34)",
         }}
      >
         cousin
      </div>
      <motion.div
         animate={{ opacity: [0.35, 0.35, 0.9, 0.35] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.52, 0.64, 0.85],
         }}
         style={{
            ...label,
            position: "absolute",
            left: 0,
            right: 0,
            top: "6%",
            textAlign: "center",
            fontSize: 6,
            color: "#22c55ecc",
         }}
      >
         same person
      </motion.div>
   </div>
);

export default GraphScene;
