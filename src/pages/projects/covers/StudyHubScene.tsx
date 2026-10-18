import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Shell, Wire } from "./kit/primitives";
import {
   COLUMNS,
   INK,
   NON_SCALING,
   W06,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   line,
   loopProps,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Box, Loop, Pt, Stop } from "./kit/sceneTokens";

/*
 * Noobathon (Team SKS): Study HUB, a static study-material site. Under the
 * doodled hero banner (HOME, ABOUT, FEEDBACK, COURSES), a visitor drills
 * down three pages: "Courses we offer" opens the BTech dropdown and picks
 * CSE (index.html), the CSE page selects the Year 1 tab and the Java
 * subject box (btech_cse.html), and the resources page fills its three
 * columns: Notes, Tutorials, Previous Year Papers (ds.html). The cursor
 * rides through each pick. The loop opens on the finished drill-down, so
 * the frozen Reduced frame shows every page filled; it clears and replays.
 * One 6 s loop, 8 animated nodes.
 */

const beat = clock(6);
/* picks and resources fade out here at the top of every loop */
const CLEAR = [0.03, 0.07];
/* shown at rest, gone during CLEAR, back at `at` */
const OUT_IN = [1, 1, 0, 0, 1, 1];
const backAt = (at: number, ramp = 0.04) => [0, ...CLEAR, at, at + ramp, 1];
const revealAt = (at: number, from = 0): Loop =>
   beat({
      times: backAt(at),
      opacity: OUT_IN,
      y: [0, 0, from, from, 0, 0],
   });

const HEAD: Box = [26, 16, 268, 26];
const PANEL_Y = 50;
const PANEL_H = 114;

/* index.html: Courses we offer */
const COURSES_X = 26;
const TILE_W = 31;
const TILE_H = 22;
const TILES: Pt[] = [
   [32, 66],
   [67, 66],
   [32, 92],
   [67, 92],
];
const DROP: Box = [32, 89, TILE_W, 46];
const DROP_ROWS = [93, 101.5, 110, 118.5, 127];
const DROP_BARS = [12, 12, 14, 16, 20];

/* btech_cse.html: Year tabs and subject boxes */
const CSE_X = 110;
const TAB_Y = 69;
const TAB_X = [116, 136, 156, 176];
const BOX_Y = 92;
const BOX_W = 24;
const BOX_H = 30;
const BOX_X = [116, 144, 172];

/* ds.html: Notes, Tutorials, Previous Year Papers */
const DS_X = 214;
const COL_X = [220, 245, 270];
const ITEM_Y = [72, 100];

/* the visitor's cursor: BTech, CSE, Year 1, Java, the first note */
const BTECH: Pt = [47.5, 77];
const CSE: Pt = [47.5, DROP_ROWS[0] + 1.25];
const YEAR_1: Pt = [TAB_X[0] + 8.5, TAB_Y + 3.5];
const JAVA: Pt = [BOX_X[0] + BOX_W / 2, BOX_Y + 12];
const NOTE: Pt = [COL_X[0] + 8.5, ITEM_Y[0] + 11];
const CURSOR_ROUTE = route(
   line(BTECH, CSE),
   sCurve(CSE, YEAR_1),
   line(YEAR_1, JAVA),
   sCurve(JAVA, NOTE),
);
const [AT_CSE, AT_TAB, AT_JAVA] = CURSOR_ROUTE.ends;
const CURSOR_STOPS: Stop[] = [
   [0.08, 0],
   [0.12, 0],
   [0.16, AT_CSE],
   [0.2, AT_CSE],
   [0.3, AT_TAB],
   [0.33, AT_TAB],
   [0.37, AT_JAVA],
   [0.42, AT_JAVA],
   [0.54, 1],
];

/* ---------------- timeline ---------------- */

const CURSOR = beat(ride(CURSOR_ROUTE, CURSOR_STOPS));
const DROPDOWN = beat({
   times: backAt(0.12),
   opacity: OUT_IN,
   y: [0, 0, -5, -5, 0, 0],
});
const PICK_CSE = beat({ times: backAt(0.16), opacity: OUT_IN });
const PICK_YEAR = beat({ times: backAt(0.3), opacity: OUT_IN });
const PICK_JAVA = beat({ times: backAt(0.37), opacity: OUT_IN });
const COLUMN_IN = [0.56, 0.62, 0.68].map((at) => revealAt(at, 5));

const Reveal = ({
   loop,
   children,
}: Readonly<{ loop: Loop; children: ReactNode }>) => (
   <motion.g {...loopProps(loop)}>{children}</motion.g>
);

/* ---------------- hero banner ---------------- */

/* the doodled hero: a target with its arrow, a set square, the nav */
const Banner = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={HEAD} rx={6} fill={`${tint}1a`} />
      {[8, 5, 2].map((r) => (
         <circle
            key={r}
            cx={46}
            cy={29}
            r={r}
            fill="none"
            stroke={W16}
            vectorEffect={NON_SCALING}
         />
      ))}
      <Wire d="M60,19 L47,28 M57,19 h3 v3" stroke={W16} />
      <Wire
         d="M262,37 L282,21 L282,37 Z M268,37 V33 M274,37 V31"
         stroke={W16}
      />
      {[
         [124, 12],
         [140, 13],
         [157, 19],
         [180, 17],
      ].map(([x, w]) => (
         <Bar key={x} box={[x, 20, w, 2]} fill={W55} />
      ))}
   </>
);

/* ---------------- courses ---------------- */

const Courses = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={[COURSES_X, PANEL_Y, 70, PANEL_H]} rx={7} />
      {TILES.map(([x, y]) => (
         <g key={x * 1000 + y}>
            <Panel box={[x, y, TILE_W, TILE_H]} rx={4} />
            <Bar box={[x + 7, y + 9.5, 17, 3]} fill={W40} />
         </g>
      ))}
      <motion.g {...loopProps(DROPDOWN)}>
         <rect
            x={DROP[0]}
            y={DROP[1]}
            width={DROP[2]}
            height={DROP[3]}
            rx={3}
            fill={INK}
         />
         <Panel box={DROP} rx={3} stroke={W16} />
         <Reveal loop={PICK_CSE}>
            <rect
               x={DROP[0] + 2}
               y={DROP_ROWS[0] - 2.5}
               width={DROP[2] - 4}
               height={7.5}
               rx={2}
               fill={`${tint}40`}
            />
         </Reveal>
         {DROP_ROWS.map((y, i) => (
            <Bar
               key={y}
               box={[DROP[0] + 5, y, DROP_BARS[i], 2.5]}
               fill={i === 0 ? W70 : W25}
            />
         ))}
      </motion.g>
   </>
);

/* ---------------- subjects ---------------- */

/* Java cup, networking nodes, database cylinder: the Year 1 boxes */
const glyphs = (cy: number): string[] => {
   const [a, b, c] = BOX_X.map((x) => x + BOX_W / 2);
   return [
      `M${a - 4},${cy - 2} h7 v3.5 q0,3 -3.5,3 q-3.5,0 -3.5,-3 Z M${a + 3},${cy - 1} q3,0 3,1.75 q0,1.75 -3,1.75 M${a - 1.5},${cy - 6.5} v2.5 M${a + 1},${cy - 6.5} v2.5`,
      `M${b},${cy - 4} L${b - 5},${cy + 3.5} M${b},${cy - 4} L${b + 5},${cy + 3.5} M${b - 5},${cy + 3.5} H${b + 5}`,
      `M${c - 5},${cy - 3} V${cy + 3} A5,1.8 0 0 0 ${c + 5},${cy + 3} V${cy - 3} M${c - 5},${cy} A5,1.8 0 0 0 ${c + 5},${cy}`,
   ];
};
const GLYPHS = glyphs(BOX_Y + 11);
const NET_NODES: Pt[] = [
   [BOX_X[1] + 12, BOX_Y + 7],
   [BOX_X[1] + 7, BOX_Y + 14.5],
   [BOX_X[1] + 17, BOX_Y + 14.5],
];

const Subjects = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={[CSE_X, PANEL_Y, 94, PANEL_H]} rx={7} />
      <Panel box={[116, 56, 58, 8]} rx={2} />
      <rect x={177} y={56} width={21} height={8} rx={2} fill={`${tint}59`} />
      <Bar box={[183, 59, 9, 2]} fill={W70} />
      {TAB_X.map((x) => (
         <g key={x}>
            <Panel box={[x, TAB_Y, 17, 7]} rx={2} />
            <Bar box={[x + 4, TAB_Y + 2.5, 9, 2]} fill={W25} />
         </g>
      ))}
      <Reveal loop={PICK_YEAR}>
         <Panel
            box={[TAB_X[0], TAB_Y, 17, 7]}
            rx={2}
            fill={`${tint}40`}
            stroke={`${tint}99`}
         />
      </Reveal>
      {BOX_X.map((x) => (
         <g key={x}>
            <Panel box={[x, BOX_Y, BOX_W, BOX_H]} rx={4} />
            <Bar box={[x + 4, BOX_Y + 23, 16, 2.5]} fill={W25} />
            <Panel
               box={[x, BOX_Y + 38, BOX_W, BOX_H]}
               rx={4}
               fill="none"
               stroke={W06}
            />
            <Bar box={[x + 4, BOX_Y + 61, 16, 2.5]} fill={W06} />
         </g>
      ))}
      <Reveal loop={PICK_JAVA}>
         <Panel
            box={[BOX_X[0], BOX_Y, BOX_W, BOX_H]}
            rx={4}
            fill={`${tint}14`}
            stroke={tint}
         />
      </Reveal>
      {GLYPHS.map((d) => (
         <Wire key={d} d={d} stroke={W55} />
      ))}
      {NET_NODES.map(([x, y]) => (
         <circle
            key={x * 1000 + y}
            cx={x}
            cy={y}
            r={1.6}
            fill={INK}
            stroke={W55}
            vectorEffect={NON_SCALING}
         />
      ))}
      <ellipse
         cx={BOX_X[2] + BOX_W / 2}
         cy={BOX_Y + 8}
         rx={5}
         ry={1.8}
         fill="none"
         stroke={W55}
         vectorEffect={NON_SCALING}
      />
   </>
);

/* ---------------- resources ---------------- */

/* a book cover with its spine and title */
const Book = ({ x, y }: Readonly<{ x: number; y: number }>) => (
   <>
      <Panel box={[x, y, 17, 22]} rx={2} fill={W06} stroke={W16} />
      <Wire d={`M${x + 3.5},${y} V${y + 22}`} stroke={W16} />
      <Bar box={[x + 6, y + 5, 8, 2]} fill={W40} />
   </>
);

/* an embedded tutorial video with its play button */
const Video = ({
   tint,
   x,
   y,
}: Readonly<{ tint: string; x: number; y: number }>) => (
   <>
      <Panel box={[x, y + 3, 19, 14]} rx={2} fill={W06} stroke={W16} />
      <path
         d={`M${x + 7.5},${y + 6.5} L${x + 13},${y + 10} L${x + 7.5},${y + 13.5} Z`}
         fill={tint}
      />
      <Bar box={[x + 2, y + 20, 12, 2]} fill={W25} />
   </>
);

/* a previous year paper, ruled */
const Paper = ({ x, y }: Readonly<{ x: number; y: number }>) => (
   <>
      <Panel box={[x, y, 17, 22]} rx={2} fill={W06} stroke={W16} />
      {[5, 9, 13, 17].map((dy) => (
         <Bar
            key={dy}
            box={[x + 3, y + dy, dy === 5 ? 7 : 11, 1.5]}
            fill={W25}
         />
      ))}
   </>
);

const Resources = ({ tint }: Readonly<{ tint: string }>) => {
   const [notes, tutorials, papers] = COLUMN_IN;
   return (
      <>
         <Panel box={[DS_X, PANEL_Y, 80, PANEL_H]} rx={7} />
         {COL_X.map((x) => (
            <Bar key={x} box={[x, 65, 15, 2.5]} fill={W40} />
         ))}
         {COL_X.flatMap((x) =>
            ITEM_Y.map((y) => (
               <Panel
                  key={x * 1000 + y}
                  box={[x, y, 18, 22]}
                  rx={2}
                  fill="none"
                  stroke={W06}
               />
            )),
         )}
         <Reveal loop={notes}>
            {ITEM_Y.map((y) => (
               <Book key={y} x={COL_X[0]} y={y} />
            ))}
         </Reveal>
         <Reveal loop={tutorials}>
            {ITEM_Y.map((y) => (
               <Video key={y} tint={tint} x={COL_X[1]} y={y} />
            ))}
         </Reveal>
         <Reveal loop={papers}>
            {ITEM_Y.map((y) => (
               <Paper key={y} x={COL_X[2]} y={y} />
            ))}
         </Reveal>
      </>
   );
};

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Banner tint={tint} />
      <Courses tint={tint} />
      <Subjects tint={tint} />
      <Resources tint={tint} />
   </>
);

const StudyHubScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="50% 20%"
      texture={COLUMNS}
      stage={<Stage tint={tint} />}
   >
      <Packet color={W70} loop={CURSOR} />
      <Label at={[160, 33]} color={W70} centered>
         STUDY HUB
      </Label>
      <Label at={[32, 58]} color={W55}>
         COURSES
      </Label>
      <Label at={[116, 86]} color={W55}>
         YEAR 1
      </Label>
      <Label at={[220, 57]} color={W55}>
         NOTES
      </Label>
   </Shell>
);

export default StudyHubScene;
