import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Panel, Pip, Shell, Wire } from "./kit/primitives";
import {
   DOTS,
   GREEN,
   INK,
   NON_SCALING,
   W06,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   label,
   loopProps,
   pctX,
   pctY,
   shown,
} from "./kit/sceneTokens";
import type { Keys, Loop, TintProps } from "./kit/sceneTokens";

/*
 * Sagas: a living library of unfinished books. Left, the three shelves
 * (fantasy, fanfic, essays) with one empty slot. Right, the chapter plate
 * from the site's hero (flame mark, spine, a tilted ghost plate behind it).
 * 1. The chapter's Markdown is written line by line, status `draft`.
 * 2. One line is cut back and rewritten, status `revising`.
 * 3. Status `final`: every stage lands as a commit on the git log rail
 *    under the page (git history is the writing log, the last one green).
 * 4. The book slides from the plate into the empty slot on its shelf and
 *    the RSS feed lights (publishedOn puts the chapter in rss.xml).
 * The loop opens on the published state, so the frozen Reduced frame is
 * the finished chapter: it clears, is rewritten, then holds.
 * One 6 s loop, 12 animated nodes.
 */

const beat = clock(6);
/* the published state fades out here at the top of every loop */
const CLEAR = [0.03, 0.07];
const RAMP = 0.03;

/* shown at rest, gone during CLEAR, back from `at` */
const backAt = (at: number): Keys => ({
   times: [0, ...CLEAR, at, at + RAMP, 1],
   opacity: [1, 1, 0, 0, 1, 1],
});

/* ---------- shelves ---------- */

const SHELF_X = 26;
const SHELF_W = 124;
const SHELF_Y = [64, 106, 148];
const GAP = 2.5;
const BOOK_X = 30;

/* [width, height, accent band] per spine, left to right */
type Spine = readonly [w: number, h: number, accent?: boolean];

const FANTASY: Spine[] = [
   [10, 30, true],
   [8, 26],
   [12, 32],
   [9, 25, true],
   [11, 29],
   [8, 27],
];
/* the empty slot sits after the fourth fanfic spine */
const FANFIC_LEFT: Spine[] = [
   [9, 28],
   [12, 31, true],
   [8, 24],
   [10, 29],
];
const FANFIC_RIGHT: Spine[] = [
   [11, 27],
   [8, 30, true],
];
const ESSAYS: Spine[] = [
   [6, 22],
   [7, 24],
   [6, 20, true],
   [8, 23],
   [6, 22],
   [7, 25],
   [6, 21],
];

const rowWidth = (row: Spine[]) => row.reduce((sum, [w]) => sum + w + GAP, 0);

const SLOT_W = 10;
const SLOT_H = 30;
const SLOT_X = BOOK_X + rowWidth(FANFIC_LEFT);
const SLOT_Y = SHELF_Y[1] - SLOT_H;

/* ---------- chapter plate ---------- */

const PLATE_X = 178;
const PLATE_Y = 20;
const PLATE_W = 108;
const PLATE_H = 118;
const PLATE_CX = PLATE_X + PLATE_W / 2;
const PLATE_CY = PLATE_Y + PLATE_H / 2;
const BACK_TILT = `translate(5 3) rotate(5 ${PLATE_CX} ${PLATE_CY})`;

const TEXT_X = 190;
/* [y, width] of the Markdown lines the chapter is written in */
const LINES: [number, number][] = [
   [70, 84],
   [81, 76],
   [92, 82],
   [103, 54],
];
const REVISED = 2;
const RAIL_Y = 122;
const COMMIT_X = [204, 232, 260];
const PILL_AT = [190, 56] as const;

/* the site's flame mark, 24 unit viewBox, centred in its 14 unit ring */
const FLAME_D =
   "M12 2c1.2 3.3-1.8 4.8-1.8 7.4 0 1.3 1 2.1 1 2.1s-.4-2.2 1.3-3.4c1.9 2 3.5 3.6 3.5 6.2A6 6 0 0 1 6 14.3C6 9.8 11 8.4 12 2Z";
const FLAME_C = [195, 37] as const;
const FLAME_T = `translate(${FLAME_C[0] - 4.5} ${FLAME_C[1] - 4.5}) scale(0.375)`;

/* ---------- timeline ---------- */

const LINE_START = 0.1;
const LINE_STEP = 0.07;
const LINE_RUN = 0.06;

/* a line drawn at rest, wiped in CLEAR, rewritten left to right from `s` */
const lineKeys = (i: number): Keys => {
   const s = LINE_START + i * LINE_STEP;
   const keys: Keys = {
      times: [0, ...CLEAR, s - 0.005, s, s + LINE_RUN, 1],
      opacity: [1, 1, 0, 0, 1, 1, 1],
      scaleX: [1, 1, 1, 0, 0, 1, 1],
   };
   if (i !== REVISED) return keys;
   /* revising: cut back to a stub, then written again */
   return {
      times: [...keys.times.slice(0, -1), 0.44, 0.48, 0.5, 0.55, 1],
      opacity: [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      scaleX: [1, 1, 1, 0, 0, 1, 1, 0.3, 0.3, 1, 1],
   };
};

const LINE_LOOPS = LINES.map((_, i) => beat(lineKeys(i)));

const DRAFT = beat(shown(0.05, 0.44));
const REVISING = beat(shown(0.41, 0.61));
const FINAL = beat(backAt(0.58));

/* one commit per stage: draft, revising, final */
const COMMITS: Loop[] = [0.39, 0.57, 0.62].map((at) =>
   beat({ ...backAt(at), scale: [1, 1, 1, 0.3, 1, 1] }),
);

/* the book leaves the plate's spine and slides into the empty slot */
const BOOK_DX = PLATE_X + 1.5 - (SLOT_X + SLOT_W / 2);
const BOOK_DY = PLATE_Y + PLATE_H / 2 - (SLOT_Y + SLOT_H / 2);
const BOOK = beat({
   times: [0, ...CLEAR, 0.64, 0.67, 0.78, 1],
   opacity: [1, 1, 0, 0, 1, 1, 1],
   x: [0, 0, 0, BOOK_DX, BOOK_DX, 0, 0],
   y: [0, 0, 0, BOOK_DY, BOOK_DY, 0, 0],
});

const FEED = beat({ ...backAt(0.8), scale: [1, 1, 1, 0.6, 1, 1] });

/* ---------- parts ---------- */

interface ShelfProps {
   tint: string;
   row: Spine[];
   x: number;
   y: number;
}

/* A run of spines standing on one plank, laid out left to right. */
const Spines = ({ tint, row, x, y }: Readonly<ShelfProps>) => (
   <>
      {row.map(([w, h, accent], i) => {
         const at = x + rowWidth(row.slice(0, i));
         return (
            <g key={at}>
               <Panel box={[at, y - h, w, h]} rx={1.5} fill={W06} />
               {accent && (
                  <Bar box={[at + 2, y - h + 5, w - 4, 2]} fill={`${tint}66`} />
               )}
            </g>
         );
      })}
   </>
);

const Shelves = ({ tint }: TintProps) => (
   <>
      {SHELF_Y.map((y) => (
         <Bar key={y} box={[SHELF_X, y, SHELF_W, 2]} fill={W16} />
      ))}
      <Spines tint={tint} row={FANTASY} x={BOOK_X} y={SHELF_Y[0]} />
      {/* one book leans on the end of the fantasy row */}
      <g transform={`rotate(-12 106 ${SHELF_Y[0]})`}>
         <Panel box={[106, SHELF_Y[0] - 28, 9, 28]} rx={1.5} fill={W06} />
      </g>
      <Spines tint={tint} row={FANFIC_LEFT} x={BOOK_X} y={SHELF_Y[1]} />
      <rect
         x={SLOT_X}
         y={SLOT_Y}
         width={SLOT_W}
         height={SLOT_H}
         rx={1.5}
         fill="none"
         stroke={W16}
         strokeDasharray="2 2"
         vectorEffect={NON_SCALING}
      />
      <Spines
         tint={tint}
         row={FANFIC_RIGHT}
         x={SLOT_X + SLOT_W + GAP}
         y={SHELF_Y[1]}
      />
      <Spines tint={tint} row={ESSAYS} x={BOOK_X} y={SHELF_Y[2]} />
   </>
);

const Reveal = ({
   loop,
   children,
}: Readonly<{ loop: Loop; children: ReactNode }>) => (
   <motion.g {...loopProps(loop)}>{children}</motion.g>
);

/* The new book, drawn in its slot and carried there from the plate. */
const NewBook = ({ tint }: TintProps) => (
   <Reveal loop={BOOK}>
      <Panel
         box={[SLOT_X, SLOT_Y, SLOT_W, SLOT_H]}
         rx={1.5}
         fill={`${tint}40`}
         stroke={tint}
      />
      <Bar box={[SLOT_X + 2, SLOT_Y + 5, SLOT_W - 4, 2]} fill={W70} />
   </Reveal>
);

/* RSS mark above the shelves: a dot and two arcs, lit on publish. */
const FEED_D = "M29,21 A5,5 0 0 1 34,26 M29,17 A9,9 0 0 1 38,26";
const Feed = ({ tint }: TintProps) => (
   <>
      <circle cx={30} cy={25} r={1.3} fill={W25} />
      <Wire d={FEED_D} stroke={W25} />
      <Reveal loop={FEED}>
         <circle cx={30} cy={25} r={1.3} fill={tint} />
         <Wire d={FEED_D} stroke={tint} width={1.4} />
      </Reveal>
   </>
);

/* The chapter plate: ghost plate behind, spine, flame, title, lines. */
const Plate = ({ tint }: TintProps) => (
   <>
      <g transform={BACK_TILT} opacity={0.6}>
         <Panel
            box={[PLATE_X, PLATE_Y, PLATE_W, PLATE_H]}
            rx={8}
            stroke={W06}
         />
         <Bar box={[194, 48, 60, 3]} fill={W06} />
         <Bar box={[194, 58, 76, 3]} fill={W06} />
      </g>
      <Panel
         box={[PLATE_X, PLATE_Y, PLATE_W, PLATE_H]}
         rx={8}
         fill={INK}
         stroke="none"
      />
      <Panel box={[PLATE_X, PLATE_Y, PLATE_W, PLATE_H]} rx={8} />
      <Bar box={[PLATE_X, PLATE_Y + 12, 3, PLATE_H - 24]} fill={`${tint}99`} />
      <circle
         cx={FLAME_C[0]}
         cy={FLAME_C[1]}
         r={7}
         fill={`${tint}1f`}
         stroke={`${tint}66`}
         vectorEffect={NON_SCALING}
      />
      <path d={FLAME_D} transform={FLAME_T} fill={tint} />
      <Bar box={[208, 33, 46, 5]} fill={W40} />
      <Bar box={[208, 41, 28, 3]} fill={W16} />
      {LINES.map(([y, w], i) => (
         <motion.g key={y} style={{ originX: 0 }} {...loopProps(LINE_LOOPS[i])}>
            <Bar
               box={[TEXT_X, y, w, 3]}
               fill={i === REVISED ? `${tint}66` : W16}
            />
         </motion.g>
      ))}
      <Wire d={`M${TEXT_X},${RAIL_Y} H274`} />
      {COMMIT_X.map((x) => (
         <circle key={x} cx={x} cy={RAIL_Y} r={2} fill={W16} />
      ))}
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Feed tint={tint} />
      <Shelves tint={tint} />
      <NewBook tint={tint} />
      <Plate tint={tint} />
   </>
);

/* status pill, the same chip the site puts on every chapter */
const pill = (color: string, border: string): CSSProperties => ({
   ...label,
   left: pctX(PILL_AT[0]),
   top: pctY(PILL_AT[1]),
   transform: "translateY(-50%)",
   padding: "2px 5px",
   borderRadius: 999,
   border: `1px solid ${border}`,
   color,
});

const LibraryScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="72% 40%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      <Label at={[42, 22]} color={W40}>
         RSS
      </Label>
      <motion.span style={pill(W55, W16)} {...loopProps(DRAFT)}>
         DRAFT
      </motion.span>
      <motion.span style={pill(W70, `${tint}99`)} {...loopProps(REVISING)}>
         REVISING
      </motion.span>
      <motion.span style={pill(GREEN, `${GREEN}66`)} {...loopProps(FINAL)}>
         FINAL
      </motion.span>
      {COMMITS.map((loop, i) => (
         <Pip
            key={COMMIT_X[i]}
            at={[COMMIT_X[i], RAIL_Y]}
            color={i === COMMITS.length - 1 ? GREEN : tint}
            loop={loop}
         />
      ))}
   </Shell>
);

export default LibraryScene;
