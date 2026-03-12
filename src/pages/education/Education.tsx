import { useMemo } from "react";
import { motion } from "motion/react";
import { getEducation } from "@data/dataLoader";
import { sectionRevealEnhanced, staggerContainer } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import SectionHeader from "@components/ui/SectionHeader";
import EducationCard from "./EducationCard";

const Education = () => {
   const education = useMemo(() => getEducation(), []);
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <motion.section
         id="education"
         className="py-24 px-6"
         style={{ padding: isMobile ? "64px 16px" : "96px 24px" }}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
         variants={sectionRevealEnhanced}
      >
         <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <SectionHeader title="Education" subtitle="My academic journey" />

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
         </div>
      </motion.section>
   );
};

export default Education;
