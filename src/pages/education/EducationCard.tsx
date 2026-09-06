import { motion, type Variants } from "motion/react";
import { MapPin } from "lucide-react";
import type { Education } from "@/types";
import { staggerItem } from "@utils/animations";
import { splitDateRange } from "@utils/dateRange";
import { MONO_FONT, PURPLE, TEXT_MUTED, EASING } from "@/constants/theme";
import {
   TimelineNode,
   TIMELINE_DATE_COLUMN,
   TIMELINE_TRACK_COLUMN,
} from "@components/ui/TimelineSpine";
import EducationCardContent from "./EducationCardContent";

interface EducationCardProps {
   item: Education;
   index: number;
   isMobile: boolean;
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

const EducationCard = ({ item, index, isMobile }: EducationCardProps) => {
   if (isMobile) {
      return (
         <motion.div
            // key forces a fresh mount when the breakpoint flips -- otherwise
            // Motion carries the desktop entry's parked x offset into this
            // branch and the card renders shifted off-screen.
            key="mobile"
            variants={staggerItem}
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            style={{ marginBottom: 20 }}
         >
            <div
               className="glass-card"
               style={{
                  padding: "20px 16px",
                  borderLeft: `3px solid ${PURPLE}`,
               }}
            >
               {/* Date + Location at top */}
               <div
                  style={{
                     display: "flex",
                     alignItems: "center",
                     gap: 8,
                     marginBottom: 12,
                  }}
               >
                  <span
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 12,
                        fontWeight: 600,
                        color: PURPLE,
                     }}
                  >
                     {splitDateRange(item.date).start}
                  </span>
                  {splitDateRange(item.date).end && (
                     <span
                        style={{
                           fontFamily: MONO_FONT,
                           fontSize: 11,
                           color: TEXT_MUTED,
                        }}
                     >
                        - {splitDateRange(item.date).end}
                     </span>
                  )}
                  {item.location && (
                     <span
                        style={{
                           color: TEXT_MUTED,
                           fontSize: 12,
                           display: "flex",
                           alignItems: "center",
                           gap: 4,
                           marginLeft: "auto",
                        }}
                     >
                        <MapPin size={11} style={{ flexShrink: 0 }} />
                        {item.location.split(",")[0]}
                     </span>
                  )}
               </div>
               <EducationCardContent item={item} isMobile={isMobile} />
            </div>
         </motion.div>
      );
   }

   return (
      <motion.div
         key="desktop"
         style={{
            display: "grid",
            gridTemplateColumns: `${TIMELINE_DATE_COLUMN}px ${TIMELINE_TRACK_COLUMN}px 1fr`,
            gap: 0,
         }}
         variants={timelineEntry}
         custom={index}
         // Own viewport trigger -- parent propagation breaks after a
         // breakpoint remount (see TimelineCardDesktop).
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      >
         {/* Left: Date + Location */}
         <div style={{ paddingTop: 4, textAlign: "right", paddingRight: 20 }}>
            <span
               style={{
                  fontFamily: MONO_FONT,
                  fontSize: 12,
                  fontWeight: 600,
                  color: PURPLE,
               }}
            >
               {item.date.split(" - ")[0]}
            </span>
            <span
               style={{
                  display: "block",
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  color: TEXT_MUTED,
                  marginTop: 2,
               }}
            >
               {item.date.includes(" - ") ? item.date.split(" - ")[1] : ""}
            </span>
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
                  {item.location.split(",")[0]}
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
            <TimelineNode color={PURPLE} />
         </div>

         {/* Right: Content card */}
         <div
            className="glass-card"
            style={{ padding: "24px 24px", marginBottom: 20 }}
         >
            <EducationCardContent item={item} isMobile={isMobile} />
         </div>
      </motion.div>
   );
};

export default EducationCard;
