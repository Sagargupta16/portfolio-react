import { motion } from "motion/react";
import { waveCascadeContainer, waveCascadeItem } from "@utils/animations";
import { TEXT_PRIMARY } from "@/constants/theme";
import { getSkillIcon } from "./skillIcons";

interface SkillTagGroupProps {
   items: string[];
   /** Compact rendering for secondary categories. */
   small?: boolean;
}

/**
 * Icon + bold name rows (akobir tech-stack style) -- no chip boxes.
 * Brand glyphs carry their official color; the label stays white.
 */
const SkillTagGroup = ({ items, small = false }: SkillTagGroupProps) => (
   <motion.div
      style={{
         display: "flex",
         flexWrap: "wrap",
         justifyContent: "center",
         columnGap: small ? 28 : 44,
         rowGap: small ? 16 : 24,
      }}
      variants={waveCascadeContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
   >
      {items.map((skill) => {
         const icon = getSkillIcon(skill);
         return (
            <motion.span
               key={skill}
               className="skill-item"
               variants={waveCascadeItem}
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: small ? 8 : 10,
                  fontSize: small ? 13 : 15,
                  fontWeight: 600,
                  color: TEXT_PRIMARY,
                  cursor: "default",
               }}
            >
               {icon && (
                  <icon.Icon
                     size={small ? 16 : 20}
                     color={icon.color}
                     style={{ flexShrink: 0 }}
                  />
               )}
               {skill}
            </motion.span>
         );
      })}
   </motion.div>
);

export default SkillTagGroup;
