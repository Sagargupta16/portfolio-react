import { motion } from "motion/react";
import {
   EASE,
   FILL,
   GREEN,
   LINEAR,
   W10,
   W18,
   W30,
   W50,
   cubicD,
   hair,
   loop,
   pin,
   px,
   sCurve,
   straight,
   windowKeys,
   windowTimes,
   type Leg,
} from "./kit";
import {
   Bar,
   Dot,
   Label,
   Packet,
   Panel,
   Pop,
   SceneRoot,
   Wires,
} from "./primitives";

/*
 * Awesome MCP Servers: the "Suggest a server" form becomes one
 * `| [Name](URL) | Description | Language |` row that slides into the
 * required checks. A rule head runs down the gate and
 * Validate format, the licence check and the new-link check go green in
 * turn, then the row auto merges into README.md: the rows below make room
 * and the new entry lands with a green dot.
 *
 * Animated nodes (8): submitted row, gate head, three checks, exit packet,
 * rows making room, new row.
 */

const CYCLE = 5.6;
const HOLD = 0.86;
const LANE_Y = 46;

/* Required checks, middle. */
const GATE = { x: 40, y: 11, w: 48, h: 70 };
const GATE_RIGHT = GATE.x + GATE.w;
const CHECK_X = GATE.x + 5;
const CHECK_RING = 7;
const SWEEP = { top: 17, bottom: 75, from: 0.26, to: 0.48 };
const crossing = (y: number) =>
   SWEEP.from +
   ((SWEEP.to - SWEEP.from) * (y - SWEEP.top)) / (SWEEP.bottom - SWEEP.top);
const CHECKS = [
   { y: 27, text: "FORMAT" },
   { y: LANE_Y, text: "LICENCE" },
   { y: 65, text: "LINKS" },
];
const SCAN_SPAN = `${SWEEP.bottom - SWEEP.top}%`;
const SCAN_TIMES = [
   0,
   SWEEP.from - 0.03,
   SWEEP.from,
   SWEEP.to,
   SWEEP.to + 0.04,
   1,
];
const SCAN_EASE = [EASE, EASE, LINEAR, EASE, EASE];

/* README.md table, right. */
const README = { x: 98, y: 9, w: 49, h: 76 };
const README_HEADER_Y = 19;
const ROW_DOT_X = 103;
const ROW_PITCH = 8;
const SLOT_Y = 42;
const ABOVE = [
   { y: 26, name: 12, desc: 20 },
   { y: 34, name: 9, desc: 22 },
];
const BELOW = [
   { y: 42, name: 11, desc: 18 },
   { y: 50, name: 13, desc: 21 },
   { y: 58, name: 10, desc: 16 },
   { y: 66, name: 12, desc: 20 },
   { y: 74, name: 9, desc: 17 },
];

/* Issue form, left: the row starts on its middle field. */
const FORM = { x: 13, y: 26, w: 21, h: 40 };
const FORM_X = FORM.x + 3;

const ROW_LEG: Leg = {
   curve: straight({ x: FORM_X, y: LANE_Y }, { x: GATE.x - 2, y: LANE_Y }),
   from: 0.04,
   to: 0.24,
};
const EXIT_LEG: Leg = {
   curve: sCurve({ x: GATE_RIGHT, y: LANE_Y }, { x: README.x, y: SLOT_Y }),
   from: SWEEP.to + 0.02,
   to: SWEEP.to + 0.12,
};
const ROOM_AT = EXIT_LEG.to - 0.02;
const LAND_AT = EXIT_LEG.to + 0.02;

interface RowSpec {
   y: number;
   name: number;
   desc: number;
}

const TableRow = ({
   tint,
   row,
   dot = W30,
}: {
   tint: string;
   row: RowSpec;
   dot?: string;
}) => (
   <>
      <Dot x={ROW_DOT_X} y={row.y} color={dot} size={4} />
      <Bar x={ROW_DOT_X + 4} y={row.y} w={row.name} color={`${tint}77`} />
      <Bar x={ROW_DOT_X + 19} y={row.y} w={row.desc} color={W18} />
   </>
);

/* The submitted row as it travels: name, description, language cells. It
   rides left anchored and slides under the opaque gate. */
const SubmittedRow = ({ tint }: { tint: string }) => (
   <span
      style={{
         position: "absolute",
         marginTop: -6,
         height: 12,
         padding: "0 4px",
         display: "flex",
         alignItems: "center",
         gap: 3,
         borderRadius: 4,
         border: `1px solid ${tint}77`,
         background: `${tint}18`,
      }}
   >
      <span
         style={{ width: 11, height: 3, borderRadius: 1.5, background: tint }}
      />
      <span
         style={{ width: 14, height: 3, borderRadius: 1.5, background: W30 }}
      />
      <span
         style={{
            width: 7,
            height: 6,
            borderRadius: 3,
            border: `1px solid ${W30}`,
         }}
      />
   </span>
);

const IssueForm = ({ tint }: { tint: string }) => (
   <>
      <Panel x={FORM.x} y={FORM.y} w={FORM.w} h={FORM.h} />
      <Bar x={FORM_X} y={32} w={9} color={`${tint}77`} />
      <Bar x={FORM_X} y={39} w={14} color={W18} />
      <Bar x={FORM_X} y={LANE_Y} w={14} color={W10} />
      <Bar x={FORM_X} y={53} w={11} color={W18} />
      <Bar x={FORM_X} y={60} w={6} color={`${tint}55`} />
   </>
);

const Gate = ({ tint }: { tint: string }) => (
   <>
      <Panel
         x={GATE.x}
         y={GATE.y}
         w={GATE.w}
         h={GATE.h}
         edge={`${tint}40`}
         solid
      />
      {CHECKS.map((c) => (
         <span key={c.y}>
            <Dot x={CHECK_X} y={c.y} color={W30} size={CHECK_RING} ring />
            <Label x={CHECK_X + 5} y={c.y} text={c.text} color={W50} />
         </span>
      ))}
      <motion.div
         initial={{ opacity: 0 }}
         animate={{
            y: ["0%", "0%", "0%", SCAN_SPAN, SCAN_SPAN, "0%"],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={{
            duration: CYCLE,
            repeat: Infinity,
            times: SCAN_TIMES,
            ease: SCAN_EASE,
         }}
         style={FILL}
      >
         <span
            style={{
               ...pin(GATE.x + 1, SWEEP.top),
               width: px(GATE.w - 2),
               height: 1.5,
               marginTop: -0.75,
               background: `${tint}aa`,
            }}
         />
      </motion.div>
      {CHECKS.map((c) => (
         <Pop
            key={c.y}
            x={CHECK_X}
            y={c.y}
            cycle={CYCLE}
            on={crossing(c.y)}
            off={HOLD}
            size={CHECK_RING}
            style={{ borderRadius: "50%", background: GREEN }}
         />
      ))}
   </>
);

const Readme = ({ tint }: { tint: string }) => (
   <>
      <Panel x={README.x} y={README.y} w={README.w} h={README.h} />
      <Label
         x={ROW_DOT_X - 1}
         y={14}
         text="README.MD"
         color={`${tint}e6`}
         size={8}
      />
      <Wires>
         <path
            d={`M ${README.x} ${README_HEADER_Y} H ${README.x + README.w}`}
            {...hair(W10)}
         />
      </Wires>
      {ABOVE.map((row) => (
         <TableRow key={row.y} tint={tint} row={row} />
      ))}
      <motion.div
         animate={{ y: windowKeys("0%", `${ROW_PITCH}%`) }}
         transition={loop(CYCLE, windowTimes(ROOM_AT, HOLD))}
         style={FILL}
      >
         {BELOW.map((row) => (
            <TableRow key={row.y} tint={tint} row={row} />
         ))}
      </motion.div>
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: windowKeys(0, 1), x: windowKeys("-2%", "0%") }}
         transition={loop(CYCLE, windowTimes(LAND_AT, HOLD))}
         style={FILL}
      >
         <TableRow
            tint={tint}
            row={{ y: SLOT_Y, name: 13, desc: 19 }}
            dot={GREEN}
         />
      </motion.div>
   </>
);

const ListVariant = ({ tint }: { tint: string }) => (
   <SceneRoot tint={tint} focus="40% 46%" lattice="grid">
      <Wires>
         <path
            d={`M ${FORM.x + FORM.w} ${LANE_Y} H ${GATE.x}`}
            {...hair(W10)}
         />
         <path d={cubicD(EXIT_LEG.curve)} {...hair(W10)} />
      </Wires>
      <IssueForm tint={tint} />
      <Packet tint={tint} legs={[ROW_LEG]} cycle={CYCLE}>
         <SubmittedRow tint={tint} />
      </Packet>
      <Gate tint={tint} />
      <Readme tint={tint} />
      <Packet tint={tint} legs={[EXIT_LEG]} cycle={CYCLE} />
   </SceneRoot>
);

export default ListVariant;
