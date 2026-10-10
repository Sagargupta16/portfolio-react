import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import { Backdrop, Packet, Wires, type Hop } from "./StageParts";
import {
   LABEL_ABOVE,
   WHITE_06,
   WHITE_10,
   WHITE_14,
   WHITE_18,
   WHITE_28,
   avatar,
   bar,
   disc,
   hCurve,
   loop,
   span,
   type PanelProps,
} from "./shared";

/* Placemento: a coordinator sets a student's company
   (PUT /users/company/:id). The ongoing company row lights, a packet rides
   to a STUDENTS row, placedAt.companyName fills in, the Placed pill flips
   to green, and a second packet lands on the STATS placement pie, whose
   placed arc grows. Reads left to right: COMPANIES, STUDENTS, STATS. */

const CYCLE = 5.2;

/* Table rows are px; rowCentre(i) is row i's centre from the panel top, so
   span() can pin that row to the wire's percent y. */
const PAD = 7;
const HEAD_H = 5;
const ROW_H = 12;
const ROW_GAP = 4;
const ROWS = ["first", "second", "third", "fourth"];
const rowCentre = (i: number) =>
   1 + PAD + HEAD_H + 5 + i * (ROW_H + ROW_GAP) + ROW_H / 2;

const PICKED_COMPANY = 1;
const PLACED_STUDENT = 2;

const COMPANIES = { left: 8, right: 31, y: 58 };
const STUDENTS = { left: 40, right: 69, y: 42 };
const STATS = { left: 77, right: 92, y: 52 };

const ASSIGN: Hop = {
   from: { x: COMPANIES.right, y: COMPANIES.y },
   to: { x: STUDENTS.left, y: STUDENTS.y },
   depart: 0.14,
   arrive: 0.36,
};
const TALLY: Hop = {
   from: { x: STUDENTS.right, y: STUDENTS.y },
   to: { x: STATS.left, y: STATS.y },
   depart: 0.5,
   arrive: 0.66,
};

const PICK_TIMES = [0, 0.04, 0.12, 0.3, 0.38, 1];
const ROW_TIMES = [0, 0.36, 0.42, 0.86, 0.94, 1];
const FILL_TIMES = [0, 0.38, 0.48, 0.88, 0.96, 1];
const PILL_TIMES = [0, 0.4, 0.48, 0.88, 0.96, 1];
const ARC_TIMES = [0, 0.66, 0.76, 0.9, 0.97, 1];
const ON_OFF = [0, 0, 1, 1, 0, 0];

const LIST: CSSProperties = {
   display: "flex",
   flexDirection: "column",
   gap: ROW_GAP,
};

const ROW: CSSProperties = {
   position: "relative",
   display: "flex",
   alignItems: "center",
   gap: 4,
   height: ROW_H,
};

const PILL_W = 13;

const PILL: CSSProperties = {
   position: "relative",
   display: "block",
   width: PILL_W,
   height: 7,
   borderRadius: 4,
   flexShrink: 0,
};

const HIGHLIGHT: CSSProperties = {
   position: "absolute",
   inset: "-2px -4px",
   borderRadius: 5,
};

/* A text line that shares its row by flex weight. */
const cell = (background: string, grow = 1): CSSProperties => ({
   ...bar(0, background),
   flex: `${grow} 1 0`,
   minWidth: 0,
});

/* Column headers above the rows: one bar per column. */
const Header = ({ lead = 0 }: { lead?: number }) => (
   <div
      style={{
         display: "flex",
         alignItems: "center",
         gap: 4,
         height: HEAD_H,
         marginBottom: 5,
         paddingLeft: lead,
      }}
   >
      <span style={{ ...cell(WHITE_10, 2), height: 3 }} />
      <span style={{ ...cell(WHITE_10), height: 3 }} />
      <span style={{ ...bar(PILL_W, WHITE_10, 3) }} />
   </div>
);

const Table = ({
   box,
   label,
   lead,
   children,
}: {
   box: CSSProperties;
   label: string;
   lead?: number;
   children: ReactNode;
}) => (
   <div style={box}>
      <span style={LABEL_ABOVE}>{label}</span>
      <div style={{ padding: PAD }}>
         <Header lead={lead} />
         <div style={LIST}>{children}</div>
      </div>
   </div>
);

/* Company status: completed, ongoing (tint), upcoming, completed. */
const companyStatus = (tint: string) => [
   WHITE_28,
   `${tint}b3`,
   WHITE_14,
   WHITE_28,
];

const CompaniesTable = ({ tint }: PanelProps) => {
   const status = companyStatus(tint);
   return (
      <Table
         box={span(
            COMPANIES.left,
            COMPANIES.right,
            COMPANIES.y,
            rowCentre(PICKED_COMPANY),
         )}
         label="COMPANIES"
      >
         {ROWS.map((id, i) => (
            <div key={id} style={ROW}>
               {i === PICKED_COMPANY && (
                  <motion.span
                     initial={{ opacity: 0 }}
                     animate={{ opacity: ON_OFF }}
                     transition={loop(CYCLE, PICK_TIMES)}
                     style={{ ...HIGHLIGHT, border: `1px solid ${tint}99` }}
                  />
               )}
               <span style={cell(WHITE_18, 2)} />
               <span style={cell(WHITE_10)} />
               <span style={{ ...PILL, background: status[i] }} />
            </div>
         ))}
      </Table>
   );
};

/* The placed row: placedAt.companyName fills and Placed flips to Yes. */
const PlacedRow = ({ tint }: PanelProps) => (
   <div style={ROW}>
      <motion.span
         initial={{ opacity: 0 }}
         animate={{ opacity: ON_OFF }}
         transition={loop(CYCLE, ROW_TIMES)}
         style={{ ...HIGHLIGHT, background: `${tint}1a` }}
      />
      <span style={avatar(tint, 8)} />
      <span style={cell(WHITE_18, 2)} />
      <span
         style={{
            ...cell(WHITE_06),
            position: "relative",
            overflow: "hidden",
         }}
      >
         <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: ON_OFF }}
            transition={loop(CYCLE, FILL_TIMES)}
            style={{
               position: "absolute",
               inset: 0,
               background: `${tint}a6`,
               transformOrigin: "left",
            }}
         />
      </span>
      <span style={{ ...PILL, background: WHITE_10 }}>
         <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: ON_OFF, scale: [0.6, 0.6, 1, 1, 0.6, 0.6] }}
            transition={loop(CYCLE, PILL_TIMES)}
            style={{
               position: "absolute",
               inset: 0,
               borderRadius: 4,
               background: GREEN,
            }}
         />
      </span>
   </div>
);

const StudentRow = ({ tint, placed }: { tint: string; placed: boolean }) => (
   <div style={ROW}>
      <span style={avatar(tint, 8)} />
      <span style={cell(WHITE_18, 2)} />
      <span style={cell(placed ? `${tint}59` : WHITE_06)} />
      <span style={{ ...PILL, background: placed ? `${GREEN}8c` : WHITE_10 }} />
   </div>
);

const StudentsTable = ({ tint }: PanelProps) => (
   <Table
      box={span(
         STUDENTS.left,
         STUDENTS.right,
         STUDENTS.y,
         rowCentre(PLACED_STUDENT),
      )}
      label="STUDENTS"
      lead={12}
   >
      {ROWS.map((id, i) =>
         i === PLACED_STUDENT ? (
            <PlacedRow key={id} tint={tint} />
         ) : (
            <StudentRow key={id} tint={tint} placed={i === 0} />
         ),
      )}
   </Table>
);

/* Placement Distribution pie as a donut, with its Placed / Unplaced legend.
   The new placement draws on after the placed arc (pathLength in a px
   viewBox, so the dash is exact); the increment is hidden at frame 0. */
const STATS_PAD = 6;
const DONUT = 32;
const RADIUS = 12;
const MID = DONUT / 2;
const PLACED = 0.56;
const GROWTH = 0.1;
const DONUT_CENTRE = 1 + STATS_PAD + MID;

const LegendRow = ({ color }: { color: string }) => (
   <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={disc(5, color)} />
      <span style={cell(WHITE_14)} />
   </span>
);

const StatsPanel = ({ tint }: PanelProps) => (
   <div style={span(STATS.left, STATS.right, STATS.y, DONUT_CENTRE)}>
      <span style={LABEL_ABOVE}>STATS</span>
      <div style={{ padding: STATS_PAD }}>
         <svg
            width={DONUT}
            height={DONUT}
            viewBox={`0 0 ${DONUT} ${DONUT}`}
            style={{ display: "block", margin: "0 auto", overflow: "visible" }}
         >
            <g transform={`rotate(-90 ${MID} ${MID})`}>
               <circle
                  cx={MID}
                  cy={MID}
                  r={RADIUS}
                  fill="none"
                  stroke={WHITE_10}
                  strokeWidth={4}
               />
               <circle
                  cx={MID}
                  cy={MID}
                  r={RADIUS}
                  fill="none"
                  stroke={`${tint}99`}
                  strokeWidth={4}
                  pathLength={1}
                  strokeDasharray={`${PLACED} 1`}
               />
               <motion.circle
                  cx={MID}
                  cy={MID}
                  r={RADIUS}
                  fill="none"
                  stroke={tint}
                  strokeWidth={4}
                  initial={{ pathLength: 0, pathOffset: PLACED, opacity: 0 }}
                  animate={{
                     pathLength: [0, 0, GROWTH, GROWTH, GROWTH, 0],
                     opacity: ON_OFF,
                  }}
                  transition={loop(CYCLE, ARC_TIMES)}
               />
            </g>
         </svg>
         <span
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 4,
               marginTop: 7,
            }}
         >
            <LegendRow color={`${tint}99`} />
            <LegendRow color={WHITE_14} />
         </span>
      </div>
   </div>
);

const PlacementPanel = ({ tint }: PanelProps) => (
   <>
      <Backdrop tint={tint} focus={{ x: 55, y: 42 }} texture="grid" drift />
      <Wires
         paths={[hCurve(ASSIGN.from, ASSIGN.to), hCurve(TALLY.from, TALLY.to)]}
      />
      <CompaniesTable tint={tint} />
      <StudentsTable tint={tint} />
      <StatsPanel tint={tint} />
      <Packet hop={ASSIGN} color={tint} cycle={CYCLE} />
      <Packet hop={TALLY} color={tint} cycle={CYCLE} />
   </>
);

export default PlacementPanel;
