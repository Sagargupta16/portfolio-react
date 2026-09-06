import { useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import type { LearningBadge } from "@/types";
import { fadeInUp, VIEWPORT_MARGIN } from "@utils/animations";
import { DURATION, EASING } from "@/constants/theme";
import RailBadge from "./RailBadge";

interface BadgeRailProps {
   badges: LearningBadge[];
   size: number;
   gap: number;
   /** Seconds for one full loop, i.e. one copy of the list passing by. */
   loopSeconds: number;
}

/* A focused badge is slid at least this far inside the rail, clear of the
   edge fades: 12% of the rail width, never under 48px. */
const FOCUS_PAD_RATIO = 0.12;
const FOCUS_PAD_MIN = 48;
const SHIFT_TRANSITION = { duration: DURATION.quick, ease: EASING.brisk };

/**
 * Slow horizontal marquee of learning badges. The stylesheet (.badge-rail)
 * owns the loop: a CSS transform keyframe on the track, paused on hover and
 * focus-within, soft mask fades at both ends. Two copies of the list make the
 * loop seamless; the second is decorative.
 */
const BadgeRail = ({ badges, size, gap, loopSeconds }: BadgeRailProps) => {
   const railRef = useRef<HTMLDivElement>(null);
   const [shift, setShift] = useState(0);

   // Focus pauses the marquee, but the focused badge may already have
   // travelled out of the clipped viewport. Slide the whole track so it is in
   // view; the rail is overflow: clip, so the browser never scrolls it itself.
   const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      const rail = railRef.current;
      if (!rail) return;
      const bounds = rail.getBoundingClientRect();
      const target = e.target.getBoundingClientRect();
      const pad = Math.max(FOCUS_PAD_MIN, bounds.width * FOCUS_PAD_RATIO);
      let delta = 0;
      if (target.left < bounds.left + pad) {
         delta = bounds.left + pad - target.left;
      } else if (target.right > bounds.right - pad) {
         delta = bounds.right - pad - target.right;
      }
      if (delta !== 0) setShift((current) => current + delta);
   };

   // Focus leaving the rail hands the track back to the loop.
   const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setShift(0);
   };

   const railStyle = {
      "--rail-duration": `${loopSeconds}s`,
      "--rail-gap": `${gap}px`,
   } as CSSProperties;

   const renderGroup = (decorative: boolean) => (
      <ul className="badge-rail__group" aria-hidden={decorative || undefined}>
         {badges.map((badge) => (
            <li key={badge.badgeId}>
               <RailBadge badge={badge} size={size} decorative={decorative} />
            </li>
         ))}
      </ul>
   );

   return (
      <motion.div
         ref={railRef}
         className="badge-rail"
         style={railStyle}
         variants={fadeInUp}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
         onFocus={handleFocus}
         onBlur={handleBlur}
      >
         <motion.div animate={{ x: shift }} transition={SHIFT_TRANSITION}>
            <div className="badge-rail__track">
               {renderGroup(false)}
               {renderGroup(true)}
            </div>
         </motion.div>
      </motion.div>
   );
};

export default BadgeRail;
