import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { slideInLeft, slideInRight } from "@utils/animations";
import { splitDateRange, isPresent } from "@utils/dateRange";
import { MONO_FONT, GREEN, TEXT_MUTED } from "@/constants/theme";
import TimelineCardContent from "./TimelineCardContent";
import PresentIndicator from "./PresentIndicator";

interface TimelineCardDesktopProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   index: number;
   accentColor: string;
   onClick?: () => void;
}

const TimelineCardDesktop = ({
   item,
   index,
   accentColor,
   onClick,
}: TimelineCardDesktopProps) => {
   const { start, end } = splitDateRange(item.date);
   const active = isPresent(item.date);

   return (
      <motion.div
         layout="position"
         style={{
            display: "grid",
            gridTemplateColumns: "160px 40px 1fr",
            gap: 0,
         }}
         variants={index % 2 === 0 ? slideInLeft : slideInRight}
         custom={index}
         // Own viewport trigger: parent propagation breaks when the card
         // remounts after a resize across the mobile/desktop boundary (the
         // parent is already "visible", so late-mounting children would stay
         // stuck at "hidden" forever).
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
         transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
      >
         {/* Left: Date + Location */}
         <div style={{ paddingTop: 4, textAlign: "right", paddingRight: 20 }}>
            <span
               style={{
                  fontFamily: MONO_FONT,
                  fontSize: 12,
                  fontWeight: 600,
                  color: accentColor,
               }}
            >
               {start}
            </span>
            {active ? (
               <span
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     justifyContent: "flex-end",
                     gap: 5,
                     width: "100%",
                     marginTop: 2,
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     fontWeight: 600,
                     color: GREEN,
                     letterSpacing: "0.02em",
                  }}
                  aria-label="Currently active role"
               >
                  <PresentIndicator />
               </span>
            ) : (
               <span
                  style={{
                     display: "block",
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     color: TEXT_MUTED,
                     marginTop: 2,
                  }}
               >
                  {end ?? ""}
               </span>
            )}
            {item.location && (
               <p
                  style={{
                     color: TEXT_MUTED,
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
                  border: `2px solid ${active ? GREEN : accentColor}`,
                  backgroundColor: "rgba(6, 6, 16, 0.6)",
                  marginTop: 4,
                  position: "relative",
                  zIndex: 2,
                  flexShrink: 0,
                  boxShadow: active ? `0 0 0 4px ${GREEN}22` : undefined,
               }}
            >
               <div
                  className="animate-glow-pulse"
                  style={{
                     position: "absolute",
                     inset: 3,
                     borderRadius: "50%",
                     backgroundColor: active ? GREEN : accentColor,
                  }}
               />
            </div>
            <div
               style={{
                  width: 2,
                  flex: 1,
                  background: `linear-gradient(to bottom, ${accentColor}40, ${accentColor}10)`,
                  borderRadius: 4,
               }}
            />
         </div>

         {/* Right: Content card */}
         <div
            className="glass-card"
            style={{ padding: "24px 24px", marginBottom: 20 }}
         >
            <TimelineCardContent
               item={item}
               accentColor={accentColor}
               isMobile={false}
               onClick={onClick}
            />
         </div>
      </motion.div>
   );
};

export default TimelineCardDesktop;
