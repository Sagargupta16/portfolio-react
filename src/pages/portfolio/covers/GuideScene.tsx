import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * Deploy Guide: a Markdown walkthrough (FASTAPI.MD) whose numbered steps tick
 * green while the README decision tree routes the reader to a platform. A dot
 * leaves the card along the trunk, pauses at the junction while the other
 * branches flicker, picks RENDER, and the app comes up live behind a padlocked
 * URL. Everything then settles back so the loop restarts without a jump.
 *
 * Geometry (card, bars, hairlines, pills, URL bar, dot) sits in a 320 x 200
 * SVG viewBox that scales with the 16:10 slot. Anything that must hold a fixed
 * pixel size on a 165 px phone card (labels, chrome and status dots, step
 * rings and ticks) is HTML pinned to the same coordinates as percentages.
 */

const CYCLE = 6;
const EASE = "easeInOut";
const GREEN = "#22c55e";
const GREEN_FILL = `${GREEN}18`;
const NONE = "none";
const WHITE_03 = "rgba(255,255,255,0.03)";
const WHITE_10 = "rgba(255,255,255,0.10)";
const WHITE_14 = "rgba(255,255,255,0.14)";
const WHITE_25 = "rgba(255,255,255,0.25)";
const WHITE_50 = "rgba(255,255,255,0.5)";
const WHITE_55 = "rgba(255,255,255,0.55)";

interface GuideConfig {
   file: string;
   /** Top / middle / bottom branch. The middle one is the recommendation. */
   branches: readonly [string, string, string];
}

const DEFAULT_VARIANT = "default";
const DEFAULT_GUIDE: GuideConfig = {
   file: "FASTAPI.MD",
   branches: ["VERCEL", "RENDER", "PAGES"],
};

/** Keyed by variant so a future tutorial or walkthrough repo can join. */
const GUIDE_VARIANTS: Record<string, GuideConfig> = {
   [DEFAULT_VARIANT]: DEFAULT_GUIDE,
};

/* viewBox units -> slot percentages, so HTML pins land on the SVG geometry. */
const VIEW = { w: 320, h: 200 };
const xPct = (x: number) => `${(x / VIEW.w) * 100}%`;
const yPct = (y: number) => `${(y / VIEW.h) * 100}%`;
const pin = (x: number, y: number): CSSProperties => ({
   left: xPct(x),
   top: yPct(y),
});

/* Guide card, left third of the slot. */
const CARD = { x: 19, y: 32, width: 96, height: 136, rx: 6 };
const HEADER_H = 14;
const CARD_RIGHT = CARD.x + CARD.width;
const HEADER_CY = CARD.y + HEADER_H / 2;
const CHROME_DOTS = [
   { x: CARD.x + 7, color: WHITE_25 },
   { x: CARD.x + 13, color: WHITE_14 },
];
const STEP_CX = 31;
const STEP_PX = 7;
const BAR_X = 40;
interface StepSpec {
   y: number;
   bar: number;
   /** When the step ticks, as a fraction of the cycle. */
   tickAt: number;
}
const STEP_ROWS: StepSpec[] = [
   { y: 66, bar: 48, tickAt: 0.12 },
   { y: 92, bar: 35, tickAt: 0.2 },
   { y: 118, bar: 53, tickAt: 0.3 },
   { y: 144, bar: 27, tickAt: 0.45 },
];

/* Decision tree, right two-thirds. */
const TRUNK_Y = 100;
const JUNCTION_X = 179;
const ELBOW_X = 218;
const PILL = { x: 251, w: 50, h: 20 };
const PILL_CY = [44, 100, 156];
const STATUS_CX = PILL.x + 13;
const LABEL_X = PILL.x + 18;
const URL_BAR = { w: 56, h: 10, gap: 10 };
const FLICKER_STAGGER = 0.3;

/* 1 px stroke pinned to device pixels; panels and hairlines use this. */
const hairline = (color: string) => ({
   stroke: color,
   strokeWidth: 1,
   fill: NONE,
   vectorEffect: "non-scaling-stroke" as const,
});
/* Glyph stroke that scales with its geometry so the shape survives phones. */
const glyph = (color: string, width: number) => ({
   stroke: color,
   strokeWidth: width,
   strokeLinecap: "round" as const,
   strokeLinejoin: "round" as const,
   fill: NONE,
});

/* Fixed-px HTML pins. Negative margins centre each on its viewBox point so
   Motion keeps sole ownership of `transform` on the animated ones. */
const ABS: CSSProperties = { position: "absolute" };
const LABEL: CSSProperties = {
   ...ABS,
   marginTop: -3.5,
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 0.6,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};
const DOT3: CSSProperties = {
   ...ABS,
   width: 3,
   height: 3,
   marginLeft: -1.5,
   marginTop: -1.5,
   borderRadius: "50%",
};
const STEP_BOX: CSSProperties = {
   ...ABS,
   width: STEP_PX,
   height: STEP_PX,
   marginLeft: -STEP_PX / 2,
   marginTop: -STEP_PX / 2,
   borderRadius: "50%",
};
/* Check inside a 7 x 7 box: centre (3.5, 3.5), ring r 3, glyph within r 2.4. */
const TICK_D = "M2 3.6 L3.1 4.7 L5 2.6";

const loop = (times: number[], ease: "linear" | "easeInOut" = EASE) => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease,
});

/* Dot: fade in at the card edge, run the trunk, hold, take the middle branch. */
const DOT_TIMES = [0, 0.067, 0.267, 0.367, 0.5, 0.533, 0.56, 1];
const DOT_X = [0, 0, 64, 64, 134, 149, 0, 0];
const DOT_OPACITY = [0, 1, 1, 1, 1, 0, 0, 0];

/* Two blinks on the rejected branches while the dot sits at the junction. */
const FLICKER_TIMES = [0, 0.267, 0.29, 0.31, 0.335, 0.36, 1];
const FLICKER_OPACITY = [0.18, 0.18, 0.5, 0.18, 0.5, 0.18, 0.18];

/* Chosen pill lights when the dot arrives, releases in the last beat. */
const HIGHLIGHT_TIMES = [0, 0.5, 0.55, 0.8, 0.9, 1];
const HIGHLIGHT_OPACITY = [0, 0, 1, 1, 0, 0];
const STATUS_TIMES = [0, 0.5, 0.55, 0.6, 0.8, 0.9, 1];
const STATUS_OPACITY = [0, 0, 1, 1, 1, 0, 0];
const STATUS_SCALE = [0.8, 0.8, 1.3, 1, 1, 0.8, 0.8];

/* Step tick pops on its beat and releases with everything else. */
const TICK_OPACITY = [0, 0, 1, 1, 0, 0];
const TICK_SCALE = [0.6, 0.6, 1, 1, 0.6, 0.6];

/* URL bar slides up under the pill, the green tick pops, both release. */
const URL_TIMES = [0, 0.55, 0.62, 0.8, 0.9, 1];
const URL_OPACITY = [0, 0, 1, 1, 0, 0];
const URL_Y = [6, 6, 0, 0, 6, 6];
const URL_TICK_TIMES = [0, 0.62, 0.68, 0.8, 0.9, 1];
const URL_TICK_SCALE = [0.5, 0.5, 1, 1, 0.5, 0.5];

const branchPath = (cy: number): string => {
   if (cy === TRUNK_Y) return `M ${JUNCTION_X} ${TRUNK_Y} H ${PILL.x}`;
   return `M ${JUNCTION_X} ${TRUNK_Y} H ${ELBOW_X} V ${cy} H ${PILL.x}`;
};

const tickPath = (cx: number, cy: number): string =>
   `M ${cx - 2.1} ${cy + 0.1} L ${cx - 0.6} ${cy + 1.6} L ${cx + 2.2} ${cy - 1.5}`;

const pillRect = (cy: number) => ({
   x: PILL.x,
   y: cy - PILL.h / 2,
   width: PILL.w,
   height: PILL.h,
   rx: PILL.h / 2,
});

const barRect = (y: number, width: number) => ({
   x: BAR_X,
   y: y - 1,
   width,
   height: 2,
   rx: 1,
   fill: WHITE_14,
});

/* ---------- SVG layer: geometry that scales with the slot ---------- */

/* The guide document: bordered card, header rule, four hairline step bars. */
const GuideCard = () => (
   <>
      <rect {...CARD} {...hairline(WHITE_10)} fill={WHITE_03} />
      <path
         d={`M ${CARD.x} ${CARD.y + HEADER_H} H ${CARD_RIGHT}`}
         {...hairline(WHITE_10)}
      />
      {STEP_ROWS.map(({ y, bar }) => (
         <rect key={y} {...barRect(y, bar)} />
      ))}
   </>
);

/* A platform the decision tree considers and passes over. */
const FlickerBranch = ({ cy, delay }: { cy: number; delay: number }) => (
   <motion.g
      initial={{ opacity: FLICKER_OPACITY[0] }}
      animate={{ opacity: FLICKER_OPACITY }}
      transition={{ ...loop(FLICKER_TIMES), delay }}
   >
      <path d={branchPath(cy)} {...hairline(WHITE_55)} />
      <rect {...pillRect(cy)} {...hairline(WHITE_55)} fill={WHITE_14} />
   </motion.g>
);

/* The recommended platform: lights in the tint when the dot arrives. */
const ChosenBranch = ({ cy, tint }: { cy: number; tint: string }) => (
   <>
      <path d={branchPath(cy)} {...hairline(WHITE_10)} />
      <rect {...pillRect(cy)} {...hairline(WHITE_10)} fill={WHITE_03} />
      <motion.rect
         {...pillRect(cy)}
         {...hairline(`${tint}80`)}
         fill={`${tint}12`}
         initial={{ opacity: 0 }}
         animate={{ opacity: HIGHLIGHT_OPACITY }}
         transition={loop(HIGHLIGHT_TIMES)}
      />
   </>
);

/* The reader's request, travelling the tree. */
const TravelDot = () => (
   <motion.circle
      cx={CARD_RIGHT}
      cy={TRUNK_Y}
      r={2}
      fill="rgba(255,255,255,0.92)"
      initial={{ opacity: 0, x: 0 }}
      animate={{ x: DOT_X, opacity: DOT_OPACITY }}
      transition={loop(DOT_TIMES, "linear")}
   />
);

/* "Your app is live at https://...": padlock, address hairline, green tick. */
const UrlBar = ({ pillCy }: { pillCy: number }) => {
   const x = PILL.x + PILL.w / 2 - URL_BAR.w / 2;
   const y = pillCy + PILL.h / 2 + URL_BAR.gap;
   const cy = y + URL_BAR.h / 2;
   const lockX = x + 4.5;
   const tickCx = x + URL_BAR.w - 6;
   const box = { x, y, width: URL_BAR.w, height: URL_BAR.h, rx: 3 };
   return (
      <motion.g
         initial={{ opacity: 0, y: URL_Y[0] }}
         animate={{ opacity: URL_OPACITY, y: URL_Y }}
         transition={loop(URL_TIMES)}
      >
         <rect {...box} {...hairline(WHITE_10)} fill={WHITE_03} />
         <path
            d={`M ${lockX + 1} ${cy - 0.5} V ${cy - 1.8} A 1.5 1.5 0 0 1 ${lockX + 4} ${cy - 1.8} V ${cy - 0.5}`}
            {...glyph(GREEN, 1)}
         />
         <rect
            x={lockX}
            y={cy - 0.5}
            width={5}
            height={3.5}
            rx={0.6}
            fill={GREEN}
         />
         <path
            d={`M ${lockX + 9} ${cy} H ${lockX + 9 + URL_BAR.w * 0.6}`}
            {...hairline(WHITE_25)}
         />
         <motion.g
            initial={{ opacity: 0, scale: URL_TICK_SCALE[0] }}
            animate={{ opacity: URL_OPACITY, scale: URL_TICK_SCALE }}
            transition={loop(URL_TICK_TIMES)}
         >
            <circle
               cx={tickCx}
               cy={cy}
               r={4.5}
               {...hairline(GREEN)}
               fill={GREEN_FILL}
            />
            <path d={tickPath(tickCx, cy)} {...glyph(GREEN, 1.2)} />
         </motion.g>
      </motion.g>
   );
};

/* ---------- HTML layer: fixed-px labels, dots and step marks ---------- */

const Dot = ({ x, y, color }: { x: number; y: number; color: string }) => (
   <div style={{ ...DOT3, ...pin(x, y), background: color }} />
);

/* Header chrome: two window dots and the right-aligned file name. */
const CardChrome = ({ file, tint }: { file: string; tint: string }) => (
   <>
      {CHROME_DOTS.map(({ x, color }) => (
         <Dot key={x} x={x} y={HEADER_CY} color={color} />
      ))}
      <div
         style={{
            ...LABEL,
            right: xPct(VIEW.w - CARD_RIGHT + 7),
            top: yPct(HEADER_CY),
            color: `${tint}e6`,
         }}
      >
         {file}
      </div>
   </>
);

/* One numbered step: outlined ring, then a green ring + check pops over it. */
const StepMark = ({ y, tickAt }: StepSpec) => (
   <>
      <div
         style={{
            ...STEP_BOX,
            ...pin(STEP_CX, y),
            boxSizing: "border-box",
            border: `1px solid ${WHITE_25}`,
         }}
      />
      <motion.div
         initial={{ opacity: 0, scale: TICK_SCALE[0] }}
         animate={{ opacity: TICK_OPACITY, scale: TICK_SCALE }}
         transition={loop([0, tickAt, tickAt + 0.05, 0.8, 0.9, 1])}
         style={{ ...STEP_BOX, ...pin(STEP_CX, y) }}
      >
         <svg
            viewBox={`0 0 ${STEP_PX} ${STEP_PX}`}
            width={STEP_PX}
            height={STEP_PX}
            style={{ display: "block" }}
         >
            <circle
               cx={STEP_PX / 2}
               cy={STEP_PX / 2}
               r={3}
               fill={GREEN_FILL}
               stroke={`${GREEN}99`}
               strokeWidth={1}
            />
            <path d={TICK_D} {...glyph(GREEN, 1.3)} />
         </svg>
      </motion.div>
   </>
);

/* Per branch: dim status dot at the pill's left, platform label beside it. */
const PillChrome = ({ cy, text }: { cy: number; text: string }) => (
   <>
      <Dot x={STATUS_CX} y={cy} color={WHITE_25} />
      <div style={{ ...LABEL, ...pin(LABEL_X, cy), color: WHITE_50 }}>
         {text}
      </div>
   </>
);

/* The chosen platform's status dot flips live and pulses. */
const LiveDot = ({ cy }: { cy: number }) => (
   <motion.div
      initial={{ opacity: 0, scale: STATUS_SCALE[0] }}
      animate={{ opacity: STATUS_OPACITY, scale: STATUS_SCALE }}
      transition={loop(STATUS_TIMES)}
      style={{ ...DOT3, ...pin(STATUS_CX, cy), background: GREEN }}
   />
);

const GuideScene = ({ tint, variant }: CoverSceneProps) => {
   const guide = GUIDE_VARIANTS[variant ?? DEFAULT_VARIANT] ?? DEFAULT_GUIDE;
   const [top, middle, bottom] = guide.branches;
   const chosenCy = PILL_CY[1];

   return (
      <div
         aria-hidden="true"
         style={{
            ...ABS,
            inset: 0,
            overflow: "hidden",
            background: `radial-gradient(circle at 78% 50%, ${tint}14 0%, transparent 50%), linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)`,
         }}
      >
         <div
            style={{
               ...ABS,
               inset: 0,
               opacity: 0.05,
               backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
               backgroundSize: "18px 18px",
            }}
         />

         {/* The slot is a fixed 16:10, so `none` scales uniformly here. */}
         <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            preserveAspectRatio="none"
            style={{ ...ABS, inset: 0, width: "100%", height: "100%" }}
         >
            <GuideCard />
            <path
               d={`M ${CARD_RIGHT} ${TRUNK_Y} H ${JUNCTION_X}`}
               {...hairline(WHITE_10)}
            />
            <FlickerBranch cy={PILL_CY[0]} delay={0} />
            <ChosenBranch cy={chosenCy} tint={tint} />
            <FlickerBranch cy={PILL_CY[2]} delay={FLICKER_STAGGER} />
            <TravelDot />
            <UrlBar pillCy={chosenCy} />
         </svg>

         <CardChrome file={guide.file} tint={tint} />
         {STEP_ROWS.map((row) => (
            <StepMark key={row.y} {...row} />
         ))}
         <Dot x={JUNCTION_X} y={TRUNK_Y} color={WHITE_25} />
         <PillChrome cy={PILL_CY[0]} text={top} />
         <PillChrome cy={chosenCy} text={middle} />
         <PillChrome cy={PILL_CY[2]} text={bottom} />
         <LiveDot cy={chosenCy} />
      </div>
   );
};

export default GuideScene;
