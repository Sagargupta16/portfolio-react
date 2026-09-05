import { motion } from "motion/react";
import type { Easing, Transition } from "motion/react";
import { MONO_FONT, GREEN } from "@/constants/theme";

interface PipelineAnimProps {
   color: string;
}

/* Terraform-first blue-green delivery. A .tf module plans, a dot carries the
   plan through the tftest gate (check pops, gate turns green) and drops into
   the ALB. The listener needle then swings traffic from the blue target group
   to the green one: blue drains, green goes live with a pulsing health dot.
   Every keyframe array eases back to its first value so the loop closes. */

const LOOP = 5;
const EASE = "easeInOut";

const WHITE_HAIRLINE = "rgba(255,255,255,0.16)";
const WHITE_BORDER = "rgba(255,255,255,0.10)";
const WHITE_FILL = "rgba(255,255,255,0.03)";
const WHITE_MUTED = "rgba(255,255,255,0.18)";
const WHITE_TEXT = "rgba(255,255,255,0.72)";

const BOX: React.CSSProperties = {
   position: "absolute",
   boxSizing: "border-box",
};

const label: React.CSSProperties = {
   fontFamily: MONO_FONT,
   fontSize: 5,
   fontWeight: 700,
   letterSpacing: 0.5,
   lineHeight: 1,
   whiteSpace: "nowrap",
};

const codeLine: React.CSSProperties = {
   position: "absolute",
   left: 3,
   height: 1,
   borderRadius: 1,
};

const gateBox: React.CSSProperties = {
   ...BOX,
   left: 44,
   top: 8,
   width: 14,
   height: 14,
   borderRadius: 3,
};

const ledDot: React.CSSProperties = {
   position: "absolute",
   right: 3,
   top: 3,
   width: 3,
   height: 3,
   borderRadius: "50%",
};

const TARGET_GROUP_ROW: React.CSSProperties = {
   position: "absolute",
   top: 54,
};

const TASK_X = [7, 13];

/* Beats as fractions of LOOP (5 s):
   0.00 to 0.09  plan bar fills
   0.09 to 0.17  dot rides the hairline into the gate
   0.17 to 0.28  gate turns green, check pops
   0.33 to 0.45  dot drops from the gate into the ALB
   0.46 to 0.72  needle swings, blue drains, green lights up
   0.72 to 0.88  hold green-live
   0.88 to 1.00  everything eases back to its first frame */

const PLAN_TIMES = [0, 0.09, 0.88, 1];
const PLAN_SCALE = [0, 1, 1, 0];

const DOT_TIMES = [0, 0.07, 0.09, 0.17, 0.19, 0.31, 0.33, 0.45, 0.47, 1];
const DOT_X = [0, 0, 0, 18.5, 18.5, 18.5, 18.5, 18.5, 18.5, 0];
const DOT_Y = [0, 0, 0, 0, 0, 6.5, 6.5, 21.5, 21.5, 0];
const DOT_OPACITY = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0];

const GATE_TIMES = [0, 0.17, 0.23, 0.88, 1];
const GATE_OPACITY = [0, 0, 1, 1, 0];

const CHECK_TIMES = [0, 0.19, 0.25, 0.28, 0.88, 1];
const CHECK_SCALE = [0, 0, 1.2, 1, 1, 0];
const CHECK_OPACITY = [0, 0, 1, 1, 1, 0];

const CUTOVER_TIMES = [0, 0.46, 0.72, 0.88, 1];
const NEEDLE_X = [0, 0, 42, 42, 0];
const BLUE_OPACITY = [1, 1, 0.3, 0.3, 1];
const GREEN_OPACITY = [0, 0, 1, 1, 0];

const LED_TIMES = [0, 0.6, 0.64, 0.68, 0.72, 0.76, 0.8, 0.84, 1];
const LED_SCALE = [1, 1, 1.4, 1, 1.4, 1, 1.4, 1, 1];

const loop = (times: number[], ease: Easing = EASE): Transition => ({
   duration: LOOP,
   repeat: Infinity,
   times,
   ease,
});

/* .tf module tile: two static code hairlines and a plan bar that fills. */
const TfModule = ({ color }: PipelineAnimProps) => (
   <div
      style={{
         ...BOX,
         left: 6,
         top: 8,
         width: 26,
         height: 14,
         borderRadius: 3,
         border: `1px solid ${color}90`,
         background: `${color}0c`,
      }}
   >
      <span
         style={{ ...codeLine, top: 2, width: 12, background: `${color}70` }}
      />
      <span
         style={{ ...codeLine, top: 5, width: 8, background: WHITE_MUTED }}
      />
      <motion.span
         animate={{ scaleX: PLAN_SCALE }}
         transition={loop(PLAN_TIMES)}
         style={{
            position: "absolute",
            left: 3,
            top: 8,
            width: 18,
            height: 2,
            borderRadius: 1,
            background: color,
            transformOrigin: "left center",
         }}
      />
   </div>
);

/* tftest gate: white-alpha square, green overlay fades in, check pops. */
const Gate = ({ color }: PipelineAnimProps) => (
   <>
      <span
         style={{
            ...label,
            position: "absolute",
            left: 37,
            top: 1,
            width: 28,
            textAlign: "center",
            color: `${color}cc`,
         }}
      >
         TFTEST
      </span>
      <div
         style={{
            ...gateBox,
            border: `1px solid ${WHITE_MUTED}`,
            background: "rgba(255,255,255,0.04)",
         }}
      />
      <motion.div
         animate={{ opacity: GATE_OPACITY }}
         transition={loop(GATE_TIMES)}
         style={{
            ...gateBox,
            border: `1px solid ${GREEN}`,
            background: `${GREEN}22`,
         }}
      />
      <motion.div
         animate={{ scale: CHECK_SCALE, opacity: CHECK_OPACITY }}
         transition={loop(CHECK_TIMES, "easeOut")}
         style={{
            position: "absolute",
            left: 47,
            top: 11,
            width: 8,
            height: 8,
         }}
      >
         <svg
            width={8}
            height={8}
            viewBox="0 0 8 8"
            style={{ display: "block" }}
         >
            <path
               d="M1.5 4.3 L3.4 6.1 L6.6 2.1"
               fill="none"
               stroke={GREEN}
               strokeWidth={1.4}
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </svg>
      </motion.div>
   </>
);

/* ALB pill, centred mid-canvas; the needle below it is the live listener. */
const AlbPill = () => (
   <div
      style={{
         ...BOX,
         left: 24,
         top: 32,
         width: 32,
         height: 10,
         borderRadius: 5,
         border: "1px solid rgba(255,255,255,0.22)",
         background: "rgba(255,255,255,0.05)",
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
      }}
   >
      <span style={{ ...label, color: WHITE_TEXT }}>ALB</span>
   </div>
);

interface TargetGroupProps {
   border: string;
   fill: string;
   task: string;
   led: string;
   pulse?: boolean;
}

/* One target group: two ECS task squares plus a health dot in the corner. */
const TargetGroup = ({
   border,
   fill,
   task,
   led,
   pulse = false,
}: TargetGroupProps) => (
   <div
      style={{
         ...BOX,
         position: "relative",
         width: 26,
         height: 20,
         borderRadius: 4,
         border: `1px solid ${border}`,
         background: fill,
      }}
   >
      {TASK_X.map((x) => (
         <span
            key={x}
            style={{
               position: "absolute",
               left: x,
               top: 7,
               width: 4,
               height: 4,
               borderRadius: 1,
               background: task,
            }}
         />
      ))}
      {pulse ? (
         <motion.span
            animate={{ scale: LED_SCALE }}
            transition={loop(LED_TIMES)}
            style={{ ...ledDot, background: led }}
         />
      ) : (
         <span style={{ ...ledDot, background: led }} />
      )}
   </div>
);

const PipelineAnim = ({ color }: PipelineAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      <TfModule color={color} />

      {/* module to gate, gate to ALB connectors */}
      <span
         style={{
            position: "absolute",
            left: 32,
            top: 15,
            width: 12,
            height: 1,
            background: WHITE_HAIRLINE,
         }}
      />
      <span
         style={{
            position: "absolute",
            left: 51,
            top: 22,
            width: 1,
            height: 10,
            background: WHITE_HAIRLINE,
         }}
      />

      <Gate color={color} />

      {/* plan in flight: tile to gate, then gate down into the ALB */}
      <motion.span
         animate={{ x: DOT_X, y: DOT_Y, opacity: DOT_OPACITY }}
         transition={loop(DOT_TIMES)}
         style={{
            position: "absolute",
            left: 31,
            top: 14,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: color,
         }}
      />

      <AlbPill />

      {/* listener needle swings from the blue group to the green group */}
      <motion.span
         animate={{ x: NEEDLE_X }}
         transition={loop(CUTOVER_TIMES)}
         style={{
            position: "absolute",
            left: 17,
            top: 45,
            width: 0,
            height: 0,
            borderLeft: "2px solid transparent",
            borderRight: "2px solid transparent",
            borderTop: `4px solid ${WHITE_TEXT}`,
         }}
      />

      {/* blue target group drains */}
      <motion.div
         animate={{ opacity: BLUE_OPACITY }}
         transition={loop(CUTOVER_TIMES)}
         style={{ ...TARGET_GROUP_ROW, left: 6 }}
      >
         <TargetGroup
            border={`${color}80`}
            fill={`${color}14`}
            task={`${color}cc`}
            led={color}
         />
      </motion.div>

      {/* green target group: idle shell underneath, live overlay fades in */}
      <div style={{ ...TARGET_GROUP_ROW, left: 48 }}>
         <TargetGroup
            border={WHITE_BORDER}
            fill={WHITE_FILL}
            task={WHITE_MUTED}
            led={WHITE_MUTED}
         />
      </div>
      <motion.div
         animate={{ opacity: GREEN_OPACITY }}
         transition={loop(CUTOVER_TIMES)}
         style={{ ...TARGET_GROUP_ROW, left: 48 }}
      >
         <TargetGroup
            border={`${GREEN}b0`}
            fill={`${GREEN}18`}
            task={`${GREEN}cc`}
            led={GREEN}
            pulse
         />
      </motion.div>
   </div>
);

export default PipelineAnim;
