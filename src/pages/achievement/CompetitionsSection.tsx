import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import { fadeInUp } from "@utils/animations";
import { AMBER } from "@/constants/theme";
import TrophyCard from "./TrophyCard";
import "./achievements.css";

interface CompetitionsSectionProps {
   achievements: Achievement[];
}

const CompetitionsSection = ({ achievements }: CompetitionsSectionProps) => {
   if (achievements.length === 0) return null;

   return (
      <div>
         <motion.div
            className="subsection-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            variants={fadeInUp}
         >
            <Trophy size={22} style={{ color: AMBER }} aria-hidden="true" />
            <h3>Competitions & Awards</h3>
            <span className="subsection-count">{achievements.length}</span>
         </motion.div>

         <div className="awards-grid">
            {achievements.map((item, i) => (
               <TrophyCard key={item.id} item={item} index={i} />
            ))}
         </div>
      </div>
   );
};

export default CompetitionsSection;
