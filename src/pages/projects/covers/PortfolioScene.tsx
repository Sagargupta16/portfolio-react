import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Pip, Shell, Wire } from "./kit/primitives";
import {
   DOTS,
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
   line,
   loopProps,
   ride,
   route,
   sCurve,
   shown,
} from "./kit/sceneTokens";
import type { Box, Loop, Pt, Stop } from "./kit/sceneTokens";

/*
 * This site: every section is fed by a file in data/*.json. One file is
 * read, passes scripts/validate-data.js (the green check), and lands in the
 * page, which is drawn as its own hero: nav with the white Contact Me pill,
 * logo tile, status badge, the two-line display headline, two CTAs and the
 * stats row. The page then scrolls; the Projects section was a placeholder
 * until it neared the viewport and now lazy-loads its cards, whose covers
 * animate. Finally the Ctrl+K command palette opens and its highlight steps
 * down the list before it closes and the page scrolls home.
 * One 6 s loop, 10 animated nodes.
 */

const beat = clock(6);

/* data/*.json column */
const FILE_X = 26;
const FILE_W = 54;
const FILE_H = 22;
const FILE_Y = [34, 64, 94, 124];
const READ = 1;
const VALIDATE: Pt = [100, 92];

/* the page */
const PAGE: Box = [120, 16, 174, 154];
const VIEW_TOP = 30;
const VIEW_H = PAGE[1] + PAGE[3] - VIEW_TOP;
const CX = PAGE[0] + PAGE[2] / 2;
const SCROLL = 128;

const fileEdge = (y: number): Pt => [FILE_X + FILE_W, y + FILE_H / 2];

const FEED = route(
   sCurve(fileEdge(FILE_Y[READ]), VALIDATE),
   line(VALIDATE, [PAGE[0] + 4, VALIDATE[1]]),
);
const AT_GATE = FEED.ends[0];
const FEED_STOPS: Stop[] = [
   [0.08, 0],
   [0.16, AT_GATE],
   [0.2, AT_GATE],
   [0.26, 1],
];

/* ---------------- timeline ---------------- */

const FILE_READ = beat(shown(0.05, 0.3));
const PACKET = beat(ride(FEED, FEED_STOPS));
const PASSED = beat({
   times: [0, 0.16, 0.18, 0.24, 0.27, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   scale: [0.5, 0.5, 1.2, 1, 1, 0.5],
});
const SCROLLED = beat({
   times: [0, 0.28, 0.38, 0.84, 0.94, 1],
   y: [0, 0, -SCROLL, -SCROLL, 0, 0],
});
const LAZY = beat({
   times: [0, 0.34, 0.4, 0.95, 0.98, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   y: [4, 4, 0, 0, 0, 4],
});
const COVER_RUN = beat({
   times: [0, 0.42, 0.52, 0.62, 1],
   x: [0, 0, 26, 0, 0],
});
const COVER_PULSE = beat({
   times: [0, 0.44, 0.5, 0.56, 0.62, 1],
   scale: [1, 1, 1.8, 1, 1.8, 1],
});
const PALETTE = beat({
   times: [0, 0.6, 0.64, 0.78, 0.82, 1],
   opacity: [0, 0, 1, 1, 0, 0],
   scale: [0.94, 0.94, 1, 1, 0.97, 0.94],
});
const ROW_STEP = 12;
const HIGHLIGHT = beat({
   times: [0, 0.67, 0.7, 0.72, 0.75, 0.9, 1],
   y: [0, 0, ROW_STEP, ROW_STEP, ROW_STEP * 2, ROW_STEP * 2, 0],
});
const SHORTCUT = beat(shown(0.62, 0.8));

const Reveal = ({
   loop,
   children,
}: Readonly<{ loop: Loop; children: ReactNode }>) => (
   <motion.g {...loopProps(loop)}>{children}</motion.g>
);

/* ---------------- data files ---------------- */

/* one JSON file: a curly brace, its name, one value line */
const JsonFile = ({ y }: Readonly<{ y: number }>) => {
   const x = FILE_X;
   return (
      <>
         <Panel box={[x, y, FILE_W, FILE_H]} rx={5} />
         <Wire
            d={`M${x + 10},${y + 5} q-3,0 -3,3 v1.5 q0,1.5 -2,1.5 q2,0 2,1.5 v1.5 q0,3 3,3`}
            stroke={W40}
         />
         <Bar box={[x + 15, y + 7, 28, 3]} fill={W40} />
         <Bar box={[x + 15, y + 13, 20, 2]} fill={W16} />
      </>
   );
};

const DataColumn = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      {FILE_Y.map((y) => (
         <Wire key={y} d={route(sCurve(fileEdge(y), VALIDATE)).d} />
      ))}
      <Wire d={`M${VALIDATE[0]},${VALIDATE[1]} H${PAGE[0]}`} />
      {FILE_Y.map((y) => (
         <JsonFile key={y} y={y} />
      ))}
      <Reveal loop={FILE_READ}>
         <Panel
            box={[FILE_X, FILE_Y[READ], FILE_W, FILE_H]}
            rx={5}
            fill={`${tint}14`}
            stroke={`${tint}99`}
         />
      </Reveal>
      <circle
         cx={VALIDATE[0]}
         cy={VALIDATE[1]}
         r={5}
         fill={INK}
         stroke={W25}
         vectorEffect={NON_SCALING}
      />
   </>
);

/* ---------------- page ---------------- */

/* logo tile, nav links, the white Contact Me pill */
const Nav = () => (
   <>
      <Panel box={[PAGE[0] + 6, 19, 8, 8]} rx={2} stroke={W16} />
      {[0, 1, 2, 3, 4].map((i) => (
         <Bar key={i} box={[198 + i * 11, 22, 8, 2]} fill={W16} />
      ))}
      <rect x={256} y={19} width={32} height={8} rx={4} fill={W70} />
      <Bar box={[262, 22, 20, 2]} fill={INK} />
   </>
);

const STAT_X = [151, 179, 207, 235, 263];
const SOCIAL_X = [193.5, 202.5, 211.5, 220.5];

/* hero: logo, status badge, two-line headline, CTAs, stats, socials */
const Hero = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <rect
         x={CX - 6}
         y={36}
         width={12}
         height={12}
         rx={3}
         fill={`${tint}cc`}
      />
      <Bar box={[CX - 3.5, 41, 7, 2.5]} fill={INK} />
      <Panel box={[CX - 24, 53, 48, 8]} rx={4} />
      <circle cx={CX - 18.5} cy={57} r={1.6} fill={GREEN} />
      <Bar box={[CX - 14, 56, 34, 2]} fill={W40} />
      <Bar box={[CX - 55, 67, 110, 9]} fill={W70} />
      <Bar box={[CX - 70, 80, 140, 9]} fill={W40} />
      <Panel box={[CX - 35, 96, 32, 10]} rx={3} fill={W06} />
      <Bar box={[CX - 28, 100, 18, 2]} fill={W55} />
      <rect x={CX + 3} y={96} width={32} height={10} rx={3} fill={tint} />
      <Bar box={[CX + 10, 100, 18, 2]} fill={W70} />
      {STAT_X.map((x) => (
         <g key={x}>
            <Bar box={[x - 7, 114, 14, 5]} fill={`${tint}b3`} />
            <Bar box={[x - 10, 122, 20, 2]} fill={W16} />
         </g>
      ))}
      {SOCIAL_X.map((x) => (
         <circle
            key={x}
            cx={x}
            cy={138}
            r={3.2}
            fill="none"
            stroke={W16}
            vectorEffect={NON_SCALING}
         />
      ))}
   </>
);

const CARD_X = [127, 183, 239];
const CARD_W = 48;
const CARD_Y = VIEW_TOP + SCROLL + 38;
const COVER_H = 28;

/* project card body: title, description, tech chips */
const CardBody = ({ tint, x }: Readonly<{ tint: string; x: number }>) => (
   <>
      <Panel box={[x, CARD_Y, CARD_W, 58]} rx={5} />
      <rect
         x={x + 1}
         y={CARD_Y + 1}
         width={CARD_W - 2}
         height={COVER_H}
         rx={4}
         fill={`${tint}14`}
      />
      <Bar box={[x + 5, CARD_Y + 33, 28, 3]} fill={W55} />
      <Bar box={[x + 5, CARD_Y + 40, 36, 2]} fill={W16} />
      <Bar box={[x + 5, CARD_Y + 45, 30, 2]} fill={W16} />
      <Bar box={[x + 5, CARD_Y + 50, 12, 3]} fill={`${tint}40`} />
      <Bar box={[x + 19, CARD_Y + 50, 10, 3]} fill={W10} />
   </>
);

/* the three covers: a packet between two nodes, a still shot, a pulse */
const Covers = ({ tint }: Readonly<{ tint: string }>) => {
   const [a, b, c] = CARD_X;
   const mid = CARD_Y + 1 + COVER_H / 2;
   return (
      <>
         <Wire d={`M${a + 9},${mid} H${a + 39}`} stroke={`${tint}55`} />
         <circle
            cx={a + 9}
            cy={mid}
            r={3}
            fill={INK}
            stroke={`${tint}99`}
            vectorEffect={NON_SCALING}
         />
         <circle
            cx={a + 39}
            cy={mid}
            r={3}
            fill={INK}
            stroke={`${tint}99`}
            vectorEffect={NON_SCALING}
         />
         <motion.circle
            cx={a + 11}
            cy={mid}
            r={1.6}
            fill={tint}
            {...loopProps(COVER_RUN)}
         />
         <Panel box={[b + 8, CARD_Y + 6, 32, 18]} rx={2} stroke={W16} />
         <Bar box={[b + 12, CARD_Y + 10, 16, 2.5]} fill={W40} />
         <Bar box={[b + 12, CARD_Y + 15, 24, 2]} fill={W16} />
         <circle
            cx={c + 24}
            cy={mid}
            r={6}
            fill="none"
            stroke={`${tint}55`}
            vectorEffect={NON_SCALING}
         />
         <motion.circle
            cx={c + 24}
            cy={mid}
            r={2.2}
            fill={tint}
            {...loopProps(COVER_PULSE)}
         />
      </>
   );
};

/* the Projects section: badge chip, headline, lazy cards over placeholders */
const Projects = ({ tint }: Readonly<{ tint: string }>) => {
   const top = VIEW_TOP + SCROLL;
   return (
      <>
         <Panel box={[CX - 17, top + 6, 34, 8]} rx={4} stroke={`${tint}66`} />
         <Bar box={[CX - 11, top + 9, 22, 2]} fill={W40} />
         <Bar box={[CX - 50, top + 20, 100, 8]} fill={W55} />
         {CARD_X.map((x) => (
            <Panel
               key={x}
               box={[x, CARD_Y, CARD_W, 58]}
               rx={5}
               fill="none"
               stroke={W06}
            />
         ))}
         <Reveal loop={LAZY}>
            {CARD_X.map((x) => (
               <CardBody key={x} tint={tint} x={x} />
            ))}
            <Covers tint={tint} />
         </Reveal>
      </>
   );
};

const PAL: Box = [150, 44, 114, 78];
const PAL_ROWS = [64, 76, 88, 100, 112];
const PAL_BARS = [50, 38, 44, 32, 40];

/* Ctrl+K palette: search row, results, the stepping highlight */
const Palette = ({ tint }: Readonly<{ tint: string }>) => {
   const [x, y, w, h] = PAL;
   return (
      <Reveal loop={PALETTE}>
         <rect x={x} y={y} width={w} height={h} rx={6} fill={INK} />
         <Panel box={PAL} rx={6} stroke={W16} />
         <circle
            cx={x + 8}
            cy={y + 8}
            r={2.4}
            fill="none"
            stroke={W40}
            vectorEffect={NON_SCALING}
         />
         <Bar box={[x + 14, y + 7, 40, 2.5]} fill={W25} />
         <Wire d={`M${x},${y + 15} H${x + w}`} />
         <motion.g {...loopProps(HIGHLIGHT)}>
            <rect
               x={x + 3}
               y={PAL_ROWS[0] - 2}
               width={w - 6}
               height={11}
               rx={3}
               fill={`${tint}24`}
            />
         </motion.g>
         {PAL_ROWS.map((ry, i) => (
            <g key={ry}>
               <rect
                  x={x + 6}
                  y={ry}
                  width={7}
                  height={7}
                  rx={1.5}
                  fill={W10}
               />
               <Bar box={[x + 17, ry + 2.5, PAL_BARS[i], 2]} fill={W25} />
            </g>
         ))}
      </Reveal>
   );
};

const Page = ({ tint }: Readonly<{ tint: string }>) => {
   const [x, , w] = PAGE;
   return (
      <>
         <Panel box={PAGE} rx={8} />
         <Nav />
         {/* the viewport: a nested svg clips the scrolling document */}
         <svg
            aria-hidden="true"
            x={x}
            y={VIEW_TOP}
            width={w}
            height={VIEW_H}
            viewBox={`${x} ${VIEW_TOP} ${w} ${VIEW_H}`}
            preserveAspectRatio="none"
         >
            <Reveal loop={SCROLLED}>
               <Hero tint={tint} />
               <Projects tint={tint} />
            </Reveal>
         </svg>
         <Palette tint={tint} />
      </>
   );
};

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <DataColumn tint={tint} />
      <Page tint={tint} />
   </>
);

const PortfolioScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="62% 40%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      <Packet color={tint} loop={PACKET} />
      <Pip at={VALIDATE} color={GREEN} size={5} loop={PASSED} />
      <Label at={[FILE_X, 24]} color={W55}>
         DATA
      </Label>
      <Label
         at={[PAL[0] + PAL[2] - 37, PAL[1] + 8]}
         color={W40}
         loop={SHORTCUT}
      >
         CTRL K
      </Label>
   </Shell>
);

export default PortfolioScene;
