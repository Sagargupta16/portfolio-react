import { useState, useMemo } from "react";
import { motion, LayoutGroup } from "motion/react";
import { getExperience, getPositionsOfResponsibility } from "@data/experience";
import { getSectionCopy } from "@data/sections";
import { staggerContainer, fadeInUp } from "@utils/animations";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import TimelineSpine from "@components/ui/TimelineSpine";
import { BLUE_LIGHT, SKY, MAX_WIDTH_NARROW } from "@/constants/theme";
import type { ProfessionalExperience } from "@/types";
import TimelineCard from "./TimelineCard";
import ExperienceModal from "./ExperienceModal";

const Experience = () => {
   const experienceArray = getExperience();
   const positionsArray = getPositionsOfResponsibility();
   const { title, subtitle, subsections } = getSectionCopy("experience");
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
         title={title}
         subtitle={subtitle}
         maxWidth={MAX_WIDTH_NARROW}
      >
         <LayoutGroup>
            <motion.div variants={staggerContainer}>
               <TimelineSpine
                  accentColor={BLUE_LIGHT}
                  count={experienceArray.length}
               >
                  {experienceArray.map((item, index) => (
                     <TimelineCard
                        key={item.id}
                        item={item}
                        index={index}
                        accentColor={BLUE_LIGHT}
                        isMobile={isMobile}
                        onClick={() => setSelectedExp(item)}
                     />
                  ))}
               </TimelineSpine>
            </motion.div>
         </LayoutGroup>

         {hasPositions && (
            <>
               <motion.h3
                  className="dashed-rule"
                  variants={fadeInUp}
                  style={{ marginTop: 48, marginBottom: 32 }}
               >
                  {subsections.positions}
               </motion.h3>

               <LayoutGroup>
                  <motion.div variants={staggerContainer}>
                     <TimelineSpine
                        accentColor={SKY}
                        count={positionsArray.length}
                     >
                        {positionsArray.map((item, index) => (
                           <TimelineCard
                              key={item.id}
                              item={item}
                              index={index}
                              accentColor={SKY}
                              isMobile={isMobile}
                           />
                        ))}
                     </TimelineSpine>
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
