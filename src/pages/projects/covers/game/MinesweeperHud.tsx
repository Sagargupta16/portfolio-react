import { useId } from "react";
import { motion } from "motion/react";
import { AMBER, GREEN, MONO_FONT } from "@/constants/theme";
import {
   CYCLE,
   FADE,
   LCD,
   MINE_AT,
   RESET,
   SCORE_X,
   TIME_X,
   ringAt,
} from "./minesweeperBoard";
import {
   INK,
   NON_SCALING,
   NONE,
   ROUND,
   WHITE_85,
   beats,
   clock,
   loop,
} from "./shared";

/*
 * The Minesweeper HUD strip: ScoreScript's {0:000} LCD counting the flood,
 * the smiley that dies on the mine, and TimerScript's per move countdown.
 */

const t = clock(CYCLE);
const at = beats(CYCLE);
const SMILEY = { x: 50.7, y: 19.5, r: 3 };
const SCORE_ROWS = ["000", "005", "021", "031", "038"];
const TIME_ROWS = ["060", "059", "058"];
const hairline = {
   fill: NONE,
   strokeWidth: 1,
   vectorEffect: NON_SCALING,
} as const;

const SCORE_TIMES = [
   0,
   ...[0, 1, 2, 3].flatMap((k) => [t(ringAt(k)), t(ringAt(k) + 0.08)]),
   t(5.35),
   t(5.5),
   1,
];
const SCORE_Y = [
   0,
   ...[0, 1, 2, 3].flatMap((k) => [-LCD.h * k, -LCD.h * (k + 1)]),
   -LCD.h * 4,
   0,
   0,
];
/* timeReset refills to 060 on the safe click; isTimer stops at the mine. */
const TIME_TIMES = [0, 1, 1.08, 2, 2.08, 3, 3.08, 5.35, 5.45, 5.9, 6].map(t);
const TIME_Y = [1, 1, 0, 0, 1, 1, 2, 2, 0, 0, 1].map((row) => -LCD.h * row);

const DEAD_TIMES = at(MINE_AT, MINE_AT + FADE, RESET, RESET + FADE);
const DEAD_OPACITY = [0, 0, 1, 1, 0, 0];

/* A seven-segment style LCD whose digit rows roll on the storyboard clock. */
const Lcd = ({
   x,
   rows,
   values,
   times,
   tint,
}: {
   x: number;
   rows: string[];
   values: number[];
   times: number[];
   tint: string;
}) => {
   const clipId = `lcd${useId().replaceAll(/\W/g, "")}`;
   return (
      <>
         <clipPath id={clipId}>
            <rect x={x} y={LCD.y} width={LCD.w} height={LCD.h} rx={1} />
         </clipPath>
         <rect
            x={x}
            y={LCD.y}
            width={LCD.w}
            height={LCD.h}
            rx={1}
            fill="rgba(0,0,0,0.35)"
            stroke={`${tint}55`}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
         <g clipPath={`url(#${clipId})`}>
            <motion.g
               initial={{ y: values[0] }}
               animate={{ y: values }}
               transition={loop(CYCLE, times)}
            >
               {rows.map((row, i) => (
                  <text
                     key={row}
                     x={x + LCD.w / 2}
                     y={LCD.y + LCD.h * (i + 0.5)}
                     fontFamily={MONO_FONT}
                     fontSize={4.6}
                     fontWeight={700}
                     letterSpacing={0.4}
                     textAnchor="middle"
                     dominantBaseline="central"
                     fill={tint}
                  >
                     {row}
                  </text>
               ))}
            </motion.g>
         </g>
      </>
   );
};

/* The smiley button: green while alive, the dead face once a mine is hit. */
const Smiley = () => (
   <g transform={`translate(${SMILEY.x} ${SMILEY.y})`}>
      <circle r={SMILEY.r} stroke={GREEN} {...hairline} />
      <circle cx={-1} cy={-0.7} r={0.35} fill={WHITE_85} />
      <circle cx={1} cy={-0.7} r={0.35} fill={WHITE_85} />
      <path
         d="M-1.3 0.7Q0 1.9 1.3 0.7"
         stroke={WHITE_85}
         strokeLinecap={ROUND}
         {...hairline}
      />
      <motion.g
         initial={{ opacity: 0 }}
         animate={{ opacity: DEAD_OPACITY }}
         transition={loop(CYCLE, DEAD_TIMES)}
      >
         <circle
            r={SMILEY.r}
            fill={INK}
            stroke={AMBER}
            strokeWidth={1}
            vectorEffect={NON_SCALING}
         />
         <path
            d="M-1.5 -1.2L-0.6 -0.3M-0.6 -1.2L-1.5 -0.3M0.6 -1.2L1.5 -0.3M1.5 -1.2L0.6 -0.3M-1.3 1.4Q0 0.4 1.3 1.4"
            stroke={AMBER}
            strokeLinecap={ROUND}
            {...hairline}
         />
      </motion.g>
   </g>
);

const MinesweeperHud = ({ tint }: { tint: string }) => (
   <>
      <Lcd
         x={SCORE_X}
         rows={SCORE_ROWS}
         values={SCORE_Y}
         times={SCORE_TIMES}
         tint={tint}
      />
      <Lcd
         x={TIME_X}
         rows={TIME_ROWS}
         values={TIME_Y}
         times={TIME_TIMES}
         tint={tint}
      />
      <Smiley />
   </>
);

export default MinesweeperHud;
