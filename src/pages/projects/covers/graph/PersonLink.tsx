import { motion } from "motion/react";
import type { Transition } from "motion/react";
import {
   ARC,
   CARD_H,
   CARD_RX,
   CARD_W,
   CONSENT,
   CONSENT_AT,
   CYCLE,
   FUSE_FROM,
   FUSE_TO,
   FUSE_X,
   GREEN,
   HALF_H,
   HALF_W,
   LINK,
   PROPOSE_FROM,
   PROPOSE_TO,
   ROWS,
   VIEW_H,
   VIEW_W,
   hairline,
   loop,
   secs,
} from "./kinfolkLayout";

/* Pending, then consented: the dashed person_link flows A to B while it is
   pending, consent draws it solid from B back to A, and as the trees fuse
   it pulls in toward the meeting point under the converging cards. */
export const PersonLink = ({ tint }: { tint: string }) => (
   <>
      <motion.path
         d={LINK}
         {...hairline(`${tint}99`)}
         strokeDasharray="3 4"
         animate={{ strokeDashoffset: [0, -7], opacity: [1, 1, 0, 0, 1, 1] }}
         transition={{
            strokeDashoffset: {
               duration: 0.7,
               repeat: Infinity,
               ease: "linear",
            },
            opacity: loop(
               0,
               CONSENT_AT + 0.2,
               CONSENT_AT + 0.5,
               5.3,
               5.7,
               CYCLE,
            ),
         }}
      />
      <motion.path
         d={CONSENT}
         fill="none"
         stroke={GREEN}
         strokeWidth={9}
         strokeLinecap="round"
         animate={{
            pathLength: [0, 0, 1, 1, 0],
            opacity: [0, 0, 1, 1, 0, 0],
            scaleX: [1, 1, 0.05, 0.05, 1],
         }}
         transition={{
            pathLength: loop(0, CONSENT_AT, CONSENT_AT + 0.7, FUSE_TO, CYCLE),
            opacity: loop(
               0,
               CONSENT_AT - 0.05,
               CONSENT_AT + 0.05,
               2.75,
               3.05,
               CYCLE,
            ),
            scaleX: loop(0, FUSE_FROM, FUSE_TO, FUSE_TO + 0.1, CYCLE),
         }}
      />
   </>
);

/* Green confirmation ring as the two records settle into one card. */
export const FusePulse = () => (
   <motion.rect
      x={FUSE_X - HALF_W}
      y={ROWS[1] - HALF_H}
      width={CARD_W}
      height={CARD_H}
      rx={CARD_RX}
      {...hairline(GREEN)}
      animate={{ opacity: [0, 0, 0.9, 0, 0], scale: [1, 1, 1, 1.25, 1] }}
      transition={loop(0, FUSE_TO - 0.05, FUSE_TO + 0.02, FUSE_TO + 0.6, CYCLE)}
   />
);

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const XS = ARC.map(([x]) => pct(x, VIEW_W));
const YS = ARC.map(([, y]) => pct(y, VIEW_H));
const LAST = ARC.length - 1;
const ARC_TIMES = secs(
   0,
   ...ARC.map(
      (_, i) => PROPOSE_FROM + ((PROPOSE_TO - PROPOSE_FROM) * i) / LAST,
   ),
   PROPOSE_TO + 0.25,
   CYCLE,
);
const ARC_MOVE: Transition = {
   duration: CYCLE,
   repeat: Infinity,
   times: ARC_TIMES,
   ease: ARC_TIMES.slice(1).map(() => "linear"),
};

/* The proposal in flight: a 5px packet with a short tail riding the arc.
   Its box spans the slot, so the percent translate is a slot percentage. */
export const Proposal = ({ tint }: { tint: string }) => (
   <motion.div
      animate={{
         x: [XS[0], ...XS, XS[LAST], XS[0]],
         y: [YS[0], ...YS, YS[LAST], YS[0]],
         opacity: [0, 0, 1, 1, 0, 0],
      }}
      transition={{
         x: ARC_MOVE,
         y: ARC_MOVE,
         opacity: loop(
            0,
            PROPOSE_FROM,
            PROPOSE_FROM + 0.1,
            PROPOSE_TO - 0.05,
            PROPOSE_TO + 0.2,
            CYCLE,
         ),
      }}
      style={{ position: "absolute", inset: 0 }}
   >
      <div
         style={{
            position: "absolute",
            left: -16,
            top: -1,
            width: 16,
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent, ${tint}99)`,
         }}
      />
      <div
         style={{
            position: "absolute",
            left: -2.5,
            top: -2.5,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: tint,
         }}
      />
   </motion.div>
);
