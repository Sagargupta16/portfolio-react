import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import type { LearningBadge } from "@/types";
import { staggerContainer } from "@utils/animations";
import SectionTitle from "./SectionTitle";
import BadgeCard from "./BadgeCard";

interface BadgesSectionProps {
   badges: LearningBadge[];
}

const BadgesSection = ({ badges }: BadgesSectionProps) => {
   if (badges.length === 0) return null;

   return (
      <div>
         <SectionTitle
            icon={
               <BookOpen style={{ width: 18, height: 18, color: "#a855f7" }} />
            }
            iconBg="rgba(168,85,247,0.1)"
            label="Learning & Training Badges"
            count={badges.length}
         />
         <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
            variants={staggerContainer}
         >
            {badges.map((badge) => (
               <BadgeCard key={badge.badgeId} badge={badge} />
            ))}
         </motion.div>
      </div>
   );
};

export default BadgesSection;
