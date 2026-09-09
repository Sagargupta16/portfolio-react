import type { Easing, Transition } from "motion/react";
import { motion } from "motion/react";
import {
   HAIRLINE,
   LABEL,
   PANEL,
   WHITE_06,
   WHITE_10,
   WHITE_12,
   WHITE_14,
   WHITE_18,
   WHITE_22,
   WHITE_28,
   WHITE_35,
   WHITE_60,
   WHITE_85,
   avatar,
   bar,
   type PanelProps,
} from "./shared";

/* Orbit: the contacts DataTable. Rows enter, the NAME sort chevron flips and
   rows swap places, then a row is checked and the 1 SELECTED badge appears. */

const CYCLE = 5;
const ROW_HEIGHT = 13;
const GAP = 3;
const SWAP = 2 * (ROW_HEIGHT + GAP);
const NAME_COLUMN = "30%";
const LEAD = 21; // checkbox + avatar + gaps, so header labels sit over cells

/* Beat boundaries as fractions of the cycle. */
const T_SORT = 0.34;
const T_SORTED = 0.44;
const T_SELECT = 0.52;
const T_SELECTED = 0.6;
const T_FADE = 0.92;
const T_GONE = 0.96;

const EASE: Easing = "easeInOut";

/* Infinite keyframe loop with one ease per segment: Motion runs opacity
   through WAAPI, which would spread a single ease over the whole iteration
   while transforms ease each segment, pulling the two tracks off the beats. */
const loop = (
   duration: number,
   times: number[],
   ease: Easing = EASE,
): Transition => ({
   duration,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

type Status = "active" | "paused" | "pending";

interface RowSpec {
   id: string;
   status: Status;
   selected?: boolean;
   times: number[];
   opacity: number[];
   y: number[];
}

const ROWS: RowSpec[] = [
   {
      id: "first",
      status: "active",
      times: [0, 0.04, 0.12, T_SORT, T_SORTED, T_FADE, T_GONE, 1],
      opacity: [0, 0, 1, 1, 1, 1, 0, 0],
      y: [6, 6, 0, 0, SWAP, SWAP, SWAP, 6],
   },
   {
      id: "second",
      status: "paused",
      times: [0, 0.076, 0.156, T_FADE, T_GONE, 1],
      opacity: [0, 0, 1, 1, 0, 0],
      y: [6, 6, 0, 0, 0, 6],
   },
   {
      id: "third",
      status: "pending",
      selected: true,
      times: [0, 0.112, 0.192, T_SORT, T_SORTED, T_FADE, T_GONE, 1],
      opacity: [0, 0, 1, 1, 1, 1, 0, 0],
      y: [6, 6, 0, 0, -SWAP, -SWAP, -SWAP, 6],
   },
];

/* Active is the tint pill, Paused a dim one, Pending a faint tint pill with
   a neutral dot: a state, not a warning, so no amber. */
const statusStyles = (
   tint: string,
): Record<Status, { bg: string; dot?: string }> => ({
   active: { bg: `${tint}30`, dot: tint },
   paused: { bg: WHITE_10 },
   pending: { bg: `${tint}18`, dot: WHITE_60 },
});

const SELECT_TIMES = [0, T_SELECT, T_SELECTED, T_GONE, 1];
const ADD_BUTTON_WIDTH = 22;
const BADGE_RIGHT = ADD_BUTTON_WIDTH + 4; // button plus the toolbar gap

/* Search pill, the "Add contact" button and the selection badge. The badge
   is out of flow so its text can never push the button off a phone panel. */
const Toolbar = ({ tint }: PanelProps) => (
   <div
      style={{
         position: "relative",
         display: "flex",
         alignItems: "center",
         gap: 4,
         height: 10,
      }}
   >
      <span
         style={{
            flex: 1,
            maxWidth: "60%",
            height: 9,
            borderRadius: 3,
            border: HAIRLINE,
            background: WHITE_06,
            boxSizing: "border-box",
         }}
      />
      <span style={{ flex: 1 }} />
      <span
         style={{
            position: "relative",
            display: "block",
            width: ADD_BUTTON_WIDTH,
            height: 10,
            borderRadius: 3,
            background: `${tint}e6`,
            flexShrink: 0,
         }}
      >
         <span
            style={{
               position: "absolute",
               left: 8.5,
               top: 4.5,
               width: 5,
               height: 1,
               background: WHITE_85,
            }}
         />
         <span
            style={{
               position: "absolute",
               left: 10.5,
               top: 2.5,
               width: 1,
               height: 5,
               background: WHITE_85,
            }}
         />
      </span>
      <motion.span
         animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [2, 2, 0, 0, 0, 2] }}
         transition={loop(CYCLE, [0, T_SELECT, T_SELECTED, T_FADE, T_GONE, 1])}
         style={{
            ...LABEL,
            position: "absolute",
            right: BADGE_RIGHT,
            top: 0,
            maxWidth: `calc(100% - ${BADGE_RIGHT}px)`,
            overflow: "hidden",
            boxSizing: "border-box",
            padding: "1px 3px",
            borderRadius: 3,
            border: `1px solid ${tint}35`,
            background: `${tint}0a`,
            color: `${tint}cc`,
         }}
      >
         1 SELECTED
      </motion.span>
   </div>
);

const Chevron = ({ color }: { color: string }) => (
   <span
      style={{
         position: "absolute",
         inset: 0,
         borderRight: `1px solid ${color}`,
         borderBottom: `1px solid ${color}`,
         transform: "rotate(45deg)",
      }}
   />
);

/* Column headers; the sort chevron flips and turns tint while rows swap. */
const HeaderRow = ({ tint }: PanelProps) => (
   <div
      style={{
         display: "flex",
         alignItems: "center",
         gap: 4,
         height: 6,
         paddingLeft: LEAD,
      }}
   >
      <span
         style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            width: NAME_COLUMN,
            minWidth: 0,
         }}
      >
         <span style={{ ...LABEL, color: WHITE_35 }}>NAME</span>
         <motion.span
            animate={{ rotate: [0, 0, 180, 180, 0] }}
            transition={loop(CYCLE, [0, T_SORT, T_SORTED, T_GONE, 1])}
            style={{
               position: "relative",
               display: "block",
               width: 3,
               height: 3,
               marginTop: -2,
               flexShrink: 0,
            }}
         >
            <Chevron color={WHITE_60} />
            <motion.span
               animate={{ opacity: [0, 0, 1, 1, 0] }}
               transition={loop(CYCLE, [0, T_SORT, T_SORTED, T_FADE, 1])}
               style={{ position: "absolute", inset: 0 }}
            >
               <Chevron color={tint} />
            </motion.span>
         </motion.span>
      </span>
      <span style={{ ...LABEL, color: WHITE_35 }}>STATUS</span>
      <span style={bar(14, WHITE_18)} />
      <span style={bar(20, WHITE_18)} />
   </div>
);

const ContactRow = ({ tint, spec }: { tint: string; spec: RowSpec }) => {
   const status = statusStyles(tint)[spec.status];
   return (
      <motion.div
         animate={{ opacity: spec.opacity, y: spec.y }}
         transition={loop(CYCLE, spec.times)}
         style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: ROW_HEIGHT,
            borderBottom: `1px solid ${WHITE_06}`,
         }}
      >
         {spec.selected && (
            <motion.span
               animate={{ opacity: [0, 0, 1, 1, 0] }}
               transition={loop(CYCLE, SELECT_TIMES)}
               style={{
                  position: "absolute",
                  inset: "0 -2px",
                  borderRadius: 3,
                  background: `${tint}0c`,
               }}
            />
         )}
         <span
            style={{
               position: "relative",
               display: "block",
               width: 5,
               height: 5,
               borderRadius: 1,
               border: `1px solid ${WHITE_22}`,
               boxSizing: "border-box",
               flexShrink: 0,
            }}
         >
            {spec.selected && (
               <motion.span
                  animate={{ scale: [0, 0, 1, 1, 0] }}
                  transition={loop(CYCLE, SELECT_TIMES)}
                  style={{ position: "absolute", inset: 0, background: tint }}
               />
            )}
         </span>
         <span style={avatar(tint)} />
         <span
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 2,
               width: NAME_COLUMN,
               minWidth: 0,
            }}
         >
            <span style={bar("100%", WHITE_28)} />
            <span style={bar("70%", WHITE_12, 2)} />
         </span>
         <span
            style={{
               position: "relative",
               display: "block",
               width: 16,
               height: 5,
               borderRadius: 9999,
               background: status.bg,
               flexShrink: 0,
            }}
         >
            {status.dot && (
               <span
                  style={{
                     position: "absolute",
                     left: 3,
                     top: 1,
                     width: 3,
                     height: 3,
                     borderRadius: "50%",
                     background: status.dot,
                  }}
               />
            )}
         </span>
         <span style={bar(10, WHITE_14)} />
         <span
            style={{
               display: "block",
               width: 4,
               height: 4,
               borderRadius: 1,
               border: `1px solid ${WHITE_22}`,
               flexShrink: 0,
            }}
         />
         <span style={{ ...bar("100%", WHITE_10), flex: 1, maxWidth: 14 }} />
      </motion.div>
   );
};

const ContactsPanel = ({ tint }: PanelProps) => (
   <div
      style={{ ...PANEL, display: "flex", flexDirection: "column", gap: GAP }}
   >
      <Toolbar tint={tint} />
      <HeaderRow tint={tint} />
      {ROWS.map((spec) => (
         <ContactRow key={spec.id} tint={tint} spec={spec} />
      ))}
   </div>
);

export default ContactsPanel;
