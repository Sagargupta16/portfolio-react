import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import {
   CARD,
   LABEL,
   PANEL,
   WHITE_14,
   WHITE_18,
   WHITE_28,
   WHITE_35,
   avatar,
   bar,
   loop,
   type PanelProps,
} from "./shared";

/* Lingua Connect: filter tutors, book a priced slot, join the video room.
   A filter toggles on, one tutor card drops out, a slot row slides in with
   BOOK, BOOK crossfades to JOIN after checkout, and the ROOM tile mounts. */

const CYCLE = 5.2;
const FILTER_WIDTHS = [18, 24, 14];
const STARS = [0, 1, 2, 3, 4];

/* Beat boundaries as fractions of the cycle. */
const T_FILTER = 0.115;
const T_DIM = 0.27;
const T_SLOT = 0.35;
const T_PRESS = 0.423;
const T_PRESSED = 0.46;
const T_BOOKED = 0.5;
const T_JOIN = 0.54;
const T_ROOM = 0.654;
const T_ROOM_IN = 0.73;
const T_RESET = 0.846;

/* Cards sit at 22% of the panel on desktop but never higher than 7 px, so
   the slot row under them still clears the ~35 px phone-slot clip. */
const CARDS_TOP = "max(7px, 22%)";
const CARD_HEIGHT = 18;
const SLOT_TOP = `calc(${CARDS_TOP} + ${CARD_HEIGHT + 2}px)`;
const SLOT_HEIGHT = 8;

const TUTOR_CARD: CSSProperties = {
   ...CARD,
   position: "absolute",
   top: CARDS_TOP,
   width: "46%",
   height: CARD_HEIGHT,
   padding: "2px 3px",
   boxSizing: "border-box",
};

/* Solid language chip on a tutor card. */
const chip = (tint: string): CSSProperties => bar(12, `${tint}55`, 2);

const PILL_LABEL: CSSProperties = {
   ...LABEL,
   position: "absolute",
   inset: 0,
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   borderRadius: 3,
};

/* Language / Experience / Price toggles; the first one switches on. */
const FilterPills = ({ tint }: PanelProps) => (
   <div
      style={{ position: "absolute", left: 0, top: 0, display: "flex", gap: 3 }}
   >
      {FILTER_WIDTHS.map((w) => (
         <span
            key={w}
            style={{
               display: "block",
               width: w,
               height: 5,
               borderRadius: 3,
               background: WHITE_14,
            }}
         />
      ))}
      <motion.span
         animate={{ opacity: [0, 1, 1, 0] }}
         transition={loop(CYCLE, [0, T_FILTER, T_RESET, 1])}
         style={{
            position: "absolute",
            left: -1,
            top: -1,
            width: FILTER_WIDTHS[0],
            height: 5,
            borderRadius: 3,
            border: `1px solid ${tint}90`,
            background: `${tint}25`,
         }}
      />
   </div>
);

const TutorCard = ({ tint, chip }: { tint: string; chip: ReactNode }) => (
   <>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
         <span style={avatar(tint)} />
         <span style={bar("60%", WHITE_18)} />
      </div>
      <div
         style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}
      >
         {chip}
         <span style={{ display: "flex", gap: 1, marginLeft: 2 }}>
            {STARS.map((s) => (
               <span
                  key={s}
                  style={{
                     display: "block",
                     width: 2,
                     height: 2,
                     borderRadius: "50%",
                     background: `${tint}90`,
                  }}
               />
            ))}
         </span>
      </div>
   </>
);

/* Card A matches the filter (chip brightens); card B is filtered out. */
const TutorCards = ({ tint }: PanelProps) => (
   <>
      <div style={{ ...TUTOR_CARD, left: 0 }}>
         <TutorCard
            tint={tint}
            chip={
               <motion.span
                  animate={{ opacity: [0.5, 0.5, 1, 1, 0.5] }}
                  transition={loop(CYCLE, [0, T_FILTER, T_DIM, T_RESET, 1])}
                  style={chip(tint)}
               />
            }
         />
      </div>
      <motion.div
         animate={{ opacity: [0.85, 0.85, 0.25, 0.25, 0.85] }}
         transition={loop(CYCLE, [0, T_FILTER, T_DIM, T_RESET, 1])}
         style={{ ...TUTOR_CARD, left: "54%" }}
      >
         <TutorCard tint={tint} chip={<span style={chip(tint)} />} />
      </motion.div>
   </>
);

/* Available Slots row: date, time, duration, price, then BOOK -> JOIN. */
const SlotRow = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ y: [6, 6, 0, 0, 6], opacity: [0, 0, 1, 1, 0] }}
      transition={loop(CYCLE, [0, T_DIM, T_SLOT, T_RESET, 1])}
      style={{
         position: "absolute",
         left: 0,
         right: 0,
         top: SLOT_TOP,
         display: "flex",
         alignItems: "center",
         gap: 4,
      }}
   >
      <span
         style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            width: "60%",
            height: SLOT_HEIGHT,
            padding: "0 4px",
            boxSizing: "border-box",
            borderRadius: 5,
            border: `1px solid ${tint}40`,
         }}
      >
         <span style={bar(6, WHITE_28, 2)} />
         <span style={bar(6, WHITE_28, 2)} />
         <span style={bar(8, WHITE_28, 2)} />
         <span style={{ ...bar(10, WHITE_28, 2), marginLeft: "auto" }} />
      </span>
      <span
         style={{
            position: "relative",
            width: 24,
            height: SLOT_HEIGHT,
            flexShrink: 0,
         }}
      >
         <motion.span
            animate={{
               scale: [1, 1, 0.9, 1, 1, 1, 1],
               opacity: [1, 1, 1, 1, 0, 0, 1],
            }}
            transition={loop(CYCLE, [
               0,
               T_PRESS,
               T_PRESSED,
               T_BOOKED,
               T_JOIN,
               T_RESET,
               1,
            ])}
            style={{
               ...PILL_LABEL,
               border: `1px solid ${tint}35`,
               background: `${tint}0a`,
               color: `${tint}cc`,
            }}
         >
            BOOK
         </motion.span>
         <motion.span
            animate={{ opacity: [0, 0, 1, 1, 0] }}
            transition={loop(CYCLE, [0, T_BOOKED, T_JOIN, T_RESET, 1])}
            style={{
               ...PILL_LABEL,
               border: `1px solid ${GREEN}`,
               background: `${GREEN}26`,
               color: GREEN,
            }}
         >
            JOIN
         </motion.span>
      </span>
   </motion.div>
);

/* /room/:videoId mounting: tile with live dot and PiP thumbnail. */
const RoomTile = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ y: [4, 4, 0, 0, 4], opacity: [0, 0, 1, 1, 0] }}
      transition={loop(CYCLE, [0, T_ROOM, T_ROOM_IN, T_RESET, 1])}
      style={{
         position: "absolute",
         right: 0,
         top: 0,
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         gap: 2,
      }}
   >
      <span
         style={{
            position: "relative",
            display: "block",
            width: 26,
            height: 16,
            borderRadius: 3,
            border: `1px solid ${WHITE_14}`,
            background: `${tint}0a`,
         }}
      >
         <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{
               position: "absolute",
               left: 2,
               top: 2,
               width: 3,
               height: 3,
               borderRadius: "50%",
               background: GREEN,
            }}
         />
         <span
            style={{
               position: "absolute",
               right: 2,
               bottom: 2,
               width: 6,
               height: 4,
               borderRadius: 1,
               background: WHITE_18,
            }}
         />
      </span>
      <span style={{ ...LABEL, color: WHITE_35 }}>ROOM</span>
   </motion.div>
);

const TutoringPanel = ({ tint }: PanelProps) => (
   <div style={PANEL}>
      <FilterPills tint={tint} />
      <TutorCards tint={tint} />
      <SlotRow tint={tint} />
      <RoomTile tint={tint} />
   </div>
);

export default TutoringPanel;
