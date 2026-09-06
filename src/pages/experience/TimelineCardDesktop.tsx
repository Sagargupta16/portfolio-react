import { motion, type Variants } from "motion/react";
import { MapPin } from "lucide-react";
import type { ProfessionalExperience, PositionOfResponsibility } from "@/types";
import { splitDateRange, isPresent } from "@utils/dateRange";
import { MONO_FONT, GREEN, TEXT_MUTED, EASING } from "@/constants/theme";
import {
   TimelineNode,
   TIMELINE_DATE_COLUMN,
   TIMELINE_TRACK_COLUMN,
} from "@components/ui/TimelineSpine";
import TimelineCardContent from "./TimelineCardContent";
import PresentIndicator from "./PresentIndicator";

interface TimelineCardDesktopProps {
   item: ProfessionalExperience | PositionOfResponsibility;
   index: number;
   accentColor: string;
   onClick?: () => void;
}

// Every card sits right of the track, so it enters from the track side only.
const timelineEntry: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: EASING.cinematic },
   },
};

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
            gridTemplateColumns: `${TIMELINE_DATE_COLUMN}px ${TIMELINE_TRACK_COLUMN}px 1fr`,
            gap: 0,
         }}
         variants={timelineEntry}
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

         {/* Center: Timeline track (the rail itself is drawn by TimelineSpine) */}
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
            }}
         >
            <TimelineNode color={active ? GREEN : accentColor} ring={active} />
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
