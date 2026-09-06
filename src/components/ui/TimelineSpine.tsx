import { useRef, type ReactNode } from "react";
import {
   motion,
   useMotionValue,
   useScroll,
   useSpring,
   type Variants,
} from "motion/react";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";

// Desktop timeline row: date column, track column, card. Cards lay their grid
// out with these so the rail lands exactly under their nodes.
export const TIMELINE_DATE_COLUMN = 160;
export const TIMELINE_TRACK_COLUMN = 40;

const RAIL_WIDTH = 2;
const NODE_SIZE = 16;
const NODE_OFFSET = 4;
// Distance from a row's top edge to the centre of its node.
const NODE_CENTRE = NODE_OFFSET + NODE_SIZE / 2;
const RAIL_LEFT =
   TIMELINE_DATE_COLUMN + TIMELINE_TRACK_COLUMN / 2 - RAIL_WIDTH / 2;
const RAIL_BASE = "rgb(255 255 255 / 0.06)";
// 0.45 alpha as a hex suffix for the accent fill.
const FILL_ALPHA = "73";

// A zero-width first column holds the spine item, which spans every row but
// the last so the rail can stop at the last node. The .timeline-spine-list
// rule pins every card to the second column: without it, the last row's free
// first cell would capture the final card and collapse it to 0 px.
const LIST_STYLE: React.CSSProperties = {
   display: "grid",
   gridTemplateColumns: "0px minmax(0, 1fr)",
};

const nodePop: Variants = {
   hidden: { scale: 0 },
   visible: {
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
   },
};

interface TimelineNodeProps {
   color: string;
   /** Flat ring around the node of the currently active entry. */
   ring?: boolean;
}

/** Timeline marker. Pops in with its card (inherits the card's variant state). */
export const TimelineNode = ({ color, ring = false }: TimelineNodeProps) => {
   const { reducedMotion } = useMotionPreference();

   return (
      <motion.div
         aria-hidden
         variants={reducedMotion ? undefined : nodePop}
         style={{
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            backgroundColor: "var(--color-bg-primary)",
            marginTop: NODE_OFFSET,
            position: "relative",
            zIndex: 2,
            flexShrink: 0,
            boxShadow: ring ? `0 0 0 4px ${color}22` : undefined,
         }}
      >
         <div
            className="animate-glow-pulse"
            style={{
               position: "absolute",
               inset: 3,
               borderRadius: "50%",
               backgroundColor: color,
            }}
         />
      </motion.div>
   );
};

interface TimelineSpineProps {
   accentColor: string;
   /** Number of cards rendered as children. */
   count: number;
   children: ReactNode;
}

const DrawnList = ({ accentColor, count, children }: TimelineSpineProps) => {
   const listRef = useRef<HTMLDivElement>(null);
   const { reducedMotion } = useMotionPreference();

   // Empty while the list top sits below 80% of the viewport, full once its
   // bottom passes 60%: the rail fills as the cards are read.
   const { scrollYProgress } = useScroll({
      target: listRef,
      offset: ["start 0.8", "end 0.6"],
   });
   const smooth = useSpring(scrollYProgress, {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
   });
   // Scroll-linked values bypass MotionConfig, so Reduced pins the fill open.
   const filled = useMotionValue(1);
   const scaleY = reducedMotion ? filled : smooth;

   return (
      <div ref={listRef} className="timeline-spine-list" style={LIST_STYLE}>
         <div
            aria-hidden
            style={{
               gridColumn: 1,
               gridRow: `1 / ${count}`,
               position: "relative",
            }}
         >
            <div
               style={{
                  position: "absolute",
                  left: RAIL_LEFT,
                  top: NODE_CENTRE,
                  bottom: -NODE_CENTRE,
                  width: RAIL_WIDTH,
                  borderRadius: RAIL_WIDTH,
                  background: RAIL_BASE,
               }}
            >
               <motion.div
                  style={{
                     position: "absolute",
                     inset: 0,
                     borderRadius: RAIL_WIDTH,
                     background: `${accentColor}${FILL_ALPHA}`,
                     transformOrigin: "top",
                     scaleY,
                  }}
               />
            </div>
         </div>
         {children}
      </div>
   );
};

/**
 * Wraps a desktop timeline list in one continuous rail that runs from the
 * first node's centre to the last node's centre and fills top-down with
 * scroll. Mobile cards have no track column, so phones render the list bare.
 */
const TimelineSpine = ({
   accentColor,
   count,
   children,
}: TimelineSpineProps) => {
   const { isMobile } = useBreakpoint();

   if (isMobile || count < 2) return children;

   return (
      <DrawnList accentColor={accentColor} count={count}>
         {children}
      </DrawnList>
   );
};

export default TimelineSpine;
