import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import type { LearningBadge } from "@/types";
import { fadeInUp } from "@utils/animations";
import { PURPLE, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import CertBadge from "./CertBadge";

interface BadgesSectionProps {
   badges: LearningBadge[];
}

const BadgesSection = ({ badges }: BadgesSectionProps) => {
   const { isMobile } = useBreakpoint();

   if (badges.length === 0) return null;

   const badgeSize = isMobile ? 72 : 88;

   return (
      <div>
         <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "0px 0px -60px 0px" }}
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
                  background: "rgba(168,85,247,0.1)",
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

         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               justifyContent: "center",
               gap: isMobile ? 12 : 24,
               paddingBottom: 12,
            }}
         >
            {badges.map((badge, i) => (
               <CertBadge
                  key={badge.badgeId}
                  name={badge.name}
                  imageUrl={badge.imageUrl}
                  badgeUrl={badge.badgeUrl}
                  size={badgeSize}
                  floatDelay={i * 0.4}
                  entranceDelay={i * 0.06}
               />
            ))}
         </div>
      </div>
   );
};

export default BadgesSection;
