import type { CSSProperties, ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { MapPin } from "lucide-react";
import { staggerItem, VIEWPORT_MARGIN } from "@utils/animations";
import { isPresent, splitDateRange } from "@utils/dateRange";
import { formatPlace } from "@utils/format";
import { getSectionCopy } from "@data/sections";
import {
   DURATION,
   EASING,
   GREEN,
   MONO_FONT,
   TEXT_MUTED,
} from "@/constants/theme";
import PresentIndicator from "./PresentIndicator";
import {
   TimelineNode,
   TIMELINE_DATE_COLUMN,
   TIMELINE_TRACK_COLUMN,
} from "./TimelineSpine";

interface TimelineEntryProps {
   /** "August 2024 - Present" style range. */
   date: string;
   location?: string;
   /** Rail colour of the list: the node and the start date. */
   accentColor: string;
   isMobile: boolean;
   /** The card body. */
   children: ReactNode;
}

const ACTIVE_LABEL = getSectionCopy("experience").card.active_role;

// Every card sits right of the track, so it enters from the track side only.
const desktopEntry: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: EASING.cinematic },
   },
};
const LAYOUT_TRANSITION = {
   layout: { duration: DURATION.default, ease: EASING.standard },
};

const ROW: CSSProperties = {
   display: "grid",
   gridTemplateColumns: `${TIMELINE_DATE_COLUMN}px ${TIMELINE_TRACK_COLUMN}px 1fr`,
};
const DATE_COLUMN: CSSProperties = {
   paddingTop: 4,
   paddingRight: 20,
   textAlign: "right",
};
const TRACK: CSSProperties = {
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
};
const START: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 12,
   fontWeight: 600,
};
const END: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 11,
   color: TEXT_MUTED,
};
const PRESENT: CSSProperties = {
   display: "inline-flex",
   alignItems: "center",
   gap: 5,
   fontFamily: MONO_FONT,
   fontSize: 11,
   fontWeight: 600,
   color: GREEN,
   letterSpacing: "0.02em",
};
const PLACE: CSSProperties = {
   display: "flex",
   alignItems: "center",
   gap: 4,
   color: TEXT_MUTED,
   fontSize: 12,
};
// Phones: the date row on top of the card, the place pushed right.
const PHONE_DATES: CSSProperties = {
   display: "flex",
   alignItems: "center",
   flexWrap: "wrap",
   columnGap: 8,
   rowGap: 4,
   marginBottom: 12,
};

const Present = () => (
   <span style={PRESENT} aria-label={ACTIVE_LABEL}>
      <PresentIndicator />
   </span>
);

/**
 * One row of a timeline list, shared by Experience, Positions of
 * Responsibility and Education so the three read as one family. Desktop: date
 * column, node on the rail (drawn by TimelineSpine), card. Phones: the card
 * alone with its dates on top. Each layout keeps its own viewport trigger and
 * key: after a resize across the breakpoint the parent is already "visible",
 * so a late-mounting child would stay "hidden", and the desktop entry's parked
 * x offset would carry into the phone card.
 */
const TimelineEntry = ({
   date,
   location,
   accentColor,
   isMobile,
   children,
}: Readonly<TimelineEntryProps>) => {
   const { start, end } = splitDateRange(date);
   const active = isPresent(date);
   const place = location ? formatPlace(location) : "";

   if (isMobile) {
      return (
         <motion.div
            key="mobile"
            layout="position"
            variants={staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: VIEWPORT_MARGIN }}
            transition={LAYOUT_TRANSITION}
            style={{ marginBottom: 16 }}
         >
            <div className="glass-card" style={{ padding: "20px 16px" }}>
               <div style={PHONE_DATES}>
                  <span style={{ ...START, color: accentColor }}>{start}</span>
                  {(active || end) && (
                     <span
                        style={{
                           ...END,
                           display: "inline-flex",
                           alignItems: "center",
                           gap: 6,
                        }}
                     >
                        -{active ? <Present /> : <span>{end}</span>}
                     </span>
                  )}
                  {place && (
                     <span style={{ ...PLACE, marginLeft: "auto" }}>
                        <MapPin size={11} style={{ flexShrink: 0 }} />
                        {place}
                     </span>
                  )}
               </div>
               {children}
            </div>
         </motion.div>
      );
   }

   return (
      <motion.div
         key="desktop"
         layout="position"
         style={ROW}
         variants={desktopEntry}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
         transition={LAYOUT_TRANSITION}
      >
         <div style={DATE_COLUMN}>
            <span style={{ ...START, color: accentColor }}>{start}</span>
            {active ? (
               <span
                  style={{
                     ...PRESENT,
                     justifyContent: "flex-end",
                     width: "100%",
                     marginTop: 2,
                  }}
                  aria-label={ACTIVE_LABEL}
               >
                  <PresentIndicator />
               </span>
            ) : (
               <span style={{ ...END, display: "block", marginTop: 2 }}>
                  {end ?? ""}
               </span>
            )}
            {place && (
               <p
                  style={{
                     ...PLACE,
                     justifyContent: "flex-end",
                     marginTop: 12,
                  }}
               >
                  <MapPin size={11} style={{ flexShrink: 0 }} />
                  {place}
               </p>
            )}
         </div>

         {/* The rail itself is drawn by TimelineSpine. */}
         <div style={TRACK}>
            <TimelineNode color={active ? GREEN : accentColor} ring={active} />
         </div>

         <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
            {children}
         </div>
      </motion.div>
   );
};

export default TimelineEntry;
