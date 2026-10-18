import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Bar, Label, Packet, Panel, Shell, Wire } from "./kit/primitives";
import {
   GRID,
   INK,
   NON_SCALING,
   W03,
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
import type { Box, Loop, Pt, Stop } from "./kit/sceneTokens";

/*
 * Contact Manager (MERN): the address book of cards on the left, the
 * contacts collection in MongoDB on the right. "New Contact" is pressed,
 * the form POSTs to /api/contacts, a new document lands at the top of the
 * collection, then getContacts() reloads the list and the new card slides
 * in at the top. Next the search bar ("Search by name, email or tags") is
 * typed into, the other cards dim as the list filters, and the new card is
 * starred as a favourite. The loop opens on the finished address book, so
 * the frozen Reduced frame is the full list: it clears, replays, holds.
 * One 6 s loop, 9 animated nodes.
 */

const beat = clock(6);
/* written things fade out here at the top of every loop */
const CLEAR = [0.03, 0.07];
/* shown at rest, gone during CLEAR, back at `at` */
const OUT_IN = [1, 1, 0, 0, 1, 1];
const backAt = (at: number, ramp = 0.04) => [0, ...CLEAR, at, at + ramp, 1];

/* app window */
const APP: Box = [26, 16, 170, 154];
const INNER_X = 34;
const INNER_W = 154;
const INNER_RIGHT = INNER_X + INNER_W;
const PILL: Box = [146, 38, 42, 11];
const SEARCH: Box = [INNER_X, 56, INNER_W, 12];
const TYPED_X = 48;
const CARD_H = 22;
const CARD_Y = [88, 114, 140];

/* contacts collection */
const DB: Box = [222, 62, 72, 98];
const DOC_X = 228;
const DOC_Y = [84, 98, 112, 126, 140];
const NEW_DOC = DOC_Y[0];

const POST_ROUTE = route(
   sCurve([INNER_RIGHT, PILL[1] + PILL[3] / 2], [DB[0], NEW_DOC + 5]),
);
const RELOAD_ROUTE = route(
   sCurve([DB[0], DOC_Y[2] + 6], [INNER_RIGHT, CARD_Y[0] + CARD_H / 2]),
);

const POST_STOPS: Stop[] = [
   [0.12, 0],
   [0.25, 1],
];
const RELOAD_STOPS: Stop[] = [
   [0.31, 0],
   [0.42, 1],
];

/* ---------------- timeline ---------------- */

const PRESS = beat({
   times: [0, 0.08, 0.1, 0.13, 1],
   scale: [1, 1, 0.9, 1, 1],
});
const POST = beat(ride(POST_ROUTE, POST_STOPS));
const RELOAD = beat(ride(RELOAD_ROUTE, RELOAD_STOPS));
const DOC_IN = beat({
   times: backAt(0.25),
   opacity: OUT_IN,
   x: [0, 0, -5, -5, 0, 0],
});
const CARD_IN = beat({
   times: backAt(0.42),
   opacity: OUT_IN,
   y: [0, 0, -5, -5, 0, 0],
});
const SEARCH_TIMES = [0, 0.5, 0.57, 0.8, 0.84, 1];
const TYPED = beat({
   times: SEARCH_TIMES,
   opacity: [0, 0, 1, 1, 0, 0],
   scaleX: [0, 0, 1, 1, 1, 0],
});
const PLACEHOLDER = beat({
   times: [0, 0.48, 0.5, 0.82, 0.86, 1],
   opacity: [1, 1, 0, 0, 1, 1],
});
const FILTERED = beat({
   times: [0, 0.57, 0.61, 0.8, 0.84, 1],
   opacity: [1, 1, 0.22, 0.22, 1, 1],
});
const STARRED = beat({
   times: backAt(0.66),
   opacity: OUT_IN,
   scale: [1, 1, 0.3, 0.3, 1, 1],
});

/* ---------------- glyphs ---------------- */

const r1 = (v: number) => Math.round(v * 10) / 10;

/* five-point star centred on a point */
const starD = ([cx, cy]: Pt, r: number) => {
   const pts = Array.from({ length: 10 }, (_, i) => {
      const rad = ((i * 36 - 90) * Math.PI) / 180;
      const len = i % 2 === 0 ? r : r * 0.45;
      return `${r1(cx + len * Math.cos(rad))},${r1(cy + len * Math.sin(rad))}`;
   });
   return `M${pts.join(" L")} Z`;
};

const STAR_X = 162;
const PEN_X = 172;
const BIN_X = 181;

const Reveal = ({
   loop,
   children,
}: Readonly<{ loop: Loop; children: ReactNode }>) => (
   <motion.g {...loopProps(loop)}>{children}</motion.g>
);

/* ---------------- app ---------------- */

/* book logo, title, and the dark/light moon toggle */
const Header = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <rect x={34} y={20} width={3.5} height={6} rx={0.8} fill={tint} />
      <rect x={38.5} y={20} width={3.5} height={6} rx={0.8} fill={tint} />
      <Bar box={[46, 21.5, 40, 3.5]} fill={W40} />
      <circle cx={186} cy={23} r={3.6} fill={W55} />
      <circle cx={187.8} cy={21.6} r={3} fill={INK} />
      <Wire d={`M${APP[0]},30 H${APP[0] + APP[2]}`} />
   </>
);

/* "Contacts" heading, the people count, and the New Contact pill */
const TitleRow = ({ tint }: Readonly<{ tint: string }>) => {
   const [x, y, w, h] = PILL;
   return (
      <>
         <Bar box={[INNER_X, 38, 44, 7]} fill={W70} />
         <Bar box={[INNER_X, 48, 22, 2.5]} fill={W16} />
         <motion.g {...loopProps(PRESS)}>
            <rect x={x} y={y} width={w} height={h} rx={4} fill={`${tint}d9`} />
            <Wire
               d={`M${x + 6},${y + 5.5} h5 M${x + 8.5},${y + 3} v5`}
               stroke={W70}
            />
            <Bar box={[x + 15, y + 4.5, 21, 2]} fill={W55} />
         </motion.g>
      </>
   );
};

/* search box with its magnifier, then the Favorites and tag chips */
const Filters = ({ tint }: Readonly<{ tint: string }>) => {
   const [x, y, w, h] = SEARCH;
   const mid = y + h / 2;
   return (
      <>
         <Panel box={SEARCH} rx={4} fill={W03} />
         <circle
            cx={x + 7}
            cy={mid - 0.6}
            r={2.4}
            fill="none"
            stroke={W40}
            vectorEffect={NON_SCALING}
         />
         <Wire d={`M${x + 8.8},${mid + 1.2} l1.8,1.8`} stroke={W40} />
         <motion.g style={{ originX: 0 }} {...loopProps(TYPED)}>
            <Bar box={[TYPED_X, mid - 1.5, 30, 3]} fill={W70} />
         </motion.g>
         <Panel box={[x, 73, 34, 9]} rx={3} />
         <path d={starD([x + 6.5, 77.5], 2.6)} fill={W40} />
         <Bar box={[x + 12, 76.5, 17, 2]} fill={W25} />
         <Panel box={[x + 38, 73, 20, 9]} rx={3} stroke={`${tint}66`} />
         <Bar box={[x + 42, 76.5, 12, 2]} fill={`${tint}99`} />
         <Panel box={[x + 62, 73, 18, 9]} rx={3} />
         <Bar box={[x + 66, 76.5, 10, 2]} fill={W16} />
         <Bar box={[x + w - 18, 76.5, 18, 2]} fill={W06} />
      </>
   );
};

/* one ContactCard: initial avatar, name, email, tag chips, actions */
const Card = ({ tint, y }: Readonly<{ tint: string; y: number }>) => {
   const mid = y + CARD_H / 2;
   return (
      <>
         <Panel box={[INNER_X, y, INNER_W, CARD_H]} rx={5} />
         <circle cx={45} cy={mid} r={6} fill={`${tint}8c`} />
         <Bar box={[43.5, mid - 2, 3, 4]} fill={W70} />
         <Bar box={[56, y + 5, 42, 3.5]} fill={W55} />
         <Bar box={[56, y + 11, 56, 2.5]} fill={W16} />
         <Bar box={[56, y + 15.5, 13, 3]} fill={`${tint}40`} />
         <Bar box={[71, y + 15.5, 10, 3]} fill={W10} />
         <path
            d={starD([STAR_X, mid], 3)}
            fill="none"
            stroke={W25}
            vectorEffect={NON_SCALING}
         />
         <Wire
            d={`M${PEN_X - 2},${mid + 2.5} L${PEN_X + 2},${mid - 2.5}`}
            stroke={W25}
         />
         <rect
            x={BIN_X - 2}
            y={mid - 2}
            width={4}
            height={5}
            rx={0.8}
            fill="none"
            stroke={W25}
            vectorEffect={NON_SCALING}
         />
      </>
   );
};

/* the contact that just landed, starred once the search finds it */
const NewCard = ({ tint }: Readonly<{ tint: string }>) => {
   const y = CARD_Y[0];
   const mid = y + CARD_H / 2;
   return (
      <Reveal loop={CARD_IN}>
         <rect
            x={INNER_X}
            y={y}
            width={INNER_W}
            height={CARD_H}
            rx={5}
            fill={INK}
         />
         <Card tint={tint} y={y} />
         <Panel
            box={[INNER_X, y, INNER_W, CARD_H]}
            rx={5}
            fill={`${tint}0f`}
            stroke={`${tint}66`}
         />
         <motion.g {...loopProps(STARRED)}>
            <path d={starD([STAR_X, mid], 3)} fill={tint} />
         </motion.g>
      </Reveal>
   );
};

const App = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={APP} rx={8} />
      <Header tint={tint} />
      <TitleRow tint={tint} />
      <Filters tint={tint} />
      <Panel
         box={[INNER_X, CARD_Y[0], INNER_W, CARD_H]}
         rx={5}
         fill="none"
         stroke={W06}
      />
      <NewCard tint={tint} />
      <Reveal loop={FILTERED}>
         <Card tint={tint} y={CARD_Y[1]} />
         <Card tint={tint} y={CARD_Y[2]} />
      </Reveal>
   </>
);

/* ---------------- collection ---------------- */

/* one BSON document: an _id key, then name and email values */
const Doc = ({ tint, y }: Readonly<{ tint: string; y: number }>) => (
   <>
      <Panel box={[DOC_X, y, 60, 10]} rx={2} />
      <circle cx={DOC_X + 5} cy={y + 5} r={1.6} fill={`${tint}80`} />
      <Bar box={[DOC_X + 10, y + 3.75, 18, 2.5]} fill={W25} />
      <Bar box={[DOC_X + 31, y + 3.75, 24, 2.5]} fill={W10} />
   </>
);

const Collection = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Panel box={DB} rx={8} />
      <Wire d={`M${DB[0]},78 H${DB[0] + DB[2]}`} />
      {DOC_Y.slice(1).map((y) => (
         <Doc key={y} tint={tint} y={y} />
      ))}
      <Panel box={[DOC_X, NEW_DOC, 60, 10]} rx={2} fill="none" stroke={W06} />
      <Reveal loop={DOC_IN}>
         <Panel
            box={[DOC_X, NEW_DOC, 60, 10]}
            rx={2}
            fill={`${tint}14`}
            stroke={`${tint}80`}
         />
         <circle cx={DOC_X + 5} cy={NEW_DOC + 5} r={1.6} fill={tint} />
         <Bar box={[DOC_X + 10, NEW_DOC + 3.75, 18, 2.5]} fill={W55} />
         <Bar box={[DOC_X + 31, NEW_DOC + 3.75, 24, 2.5]} fill={W25} />
      </Reveal>
   </>
);

const Stage = ({ tint }: Readonly<{ tint: string }>) => (
   <>
      <Wire d={POST_ROUTE.d} />
      <Wire d={RELOAD_ROUTE.d} />
      <App tint={tint} />
      <Collection tint={tint} />
   </>
);

const ContactsScene = ({ tint }: Readonly<{ tint: string }>) => (
   <Shell
      tint={tint}
      focus="72% 55%"
      texture={GRID}
      stage={<Stage tint={tint} />}
   >
      <Packet color={tint} loop={POST} />
      <Packet color={tint} loop={RELOAD} />
      <Label at={[200, 56]} color={`${tint}cc`}>
         POST
      </Label>
      <Label at={[230, 70]} color={W55}>
         MONGODB
      </Label>
      <Label
         at={[TYPED_X, SEARCH[1] + SEARCH[3] / 2]}
         color={W25}
         loop={PLACEHOLDER}
      >
         SEARCH
      </Label>
   </Shell>
);

export default ContactsScene;
