import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import {
   W10,
   W25,
   W40,
   W55,
   shown,
} from "@pages/projects/covers/kit/sceneTokens";
import type { Pt } from "@pages/projects/covers/kit/sceneTokens";
import { CANVAS, MICRO_LABEL, box, dot, looping, pop, trip } from "./canvasKit";
import Hairlines from "./Hairlines";

interface AgentToolAnimProps {
   color: string;
}

type ColorProps = Readonly<AgentToolAnimProps>;

/*
 * AI Agents & Developer Tooling: an agent session calls an MCP tool and the
 * change it writes has to clear a hook before it lands.
 *   A tools/call packet leaves the agent (top right) along the stdio wire,
 *   one row of the MCP server's tool registry (top left) lights, and a
 *   structured result with a green ok dot slides back. The agent writes a
 *   diff, the diff drops down its lane to the hook gate, holds while the
 *   gate flashes green, and lands as the new head commit on the rail.
 *   Seven animated nodes, one 5.5 s loop; every moving node rests at
 *   opacity 0 at the loop seam.
 */

const animate = looping(5.5);

/* Canvas anchors */
const SERVER = { left: 4, top: 4, width: 30, height: 30 };
const AGENT = { left: 50, top: 8, width: 26, height: 18 };
const ROW_TOPS = [16, 22, 28];
const ACTIVE_ROW = ROW_TOPS[1];
const ROW_BAR = { left: 13, width: 17, height: 3 };
const WIRE_Y = 17.5;
const AGENT_EDGE: Pt = [AGENT.left, WIRE_Y];
const SERVER_EDGE: Pt = [SERVER.left + SERVER.width, WIRE_Y];
const LANE_X = 63;
const GATE_Y = 50.5;
const RAIL_Y = 66.5;
const DIFF_OUT: Pt = [LANE_X, 39];
const AT_GATE: Pt = [LANE_X, GATE_Y];
const HEAD: Pt = [LANE_X, RAIL_Y];
const OLD_COMMITS = [15, 31, 47];

const HAIRLINES = `M${LANE_X} 39 V${RAIL_Y} M6 ${RAIL_Y} H72`;

const panel = (color: string) => ({
   borderRadius: 3,
   border: `1px solid ${color}55`,
   background: `${color}0c`,
});

/* MCP server: tool registry rows, the row that answers lights up */
const ToolServer = ({ color }: ColorProps) => (
   <div
      style={{
         ...box(SERVER.left, SERVER.top, SERVER.width, SERVER.height),
         ...panel(color),
      }}
   >
      <span style={{ ...MICRO_LABEL, left: 3, top: 2, color: `${color}cc` }}>
         MCP
      </span>
   </div>
);

const ToolRows = ({ color }: ColorProps) => (
   <>
      {ROW_TOPS.map((top) => (
         <span key={top}>
            <span
               style={{
                  ...box(8, top, 3, 3),
                  borderRadius: 0.5,
                  background: W25,
               }}
            />
            <span
               style={{
                  ...box(ROW_BAR.left, top, ROW_BAR.width, ROW_BAR.height),
                  borderRadius: 1.5,
                  background: W10,
               }}
            />
         </span>
      ))}
      <motion.span
         style={{
            ...box(ROW_BAR.left, ACTIVE_ROW, ROW_BAR.width, ROW_BAR.height),
            borderRadius: 1.5,
            background: color,
            transformOrigin: "0% 50%",
         }}
         {...animate({
            times: [0, 0.16, 0.2, 0.34, 0.4, 1],
            opacity: [0, 0, 1, 1, 0, 0],
            scaleX: [0.4, 0.4, 1, 1, 0.4, 0.4],
         })}
      />
   </>
);

/* Agent session: prompt chevron and two lines of output */
const AgentSession = ({ color }: ColorProps) => (
   <div
      style={{
         ...box(AGENT.left, AGENT.top, AGENT.width, AGENT.height),
         ...panel(color),
      }}
   >
      <svg
         width={4}
         height={6}
         viewBox="0 0 4 6"
         style={{ position: "absolute", left: 3, top: 3 }}
      >
         <path
            d="M0.5 0.5 L3 3 L0.5 5.5"
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
         />
      </svg>
      <span style={{ ...box(9, 4, 12, 1), background: W40 }} />
      <span style={{ ...box(9, 8, 8, 1), background: W25 }} />
   </div>
);

/* tools/call out, structured result back */
const CallAndResult = ({ color }: ColorProps) => (
   <>
      <motion.span
         style={dot([0, 0], 3, color)}
         {...animate(
            trip([
               [0, AGENT_EDGE, 0],
               [0.04, AGENT_EDGE, 0],
               [0.06, AGENT_EDGE, 1],
               [0.16, SERVER_EDGE, 1],
               [0.18, SERVER_EDGE, 0],
               [1, AGENT_EDGE, 0],
            ]),
         )}
      />
      <motion.div
         style={{
            ...box(SERVER_EDGE[0] + 2, WIRE_Y - 2, 9, 4),
            borderRadius: 2,
            border: `1px solid ${color}80`,
            background: `${color}30`,
         }}
         {...animate({
            times: [0, 0.26, 0.29, 0.4, 0.43, 1],
            x: [0, 0, 0, 10, 10, 0],
            opacity: [0, 0, 1, 1, 0, 0],
         })}
      >
         <span style={dot([2, 1], 2, GREEN)} />
      </motion.div>
   </>
);

/* The diff the agent writes from the tool result */
const Diff = ({ color }: ColorProps) => (
   <motion.div
      style={{ ...box(AGENT.left + 2, 30, 22, 6), transformOrigin: "0% 50%" }}
      {...animate({
         ...shown(0.43, 0.97, 0.07),
         scaleX: [0, 0, 1, 1, 1, 0],
      })}
   >
      <span
         style={{ ...box(0, 0, 18, 2), borderRadius: 1, background: color }}
      />
      <span style={{ ...box(0, 4, 12, 2), borderRadius: 1, background: W40 }} />
   </motion.div>
);

/* Hook gate on the lane, then the commit rail with older commits */
const HookAndRail = ({ color }: ColorProps) => (
   <>
      <span style={{ ...box(54, GATE_Y - 0.5, 18, 1), background: W25 }} />
      <motion.span
         style={{ ...box(54, GATE_Y - 0.5, 18, 1), background: GREEN }}
         {...animate(shown(0.6, 0.72, 0.02))}
      />
      <span
         style={{
            ...MICRO_LABEL,
            left: 30,
            top: GATE_Y - 3,
            width: 22,
            textAlign: "right",
            color: W55,
         }}
      >
         HOOK
      </span>
      {OLD_COMMITS.map((x) => (
         <span key={x} style={dot([x, RAIL_Y], 3, W40)} />
      ))}
      <motion.span style={dot(HEAD, 4, color)} {...animate(pop(0.76, 0.97))} />
   </>
);

const AgentToolAnim = ({ color }: ColorProps) => (
   <div style={CANVAS}>
      <Hairlines
         d={`M${SERVER_EDGE[0]} ${WIRE_Y} H${AGENT.left} ${HAIRLINES}`}
      />
      <ToolServer color={color} />
      <ToolRows color={color} />
      <AgentSession color={color} />
      <CallAndResult color={color} />
      <Diff color={color} />
      <HookAndRail color={color} />
      <motion.span
         style={dot([0, 0], 3, color)}
         {...animate(
            trip([
               [0, DIFF_OUT, 0],
               [0.5, DIFF_OUT, 0],
               [0.52, DIFF_OUT, 1],
               [0.6, AT_GATE, 1],
               [0.68, AT_GATE, 1],
               [0.76, HEAD, 1],
               [0.78, HEAD, 0],
               [1, DIFF_OUT, 0],
            ]),
         )}
      />
   </div>
);

export default AgentToolAnim;
