import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { staggerItem } from "@utils/animations";
import { splitDateRange, isPresent } from "@utils/dateRange";
import { MONO_FONT, GREEN } from "@/constants/theme";
import TimelineCardContent from "./TimelineCardContent";

interface TimelineCardMobileProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   index: number;
   accentColor: string;
   onClick?: () => void;
}

const TimelineCardMobile = ({
   item,
   index,
   accentColor,
   onClick,
}: TimelineCardMobileProps) => {
   const { start, end } = splitDateRange(item.date);
   const active = isPresent(item.date);

   return (
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
               padding: "20px 16px",
               borderLeft: `3px solid ${active ? GREEN : accentColor}`,
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
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     fontFamily: MONO_FONT,
                     fontSize: 12,
                     fontWeight: 600,
                     color: accentColor,
                  }}
               >
                  {active ? (
                     <>
                        {start} -{" "}
                        <span
                           style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              color: GREEN,
                           }}
                           aria-label="Currently active role"
                        >
                           <span
                              className="animate-glow-pulse"
                              aria-hidden="true"
                              style={{
                                 width: 6,
                                 height: 6,
                                 borderRadius: "50%",
                                 backgroundColor: GREEN,
                                 boxShadow: `0 0 6px ${GREEN}99`,
                                 flexShrink: 0,
                              }}
                           />
                           <span>Present</span>
                        </span>
                     </>
                  ) : (
                     <>
                        {start}
                        {end ? ` - ${end}` : ""}
                     </>
                  )}
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
               onClick={onClick}
            />
         </div>
      </motion.div>
   );
};

export default TimelineCardMobile;
