import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
   Bar,
   Label,
   Packet,
   Panel,
   Shell,
   Trace,
   Wire,
} from "./kit/primitives";
import {
   DOTS,
   NON_SCALING,
   W03,
   W06,
   W10,
   W16,
   W25,
   W40,
   W55,
   W70,
   backAtFor,
   clock,
   loopProps,
   ride,
   route,
   sCurve,
   shown,
} from "./kit/sceneTokens";
import type { Box, Loop, Stop, TintProps } from "./kit/sceneTokens";

/*
 * GitScope: the Chrome extension on a GitHub profile. content.js spots the
 * profile page (a ring on the avatar), background.js sends one GraphQL query
 * from the toolbar icon, and dashboard.js injects the GitScope panel into
 * `.Layout-sidebar` under the h-card: the stats grid pops in, the languages
 * bar grows, the Recent Activity heatmap lands and the Contribution Breakdown
 * donut draws. The loop opens on the injected panel, so the frozen Reduced
 * frame is the finished sidebar: it clears, re-injects, then holds.
 * One 6 s loop, 11 animated nodes.
 */

const beat = clock(6);
/* the panel fades out of the sidebar here at the top of every loop */
const CLEAR = [0.03, 0.07];
const backAt = backAtFor(CLEAR);
/* children reset while the panel is hidden, then return at `at` */
const afterClear = (at: number, ramp: number) => [
   0,
   0.07,
   0.08,
   at,
   at + ramp,
   1,
];

/* browser window and the two page columns */
const WINDOW: Box = [20, 10, 280, 182];
const TOOLBAR_Y = 30;
const ICON: Box = [270, 14, 12, 12];
const AVATAR = { cx: 48, cy: 50, r: 12 };
const SLOT: Box = [30, 66, 106, 106];
const MAIN_X = 146;
const MAIN_W = 144;

/* panel interior, in the order dashboard.js appends sections */
const IN_X = 34;
const IN_W = 98;
const TILE_W = 30;
const TILE_H = 11;
const TILE_XS = [34, 68, 102];
const TILE_YS = [84, 97];
const LANG_Y = 113;
const LANG_SHARES = [26, 22, 15, 12, 10, 13];
const LANG_ALPHAS = ["ff", "c7", "99", "73", "52", "38"];
const HEAT_COLS = 13;
const HEAT_ROWS = 4;
const HEAT_X = 34;
const HEAT_Y = 120;
const HEAT_PITCH = 5.5;
const HEAT_CELL = 4.5;
const HEAT_ALPHAS = ["1a", "40", "73", "b3"];
const DONUT = { cx: 123, cy: 130.5, r: 8 };
/* Activity by Day, Sunday first; Thursday is the busiest */
const WEEKDAYS: [string, number][] = [
   ["sun", 5],
   ["mon", 4],
   ["tue", 5],
   ["wed", 4],
   ["thu", 9],
   ["fri", 3],
   ["sat", 5],
];
const BUSIEST = 9;

const QUERY = route(sCurve([AVATAR.cx + 14, 46], [ICON[0], 20]));
const RESPONSE = route(sCurve([ICON[0], 25], [SLOT[0] + SLOT[2], 74]));
const QUERY_STOPS: Stop[] = [
   [0.1, 0],
   [0.24, 1],
];
const RESPONSE_STOPS: Stop[] = [
   [0.3, 0],
   [0.44, 1],
];

const DETECT = beat({
   times: [0, 0.07, 0.09, 0.16, 1],
   opacity: [0, 0, 0.9, 0, 0],
   scale: [0.85, 0.85, 0.85, 1.3, 0.85],
});
const ICON_PULSE = beat({
   times: [0, 0.24, 0.27, 0.32, 1],
   scale: [1, 1, 1.25, 1, 1],
});
const GRAPHQL_TAG = beat(shown(0.22, 0.42));
const SEND = beat(ride(QUERY, QUERY_STOPS));
const RETURN = beat(ride(RESPONSE, RESPONSE_STOPS));
const INJECT = beat({ ...backAt(0.44, 0.05), y: [0, 0, -6, -6, 0, 0] });
const TITLE = beat(backAt(0.44, 0.05));
const STATS = beat({
   times: afterClear(0.5, 0.05),
   opacity: [1, 1, 0, 0, 1, 1],
   scale: [1, 1, 0.92, 0.92, 1, 1],
});
const LANGS = beat({
   times: afterClear(0.56, 0.08),
   scaleX: [1, 1, 0, 0, 1, 1],
});
const HEAT = beat({
   times: afterClear(0.62, 0.05),
   opacity: [1, 1, 0, 0, 1, 1],
});
const DONUT_DRAW = beat({
   times: afterClear(0.68, 0.12),
   pathLength: [0.82, 0.82, 0, 0, 0.82, 0.82],
   opacity: [1, 1, 0, 0, 1, 1],
});

/* full ring from the top, clockwise, as two half arcs */
const DONUT_D = [
   `M${DONUT.cx},${DONUT.cy - DONUT.r}`,
   `a${DONUT.r},${DONUT.r} 0 1 1 0,${DONUT.r * 2}`,
   `a${DONUT.r},${DONUT.r} 0 1 1 0,${-DONUT.r * 2}`,
].join(" ");

const LANG_SEGMENTS = LANG_SHARES.map((w, i) => ({
   x: IN_X + LANG_SHARES.slice(0, i).reduce((sum, s) => sum + s, 0),
   w,
   alpha: LANG_ALPHAS[i],
}));

const HEAT_CELLS = Array.from({ length: HEAT_COLS * HEAT_ROWS }, (_, i) => {
   const col = Math.floor(i / HEAT_ROWS);
   const row = i % HEAT_ROWS;
   return {
      key: i,
      x: HEAT_X + col * HEAT_PITCH,
      y: HEAT_Y + row * HEAT_PITCH,
      alpha: HEAT_ALPHAS[(col * 3 + row * 5 + ((col * row) % 3)) % 4],
   };
});

const Reveal = ({
   loop,
   origin,
   children,
}: Readonly<{ loop: Loop; origin?: number; children: ReactNode }>) => (
   <motion.g style={{ originX: origin }} {...loopProps(loop)}>
      {children}
   </motion.g>
);

/* traffic lights, the URL pill, and the GitScope icon (grid plus lens) */
const Toolbar = ({ tint }: TintProps) => (
   <>
      <Panel box={WINDOW} rx={8} />
      {[30, 37, 44].map((cx) => (
         <circle key={cx} cx={cx} cy={20} r={2} fill={W16} />
      ))}
      <Panel box={[54, 14, 150, 12]} rx={6} fill={W06} stroke={W06} />
      <Wire d={`M20,${TOOLBAR_Y} H300`} />
      <motion.g {...loopProps(ICON_PULSE)}>
         <Panel box={ICON} rx={3} fill={`${tint}33`} stroke={tint} />
         <circle
            cx={ICON[0] + 5.5}
            cy={ICON[1] + 5.5}
            r={2.6}
            fill="none"
            stroke={W70}
            strokeWidth={1}
         />
         <Wire
            d={`M${ICON[0] + 7.5},${ICON[1] + 7.5} L${ICON[0] + 9.5},${ICON[1] + 9.5}`}
            stroke={W70}
         />
      </motion.g>
   </>
);

/* the profile h-card: avatar, name, handle, follow button */
const HCard = ({ tint }: TintProps) => (
   <>
      <circle
         cx={AVATAR.cx}
         cy={AVATAR.cy}
         r={AVATAR.r}
         fill={W06}
         stroke={W16}
         vectorEffect={NON_SCALING}
      />
      <circle cx={AVATAR.cx} cy={AVATAR.cy - 3} r={4} fill={W16} />
      <Bar box={[AVATAR.cx - 7, AVATAR.cy + 3, 14, 5]} fill={W16} />
      <motion.circle
         cx={AVATAR.cx}
         cy={AVATAR.cy}
         r={AVATAR.r + 3}
         fill="none"
         stroke={tint}
         vectorEffect={NON_SCALING}
         {...loopProps(DETECT)}
      />
      <Bar box={[66, 42, 50, 4]} fill={W40} />
      <Bar box={[66, 49, 34, 3]} fill={W16} />
      <Panel box={[66, 55, 40, 7]} rx={3.5} fill={W03} />
   </>
);

/* the profile's own content: tabs, README, four pinned repos */
const PinnedCard = ({
   x,
   y,
   tint,
}: Readonly<{ x: number; y: number; tint: string }>) => (
   <>
      <Panel box={[x, y, 70, 32]} rx={5} />
      <Panel box={[x + 6, y + 6, 5, 6]} rx={1} fill="none" stroke={W25} />
      <Bar box={[x + 14, y + 7, 34, 3.5]} fill={`${tint}66`} />
      <Bar box={[x + 6, y + 16, 52, 2.5]} fill={W10} />
      <circle cx={x + 8} cy={y + 25} r={2} fill={W25} />
      <Bar box={[x + 13, y + 24, 18, 2]} fill={W16} />
   </>
);

/* Overview, Repositories, Projects, Packages: [x, width, ink] */
const TABS: [number, number, string][] = [
   [148, 20, W55],
   [176, 22, W16],
   [206, 18, W16],
   [232, 16, W16],
];

const MainColumn = ({ tint }: TintProps) => (
   <>
      {TABS.map(([x, w, fill]) => (
         <Bar key={x} box={[x, 39, w, 3]} fill={fill} />
      ))}
      <Bar box={[MAIN_X, 46, 24, 1.6]} fill={tint} />
      <Wire d={`M${MAIN_X},48 H${MAIN_X + MAIN_W}`} />
      <Panel box={[MAIN_X, 54, MAIN_W, 38]} rx={6} />
      <Bar box={[154, 61, 60, 4]} fill={W40} />
      {[120, 104, 84].map((w, i) => (
         <Bar key={w} box={[154, 70 + i * 6, w, 2.5]} fill={W10} />
      ))}
      {[98, 136].map((y) =>
         [MAIN_X, MAIN_X + 74].map((x) => (
            <PinnedCard key={`${x}:${y}`} x={x} y={y} tint={tint} />
         )),
      )}
   </>
);

/* one stat card: value over label, the Streak card's value in the tint */
const StatTile = ({
   x,
   y,
   value,
}: Readonly<{ x: number; y: number; value: string }>) => (
   <>
      <Panel box={[x, y, TILE_W, TILE_H]} rx={2.5} />
      <Bar box={[x + 5, y + 2.5, 14, 3]} fill={value} />
      <Bar box={[x + 5, y + 7, 18, 2]} fill={W16} />
   </>
);

const InsightsPanel = ({ tint }: TintProps) => (
   <Reveal loop={INJECT}>
      <Panel box={SLOT} rx={6} />
      <Panel box={[100, 70.5, 30, 5]} rx={2.5} fill={W06} stroke={W06} />
      <Wire d={`M${SLOT[0]},80 H${SLOT[0] + SLOT[2]}`} />
      <Reveal loop={STATS}>
         {TILE_YS.map((y, row) =>
            TILE_XS.map((x, col) => (
               <StatTile
                  key={`${x}:${y}`}
                  x={x}
                  y={y}
                  value={row === 0 && col === 2 ? tint : W55}
               />
            )),
         )}
      </Reveal>
      <Reveal loop={LANGS} origin={0}>
         {LANG_SEGMENTS.map(({ x, w, alpha }) => (
            <rect
               key={x}
               x={x}
               y={LANG_Y}
               width={w}
               height={3}
               fill={`${tint}${alpha}`}
            />
         ))}
      </Reveal>
      <Reveal loop={HEAT}>
         {HEAT_CELLS.map(({ key, x, y, alpha }) => (
            <rect
               key={key}
               x={x}
               y={y}
               width={HEAT_CELL}
               height={HEAT_CELL}
               rx={1}
               fill={`${tint}${alpha}`}
            />
         ))}
      </Reveal>
      <circle
         cx={DONUT.cx}
         cy={DONUT.cy}
         r={DONUT.r}
         fill="none"
         stroke={W06}
         strokeWidth={3}
      />
      <Trace d={DONUT_D} color={tint} width={3} loop={DONUT_DRAW} />
      {WEEKDAYS.map(([day, h], i) => (
         <rect
            key={day}
            x={IN_X + i * 14}
            y={160 - h}
            width={11}
            height={h}
            rx={1}
            fill={h === BUSIEST ? `${tint}66` : W10}
         />
      ))}
      <Wire d={`M${IN_X},${LANG_Y + 4.5} H${IN_X + IN_W}`} stroke={W06} />
   </Reveal>
);

const Stage = ({ tint }: TintProps) => (
   <>
      <Toolbar tint={tint} />
      <HCard tint={tint} />
      <MainColumn tint={tint} />
      <InsightsPanel tint={tint} />
   </>
);

const ExtensionScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="22% 58%"
      texture={DOTS}
      stage={<Stage tint={tint} />}
   >
      <Packet color={tint} loop={SEND} />
      <Packet color={tint} loop={RETURN} />
      <Label at={[60, 20]} color={W55}>
         GITHUB.COM
      </Label>
      <Label at={[214, 20]} color={W70} loop={GRAPHQL_TAG}>
         GRAPHQL
      </Label>
      <Label at={[36, 73]} color={W70} loop={TITLE}>
         GITSCOPE
      </Label>
   </Shell>
);

export default ExtensionScene;
