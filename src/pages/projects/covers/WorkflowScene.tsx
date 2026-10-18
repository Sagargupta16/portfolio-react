import { Fragment } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Pip, Shell, Wire } from "./kit/primitives";
import {
   DOTS,
   GREEN,
   INK,
   NON_SCALING,
   W06,
   W10,
   W16,
   W25,
   W55,
   clock,
   loopProps,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Box, Keys, Loop, Pt, Route } from "./kit/sceneTokens";

/*
 * Shared Workflows: fan-in reuse. Three consumer repos each carry a one-line
 * `uses:` call in their ci.yml; every call lands on the same port of one
 * central library of reusable workflows. The called workflow runs (its row
 * fills: node-ci, then security-scan with Trivy, then terraform-ci with
 * Checkov) and a green check rides back to the caller that asked for it.
 * The calls overlap, so the library serves one repo while the next is
 * already on its way in. One 6 s loop, 12 animated nodes.
 */

const beat = clock(6);
const HOLD = 0.9;
const GONE = 0.94;

const CARD_X = 26;
const CARD_W = 86;
const CARD_H = 34;
const USES_DY = 20;
const LIB: Box = [190, 18, 104, 150];
const PORT: Pt = [190, 86];
const ROW_TOP = 47;
const ROW_STEP = 15;
const ROW_FILL_X = 194;
const ROW_FILL_W = 96;

const rowY = (i: number) => ROW_TOP + i * ROW_STEP;

/* the README table, in order: [label or bar width] */
const ROWS: (string | number)[] = [
   "NODE CI",
   46,
   58,
   64,
   "TRIVY",
   "CHECKOV",
   40,
];

interface Call {
   top: number;
   row: number;
   path: Route;
   out: Loop;
   back: Loop;
   fill: Loop;
   check: Loop;
}

/* one consumer repo calling one workflow, starting at t0 */
const call = (top: number, row: number, t0: number): Call => {
   const path = route(sCurve([CARD_X + CARD_W, top + USES_DY], PORT));
   const arrive = t0 + 0.1;
   const runEnd = arrive + 0.13;
   const leave = runEnd + 0.01;
   const home = leave + 0.09;
   const fill: Keys = {
      times: [0, arrive + 0.01, arrive + 0.02, runEnd, HOLD, GONE, 1],
      opacity: [0, 0, 1, 1, 1, 0, 0],
      scaleX: [0, 0, 0.05, 1, 1, 1, 0],
   };
   const check: Keys = {
      times: [0, home, home + 0.03, HOLD, GONE, 1],
      opacity: [0, 0, 1, 1, 0, 0],
      scale: [0.4, 0.4, 1, 1, 1, 0.4],
   };
   return {
      top,
      row,
      path,
      out: beat(
         ride(path, [
            [t0, 0],
            [arrive, 1],
         ]),
      ),
      back: beat(
         ride(path, [
            [leave, 1],
            [home, 0],
         ]),
      ),
      fill: beat(fill),
      check: beat(check),
   };
};

const CALLS: Call[] = [
   call(18, 0, 0.04),
   call(66, 4, 0.24),
   call(114, 5, 0.44),
];

/* a consumer repo's ci.yml: repo header, job lines, the one uses: line */
const Caller = ({
   tint,
   top,
   first,
}: Readonly<{ tint: string; top: number; first: boolean }>) => {
   const usesY = top + USES_DY - 2;
   return (
      <>
         <Panel box={[CARD_X, top, CARD_W, CARD_H]} rx={6} />
         <circle cx={33} cy={top + 8} r={2} fill={W25} />
         <Bar box={[39, top + 6, 38, 4]} fill={W16} />
         {!first && <Bar box={[34, usesY, 18, 4]} fill={`${tint}80`} />}
         <Bar box={[58, usesY, 32, 4]} fill={`${tint}55`} />
         <Bar box={[34, top + 27, 44, 3]} fill={W06} />
      </>
   );
};

/* the shared library: one panel, seven reusable workflow files */
const Library = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={LIB} rx={8} />
      <rect x={198} y={26} width={8} height={8} rx={2} fill={`${tint}55`} />
      <Bar box={[212, 28, 52, 4]} fill={W25} />
      <Wire d="M190,40 H294" />
      {CALLS.map(({ row, fill }) => (
         <motion.g key={row} style={{ originX: 0 }} {...loopProps(fill)}>
            <rect
               x={ROW_FILL_X}
               y={rowY(row) - 3.5}
               width={ROW_FILL_W}
               height={13}
               rx={3}
               fill={`${tint}24`}
            />
         </motion.g>
      ))}
      {ROWS.map((name, i) => {
         const y = rowY(i);
         return (
            <g key={y}>
               <Panel box={[198, y, 6, 6]} rx={1.5} stroke={W25} />
               {typeof name === "number" && (
                  <Bar box={[210, y + 1, name, 4]} fill={W10} />
               )}
            </g>
         );
      })}
   </>
);

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      {CALLS.map(({ top, path }) => (
         <Wire key={top} d={path.d} />
      ))}
      {CALLS.map(({ top }, i) => (
         <Caller key={top} tint={tint} top={top} first={i === 0} />
      ))}
      <Library tint={tint} />
      <circle
         cx={PORT[0]}
         cy={PORT[1]}
         r={3}
         fill={INK}
         stroke={`${tint}80`}
         vectorEffect={NON_SCALING}
      />
   </>
);

const WorkflowScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="76% 50%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      {CALLS.map(({ top, out, back, check }) => (
         <Fragment key={top}>
            <Packet color={tint} loop={out} />
            <Packet color={GREEN} size={4} loop={back} />
            <Pip at={[104, top + 8]} color={W16} />
            <Pip at={[104, top + 8]} color={GREEN} loop={check} />
         </Fragment>
      ))}
      <Label at={[34, CALLS[0].top + USES_DY]} color={`${tint}cc`}>
         USES
      </Label>
      {ROWS.map((name, i) =>
         typeof name === "string" ? (
            <Label key={name} at={[210, rowY(i) + 3]} color={W55}>
               {name}
            </Label>
         ) : null,
      )}
   </Shell>
);

export default WorkflowScene;
