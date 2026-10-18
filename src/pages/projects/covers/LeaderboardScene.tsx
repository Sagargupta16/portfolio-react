import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Panel, Shell, Wire } from "./kit/primitives";
import {
   RAILS,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   clock,
   loopProps,
   ride,
   route,
   sCurve,
} from "./kit/sceneTokens";
import type { Box, Loop, Pt, Stop, TintProps } from "./kit/sceneTokens";

/*
 * Instagram Likes Leaderboard: the bundle is pasted into the DevTools
 * console on your own profile, the scanner walks the post grid one post at
 * a time, and each post's returned likers are tallied into a ranked board.
 * A heart rides from two scanned posts to the second-placed account, its
 * identified-likes bar grows past the leader and the two rows swap, so the
 * trophy changes hands. Then the board flips to the other tab (accounts you
 * do not follow) and back, which also resets the swap while it is hidden.
 * One 6 s loop, 11 animated nodes.
 */

const beat = clock(6);

/* left: DevTools console strip over the profile's post grid */
const CONSOLE_BOX: Box = [26, 16, 100, 18];
const PROFILE_BOX: Box = [26, 40, 100, 132];
const TILE = 28;
const TILE_STEP = 31;
const GRID_X = 30;
const GRID_Y = 70;

/* right: the leaderboard, tabs over ranked rows */
const BOARD_BOX: Box = [146, 16, 148, 156];
const TAB_W = 58;
const TAB_X = [166, 226];
const TAB_Y = 20;
const ROW_Y = [44, 68, 92, 116, 140];
const ROW_STEP = ROW_Y[1] - ROW_Y[0];
const TRACK_X = 226;
const TRACK_W = 44;

const tileAt = (col: number, row: number): Pt => [
   GRID_X + col * TILE_STEP,
   GRID_Y + row * TILE_STEP,
];
const tileCentre = (col: number, row: number): Pt => {
   const [x, y] = tileAt(col, row);
   return [x + TILE / 2, y + TILE / 2];
};

/* a heart from a scanned post to the second-placed account's avatar */
const LAND: Pt = [166, ROW_Y[1] + 10];
const HEART_ROUTES = [
   route(sCurve(tileCentre(1, 0), LAND)),
   route(sCurve(tileCentre(0, 1), LAND)),
];
const HEART_STOPS: Stop[][] = [
   [
      [0.2, 0],
      [0.3, 1],
   ],
   [
      [0.4, 0],
      [0.5, 1],
   ],
];
const HEARTS = HEART_ROUTES.map((r, i) => beat(ride(r, HEART_STOPS[i])));

const PASTE = beat({
   times: [0, 0.01, 0.06, 0.92, 0.96, 1],
   opacity: [0, 1, 1, 1, 0, 0],
   scaleX: [0.05, 0.05, 1, 1, 1, 0.05],
});

/* the scanner's cursor walks five posts, holding on each */
const STEP = TILE_STEP;
const SCAN = beat({
   times: [
      0, 0.06, 0.08, 0.14, 0.18, 0.24, 0.28, 0.34, 0.38, 0.44, 0.48, 0.56, 0.58,
      1,
   ],
   x: [0, 0, 0, 0, STEP, STEP, STEP * 2, STEP * 2, 0, 0, STEP, STEP, STEP, 0],
   y: [0, 0, 0, 0, 0, 0, 0, 0, STEP, STEP, STEP, STEP, STEP, 0],
   opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
});

/* runner up: two hearts land, the bar passes the leader, the rows swap */
const B_START = 0.55;
const A_FRAC = 0.8;
const GROW = beat({
   times: [0, 0.3, 0.33, 0.5, 0.53, 0.82, 0.92, 1],
   scaleX: [B_START, B_START, 0.7, 0.7, 0.9, 0.9, B_START, B_START],
});
const SWAP_TIMES = [0, 0.58, 0.66, 0.82, 0.92, 1];
const LEADER_DOWN = beat({
   times: SWAP_TIMES,
   y: [0, 0, ROW_STEP, ROW_STEP, 0, 0],
});
const RUNNER_UP = beat({
   times: SWAP_TIMES,
   y: [0, 0, -ROW_STEP, -ROW_STEP, 0, 0],
});
const CROWN = beat({
   times: [0, 0.66, 0.69, 0.74, 1],
   scale: [1, 1, 1.45, 1, 1],
});

/* flip to the other tab and back; the swap resets while it is showing */
const TAB_SLIDE = beat({
   times: [0, 0.77, 0.81, 0.94, 0.98, 1],
   x: [0, 0, TAB_X[1] - TAB_X[0], TAB_X[1] - TAB_X[0], 0, 0],
});
const FOLLOWING = beat({
   times: [0, 0.77, 0.8, 0.95, 0.98, 1],
   opacity: [1, 1, 0, 0, 1, 1],
});
const NOT_FOLLOWING = beat({
   times: [0, 0.79, 0.82, 0.93, 0.96, 1],
   opacity: [0, 0, 1, 1, 0, 0],
});

/* Leaderboard rows: [username width, identified-likes fraction] */
type Entry = readonly [name: number, frac: number];
const FOLLOWING_ROWS: Entry[] = [
   [34, A_FRAC],
   [28, B_START],
   [38, 0.42],
   [26, 0.3],
   [32, 0.22],
];
const NOT_FOLLOWING_ROWS: Entry[] = [
   [30, 0.7],
   [36, 0.5],
   [24, 0.36],
   [34, 0.26],
   [28, 0.18],
];

const HEART_D =
   "M5 8.6C2 6.4 0 4.6 0 2.7 0 1.2 1.2 0 2.7 0 3.7 0 4.5 0.5 5 1.4 5.5 0.5 6.3 0 7.3 0 8.8 0 10 1.2 10 2.7 10 4.6 8 6.4 5 8.6Z";

const heartBox: CSSProperties = {
   position: "absolute",
   left: 0,
   top: 0,
   width: 9,
   height: 8,
   marginLeft: -4.5,
   marginTop: -4,
};
const layerStyle: CSSProperties = { position: "absolute", inset: 0 };

/* an identified like in flight: the wrapper fills the stage like Packet */
const Heart = ({ tint, loop }: Readonly<{ tint: string; loop: Loop }>) => (
   <motion.div style={layerStyle} {...loopProps(loop)}>
      <svg viewBox="0 0 10 9" style={heartBox} aria-hidden="true">
         <path d={HEART_D} fill={tint} />
      </svg>
   </motion.div>
);

const Reveal = ({
   loop,
   origin,
   children,
}: Readonly<{ loop: Loop; origin?: number; children: ReactNode }>) => (
   <motion.g style={{ originX: origin }} {...loopProps(loop)}>
      {children}
   </motion.g>
);

/* DevTools console: prompt chevron and the pasted bundle */
const ConsoleStrip = ({ tint }: TintProps) => (
   <>
      <Panel box={CONSOLE_BOX} rx={5} />
      <Wire d="M74,22 L78,25 L74,28" stroke={W40} />
      <Reveal loop={PASTE} origin={0}>
         <Bar box={[82, 23, 38, 4]} fill={`${tint}66`} />
      </Reveal>
   </>
);

/* own profile: avatar, counts, the 3 x 3 post grid and the scan cursor */
const Profile = ({ tint }: TintProps) => {
   const [sx, sy] = tileAt(0, 0);
   return (
      <>
         <Panel box={PROFILE_BOX} rx={7} />
         <circle cx={40} cy={54} r={8} fill={W10} stroke={`${tint}88`} />
         {[54, 78, 102].map((x) => (
            <Bar key={x} box={[x, 57, 18, 2.5]} fill={W16} />
         ))}
         <Wire d="M26,66 H126" />
         {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => {
               const [x, y] = tileAt(col, row);
               return (
                  <rect
                     key={`${col}:${row}`}
                     x={x}
                     y={y}
                     width={TILE}
                     height={TILE}
                     rx={2}
                     fill={(col + row) % 2 === 0 ? W10 : W06}
                  />
               );
            }),
         )}
         <motion.rect
            x={sx}
            y={sy}
            width={TILE}
            height={TILE}
            rx={2}
            fill={`${tint}1f`}
            stroke={tint}
            strokeWidth={1.2}
            {...loopProps(SCAN)}
         />
      </>
   );
};

/* trophy for the top three, a short rank bar below that */
const Rank = ({ y, ink }: Readonly<{ y: number; ink: string }>) => {
   const cx = 156;
   const cy = y + 9;
   return (
      <>
         <path
            d={`M${cx - 3.5},${cy - 4} H${cx + 3.5} V${cy - 1} A3.5,3.5 0 0 1 ${cx - 3.5},${cy - 1} Z`}
            fill={ink}
         />
         <rect x={cx - 0.75} y={cy + 2} width={1.5} height={2.5} fill={ink} />
         <rect x={cx - 2.5} y={cy + 4.5} width={5} height={1.5} fill={ink} />
      </>
   );
};

/* one entry: avatar, username, full name, likes bar, participation */
const Row = ({
   y,
   entry: [name, frac],
   tint,
   grow,
}: Readonly<{ y: number; entry: Entry; tint: string; grow?: Loop }>) => {
   const fill = (
      <rect
         x={TRACK_X}
         y={y + 8.5}
         width={grow ? TRACK_W : TRACK_W * frac}
         height={3.5}
         rx={1.75}
         fill={tint}
      />
   );
   return (
      <>
         <circle cx={174} cy={y + 10} r={5} fill={W10} />
         <Bar box={[184, y + 5, name, 3.5]} fill={W55} />
         <Bar box={[184, y + 12, name - 10, 2.5]} fill={W16} />
         <Bar box={[TRACK_X, y + 8.5, TRACK_W, 3.5]} fill={W06} />
         {grow ? (
            <Reveal loop={grow} origin={0}>
               {fill}
            </Reveal>
         ) : (
            fill
         )}
         <Bar box={[276, y + 8.5, 12, 3]} fill={W25} />
      </>
   );
};

/* the swapping pair carries its own y loop */
const SWAPS: (Loop | undefined)[] = [LEADER_DOWN, RUNNER_UP];

const FollowingList = ({ tint }: TintProps) => (
   <Reveal loop={FOLLOWING}>
      {FOLLOWING_ROWS.map((entry, i) => {
         const y = ROW_Y[i];
         const row = (
            <Row
               y={y}
               entry={entry}
               tint={tint}
               grow={i === 1 ? GROW : undefined}
            />
         );
         const swap = SWAPS[i];
         if (swap) {
            return (
               <Reveal key={y} loop={swap}>
                  {row}
               </Reveal>
            );
         }
         return <g key={y}>{row}</g>;
      })}
   </Reveal>
);

const NotFollowingList = ({ tint }: TintProps) => (
   <Reveal loop={NOT_FOLLOWING}>
      {NOT_FOLLOWING_ROWS.map((entry, i) => (
         <Row key={ROW_Y[i]} y={ROW_Y[i]} entry={entry} tint={`${tint}99`} />
      ))}
   </Reveal>
);

/* silver and bronze trophies under the tinted leader */
const RANK_INKS = [W40, W25];

const Board = ({ tint }: TintProps) => (
   <>
      <Panel box={BOARD_BOX} rx={7} />
      <path d={HEART_D} fill={tint} transform="translate(151 21.5)" />
      <Reveal loop={TAB_SLIDE}>
         <rect
            x={TAB_X[0]}
            y={TAB_Y}
            width={TAB_W}
            height={12}
            rx={6}
            fill={W10}
         />
      </Reveal>
      <Bar box={[TAB_X[1] + 7, TAB_Y + 4.5, 42, 3]} fill={W25} />
      <Wire d="M146,38 H294" />
      <Reveal loop={CROWN}>
         <Rank y={ROW_Y[0]} ink={tint} />
      </Reveal>
      {RANK_INKS.map((ink, i) => (
         <Rank key={ink} y={ROW_Y[i + 1]} ink={ink} />
      ))}
      {ROW_Y.slice(3).map((y) => (
         <Bar key={y} box={[152, y + 8.5, 8, 2.5]} fill={W16} />
      ))}
      <FollowingList tint={tint} />
      <NotFollowingList tint={tint} />
   </>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <ConsoleStrip tint={tint} />
      <Profile tint={tint} />
      <Board tint={tint} />
   </>
);

const LeaderboardScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="70% 40%"
      texture={RAILS}
      stage={<Stage tint={tint} />}
   >
      {HEARTS.map((loop, i) => (
         <Heart key={HEART_ROUTES[i].d} tint={tint} loop={loop} />
      ))}
      <Label at={[32, 25]} color={W55}>
         CONSOLE
      </Label>
      <Label at={[54, 50]} color={W55}>
         POSTS
      </Label>
      <Label at={[171, 26]} color={W70}>
         YOU FOLLOW
      </Label>
   </Shell>
);

export default LeaderboardScene;
