import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { MONO_FONT, GREEN } from "@/constants/theme";

interface AgentChatAnimProps {
   color: string;
}

/* MCP tools/call over stdio: a request packet leaves the client chip, crosses
   the wire into the server panel, one row of the tool registry lights up and a
   structured result slides back. Two calls per loop hit two different rows, so
   it reads as dispatch across a registry rather than one canned reply. */

const CYCLE = 5;
const HALF = CYCLE / 2;
const DIM = 0.25;
const REST_SCALE = 0.6;
const WHITE_15 = "rgba(255,255,255,0.15)";
const WHITE_50 = "rgba(255,255,255,0.5)";

/* Motion runs opacity through WAAPI. A single ease string becomes the effect
   easing over the whole iteration, which warps `times`; a per-segment array
   makes the effect linear and honours `times` on both the WAAPI and JS paths. */
const segmentEase = (times: number[], ease: Easing): Easing[] =>
   times.slice(1).map(() => ease);

/* Registry geometry: four rows inside the server panel, two of them dispatch
   targets. Fractions are of the full CYCLE. */
const ROW_SQUARE_X = 44;
const ROW_BAR_X = 51;
const ROW_BAR_W = 21;
const CALL_ONE = 0.16;
const CALL_TWO = 0.66;
const ROWS: { y: number; start?: number }[] = [
   { y: 20 },
   { y: 32, start: CALL_ONE },
   { y: 44 },
   { y: 56, start: CALL_TWO },
];
const ROW_STEP = ROWS[3].y - ROWS[1].y;

const PANEL_BOX: React.CSSProperties = {
   position: "absolute",
   left: 40,
   top: 12,
   width: 36,
   height: 56,
   borderRadius: 5,
};

const label: React.CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontWeight: 700,
   lineHeight: 1,
   letterSpacing: 0.4,
   whiteSpace: "nowrap",
};

/* One call occupies HALF the cycle; these fractions are of HALF. */
const PACKET = {
   times: [0, 0.02, 0.32, 0.34, 1],
   x: [0, 0, 22, 22, 0],
   opacity: [0, 1, 1, 0, 0],
};
const CALL_LABEL = {
   times: [0, 0.08, 0.5, 0.64, 1],
   opacity: [0, 1, 1, 0, 0],
};
const BORDER = {
   times: [0, 0.32, 0.4, 0.84, 0.96, 1],
   opacity: [0, 0, 1, 1, 0, 0],
};
const RESULT = {
   times: [0, 0.52, 0.6, 0.84, 0.9, 1],
   x: [0, 0, 0, -21, -21, 0],
   scaleX: [0.3, 0.3, 1, 1, 1, 0.3],
   opacity: [0, 0, 1, 1, 0, 0],
};
const CHIP = {
   times: [0, 0.84, 0.88, 0.94, 1],
   opacity: [0.5, 0.5, 1, 1, 0.5],
};

/* Row light-up and the leading-square blink share a start fraction. */
const rowTimes = (start: number) => [
   0,
   start,
   start + 0.04,
   start + 0.26,
   start + 0.32,
   1,
];
const ROW_OPACITY = [DIM, DIM, 1, 1, DIM, DIM];
const ROW_SCALE = [REST_SCALE, REST_SCALE, 1, 1, REST_SCALE, REST_SCALE];

const blinkTimes = (start: number) => [
   start,
   start + 0.01,
   start + 0.03,
   start + 0.05,
   start + 0.07,
   start + 0.09,
   start + 0.26,
   start + 0.3,
];
const BLINK = [0, 1, 0.2, 1, 0.2, 1, 1, 0];
const MARKER = {
   times: [0, ...blinkTimes(CALL_ONE), 0.5, ...blinkTimes(CALL_TWO), 1],
   opacity: [0, ...BLINK, 0, ...BLINK, 0],
   y: [0, ...BLINK.map(() => 0), ROW_STEP, ...BLINK.map(() => ROW_STEP), 0],
};

const ClientChip = ({ color }: AgentChatAnimProps) => (
   <motion.div
      animate={{ opacity: CHIP.opacity }}
      transition={{
         duration: HALF,
         repeat: Infinity,
         times: CHIP.times,
         ease: segmentEase(CHIP.times, "easeOut"),
      }}
      style={{
         position: "absolute",
         left: 4,
         top: 34,
         width: 16,
         height: 12,
         borderRadius: 3,
         border: `1px solid ${color}60`,
         background: `${color}14`,
      }}
   >
      <span
         style={{
            position: "absolute",
            left: 3,
            top: 3,
            width: 8,
            height: 1,
            background: WHITE_50,
         }}
      />
      <span
         style={{
            position: "absolute",
            left: 3,
            top: 6,
            width: 5,
            height: 1,
            background: WHITE_50,
         }}
      />
   </motion.div>
);

const Packet = ({ color }: AgentChatAnimProps) => (
   <motion.span
      animate={{ x: PACKET.x, opacity: PACKET.opacity }}
      transition={{
         duration: HALF,
         repeat: Infinity,
         times: PACKET.times,
         ease: segmentEase(PACKET.times, "easeInOut"),
      }}
      style={{
         position: "absolute",
         left: 17,
         top: 39,
         width: 3,
         height: 3,
         borderRadius: "50%",
         background: color,
      }}
   />
);

const ResultBar = ({ color }: AgentChatAnimProps) => (
   <motion.div
      animate={{ x: RESULT.x, scaleX: RESULT.scaleX, opacity: RESULT.opacity }}
      transition={{
         duration: HALF,
         repeat: Infinity,
         times: RESULT.times,
         ease: segmentEase(RESULT.times, "easeInOut"),
      }}
      style={{
         position: "absolute",
         left: 26,
         top: 38,
         width: 14,
         height: 5,
         borderRadius: 2.5,
         border: `1px solid ${color}50`,
         background: `${color}30`,
         transformOrigin: "100% 50%",
      }}
   >
      <span
         style={{
            position: "absolute",
            left: 2,
            top: 0,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: GREEN,
         }}
      />
   </motion.div>
);

interface ToolRowProps extends AgentChatAnimProps {
   y: number;
   start?: number;
}

const ToolRow = ({ color, y, start }: ToolRowProps) => {
   const bar: React.CSSProperties = {
      position: "absolute",
      left: ROW_BAR_X,
      top: y,
      width: ROW_BAR_W,
      height: 4,
      borderRadius: 2,
      background: color,
      transformOrigin: "0% 50%",
   };
   return (
      <>
         <span
            style={{
               position: "absolute",
               left: ROW_SQUARE_X,
               top: y,
               width: 4,
               height: 4,
               borderRadius: 1,
               background: color,
               opacity: DIM,
            }}
         />
         {start === undefined ? (
            <span
               style={{
                  ...bar,
                  opacity: DIM,
                  transform: `scaleX(${REST_SCALE})`,
               }}
            />
         ) : (
            <motion.span
               animate={{ opacity: ROW_OPACITY, scaleX: ROW_SCALE }}
               transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  times: rowTimes(start),
                  ease: segmentEase(rowTimes(start), "easeOut"),
               }}
               style={bar}
            />
         )}
      </>
   );
};

/* The leading square of whichever row is dispatching: blinks twice, then
   jumps to the other row while invisible. */
const ActiveMarker = ({ color }: AgentChatAnimProps) => (
   <motion.span
      animate={{ opacity: MARKER.opacity, y: MARKER.y }}
      transition={{
         duration: CYCLE,
         repeat: Infinity,
         times: MARKER.times,
         ease: segmentEase(MARKER.times, "linear"),
      }}
      style={{
         position: "absolute",
         left: ROW_SQUARE_X,
         top: ROWS[1].y,
         width: 4,
         height: 4,
         borderRadius: 1,
         background: color,
      }}
   />
);

const ServerPanel = ({ color }: AgentChatAnimProps) => (
   <>
      <div
         style={{
            ...PANEL_BOX,
            border: `1px solid ${color}15`,
            background: `${color}05`,
         }}
      />
      <motion.div
         animate={{ opacity: BORDER.opacity }}
         transition={{
            duration: HALF,
            repeat: Infinity,
            times: BORDER.times,
            ease: segmentEase(BORDER.times, "easeOut"),
         }}
         style={{ ...PANEL_BOX, border: `1px solid ${color}50` }}
      />
      {ROWS.map((row) => (
         <ToolRow key={row.y} color={color} y={row.y} start={row.start} />
      ))}
      <ActiveMarker color={color} />
   </>
);

const AgentChatAnim = ({ color }: AgentChatAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      <ClientChip color={color} />

      {/* stdio wire between client and server */}
      <div
         style={{
            position: "absolute",
            left: 20,
            top: 40,
            width: 20,
            height: 1,
            background: WHITE_15,
         }}
      />

      <ServerPanel color={color} />
      <Packet color={color} />
      <ResultBar color={color} />

      <motion.span
         animate={{ opacity: CALL_LABEL.opacity }}
         transition={{
            duration: HALF,
            repeat: Infinity,
            times: CALL_LABEL.times,
            ease: segmentEase(CALL_LABEL.times, "easeOut"),
         }}
         style={{
            ...label,
            left: 4,
            top: 25,
            fontSize: 5,
            color: `${color}cc`,
         }}
      >
         TOOLS/CALL
      </motion.span>
      <span
         style={{
            ...label,
            left: 20,
            top: 47,
            fontSize: 6,
            color: `${color}90`,
         }}
      >
         STDIO
      </span>
   </div>
);

export default AgentChatAnim;
