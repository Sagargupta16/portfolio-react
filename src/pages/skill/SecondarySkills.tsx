import { motion } from "motion/react";
import {
   staggerContainer,
   staggerItem,
   waveCascadeContainer,
   waveCascadeItem,
} from "@utils/animations";

interface CategoryEntry {
   key: string;
   label: string;
   items: string[];
}

interface SecondarySkillsProps {
   categories: CategoryEntry[];
}

const SecondarySkills = ({ categories }: SecondarySkillsProps) => {
   if (categories.length === 0) return null;

   return (
      <motion.div
         style={{
            marginTop: 48,
            display: "flex",
            flexDirection: "column",
            gap: 32,
         }}
         variants={staggerContainer}
      >
         {categories.map(({ key, label, items }) => (
            <motion.div key={key} variants={staggerItem}>
               <h4 className="dashed-rule" style={{ marginBottom: 20 }}>
                  {label}
               </h4>
               <motion.div
                  style={{
                     display: "flex",
                     flexWrap: "wrap",
                     gap: 8,
                     justifyContent: "center",
                  }}
                  variants={waveCascadeContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
               >
                  {items.map((skill) => (
                     <motion.span
                        key={skill}
                        className="skill-tag"
                        style={{
                           fontSize: 12,
                           padding: "4px 12px",
                        }}
                        variants={waveCascadeItem}
                     >
                        {skill}
                     </motion.span>
                  ))}
               </motion.div>
            </motion.div>
         ))}
      </motion.div>
   );
};

export default SecondarySkills;
