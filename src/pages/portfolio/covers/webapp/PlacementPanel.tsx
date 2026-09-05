import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { AMBER, GREEN } from "@/constants/theme";
import {
   LABEL,
   PANEL,
   WHITE_08,
   WHITE_10,
   WHITE_12,
   WHITE_14,
   WHITE_18,
   WHITE_35,
   avatar,
   bar,
   loop,
   type PanelProps,
} from "./shared";

/* Placemento: a coordinator assigns a student to a company. A tint dot travels
   from the COMPANIES card to a STUDENTS row, the row's Placed pill flips to
   green, the PLACED track grows and the company status goes amber -> green. */

const CYCLE = 5.2;
const STUDENTS_WIDTH = "50%";
const CARD_LEFT = "70%";
const ROW_TOPS = [16, 27, 38];
const PLACED_ROW = 1;
const ROW_CENTRE = ROW_TOPS[PLACED_ROW] + 4;

/* Beat boundaries as fractions of the cycle. */
const T_ASSIGN = 0.154;
const T_ARRIVE = 0.385;
const T_FLIP = 0.44;
const T_STATS = 0.5;
const T_STATS_DONE = 0.692;
const T_RESET = 0.885;

const LABEL_DIM: CSSProperties = { ...LABEL, color: WHITE_35 };

const DIM_PILL: CSSProperties = {
   position: "absolute",
   inset: 0,
   borderRadius: 3,
   background: WHITE_10,
};

/* Placed badge: dim "No" pill fades out as the green "Yes" pill pops in. */
const PlacedPill = () => (
   <>
      <motion.span
         animate={{ opacity: [1, 1, 0, 0, 1] }}
         transition={loop(CYCLE, [0, T_ARRIVE, T_FLIP, T_RESET, 1])}
         style={DIM_PILL}
      />
      <motion.span
         animate={{
            opacity: [0, 0, 0.85, 0.85, 0],
            scale: [0.6, 0.6, 1, 1, 0.6],
         }}
         transition={loop(CYCLE, [0, T_ARRIVE, 0.46, T_RESET, 1])}
         style={{ ...DIM_PILL, background: GREEN }}
      />
   </>
);

const StudentRow = ({
   tint,
   top,
   pill,
   highlight,
}: {
   tint: string;
   top: number;
   pill: ReactNode;
   highlight?: boolean;
}) => (
   <div
      style={{
         position: "absolute",
         left: 0,
         width: STUDENTS_WIDTH,
         top,
         height: 8,
         display: "flex",
         alignItems: "center",
         gap: 3,
      }}
   >
      {highlight && (
         <motion.span
            animate={{ opacity: [0, 0, 1, 0, 0] }}
            transition={loop(CYCLE, [0, T_ARRIVE, T_FLIP, T_STATS, 1])}
            style={{
               position: "absolute",
               inset: "-2px -3px",
               borderRadius: 3,
               background: `${tint}18`,
            }}
         />
      )}
      <span style={avatar(tint, 6)} />
      <span style={{ ...bar("34%", WHITE_18), minWidth: 0 }} />
      <span style={{ ...bar("18%", WHITE_12), minWidth: 0 }} />
      <span
         style={{
            position: "relative",
            marginLeft: "auto",
            width: 16,
            height: 6,
            flexShrink: 0,
         }}
      >
         {pill}
      </span>
   </div>
);

const StudentsTable = ({ tint }: PanelProps) => (
   <>
      <span style={{ ...LABEL_DIM, position: "absolute", left: 0, top: 0 }}>
         STUDENTS
      </span>
      <div
         style={{
            position: "absolute",
            left: 0,
            width: STUDENTS_WIDTH,
            top: 9,
            display: "flex",
            gap: 3,
            paddingBottom: 2,
            borderBottom: `1px solid ${WHITE_08}`,
         }}
      >
         <span style={bar("30%", `${tint}70`)} />
         <span style={bar("20%", `${tint}70`)} />
         <span style={bar("16%", `${tint}70`)} />
      </div>
      {ROW_TOPS.map((top, i) => (
         <StudentRow
            key={top}
            tint={tint}
            top={top}
            highlight={i === PLACED_ROW}
            pill={i === PLACED_ROW ? <PlacedPill /> : <span style={DIM_PILL} />}
         />
      ))}
   </>
);

/* Company status dot: upcoming (amber) crossfades to completed (green). */
const StatusDot = ({
   color,
   opacity,
}: {
   color: string;
   opacity: number[];
}) => (
   <motion.span
      animate={{ opacity }}
      transition={loop(CYCLE, [0, T_STATS, 0.6, T_RESET, 1])}
      style={{
         position: "absolute",
         inset: 0,
         borderRadius: "50%",
         background: color,
      }}
   />
);

const CompanyCard = ({ tint }: PanelProps) => (
   <>
      <span
         style={{ ...LABEL_DIM, position: "absolute", left: CARD_LEFT, top: 0 }}
      >
         COMPANIES
      </span>
      <div
         style={{
            position: "absolute",
            left: CARD_LEFT,
            right: 0,
            top: 10,
            height: 34,
            borderRadius: 5,
            border: `1px solid ${tint}40`,
            background: `${tint}0a`,
            padding: 5,
         }}
      >
         <motion.span
            animate={{ opacity: [0.4, 1, 0.4, 0.4] }}
            transition={loop(CYCLE, [0, 0.08, T_ASSIGN, 1])}
            style={{
               position: "absolute",
               inset: -1,
               borderRadius: 5,
               border: `1px solid ${tint}`,
            }}
         />
         <span style={bar("60%", `${tint}80`)} />
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 3,
               marginTop: 5,
            }}
         >
            <span style={LABEL_DIM}>CTC</span>
            <span style={bar("40%", WHITE_14)} />
         </div>
         <span
            style={{
               position: "absolute",
               left: 5,
               bottom: 5,
               width: 3,
               height: 3,
            }}
         >
            <StatusDot color={AMBER} opacity={[1, 1, 0, 0, 1]} />
            <StatusDot color={GREEN} opacity={[0, 0, 1, 1, 0]} />
         </span>
      </div>
   </>
);

/* Dashed hairline from the card to the placed row, with the assignment dot
   riding a lane whose width scales with the slot. */
const AssignLane = ({ tint }: PanelProps) => (
   <>
      <span
         style={{
            position: "absolute",
            left: STUDENTS_WIDTH,
            width: "20%",
            top: ROW_CENTRE,
            borderTop: `1px dashed ${WHITE_14}`,
         }}
      />
      <motion.span
         animate={{
            x: ["0%", "0%", "-100%", "-100%", "0%"],
            opacity: [0, 1, 1, 0, 0],
         }}
         transition={loop(CYCLE, [0, T_ASSIGN, T_ARRIVE, 0.42, 1])}
         style={{
            position: "absolute",
            left: STUDENTS_WIDTH,
            width: "20%",
            top: ROW_CENTRE - 2,
            height: 4,
         }}
      >
         <span
            style={{
               position: "absolute",
               right: 0,
               top: 0,
               width: 4,
               height: 4,
               borderRadius: "50%",
               background: tint,
            }}
         />
      </motion.span>
   </>
);

const PlacedTrack = ({ tint }: PanelProps) => (
   <div
      style={{
         position: "absolute",
         left: 0,
         right: 0,
         top: 52,
         display: "flex",
         alignItems: "center",
         gap: 5,
      }}
   >
      <span style={LABEL_DIM}>PLACED</span>
      <span
         style={{
            flex: 1,
            height: 2,
            borderRadius: 1,
            background: WHITE_08,
            overflow: "hidden",
         }}
      >
         <motion.span
            animate={{ scaleX: [0.58, 0.58, 0.66, 0.66, 0.58] }}
            transition={loop(CYCLE, [0, T_STATS, T_STATS_DONE, T_RESET, 1])}
            style={{
               display: "block",
               height: "100%",
               background: tint,
               transformOrigin: "left",
            }}
         />
      </span>
   </div>
);

const PlacementPanel = ({ tint }: PanelProps) => (
   <div style={PANEL}>
      <StudentsTable tint={tint} />
      <CompanyCard tint={tint} />
      <AssignLane tint={tint} />
      <PlacedTrack tint={tint} />
   </div>
);

export default PlacementPanel;
