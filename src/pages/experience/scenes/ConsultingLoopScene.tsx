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
   GREEN,
   INK,
   NON_SCALING,
   RAILS,
   W10,
   W25,
   W40,
   curveD,
   label,
   layer,
   line,
   lit,
   ride,
   route,
   sCurve,
} from "@pages/projects/covers/kit/sceneTokens";
import type {
   Box,
   Pt,
   TintProps,
} from "@pages/projects/covers/kit/sceneTokens";
import { Dashed, Draw, Frame } from "./SceneFrame";
import { END, boxAt, play, timeline } from "./sceneParts";

/*
 * One consulting engagement, clockwise in 7 s, then the next one starts:
 *   need      the customer hands over a requirements card, lines filling in
 *   design    the card lands in the design panel and the architecture
 *             sketch draws: three services and their links
 *   code      the design becomes code, line by line
 *   ship      the change waits at the plan gate, passes, and lands as a
 *             stack of lit services
 *   handover  the docs travel back to the customer, who signs off with a
 *             green check; the scene clears and a new need arrives
 * Sized for the compact timeline slot (264 x 165 desktop, 140 px tall on
 * phones): large panels, 4 labels, 10 animated nodes.
 */

const { beat, held, pop, growX, hop } = timeline(7);

/* ---------------- layout, stage units ---------------- */

const CUSTOMER: Pt = [40, 100];
const AVATAR_R = 18;
const NEED_AT: Pt = [40, 50];
const DESIGN: Box = [84, 22, 92, 66];
const DESIGN_CENTRE: Pt = [130, 58];
const CODE: Box = [194, 22, 100, 66];
const STACK: Box = [212, 112, 64, 50];
const SHIP_X = CODE[0] + CODE[2] / 2;
const CODE_FOOT: Pt = [SHIP_X, CODE[1] + CODE[3]];
const STACK_TOP: Pt = [SHIP_X, STACK[1]];
const GATE: Pt = [SHIP_X, 100];

/* architecture sketch: three service boxes and the links between them */
const SKETCH =
   "M94,50 h20 v16 h-20 Z M114,58 H122 M122,50 h20 v16 h-20 Z M142,58 H150 M150,50 h20 v16 h-20 Z M132,66 V76 H104 V66";
const CODE_LINES = [
   { y: 44, w: 56 },
   { y: 52, w: 40 },
   { y: 60, w: 66 },
   { y: 68, w: 34 },
   { y: 76, w: 50 },
];
const BLOCK_X = [220, 236, 252];
const BLOCK_Y = [134, 147];
const blocks = BLOCK_Y.flatMap((y) => BLOCK_X.map((x): Box => [x, y, 12, 9]));
const HANDOVER = sCurve([STACK[0], 140], [CUSTOMER[0] + AVATAR_R + 2, 108]);

/* ---------------- storyboard ---------------- */

const NEED = beat(
   ride(route(line(NEED_AT, DESIGN_CENTRE)), [
      [0.03, 0],
      [0.14, 0],
      [0.23, 1],
   ]),
);
const NEED_LINES = growX(0.05, 0.12);
const SKETCHED = beat(
   lit(
      [
         [0.24, 0],
         [0.38, 1],
      ],
      END,
   ),
);
const TO_CODE = hop([DESIGN[0] + DESIGN[2], 55], [CODE[0], 55], 0.4, 0.45);
const CODED = growX(0.45, 0.56);
/* the change holds at the plan gate until it passes */
const SHIPPED = beat(
   ride(route(line(CODE_FOOT, STACK_TOP)), [
      [0.57, 0],
      [0.6, 0.5],
      [0.64, 0.5],
      [0.67, 1],
   ]),
);
const PLANNED = held(0.61);
const LIVE = held(0.67);
const HANDED = beat(
   ride(route(HANDOVER), [
      [0.7, 0],
      [0.81, 1],
   ]),
);
const SIGNED = pop(0.82);

/* ---------------- stage ---------------- */

const Customer = () => (
   <>
      <circle
         cx={CUSTOMER[0]}
         cy={CUSTOMER[1]}
         r={AVATAR_R}
         fill={INK}
         stroke={W25}
         vectorEffect={NON_SCALING}
      />
      <circle cx={CUSTOMER[0]} cy={94} r={5} fill={W40} />
      <path d="M30,112 C30,102 50,102 50,112" fill={W40} />
   </>
);

const Design = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={DESIGN} rx={7} />
      <path d={SKETCH} fill="none" stroke={W10} vectorEffect={NON_SCALING} />
      <Draw d={SKETCH} color={tint} width={1.2} loop={SKETCHED} />
   </>
);

const Code = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={CODE} rx={7} />
      {CODE_LINES.map(({ y, w }) => (
         <Bar key={y} box={[204, y, w, 3]} fill={W10} />
      ))}
      <motion.g style={{ originX: 0 }} {...play(CODED)}>
         {CODE_LINES.map(({ y, w }) => (
            <Bar key={y} box={[204, y, w, 3]} fill={`${tint}b3`} />
         ))}
      </motion.g>
   </>
);

const Stack = ({ tint }: Readonly<TintProps>) => (
   <>
      <Panel box={STACK} rx={7} />
      {blocks.map((box) => (
         <Panel key={box.join("-")} box={box} rx={2} />
      ))}
      <motion.g {...play(LIVE)}>
         <Panel box={STACK} rx={7} fill="none" stroke={`${tint}99`} />
         {blocks.map((box) => (
            <Panel
               key={box.join("-")}
               box={box}
               rx={2}
               fill={`${tint}59`}
               stroke={tint}
            />
         ))}
      </motion.g>
   </>
);

const Wiring = () => (
   <>
      <Wire d={`M${DESIGN[0] + DESIGN[2]},55 H${CODE[0]}`} />
      <Wire d={`M${CODE_FOOT[0]},${CODE_FOOT[1]} V${STACK_TOP[1]}`} />
      <Dashed d={curveD(HANDOVER)} />
      {/* arrowhead where the handover reaches the customer */}
      <Wire d="M66,103 L60,108 L66,113" stroke={W25} />
   </>
);

const Stage = ({ tint }: Readonly<TintProps>) => (
   <>
      <Wiring />
      <Customer />
      <Design tint={tint} />
      <Code tint={tint} />
      <Stack tint={tint} />
      {/* signed off: a green ring and check on the customer */}
      <motion.g {...play(SIGNED)}>
         <circle
            cx={CUSTOMER[0]}
            cy={CUSTOMER[1]}
            r={AVATAR_R}
            fill={`${GREEN}1a`}
            stroke={GREEN}
            vectorEffect={NON_SCALING}
         />
         <circle cx={54} cy={87} r={6} fill={GREEN} />
         <path
            d="M51.2,87 L53.3,89.2 L57,85"
            fill="none"
            stroke={INK}
            strokeWidth={1.6}
         />
      </motion.g>
   </>
);

/* ---------------- front layer ---------------- */

const NEED_W = 36;
const NEED_H = 28;

const needCard = (tint: string): CSSProperties => ({
   ...boxAt([0, 0], NEED_W, NEED_H),
   padding: "4px 5px",
   borderRadius: 4,
   border: `1px solid ${tint}99`,
   background: "#101a20",
   display: "flex",
   flexDirection: "column",
   gap: 3,
});

const requirement = (tint: string, width: string): CSSProperties => ({
   display: "block",
   width,
   height: 2,
   borderRadius: 1,
   background: `${tint}cc`,
});

const docGlyph = (tint: string): CSSProperties => ({
   ...boxAt([0, 0], 12, 14),
   padding: "3px 2px",
   borderRadius: "1px 4px 1px 1px",
   border: `1px solid ${tint}`,
   background: INK,
   display: "flex",
   flexDirection: "column",
   gap: 2,
});

const gate = (open: boolean): CSSProperties => ({
   ...boxAt(GATE, 14, 8),
   borderRadius: 2,
   border: `1px solid ${open ? GREEN : W25}`,
   background: open ? `${GREEN}33` : INK,
});

/* The requirements card rides from the customer into the design panel. */
const Need = ({ tint }: Readonly<TintProps>) => (
   <motion.div style={layer} {...play(NEED)}>
      <div style={needCard(tint)}>
         <span style={{ ...label, position: "static", color: tint }}>NEED</span>
         <motion.span
            style={{ display: "grid", gap: 2.5, originX: 0 }}
            {...play(NEED_LINES)}
         >
            <span style={requirement(tint, "100%")} />
            <span style={requirement(tint, "70%")} />
         </motion.span>
      </div>
   </motion.div>
);

const Front = ({ tint }: Readonly<TintProps>) => (
   <>
      <Label at={[92, 32]}>DESIGN</Label>
      <Label at={[202, 32]}>CODE</Label>
      <Label at={[219, 122]}>SHIP</Label>
      <div style={gate(false)} />
      <motion.div style={layer} {...play(PLANNED)}>
         <div style={gate(true)} />
      </motion.div>
      <Packet color={tint} loop={TO_CODE} />
      <Packet color={tint} loop={SHIPPED} />
      {/* the handover: docs travelling back to the customer */}
      <motion.div style={layer} {...play(HANDED)}>
         <span style={docGlyph(tint)}>
            <span style={requirement(tint, "100%")} />
            <span style={requirement(tint, "60%")} />
         </span>
      </motion.div>
      <Need tint={tint} />
   </>
);

export default function ConsultingLoopScene({ tint }: Readonly<TintProps>) {
   return (
      <Frame
         tint={tint}
         focus="50% 45%"
         texture={RAILS}
         stage={<Stage tint={tint} />}
      >
         <Front tint={tint} />
      </Frame>
   );
}
