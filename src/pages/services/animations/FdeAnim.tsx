import { motion } from "motion/react";
import { GREEN } from "@/constants/theme";
import type { Pt } from "@pages/projects/covers/kit/sceneTokens";
import { ART_CANVAS_WIDE } from "../servicesConstants";
import {
   CANVAS,
   CHROME_FILL,
   CHROME_GHOST,
   CHROME_HAIR,
   CHROME_LINE,
   MICRO_LABEL,
   box,
   dot,
   looping,
   flashes,
   pop,
   trip,
} from "./canvasKit";
import Hairlines from "./Hairlines";

interface FdeAnimProps {
   color: string;
}

type ColorProps = Readonly<FdeAnimProps>;

/*
 * Forward Deployed Engineering: embedded with the customer team, from
 *   requirement to tested Terraform, then the pattern published. On the lead
 *   card's wide canvas the story runs left to right: the engineer (tint dot)
 *   comes in from outside and takes the open seat in the customer team's row;
 *   a module card fills line by line and its test pip goes green; a packet
 *   carries the pattern out along the hairline to SAMPLES, which lights on
 *   arrival; the engineer then leaves for the next engagement and the card
 *   clears. Eight animated nodes, one 6 s loop; everything that moves is
 *   hidden or reset at both ends of the loop.
 */

const animate = looping(6);

const WIDE_CANVAS = { ...CANVAS, width: ART_CANVAS_WIDE };

/* Canvas anchors (160 x 80) */
const PANEL = { left: 4, top: 6, width: 100, height: 68 };
const MODULE = { left: 14, top: 36, width: 70, height: 28 };
const SAMPLES = { left: 120, top: 38, width: 36, height: 24 };
const TEAM_Y = 24;
const TEAM_X = [14, 23, 32];
const SEAT: Pt = [42, TEAM_Y];
const OUTSIDE: Pt = [132, TEAM_Y];
const MODULE_EXIT: Pt = [MODULE.left + MODULE.width, 50];
const SAMPLES_IN: Pt = [SAMPLES.left, 50];

const HAIRLINES = `M${MODULE_EXIT[0]} ${MODULE_EXIT[1]} H${SAMPLES_IN[0]}`;

/* Beats as fractions of the loop */
const SEATED = 0.16;
const TESTED = 0.42;
const SHIP = 0.5;
const ARRIVE = 0.64;
const LEAVE = 0.8;
const GONE = 0.92;
const CLEAR = 0.95;

/* In from outside, sit with the team, leave for the next engagement */
const ENGINEER = trip([
   [0, OUTSIDE, 0],
   [0.03, OUTSIDE, 1],
   [SEATED, SEAT, 1],
   [LEAVE, SEAT, 1],
   [GONE - 0.03, OUTSIDE, 1],
   [GONE, OUTSIDE, 0],
   [1, OUTSIDE, 0],
]);

/* The pattern rides the hairline from the module to SAMPLES */
const PACKET = trip([
   [0, MODULE_EXIT, 0],
   [SHIP, MODULE_EXIT, 0],
   [SHIP + 0.02, MODULE_EXIT, 1],
   [ARRIVE, SAMPLES_IN, 1],
   [ARRIVE + 0.02, SAMPLES_IN, 0],
   [1, MODULE_EXIT, 0],
]);

/* A requirement line writes itself left to right, holds, clears with the card */
const written = (on: number) => ({
   times: [0, on, on + 0.08, CLEAR - 0.03, CLEAR, 1],
   scaleX: [0, 0, 1, 1, 0, 0],
   opacity: [0, 0, 1, 1, 0, 0],
});

const MODULE_LINES = [
   { top: 43, width: 40, on: 0.2 },
   { top: 50, width: 28, on: 0.27 },
   { top: 57, width: 34, on: 0.34 },
];

/* The customer team: frame, label, three seated members and an open seat */
const Team = ({ color }: ColorProps) => (
   <>
      <div
         style={{
            ...box(PANEL.left, PANEL.top, PANEL.width, PANEL.height),
            borderRadius: 4,
            border: `1px solid ${CHROME_LINE}`,
            background: CHROME_FILL,
         }}
      />
      <span
         style={{
            ...MICRO_LABEL,
            left: PANEL.left + 5,
            top: PANEL.top + 5,
            color: `${color}cc`,
         }}
      >
         CUSTOMER
      </span>
      {TEAM_X.map((x) => (
         <span key={x} style={dot([x, TEAM_Y], 4, CHROME_GHOST)} />
      ))}
      {/* The open seat the engineer fills */}
      <span
         style={{
            ...dot(SEAT, 7, "transparent"),
            border: `1px dashed ${color}88`,
         }}
      />
   </>
);

/* The module being written: card, three lines that fill, the test pip */
const Module = ({ color }: ColorProps) => (
   <>
      <div
         style={{
            ...box(MODULE.left, MODULE.top, MODULE.width, MODULE.height),
            borderRadius: 3,
            border: `1px solid ${color}66`,
            background: `${color}0f`,
         }}
      />
      {MODULE_LINES.map(({ top, width, on }) => (
         <motion.span
            key={top}
            style={{
               ...box(MODULE.left + 5, top, width, 1.5),
               borderRadius: 1,
               background: CHROME_HAIR,
               transformOrigin: "0% 50%",
            }}
            {...animate(written(on))}
         />
      ))}
      <motion.span
         style={dot([MODULE.left + MODULE.width - 5, MODULE.top + 5], 3, GREEN)}
         {...animate(pop(TESTED, CLEAR))}
      />
   </>
);

const SAMPLES_BOX = {
   ...box(SAMPLES.left, SAMPLES.top, SAMPLES.width, SAMPLES.height),
   borderRadius: 3,
};

/* aws-samples: panel, the tint overlay that lights as the pattern lands */
const Samples = ({ color }: ColorProps) => (
   <>
      <div
         style={{
            ...SAMPLES_BOX,
            border: `1px solid ${CHROME_LINE}`,
            background: CHROME_FILL,
         }}
      />
      <motion.div
         style={{
            ...SAMPLES_BOX,
            border: `1px solid ${color}`,
            background: `${color}1a`,
         }}
         {...animate(flashes([ARRIVE, ARRIVE + 0.12]))}
      />
      {/* Centred in the box at any label size */}
      <span
         style={{
            ...MICRO_LABEL,
            ...SAMPLES_BOX,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: `${color}cc`,
         }}
      >
         SAMPLES
      </span>
   </>
);

const FdeAnim = ({ color }: ColorProps) => (
   <div style={WIDE_CANVAS}>
      <Hairlines d={HAIRLINES} width={ART_CANVAS_WIDE} />
      <Team color={color} />
      <Module color={color} />
      <Samples color={color} />
      <motion.span style={dot([0, 0], 3, color)} {...animate(PACKET)} />
      <motion.span style={dot([0, 0], 5, color)} {...animate(ENGINEER)} />
   </div>
);

export default FdeAnim;
