import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@utils/animations";
import SkillTagGroup from "./SkillTagGroup";

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
            marginTop: 56,
            display: "flex",
            flexDirection: "column",
            gap: 48,
         }}
         variants={staggerContainer}
      >
         {categories.map(({ key, label, items }) => (
            <motion.div key={key} variants={staggerItem}>
               <h4 className="dashed-rule" style={{ marginBottom: 28 }}>
                  {label}
               </h4>
               <SkillTagGroup items={items} small />
            </motion.div>
         ))}
      </motion.div>
   );
};

export default SecondarySkills;
