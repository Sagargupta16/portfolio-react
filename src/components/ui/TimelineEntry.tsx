import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { MapPin } from "lucide-react";
import useBreakpoint from "@hooks/useBreakpoint";
import { staggerItem, VIEWPORT_MARGIN } from "@utils/animations";
import { isPresent, shortMonths, splitDateRange } from "@utils/dateRange";
import { formatPlace } from "@utils/format";
import { getSectionCopy } from "@data/sections";
import {
   DURATION,
   EASING,
   GREEN,
   MONO_FONT,
   TEXT_MUTED,
} from "@/constants/theme";
import { ENTRY_INDENT, ENTRY_SIDE_WIDTH } from "./entryStyles";
import PresentIndicator from "./PresentIndicator";
import {
   TimelineNode,
   TIMELINE_DATE_COLUMN,
   TIMELINE_TRACK_COLUMN,
} from "./TimelineSpine";
import "./timelineEntry.css";

interface TimelineEntryProps {
   /** "August 2024 - Present" style range. */
   date: string;
   location?: string;
   /** Rail colour of the list: the node, the start date, the card's light. */
   accentColor: string;
   isMobile: boolean;
   /** The card head (an EntryHeader). */
   children: ReactNode;
   /** Art edge to edge: the right column on desktop, a strip on top below it. */
   media?: ReactNode;
   /** A list for the right column on desktop (chips); inline below it. */
   aside?: ReactNode;
   /** Actions under the head: a disclosure, View details. */
   footer?: ReactNode;
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
   gridTemplateColumns: `${TIMELINE_DATE_COLUMN}px ${TIMELINE_TRACK_COLUMN}px minmax(0, 1fr)`,
};
const DATE_COLUMN: CSSProperties = {
   display: "flex",
   flexDirection: "column",
   alignItems: "flex-end",
   gap: 4,
   paddingTop: 2,
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
   fontSize: 15,
   fontWeight: 600,
   lineHeight: 1.3,
};
const END: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 13,
   color: TEXT_MUTED,
};
const PRESENT: CSSProperties = {
   display: "inline-flex",
   alignItems: "center",
   gap: 6,
   fontFamily: MONO_FONT,
   fontSize: 13,
   fontWeight: 600,
   color: GREEN,
};
const PLACE: CSSProperties = {
   display: "flex",
   alignItems: "center",
   gap: 5,
   marginTop: 8,
   color: TEXT_MUTED,
   fontSize: 12,
};
// Phones: the date row at the top of the card body, the place pushed right.
const PHONE_DATES: CSSProperties = {
   display: "flex",
   alignItems: "center",
   flexWrap: "wrap",
   columnGap: 8,
   rowGap: 4,
   marginBottom: 14,
};

const Present = () => (
   <span style={PRESENT} aria-label={ACTIVE_LABEL}>
      <PresentIndicator />
   </span>
);

// The card under a mouse pointer gets --mx/--my, which the .entry-card
// border light follows (timelineEntry.css), as on the project cards.
const trackPointer = (event: PointerEvent<HTMLDivElement>) => {
   if (event.pointerType !== "mouse") return;
   const card = event.currentTarget;
   const box = card.getBoundingClientRect();
   card.style.setProperty("--mx", `${event.clientX - box.left}px`);
   card.style.setProperty("--my", `${event.clientY - box.top}px`);
};

/**
 * One row of a timeline list, shared by Experience, Positions of
 * Responsibility and Education so the three read as one family, and built
 * like the project and service cards. Desktop: date column, node on the rail
 * (drawn by TimelineSpine), card with its art or list in a tinted column on
 * the right. Below desktop the column becomes a strip on top (art) or moves
 * into the body (a list); phones also drop the date column for a date row.
 * Each layout keeps its own viewport trigger and key: after a resize across
 * the breakpoint the parent is already "visible", so a late-mounting child
 * would stay "hidden", and the desktop entry's parked x offset would carry
 * into the phone card.
 */
const TimelineEntry = ({
   date,
   location,
   accentColor,
   isMobile,
   children,
   media,
   aside,
   footer,
}: Readonly<TimelineEntryProps>) => {
   const { isTablet } = useBreakpoint();
   const { start, end } = splitDateRange(shortMonths(date));
   const active = isPresent(date);
   const place = location ? formatPlace(location) : "";
   // Below desktop the right column would squeeze the text: stack instead.
   const stacked = isMobile || isTablet;
   const side = media ?? aside;

   // 2.5% fill and 7% edge as hex alpha suffixes, as the service art.
   const fill = `${accentColor}06`;
   const edge = `1px solid ${accentColor}12`;
   const indent = isMobile ? 0 : ENTRY_INDENT;

   const card = (
      <div
         className="glass-card entry-card"
         onPointerMove={trackPointer}
         style={
            {
               "--entry-accent": accentColor,
               display: "flex",
               flexDirection: stacked ? "column" : "row",
               padding: 0,
               overflow: "hidden",
               marginBottom: isMobile ? 16 : 24,
            } as CSSProperties
         }
      >
         {stacked && media && (
            <div style={{ background: fill, borderBottom: edge }}>{media}</div>
         )}
         <div
            style={{
               flex: 1,
               minWidth: 0,
               padding: isMobile ? 20 : 24,
            }}
         >
            {isMobile && (
               <div style={PHONE_DATES}>
                  <span style={{ ...START, fontSize: 13, color: accentColor }}>
                     {start}
                  </span>
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
                     <span
                        style={{ ...PLACE, marginTop: 0, marginLeft: "auto" }}
                     >
                        <MapPin size={11} style={{ flexShrink: 0 }} />
                        {place}
                     </span>
                  )}
               </div>
            )}
            {children}
            {stacked && aside && (
               <div style={{ marginTop: 16, marginLeft: indent }}>{aside}</div>
            )}
            {footer && (
               <div
                  style={{
                     marginTop: 16,
                     marginLeft: indent,
                  }}
               >
                  {footer}
               </div>
            )}
         </div>
         {!stacked && side && (
            <div
               style={{
                  flex: `0 0 ${ENTRY_SIDE_WIDTH}`,
                  background: fill,
                  borderLeft: edge,
                  display: "flex",
                  flexDirection: "column",
               }}
            >
               {side}
            </div>
         )}
      </div>
   );

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
         >
            {card}
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
            {active ? <Present /> : <span style={END}>{end ?? ""}</span>}
            {place && (
               <span style={PLACE}>
                  <MapPin size={12} style={{ flexShrink: 0 }} />
                  {place}
               </span>
            )}
         </div>

         {/* The rail itself is drawn by TimelineSpine. */}
         <div style={TRACK}>
            <TimelineNode color={active ? GREEN : accentColor} ring={active} />
         </div>

         {card}
      </motion.div>
   );
};

export default TimelineEntry;
