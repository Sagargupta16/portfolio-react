import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import { fadeInUp } from "@utils/animations";
import { AMBER, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import TrophyCard from "./TrophyCard";

interface CompetitionsSectionProps {
   achievements: Achievement[];
}

const CompetitionsSection = ({ achievements }: CompetitionsSectionProps) => {
   const { isMobile } = useBreakpoint();

   if (achievements.length === 0) return null;

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
                  background: "rgba(245,158,11,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <Trophy style={{ width: 18, height: 18, color: AMBER }} />
            </div>
            <h3
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
               }}
            >
               Competitions & Awards
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
               {achievements.length}
            </span>
         </motion.div>

         <div
            style={{
               display: "grid",
               gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
               gap: 12,
            }}
         >
            {achievements.map((item, i) => (
               <TrophyCard key={item.id} item={item} index={i} />
            ))}
         </div>
      </div>
   );
};

export default CompetitionsSection;
