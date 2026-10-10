import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Panel, Pip, Shell, Trace, Wire } from "./kit/primitives";
import {
   DOTS,
   FADE,
   GREEN,
   INK,
   NON_SCALING,
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
   layer,
   lit,
   loopProps,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Loop, TintProps } from "./kit/sceneTokens";

/*
 * Claude Skills: the sagar-dev-skills marketplace.json lists the plugins; one
 * row is picked and `/plugin install` carries it across; plugins/<name>/
 * unpacks its tree (skills/SKILL.md, commands, agents, hooks/hooks.json) and
 * the plugin turns on. The loop opens on the installed state, so the frozen
 * Reduced frame is the finished plugin: it clears, replays, then holds.
 */

const beat = clock(5.6);
/* installed things fade out here at the top of every loop */
const CLEAR = [0.04, 0.08];
const LIT_UNTIL = 0.86;

const PICKED = 85;
const ROOT_Y = 36;
const LINK = sCurve([126, PICKED], [172, ROOT_Y]);
const LINK_ROUTE = route(LINK);
const INSTALL: [number, number][] = [
   [0.18, 0],
   [0.32, 1],
];

/* spine with elbows, retraced so one stroke draws the whole tree in order */
const TREE = "M184,48 V66 H198 H184 V94 H198 H184 V122 H198 H184 V150 H198";
const TREE_FROM = 0.36;
const TREE_TO = 0.64;
/* fraction of TREE where each elbow is reached (spine steps 18 and 28, elbows 14) */
const ELBOWS = [32, 88, 144, 200].map((d) => d / 200);
const CHILD_Y = [66, 94, 122, 150];

/* shown at rest, gone during CLEAR, back at `at` */
const OUT_IN = [1, 1, 0, 0, 1, 1];
const backAt = (at: number, ramp = 0.04) => [0, ...CLEAR, at, at + ramp, 1];
const elbowAt = (e: number) => TREE_FROM + (TREE_TO - TREE_FROM) * e;

/* each child row slides off the spine the moment the tree reaches its elbow;
   its HTML name only fades, since x would replace the label's centring */
const ROW_REVEALS: Loop[] = ELBOWS.map((e) =>
   beat({
      times: backAt(elbowAt(e)),
      opacity: OUT_IN,
      x: [0, 0, -8, -8, 0, 0],
   }),
);
const NAME_REVEALS: Loop[] = ELBOWS.map((e) =>
   beat({ times: backAt(elbowAt(e)), opacity: OUT_IN }),
);

const SELECT = beat({ times: backAt(0.12, 0.06), opacity: OUT_IN });
const CARRY = beat(ride(LINK_ROUTE, INSTALL));
const CARRIED = beat(lit(INSTALL, LIT_UNTIL));
const LANDED = beat({
   times: [0, 0.31, 0.32 + FADE, 0.38, 0.42, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});
const UNPACK = beat({
   times: [0, TREE_FROM, TREE_TO, LIT_UNTIL, LIT_UNTIL + FADE, 1],
   pathLength: [0, 0, 1, 1, 1, 0],
   opacity: [0, 1, 1, 1, 0, 0],
   ease: "linear",
});
const ENABLED = beat({
   times: backAt(0.66),
   opacity: OUT_IN,
   scale: [1, 1, 0.4, 0.4, 1, 1],
});

/* marketplace.json plugins: [row top, name bar width] */
const ROWS: [number, number][] = [
   [49, 38],
   [65, 50],
   [81, 46],
   [97, 32],
   [113, 52],
   [129, 42],
   [145, 36],
];

const Marketplace = ({ tint }: TintProps) => (
   <>
      <Panel box={[26, 18, 100, 150]} rx={9} />
      <Wire d="M26,40 H126" />
      <motion.g {...loopProps(SELECT)}>
         <Panel
            box={[31, 77, 90, 16]}
            rx={5}
            fill={`${tint}1a`}
            stroke={`${tint}59`}
         />
      </motion.g>
      {ROWS.map(([top, width]) => (
         <g key={top}>
            <circle cx={37} cy={top + 4} r={2} fill={`${tint}66`} />
            <Bar
               box={[45, top + 2.25, width, 3.5]}
               fill={top + 4 === PICKED ? W40 : W16}
            />
            <Bar box={[101, top + 1, 16, 6]} fill={W10} />
         </g>
      ))}
   </>
);

/* commands/*.md: a slash and a command pill */
const Commands = () => (
   <>
      <Wire d="M207,99 L211,89" stroke={W40} />
      <rect
         x={215}
         y={91}
         width={26}
         height={6}
         rx={3}
         fill="none"
         stroke={W25}
         vectorEffect={NON_SCALING}
      />
      <Bar box={[246, 92.25, 32, 3.5]} fill={W16} />
   </>
);

/* agents/*.md: one avatar disc and a name */
const Agents = () => (
   <>
      <circle cx={209} cy={122} r={3.4} fill={W40} />
      <Bar box={[217, 120.25, 40, 3.5]} fill={W16} />
   </>
);

const Child = ({
   index,
   children,
}: {
   index: number;
   children?: ReactNode;
}) => (
   <motion.g {...loopProps(ROW_REVEALS[index])}>
      <Panel box={[198, CHILD_Y[index] - 10, 96, 20]} rx={6} />
      {children}
   </motion.g>
);

const PluginTree = ({ tint }: TintProps) => (
   <>
      <Wire d={curveD(LINK)} />
      <Trace d={LINK_ROUTE.d} color={`${tint}80`} width={1.5} loop={CARRIED} />
      {/* plugins/<name>/ root row */}
      <Panel
         box={[172, 24, 122, 24]}
         rx={6}
         fill={`${tint}0d`}
         stroke={`${tint}40`}
      />
      <motion.g {...loopProps(LANDED)}>
         <Panel
            box={[172, 24, 122, 24]}
            rx={6}
            fill={`${tint}14`}
            stroke={tint}
         />
      </motion.g>
      <Wire d="M180,30.5 H185 L187,32.5 H193 V41.5 H180 Z" stroke={W40} />
      <Bar box={[199, 34.25, 60, 3.5]} fill={W40} />
      <Wire d={TREE} stroke={W16} />
      <Trace d={TREE} color={`${tint}99`} width={1.5} loop={UNPACK} />
      {/* empty slots stay outlined while the plugin is cleared */}
      {CHILD_Y.map((cy) => (
         <Panel
            key={cy}
            box={[198, cy - 10, 96, 20]}
            rx={6}
            fill="none"
            stroke={W06}
         />
      ))}
      {/* skills/SKILL.md, commands, agents, hooks/hooks.json */}
      <Child index={0} />
      <Child index={1}>
         <Commands />
      </Child>
      <Child index={2}>
         <Agents />
      </Child>
      <Child index={3} />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Marketplace tint={tint} />
      <PluginTree tint={tint} />
   </>
);

/* `/plugin install` chip riding the link; the wrapper spans the stage */
const chip = (tint: string): CSSProperties => ({
   ...label,
   left: 0,
   top: 0,
   transform: "translate(-50%, -50%)",
   padding: "2px 6px",
   borderRadius: 999,
   border: `1px solid ${tint}66`,
   background: INK,
   color: W70,
});

const PluginScene = ({ tint }: TintProps) => (
   <Shell
      tint={tint}
      focus="72% 44%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      <Pip at={[285, ROOT_Y]} color={GREEN} loop={ENABLED} />
      <Label at={[207, CHILD_Y[0]]} color={W70} loop={NAME_REVEALS[0]}>
         SKILL.MD
      </Label>
      <Label at={[207, CHILD_Y[3]]} color={W70} loop={NAME_REVEALS[3]}>
         HOOKS.JSON
      </Label>
      <Label at={[36, 29]} color={W55}>
         MARKETPLACE
      </Label>
      <motion.div style={layer} {...loopProps(CARRY)}>
         <span style={chip(tint)}>/PLUGIN</span>
      </motion.div>
   </Shell>
);

export default PluginScene;
