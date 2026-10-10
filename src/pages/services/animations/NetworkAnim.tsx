import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import { W03, W10, W16, shown } from "@pages/projects/covers/kit/sceneTokens";
import type { Keys, Pt } from "@pages/projects/covers/kit/sceneTokens";
import {
   CANVAS,
   MICRO_LABEL,
   box,
   dot,
   looping,
   flashes,
   pop,
   trip,
} from "./canvasKit";
import Hairlines from "./Hairlines";

interface NetworkAnimProps {
   color: string;
}

type ColorProps = Readonly<NetworkAnimProps>;

/*
 * Cloud Networking: Transit Gateway hub-and-spoke with central inspection.
 *   A packet leaves the left spoke VPC, enters the TGW and is routed up to
 *   the inspection VPC, where it holds between the firewall rails while the
 *   box lights, then comes back through the hub to the right spoke, which
 *   flashes on delivery. A new spoke VPC then attaches below the hub (the
 *   self-service onboarding: attachment grows, status pip goes green) and its
 *   first packet takes the same inspected path. Packets hide inside the hub
 *   so they never cross the TGW label. Seven animated nodes, one 6 s loop;
 *   every moving node is at opacity 0 at both ends of the loop.
 */

const animate = looping(6);

/* Canvas anchors */
const SPOKE_W = 16;
const SPOKE_H = 12;
const LEFT_SPOKE: Pt = [2, 38];
const RIGHT_SPOKE: Pt = [62, 38];
const NEW_SPOKE: Pt = [32, 64];
const INSPECT = { left: 22, top: 4, width: 36, height: 18 };
const HUB = { left: 30, top: 38, width: 20, height: 12 };

/* Packet waypoints: spoke edges, hub edges, the hold point in inspection */
const LEFT_EDGE: Pt = [18, 44];
const RIGHT_EDGE: Pt = [62, 44];
const NEW_EDGE: Pt = [40, 64];
const HUB_WEST: Pt = [30, 44];
const HUB_NORTH: Pt = [40, 38];
const HUB_EAST: Pt = [50, 44];
const HUB_SOUTH: Pt = [40, 50];
const AT_INSPECT: Pt = [40, 16];

const HAIRLINES = "M40 22 V38 M18 44 H30 M50 44 H62";

/* Leg timing as fractions of the loop */
const FADE = 0.02;
const LEG = 0.06;
const HOP = 0.01;
const HOLD = 0.06;
const FIRST_TRIP = 0.04;
const SECOND_TRIP = 0.52;
const ATTACH = 0.4;
const DETACH = 0.94;

/* moments inside one inspected trip that starts at t0 */
const heldAt = (t0: number) => t0 + FADE + 2 * LEG + 3 * HOP;
const deliveredAt = (t0: number) => heldAt(t0) + HOLD + 2 * LEG + 3 * HOP;

/*
 * from spoke -> hub edge (hide) -> hub north (show) -> inspection, hold ->
 * hub north (hide) -> hub east (show) -> right spoke, fade, home hidden.
 */
const inspectedTrip = (from: Pt, entry: Pt, t0: number): Keys => {
   const reach = t0 + FADE + LEG;
   const up = reach + 3 * HOP;
   const held = heldAt(t0);
   const back = held + HOLD + LEG;
   const out = back + 3 * HOP;
   const done = deliveredAt(t0);
   return trip([
      [0, from, 0],
      [t0, from, 0],
      [t0 + FADE, from, 1],
      [reach, entry, 1],
      [reach + HOP, entry, 0],
      [up - HOP, HUB_NORTH, 0],
      [up, HUB_NORTH, 1],
      [held, AT_INSPECT, 1],
      [held + HOLD, AT_INSPECT, 1],
      [back, HUB_NORTH, 1],
      [back + HOP, HUB_NORTH, 0],
      [out - HOP, HUB_EAST, 0],
      [out, HUB_EAST, 1],
      [done, RIGHT_EDGE, 1],
      [done + FADE, RIGHT_EDGE, 0],
      [1, from, 0],
   ]);
};

const inspectWindow = (t0: number) =>
   [heldAt(t0) - HOP, heldAt(t0) + HOLD + 2 * HOP] as const;
const deliveryWindow = (t0: number) =>
   [deliveredAt(t0), deliveredAt(t0) + 0.08] as const;

const spokeFrame = (color: string) => ({
   borderRadius: 3,
   border: `1px solid ${color}55`,
   background: `${color}0c`,
});

const SUBNETS = [3, 6];

/* A spoke VPC: frame plus two subnet hairlines */
const Spoke = ({ color, at }: Readonly<{ color: string; at: Pt }>) => (
   <div
      style={{ ...box(at[0], at[1], SPOKE_W, SPOKE_H), ...spokeFrame(color) }}
   >
      {SUBNETS.map((top) => (
         <span
            key={top}
            style={{ ...box(3, top, 12 - top, 1), background: W16 }}
         />
      ))}
   </div>
);

const INSPECT_BOX = {
   ...box(INSPECT.left, INSPECT.top, INSPECT.width, INSPECT.height),
   borderRadius: 3,
};
const FIREWALL_RAILS = [35, 43];

/* Inspection VPC: panel, the tint overlay that lights while a packet holds
   inside, firewall rails either side of the hold point, and the label */
const Inspection = ({ color }: ColorProps) => (
   <>
      <div
         style={{ ...INSPECT_BOX, border: `1px solid ${W10}`, background: W03 }}
      />
      <motion.div
         style={{
            ...INSPECT_BOX,
            border: `1px solid ${color}`,
            background: `${color}14`,
         }}
         {...animate(
            flashes(inspectWindow(FIRST_TRIP), inspectWindow(SECOND_TRIP)),
         )}
      />
      {FIREWALL_RAILS.map((left) => (
         <span
            key={left}
            style={{
               ...box(left, AT_INSPECT[1] - 1.5, 2, 3),
               borderRadius: 0.5,
               background: W16,
            }}
         />
      ))}
      <span
         style={{
            ...MICRO_LABEL,
            left: INSPECT.left,
            top: INSPECT.top + 3,
            width: INSPECT.width,
            textAlign: "center",
            color: `${color}cc`,
         }}
      >
         INSPECT
      </span>
   </>
);

const TransitGateway = ({ color }: ColorProps) => (
   <div
      style={{
         ...box(HUB.left, HUB.top, HUB.width, HUB.height),
         borderRadius: HUB.height / 2,
         border: `1px solid ${color}88`,
         background: `${color}1a`,
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
      }}
   >
      <span style={{ ...MICRO_LABEL, position: "static", color }}>TGW</span>
   </div>
);

/* Self-service onboarding: the new spoke fades in, its attachment grows up
   to the hub, and the status pip goes green once it is routable */
const NewSpoke = ({ color }: ColorProps) => (
   <>
      <motion.div
         style={{
            ...box(39.5, 50, 1, 14),
            background: W16,
            transformOrigin: "50% 100%",
         }}
         {...animate({
            times: [0, ATTACH + 0.04, ATTACH + 0.1, DETACH, DETACH + 0.05, 1],
            scale: [0, 0, 1, 1, 0, 0],
            opacity: [0, 0, 1, 1, 0, 0],
         })}
      />
      <motion.div
         style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${NEW_EDGE[0]}px ${NEW_SPOKE[1] + SPOKE_H / 2}px`,
         }}
         {...animate({
            ...shown(ATTACH, DETACH + 0.05, 0.05),
            scale: [0.9, 0.9, 1, 1, 0.9, 0.9],
         })}
      >
         <Spoke color={color} at={NEW_SPOKE} />
      </motion.div>
      <motion.span
         style={dot([NEW_SPOKE[0] + SPOKE_W - 1, NEW_SPOKE[1] + 1], 3, GREEN)}
         {...animate(pop(ATTACH + 0.1, DETACH + 0.05))}
      />
   </>
);

const Packet = ({ color, keys }: Readonly<{ color: string; keys: Keys }>) => (
   <motion.span style={dot([0, 0], 3, color)} {...animate(keys)} />
);

const NetworkAnim = ({ color }: ColorProps) => (
   <div style={CANVAS}>
      <Hairlines d={HAIRLINES} />
      <Inspection color={color} />
      <Spoke color={color} at={LEFT_SPOKE} />
      <Spoke color={color} at={RIGHT_SPOKE} />
      <motion.div
         style={{
            ...box(RIGHT_SPOKE[0], RIGHT_SPOKE[1], SPOKE_W, SPOKE_H),
            borderRadius: 3,
            border: `1px solid ${color}`,
            background: `${color}22`,
         }}
         {...animate(
            flashes(deliveryWindow(FIRST_TRIP), deliveryWindow(SECOND_TRIP)),
         )}
      />
      <NewSpoke color={color} />
      <TransitGateway color={color} />
      <Packet
         color={color}
         keys={inspectedTrip(LEFT_EDGE, HUB_WEST, FIRST_TRIP)}
      />
      <Packet
         color={color}
         keys={inspectedTrip(NEW_EDGE, HUB_SOUTH, SECOND_TRIP)}
      />
   </div>
);

export default NetworkAnim;
