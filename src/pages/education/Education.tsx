import { useMemo } from "react";
import { motion } from "motion/react";
import { getEducation } from "@data/dataLoader";
import { staggerContainer } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import EducationCard from "./EducationCard";

const Education = () => {
   const education = useMemo(() => getEducation(), []);
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <PageSection
         id="education"
         title="Education"
         subtitle="My academic journey"
         maxWidth={960}
      >
         <motion.div variants={staggerContainer}>
            {education.map((item, index) => (
               <EducationCard
                  key={item.id}
                  item={item}
                  index={index}
                  isMobile={isMobile}
               />
            ))}
         </motion.div>
      </PageSection>
   );
};

export default Education;
