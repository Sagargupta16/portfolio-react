import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

type TintProps = Pick<CoverSceneProps, "tint">;

/*
 * MCP server family.
 *   memory  -- SelfHub: CLAUDE stores a row into a MongoDB-backed memories
 *              panel, VSCODE searches it back, the row persists.
 *   bedrock -- Bedrock Multi-Model MCP: one prompt fans out to three model
 *              lanes that answer at different latencies.
 *   relay   -- default for the stateless proxies still routed here: three
 *              clients round-trip through one hub.
 * Geometry lives in a 16:10 SVG stage (320 x 200 units) so transform-only
 * travel keeps its proportions at 340 px and 165 px; labels and status dots
 * are HTML at percent positions. Every keyframe array ends where it starts.
 */

const GREEN = "#22c55e";
const WHITE_03 = "rgba(255,255,255,0.03)";
const WHITE_10 = "rgba(255,255,255,0.10)";
const WHITE_12 = "rgba(255,255,255,0.12)";
const WHITE_14 = "rgba(255,255,255,0.14)";
const WHITE_50 = "rgba(255,255,255,0.5)";
const WHITE_55 = "rgba(255,255,255,0.55)";
const NON_SCALING = "non-scaling-stroke";
const STAGE_W = 320;
const STAGE_H = 200;
const HUB_CX = 160;
const HUB_Y = 79;
const HUB_H = 42;
const HUB_CY = HUB_Y + HUB_H / 2;
const TILE_W = 56;
const TILE_H = 22;

type Ease = "easeInOut" | "linear";
type Align = "center" | "left";
/* [x1, y1, x2, y2] for connectors, [x, y, w, h] for panel boxes */
type Quad = [number, number, number, number];
/* [x, y, w, h, fill, rx, stroke?] */
type Rect = [number, number, number, number, string, number, string?];

/* One repeating timeline; keyframe arrays share `times` (fractions of duration). */
interface Loop {
   duration: number;
   times: number[];
   x?: number[];
   y?: number[];
   opacity?: number[];
   scale?: number[];
   scaleX?: number[];
   ease?: Ease;
   delay?: number;
}

type Beat = Omit<Loop, "duration">;

const EASE_IN_OUT: Ease = "easeInOut";
/* one easing per keyframe segment: Motion runs opacity through WAAPI, where a
   single easing spans the whole iteration, while transforms ease per segment
   on the frameloop; the array keeps both tracks on the same beats */
const perSegment = (times: number[], ease: Ease = EASE_IN_OUT): Ease[] =>
   times.slice(1).map(() => ease);

const loopProps = ({
   duration,
   times,
   ease = EASE_IN_OUT,
   delay,
   ...animate
}: Loop) => ({
   animate,
   transition: {
      duration,
      times,
      ease: perSegment(times, ease),
      delay,
      repeat: Infinity,
   },
});

const pct = (x: number) => `${(x / STAGE_W) * 100}%`;
const pctY = (y: number) => `${(y / STAGE_H) * 100}%`;

/* bordered panel from an [x, y, w, h] box */
const panel = (box: Quad, rx = 5): Rect => [...box, WHITE_03, rx, WHITE_12];
const tile = (cx: number, cy: number): Rect =>
   panel([cx - TILE_W / 2, cy - TILE_H / 2, TILE_W, TILE_H]);

const COVER: React.CSSProperties = { position: "absolute", inset: 0 };

const mono: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};

const STATUS_DOT: React.CSSProperties = {
   width: 3,
   height: 3,
   borderRadius: "50%",
   background: GREEN,
};

/* ---------- shared primitives ---------- */

interface Statics {
   lines?: Quad[];
   rects?: Rect[];
}

const Shapes = ({ lines = [], rects = [] }: Statics) => (
   <>
      {lines.map(([x1, y1, x2, y2]) => (
         <line
            key={`${x1},${y1},${x2},${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={WHITE_10}
            vectorEffect={NON_SCALING}
         />
      ))}
      {rects.map(([x, y, w, h, fill, rx, stroke]) => (
         <rect
            key={`${x},${y},${w}`}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={rx}
            fill={fill}
            stroke={stroke}
            vectorEffect={NON_SCALING}
         />
      ))}
   </>
);

interface DotProps extends TintProps {
   at: [number, number];
   loop: Loop;
}

/* Data in flight: a stage-unit circle moved with x / y transforms only. */
const Dot = ({ tint, at: [cx, cy], loop }: DotProps) => (
   <motion.circle cx={cx} cy={cy} r={2} fill={tint} {...loopProps(loop)} />
);

interface LabelSpec {
   x: number;
   y: number;
   text: string;
   align?: Align;
   tinted?: boolean;
   loop?: Loop;
}

/* HTML label centred on (or hanging left-aligned off) a stage coordinate. */
const Label = ({
   tint,
   x,
   y,
   text,
   align = "center",
   tinted,
   loop,
}: LabelSpec & TintProps) => {
   const style: React.CSSProperties = {
      ...mono,
      position: "absolute",
      left: pct(x),
      top: pctY(y),
      color: tinted ? `${tint}b3` : WHITE_55,
      transform:
         align === "left" ? "translateY(-50%)" : "translate(-50%, -50%)",
   };
   if (loop) {
      return (
         <motion.span style={style} {...loopProps(loop)}>
            {text}
         </motion.span>
      );
   }
   return <span style={style}>{text}</span>;
};

interface HubSpec {
   cx: number;
   w?: number;
   text?: string;
   pulse?: Loop;
}

const IDLE: Loop = { scale: [1, 1.04, 1], times: [0, 0.5, 1], duration: 3 };

const HUB_FACE: React.CSSProperties = {
   position: "absolute",
   top: pctY(HUB_CY),
   transform: "translate(-50%, -50%)",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   gap: 3,
};

/* SVG hub box; variants key the scale pulse to their own arrivals. */
const HubRect = ({
   tint,
   hub: { cx, w = 60, pulse = IDLE },
}: TintProps & { hub: HubSpec }) => (
   <motion.rect
      x={cx - w / 2}
      y={HUB_Y}
      width={w}
      height={HUB_H}
      rx={8}
      fill={`${tint}0a`}
      stroke={`${tint}55`}
      vectorEffect={NON_SCALING}
      {...loopProps(pulse)}
   />
);

/* HTML face of the hub: optional tool label over three live status dots. */
const HubFace = ({ tint, hub: { cx, text } }: TintProps & { hub: HubSpec }) => (
   <div style={{ ...HUB_FACE, left: pct(cx) }}>
      {text ? (
         <span style={{ ...mono, letterSpacing: 0.6, color: tint }}>
            {text}
         </span>
      ) : null}
      <div style={{ display: "flex", gap: 3 }}>
         {[0, 1, 2].map((i) => (
            <motion.span
               key={i}
               animate={{ opacity: [0.2, 1, 0.2] }}
               transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: [EASE_IN_OUT, EASE_IN_OUT],
               }}
               style={STATUS_DOT}
            />
         ))}
      </div>
   </div>
);

/* ---------- memory: SelfHub ---------- */

const MEMORY_CYCLE = 6;
const mem = (b: Beat): Loop => ({ ...b, duration: MEMORY_CYCLE });
const TILE_CY = 41;
const CLAUDE_CX = 56;
const VSCODE_CX = 264;
/* hairlines leave the tiles' bottom edge; the dots start there too */
const EXIT_Y = 52;
const CLAUDE_EXIT = 75;
const VSCODE_EXIT = 245;
const PANEL = { x: 96, y: 132, w: 128, h: 52 };
const HEADER_CY = PANEL.y + 8.5;
const ROW_TOPS = [148, 159, 170];
/* travel: exit -> hub centre -> the panel's top edge */
const TO_HUB_X = HUB_CX - CLAUDE_EXIT;
const TO_HUB_Y = HUB_CY - EXIT_Y;
const TO_PANEL_Y = PANEL.y - EXIT_Y;
/* search hit window: opens once the VSCODE dot reaches the panel */
const HIT_TIMES = [0, 0.683, 0.717, 0.767, 0.8, 1];

const MEMORY_HUB: HubSpec = {
   cx: HUB_CX,
   pulse: mem({
      scale: [1, 1, 1.05, 1, 1, 1.05, 1, 1],
      times: [0, 0.183, 0.21, 0.24, 0.633, 0.66, 0.69, 1],
   }),
};

const MEMORY_LINES: Quad[] = [
   [CLAUDE_EXIT, EXIT_Y, 130, 83],
   [VSCODE_EXIT, EXIT_Y, 190, 83],
   [HUB_CX, HUB_Y + HUB_H, HUB_CX, PANEL.y],
];

/* clients, the memories panel and its live store dot */
const MEMORY_RECTS: Rect[] = [
   tile(CLAUDE_CX, TILE_CY),
   tile(VSCODE_CX, TILE_CY),
   panel([PANEL.x, PANEL.y, PANEL.w, PANEL.h], 6),
   [102.5, HEADER_CY - 1.5, 3, 3, GREEN, 1.5],
];

/* store_memory: CLAUDE -> hub, hold, drop into the panel; nothing bounces back */
const STORE = mem({
   x: [0, 14, TO_HUB_X, TO_HUB_X, TO_HUB_X, TO_HUB_X, TO_HUB_X],
   y: [0, 8, TO_HUB_Y, TO_HUB_Y, 74, TO_PANEL_Y, TO_PANEL_Y],
   opacity: [0, 1, 1, 1, 1, 0, 0],
   times: [0, 0.03, 0.183, 0.208, 0.29, 0.317, 1],
});
/* search_memories: VSCODE -> hub -> panel hit, hold, back to hub, home */
const SEARCH = mem({
   x: [0, 0, -14, -TO_HUB_X, -TO_HUB_X, -TO_HUB_X, -TO_HUB_X, 0, 0],
   y: [0, 0, 8, TO_HUB_Y, TO_PANEL_Y, TO_PANEL_Y, TO_HUB_Y, 0, 0],
   opacity: [0, 0, 1, 1, 1, 1, 1, 0.3, 0],
   times: [0, 0.45, 0.48, 0.633, 0.683, 0.767, 0.833, 0.933, 1],
});
/* slot 3: appears after the store, brightens for the hit, resets at the end */
const FILL_ROW = mem({
   opacity: [0, 0, 0.55, 0.55, 1, 1, 0.55, 0.55, 0],
   y: [4, 4, 0, 0, 0, 0, 0, 0, 0],
   times: [0, 0.317, 0.36, 0.683, 0.717, 0.767, 0.8, 0.967, 1],
});
/* slots 1-2 dim while the hit is highlighted */
const DIM = mem({
   opacity: [0.55, 0.55, 0.35, 0.35, 0.55, 0.55],
   times: HIT_TIMES,
});
const HIT = mem({ opacity: [0, 0, 1, 1, 0, 0], times: HIT_TIMES });
const STORE_LABEL = mem({
   opacity: [0, 0, 0.8, 0.8, 0, 0],
   times: [0, 0.03, 0.08, 0.3, 0.35, 1],
});

const MEMORY_LABELS: LabelSpec[] = [
   { x: CLAUDE_CX, y: TILE_CY, text: "CLAUDE" },
   { x: VSCODE_CX, y: TILE_CY, text: "VSCODE" },
   { x: HUB_CX, y: HEADER_CY, text: "MONGODB", tinted: true },
   { x: 28, y: 68, text: "STORE_MEMORY", align: "left", loop: STORE_LABEL },
];

/* one memories row: tint bar, content bar, id stub */
const rowRects = (tint: string, top: number, width: number): Rect[] => [
   [102, top, 2, 8, tint, 1],
   [107, top + 2.5, width, 3, WHITE_14, 1.5],
   [204, top + 2.5, 14, 3, WHITE_10, 1.5],
];

/* search hit: row highlight plus a relevance chip at its right edge */
const hitRects = (tint: string): Rect[] => [
   [99, 168, 122, 12, `${tint}22`, 3, `${tint}66`],
   [209, 171.5, 10, 5, tint, 2.5],
];

const MemoryStage = ({ tint }: TintProps) => (
   <>
      <Shapes lines={MEMORY_LINES} rects={MEMORY_RECTS} />
      <motion.g {...loopProps(DIM)}>
         <Shapes
            rects={[
               ...rowRects(tint, ROW_TOPS[0], 66),
               ...rowRects(tint, ROW_TOPS[1], 49),
            ]}
         />
      </motion.g>
      <motion.g {...loopProps(FILL_ROW)}>
         <Shapes rects={rowRects(tint, ROW_TOPS[2], 57)} />
      </motion.g>
      <motion.g {...loopProps(HIT)}>
         <Shapes rects={hitRects(tint)} />
      </motion.g>
      <Dot tint={tint} at={[CLAUDE_EXIT, EXIT_Y]} loop={STORE} />
      <Dot tint={tint} at={[VSCODE_EXIT, EXIT_Y]} loop={SEARCH} />
   </>
);

/* ---------- bedrock: Bedrock Multi-Model MCP ---------- */

const BEDROCK_CYCLE = 5.4;
const bed = (b: Beat): Loop => ({ ...b, duration: BEDROCK_CYCLE });
const B_HUB_CX = 128;
const B_HUB_W = 76;
const B_HUB_LEFT = B_HUB_CX - B_HUB_W / 2;
const B_HUB_RIGHT = B_HUB_CX + B_HUB_W / 2;
const PROMPT_RIGHT = 46;
const LANE_X = 205;
const LANE_W = 102;
const LANE_H = 22;
const TRACK_X = LANE_X + 6;
/* travel derived from the same anchors the hairlines use */
const TO_B_HUB = B_HUB_CX - PROMPT_RIGHT;
const TO_PROMPT = B_HUB_LEFT - PROMPT_RIGHT;
const HOLD_END = 0.9;

interface LaneSpec {
   name: string;
   top: number;
   done: number;
}

/* latency tracks end at 1.9 / 2.5 / 3.4 s of the 5.4 s cycle */
const LANES: LaneSpec[] = [
   { name: "LLAMA4", top: 33, done: 0.35 },
   { name: "NOVA PRO", top: 89, done: 0.46 },
   { name: "DEEPSEEK", top: 145, done: 0.63 },
];

const BEDROCK_HUB: HubSpec = {
   cx: B_HUB_CX,
   w: B_HUB_W,
   text: "COMPARE",
   pulse: bed({ scale: [1, 1, 1.06, 1, 1], times: [0, 0.13, 0.16, 0.19, 1] }),
};

const BEDROCK_LABELS: LabelSpec[] = LANES.map((l) => ({
   x: TRACK_X,
   y: l.top + 8,
   text: l.name,
   align: "left",
}));

const BEDROCK_LINES: Quad[] = [
   [PROMPT_RIGHT, HUB_CY, B_HUB_LEFT, HUB_CY],
   ...LANES.map((l): Quad => [B_HUB_RIGHT, HUB_CY, LANE_X, l.top + LANE_H / 2]),
];

/* prompt tile with its cursor bar, three model lanes */
const BEDROCK_RECTS: Rect[] = [
   panel([16, 89, 30, 22]),
   [35, 95.5, 1, 9, WHITE_50, 0.5],
   ...LANES.map((l) => panel([LANE_X, l.top, LANE_W, LANE_H])),
];

/* prompt -> hub, fades on arrival */
const REQUEST = bed({
   x: [0, 12, TO_B_HUB, TO_B_HUB, TO_B_HUB],
   opacity: [0, 1, 1, 0, 0],
   times: [0, 0.03, 0.13, 0.185, 1],
});
/* merged result -> client once the slowest lane is done */
const RESPONSE = bed({
   x: [0, 0, -6, 6 - TO_PROMPT, -TO_PROMPT, -TO_PROMPT],
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.63, 0.65, 0.76, 0.78, 1],
});
/* lit wash once the model has answered; its track fills linearly until then */
const lit = (done: number) =>
   bed({
      opacity: [0, 0, 1, 1, 0, 0],
      times: [0, done - 0.02, done, HOLD_END, 0.95, 1],
   });
const track = (done: number) =>
   bed({
      scaleX: [0, 0, 1, 1, 1, 0],
      opacity: [1, 1, 1, 1, 0, 0],
      times: [0, 0.19, done, HOLD_END, 0.93, 1],
      ease: "linear",
   });

const LaneRow = ({ tint, top, done }: LaneSpec & TintProps) => (
   <>
      <motion.g {...loopProps(lit(done))}>
         <Shapes rects={[[LANE_X, top, LANE_W, LANE_H, `${tint}14`, 5]]} />
      </motion.g>
      <motion.rect
         x={TRACK_X}
         y={top + 15}
         width={LANE_W - 12}
         height={2}
         rx={1}
         fill={`${tint}cc`}
         style={{ originX: 0 }}
         {...loopProps(track(done))}
      />
   </>
);

const BedrockStage = ({ tint }: TintProps) => (
   <>
      <Shapes lines={BEDROCK_LINES} rects={BEDROCK_RECTS} />
      {/* prompt caret */}
      <path
         d="M26,95.5 L30.5,100 L26,104.5"
         stroke={tint}
         strokeWidth={1.5}
         fill="none"
         vectorEffect={NON_SCALING}
      />
      {LANES.map((lane) => (
         <LaneRow key={lane.name} tint={tint} {...lane} />
      ))}
      <Dot tint={tint} at={[PROMPT_RIGHT, HUB_CY]} loop={REQUEST} />
      <Dot tint={tint} at={[B_HUB_LEFT, HUB_CY]} loop={RESPONSE} />
   </>
);

/* ---------- relay: default for stateless proxies ---------- */

interface RelayClient {
   name: string;
   cx: number;
   cy: number;
   exit: [number, number];
   enter: [number, number];
}

/* hairlines run from a tile edge to a hub edge; dots start at the exit */
const RELAY_CLIENTS: RelayClient[] = [
   { name: "CLAUDE", cx: 56, cy: 50, exit: [79, 61], enter: [130, 86] },
   { name: "IDE", cx: 56, cy: 150, exit: [79, 139], enter: [130, 114] },
   { name: "CLI", cx: 264, cy: 100, exit: [236, 100], enter: [190, 100] },
];

const RELAY_HUB: HubSpec = { cx: HUB_CX, text: "MCP" };
const RELAY_LABELS: LabelSpec[] = RELAY_CLIENTS.map((c) => ({
   x: c.cx,
   y: c.cy,
   text: c.name,
}));
const RELAY_LINES: Quad[] = RELAY_CLIENTS.map((c): Quad => [
   ...c.exit,
   ...c.enter,
]);
const RELAY_RECTS: Rect[] = RELAY_CLIENTS.map((c) => tile(c.cx, c.cy));

/* request in, response back, staggered per client */
const relay = ([x, y]: [number, number], i: number): Loop => ({
   x: [0, HUB_CX - x, HUB_CX - x, 0],
   y: [0, HUB_CY - y, HUB_CY - y, 0],
   opacity: [0, 1, 0.3, 0],
   times: [0, 0.45, 0.55, 1],
   duration: 3.6,
   delay: i * 0.9,
});

const RelayStage = ({ tint }: TintProps) => (
   <>
      <Shapes lines={RELAY_LINES} rects={RELAY_RECTS} />
      {RELAY_CLIENTS.map((c, i) => (
         <Dot key={c.name} tint={tint} at={c.exit} loop={relay(c.exit, i)} />
      ))}
   </>
);

/* ---------- dispatch ---------- */

interface VariantSpec {
   hub: HubSpec;
   labels: LabelSpec[];
   Stage: React.ComponentType<TintProps>;
}

const RELAY: VariantSpec = {
   hub: RELAY_HUB,
   labels: RELAY_LABELS,
   Stage: RelayStage,
};

const VARIANTS: Record<string, VariantSpec> = {
   memory: { hub: MEMORY_HUB, labels: MEMORY_LABELS, Stage: MemoryStage },
   bedrock: { hub: BEDROCK_HUB, labels: BEDROCK_LABELS, Stage: BedrockStage },
};

/* Unknown or missing variant falls back to the relay, so a stale registry
   entry never degrades to an idle box. The glow sits under the hub. */
const McpScene = ({ tint, variant }: CoverSceneProps) => {
   const { hub, labels, Stage } = VARIANTS[variant ?? ""] ?? RELAY;
   const glow = `${pct(hub.cx)} 50%`;
   return (
      <div
         aria-hidden="true"
         style={{
            ...COVER,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         <div
            style={{
               ...COVER,
               background: `radial-gradient(ellipse at ${glow}, ${tint}14, transparent 62%)`,
            }}
         />
         <svg
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            preserveAspectRatio="none"
            style={{ ...COVER, width: "100%", height: "100%" }}
         >
            <HubRect tint={tint} hub={hub} />
            <Stage tint={tint} />
         </svg>
         {labels.map((l) => (
            <Label key={l.text} tint={tint} {...l} />
         ))}
         <HubFace tint={tint} hub={hub} />
      </div>
   );
};

export default McpScene;
