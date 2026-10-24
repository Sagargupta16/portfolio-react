import { motion } from "motion/react";
import TechTag from "@components/ui/TechTag";
import { TEXT_MUTED, BLUE_LIGHT, DURATION, EASING } from "@/constants/theme";
import { waveCascadeContainer, waveCascadeItem } from "@utils/animations";
import type { ProfessionalExperience } from "@/types";
import { getSectionCopy } from "@data/sections";
import ModalProjectCard from "./ModalProjectCard";
import ModalContributions from "./ModalContributions";

const COPY = getSectionCopy("experience").modal;

interface ModalContentProps {
   experience: ProfessionalExperience;
   isMobile: boolean;
}

const ModalContent = ({ experience, isMobile }: ModalContentProps) => {
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
   let skillsDelay = projectEndDelay;
   if (contributions.length > 0) skillsDelay = contribDelay + 0.12;
   if (achievements.length > 0) skillsDelay = achieveDelay + 0.12;

   return (
      <div style={{ padding: isMobile ? "16px 14px 24px" : "20px 24px 28px" }}>
         {/* Projects */}
         {projects.map((proj, i) => (
            <ModalProjectCard key={proj.name} project={proj} index={i} />
         ))}

         {/* Internal Contributions */}
         <ModalContributions
            title={COPY.contributions}
            items={contributions}
            baseDelay={contribDelay}
            variant="contributions"
         />

         {/* Internal Achievements */}
         <ModalContributions
            title={COPY.achievements}
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
                  duration: DURATION.default,
                  ease: EASING.cinematic,
               }}
               style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgb(var(--ch-white) / 0.06)",
               }}
            >
               <p
                  style={{
                     fontSize: 11,
                     color: TEXT_MUTED,
                     fontWeight: 600,
                     textTransform: "uppercase",
                     letterSpacing: "0.06em",
                     marginBottom: 8,
                  }}
               >
                  {COPY.skills}
               </p>
               <motion.div
                  variants={waveCascadeContainer}
                  initial="hidden"
                  animate="visible"
                  style={{
                     display: "flex",
                     flexWrap: "wrap",
                     gap: 4,
                  }}
               >
                  {allSkills.map((s) => (
                     <motion.div key={s} variants={waveCascadeItem}>
                        <TechTag label={s} accent={BLUE_LIGHT} />
                     </motion.div>
                  ))}
               </motion.div>
            </motion.div>
         )}
      </div>
   );
};

export default ModalContent;
