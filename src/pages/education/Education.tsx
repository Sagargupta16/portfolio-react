import { motion } from "motion/react";
import { getEducation } from "@data/education";
import { getSectionCopy } from "@data/sections";
import { staggerContainer } from "@utils/animations";
import { BLUE_LIGHT, MAX_WIDTH } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import TimelineSpine from "@components/ui/TimelineSpine";
import EducationCardContent from "./EducationCardContent";

const Education = () => {
   const education = getEducation();
   const { title, subtitle } = getSectionCopy("education");
   const { isMobile } = useBreakpoint();

   return (
      <PageSection
         id="education"
         title={title}
         subtitle={subtitle}
         maxWidth={MAX_WIDTH}
      >
         <motion.div variants={staggerContainer}>
            <TimelineSpine accentColor={BLUE_LIGHT} count={education.length}>
               {education.map((item) => (
                  <EducationCardContent
                     key={item.id}
                     item={item}
                     accentColor={BLUE_LIGHT}
                     isMobile={isMobile}
                  />
               ))}
            </TimelineSpine>
         </motion.div>
      </PageSection>
   );
};

export default Education;
