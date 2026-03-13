import { motion } from "motion/react";
import { waveCascadeContainer, waveCascadeItem } from "@utils/animations";

interface SkillBrowserGridProps {
   items: string[];
   categoryKey: string;
}

const SkillBrowserGrid = ({ items, categoryKey }: SkillBrowserGridProps) => (
   <motion.div
      key={categoryKey}
      variants={waveCascadeContainer}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } }}
      style={{
         display: "flex",
         flexWrap: "wrap",
         gap: 10,
         padding: "20px 20px 24px",
         minHeight: 120,
      }}
   >
      {items.map((skill) => (
         <motion.span
            key={skill}
            className="skill-tag"
            variants={waveCascadeItem}
         >
            {skill}
         </motion.span>
      ))}
   </motion.div>
);

export default SkillBrowserGrid;
