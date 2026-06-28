import { useState, useMemo } from "react";
import { motion, LayoutGroup } from "motion/react";
import { getExperience, getPositionsOfResponsibility } from "@data/dataLoader";
import { staggerContainer, fadeInUp } from "@utils/animations";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import { CYAN, PURPLE, TEXT_PRIMARY, MAX_WIDTH_NARROW } from "@/constants/theme";
import type { ProfessionalExperience } from "@/types";
import TimelineCard from "./TimelineCard";
import ExperienceModal from "./ExperienceModal";

const Experience = () => {
   const experienceArray = getExperience();
   const positionsArray = getPositionsOfResponsibility();
   const { isMobile } = useBreakpoint();
   const [selectedExp, setSelectedExp] =
      useState<ProfessionalExperience | null>(null);

   const hasPositions = useMemo(
      () => positionsArray?.length > 0,
      [positionsArray],
   );

   return (
      <PageSection
         id="experience"
         title="Experience"
         subtitle="Where I've worked"
         maxWidth={MAX_WIDTH_NARROW}
      >
         <LayoutGroup>
            <motion.div variants={staggerContainer}>
               {experienceArray.map((item, index) => (
                  <TimelineCard
                     key={item.id}
                     item={item}
                     index={index}
                     accentColor={CYAN}
                     isMobile={isMobile}
                     onClick={() => setSelectedExp(item)}
                  />
               ))}
            </motion.div>
         </LayoutGroup>

         {hasPositions && (
            <>
               <motion.h3
                  variants={fadeInUp}
                  style={{
                     fontSize: 20,
                     fontWeight: 700,
                     color: TEXT_PRIMARY,
                     marginTop: 48,
                     marginBottom: 32,
                     display: "flex",
                     alignItems: "center",
                     gap: 12,
                  }}
               >
                  <div
                     style={{
                        height: 28,
                        width: 4,
                        borderRadius: 9999,
                        background: `linear-gradient(to bottom, ${PURPLE}, rgba(168,85,247,0.3))`,
                     }}
                  />
                  Positions of Responsibility
               </motion.h3>

               <LayoutGroup>
                  <motion.div variants={staggerContainer}>
                     {positionsArray.map((item, index) => (
                        <TimelineCard
                           key={item.id}
                           item={item}
                           index={index}
                           accentColor={PURPLE}
                           isMobile={isMobile}
                        />
                     ))}
                  </motion.div>
               </LayoutGroup>
            </>
         )}

         <ExperienceModal
            experience={selectedExp}
            onClose={() => setSelectedExp(null)}
         />
      </PageSection>
   );
};

export default Experience;
