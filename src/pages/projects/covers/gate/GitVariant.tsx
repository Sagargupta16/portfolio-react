import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { Dot, Label, LoopDot, Shapes, Shell } from "./primitives";
import {
   AMBER,
   GREEN,
   LINEAR,
   NON_SCALING,
   WHITE_08,
   WHITE_15,
   WHITE_25,
   WHITE_50,
   dot,
   label,
   layer,
   loopProps,
   pctX,
} from "./sceneTokens";
import type { Keyframes, Line, Loop, Statics, TintProps } from "./sceneTokens";

/* AI Git Hooks: the staged diff types in, POSTs to the AI reviewer, earns a
   green check on the shield and a new commit lands on the graph; underneath,
   the pre-push secret scan runs on its own clock. Every keyframe array ends
   where it starts. */

const GIT_CYCLE = 6;
/* hold-then-fade window shared by every beat that resets */
const HOLD = 0.92;
const GONE = 0.98;
const SHOW = [0, 0, 1, 1, 0, 0];
const SHIELD =
   "M0,9 A9,9 0 0 1 9,0 L25,0 A9,9 0 0 1 34,9 L34,19 A17,19 0 0 1 0,19 Z";
const CHECK = "M11,18 L15,22 L23,13";

const beat = (loop: Keyframes): Loop => ({ ...loop, duration: GIT_CYCLE });

/* staged diff types in as two blocks, holds through the verdict, then clears */
const diffIn = (at: number) =>
   beat({
      opacity: [0, 1, 1, 0, 0],
      x: [-4, 0, 0, -4, -4],
      times: [0, at, HOLD, GONE, 1],
   });
const DIFF_TOP = diffIn(0.08);
const DIFF_BOTTOM = diffIn(0.11);
/* diff pill POSTs from the card to the reviewer */
const PILL = beat({
   x: [0, 0, 0, 32, 32, 0],
   opacity: [0, 0, 1, 1, 0, 0],
   times: [0, 0.16, 0.19, 0.35, 0.38, 1],
});
/* reviewer dots blink in sequence while the round trip is in flight */
const blink = (at: number) =>
   beat({
      opacity: [0.2, 0.2, 1, 0.2, 1, 0.2, 0.2],
      times: [0, at, at + 0.03, at + 0.07, at + 0.11, at + 0.15, 1],
   });
const RING = beat({
   opacity: [0, 0, 0.5, 0, 0],
   scale: [0.9, 0.9, 1.1, 1.4, 0.9],
   times: [0, 0.56, 0.6, 0.68, 1],
});
const VERDICT = beat({
   opacity: SHOW,
   scale: [0.4, 0.4, 1, 1, 0.4, 0.4],
   times: [0, 0.57, 0.62, HOLD, GONE, 1],
});
/* exit 0: status dot and NO_ISSUES settle in just after the check */
const SETTLE = beat({ opacity: SHOW, times: [0, 0.62, 0.66, HOLD, GONE, 1] });
/* prepare-commit-msg rides through: a new node pops onto the graph */
const COMMIT = beat({
   scale: [0, 0, 1.25, 1, 1, 0, 0],
   opacity: [0, 0, 1, 1, 1, 0, 0],
   times: [0, 0.65, 0.68, 0.71, HOLD, GONE, 1],
});
/* footer on its own 3 s clock: REDACTED breathes, a regex scanline sweeps */
const REDACT_OPACITY = [0.3, 0.7, 0.3];
/* no `times` on REDACT, so loopProps would pass one ease; map it per segment */
const EASE_IN_OUT: Easing = "easeInOut";
const perSegment = (keyframeCount: number) =>
   Array.from({ length: keyframeCount - 1 }, () => EASE_IN_OUT);
const REDACT = {
   animate: { opacity: REDACT_OPACITY },
   transition: {
      duration: 3,
      ease: perSegment(REDACT_OPACITY.length),
      repeat: Infinity,
   },
};
const SCAN: Loop = {
   duration: 3,
   ease: LINEAR,
   x: [0, 19, 221, 240, 0],
   opacity: [0, 1, 1, 0, 0],
   times: [0, 0.08, 0.92, 0.99, 1],
};

/* diff card with header, lane, reviewer box, masked key stub, commit graph */
const statics = (tint: string): Statics => ({
   lines: [
      [20, 70, 112, 70, `${tint}18`],
      [112, 100, 150, 100, `${tint}22`],
      [243, 24, 282, 24, `${tint}30`],
      [28, 63, 28, 63, GREEN, 4],
      [35, 63, 55, 63, `${tint}60`, 2],
      [29, 178, 51, 178, WHITE_25, 3],
   ],
   rects: [
      [20, 56, 92, 66, `${tint}06`, 6, `${tint}30`],
      [150, 83, 52, 34, `${tint}08`, 6, `${tint}35`],
      [246.5, 20.5, 7, 7, `${tint}20`, 3.5, `${tint}60`],
      [260.5, 20.5, 7, 7, `${tint}20`, 3.5, `${tint}60`],
   ],
});

/* gutter + for an added line centred on row y */
const plus = (tint: string, y: number): Line[] => [
   [26, y, 31, y, tint],
   [28.5, y - 2.5, 28.5, y + 2.5, tint],
];
/* diff body, first block: context / added (+) / context */
const diffTop = (tint: string): Statics => ({
   rects: [
      [36, 78, 58, 4, WHITE_15, 1],
      [36, 87, 50, 4, `${tint}80`, 1],
      [36, 96, 64, 4, WHITE_15, 1],
   ],
   lines: plus(tint, 89),
});
/* second block: added (+) / removed (-) */
const diffBottom = (tint: string): Statics => ({
   rects: [
      [36, 105, 42, 4, `${tint}80`, 1],
      [36, 114, 54, 4, WHITE_08, 1],
   ],
   lines: [...plus(tint, 107), [26, 116, 31, 116, WHITE_25]],
});

const pillShapes = (tint: string): Statics => ({
   rects: [[96, 94, 22, 12, "#0b1012", 6, `${tint}80`]],
   lines: [
      [102, 98.75, 112, 98.75, tint, 1.5],
      [102, 101.75, 109, 101.75, `${tint}80`, 1.5],
   ],
});

const Stage = ({ tint }: TintProps) => (
   <>
      <Shapes {...statics(tint)} />
      <motion.g {...loopProps(DIFF_TOP)}>
         <Shapes {...diffTop(tint)} />
      </motion.g>
      <motion.g {...loopProps(DIFF_BOTTOM)}>
         <Shapes {...diffBottom(tint)} />
      </motion.g>
      <motion.g {...loopProps(PILL)}>
         <Shapes {...pillShapes(tint)} />
      </motion.g>
      {/* shield: ring pulse on arrival, green check for exit 0 */}
      <g transform="translate(240 66)">
         <path
            d={SHIELD}
            stroke={`${tint}50`}
            fill={`${tint}08`}
            vectorEffect={NON_SCALING}
         />
         <motion.path
            d={SHIELD}
            stroke={`${tint}90`}
            fill="none"
            vectorEffect={NON_SCALING}
            {...loopProps(RING)}
         />
         <motion.path
            d={CHECK}
            stroke={GREEN}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            vectorEffect={NON_SCALING}
            {...loopProps(VERDICT)}
         />
      </g>
      <LoopDot cx={278} cy={24} r={3.5} fill={tint} loop={COMMIT} />
      <motion.line
         x1={26}
         x2={50}
         y1={178}
         y2={178}
         stroke={`${tint}40`}
         vectorEffect={NON_SCALING}
         {...loopProps(SCAN)}
      />
   </>
);

const chip: React.CSSProperties = {
   ...label,
   left: "17%",
   bottom: "8.5%",
   padding: "2px 5px",
   borderRadius: 3,
   border: `1px solid ${AMBER}66`,
   color: AMBER,
};

const GitVariant = ({ tint }: TintProps) => (
   <Shell tint={tint} glow="55% 50%" stage={<Stage tint={tint} />}>
      {[0, 1, 2].map((i) => (
         <Dot
            key={i}
            x={166 + i * 10}
            y={100}
            size={3}
            color={WHITE_50}
            loop={blink(0.37 + i * 0.025)}
         />
      ))}
      <Label left={pctX(66)} top="63.5%" color={`${tint}90`}>
         PRE COMMIT
      </Label>
      {/* exit 0: the status dot and NO_ISSUES share one fade */}
      <motion.div style={layer} {...loopProps(SETTLE)}>
         <div style={dot(304, 44, 5, GREEN)} />
         <Label left={pctX(257)} top="54.5%" color={`${tint}90`}>
            NO_ISSUES
         </Label>
      </motion.div>
      <motion.span style={chip} {...REDACT}>
         REDACTED
      </motion.span>
      <Label left={pctX(250)} bottom="9.5%" color={`${tint}90`}>
         PRE PUSH
      </Label>
   </Shell>
);

export default GitVariant;
