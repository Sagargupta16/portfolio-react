import { motion } from "motion/react";
import type { ReactNode } from "react";
import {
   CYCLE,
   NON_SCALING,
   WHITE_10,
   WHITE_14,
   WHITE_22,
   WHITE_35,
   WHITE_55,
   curve,
   curvePoints,
   loop,
} from "./sceneTokens";
import type { PipelineProps, Point } from "./sceneTokens";
import { Label, Packet, Panel, Pop, Rule, SceneSvg, Wire } from "./primitives";

/* readme-kit (readme_kit/cli.py): a push of profile.yml runs the action, the
   config validates, and the matching set of cards lands in the README one
   after another (hero, section header, terminal, project cards, buttons).
   Then theme.accent recolours every card at once: one key, one accent. */

const YAML = { x: 136, y: 250, w: 330, h: 440 };
const YAML_HEADER_Y = YAML.y + 46;
const LINE_X = YAML.x + 44;
const INDENT = 34;
const LINE_TOP = YAML.y + 104;
const LINE_PITCH = 56;
const KEY_GAP = 16;

interface YamlLine {
   key: number;
   value: number;
   indent: number;
}

/* hero, name, taglines, theme, accent, projects */
const YAML_LINES: YamlLine[] = [
   { key: 78, value: 0, indent: 0 },
   { key: 65, value: 143, indent: 1 },
   { key: 94, value: 101, indent: 1 },
   { key: 83, value: 0, indent: 0 },
   { key: 81, value: 0, indent: 1 },
   { key: 107, value: 0, indent: 0 },
];
const ACCENT_LINE = 4;
const SWATCH = {
   x: LINE_X + INDENT + YAML_LINES[ACCENT_LINE].key + 18,
   y: LINE_TOP + ACCENT_LINE * LINE_PITCH - 12,
   s: 24,
};

/* The README the cards land in. */
const FRAME = { x: 560, y: 100, w: 904, h: 690 };
const IX = FRAME.x + 26;
const IW = FRAME.w - 52;
const CARD_RX = 18;
const WIRE: [Point, Point] = [
   [YAML.x + YAML.w, YAML.y + YAML.h / 2],
   [FRAME.x, FRAME.y + FRAME.h / 2],
];

interface Bar {
   x: number;
   y: number;
   w: number;
   h: number;
}

/* Marks that take theme.accent; drawn neutral in the cards first. */
/* Card bands down the README, top to bottom. */
const HERO = { y: 128, h: 164 };
const HEADER_Y = 332;
const TERMINAL = { y: 372, h: 134 };
const PROJECTS = { y: 526, h: 154 };
const BUTTON_Y = 730;
const BUTTON_H = 56;

/* Marks that take theme.accent; drawn neutral in the cards first. */
const NAME_BAR: Bar = { x: IX + 40, y: HERO.y + 40, w: 240, h: 26 };
const HEADER_NUMBER: Bar = { x: IX + 18, y: HEADER_Y - 6, w: 36, h: 12 };
const PROMPT_Y = TERMINAL.y + 72;
const PROMPT: Bar = { x: IX + 30, y: PROMPT_Y - 6, w: 18, h: 12 };
const PROJECT_GAP = 20;
const PROJECT_W = (IW - PROJECT_GAP) / 2;
const PROJECT_XS = [IX, IX + PROJECT_W + PROJECT_GAP];
const TAGS: Bar[] = PROJECT_XS.map((x) => ({
   x: x + 24,
   y: PROJECTS.y + 118,
   w: 64,
   h: 13,
}));
const BUTTON_GAP = 20;
const BUTTON_W = (IW - 3 * BUTTON_GAP) / 4;
const BUTTON_XS = [0, 1, 2, 3].map((i) => IX + i * (BUTTON_W + BUTTON_GAP));

/* Beats, cycle seconds. */
const DROP_AT = 1.75;
const DROP_STAGGER = 0.2;
const TYPE_AT = 2.8;
const ACCENT_AT = 3.7;
const RESET = 5.3;
const FADE = loop(0, ACCENT_AT, ACCENT_AT + 0.4, RESET, RESET + 0.3, CYCLE);

const Pill = ({ bar, fill }: { bar: Bar; fill: string }) => (
   <rect
      x={bar.x}
      y={bar.y}
      width={bar.w}
      height={bar.h}
      rx={bar.h / 2}
      fill={fill}
   />
);

/* profile.yml typing in: keys in the tint, values in white, the accent swatch. */
const Yaml = ({ tint }: { tint: string }) => (
   <motion.g
      animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
      transition={loop(0, 0.2, 0.9, RESET, RESET + 0.4, CYCLE)}
      style={{ originX: 0 }}
   >
      {YAML_LINES.map((line, i) => {
         const x = LINE_X + line.indent * INDENT;
         const y = LINE_TOP + i * LINE_PITCH;
         return (
            <g key={y}>
               <Rule x={x} y={y} w={line.key} color={`${tint}cc`} />
               {line.value > 0 && (
                  <Rule
                     x={x + line.key + KEY_GAP}
                     y={y}
                     w={line.value}
                     color={WHITE_35}
                  />
               )}
            </g>
         );
      })}
      <rect
         x={SWATCH.x}
         y={SWATCH.y}
         width={SWATCH.s}
         height={SWATCH.s}
         rx={5}
         fill={tint}
      />
   </motion.g>
);

/* The swatch rings once, right before the whole set takes its colour. */
const SwatchRing = ({ tint }: { tint: string }) => (
   <motion.rect
      x={SWATCH.x - 5}
      y={SWATCH.y - 5}
      width={SWATCH.s + 10}
      height={SWATCH.s + 10}
      rx={8}
      fill="none"
      stroke={tint}
      strokeWidth={1}
      vectorEffect={NON_SCALING}
      animate={{ opacity: [0, 0, 0.9, 0, 0], scale: [1, 1, 1, 1.9, 1] }}
      transition={loop(
         0,
         ACCENT_AT - 0.25,
         ACCENT_AT - 0.2,
         ACCENT_AT + 0.35,
         CYCLE,
      )}
   />
);

/* One card dropping into its slot of the README, then fading at the reset. */
const Drop = ({ index, children }: { index: number; children: ReactNode }) => {
   const at = DROP_AT + index * DROP_STAGGER;
   return (
      <motion.g
         animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [-20, -20, 0, 0, 0, -20] }}
         transition={loop(0, at, at + 0.35, RESET, RESET + 0.3, CYCLE)}
      >
         {children}
      </motion.g>
   );
};

const Hero = () => (
   <>
      <Panel x={IX} y={HERO.y} w={IW} h={HERO.h} rx={CARD_RX} />
      <Pill bar={NAME_BAR} fill={WHITE_22} />
      <Rule x={IX + 40} y={HERO.y + 104} w={300} color={WHITE_35} />
      <Rule x={IX + 40} y={HERO.y + 132} w={190} color={WHITE_22} />
      <path
         d={`M${IX + 650} ${HERO.y + 42} L${IX + 724} ${HERO.y + 84} L${IX + 622} ${HERO.y + 118} Z`}
         fill="none"
         stroke={WHITE_22}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
   </>
);

const Header = () => (
   <>
      <Pill bar={HEADER_NUMBER} fill={WHITE_22} />
      <Rule x={IX + 72} y={HEADER_Y} w={200} color={WHITE_55} />
      <Rule x={IX + 292} y={HEADER_Y} w={IW - 310} color={WHITE_10} />
   </>
);

const Terminal = () => (
   <>
      <Panel x={IX} y={TERMINAL.y} w={IW} h={TERMINAL.h} rx={CARD_RX} />
      {[30, 54, 78].map((dx) => (
         <circle
            key={dx}
            cx={IX + dx}
            cy={TERMINAL.y + 28}
            r={7}
            fill={WHITE_22}
         />
      ))}
      <Pill bar={PROMPT} fill={WHITE_22} />
      <motion.g
         animate={{ scaleX: [0, 0, 1, 1, 0, 0] }}
         transition={loop(0, TYPE_AT, TYPE_AT + 0.6, RESET, RESET + 0.3, CYCLE)}
         style={{ originX: 0 }}
      >
         <Rule x={IX + 62} y={PROMPT_Y} w={300} color={WHITE_55} />
      </motion.g>
      <Rule x={IX + 30} y={PROMPT_Y + 32} w={210} color={WHITE_22} />
   </>
);

const Projects = () => (
   <>
      {PROJECT_XS.map((x, i) => (
         <g key={x}>
            <Panel
               x={x}
               y={PROJECTS.y}
               w={PROJECT_W}
               h={PROJECTS.h}
               rx={CARD_RX}
            />
            <Rule x={x + 24} y={PROJECTS.y + 38} w={170} color={WHITE_55} />
            <Rule
               x={x + 24}
               y={PROJECTS.y + 72}
               w={PROJECT_W - 90}
               color={WHITE_22}
            />
            <Rule
               x={x + 24}
               y={PROJECTS.y + 96}
               w={PROJECT_W - 170}
               color={WHITE_22}
            />
            <Pill bar={TAGS[i]} fill={WHITE_22} />
         </g>
      ))}
   </>
);

const Buttons = () => (
   <>
      {BUTTON_XS.map((x) => (
         <g key={x}>
            <Panel
               x={x}
               y={BUTTON_Y - BUTTON_H / 2}
               w={BUTTON_W}
               h={BUTTON_H}
               rx={BUTTON_H / 2}
               stroke={WHITE_14}
            />
            <circle cx={x + 30} cy={BUTTON_Y} r={10} fill={WHITE_22} />
            <Rule x={x + 54} y={BUTTON_Y} w={BUTTON_W - 84} color={WHITE_35} />
         </g>
      ))}
   </>
);

/* theme.accent arriving: every accent mark of the set lights in the tint. */
const AccentSet = ({ tint }: { tint: string }) => (
   <motion.g animate={{ opacity: [0, 0, 1, 1, 0, 0] }} transition={FADE}>
      {[NAME_BAR, HEADER_NUMBER, PROMPT, ...TAGS].map((bar) => (
         <Pill key={`${bar.x}:${bar.y}`} bar={bar} fill={tint} />
      ))}
      {BUTTON_XS.map((x) => (
         <circle key={x} cx={x + 30} cy={BUTTON_Y} r={10} fill={tint} />
      ))}
   </motion.g>
);

/* The trigger is a push, not a schedule: a commit node on its branch line. */
const PUSH_X = YAML.x + 44;
const PushGlyph = ({ tint }: { tint: string }) => (
   <>
      <path
         d={`M${PUSH_X} ${YAML_HEADER_Y - 24} L${PUSH_X} ${YAML_HEADER_Y - 10} M${PUSH_X} ${YAML_HEADER_Y + 10} L${PUSH_X} ${YAML_HEADER_Y + 24}`}
         fill="none"
         stroke={`${tint}8c`}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
      <circle
         cx={PUSH_X}
         cy={YAML_HEADER_Y}
         r={10}
         fill="none"
         stroke={tint}
         strokeWidth={1}
         vectorEffect={NON_SCALING}
      />
   </>
);

/* Landing order, top of the README down. */
const CARDS = [
   { id: "hero", Card: Hero },
   { id: "header", Card: Header },
   { id: "terminal", Card: Terminal },
   { id: "projects", Card: Projects },
   { id: "buttons", Card: Buttons },
];

const KitPipeline = ({ tint }: PipelineProps) => {
   const caption = `${tint}b3`;
   return (
      <>
         <SceneSvg>
            <Wire d={curve(...WIRE)} color={`${tint}40`} />
            <Panel {...YAML} />
            <PushGlyph tint={tint} />
            <Rule x={YAML.x + 64} y={YAML_HEADER_Y} w={100} color={WHITE_22} />
            <Yaml tint={tint} />
            <SwatchRing tint={tint} />
            <Panel {...FRAME} />
            {CARDS.map(({ id, Card }, i) => (
               <Drop key={id} index={i}>
                  <Card />
               </Drop>
            ))}
            <AccentSet tint={tint} />
         </SceneSvg>
         <Packet
            tint={tint}
            points={curvePoints(...WIRE, 5)}
            from={1.1}
            to={1.65}
         />
         <Pop
            x={YAML.x + YAML.w - 44}
            y={YAML_HEADER_Y}
            at={0.95}
            until={RESET}
         />
         <Label x={YAML.x} y={YAML.y - 40} text="PROFILE.YML" color={caption} />
         <Label
            x={YAML.x}
            y={YAML.y + YAML.h + 40}
            text="THEME.ACCENT"
            color={caption}
         />
      </>
   );
};

export default KitPipeline;
