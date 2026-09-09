import { motion } from "motion/react";
import { Trophy } from "lucide-react";
import type { Achievement } from "@/types";
import { fadeInUp } from "@utils/animations";
import { AMBER } from "@/constants/theme";
import CompetitionResult from "./CompetitionResult";
import "./achievements.css";

interface CompetitionsSectionProps {
   achievements: Achievement[];
}

const CompetitionsSection = ({ achievements }: CompetitionsSectionProps) => {
   if (achievements.length === 0) return null;

   const podiumFinishes = achievements.filter((item) =>
      /^(?:1st|2nd|3rd) Place - /.test(item.title),
   );
   const podiumIds = new Set(podiumFinishes.map((item) => item.id));
   const otherResults = achievements.filter((item) => !podiumIds.has(item.id));
   const groups = [
      { title: "Podium finishes", items: podiumFinishes },
      { title: "Other results", items: otherResults },
   ].filter((group) => group.items.length > 0);

   return (
      <div className="competition-record">
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

         <div
            className={`competition-groups${groups.length === 1 ? " competition-groups--single" : ""}`}
         >
            {groups.map((group) => (
               <div className="competition-group" key={group.title}>
                  <h4 className="competition-group-title">
                     {group.title}
                     <span>{group.items.length}</span>
                  </h4>
                  <ul className="competition-results" aria-label={group.title}>
                     {group.items.map((item, index) => (
                        <CompetitionResult
                           key={item.id}
                           item={item}
                           index={index}
                        />
                     ))}
                  </ul>
               </div>
            ))}
         </div>
      </div>
   );
};

export default CompetitionsSection;
