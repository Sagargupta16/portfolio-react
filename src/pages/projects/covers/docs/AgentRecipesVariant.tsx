import { motion } from "motion/react";
import {
   FILL,
   GREEN,
   W03,
   W10,
   W18,
   W30,
   W50,
   cubicD,
   hair,
   loop,
   pin,
   rect,
   sCurve,
   windowKeys,
   windowTimes,
   type Leg,
   type Pt,
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
 * Agent Recipes: every recipe is one markdown file with fixed sections. The
 * fenced block under `## The Prompt` lights and is extracted on its own
 * (extract-prompt.sh) while When to Use and the worked Example dim, because
 * piping the example in would poison the instructions. The prompt then fans
 * out to any assistant: Claude Code, Cursor, Aider each pick it up and go
 * green.
 *
 * Animated nodes (9): fence highlight, sections dimming, extract packet,
 * three fan-out packets, three agent marks.
 */

const CYCLE = 5.4;
const HOLD = 0.86;

/* Recipe file, left. */
const DOC = { x: 12, y: 8, w: 58, h: 78 };
const TEXT_X = 17;
const FENCE = { x: 16, y: 40, w: 50, h: 24 };
const FENCE_RIGHT = FENCE.x + FENCE.w;
const FENCE_MID = FENCE.y + FENCE.h / 2;
const PROMPT_LINES = [
   { y: 47, w: 30 },
   { y: 52, w: 37 },
   { y: 57, w: 22 },
];
const LIGHT_AT = 0.08;
const DIM_AT = 0.14;

/* Fan-out to the assistants, right. */
const JUNCTION: Pt = { x: 82, y: 50 };
const AGENT_X = 102;
const PILL_W = 68;
const PILL_H = 18;
const AGENT_RING = 6;
/* Ring centre inside the pill: border 1 + padding 7 + half the ring. */
const RING_OFFSET = 1 + 7 + AGENT_RING / 2;
const AGENTS = [
   { y: 24, name: "CLAUDE" },
   { y: 50, name: "CURSOR" },
   { y: 76, name: "AIDER" },
];
const EXTRACT_LEG: Leg = {
   curve: sCurve({ x: FENCE_RIGHT, y: FENCE_MID }, JUNCTION),
   from: 0.18,
   to: 0.3,
};
const FAN_FROM = EXTRACT_LEG.to + 0.02;
const FAN_STAGGER = 0.04;
const FAN_TIME = 0.16;
const fanLeg = (y: number, i: number): Leg => ({
   curve: sCurve(JUNCTION, { x: AGENT_X, y }, 0.6),
   from: FAN_FROM + i * FAN_STAGGER,
   to: FAN_FROM + i * FAN_STAGGER + FAN_TIME,
});
const FAN_LEGS = AGENTS.map((a, i) => fanLeg(a.y, i));

/* When to Use (above the prompt) and Example (below), the parts that are
   not extracted. */
const Context = () => (
   <>
      <Bar x={TEXT_X} y={16} w={18} color={W30} />
      <Bar x={TEXT_X} y={22} w={40} color={W10} />
      <Bar x={TEXT_X} y={27} w={32} color={W10} />
      <Bar x={TEXT_X} y={71} w={14} color={W30} />
      <Bar x={TEXT_X} y={77} w={40} color={W10} />
      <Bar x={TEXT_X} y={82} w={28} color={W10} />
   </>
);

const RecipeFile = ({ tint }: { tint: string }) => (
   <>
      <Panel x={DOC.x} y={DOC.y} w={DOC.w} h={DOC.h} />
      <motion.div
         animate={{ opacity: windowKeys(1, 0.3) }}
         transition={loop(CYCLE, windowTimes(DIM_AT, HOLD, 0.08))}
         style={FILL}
      >
         <Context />
      </motion.div>
      <Label x={TEXT_X} y={35} text="THE PROMPT" color={`${tint}e6`} size={8} />
      <div
         style={{
            ...rect(FENCE.x, FENCE.y, FENCE.w, FENCE.h),
            borderRadius: 6,
            border: `1px solid ${W18}`,
         }}
      />
      {PROMPT_LINES.map((l) => (
         <Bar key={l.y} x={FENCE.x + 4} y={l.y} w={l.w} color={`${tint}88`} />
      ))}
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: windowKeys(0, 1) }}
         transition={loop(CYCLE, windowTimes(LIGHT_AT, HOLD, 0.06))}
         style={{
            ...rect(FENCE.x, FENCE.y, FENCE.w, FENCE.h),
            borderRadius: 6,
            border: `1px solid ${tint}`,
            background: `${tint}0f`,
         }}
      />
   </>
);

const AgentPill = ({ y, name }: { y: number; name: string }) => (
   <div
      style={{
         ...pin(AGENT_X, y),
         marginTop: -PILL_H / 2,
         height: PILL_H,
         width: PILL_W,
         padding: "0 7px",
         boxSizing: "border-box",
         display: "flex",
         alignItems: "center",
         gap: 6,
         borderRadius: PILL_H / 2,
         border: `1px solid ${W10}`,
         background: W03,
      }}
   >
      <span
         style={{
            width: AGENT_RING,
            height: AGENT_RING,
            boxSizing: "border-box",
            borderRadius: "50%",
            border: `1px solid ${W30}`,
            flex: "none",
         }}
      />
      <Text text={name} color={W50} />
   </div>
);

const AgentRecipesVariant = ({ tint }: { tint: string }) => (
   <SceneRoot tint={tint} focus="64% 50%" lattice="crosses">
      <RecipeFile tint={tint} />
      <Wires>
         <path d={cubicD(EXTRACT_LEG.curve)} {...hair(W10)} />
         {FAN_LEGS.map((leg) => (
            <path key={leg.from} d={cubicD(leg.curve)} {...hair(W10)} />
         ))}
      </Wires>
      <Dot x={JUNCTION.x} y={JUNCTION.y} color={W30} size={5} />
      {AGENTS.map((a) => (
         <AgentPill key={a.name} y={a.y} name={a.name} />
      ))}
      <Packet tint={tint} legs={[EXTRACT_LEG]} cycle={CYCLE} />
      {FAN_LEGS.map((leg) => (
         <Packet key={leg.from} tint={tint} legs={[leg]} cycle={CYCLE} />
      ))}
      {FAN_LEGS.map((leg, i) => (
         <Pop
            key={AGENTS[i].name}
            x={AGENT_X}
            y={AGENTS[i].y}
            cycle={CYCLE}
            on={leg.to}
            off={HOLD}
            size={AGENT_RING}
            style={{
               marginLeft: RING_OFFSET - AGENT_RING / 2,
               borderRadius: "50%",
               background: GREEN,
            }}
         />
      ))}
   </SceneRoot>
);

export default AgentRecipesVariant;
