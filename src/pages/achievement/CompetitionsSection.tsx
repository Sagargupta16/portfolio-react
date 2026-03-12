import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import { staggerContainer } from "@utils/animations";
import SectionTitle from "./SectionTitle";
import AchievementItem from "./AchievementItem";

interface CompetitionsSectionProps {
   achievements: Achievement[];
   isMobile: boolean;
}

const CompetitionsSection = ({
   achievements,
   isMobile,
}: CompetitionsSectionProps) => {
   if (achievements.length === 0) return null;

   return (
      <div>
         <SectionTitle
            icon={
               <Trophy style={{ width: 18, height: 18, color: "#f59e0b" }} />
            }
            iconBg="rgba(245,158,11,0.1)"
            label="Competitions & Awards"
            count={achievements.length}
         />
         <motion.div
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 10,
            }}
            variants={staggerContainer}
         >
            {achievements.map((item) => (
               <AchievementItem key={item.id} item={item} isMobile={isMobile} />
            ))}
         </motion.div>
      </div>
   );
};

export default CompetitionsSection;
