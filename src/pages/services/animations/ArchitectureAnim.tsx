import { motion } from "motion/react";
import { MONO_FONT, GREEN, AMBER } from "@/constants/theme";

interface ArchitectureAnimProps {
   color: string;
}

type ColorProps = ArchitectureAnimProps;
type Ease = "easeInOut" | "linear";

/*
 * Cloud Consulting: landing-zone guardrail sweep.
 *   Workload chips land into accounts under an Organizations OU tree, an SCP
 *   guardrail sweeps the account row, each account lights up compliant as the
 *   rail tip passes, one finding flashes amber and is remediated, then the
 *   governed row holds before the loop resets. The OU skeleton and the two
 *   labels are static; eight Motion nodes move (2 chips, 1 rail, 4 green
 *   overlays, 1 amber flash). Every moving node sits at opacity 0 at both
 *   ends of the loop, so the x/scale/scaleX resets at the wrap never show.
 */

const LOOP = 5.5;
const t = (seconds: number) => seconds / LOOP;

const WHITE_03 = "rgba(255,255,255,0.03)";
const WHITE_10 = "rgba(255,255,255,0.10)";
const WHITE_12 = "rgba(255,255,255,0.12)";

/* OU tree geometry on the 80 x 80 canvas */
const ROOT_CX = 40;
const ROOT_TOP = 10;
const ROOT_SIZE = 8;
const ROOT_BUS_Y = 23;
const OU_X = [24, 56];
const OU_TOP = 28;
const OU_SIZE = 6;
const OU_BUS_Y = 44;
const ACCOUNT_X = [13, 31, 49, 67];
const ACCOUNT_CY = 52;
const ACCOUNT_SIZE = 10;
const ACCOUNT_TOP = ACCOUNT_CY - ACCOUNT_SIZE / 2;

/* SCP guardrail sweeping between the OU row and the account row */
const RAIL_X0 = 6;
const RAIL_W = 68;
const RAIL_Y = 40;
const SWEEP_START = 2.4;
const SWEEP_END = 3.4;
const RAIL_FADE_START = 4;

/* workloads rising from off-canvas bottom-left into account slots */
const CHIP_SIZE = 5;
const CHIP_START_X = -8;
const CHIP_START_Y = 76;
const CHIP_DOCK_SCALE = 0.85;
const CHIP_SETTLE = 0.4;
const CHIPS = [
   { slot: 0, start: 0, dock: 1.6 },
   { slot: 2, start: 0.8, dock: 2.4 },
];

/* Security Hub / Config compliance overlays */
const LIGHT_LAG = 0.1;
const LIGHT_FADE = 0.2;
const FINDING_SLOT = 2;
const FINDING_HOLD = 0.5;
const FADE_OUT_START = 4.8;
const FADE_OUT = LOOP - FADE_OUT_START;

const TRAVEL_EASE: Ease[] = ["linear", "easeInOut", "linear"];

/* Motion runs opacity through WAAPI. A single ease string becomes the effect
   easing over the whole iteration, which warps `times`; a per-segment array
   makes the effect linear and honours `times` on both the WAAPI and JS paths. */
const loop = (times: number[], ease: Ease | Ease[] = "linear") => ({
   duration: LOOP,
   repeat: Infinity,
   times,
   ease: Array.isArray(ease) ? ease : times.slice(1).map(() => ease),
});

/* moment the rail tip crosses the centre of an account (linear sweep) */
const sweepArrival = (slot: number) =>
   SWEEP_START +
   ((SWEEP_END - SWEEP_START) * (ACCOUNT_X[slot] - RAIL_X0)) / RAIL_W;

const findingOn = sweepArrival(FINDING_SLOT) + LIGHT_LAG;

const greenOn = (slot: number) => {
   if (slot === FINDING_SLOT) return findingOn + FINDING_HOLD;
   return sweepArrival(slot) + LIGHT_LAG;
};

/* orthogonal connector: parent stub, horizontal bus, one drop per child */
const branch = (
   parentX: number,
   parentBottom: number,
   busY: number,
   childXs: number[],
   childTop: number,
) =>
   [
      `M${parentX} ${parentBottom} V${busY}`,
      `M${childXs[0]} ${busY} H${childXs.at(-1)}`,
      ...childXs.map((x) => `M${x} ${busY} V${childTop}`),
   ].join(" ");

const TREE_PATH = [
   branch(ROOT_CX, ROOT_TOP + ROOT_SIZE, ROOT_BUS_Y, OU_X, OU_TOP),
   branch(
      OU_X[0],
      OU_TOP + OU_SIZE,
      OU_BUS_Y,
      ACCOUNT_X.slice(0, 2),
      ACCOUNT_TOP,
   ),
   branch(OU_X[1], OU_TOP + OU_SIZE, OU_BUS_Y, ACCOUNT_X.slice(2), ACCOUNT_TOP),
].join(" ");

const COVER: React.CSSProperties = { position: "absolute", inset: 0 };

const SQUARE: React.CSSProperties = {
   position: "absolute",
   boxSizing: "border-box",
   borderRadius: 2,
};

const NEUTRAL: React.CSSProperties = {
   border: `1px solid ${WHITE_12}`,
   background: WHITE_03,
};

const accountBox = (slot: number): React.CSSProperties => ({
   ...SQUARE,
   left: ACCOUNT_X[slot] - ACCOUNT_SIZE / 2,
   top: ACCOUNT_TOP,
   width: ACCOUNT_SIZE,
   height: ACCOUNT_SIZE,
});

const STATUS_DOT: React.CSSProperties = {
   position: "absolute",
   top: -1.5,
   right: -1.5,
   width: 2.5,
   height: 2.5,
   borderRadius: "50%",
};

const MONO: React.CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 5.5,
   fontWeight: 700,
   letterSpacing: 0.5,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

/* static Organizations tree: root, two OUs, four accounts, hairline buses */
const Skeleton = ({ color }: ColorProps) => (
   <>
      <svg width={80} height={80} viewBox="0 0 80 80" style={COVER}>
         <path d={TREE_PATH} stroke={WHITE_10} strokeWidth={1} fill="none" />
      </svg>
      <div
         style={{
            ...SQUARE,
            left: ROOT_CX - ROOT_SIZE / 2,
            top: ROOT_TOP,
            width: ROOT_SIZE,
            height: ROOT_SIZE,
            border: `1px solid ${color}66`,
            background: `${color}14`,
         }}
      />
      {OU_X.map((x) => (
         <div
            key={x}
            style={{
               ...SQUARE,
               ...NEUTRAL,
               left: x - OU_SIZE / 2,
               top: OU_TOP,
               width: OU_SIZE,
               height: OU_SIZE,
            }}
         />
      ))}
      {ACCOUNT_X.map((x, slot) => (
         <div key={x} style={{ ...accountBox(slot), ...NEUTRAL }} />
      ))}
   </>
);

interface ChipProps extends ColorProps {
   slot: number;
   start: number;
   dock: number;
}

/* one workload travelling from off-canvas into its account slot; it spawns
   behind the root clip, so the fade-in runs until the landing settle begins
   and is seen on the canvas rather than finishing off-screen */
const WorkloadChip = ({ color, slot, start, dock }: ChipProps) => {
   const dockX = ACCOUNT_X[slot];
   const dx = CHIP_START_X - dockX;
   const dy = CHIP_START_Y - ACCOUNT_CY;
   const travel = [0, t(start), t(dock), 1];
   return (
      <motion.div
         animate={{
            x: [dx, dx, 0, 0],
            y: [dy, dy, 0, 0],
            scale: [1, 1, 1, CHIP_DOCK_SCALE, CHIP_DOCK_SCALE],
            opacity: [0, 0, 1, 1, 0],
         }}
         transition={{
            x: loop(travel, TRAVEL_EASE),
            y: loop(travel, TRAVEL_EASE),
            scale: loop(
               [0, t(start), t(dock - CHIP_SETTLE), t(dock), 1],
               "easeInOut",
            ),
            opacity: loop([
               0,
               t(start),
               t(dock - CHIP_SETTLE),
               t(FADE_OUT_START),
               1,
            ]),
         }}
         style={{
            position: "absolute",
            left: dockX - CHIP_SIZE / 2,
            top: ACCOUNT_CY - CHIP_SIZE / 2,
            width: CHIP_SIZE,
            height: CHIP_SIZE,
            borderRadius: 1,
            background: `${color}b3`,
         }}
      />
   );
};

/* the SCP rail: grows left to right, holds, fades once the row is governed */
const GuardrailBar = ({ color }: ColorProps) => (
   <motion.div
      animate={{ scaleX: [0, 0, 1, 1], opacity: [0, 0, 1, 1, 0, 0] }}
      transition={{
         scaleX: loop([0, t(SWEEP_START), t(SWEEP_END), 1]),
         opacity: loop([
            0,
            t(SWEEP_START),
            t(SWEEP_START + LIGHT_LAG),
            t(RAIL_FADE_START),
            t(FADE_OUT_START),
            1,
         ]),
      }}
      style={{
         position: "absolute",
         left: RAIL_X0,
         top: RAIL_Y,
         width: RAIL_W,
         height: 1.5,
         borderRadius: 1,
         background: color,
         transformOrigin: "left center",
      }}
   />
);

interface OverlayProps {
   slot: number;
   on: number;
   off: number;
   fadeOut: number;
   border: string;
   dot: string;
}

/* compliance state drawn over an account box, with a corner status dot */
const AccountOverlay = ({
   slot,
   on,
   off,
   fadeOut,
   border,
   dot,
}: OverlayProps) => (
   <motion.div
      animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
      transition={loop([
         0,
         t(on),
         t(on + LIGHT_FADE),
         t(off),
         t(off + fadeOut),
         1,
      ])}
      style={{
         ...accountBox(slot),
         border: `1px solid ${border}`,
         background: `${border}14`,
      }}
   >
      <div style={{ ...STATUS_DOT, background: dot }} />
   </motion.div>
);

const ArchitectureAnim = ({ color }: ArchitectureAnimProps) => (
   <div
      style={{
         width: 80,
         height: 80,
         position: "relative",
         overflow: "hidden",
      }}
   >
      <Skeleton color={color} />
      <span style={{ ...MONO, left: 1, top: 33, color: `${color}cc` }}>
         SCP
      </span>
      <span
         style={{
            ...MONO,
            left: 0,
            top: 67,
            width: 80,
            textAlign: "center",
            color: `${color}99`,
         }}
      >
         SEC HUB
      </span>
      <GuardrailBar color={color} />
      {ACCOUNT_X.map((x, slot) => (
         <AccountOverlay
            key={x}
            slot={slot}
            on={greenOn(slot)}
            off={FADE_OUT_START}
            fadeOut={FADE_OUT}
            border={color}
            dot={GREEN}
         />
      ))}
      <AccountOverlay
         slot={FINDING_SLOT}
         on={findingOn}
         off={findingOn + FINDING_HOLD}
         fadeOut={LIGHT_FADE}
         border={AMBER}
         dot={AMBER}
      />
      {CHIPS.map((chip) => (
         <WorkloadChip key={chip.slot} color={color} {...chip} />
      ))}
   </div>
);

export default ArchitectureAnim;
