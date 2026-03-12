import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { staggerItem } from "@utils/animations";
import TimelineCardContent from "./TimelineCardContent";

interface TimelineCardMobileProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   index: number;
   accentColor: string;
   onAnimationComplete: () => void;
}

const TimelineCardMobile = ({
   item,
   index,
   accentColor,
   onAnimationComplete,
}: TimelineCardMobileProps) => (
   <motion.div
      layout="position"
      variants={staggerItem}
      custom={index}
      style={{ marginBottom: 16 }}
      transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
   >
      <div
         className="glass-card"
         style={{
            padding: "20px 18px",
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: "0 12px 12px 0",
         }}
      >
         {/* Mobile date + location row */}
         <div
            style={{
               display: "flex",
               alignItems: "center",
               flexWrap: "wrap",
               gap: 8,
               marginBottom: 12,
            }}
         >
            <span
               style={{
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                  fontSize: 12,
                  fontWeight: 600,
                  color: accentColor,
               }}
            >
               {item.date}
            </span>
            {item.location && (
               <span
                  style={{
                     color: "#6e6e90",
                     fontSize: 11,
                     display: "flex",
                     alignItems: "center",
                     gap: 3,
                  }}
               >
                  <MapPin size={10} style={{ flexShrink: 0 }} />
                  {item.location}
               </span>
            )}
         </div>
         <TimelineCardContent
            item={item}
            accentColor={accentColor}
            isMobile
            onAnimationComplete={onAnimationComplete}
         />
      </div>
   </motion.div>
);

export default TimelineCardMobile;
