import { motion } from "motion/react";
import TechTag from "@components/ui/TechTag";
import { TEXT_MUTED, CYAN } from "@/constants/theme";
import { waveCascadeContainer, waveCascadeItem } from "@utils/animations";
import type { ProfessionalExperience } from "@/types";
import ModalProjectCard from "./ModalProjectCard";
import ModalContributions from "./ModalContributions";

interface ModalContentProps {
   experience: ProfessionalExperience;
}

const EXPO_EASE = [0.16, 1, 0.3, 1] as const;

const ModalContent = ({ experience }: ModalContentProps) => {
   const projects = experience.projects ?? [];
   const contributions = experience.internal_contributions ?? [];
   const achievements = experience.internal_achievements ?? [];

   const allSkills =
      projects.length > 0
         ? [...new Set(projects.flatMap((p) => p.skills))].slice(0, 15)
         : [];

   // Sequential delay calculation
   const projectEndDelay = 0.2 + projects.length * 0.12 + 0.15;
   const contribDelay = projectEndDelay;
   const achieveDelay =
      contributions.length > 0 ? contribDelay + 0.12 : contribDelay;
   const skillsDelay =
      achievements.length > 0
         ? achieveDelay + 0.12
         : contributions.length > 0
           ? contribDelay + 0.12
           : projectEndDelay;

   return (
      <div style={{ padding: "20px 24px 28px" }}>
         {/* Projects */}
         {projects.map((proj, i) => (
            <ModalProjectCard key={proj.name} project={proj} index={i} />
         ))}

         {/* Internal Contributions */}
         <ModalContributions
            title="Internal Contributions"
            items={contributions}
            baseDelay={contribDelay}
            variant="contributions"
         />

         {/* Internal Achievements */}
         <ModalContributions
            title="Internal Achievements"
            items={achievements}
            baseDelay={achieveDelay}
            variant="achievements"
         />

         {/* Key Skills */}
         {allSkills.length > 0 && (
            <motion.div
               initial={{ opacity: 0, y: 15 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{
                  delay: skillsDelay,
                  duration: 0.4,
                  ease: EXPO_EASE,
               }}
               style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.06)",
               }}
            >
               <p
                  style={{
                     fontSize: 11,
                     color: TEXT_MUTED,
                     fontWeight: 600,
                     textTransform: "uppercase",
                     letterSpacing: "0.06em",
                     marginBottom: 10,
                  }}
               >
                  Key Skills
               </p>
               <motion.div
                  variants={waveCascadeContainer}
                  initial="hidden"
                  animate="visible"
                  style={{
                     display: "flex",
                     flexWrap: "wrap",
                     gap: 6,
                  }}
               >
                  {allSkills.map((s) => (
                     <motion.div key={s} variants={waveCascadeItem}>
                        <TechTag label={s} accent={CYAN} />
                     </motion.div>
                  ))}
               </motion.div>
            </motion.div>
         )}
      </div>
   );
};

export default ModalContent;
