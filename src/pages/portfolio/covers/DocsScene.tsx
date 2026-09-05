import type { ComponentType, CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { MONO_FONT } from "@/constants/theme";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/* Docs family -- a document card feeds a checker, an agent or a copy target.
   Variants: lint (skillcheck) | list (awesome list) | agent-recipes |
   claude-recipes. Shared shell: DocCard (header tag), TerminalStrip,
   StatusRow, Flight dot. Every variant swaps at least one moving element. */

const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const PANEL_BG = "#0e1a24";
const NONE = "transparent";
const W03 = "rgba(255,255,255,0.03)";
const W08 = "rgba(255,255,255,0.08)";
const W14 = "rgba(255,255,255,0.14)";
const W25 = "rgba(255,255,255,0.25)";
const W35 = "rgba(255,255,255,0.35)";
const W55 = "rgba(255,255,255,0.55)";
const W85 = "rgba(255,255,255,0.85)";
const BASE_BG = "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)";
const DOT_GRID = "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)";
const HAIRLINE = `linear-gradient(90deg, transparent, ${W14}, transparent)`;
const RIGHT = "56%";
const RIGHT_W = "38%";
/** Cycle fraction where every variant starts fading back to its start. */
const HOLD = 0.9;

type Ease = "easeInOut" | "easeOut" | "linear";
type Len = number | string;
const EASE: Ease = "easeInOut";

/* ---------- style helpers (keep JSX style props to one line) ---------- */

const ABS = { position: "absolute" } as const;
const FLEX_COL = { display: "flex", flexDirection: "column" } as const;
const ROUND = { borderRadius: "50%", flex: "none" } as const;
const BAR = { height: 2, borderRadius: 2, transformOrigin: "0 50%" };
const at = (left: Len, top: Len) => ({ ...ABS, left, top });
const row = (gap: number) => ({ display: "flex", alignItems: "center", gap });
const col = (gap: number) => ({ ...FLEX_COL, gap });
const sq = (d: number) => ({ width: d, height: d });
const dot = (d: number, b: string) => ({ ...ROUND, ...sq(d), background: b });
const bar = (w: Len, b: string) => ({ ...BAR, width: w, background: b });
const edge = (c: string) => `1px solid ${c}`;
const box = (w: Len, h: Len, e: string, bg: string, r = 8) => ({
   width: w,
   height: h,
   borderRadius: r,
   border: edge(e),
   background: bg,
});
const tile = (e: string, bg: string) => ({
   ...at("57%", "26%"),
   ...box(28, 28, e, bg, 7),
   display: "grid",
   placeItems: "center",
});
/** Infinite keyframe loop; `times` must match the keyframe count. */
const loop = (d: number, times: number[], delay = 0, ease: Ease = EASE) => ({
   duration: d,
   repeat: Infinity,
   times,
   delay,
   ease,
});

const LABEL: CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 7,
   fontWeight: 700,
   letterSpacing: 0.8,
   lineHeight: 1,
   textTransform: "uppercase",
   whiteSpace: "nowrap",
};
const PILL = {
   ...LABEL,
   ...row(4),
   height: 14,
   padding: "0 5px",
   borderRadius: 999,
};
const TAG = { height: 11, padding: "0 4px" };
const TICK_SHAPE: CSSProperties = {
   width: 5,
   height: 3,
   borderLeft: `1.5px solid ${GREEN}`,
   borderBottom: `1.5px solid ${GREEN}`,
   transform: "rotate(-45deg)",
   flex: "none",
};
const TICK = { ...TICK_SHAPE, ...at(3, 3.5) };
const CHECK = { ...ABS, ...box(13, 13, `${GREEN}50`, `${GREEN}10`, 999) };
const FENCE = { height: 1, width: 14, background: W25 };
const SWEEP = {
   ...ABS,
   left: 0,
   right: 0,
   bottom: 0,
   height: 1,
   transformOrigin: "0 50%",
};
const STRIP = {
   ...at(RIGHT, 0),
   ...row(4),
   ...box(RIGHT_W, 18, W08, PANEL_BG, 4),
   padding: "0 6px",
};
const LINES_A = ["74%", "56%"];
const LINES_B = ["82%", "44%"];
/* Card boxes are slot-relative so the stack keeps clear of the right column at any width. */
const CARD_W = "34%";
const CARD_H = "66%";
const BACK_CARDS = [
   { left: "5%", top: "24%", w: "32%", h: "62%", rot: -7, e: "1c" },
   { left: "7%", top: "21.5%", w: "33%", h: "64%", rot: -3.5, e: "26" },
];
const STAR_PATH =
   "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z";

/* ---------- shared primitives ---------- */

interface TextProps {
   text: string;
   color: string;
   style?: CSSProperties;
}

const Label = ({ text, color, style }: TextProps) => (
   <span style={{ ...LABEL, color, ...style }}>{text}</span>
);

const Pill = ({ text, color, style, lit }: TextProps & { lit?: boolean }) => (
   <span
      style={{
         ...PILL,
         color,
         border: edge(`${color}55`),
         background: `${color}0d`,
         ...style,
      }}
   >
      {lit && <span style={dot(5, color)} />}
      {text}
   </span>
);

interface HeaderProps {
   tint: string;
   name: string;
   tag?: string;
}

/** 16 px card header: window dot (or a tag pill) on the left, file name on the right. */
const CardHeader = ({ tint, name, tag }: HeaderProps) => (
   <div
      style={{
         ...row(3),
         height: 16,
         padding: "0 7px",
         borderBottom: edge(`${tint}18`),
         background: `${tint}08`,
      }}
   >
      {tag ? (
         <Pill text={tag} color={tint} style={TAG} />
      ) : (
         <span style={dot(3, `${tint}50`)} />
      )}
      <Label text={name} color={`${tint}90`} style={{ marginLeft: "auto" }} />
   </div>
);

interface BarGroupProps {
   tint: string;
   widths: string[];
   tinted: number;
   cycle: number;
   /** [start, typeFrom, typeTo]: scaleX 0 -> 1 between typeFrom and typeTo. */
   times: [number, number, number];
   /** Cycle fraction where the lines dim to half (the prompt has been lifted out). */
   dimAt?: number;
}

/** Keyframes for one bar group: reveal, hold, optionally dim, then wipe back. */
const barKeys = (times: [number, number, number], dimAt?: number) => {
   if (dimAt === undefined) {
      return {
         animate: { scaleX: [0, 0, 1, 1, 0] },
         times: [...times, HOLD, 1],
      };
   }
   return {
      animate: {
         scaleX: [0, 0, 1, 1, 1, 1, 0],
         opacity: [1, 1, 1, 1, 0.5, 0.5, 1],
      },
      times: [...times, dimAt, dimAt + 0.05, HOLD, 1],
   };
};

/** Two typed lines revealed as one node (scaleX from the left). */
const BarGroup = ({
   tint,
   widths,
   tinted,
   cycle,
   times,
   dimAt,
}: BarGroupProps) => {
   const keys = barKeys(times, dimAt);
   return (
      <motion.div
         animate={keys.animate}
         transition={loop(cycle, keys.times)}
         style={{ ...col(8), transformOrigin: "0 50%" }}
      >
         {widths.map((w, i) => (
            <div key={w} style={bar(w, i < tinted ? `${tint}66` : W14)} />
         ))}
      </motion.div>
   );
};

interface DocCardProps extends HeaderProps {
   tinted: number;
   fence?: boolean;
   cycle: number;
   dimAt?: number;
   children?: ReactNode;
}

/** Fanned document stack: two static back cards + a floating top card with typed lines. */
const DocCard = ({
   tint,
   name,
   tag,
   tinted,
   fence,
   cycle,
   dimAt,
   children,
}: DocCardProps) => (
   <>
      {BACK_CARDS.map((c) => (
         <div
            key={c.left}
            style={{
               ...at(c.left, c.top),
               ...box(c.w, c.h, `${tint}${c.e}`, PANEL_BG),
               transform: `rotate(${c.rot}deg)`,
               transformOrigin: "50% 95%",
            }}
         />
      ))}
      <motion.div
         animate={{ y: [0, -3, 0] }}
         transition={{ duration: cycle, repeat: Infinity, ease: EASE }}
         style={{
            ...at("9%", "19%"),
            ...box(CARD_W, CARD_H, `${tint}38`, PANEL_BG),
            overflow: "hidden",
         }}
      >
         <CardHeader tint={tint} name={name} tag={tag} />
         <div style={{ ...col(8), padding: "10px 9px" }}>
            {fence && <div style={FENCE} />}
            <BarGroup
               tint={tint}
               widths={LINES_A}
               tinted={tinted}
               cycle={cycle}
               times={[0, 0.02, 0.16]}
               dimAt={dimAt}
            />
            {fence && <div style={FENCE} />}
            <BarGroup
               tint={tint}
               widths={LINES_B}
               tinted={tinted - 2}
               cycle={cycle}
               times={[0, 0.1, 0.26]}
               dimAt={dimAt}
            />
         </div>
         {children}
      </motion.div>
   </>
);

interface FlightProps {
   tint: string;
   cycle: number;
   t0: number;
   t1: number;
}

/** Hairline from the card edge to the right column + a dot in flight along it.
    The dot rides a wrapper as wide as the hairline and moves by a percentage of
    that width, so it covers the same span at 340 px and 165 px. */
const Flight = ({ tint, cycle, t0, t1 }: FlightProps) => (
   <div
      style={{
         ...at("44%", "33%"),
         width: "12%",
         height: 1,
         background: HAIRLINE,
      }}
   >
      <motion.div
         animate={{
            x: ["0%", "0%", "8%", "88%", "88%", "0%"],
            opacity: [0, 0, 1, 1, 0, 0],
         }}
         transition={loop(cycle, [0, t0, t0 + 0.02, t1, t1 + 0.03, 1])}
         style={{ ...at(0, -1.5), width: "100%", height: 4 }}
      >
         <div style={dot(4, tint)} />
      </motion.div>
   </div>
);

interface StripProps {
   tint: string;
   prompt: string;
   cycle: number;
   typeAt: [number, number];
   sweepAt?: [number, number];
   top: string;
   children: ReactNode;
}

/** One-line terminal: prompt glyph, content revealed left to right, blinking caret, optional run sweep. */
const TerminalStrip = ({
   tint,
   prompt,
   cycle,
   typeAt,
   sweepAt,
   top,
   children,
}: StripProps) => (
   <div style={{ ...STRIP, top }}>
      <Label text={prompt} color={W35} />
      <div style={{ ...row(3), position: "relative" }}>
         {children}
         <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 4, height: 8, background: W55 }}
         />
         <motion.div
            animate={{ scaleX: [1, 1, 0, 0, 1] }}
            transition={loop(
               cycle,
               [0, typeAt[0], typeAt[1], 0.96, 1],
               0,
               "linear",
            )}
            style={{
               ...ABS,
               inset: -1,
               background: PANEL_BG,
               transformOrigin: "100% 50%",
            }}
         />
      </div>
      {sweepAt && (
         <motion.div
            animate={{ scaleX: [0, 0, 1, 1, 0] }}
            transition={loop(cycle, [0, sweepAt[0], sweepAt[1], 0.94, 1])}
            style={{ ...SWEEP, background: `${tint}aa` }}
         />
      )}
   </div>
);

interface CheckProps {
   cycle: number;
   times: number[];
   style: CSSProperties;
}

/** Green check circle popping in; `style` positions it. */
const Check = ({ cycle, times, style }: CheckProps) => (
   <motion.div
      animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.5, 0.5, 1, 1, 0.7] }}
      transition={loop(cycle, times)}
      style={{ ...CHECK, ...style }}
   >
      <div style={TICK} />
   </motion.div>
);

interface StatusProps {
   text: string;
   left: string;
   top: string;
   cycle: number;
   reveal?: number[];
}

/** Green dot + status label. Pulses by default; with `reveal` it fades in at those times. */
const StatusRow = ({ text, left, top, cycle, reveal }: StatusProps) => {
   const transition = reveal
      ? loop(cycle, reveal)
      : { duration: 2.2, repeat: Infinity, ease: EASE };
   const opacity = reveal ? [0, 0, 1, 1, 0] : [0.5, 1, 0.5];
   return (
      <motion.div
         animate={{ opacity }}
         transition={transition}
         style={{ ...at(left, top), ...row(5) }}
      >
         <span style={dot(5, GREEN)} />
         <Label text={text} color={W35} />
      </motion.div>
   );
};

interface CopyProps {
   tint: string;
   cycle: number;
   hit: number;
}

/** Copy glyph: back square static, front square nudges up-right when the dot lands at `hit`. */
const CopyIcon = ({ tint, cycle, hit }: CopyProps) => (
   <div style={tile(`${tint}30`, `${tint}06`)}>
      <div style={{ ...at(7, 9), ...box(9, 11, `${tint}55`, NONE, 2) }} />
      <motion.div
         animate={{ x: [0, 0, 2, 0, 0], y: [0, 0, -2, 0, 0] }}
         transition={loop(cycle, [0, hit, hit + 0.04, hit + 0.08, 1])}
         style={{ ...at(11, 6), ...box(9, 11, W35, PANEL_BG, 2) }}
      />
   </div>
);

interface ChipProps {
   tint: string;
   labels: string[];
   cycle: number;
   top: string;
   /** Cycle fraction where the chip pops in; it holds until HOLD. */
   showAt: number;
}

/** One pill per run: chip i is up for the whole of run i, then the next label
    takes the following run, so the label rotates once per loop. */
const ChipCycle = ({ tint, labels, cycle, top, showAt }: ChipProps) => {
   const n = labels.length;
   const times = [
      0,
      showAt / n,
      (showAt + 0.06) / n,
      HOLD / n,
      (HOLD + 0.05) / n,
      1,
   ];
   return (
      <div style={{ ...at(RIGHT, top), height: 16 }}>
         {labels.map((text, i) => (
            <motion.div
               key={text}
               animate={{ opacity: [0, 0, 1, 1, 0, 0], y: [3, 3, 0, 0, 0, 3] }}
               transition={loop(cycle * n, times, i * cycle, "easeOut")}
               style={{ ...at(0, 0), opacity: 0 }}
            >
               <Pill text={text} color={tint} />
            </motion.div>
         ))}
      </div>
   );
};

/* ---------- lint (skillcheck): SKILL.md -> $ lint -> ERR / WARN rows -> EXIT 1 ---------- */

type Marker = "err" | "warn" | "ok";

const MARKER: Record<Marker, CSSProperties> = {
   err: { ...dot(5, W85), borderRadius: 0 },
   warn: { ...dot(5, NONE), border: edge(AMBER) },
   ok: TICK_SHAPE,
};
const MARKER_COLOR: Record<Marker, string> = {
   err: W85,
   warn: AMBER,
   ok: GREEN,
};
const FINDINGS: { marker: Marker; code?: string; bar: string }[] = [
   { marker: "err", code: "SC013", bar: "56%" },
   { marker: "err", bar: "44%" },
   { marker: "warn", code: "SC301", bar: "62%" },
   { marker: "ok", bar: "38%" },
];
/* Findings column: rows and the exit pill share one percent grid. */
const ROW_TOP = 46;
const ROW_PITCH = 6;
const EXIT_TOP = `${ROW_TOP + FINDINGS.length * ROW_PITCH + 2}%`;

const LintBody = ({ tint }: { tint: string }) => {
   const cycle = 5.2;
   return (
      <>
         <DocCard tint={tint} name="SKILL.MD" tinted={1} fence cycle={cycle} />
         <Flight tint={tint} cycle={cycle} t0={0.16} t1={0.26} />
         <TerminalStrip
            tint={tint}
            prompt="$"
            cycle={cycle}
            typeAt={[0.27, 0.36]}
            top="29%"
         >
            <div style={bar(34, `${tint}aa`)} />
         </TerminalStrip>
         {FINDINGS.map((f, i) => (
            <motion.div
               key={f.bar}
               animate={{ x: [6, 6, 0, 0, 0], opacity: [0, 0, 1, 1, 0] }}
               transition={loop(cycle, [
                  0,
                  0.38 + i * 0.06,
                  0.44 + i * 0.06,
                  HOLD,
                  1,
               ])}
               style={{
                  ...at(RIGHT, `${ROW_TOP + i * ROW_PITCH}%`),
                  ...row(4),
                  width: RIGHT_W,
               }}
            >
               <span style={MARKER[f.marker]} />
               {f.code && (
                  <Label text={f.code} color={MARKER_COLOR[f.marker]} />
               )}
               <div style={bar(f.bar, W14)} />
            </motion.div>
         ))}
         <motion.div
            animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.7, 0.7, 1, 1, 0.7] }}
            transition={loop(cycle, [0, 0.66, 0.72, HOLD, 1])}
            style={at(RIGHT, EXIT_TOP)}
         >
            <Pill text="EXIT 1" color={AMBER} />
         </motion.div>
      </>
   );
};

/* ---------- list (awesome list): README table -> PR row insert -> merged -> link check ---------- */

const LIST_ROWS = [
   { name: "30%", desc: "40%" },
   { name: "24%", desc: "46%" },
   { name: "34%", desc: "30%" },
   { name: "28%", desc: "36%" },
   { name: "32%", desc: "44%" },
   { name: "26%", desc: "38%" },
];
const LANG_PILL = {
   ...box(12, 7, W14, NONE, 999),
   marginLeft: "auto",
   flex: "none",
};
const PR_CHIP = {
   ...row(4),
   ...box("auto", 16, `${GREEN}50`, `${GREEN}0a`, 999),
   padding: "0 6px",
};
const GREEN_LATTICE = `radial-gradient(circle, ${GREEN} 1.5px, transparent 1.6px)`;

interface RowProps {
   tint: string;
   name: string;
   desc: string;
   strong?: boolean;
}

const ListRow = ({ tint, name, desc, strong }: RowProps) => (
   <div style={{ ...row(5), height: 10 }}>
      <span style={dot(3, W25)} />
      <div style={bar(name, strong ? `${tint}cc` : `${tint}66`)} />
      <div style={bar(desc, W14)} />
      <span style={LANG_PILL} />
   </div>
);

interface DotsProps {
   cycle: number;
   top: number;
   rows: number;
   times: number[];
}

/** Column of green dots over the leading dots; one lattice element per row group. */
const GreenDots = ({ cycle, top, rows, times }: DotsProps) => (
   <motion.div
      animate={{ opacity: [0, 0, 1, 1, 0] }}
      transition={loop(cycle, times)}
      style={{
         ...at(9, top),
         width: 3,
         height: rows * 16,
         backgroundImage: GREEN_LATTICE,
         backgroundSize: "3px 16px",
      }}
   />
);

const ListBody = ({ tint }: { tint: string }) => {
   const cycle = 5.4;
   const rowsAt = (rows: typeof LIST_ROWS) =>
      rows.map((r) => (
         <ListRow
            key={r.name + r.desc}
            tint={tint}
            name={r.name}
            desc={r.desc}
         />
      ));
   return (
      <>
         <div
            style={{
               ...at("8%", "14%"),
               ...box("64%", "72%", `${tint}38`, PANEL_BG),
               overflow: "hidden",
            }}
         >
            <CardHeader tint={tint} name="README.MD" tag="DATA & DB" />
            <div style={{ ...at(9, 24), ...col(6), right: 9 }}>
               {rowsAt(LIST_ROWS.slice(0, 3))}
            </div>
            <motion.div
               animate={{ opacity: [0, 0, 1, 1, 0], x: [14, 14, 0, 0, 0] }}
               transition={loop(cycle, [0, 0.18, 0.3, HOLD, 1])}
               style={{ ...at(9, 72), right: 9 }}
            >
               <ListRow tint={tint} name="30%" desc="42%" strong />
            </motion.div>
            <motion.div
               animate={{ y: [0, 0, 16, 16, 0] }}
               transition={loop(cycle, [0, 0.18, 0.3, HOLD, 1])}
               style={{ ...at(9, 72), ...col(6), right: 9 }}
            >
               {rowsAt(LIST_ROWS.slice(3))}
            </motion.div>
            <motion.div
               animate={{
                  y: [20, 20, 22, 136, 136, 20],
                  opacity: [0, 0, 1, 1, 0, 0],
               }}
               transition={loop(
                  cycle,
                  [0, 0.48, 0.5, 0.78, 0.8, 1],
                  0,
                  "linear",
               )}
               style={{
                  ...at(9, 0),
                  right: 9,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${tint}80, transparent)`,
               }}
            />
            <GreenDots
               cycle={cycle}
               top={21}
               rows={3}
               times={[0, 0.58, 0.61, HOLD, 1]}
            />
            <GreenDots
               cycle={cycle}
               top={69}
               rows={4}
               times={[0, 0.73, 0.76, HOLD, 1]}
            />
         </div>
         <div style={{ ...tile(W08, W03), left: "78%", top: "16%" }}>
            <motion.svg
               animate={{ scale: [1, 1, 1.25, 1] }}
               transition={loop(cycle, [0, HOLD, 0.95, 1])}
               width={11}
               height={11}
               viewBox="0 0 24 24"
               style={{ display: "block" }}
            >
               <path d={STAR_PATH} fill={`${tint}cc`} />
            </motion.svg>
         </div>
         <motion.div
            animate={{ x: [40, 40, 0, 0, 0, 0], opacity: [0, 0, 1, 1, 0, 0] }}
            transition={loop(cycle, [0, 0.15, 0.24, 0.37, 0.45, 1])}
            style={at("74%", "44%")}
         >
            <span style={PR_CHIP}>
               <span style={{ ...dot(5, NONE), border: edge(GREEN) }} />
               <span style={bar(20, W35)} />
            </span>
         </motion.div>
         <motion.div
            animate={{ opacity: [0, 0, 1, 1, 0] }}
            transition={loop(cycle, [0, 0.37, 0.45, HOLD, 1])}
            style={at("74%", "44%")}
         >
            <Pill text="MERGED" color={GREEN} lit />
         </motion.div>
         <StatusRow
            text="LINK CHECK"
            left="75%"
            top="72%"
            cycle={cycle}
            reveal={[0, 0.74, 0.8, HOLD, 1]}
         />
      </>
   );
};

/* ---------- agent-recipes: recipe card -> prompt copied out -> agent chip -> $ run -> ok ---------- */

const AGENTS = ["CLAUDE CODE", "CURSOR", "AIDER"];

const AgentBody = ({ tint }: { tint: string }) => {
   const cycle = 5.4;
   return (
      <>
         <DocCard
            tint={tint}
            name="RECIPES/"
            tinted={1}
            cycle={cycle}
            dimAt={0.32}
         />
         <Flight tint={tint} cycle={cycle} t0={0.22} t1={0.32} />
         <CopyIcon tint={tint} cycle={cycle} hit={0.32} />
         <ChipCycle
            tint={tint}
            labels={AGENTS}
            cycle={cycle}
            top="44%"
            showAt={0.34}
         />
         <TerminalStrip
            tint={tint}
            prompt="$"
            cycle={cycle}
            typeAt={[0.36, 0.46]}
            sweepAt={[0.48, 0.78]}
            top="62%"
         >
            <div style={bar(30, W35)} />
         </TerminalStrip>
         <Check
            cycle={cycle}
            times={[0, 0.78, 0.86, HOLD, 1]}
            style={{ left: "88%", top: "calc(62% + 2px)" }}
         />
      </>
   );
};

/* ---------- claude-recipes: recipe file -> cp -> slash command typed -> result -> live in .claude/ ---------- */

const RESULT_PANEL = {
   ...at(RIGHT, "60%"),
   ...col(6),
   ...box(RIGHT_W, 30, W08, W03, 4),
   padding: "7px 8px",
};

const ClaudeBody = ({ tint }: { tint: string }) => {
   const cycle = 5.6;
   return (
      <>
         <DocCard
            tint={tint}
            name="REFACTOR.MD"
            tag="SONNET"
            tinted={2}
            cycle={cycle}
         />
         <Flight tint={tint} cycle={cycle} t0={0.2} t1={0.3} />
         <CopyIcon tint={tint} cycle={cycle} hit={0.3} />
         <TerminalStrip
            tint={tint}
            prompt=">"
            cycle={cycle}
            typeAt={[0.36, 0.5]}
            top="46%"
         >
            <Label text="/REFACTOR" color={tint} />
         </TerminalStrip>
         <div style={RESULT_PANEL}>
            {["70%", "48%"].map((w, i) => (
               <motion.div
                  key={w}
                  animate={{ scaleX: [0, 0, 1, 1, 0] }}
                  transition={loop(cycle, [
                     0,
                     0.56 + i * 0.05,
                     0.64 + i * 0.05,
                     HOLD,
                     1,
                  ])}
                  style={bar(w, W14)}
               />
            ))}
         </div>
         <Check
            cycle={cycle}
            times={[0, 0.7, 0.78, HOLD, 1]}
            style={{ left: "88%", top: "calc(60% + 8px)" }}
         />
         <StatusRow text=".CLAUDE/" left="57%" top="80%" cycle={cycle} />
      </>
   );
};

/* ---------- default: README -> cp -> copied ---------- */

const DefaultBody = ({ tint }: { tint: string }) => {
   const cycle = 4.8;
   return (
      <>
         <DocCard tint={tint} name="README.MD" tinted={1} cycle={cycle}>
            <Check
               cycle={cycle}
               times={[0, 0.5, 0.6, HOLD, 1]}
               style={{ right: 9, bottom: 9 }}
            />
         </DocCard>
         <Flight tint={tint} cycle={cycle} t0={0.2} t1={0.32} />
         <CopyIcon tint={tint} cycle={cycle} hit={0.32} />
         <StatusRow text="COPIED" left="57%" top="60%" cycle={cycle} />
      </>
   );
};

const BODY: Record<string, ComponentType<{ tint: string }>> = {
   lint: LintBody,
   list: ListBody,
   "agent-recipes": AgentBody,
   "claude-recipes": ClaudeBody,
};

/** Docs / lists / recipes cover scene -- shared shell + per-variant body. */
const DocsScene = ({ tint, variant }: CoverSceneProps) => {
   const Body = BODY[variant ?? ""] ?? DefaultBody;
   return (
      <div
         aria-hidden="true"
         style={{ ...ABS, inset: 0, overflow: "hidden", background: BASE_BG }}
      >
         <div
            style={{
               ...ABS,
               inset: 0,
               background: `radial-gradient(circle at 32% 24%, ${tint}14 0%, transparent 55%)`,
            }}
         />
         <div
            style={{
               ...ABS,
               inset: 0,
               opacity: 0.05,
               backgroundImage: DOT_GRID,
               backgroundSize: "22px 22px",
            }}
         />
         <Body tint={tint} />
      </div>
   );
};

export default DocsScene;
