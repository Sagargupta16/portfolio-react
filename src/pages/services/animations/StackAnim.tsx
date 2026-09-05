import { motion } from "motion/react";
import { GREEN, MONO_FONT } from "@/constants/theme";

interface StackAnimProps {
   color: string;
}

interface Point {
   x: number;
   y: number;
}

interface Rect {
   left: number;
   top: number;
   width: number;
   height: number;
}

/** A dot's journey: waypoints + opacity, both keyed to the shared loop via `times`. */
interface Hop {
   path: Point[];
   opacity: number[];
   times: number[];
}

/** One 5 s loop; every node places its beats on this timeline through `times`. */
const LOOP = 5;

/*
 * Motion eases a keyframe array per segment on the main thread (x, y, scale)
 * but across the whole iteration on WAAPI-accelerated values (opacity), so a
 * single `ease` string pulls the two tracks out of phase and a dot can cross
 * the FASTAPI label at full opacity. An easing array is applied per segment on
 * both tracks, so every keyframed node here builds one from its `times`.
 */
type SegmentEase = "easeInOut" | "easeOut";
const perSegment = (times: number[], ease: SegmentEase): SegmentEase[] =>
   times.slice(1).map(() => ease);

/** Beat 5: the three committed rows fade together before the loop restarts. */
const FADE_START = 0.88;
const FADE_END = 0.98;
const ROW_GROW = 0.04;

const HAIRLINE = "rgba(255,255,255,0.12)";
const CHROME = "rgba(255,255,255,0.18)";
const EMPTY_ROW = "rgba(255,255,255,0.06)";
const TABLE_ROW = "rgba(255,255,255,0.14)";

const DOT_SIZE = 4;
const LIVE_DOT_SIZE = 3;

const BOX_SIZING = "border-box";

/*
 * Static frames, canvas px (root is 80 x 80). Everything sits inside canvas
 * y 13-67: ServiceCard's mobile strip is 100 px tall with overflow hidden and
 * shows only that band of the 1.8x-scaled canvas, so frames, labels and every
 * animated payoff must live there to stay legible on phones.
 */
const BROWSER: Rect = { left: 2, top: 13, width: 36, height: 18 };
const BROWSER_CHROME = 5;
const BROWSER_ROW: Rect = { left: 6, top: 22, width: 28, height: 4 };

const PHONE: Rect = { left: 62, top: 13, width: 14, height: 20 };
const PHONE_NOTCH: Rect = { left: 67, top: 15, width: 4, height: 1 };
const PHONE_ROW: Rect = { left: 65, top: 22, width: 8, height: 3 };

const API: Rect = { left: 24, top: 36, width: 32, height: 12 };

const TABLE: Rect = { left: 24, top: 52, width: 32, height: 15 };
const TABLE_HEADER = 5;
const TABLE_ROW_TOPS = [59, 62];
const TABLE_NEW_ROW: Rect = { left: 27, top: 65, width: 26, height: 1 };

/*
 * Waypoints (dot centres). Dots meet the FASTAPI box at its top and bottom
 * edges, never at its centre, so they cannot sit on the label.
 */
const AT_BROWSER: Point = { x: 34, y: 27 };
const AT_API_IN: Point = { x: 40, y: API.top };
const AT_API_OUT: Point = { x: 40, y: API.top + API.height };
const AT_TABLE: Point = { x: 40, y: TABLE_NEW_ROW.top };
const AT_SOCKET: Point = { x: API.left + API.width, y: 42 };
const AT_PHONE: Point = { x: 69, y: 29 };

/* Beat 1 (0.0-0.9 s): authenticated request, browser -> FASTAPI */
const REQUEST: Hop = {
   path: [AT_BROWSER, AT_BROWSER, AT_API_IN, AT_API_IN, AT_BROWSER],
   opacity: [0, 1, 1, 0, 0],
   times: [0, 0.02, 0.16, 0.18, 1],
};

/* Beat 2 (0.9-1.7 s): ORM write, FASTAPI -> POSTGRES */
const QUERY: Hop = {
   path: [AT_API_OUT, AT_API_OUT, AT_API_OUT, AT_TABLE, AT_TABLE, AT_API_OUT],
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.18, 0.2, 0.32, 0.34, 1],
};

/*
 * Beat 3 (1.7-2.6 s): JSON response, POSTGRES -> FASTAPI -> browser.
 * The dot enters the box at its bottom edge and re-emerges from its top edge,
 * the same way the request vanishes into it and the query leaves it, so the
 * box "handles" the payload instead of the dot crossing the label. It holds
 * invisible for 50 ms on both sides of the crossing so a small phase offset
 * between the opacity and transform tracks can never show it on the label.
 */
const RESPONSE: Hop = {
   path: [
      AT_TABLE,
      AT_TABLE,
      AT_TABLE,
      AT_API_OUT,
      AT_API_OUT,
      AT_API_OUT,
      AT_API_IN,
      AT_API_IN,
      AT_API_IN,
      AT_BROWSER,
      AT_BROWSER,
      AT_TABLE,
   ],
   opacity: [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
   times: [0, 0.34, 0.36, 0.41, 0.42, 0.43, 0.45, 0.46, 0.47, 0.5, 0.52, 1],
};

/* Beat 4 (2.6-3.4 s): WebSocket push, open socket -> phone */
const PUSH: Hop = {
   path: [AT_SOCKET, AT_SOCKET, AT_SOCKET, AT_PHONE, AT_PHONE, AT_SOCKET],
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.52, 0.54, 0.66, 0.68, 1],
};

/* Row commits: scale in on arrival, hold, fade together in beat 5 */
const TABLE_COMMIT_AT = 0.32;
const BROWSER_COMMIT_AT = 0.5;
const PHONE_COMMIT_AT = 0.66;
const ROW_SCALE_X = [0, 0, 1, 1, 1, 0];
const ROW_OPACITY = [0, 0, 1, 1, 0, 0];

const CHROME_DOT: React.CSSProperties = {
   width: 2,
   height: 2,
   borderRadius: "50%",
   background: CHROME,
};

const frameStyle = (
   rect: Rect,
   color: string,
   radius: number,
): React.CSSProperties => ({
   position: "absolute",
   ...rect,
   boxSizing: BOX_SIZING,
   borderRadius: radius,
   border: `1px solid ${color}40`,
   background: `${color}08`,
   overflow: "hidden",
});

const Wires = () => (
   <svg
      viewBox="0 0 80 80"
      width={80}
      height={80}
      style={{ position: "absolute", inset: 0 }}
      fill="none"
      stroke={HAIRLINE}
      strokeWidth={0.75}
      strokeLinecap="round"
   >
      <line x1={37} y1={31} x2={40} y2={36} />
      <line x1={40} y1={48} x2={40} y2={52} />
      <line x1={56} y1={42} x2={65} y2={33} />
   </svg>
);

const BrowserFrame = ({ color }: StackAnimProps) => (
   <div style={frameStyle(BROWSER, color, 4)}>
      <div
         style={{
            height: BROWSER_CHROME,
            boxSizing: BOX_SIZING,
            display: "flex",
            alignItems: "center",
            gap: 2,
            paddingLeft: 3,
            background: `${color}0c`,
            borderBottom: `1px solid ${color}20`,
         }}
      >
         <span style={CHROME_DOT} />
         <span style={CHROME_DOT} />
      </div>
   </div>
);

const PhoneFrame = ({ color }: StackAnimProps) => (
   <>
      <div style={frameStyle(PHONE, color, 3)} />
      <div
         style={{
            position: "absolute",
            ...PHONE_NOTCH,
            borderRadius: 1,
            background: CHROME,
         }}
      />
   </>
);

const ApiBox = ({ color }: StackAnimProps) => (
   <div
      style={{
         ...frameStyle(API, color, 4),
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
      }}
   >
      <span
         style={{
            fontSize: 6,
            lineHeight: 1,
            fontFamily: MONO_FONT,
            fontWeight: 700,
            letterSpacing: 0.3,
            color,
         }}
      >
         FASTAPI
      </span>
   </div>
);

const PostgresTable = ({ color }: StackAnimProps) => (
   <>
      <div style={frameStyle(TABLE, color, 3)}>
         <div
            style={{
               height: TABLE_HEADER,
               boxSizing: BOX_SIZING,
               display: "flex",
               alignItems: "center",
               paddingLeft: 3,
               background: `${color}14`,
               borderBottom: `1px solid ${color}30`,
            }}
         >
            <span
               style={{
                  fontSize: 5,
                  lineHeight: 1,
                  fontFamily: MONO_FONT,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  color,
               }}
            >
               POSTGRES
            </span>
         </div>
      </div>
      {TABLE_ROW_TOPS.map((top) => (
         <div
            key={top}
            style={{
               position: "absolute",
               left: TABLE_NEW_ROW.left,
               top,
               width: TABLE_NEW_ROW.width,
               height: 1,
               background: TABLE_ROW,
            }}
         />
      ))}
   </>
);

const EmptyRow = ({ rect }: { rect: Rect }) => (
   <div
      style={{
         position: "absolute",
         ...rect,
         borderRadius: 1,
         background: EMPTY_ROW,
      }}
   />
);

interface CommittedRowProps {
   rect: Rect;
   fill: string;
   appearAt: number;
}

const CommittedRow = ({ rect, fill, appearAt }: CommittedRowProps) => {
   const times = [0, appearAt, appearAt + ROW_GROW, FADE_START, FADE_END, 1];
   return (
      <motion.div
         animate={{ scaleX: ROW_SCALE_X, opacity: ROW_OPACITY }}
         transition={{
            duration: LOOP,
            repeat: Infinity,
            ease: perSegment(times, "easeOut"),
            times,
         }}
         style={{
            position: "absolute",
            ...rect,
            borderRadius: 1,
            background: fill,
            transformOrigin: "left center",
         }}
      />
   );
};

interface TravelDotProps {
   color: string;
   hop: Hop;
}

const TravelDot = ({ color, hop }: TravelDotProps) => (
   <motion.div
      animate={{
         x: hop.path.map((p) => p.x),
         y: hop.path.map((p) => p.y),
         opacity: hop.opacity,
      }}
      transition={{
         duration: LOOP,
         repeat: Infinity,
         ease: perSegment(hop.times, "easeInOut"),
         times: hop.times,
      }}
      style={{
         position: "absolute",
         left: -DOT_SIZE / 2,
         top: -DOT_SIZE / 2,
         width: DOT_SIZE,
         height: DOT_SIZE,
         borderRadius: "50%",
         background: color,
      }}
   />
);

/* Open socket on the FASTAPI box's right edge; breathes for the whole loop */
const LIVE_TIMES = [0, 0.5, 1];

const LiveDot = () => (
   <motion.div
      animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.5, 1, 0.5] }}
      transition={{
         duration: LOOP / 4,
         repeat: Infinity,
         ease: perSegment(LIVE_TIMES, "easeInOut"),
         times: LIVE_TIMES,
      }}
      style={{
         position: "absolute",
         left: AT_SOCKET.x - LIVE_DOT_SIZE / 2,
         top: AT_SOCKET.y - LIVE_DOT_SIZE / 2,
         width: LIVE_DOT_SIZE,
         height: LIVE_DOT_SIZE,
         borderRadius: "50%",
         background: GREEN,
      }}
   />
);

const StackAnim = ({ color }: StackAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      <Wires />

      <BrowserFrame color={color} />
      <EmptyRow rect={BROWSER_ROW} />

      <PhoneFrame color={color} />
      <EmptyRow rect={PHONE_ROW} />

      <ApiBox color={color} />
      <PostgresTable color={color} />

      {/* Beat 2 commit, beat 3 render, beat 4 push: same state on every surface */}
      <CommittedRow
         rect={TABLE_NEW_ROW}
         fill={`${color}cc`}
         appearAt={TABLE_COMMIT_AT}
      />
      <CommittedRow
         rect={BROWSER_ROW}
         fill={`${color}55`}
         appearAt={BROWSER_COMMIT_AT}
      />
      <CommittedRow
         rect={PHONE_ROW}
         fill={`${color}55`}
         appearAt={PHONE_COMMIT_AT}
      />

      <TravelDot color={color} hop={REQUEST} />
      <TravelDot color={color} hop={QUERY} />
      <TravelDot color={color} hop={RESPONSE} />
      <TravelDot color={color} hop={PUSH} />
      <LiveDot />
   </div>
);

export default StackAnim;
