import { motion } from "motion/react";
import { waveCascadeContainer, waveCascadeItem } from "@utils/animations";

interface SkillTagGroupProps {
   items: string[];
}

const SkillTagGroup = ({ items }: SkillTagGroupProps) => (
   <motion.div
      className="flex flex-wrap gap-2.5"
      style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
      variants={waveCascadeContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ margin: "0px 0px -100px 0px" }}
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

export default SkillTagGroup;
