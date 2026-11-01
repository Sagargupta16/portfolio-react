import type { ComponentType, CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";
import {
   staggerContainer,
   staggerItem,
   VIEWPORT_MARGIN,
} from "@utils/animations";

interface ContribSectionProps<T extends { url: string }> {
   icon: ComponentType<{ size?: number; style?: CSSProperties }>;
   /** The whole heading text, count included. */
   label: string;
   color: string;
   items: T[];
   renderItem: (item: T) => ReactNode;
}

const ContribSection = <T extends { url: string }>({
   icon: Icon,
   label,
   color,
   items,
   renderItem,
}: ContribSectionProps<T>) => (
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
            {label}
         </span>
      </div>
      <motion.div
         className="contribution-grid"
         variants={staggerContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      >
         {items.map((item) => (
            <motion.div key={item.url} variants={staggerItem}>
               {renderItem(item)}
            </motion.div>
         ))}
      </motion.div>
   </>
);

export default ContribSection;
