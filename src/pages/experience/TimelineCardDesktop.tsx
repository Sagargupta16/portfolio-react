import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { slideInLeft, slideInRight } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import TimelineCardContent from "./TimelineCardContent";

interface TimelineCardDesktopProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   index: number;
   accentColor: string;
   onAnimationComplete: () => void;
}

const TimelineCardDesktop = ({
   item,
   index,
   accentColor,
   onAnimationComplete,
}: TimelineCardDesktopProps) => (
   <motion.div
      layout="position"
      style={{
         display: "grid",
         gridTemplateColumns: "160px 40px 1fr",
         gap: 0,
      }}
      variants={index % 2 === 0 ? slideInLeft : slideInRight}
      custom={index}
      transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
   >
      {/* Left: Date + Location */}
      <div style={{ paddingTop: 4, textAlign: "right", paddingRight: 20 }}>
         <span
            style={{
               fontFamily: MONO_FONT,
               fontSize: 13,
               fontWeight: 600,
               color: accentColor,
            }}
         >
            {item.date.split(" - ")[0]}
         </span>
         <span
            style={{
               display: "block",
               fontFamily: MONO_FONT,
               fontSize: 11,
               color: "#6e6e90",
               marginTop: 2,
            }}
         >
            {item.date.includes(" - ") ? item.date.split(" - ")[1] : ""}
         </span>
         {item.location && (
            <p
               style={{
                  color: "#6e6e90",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 4,
                  marginTop: 12,
               }}
            >
               <MapPin size={11} style={{ flexShrink: 0 }} />
               {item.location}
            </p>
         )}
      </div>

      {/* Center: Timeline track */}
      <div
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
         }}
      >
         <div
            style={{
               width: 16,
               height: 16,
               borderRadius: "50%",
               border: `2px solid ${accentColor}`,
               backgroundColor: "rgba(6, 6, 16, 0.6)",
               marginTop: 6,
               position: "relative",
               zIndex: 2,
               flexShrink: 0,
            }}
         >
            <div
               className="animate-glow-pulse"
               style={{
                  position: "absolute",
                  inset: 3,
                  borderRadius: "50%",
                  backgroundColor: accentColor,
               }}
            />
         </div>
         <div
            style={{
               width: 2,
               flex: 1,
               background: `linear-gradient(to bottom, ${accentColor}40, ${accentColor}10)`,
               borderRadius: 1,
            }}
         />
      </div>

      {/* Right: Content card */}
      <div
         className="glass-card"
         style={{ padding: "24px 28px", marginBottom: 20 }}
      >
         <TimelineCardContent
            item={item}
            accentColor={accentColor}
            isMobile={false}
            onAnimationComplete={onAnimationComplete}
         />
      </div>
   </motion.div>
);

export default TimelineCardDesktop;
