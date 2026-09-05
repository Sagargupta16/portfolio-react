import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * Kinfolk: two family records that turn out to describe the same human.
 * Record A on the left, Record B on the right, each an index-card pedigree
 * (marriage line with the union bead sitting on it, a stem down to the
 * sibling bar, children dropping off the bar) laid over two generation
 * rails. The dashed hairline between the matching cards is the pending
 * person_link; consent draws it solid, the join pulses, ACCEPTED lands, and
 * then the link releases while both records stay exactly where they were.
 *
 * Coordinates are viewBox units (0..100 x, 0..60 y) so the pedigree scales
 * with the 16:10 slot instead of drifting on narrow cards.
 */

const CYCLE = 6;
const EASE = "easeInOut";
/*
 * For the two HTML labels Motion hands opacity to WAAPI, where a single ease
 * string stretches over the whole iteration and drags keyframes off their
 * `times`. The SVG elements run on Motion's JS keyframe generator, which
 * honours `times` regardless of ease shape; they take the same per-segment
 * arrays so every beat reads off one storyboard clock.
 */
const eases = (segments: number, ease: "easeInOut" | "easeOut" = EASE) =>
   Array.from({ length: segments }, () => ease);
const GREEN = "#22c55e";
const NON_SCALING = "non-scaling-stroke";
const DIM_INK = "rgba(255,255,255,0.34)";

/* Index-card footprint, viewBox units. */
const CARD_W = 7;
const CARD_H = 4.4;
const HALF_W = CARD_W / 2;
const HALF_H = CARD_H / 2;
const BEAD = 2.6;
const ELBOW = 1.5;

/* Rows: parents on the marriage line, sibling bar, children. */
const PARENT_Y = 15;
const BAR_Y = 30;
const CHILD_Y = 40;

/* Generation rails behind each row, full slot width. */
const RAILS = [
   { y: 11, h: 8 },
   { y: 36, h: 8 },
];

interface Point {
   x: number;
   y: number;
}

interface Family {
   a: Point;
   b: Point;
   c1: Point;
   c2: Point;
   union: Point;
}

/* Left record: a union with two children. Right record: mirrored. */
const LEFT: Family = {
   a: { x: 16, y: PARENT_Y },
   b: { x: 34, y: PARENT_Y },
   c1: { x: 13, y: CHILD_Y },
   c2: { x: 31, y: CHILD_Y },
   union: { x: 25, y: PARENT_Y },
};
const RIGHT: Family = {
   a: { x: 66, y: PARENT_Y },
   b: { x: 84, y: PARENT_Y },
   c1: { x: 69, y: CHILD_Y },
   c2: { x: 87, y: CHILD_Y },
   union: { x: 75, y: PARENT_Y },
};

/* The shared human: LEFT.b and RIGHT.a are the same person in both records. */
const LINK_FROM: Point = { x: LEFT.b.x + HALF_W, y: PARENT_Y };
const LINK_TO: Point = { x: RIGHT.a.x - HALF_W, y: PARENT_Y };
const LINK_MID_X = (LINK_FROM.x + LINK_TO.x) / 2;
const LINK_PATH = `M ${LINK_FROM.x} ${LINK_FROM.y} L ${LINK_TO.x} ${LINK_TO.y}`;

const LABELS = {
   recordA: "RECORD A",
   recordB: "RECORD B",
   samePerson: "SAME PERSON",
   accepted: "ACCEPTED",
};

const label: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: "0.14em",
   textTransform: "uppercase",
   position: "absolute",
};

/*
 * Breathing for ordinary cards; the shared card lights up during beat 2,
 * holds lit through the join, and dims again as the link releases.
 */
const CARD_MOTION = {
   plain: { opacity: [0.5, 0.85, 0.5], times: [0, 0.3, 0.7] },
   shared: { opacity: [0.6, 0.6, 1, 1, 0.6], times: [0, 0.23, 0.38, 0.88, 1] },
};

const Person = ({
   at,
   tint,
   delay,
   shared = false,
}: {
   at: Point;
   tint: string;
   delay: number;
   shared?: boolean;
}) => {
   const beat = shared ? CARD_MOTION.shared : CARD_MOTION.plain;
   return (
      <motion.rect
         x={at.x - HALF_W}
         y={at.y - HALF_H}
         width={CARD_W}
         height={CARD_H}
         rx={0.8}
         fill={shared ? `${tint}30` : `${tint}12`}
         stroke={shared ? tint : `${tint}55`}
         strokeWidth={shared ? 1.2 : 0.9}
         vectorEffect={NON_SCALING}
         initial={{ opacity: beat.opacity[0] }}
         animate={{ opacity: beat.opacity }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            delay: shared ? 0 : delay,
            times: beat.times,
            ease: eases(beat.times.length - 1),
         }}
      />
   );
};

/* Marriage line, union bead on the line, stem to the sibling bar, elbows. */
const Lineage = ({ t, tint }: { t: Family; tint: string }) => {
   const barTop = BAR_Y + ELBOW;
   const childTop = CHILD_Y - HALF_H;
   return (
      <>
         <path
            d={`M ${t.a.x + HALF_W} ${t.a.y} L ${t.b.x - HALF_W} ${t.b.y}`}
            stroke={`${tint}30`}
            strokeWidth={0.8}
            fill="none"
            vectorEffect={NON_SCALING}
         />
         <path
            d={`M ${t.union.x} ${t.union.y} L ${t.union.x} ${BAR_Y}`}
            stroke={`${tint}2e`}
            strokeWidth={0.8}
            fill="none"
            vectorEffect={NON_SCALING}
         />
         <path
            d={`M ${t.c1.x} ${childTop} L ${t.c1.x} ${barTop} Q ${t.c1.x} ${BAR_Y} ${t.c1.x + ELBOW} ${BAR_Y} L ${t.c2.x - ELBOW} ${BAR_Y} Q ${t.c2.x} ${BAR_Y} ${t.c2.x} ${barTop} L ${t.c2.x} ${childTop}`}
            stroke={`${tint}2e`}
            strokeWidth={0.8}
            fill="none"
            vectorEffect={NON_SCALING}
         />
         <rect
            x={t.union.x - BEAD / 2}
            y={t.union.y - BEAD / 2}
            width={BEAD}
            height={BEAD}
            rx={0.6}
            fill={`${tint}45`}
         />
      </>
   );
};

/* Parentage hangs off the union bead, never off a parent pair. */
const Record = ({
   t,
   tint,
   delay,
   sharedKey,
}: {
   t: Family;
   tint: string;
   delay: number;
   sharedKey: "a" | "b";
}) => (
   <>
      <Lineage t={t} tint={tint} />
      <Person at={t.a} tint={tint} delay={delay} shared={sharedKey === "a"} />
      <Person
         at={t.b}
         tint={tint}
         delay={delay + 0.2}
         shared={sharedKey === "b"}
      />
      <Person at={t.c1} tint={tint} delay={delay + 0.4} />
      <Person at={t.c2} tint={tint} delay={delay + 0.6} />
   </>
);

/* Pending hairline, consent draw, and the fused-identity pulse. */
const PersonLink = ({ tint }: { tint: string }) => (
   <>
      <path
         d={LINK_PATH}
         stroke={`${tint}2a`}
         strokeWidth={1}
         strokeDasharray="2 2"
         fill="none"
         vectorEffect={NON_SCALING}
      />
      <motion.path
         d={LINK_PATH}
         stroke={GREEN}
         strokeWidth={1.4}
         strokeLinecap="round"
         fill="none"
         vectorEffect={NON_SCALING}
         initial={{ pathLength: 0, opacity: 0 }}
         animate={{ pathLength: [0, 0, 1, 1, 1], opacity: [0, 0, 1, 1, 0] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.35, 0.55, 0.9, 1],
            ease: eases(4),
         }}
      />
      <motion.circle
         cx={LINK_MID_X}
         cy={PARENT_Y}
         r={2}
         fill={GREEN}
         initial={{ opacity: 0, scale: 0.4 }}
         animate={{ opacity: [0, 0, 1, 0], scale: [0.4, 0.4, 1.5, 0.4] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.55, 0.62, 0.72],
            ease: eases(3, "easeOut"),
         }}
      />
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
         {/* generation rails: one band per row, no text */}
         {RAILS.map((rail) => (
            <rect
               key={rail.y}
               x={0}
               y={rail.y}
               width={100}
               height={rail.h}
               fill="rgba(255,255,255,0.03)"
            />
         ))}

         <Record t={LEFT} tint={tint} delay={0} sharedKey="b" />
         <Record t={RIGHT} tint={tint} delay={0.5} sharedKey="a" />
         <PersonLink tint={tint} />
      </svg>

      {/* which record is which */}
      <div style={{ ...label, left: "7%", bottom: "9%", color: DIM_INK }}>
         {LABELS.recordA}
      </div>
      <div style={{ ...label, right: "7%", bottom: "9%", color: DIM_INK }}>
         {LABELS.recordB}
      </div>
      {/* rises with the consent draw, settles back as the link releases */}
      <motion.div
         animate={{ opacity: [0.35, 0.35, 0.9, 0.9, 0.35] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.35, 0.55, 0.9, 1],
            ease: eases(4),
         }}
         style={{
            ...label,
            left: 0,
            right: 0,
            top: "6%",
            textAlign: "center",
            color: `${GREEN}cc`,
         }}
      >
         {LABELS.samePerson}
      </motion.div>
      {/* lands under the midpoint as the join pulses */}
      <motion.div
         animate={{ opacity: [0, 0, 0.9, 0.9, 0] }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: [0, 0.55, 0.66, 0.9, 1],
            ease: eases(4),
         }}
         style={{
            ...label,
            left: 0,
            right: 0,
            top: "32%",
            textAlign: "center",
            color: `${GREEN}cc`,
         }}
      >
         {LABELS.accepted}
      </motion.div>
   </div>
);

export default GraphScene;
