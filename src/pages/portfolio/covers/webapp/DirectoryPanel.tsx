import type { Easing, Transition } from "motion/react";
import { motion } from "motion/react";
import {
   CARD,
   LABEL,
   PANEL,
   WHITE_03,
   WHITE_14,
   WHITE_18,
   WHITE_28,
   WHITE_35,
   WHITE_60,
   bar,
   type PanelProps,
} from "./shared";

/* MCA NITW alumni directory: search pill, Suspense spinner while /users/all
   answers, three portrait cards stagger in, the middle one hovers. */

const CYCLE = 5;
const CARDS_TOP = 21;
const CARD_HEIGHT = 40;
const FOOT_TOP = CARDS_TOP + CARD_HEIGHT + 5;

const EASE: Easing = "easeInOut";

/* Infinite keyframe loop with one ease per segment: Motion runs opacity
   through WAAPI, which would spread a single ease over the whole iteration
   while transforms ease each segment, pulling the two tracks off the beats. */
const loop = (
   duration: number,
   times: number[],
   ease: Easing = EASE,
): Transition => ({
   duration,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

interface CardSpec {
   id: string;
   hover: boolean;
   animate: { opacity: number[]; y: number[]; scale?: number[] };
   times: number[];
}

const ENTER = { opacity: [0, 0, 1, 1, 1, 0], y: [6, 6, 0, 0, 0, 6] };
const enterTimes = (i: number) => [
   0,
   0.2 + 0.05 * i,
   0.28 + 0.05 * i,
   0.88,
   0.96,
   1,
];

const CARDS: CardSpec[] = [
   { id: "left", hover: false, animate: ENTER, times: enterTimes(0) },
   {
      id: "middle",
      hover: true,
      animate: {
         opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
         y: [6, 6, 0, 0, 0, 0, 0, 0, 0, 6],
         scale: [1, 1, 1, 1, 1.06, 1.06, 1, 1, 1, 1],
      },
      times: [0, 0.25, 0.33, 0.44, 0.5, 0.62, 0.68, 0.88, 0.96, 1],
   },
   { id: "right", hover: false, animate: ENTER, times: enterTimes(2) },
];

/* "Search..." pill with a blinking caret and the BiSearch dot. */
const SearchPill = ({ tint }: PanelProps) => (
   <div
      style={{
         position: "absolute",
         left: 0,
         right: 0,
         top: 0,
         height: 9,
         borderRadius: 5,
         border: `1px solid ${WHITE_14}`,
         background: WHITE_03,
         boxSizing: "border-box",
      }}
   >
      <motion.span
         animate={{ opacity: [1, 1, 0, 0, 1] }}
         transition={loop(1, [0, 0.49, 0.5, 0.99, 1], "linear")}
         style={{
            position: "absolute",
            left: 4,
            top: 1,
            width: 1,
            height: 5,
            background: WHITE_60,
         }}
      />
      <span
         style={{
            position: "absolute",
            right: 3,
            top: 2,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: tint,
         }}
      />
   </div>
);

/* Bootstrap spinner-border fallback, visible only for the first second. */
const Spinner = ({ tint }: PanelProps) => (
   <motion.div
      animate={{ opacity: [1, 1, 0, 0, 0, 1] }}
      transition={loop(CYCLE, [0, 0.18, 0.24, 0.9, 0.96, 1])}
      style={{
         position: "absolute",
         left: "50%",
         top: CARDS_TOP + 16,
         marginLeft: -4,
      }}
   >
      <motion.div
         animate={{ rotate: [0, 360] }}
         transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
         style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            border: `1px solid ${tint}80`,
            borderTopColor: "transparent",
         }}
      />
   </motion.div>
);

/* IndividualUser card: cover image, name, Batch, Share / View Profile. */
const AlumniCard = ({ tint, spec }: { tint: string; spec: CardSpec }) => (
   <motion.div
      animate={spec.animate}
      transition={loop(CYCLE, spec.times)}
      style={{
         ...CARD,
         flex: 1,
         minWidth: 0,
         height: CARD_HEIGHT,
         overflow: "hidden",
         boxSizing: "border-box",
      }}
   >
      <div style={{ height: 20, background: `${tint}26` }} />
      <div style={{ padding: "3px 3px 0" }}>
         <span style={bar("70%", WHITE_28)} />
         <span style={{ ...bar("45%", WHITE_14), marginTop: 2 }} />
         <div
            style={{
               display: "flex",
               justifyContent: "space-between",
               marginTop: 3,
            }}
         >
            <span style={bar(10, WHITE_18, 2)} />
            {spec.hover ? (
               <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{
                     duration: 1.2,
                     repeat: Infinity,
                     ease: [EASE, EASE],
                  }}
                  style={bar(10, tint, 2)}
               />
            ) : (
               <span style={bar(10, WHITE_18, 2)} />
            )}
         </div>
      </div>
   </motion.div>
);

const DirectoryPanel = ({ tint }: PanelProps) => (
   <div style={PANEL}>
      <SearchPill tint={tint} />
      <span
         style={{
            ...LABEL,
            position: "absolute",
            left: 0,
            top: 12,
            color: WHITE_35,
         }}
      >
         BATCH
      </span>
      <Spinner tint={tint} />
      <div
         style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CARDS_TOP,
            display: "flex",
            gap: 6,
         }}
      >
         {CARDS.map((spec) => (
            <AlumniCard key={spec.id} tint={tint} spec={spec} />
         ))}
      </div>
      <span
         style={{
            ...LABEL,
            position: "absolute",
            left: 0,
            top: FOOT_TOP,
            color: `${tint}8c`,
         }}
      >
         USERS/ALL
      </span>
      <motion.span
         animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
         transition={loop(CYCLE, [0, 0.5, 0.56, 0.7, 0.76, 1])}
         style={{
            ...LABEL,
            position: "absolute",
            right: 0,
            top: FOOT_TOP,
            color: WHITE_35,
         }}
      >
         PROFILE
      </motion.span>
   </div>
);

export default DirectoryPanel;
