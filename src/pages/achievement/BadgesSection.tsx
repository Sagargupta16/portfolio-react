import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import type { LearningBadge } from "@/types";
import { fadeInUp, VIEWPORT_MARGIN } from "@utils/animations";
import { PURPLE, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import BadgeRail from "./BadgeRail";
import RailBadge from "./RailBadge";

interface BadgesSectionProps {
   badges: LearningBadge[];
}

const BADGE_SIZE = 88;
const BADGE_SIZE_MOBILE = 72;
const RAIL_GAP = 24;
const RAIL_GAP_MOBILE = 16;
/* Seconds per loop. Phones get fewer, smaller badges per viewport and a
   slower crawl: about 27px/s against roughly 41px/s on desktop. */
const LOOP_S = 48;
const LOOP_S_MOBILE = 60;
/* One copy of the list must be wider than the 1152px section, or the seam
   shows a gap: ten badges at 132px each clears it. Shorter lists get the grid. */
const MIN_RAIL_BADGES = 10;

const BadgesSection = ({ badges }: BadgesSectionProps) => {
   const { isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();

   if (badges.length === 0) return null;

   const badgeSize = isMobile ? BADGE_SIZE_MOBILE : BADGE_SIZE;
   const gap = isMobile ? RAIL_GAP_MOBILE : RAIL_GAP;
   // Reduced shows every badge at rest in a wrapped grid: nothing clipped,
   // nothing duplicated, no track to freeze.
   const showRail = !reducedMotion && badges.length >= MIN_RAIL_BADGES;

   return (
      <div>
         <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: VIEWPORT_MARGIN }}
            variants={fadeInUp}
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               gap: 8,
               marginBottom: 24,
            }}
         >
            <div
               style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(56,189,248,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <BookOpen style={{ width: 18, height: 18, color: PURPLE }} />
            </div>
            <h3
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
               }}
            >
               Learning & Training
            </h3>
            <span
               style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
               }}
            >
               {badges.length}
            </span>
         </motion.div>

         {showRail ? (
            <BadgeRail
               badges={badges}
               size={badgeSize}
               gap={gap}
               loopSeconds={isMobile ? LOOP_S_MOBILE : LOOP_S}
            />
         ) : (
            <motion.div
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: VIEWPORT_MARGIN }}
               variants={fadeInUp}
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap,
                  paddingBottom: 12,
               }}
            >
               {badges.map((badge) => (
                  <RailBadge
                     key={badge.badgeId}
                     badge={badge}
                     size={badgeSize}
                  />
               ))}
            </motion.div>
         )}
      </div>
   );
};

export default BadgesSection;
