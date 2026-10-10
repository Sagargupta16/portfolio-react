import type { CSSProperties } from "react";
import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Wire,
} from "@pages/projects/covers/kit/primitives";
import {
   AMBER,
   DOTS,
   GREEN,
   W06,
   W16,
   W40,
   pctX,
   pctY,
   ride,
   route,
   sCurve,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Frame, Slot } from "./SceneFrame";
import { END, GONE, area, beat, chip, play, pop } from "./sceneParts";

/*
 * Landing zone security controls across an organization, one 6 s loop:
 *   preventative  an SCP sweep crosses every member account and leaves
 *                 each one locked
 *   detective     findings raised in three accounts fly to the central
 *                 audit account and land in its findings list
 *   auto enable   a new member account joins already locked and enrolled
 * The sweep reveals its locks through a moving clip: the clip slides right
 * while its content slides left by the same amount, so the locks stay put.
 * 9 animated nodes, 3 labels.
 */

/* ---------------- account grid ---------------- */

const ORG: Box = [26, 44, 146, 100];
const TILE_W = 28;
const TILE_H = 20;
const COLS = [34, 68, 102, 136];
const ROWS = [56, 84, 112];
/* the last slot stays empty until the new account joins */
const NEW_SLOT: Pt = [136, 112];

const slots = ROWS.flatMap((y) => COLS.map((x): Pt => [x, y]));
const members = slots.filter(
   ([x, y]) => x !== NEW_SLOT[0] || y !== NEW_SLOT[1],
);
const centre = ([x, y]: Pt): Pt => [x + TILE_W / 2, y + TILE_H / 2];

/* the sweep covers the grid plus the gap before the audit account */
const SWEEP: Box = [26, 44, 160, 100];
const SWEEP_TIMES = [0, 0.04, 0.34, END, GONE, 1];
const SWEEP_OUT = beat({
   times: SWEEP_TIMES,
   x: ["-100%", "-100%", "0%", "0%", "0%", "-100%"],
   opacity: [0, 1, 1, 1, 0, 0],
});
const SWEEP_IN = beat({
   times: SWEEP_TIMES,
   x: ["100%", "100%", "0%", "0%", "0%", "100%"],
});
const JOINED = pop(0.76);

/* a tile's box in percent of the sweep window */
const inSweep = ([x, y]: Pt): CSSProperties => ({
   position: "absolute",
   left: `${((x - SWEEP[0]) / SWEEP[2]) * 100}%`,
   top: `${((y - SWEEP[1]) / SWEEP[3]) * 100}%`,
   width: `${(TILE_W / SWEEP[2]) * 100}%`,
   height: `${(TILE_H / SWEEP[3]) * 100}%`,
});

/* the lock sits right of the tile's text bar */
const locked = (tint: string): CSSProperties => ({
   display: "flex",
   alignItems: "center",
   justifyContent: "flex-end",
   paddingRight: "14%",
   borderRadius: 3,
   border: `1px solid ${tint}99`,
   background: `${tint}1f`,
});

const Lock = ({ tint }: Readonly<TintProps>) => (
   <svg width={7} height={8} viewBox="0 0 7 8" aria-hidden="true">
      <path
         d="M1.8 3.6 V2.4 a1.7 1.7 0 0 1 3.4 0 V3.6"
         fill="none"
         stroke={tint}
      />
      <rect x={0.5} y={3.6} width={6} height={4} rx={1} fill={tint} />
   </svg>
);

const Grid = () => (
   <>
      <Panel box={ORG} rx={8} />
      {members.map(([x, y]) => (
         <g key={`${x}-${y}`}>
            <Panel box={[x, y, TILE_W, TILE_H]} rx={3} />
            <Bar box={[x + 5, y + 8.75, 12, 2.5]} fill={W16} />
         </g>
      ))}
      <Slot box={[...NEW_SLOT, TILE_W, TILE_H]} />
   </>
);

const scanLine = (tint: string): CSSProperties => ({
   position: "absolute",
   right: -0.75,
   top: "-4%",
   bottom: "-4%",
   width: 1.5,
   borderRadius: 1,
   background: tint,
});

/* Outer window slides in from the left; the clip inside it keeps the locks
   in place while revealing them, and the scan line rides its right edge. */
const Sweep = ({ tint }: Readonly<TintProps>) => (
   <motion.div style={area(SWEEP)} {...play(SWEEP_OUT)}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
         <motion.div
            style={{ position: "absolute", inset: 0 }}
            {...play(SWEEP_IN)}
         >
            {members.map((slot) => (
               <div
                  key={slot.join("-")}
                  style={{ ...inSweep(slot), ...locked(tint) }}
               >
                  <Lock tint={tint} />
               </div>
            ))}
         </motion.div>
      </div>
      <div style={scanLine(tint)} />
      <motion.span style={{ ...chip(tint, [0, 0]), left: "100%", top: -10 }}>
         SCP
      </motion.span>
   </motion.div>
);

/* ---------------- audit account and findings ---------------- */

const AUDIT: Box = [206, 44, 88, 100];
const PORT_X = AUDIT[0];
const ROW_Y = [92, 108, 124];

/* [source tile, departure]; each finding holds in its account, then flies */
const FINDINGS: [Pt, number][] = [
   [[102, 56], 0.4],
   [[34, 112], 0.5],
   [[136, 84], 0.6],
];
const HOLD = 0.04;
const FLIGHT = 0.08;

const findings = FINDINGS.map(([tile, t], i) => {
   const y = ROW_Y[i];
   const at = t + HOLD + FLIGHT;
   const lane = route(sCurve(centre(tile), [PORT_X, y]));
   return {
      y,
      flight: beat(
         ride(lane, [
            [t, 0],
            [t + HOLD, 0],
            [at, 1],
         ]),
      ),
      landed: beat({
         times: [0, at, at + 0.03, END, GONE, 1],
         x: [-8, -8, 0, 0, 0, -8],
         opacity: [0, 0, 1, 1, 0, 0],
      }),
   };
});

const findingRow = (y: number): CSSProperties => ({
   position: "absolute",
   left: pctX(214),
   top: pctY(y),
   width: pctX(72),
   height: 6,
   marginTop: -3,
   display: "flex",
   alignItems: "center",
   gap: 5,
});

const Audit = () => (
   <>
      <Panel box={AUDIT} rx={8} />
      <Wire d={`M${AUDIT[0]},66 H${AUDIT[0] + AUDIT[2]}`} />
      {ROW_Y.map((y) => (
         <Bar key={y} box={[214, y - 1, 72, 2]} fill={W06} />
      ))}
   </>
);

const Findings = ({ tint }: Readonly<TintProps>) => (
   <>
      <Label at={[214, 56]} color={`${tint}d9`}>
         AUDIT
      </Label>
      <Label at={[214, 77]} color={W40}>
         FINDINGS
      </Label>
      {findings.map(({ y, landed }) => (
         <motion.div key={y} style={findingRow(y)} {...play(landed)}>
            <span
               style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: AMBER,
                  flexShrink: 0,
               }}
            />
            <span
               style={{
                  height: 2.5,
                  flex: 1,
                  borderRadius: 1.25,
                  background: "rgba(255,255,255,0.3)",
               }}
            />
         </motion.div>
      ))}
      {findings.map(({ y, flight }) => (
         <Packet key={y} color={AMBER} loop={flight} />
      ))}
   </>
);

/* the new member account: locked and enrolled from the start */
const enrolled: CSSProperties = {
   position: "absolute",
   top: 3,
   left: 3,
   width: 4,
   height: 4,
   borderRadius: "50%",
   background: GREEN,
};

const Joined = ({ tint }: Readonly<TintProps>) => (
   <motion.div
      style={{ ...area([...NEW_SLOT, TILE_W, TILE_H]), ...locked(tint) }}
      {...play(JOINED)}
   >
      <Lock tint={tint} />
      <span style={enrolled} />
   </motion.div>
);

export default function SecurityControlsScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="46% 48%"
         texture={DOTS}
         stage={
            <>
               <Grid />
               <Audit />
            </>
         }
      >
         <Sweep tint={tint} />
         <Joined tint={tint} />
         <Findings tint={tint} />
      </Frame>
   );
}
