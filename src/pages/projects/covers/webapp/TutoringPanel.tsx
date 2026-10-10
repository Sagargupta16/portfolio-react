import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import { Backdrop, Packet, Wires, type Hop } from "./StageParts";
import {
   BORDER_BOX,
   INK,
   LABEL,
   LABEL_ABOVE,
   WHITE_06,
   WHITE_10,
   WHITE_14,
   WHITE_18,
   WHITE_28,
   WHITE_60,
   avatar,
   bar,
   centredAt,
   hCurve,
   loop,
   span,
   type PanelProps,
   type Pt,
} from "./shared";

/* Lingua Connect: the Tutor page. A Language option in FILTERS switches
   on, the tutor cards that fail checkLanguage dim, Book on the matching
   tutor's slot sends a packet through the STRIPE checkout session, and the
   class (createClass with its videoId) lands in Upcoming Classes, where
   JOIN lights. */

const CYCLE = 5.4;

const CARD_PAD = 6;
const CARD_H = 20;
const CARD_GAP = 5;
const MATCH_CENTRE = 1 + CARD_PAD + CARD_H + CARD_GAP + CARD_H / 2;

const FILTERS = { left: 8, right: 26, y: 37 };
const TUTORS = { left: 33, right: 58, y: 46 };
const UPCOMING = { left: 76, right: 92, y: 50 };
const STRIPE_AT: Pt = { x: 67, y: 66 };

const BOOK: Hop = {
   from: { x: TUTORS.right, y: TUTORS.y },
   to: STRIPE_AT,
   depart: 0.28,
   arrive: 0.44,
};
const CLASS: Hop = {
   from: STRIPE_AT,
   to: { x: UPCOMING.left, y: UPCOMING.y },
   depart: 0.52,
   arrive: 0.66,
};

const ON_OFF = [0, 0, 1, 1, 0, 0];
const DIMMED = [1, 1, 0.28, 0.28, 1, 1];
const OPTION_TIMES = [0, 0.06, 0.12, 0.9, 0.97, 1];
const DIM_TIMES = [0, 0.12, 0.22, 0.9, 0.97, 1];
const MATCH_TIMES = [0, 0.16, 0.24, 0.9, 0.97, 1];
const PAID_TIMES = [0, 0.44, 0.47, 0.5, 0.56, 1];
const LAND_TIMES = [0, 0.66, 0.74, 0.9, 0.97, 1];
const JOIN_TIMES = [0, 0.76, 0.82, 0.9, 0.97, 1];

const GROUPS = ["language", "experience", "price"];
const OPTIONS = ["first", "second", "third"];

const OPTION: CSSProperties = {
   position: "relative",
   display: "block",
   width: 10,
   height: 6,
   borderRadius: 3,
   background: WHITE_14,
};

const COLUMN: CSSProperties = {
   display: "flex",
   flexDirection: "column",
};

/* Language / Experience / Price groups; Language's first option toggles on. */
const FiltersPanel = ({ tint }: PanelProps) => (
   <div style={span(FILTERS.left, FILTERS.right, FILTERS.y)}>
      <span style={LABEL_ABOVE}>FILTERS</span>
      <div style={{ ...COLUMN, gap: 8, padding: 7 }}>
         {GROUPS.map((group, g) => (
            <div key={group}>
               <span style={bar("70%", WHITE_10, 3)} />
               <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
                  {OPTIONS.map((option, o) => (
                     <span key={option} style={OPTION}>
                        {g === 0 && o === 0 && (
                           <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: ON_OFF }}
                              transition={loop(CYCLE, OPTION_TIMES)}
                              style={{
                                 position: "absolute",
                                 inset: 0,
                                 borderRadius: 3,
                                 background: tint,
                              }}
                           />
                        )}
                     </span>
                  ))}
               </div>
            </div>
         ))}
      </div>
   </div>
);

const TUTOR_CARD: CSSProperties = {
   position: "relative",
   display: "flex",
   alignItems: "center",
   gap: 5,
   height: CARD_H,
   padding: "0 5px",
   borderRadius: 5,
   border: `1px solid ${WHITE_06}`,
   boxSizing: BORDER_BOX,
};

/* tutor-card: avatar, name, language chips and the rating row. */
const TutorCard = ({ tint }: PanelProps) => (
   <div style={TUTOR_CARD}>
      <span style={avatar(tint, 10)} />
      <span style={{ flex: 1, minWidth: 0 }}>
         <span style={bar("64%", WHITE_18)} />
         <span style={{ display: "flex", gap: 3, marginTop: 4 }}>
            <span style={bar(8, `${tint}70`, 3)} />
            <span style={bar(8, `${tint}40`, 3)} />
            <span
               style={{
                  ...bar(12, WHITE_10, 3),
                  flex: "0 1 12px",
                  minWidth: 0,
                  marginLeft: "auto",
               }}
            />
         </span>
      </span>
   </div>
);

const Dimmed = ({ tint, count }: { tint: string; count: number }) => (
   <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: DIMMED }}
      transition={loop(CYCLE, DIM_TIMES)}
      style={{ ...COLUMN, gap: CARD_GAP }}
   >
      {Array.from({ length: count }, (_, i) => `dim${i}`).map((id) => (
         <TutorCard key={id} tint={tint} />
      ))}
   </motion.div>
);

/* The cards that fail checkLanguage dim; the match gets a tint ring. */
const TutorList = ({ tint }: PanelProps) => (
   <div style={span(TUTORS.left, TUTORS.right, TUTORS.y, MATCH_CENTRE)}>
      <span style={LABEL_ABOVE}>TUTOR</span>
      <div style={{ ...COLUMN, gap: CARD_GAP, padding: CARD_PAD }}>
         <Dimmed tint={tint} count={1} />
         <div style={{ position: "relative" }}>
            <motion.span
               initial={{ opacity: 0 }}
               animate={{ opacity: ON_OFF }}
               transition={loop(CYCLE, MATCH_TIMES)}
               style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 5,
                  border: `1px solid ${tint}`,
                  background: `${tint}12`,
               }}
            />
            <TutorCard tint={tint} />
         </div>
         <Dimmed tint={tint} count={2} />
      </div>
   </div>
);

const STRIPE_RING = 13;

/* Stripe checkout: the session ring flashes green as the payment clears. */
const StripeNode = () => (
   <div
      style={{
         ...centredAt(STRIPE_AT),
         width: STRIPE_RING,
         height: STRIPE_RING,
      }}
   >
      <span
         style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${WHITE_28}`,
            background: INK,
         }}
      />
      <motion.span
         initial={{ opacity: 0, scale: 1 }}
         animate={{
            opacity: [0, 0, 1, 0.6, 0, 0],
            scale: [1, 1, 1.15, 1.5, 1.6, 1],
         }}
         transition={loop(CYCLE, PAID_TIMES)}
         style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${GREEN}`,
         }}
      />
      <span
         style={{
            ...LABEL,
            left: "50%",
            top: STRIPE_RING + 6,
            translate: "-50% 0",
         }}
      >
         STRIPE
      </span>
   </div>
);

const JOIN_PILL: CSSProperties = {
   ...LABEL,
   position: "relative",
   display: "inline-flex",
   alignItems: "center",
   justifyContent: "center",
   alignSelf: "flex-start",
   width: 32,
   height: 12,
   marginTop: 6,
   borderRadius: 6,
   border: `1px solid ${WHITE_14}`,
   color: WHITE_60,
   boxSizing: BORDER_BOX,
};

const UPCOMING_PAD = 6;

/* Upcoming Classes: empty until the booked class slides in; its Join
   button turns green once the class is live. */
const UpcomingPanel = ({ tint }: PanelProps) => (
   <div style={span(UPCOMING.left, UPCOMING.right, UPCOMING.y)}>
      <div
         style={{
            ...COLUMN,
            justifyContent: "center",
            height: 54,
            padding: UPCOMING_PAD,
            boxSizing: BORDER_BOX,
         }}
      >
         <span style={bar("60%", WHITE_06)} />
      </div>
      <motion.div
         initial={{ opacity: 0, y: 6 }}
         animate={{ opacity: ON_OFF, y: [6, 6, 0, 0, 0, 6] }}
         transition={loop(CYCLE, LAND_TIMES)}
         style={{ ...COLUMN, position: "absolute", inset: UPCOMING_PAD }}
      >
         <span style={bar("62%", `${tint}b3`, 5)} />
         <span style={{ ...bar("84%", WHITE_14, 3), marginTop: 4 }} />
         <span style={{ ...bar("56%", WHITE_10, 3), marginTop: 3 }} />
         <span style={JOIN_PILL}>
            <motion.span
               initial={{ opacity: 0 }}
               animate={{ opacity: ON_OFF }}
               transition={loop(CYCLE, JOIN_TIMES)}
               style={{
                  position: "absolute",
                  inset: -1,
                  borderRadius: 6,
                  border: `1px solid ${GREEN}`,
                  background: `${GREEN}33`,
               }}
            />
            <span style={{ position: "relative" }}>JOIN</span>
         </span>
      </motion.div>
   </div>
);

const TutoringPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 62, y: 52 }} texture="dots" />
      <Wires
         paths={[
            hCurve(
               { x: FILTERS.right, y: FILTERS.y },
               { x: TUTORS.left, y: TUTORS.y },
            ),
            hCurve(BOOK.from, BOOK.to),
            hCurve(CLASS.from, CLASS.to),
         ]}
      />
      <FiltersPanel tint={tint} />
      <TutorList tint={tint} />
      <StripeNode />
      <UpcomingPanel tint={tint} />
      <Packet hop={BOOK} color={tint} cycle={CYCLE} />
      <Packet hop={CLASS} color={tint} cycle={CYCLE} />
   </>
);

export default TutoringPanel;
