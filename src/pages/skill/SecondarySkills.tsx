import { motion } from "motion/react";
import { staggerContainer, staggerItem } from "@utils/animations";

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
            gap: 32,
         }}
         variants={staggerContainer}
      >
         <div
            className="section-divider"
            style={{
               height: 1,
               background:
                  "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.04) 20%, rgba(6,182,212,0.3) 50%, rgba(255,255,255,0.04) 80%, transparent 95%)",
            }}
         />
         <h3
            style={{
               fontSize: 20,
               fontWeight: 600,
               color: "#eeeef5",
               textAlign: "center",
            }}
         >
            Other Skills
         </h3>
         {categories.map(({ key, label, items }) => (
            <motion.div key={key} variants={staggerItem}>
               <h4
                  style={{
                     fontSize: 16,
                     fontWeight: 500,
                     color: "#a5a5c0",
                     marginBottom: 12,
                     display: "flex",
                     alignItems: "center",
                     gap: 10,
                  }}
               >
                  <div
                     style={{
                        height: 20,
                        width: 3,
                        borderRadius: 9999,
                        background:
                           "linear-gradient(to bottom, #a855f7, rgba(168,85,247,0.3))",
                     }}
                  />
                  {label}
               </h4>
               <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {items.map((skill) => (
                     <span
                        key={skill}
                        className="skill-tag"
                        style={{
                           fontSize: 12,
                           padding: "5px 14px",
                        }}
                     >
                        {skill}
                     </span>
                  ))}
               </div>
            </motion.div>
         ))}
      </motion.div>
   );
};

export default SecondarySkills;
