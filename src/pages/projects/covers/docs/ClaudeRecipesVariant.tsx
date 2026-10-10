import { motion } from "motion/react";
import {
   EASE,
   GREEN,
   LINEAR,
   SOLID_FILL,
   W10,
   W18,
   W30,
   W50,
   cubicD,
   drawStroke,
   hair,
   loop,
   pin,
   rect,
   type Cubic,
   type Leg,
} from "./kit";
import {
   Bar,
   Dot,
   Label,
   Packet,
   Panel,
   Pop,
   SceneRoot,
   Text,
   Wires,
} from "./primitives";

/*
 * Claude Code Recipes: a command recipe (frontmatter `model: sonnet`) is
 * copied out of the catalog, hops into the project's `.claude/` tree and
 * lands in `commands/`, the leaf lights, then `/refactor` is typed over its
 * own ghost at the prompt and runs. One file in, one slash command out.
 *
 * Animated nodes (7): card flash, copy arc draw, file packet, leaf mark,
 * prompt cover, caret, run dot.
 */

const CYCLE = 5.6;
const HOLD = 0.86;

/* Recipe card, left. */
const CARD = { x: 13, y: 10, w: 52, h: 74 };
const CARD_RIGHT = CARD.x + CARD.w;
const KEY_X = 19;
const CARD_HEADER_Y = 20;
const BODY = [
   { y: 56, w: 36 },
   { y: 63, w: 40 },
   { y: 70, w: 28 },
   { y: 77, w: 34 },
];

/* `.claude/` tree, right. */
const ROOT_Y = 13;
const TRUNK_X = 99;
const LEAF_X = 105;
const LEAF_RING_X = LEAF_X + 3;
const LEAVES = [
   { y: 27, bar: 0 },
   { y: 38, bar: 16 },
   { y: 49, bar: 12 },
];
const TREE_D = [
   `M ${TRUNK_X} ${ROOT_Y + 5} V ${LEAVES[2].y}`,
   ...LEAVES.map((l) => `M ${TRUNK_X} ${l.y} H ${LEAF_X}`),
].join(" ");

/* The copy arc: a hop out of the card that levels off into commands/,
   crossing the trunk at the leaf, clear of the root label. */
const COPY_ARC: Cubic = [
   { x: CARD_RIGHT + 1, y: 36 },
   { x: 77, y: 12 },
   { x: 90, y: LEAVES[0].y },
   { x: LEAF_X, y: LEAVES[0].y },
];
const COPY_AT = 0.14;
const LAND_AT = 0.42;
const COPY_LEG: Leg = { curve: COPY_ARC, from: COPY_AT + 0.02, to: LAND_AT };

/* Prompt, bottom right. */
const PROMPT = { x: 74, y: 62, w: 73, h: 18 };
const PROMPT_Y = PROMPT.y + PROMPT.h / 2;
const CHEVRON_X = PROMPT.x + 4;
const TYPE_FROM = 0.5;
const TYPE_TO = 0.64;
const RUN_AT = 0.7;

const COVER_TIMES = [0, TYPE_FROM, TYPE_TO, HOLD, HOLD + 0.04, 1];
const COVER_EASE = [EASE, LINEAR, EASE, EASE, EASE];
const COMMAND = "/REFACTOR";

const RecipeCard = ({ tint }: { tint: string }) => (
   <>
      <Panel x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} />
      <Wires>
         <path
            d={`M ${CARD.x} ${CARD_HEADER_Y} H ${CARD_RIGHT}`}
            {...hair(W10)}
         />
      </Wires>
      <Dot x={KEY_X} y={15} color={W30} size={4} />
      <Dot x={KEY_X + 4} y={15} color={W18} size={4} />
      <Bar x={KEY_X} y={26} w={9} color={W30} />
      <Bar x={KEY_X} y={33} w={8} color={`${tint}88`} />
      <Label x={KEY_X + 11} y={33} text="SONNET" color={`${tint}e6`} size={8} />
      <Bar x={KEY_X} y={41} w={14} color={`${tint}88`} />
      <Bar x={KEY_X + 17} y={41} w={22} color={W30} />
      <Bar x={KEY_X} y={48} w={9} color={W30} />
      {BODY.map((b) => (
         <Bar key={b.y} x={KEY_X} y={b.y} w={b.w} color={W10} />
      ))}
   </>
);

/* The card brightens as its copy leaves (the `cp`). */
const CardFlash = ({ tint }: { tint: string }) => (
   <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1, 0.3, 0, 0] }}
      transition={loop(CYCLE, [0, COPY_AT - 0.04, COPY_AT, 0.3, 0.38, 1])}
      style={{
         ...rect(CARD.x, CARD.y, CARD.w, CARD.h),
         borderRadius: 7,
         border: `1px solid ${tint}99`,
      }}
   />
);

/* A file glyph rides the arc in place of the default dot. */
const FileGlyph = ({ tint }: { tint: string }) => (
   <span
      style={{
         position: "absolute",
         width: 9,
         height: 12,
         margin: "-6px -4.5px",
         borderRadius: 2,
         border: `1px solid ${tint}`,
         background: `${tint}33`,
      }}
   />
);

const ClaudeTree = ({ tint }: { tint: string }) => (
   <>
      <Wires>
         <path d={TREE_D} {...hair(W18)} />
         <path d={cubicD(COPY_ARC)} {...hair(W10)} />
         <motion.path
            d={cubicD(COPY_ARC)}
            {...drawStroke(`${tint}aa`)}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
               pathLength: [0, 0, 1, 1, 1, 0],
               opacity: [0, 1, 1, 1, 0, 0],
            }}
            transition={loop(CYCLE, [0, COPY_LEG.from, LAND_AT, 0.5, 0.58, 1])}
         />
      </Wires>
      <div
         style={{
            ...pin(TRUNK_X, ROOT_Y),
            marginTop: -5,
            marginLeft: -4.5,
            height: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
         }}
      >
         <span
            style={{
               width: 9,
               height: 7,
               borderRadius: 1.5,
               border: `1px solid ${tint}aa`,
               flex: "none",
            }}
         />
         <Text text=".CLAUDE/" color={`${tint}e6`} />
      </div>
      {LEAVES.map((leaf) => (
         <Dot
            key={leaf.y}
            x={LEAF_RING_X}
            y={leaf.y}
            color={W30}
            size={6}
            ring
         />
      ))}
      <Label
         x={LEAF_RING_X + 5}
         y={LEAVES[0].y}
         text="COMMANDS"
         color={W50}
         size={8}
      />
      {LEAVES.slice(1).map((leaf) => (
         <Bar
            key={leaf.y}
            x={LEAF_RING_X + 5}
            y={leaf.y}
            w={leaf.bar}
            color={W18}
         />
      ))}
      <Pop
         x={LEAF_RING_X}
         y={LEAVES[0].y}
         cycle={CYCLE}
         on={LAND_AT}
         off={HOLD}
         size={6}
         style={{ borderRadius: "50%", background: GREEN }}
      />
   </>
);

/* `> /refactor`: the command rests as a dim ghost; a cover in the panel's
   own fill hides the bright copy and slides off it, typing it over the
   ghost. */
const Prompt = ({ tint }: { tint: string }) => (
   <>
      <Panel
         x={PROMPT.x}
         y={PROMPT.y}
         w={PROMPT.w}
         h={PROMPT.h}
         solid
         radius={8}
      />
      <Wires>
         <path
            d={`M ${CHEVRON_X} ${PROMPT_Y - 2.5} L ${CHEVRON_X + 3} ${PROMPT_Y} L ${CHEVRON_X} ${PROMPT_Y + 2.5}`}
            {...hair(W50)}
         />
      </Wires>
      <div
         style={{
            ...pin(CHEVRON_X + 6, PROMPT_Y),
            marginTop: -5,
            height: 10,
            display: "flex",
            alignItems: "center",
            gap: 3,
         }}
      >
         <span style={{ position: "relative", display: "flex" }}>
            <Text text={COMMAND} color={tint} />
            <motion.span
               initial={{ scaleX: 1 }}
               animate={{ scaleX: [1, 1, 0, 0, 1, 1] }}
               transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  times: COVER_TIMES,
                  ease: COVER_EASE,
               }}
               style={{
                  position: "absolute",
                  inset: -1,
                  background: SOLID_FILL,
                  transformOrigin: "100% 50%",
               }}
            />
            <span style={{ position: "absolute", left: 0, top: 0 }}>
               <Text text={COMMAND} color={`${tint}55`} />
            </span>
         </span>
         <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{
               duration: 1,
               repeat: Infinity,
               times: [0, 0.5, 1],
               ease: [LINEAR, LINEAR],
            }}
            style={{ width: 5, height: 9, background: W50 }}
         />
      </div>
      <Pop
         x={PROMPT.x + PROMPT.w - 6}
         y={PROMPT_Y}
         cycle={CYCLE}
         on={RUN_AT}
         off={HOLD}
         size={6}
         style={{ borderRadius: "50%", background: GREEN }}
      />
   </>
);

const ClaudeRecipesVariant = ({ tint }: { tint: string }) => (
   <SceneRoot tint={tint} focus="72% 30%" lattice="dots">
      <RecipeCard tint={tint} />
      <CardFlash tint={tint} />
      <ClaudeTree tint={tint} />
      <Packet tint={tint} legs={[COPY_LEG]} cycle={CYCLE}>
         <FileGlyph tint={tint} />
      </Packet>
      <Prompt tint={tint} />
   </SceneRoot>
);

export default ClaudeRecipesVariant;
