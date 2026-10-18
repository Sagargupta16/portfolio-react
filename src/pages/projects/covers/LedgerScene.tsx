import type { CSSProperties } from "react";
import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Shell,
   Trace,
   Wire,
} from "./kit/primitives";
import {
   AMBER,
   GRID,
   INK,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   curveD,
   label,
   line,
   loopProps,
   pctX,
   pctY,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Keys, Loop, Pt, Stop, TintProps } from "./kit/sceneTokens";

/*
 * Ledger Sync: a messy Money Manager export (a merged bank title row, a
 * blank row, ragged Period / Accounts / Category / Amount cells) is read in
 * the browser row by row. Each parsed row rides through the SHA-256
 * transaction ID check into the ledger as a categorised transaction; the
 * last row repeats the one before it, so the check flashes amber and the
 * duplicate never lands. Once the ledger is saved, the analytics refresh
 * runs and the Cash Flow Sankey draws: income splits into savings, tax and
 * expenses, and expenses split into categories.
 * One 6 s loop, 12 animated nodes, all of it fading out together.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

const TOP = 22;
const PANEL_H = 106;
const HEAD_Y = 38;

/* ---------------- spreadsheet ---------------- */

const SHEET_X = 26;
const SHEET_W = 62;
const SHEET_RIGHT = SHEET_X + SHEET_W;
const LETTERS_Y = 46;
const ROW_H = 10;
const COL_X = [32, 46, 60, 74];

const rowTop = (i: number) => LETTERS_Y + i * ROW_H;
const rowMid = (i: number) => rowTop(i) + ROW_H / 2;

/* cell bar widths per Period / Accounts / Category / Amount; 0 is empty.
   Row 0 is the merged bank title, row 1 is nearly blank, and row 6 repeats
   row 5 cell for cell. */
const DUP_CELLS = [10, 9, 7, 6];
const CELLS: number[][] = [
   [0, 0, 0, 0],
   [0, 0, 6, 0],
   [10, 8, 9, 7],
   [9, 13, 6, 8],
   [10, 6, 0, 9],
   DUP_CELLS,
   DUP_CELLS,
];

const FIRST_ROW = 2;
const SAVED_A = 2;
const SAVED_B = 5;
const DUP_ROW = 6;

/* ---------------- ledger ---------------- */

const LEDGER_X = 130;
const LEDGER_W = 68;
const LEDGER_RIGHT = LEDGER_X + LEDGER_W;
const LEDGER_ROWS = [46, 60, 74, 88];
const SLOT_A = 102;
const SLOT_B = 116;

/* [note width, amount width, category dot alpha] */
type Txn = readonly [number, number, string];
const TXNS: Txn[] = [
   [26, 10, "cc"],
   [20, 14, "66"],
   [30, 8, "99"],
   [22, 12, "66"],
];
const NEW_A: Txn = [24, 11, "cc"];
const NEW_B: Txn = [28, 9, "99"];

/* ---------------- dedup gate ---------------- */

const GATE: Pt = [(SHEET_RIGHT + LEDGER_X) / 2, 90];

const saveRoute = (row: number, slot: number) =>
   route(
      sCurve([SHEET_RIGHT, rowMid(row)], GATE),
      sCurve(GATE, [LEDGER_X, slot]),
   );

const ROUTE_A = saveRoute(SAVED_A, SLOT_A);
const ROUTE_B = saveRoute(SAVED_B, SLOT_B);
const ROUTE_DUP = route(sCurve([SHEET_RIGHT, rowMid(DUP_ROW)], GATE));
const AT_GATE = ROUTE_A.ends[0];

/* each saved row holds at the gate while its ID is checked */
const STOPS_A: Stop[] = [
   [0.08, 0],
   [0.15, AT_GATE],
   [0.18, AT_GATE],
   [0.25, 1],
];
const STOPS_B: Stop[] = [
   [0.22, 0],
   [0.29, AT_GATE],
   [0.31, AT_GATE],
   [0.38, 1],
];
/* the duplicate reaches the gate and is dropped there */
const STOPS_DUP: Stop[] = [
   [0.38, 0],
   [0.45, 1],
   [0.48, 1],
];

/* ---------------- cash flow sankey ---------------- */

const FLOW_X = 208;
const FLOW_W = 86;
const SRC_X = 216;
const MID_X = 252;
const OUT_X = 282;
const NODE_W = 4;
const REFRESH = route(line([LEDGER_RIGHT, 84], [SRC_X, 84]));

const ribbon = (a: Pt, b: Pt) => curveD(sCurve(a, b));

/* [x, top, height, fill alpha or white] */
type Node = readonly [number, number, number, string];

interface Flow {
   d: string;
   width: number;
}

/* source bands: savings 50..82, tax 82..90, expenses 90..118 */
const SAVINGS: Flow = { d: ribbon([220, 66], [OUT_X, 56]), width: 32 };
const TAX: Flow = { d: ribbon([220, 86], [OUT_X, 82]), width: 8 };
const EXPENSES: Flow = { d: ribbon([220, 104], [MID_X, 106]), width: 28 };
const SPLIT: Flow[] = [
   { d: ribbon([256, 99], [OUT_X, 99]), width: 14 },
   { d: ribbon([256, 113], [OUT_X, 117]), width: 14 },
];
const FLOWS = [SAVINGS, TAX, EXPENSES, ...SPLIT];

/* ---------------- timeline ---------------- */

/* the read cursor stops on each row as it is sent */
const STEP = (row: number) => (row - FIRST_ROW) * ROW_H;
const SCAN = beat({
   times: [0, 0.02, 0.04, 0.08, 0.2, 0.22, 0.36, 0.38, 0.46, 0.49, 1],
   opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
   y: [
      0,
      0,
      0,
      STEP(SAVED_A),
      STEP(SAVED_A),
      STEP(SAVED_B),
      STEP(SAVED_B),
      STEP(DUP_ROW),
      STEP(DUP_ROW),
      STEP(DUP_ROW),
      0,
   ],
});

const PACKET_A = beat(ride(ROUTE_A, STOPS_A));
const PACKET_B = beat(ride(ROUTE_B, STOPS_B));
const PACKET_DUP = beat(ride(ROUTE_DUP, STOPS_DUP));
const PACKET_REFRESH = beat(
   ride(REFRESH, [
      [0.55, 0],
      [0.62, 1],
   ]),
);

const landed = (at: number): Loop =>
   beat({
      times: [0, at, at + 0.03, HOLD, GONE, 1],
      opacity: [0, 0, 1, 1, 0, 0],
      x: [-4, -4, 0, 0, 0, -4],
   });
const LANDED_A = landed(0.25);
const LANDED_B = landed(0.38);

const DUP_FLASH = beat({
   times: [0, 0.45, 0.47, 0.53, 0.56, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});

const draw = (on: number, span: number): Keys => ({
   times: [0, on - 0.01, on, on + span, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   pathLength: [0, 0, 0, 1, 1, 1, 0],
});
const DRAW_SAVINGS = beat(draw(0.62, 0.1));
const DRAW_TAX = beat(draw(0.65, 0.1));
const DRAW_EXPENSES = beat(draw(0.65, 0.08));
const SPLIT_LIT = beat({
   times: [0, 0.73, 0.78, HOLD, GONE, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});

/* ---------------- spreadsheet ---------------- */

const SheetRow = ({ y, cells }: Readonly<{ y: number; cells: number[] }>) => (
   <>
      <Bar box={[SHEET_X + 2, y + 3.5, 2, 3]} fill={W10} />
      {cells.map((w, c) =>
         w > 0 ? (
            <Bar
               key={COL_X[c]}
               box={[COL_X[c] + 2, y + 3.5, w, 3]}
               fill={W16}
            />
         ) : null,
      )}
   </>
);

const Sheet = ({ tint }: TintProps) => (
   <>
      <Panel box={[SHEET_X, TOP, SHEET_W, PANEL_H]} rx={6} />
      <rect x={32} y={27} width={6} height={6} rx={1.5} fill={`${tint}66`} />
      <Wire d={`M${SHEET_X},${HEAD_Y} H${SHEET_RIGHT}`} />
      <Wire d={`M${SHEET_X},${LETTERS_Y} H${SHEET_RIGHT}`} stroke={W06} />
      {COL_X.map((x) => (
         <g key={x}>
            <Wire d={`M${x},${HEAD_Y} V${rowTop(CELLS.length)}`} stroke={W06} />
            <Bar box={[x + 5.5, 40.5, 3, 3]} fill={W10} />
         </g>
      ))}
      {CELLS.map((cells, i) => (
         <Wire
            key={rowTop(i)}
            d={`M${SHEET_X},${rowTop(i + 1)} H${SHEET_RIGHT}`}
            stroke={W06}
         />
      ))}
      <Bar box={[COL_X[0] + 2, rowTop(0) + 3.5, 44, 3]} fill={W25} />
      {CELLS.map((cells, i) => (
         <SheetRow key={rowTop(i)} y={rowTop(i)} cells={cells} />
      ))}
      {/* sheet tabs */}
      <Bar box={[SHEET_X + 4, 120, 16, 4]} fill={`${tint}66`} />
      <Bar box={[SHEET_X + 23, 120, 12, 4]} fill={W10} />
      <motion.g {...loopProps(SCAN)}>
         <rect
            x={COL_X[0]}
            y={rowTop(FIRST_ROW)}
            width={SHEET_RIGHT - COL_X[0] - 1}
            height={ROW_H}
            fill={`${tint}1f`}
            stroke={`${tint}80`}
            strokeWidth={0.6}
         />
      </motion.g>
   </>
);

/* ---------------- ledger ---------------- */

const TxnRow = ({
   tint,
   y,
   txn,
}: Readonly<TintProps & { y: number; txn: Txn }>) => {
   const [note, amount, alpha] = txn;
   return (
      <>
         <circle cx={LEDGER_X + 7} cy={y} r={2} fill={`${tint}${alpha}`} />
         <Bar box={[LEDGER_X + 13, y - 1.5, note, 3]} fill={W16} />
         <Bar
            box={[LEDGER_RIGHT - 6 - amount, y - 1.5, amount, 3]}
            fill={W40}
         />
      </>
   );
};

const Landed = ({
   tint,
   y,
   txn,
   loop,
}: Readonly<TintProps & { y: number; txn: Txn; loop: Loop }>) => (
   <motion.g {...loopProps(loop)}>
      <rect
         x={LEDGER_X + 2}
         y={y - 6}
         width={LEDGER_W - 4}
         height={12}
         rx={3}
         fill={`${tint}14`}
      />
      <TxnRow tint={tint} y={y} txn={txn} />
   </motion.g>
);

const Ledger = ({ tint }: TintProps) => (
   <>
      <Panel box={[LEDGER_X, TOP, LEDGER_W, PANEL_H]} rx={6} />
      <Wire d={`M${LEDGER_X},${HEAD_Y} H${LEDGER_RIGHT}`} />
      {LEDGER_ROWS.map((y, i) => (
         <TxnRow key={y} tint={tint} y={y} txn={TXNS[i]} />
      ))}
      <Landed tint={tint} y={SLOT_A} txn={NEW_A} loop={LANDED_A} />
      <Landed tint={tint} y={SLOT_B} txn={NEW_B} loop={LANDED_B} />
   </>
);

/* ---------------- cash flow ---------------- */

const NODES: Node[] = [
   [SRC_X, 50, 68, "ff"],
   [OUT_X, 40, 32, "b3"],
   [OUT_X, 78, 8, W40],
   [MID_X, 92, 28, W55],
   [OUT_X, 92, 14, W25],
   [OUT_X, 110, 14, W25],
];

const nodeFill = (tint: string, fill: string) =>
   fill.startsWith("rgba") ? fill : `${tint}${fill}`;

const CashFlow = ({ tint }: TintProps) => (
   <>
      <Panel box={[FLOW_X, TOP, FLOW_W, PANEL_H]} rx={6} />
      <Wire d={`M${FLOW_X},${HEAD_Y} H${FLOW_X + FLOW_W}`} />
      {FLOWS.map((f) => (
         <path
            key={f.d}
            d={f.d}
            fill="none"
            stroke={W06}
            strokeWidth={f.width}
         />
      ))}
      <Trace
         d={SAVINGS.d}
         color={`${tint}4d`}
         width={SAVINGS.width}
         loop={DRAW_SAVINGS}
      />
      <Trace d={TAX.d} color={`${tint}26`} width={TAX.width} loop={DRAW_TAX} />
      <Trace
         d={EXPENSES.d}
         color={`${tint}33`}
         width={EXPENSES.width}
         loop={DRAW_EXPENSES}
      />
      <motion.g {...loopProps(SPLIT_LIT)}>
         {SPLIT.map((f) => (
            <path
               key={f.d}
               d={f.d}
               fill="none"
               stroke={`${tint}26`}
               strokeWidth={f.width}
            />
         ))}
      </motion.g>
      {NODES.map(([x, y, h, fill]) => (
         <rect
            key={x * 1000 + y}
            x={x}
            y={y}
            width={NODE_W}
            height={h}
            rx={1}
            fill={nodeFill(tint, fill)}
         />
      ))}
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      {[ROUTE_A, ROUTE_B, ROUTE_DUP, REFRESH].map((r) => (
         <Wire key={r.d} d={r.d} />
      ))}
      <Sheet tint={tint} />
      <Ledger tint={tint} />
      <CashFlow tint={tint} />
   </>
);

/* ---------------- the SHA-256 check chip ---------------- */

const chip = (border: string, color: string): CSSProperties => ({
   ...label,
   left: pctX(GATE[0]),
   top: pctY(GATE[1]),
   transform: "translate(-50%, -50%)",
   padding: "2px 3px",
   borderRadius: 3,
   border: `1px solid ${border}`,
   background: INK,
   color,
});

const HASH = "SHA256";

export default function LedgerScene({ tint }: Readonly<TintProps>) {
   return (
      <Shell
         tint={tint}
         focus="50% 50%"
         texture={GRID}
         stage={<Stage tint={tint} />}
      >
         <Packet color={tint} loop={PACKET_A} />
         <Packet color={tint} loop={PACKET_B} />
         <Packet color={tint} loop={PACKET_DUP} />
         <Packet color={tint} size={4} loop={PACKET_REFRESH} />
         <span style={chip(`${tint}80`, W70)}>{HASH}</span>
         <motion.span style={chip(AMBER, AMBER)} {...loopProps(DUP_FLASH)}>
            {HASH}
         </motion.span>
         <Label at={[42, 30]} color={`${tint}cc`}>
            XLSX
         </Label>
         <Label at={[LEDGER_X + 6, 30]} color={W55}>
            LEDGER
         </Label>
         <Label at={[FLOW_X + 7, 30]} color={W55}>
            CASH FLOW
         </Label>
      </Shell>
   );
}
