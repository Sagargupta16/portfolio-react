import type { ComponentType } from "react";
import { motion } from "motion/react";
import type { OpenSourceContribution } from "@/types";
import { MONO_FONT } from "@/constants/theme";
import { staggerContainer, staggerItem } from "@utils/animations";
import ContribCard from "./ContribCard";

interface ContribSectionProps {
   icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
   label: string;
   count: number;
   color: string;
   items: OpenSourceContribution[];
}

const ContribSection = ({
   icon: Icon,
   label,
   count,
   color,
   items,
}: ContribSectionProps) => (
   <>
      <div
         style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
         }}
      >
         <Icon size={14} style={{ color }} />
         <span
            style={{
               fontSize: 12,
               fontWeight: 700,
               color,
               fontFamily: MONO_FONT,
               letterSpacing: "0.03em",
            }}
         >
            {label} ({count})
         </span>
      </div>
      <motion.div
         style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 10,
         }}
         variants={staggerContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      >
         {items.map((contrib) => (
            <motion.div key={contrib.url} variants={staggerItem}>
               <ContribCard contrib={contrib} />
            </motion.div>
         ))}
      </motion.div>
   </>
);

export default ContribSection;
