import { motion } from "motion/react";
import { Briefcase, GraduationCap, Rocket, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { staggerItem } from "@utils/animations";

const HIGHLIGHT_ICONS: { Icon: LucideIcon; color: string }[] = [
   { Icon: Briefcase, color: "#06b6d4" },
   { Icon: GraduationCap, color: "#a855f7" },
   { Icon: Rocket, color: "#22c55e" },
   { Icon: Trophy, color: "#f59e0b" },
];

interface HighlightCardProps {
   text: string;
   index: number;
   isMobile: boolean;
}

const HighlightCard = ({ text, index, isMobile }: HighlightCardProps) => {
   const { Icon, color } = HIGHLIGHT_ICONS[index];
   const cleanText = text.replace(/^[^\s]+\s/, "");

   return (
      <motion.div
         variants={staggerItem}
         style={{
            display: "flex",
            gap: isMobile ? 10 : 14,
            alignItems: "flex-start",
            padding: isMobile ? "12px 14px" : "14px 16px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
         }}
      >
         <div
            style={{
               width: 32,
               height: 32,
               borderRadius: 8,
               background: `${color}12`,
               border: `1px solid ${color}20`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
               marginTop: 1,
            }}
         >
            <Icon style={{ width: 16, height: 16, color }} />
         </div>
         <p
            style={{
               color: "#cbd5e1",
               fontSize: isMobile ? 13 : 14,
               lineHeight: 1.6,
               margin: 0,
            }}
         >
            {cleanText}
         </p>
      </motion.div>
   );
};

export default HighlightCard;
