import { motion } from "motion/react";
import { getEducation } from "@data/education";
import { getSectionCopy } from "@data/sections";
import { staggerContainer } from "@utils/animations";
import { BLUE_LIGHT, MAX_WIDTH_NARROW } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import TimelineSpine from "@components/ui/TimelineSpine";
import TimelineEntry from "@components/ui/TimelineEntry";
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
         maxWidth={MAX_WIDTH_NARROW}
      >
         <motion.div variants={staggerContainer}>
            <TimelineSpine accentColor={BLUE_LIGHT} count={education.length}>
               {education.map((item) => (
                  <TimelineEntry
                     key={item.id}
                     date={item.date}
                     location={item.location}
                     accentColor={BLUE_LIGHT}
                     isMobile={isMobile}
                  >
                     <EducationCardContent
                        item={item}
                        accentColor={BLUE_LIGHT}
                        isMobile={isMobile}
                     />
                  </TimelineEntry>
               ))}
            </TimelineSpine>
         </motion.div>
      </PageSection>
   );
};

export default Education;
