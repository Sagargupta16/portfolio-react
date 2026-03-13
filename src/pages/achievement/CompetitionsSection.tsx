import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import { fadeInUp } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import TrophyCard from "./TrophyCard";

interface CompetitionsSectionProps {
   achievements: Achievement[];
}

const CompetitionsSection = ({ achievements }: CompetitionsSectionProps) => {
   const isMobile = useMediaQuery("(max-width: 768px)");

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
               gap: 10,
               marginBottom: 28,
            }}
         >
            <div
               style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(245,158,11,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <Trophy style={{ width: 18, height: 18, color: "#f59e0b" }} />
            </div>
            <h3
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#eeeef5",
               }}
            >
               Competitions & Awards
            </h3>
            <span
               style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6e6e90",
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
