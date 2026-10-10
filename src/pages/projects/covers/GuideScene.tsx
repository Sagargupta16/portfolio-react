import { motion } from "motion/react";
import {
   EASE,
   FILL,
   GREEN,
   LINEAR,
   SOLID_FILL,
   W05,
   W10,
   W18,
   W30,
   W50,
   cubicD,
   drawStroke,
   hair,
   loop,
   pin,
   px,
   straight,
   windowKeys,
   windowTimes,
   type Cubic,
   type Leg,
   type Pt,
} from "./docs/kit";
import {
   Bar,
   Dot,
   Label,
   OkRing,
   Packet,
   Panel,
   Pop,
   SceneRoot,
   Text,
   Wires,
} from "./docs/primitives";

/*
 * Deploy Guide: the README's Quick Decision Tree routes "what are you
 * deploying?" for a backend API. The request reaches the fork, the other
 * platforms flicker, it takes the free tier branch to RENDER, and opens
 * frameworks/fastapi.md, whose numbered steps tick green one by one until
 * the service answers on /health behind a padlocked onrender URL.
 *
 * Shares the Docs kit (docs/kit.ts, docs/primitives.tsx). Animated nodes
 * (11): root pulse, branch flicker, route draw, packet, RENDER highlight,
 * four step ticks, URL bar, health dot.
 */

const CYCLE = 6;
const HOLD = 0.88;
const LANE_Y = 46;

/* Decision tree, left: the README's `+--` branches as rounded elbows that
   drop from the fork and turn into each platform. Pills are px sized and
   anchored at their left edge. */
const ROOT: Pt = { x: 14, y: LANE_Y };
const FORK: Pt = { x: 22, y: LANE_Y };
const PILL_X = 28;
const PILL_W = 70;
const PILL_H = 20;
const OTHER_W = 40;
const BRANCH_YS = [22, 70];
const elbow = (y: number): Cubic => [
   FORK,
   { x: FORK.x, y },
   { x: FORK.x, y },
   { x: PILL_X, y },
];
const BRANCHES = BRANCH_YS.map(elbow);

/* Guide card, right. */
const CARD = { x: 74, y: 8, w: 73, h: 60 };
const CARD_HEADER_Y = 19;
const STEP_X = 81;
const STEP_RING = 10;
const STEPS = [
   { y: 28, w: 40, at: 0.5 },
   { y: 38, w: 30, at: 0.56 },
   { y: 48, w: 44, at: 0.62 },
   { y: 58, w: 26, at: 0.68 },
];
const URL_Y = 78;
const URL_W = 62;
const GHOST = 0.35;
const URL_AT = 0.72;
const HEALTH_AT = 0.78;

/* Beats: root to fork, wait while the options flicker, fork to card. */
const TO_FORK: Leg = { curve: straight(ROOT, FORK), from: 0.06, to: 0.14 };
const TO_CARD: Leg = {
   curve: straight(FORK, { x: CARD.x, y: LANE_Y }),
   from: 0.3,
   to: 0.46,
};
const PICK_AT = 0.32;
const ROUTE_D = `M ${ROOT.x} ${LANE_Y} H ${CARD.x}`;
const FORK_SHARE = (FORK.x - ROOT.x) / (CARD.x - ROOT.x);
const ROUTE_TIMES = [
   0,
   TO_FORK.from,
   TO_FORK.to,
   TO_CARD.from,
   TO_CARD.to,
   HOLD,
   HOLD + 0.06,
   1,
];
const ROUTE_LENGTH = [0, 0, FORK_SHARE, FORK_SHARE, 1, 1, 1, 0];
const ROUTE_OPACITY = [0, 1, 1, 1, 1, 1, 0, 0];
const ROUTE_EASE = [EASE, LINEAR, EASE, LINEAR, EASE, EASE, EASE];

const FLICKER_TIMES = [0, 0.16, 0.19, 0.22, 0.25, 0.28, 1];
const FLICKER = [0.5, 0.5, 1, 0.5, 1, 0.5, 0.5];

/* Topographic contours behind the tree: the back layer for a route map. */
const CONTOURS = [
   "M 0 18 C 40 10, 70 28, 110 20 S 150 8, 160 14",
   "M 0 40 C 30 30, 60 48, 100 40 S 140 28, 160 36",
   "M 0 62 C 36 54, 74 72, 112 62 S 148 52, 160 58",
   "M 0 84 C 44 76, 80 92, 120 84 S 150 74, 160 80",
];

const PILL = {
   height: PILL_H,
   width: PILL_W,
   marginTop: -PILL_H / 2,
   padding: "0 7px",
   boxSizing: "border-box",
   display: "flex",
   alignItems: "center",
   gap: 6,
   borderRadius: PILL_H / 2,
} as const;

const PillDot = ({ color }: { color: string }) => (
   <span
      style={{
         width: 6,
         height: 6,
         borderRadius: "50%",
         background: color,
         flex: "none",
      }}
   />
);

/* A platform the tree passes over: dot and a blank name. */
const OtherPill = ({ y }: { y: number }) => (
   <div
      style={{
         ...pin(PILL_X, y),
         ...PILL,
         width: OTHER_W,
         border: `1px solid ${W18}`,
         background: SOLID_FILL,
      }}
   >
      <PillDot color={W30} />
      <span
         style={{ width: 16, height: 3, borderRadius: 1.5, background: W30 }}
      />
   </div>
);

const Tree = ({ tint }: { tint: string }) => (
   <>
      <Wires>
         {CONTOURS.map((d) => (
            <path key={d} d={d} {...hair(W05)} />
         ))}
         <path d={ROUTE_D} {...hair(W18)} />
         {BRANCHES.map((c) => (
            <path key={c[3].y} d={cubicD(c)} {...hair(W18)} />
         ))}
         <motion.path
            d={ROUTE_D}
            {...drawStroke(tint)}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: ROUTE_LENGTH, opacity: ROUTE_OPACITY }}
            transition={{
               duration: CYCLE,
               repeat: Infinity,
               times: ROUTE_TIMES,
               ease: ROUTE_EASE,
            }}
         />
      </Wires>
      <Dot x={ROOT.x} y={ROOT.y} color={W50} size={11} ring />
      <Pop
         x={ROOT.x}
         y={ROOT.y}
         cycle={CYCLE}
         on={0.01}
         off={TO_FORK.from + 0.04}
         size={6}
         style={{ borderRadius: "50%", background: tint }}
      />
      <Dot x={FORK.x} y={FORK.y} color={W30} size={5} />
   </>
);

const Platforms = ({ tint }: { tint: string }) => (
   <>
      <motion.div
         initial={{ opacity: FLICKER[0] }}
         animate={{ opacity: FLICKER }}
         transition={loop(CYCLE, FLICKER_TIMES)}
         style={FILL}
      >
         {BRANCH_YS.map((y) => (
            <OtherPill key={y} y={y} />
         ))}
      </motion.div>
      <div
         style={{
            ...pin(PILL_X, LANE_Y),
            ...PILL,
            border: `1px solid ${W18}`,
            background: SOLID_FILL,
         }}
      >
         <PillDot color={W30} />
         <Text text="RENDER" color={W50} />
      </div>
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: windowKeys(0, 1) }}
         transition={loop(CYCLE, windowTimes(PICK_AT, HOLD))}
         style={{
            ...pin(PILL_X, LANE_Y),
            ...PILL,
            border: `1px solid ${tint}`,
            background: `${tint}14`,
         }}
      >
         <PillDot color={GREEN} />
         <Text text="RENDER" color={tint} />
      </motion.div>
   </>
);

const GuideCard = ({ tint }: { tint: string }) => (
   <>
      <Panel x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} edge={`${tint}40`} />
      <Label x={CARD.x + 5} y={13.5} text="FASTAPI.MD" color={`${tint}e6`} />
      <Wires>
         <path
            d={`M ${CARD.x} ${CARD_HEADER_Y} H ${CARD.x + CARD.w}`}
            {...hair(`${tint}30`)}
         />
      </Wires>
      {STEPS.map((s) => (
         <span key={s.y}>
            <Dot x={STEP_X} y={s.y} color={W30} size={STEP_RING} ring />
            <Bar x={STEP_X + 6} y={s.y} w={s.w} color={W18} />
         </span>
      ))}
      {STEPS.map((s) => (
         <Pop
            key={s.y}
            x={STEP_X}
            y={s.y}
            cycle={CYCLE}
            on={s.at}
            off={HOLD}
            size={STEP_RING}
         >
            <OkRing size={STEP_RING} />
         </Pop>
      ))}
   </>
);

/* "Your API is live at https://...onrender.com": padlock, host, /health. */
const LiveUrl = ({ tint }: { tint: string }) => (
   <>
      <motion.div
         initial={{ opacity: GHOST, y: 4 }}
         animate={{ opacity: windowKeys(GHOST, 1), y: windowKeys(4, 0) }}
         transition={loop(CYCLE, windowTimes(URL_AT, HOLD))}
         style={{
            ...pin(CARD.x + 4, URL_Y),
            width: px(URL_W),
            height: 20,
            marginTop: -10,
            padding: "0 8px",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 10,
            border: `1px solid ${W10}`,
            background: SOLID_FILL,
         }}
      >
         <span
            style={{
               width: 8,
               height: 6,
               marginTop: 2,
               borderRadius: 1.5,
               background: GREEN,
               flex: "none",
            }}
         />
         <span
            style={{
               flex: 1,
               minWidth: 0,
               height: 3,
               borderRadius: 1.5,
               background: W30,
            }}
         />
         <Text text="/HEALTH" color={tint} />
      </motion.div>
      <Pop
         x={CARD.x + 4 + URL_W + 4}
         y={URL_Y}
         cycle={CYCLE}
         on={HEALTH_AT}
         off={HOLD}
         size={6}
         style={{ borderRadius: "50%", background: GREEN }}
      />
   </>
);

const GuideScene = ({ tint }: { tint: string }) => (
   <SceneRoot tint={tint} focus="70% 38%">
      <Tree tint={tint} />
      <Packet tint={tint} legs={[TO_FORK, TO_CARD]} cycle={CYCLE} />
      <Platforms tint={tint} />
      <GuideCard tint={tint} />
      <LiveUrl tint={tint} />
   </SceneRoot>
);

export default GuideScene;
