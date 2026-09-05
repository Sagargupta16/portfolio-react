import { motion } from "motion/react";
import type { Easing } from "motion/react";
import { MONO_FONT, GREEN, AMBER } from "@/constants/theme";

interface AiDlcAnimProps {
   color: string;
}

/* AI-driven development as he ships it: a spec arrives, the agent reads the
   .claude/ scaffold (CLAUDE.md, skills/, hooks/) and proposes a diff, then a
   PreToolUse hook gate bounces the non-compliant attempt (amber) and passes
   the compliant one (green), which lands as a commit dot. One 5 s loop,
   eight Motion nodes, transform and opacity only. */

const CYCLE = 5;

/* Motion runs opacity through WAAPI. A single ease string becomes the effect
   easing over the whole iteration, which warps `times`; a per-segment array
   makes the effect linear and honours `times` on both the WAAPI and JS paths. */
const loop = (times: number[], ease: Easing = "easeInOut") => ({
   duration: CYCLE,
   repeat: Infinity,
   times,
   ease: times.slice(1).map(() => ease),
});

const WHITE_HAIRLINE = "rgba(255,255,255,0.15)";
const WHITE_LABEL = "rgba(255,255,255,0.45)";

const label: React.CSSProperties = {
   position: "absolute",
   fontFamily: MONO_FONT,
   fontSize: 5,
   fontWeight: 700,
   letterSpacing: 0.4,
   lineHeight: 1,
   whiteSpace: "nowrap",
};

/* Gate hairline geometry, shared by the static line, both flashes, and label */
const GATE_LEFT = 44;
const GATE_STYLE: React.CSSProperties = {
   position: "absolute",
   left: GATE_LEFT,
   top: 56,
   width: 32,
   height: 1,
};
const FLASH = [0, 0, 0.3, 1, 0.3, 0, 0];

/* Attempt dots share one lane and start just below the diff */
const DOT_LEFT = 57;
const DOT_STYLE: React.CSSProperties = {
   position: "absolute",
   left: DOT_LEFT,
   top: 40,
   width: 3,
   height: 3,
   borderRadius: "50%",
};

interface TintProps {
   color: string;
}

/* One folder-glyph + bar row inside the scaffold panel (skills/, hooks/) */
const FolderRow = ({
   top,
   barWidth,
   color,
}: TintProps & { top: number; barWidth: number }) => {
   const stroke = `${color}70`;
   return (
      <>
         <span
            style={{
               position: "absolute",
               left: 7,
               top: top - 1,
               width: 3,
               height: 1,
               background: stroke,
            }}
         />
         <span
            style={{
               position: "absolute",
               left: 7,
               top,
               width: 6,
               height: 4,
               boxSizing: "border-box",
               borderRadius: 1,
               border: `1px solid ${stroke}`,
            }}
         />
         <span
            style={{
               position: "absolute",
               left: 16,
               top: top + 1,
               width: barWidth,
               height: 2,
               borderRadius: 1,
               background: `${color}40`,
            }}
         />
      </>
   );
};

/* Static .claude/ scaffold on the left plus the read-sweep that steps it */
const ScaffoldPanel = ({ color }: TintProps) => (
   <>
      <div
         style={{
            position: "absolute",
            left: 4,
            top: 20,
            width: 32,
            height: 40,
            boxSizing: "border-box",
            borderRadius: 4,
            border: `1px solid ${color}35`,
            background: `${color}06`,
         }}
      />
      <span
         style={{
            ...label,
            left: 6,
            top: 24,
            letterSpacing: 0,
            color: `${color}cc`,
         }}
      >
         CLAUDE.md
      </span>
      <FolderRow top={34} barWidth={14} color={color} />
      <FolderRow top={44} barWidth={10} color={color} />
      <motion.div
         animate={{
            y: [0, 0, 10, 10, 20, 20, 20, 0],
            opacity: [0, 1, 1, 1, 1, 1, 0, 0],
         }}
         transition={loop(
            [0, 0.02, 0.05, 0.08, 0.11, 0.14, 0.17, 1],
            "easeInOut",
         )}
         style={{
            position: "absolute",
            left: 6,
            top: 22,
            width: 26,
            height: 8,
            borderRadius: 2,
            background: `${color}14`,
         }}
      />
   </>
);

/* Spec pill sliding in top-right, then the proposed diff growing beneath it */
const SpecAndDiff = ({ color }: TintProps) => {
   const diffFill = `${color}99`;
   return (
      <>
         <motion.div
            animate={{ x: [12, 0, 0, 0, 12], opacity: [0, 1, 1, 0, 0] }}
            transition={loop([0, 0.12, 0.85, 0.95, 1], "easeOut")}
            style={{
               position: "absolute",
               left: 44,
               top: 6,
               width: 24,
               height: 6,
               borderRadius: 3,
               background: `${color}40`,
            }}
         />
         <motion.div
            animate={{
               scaleX: [0, 0, 1, 1, 1, 0],
               opacity: [0, 1, 1, 1, 0, 0],
            }}
            transition={loop([0, 0.15, 0.36, 0.85, 0.95, 1], "easeOut")}
            style={{
               position: "absolute",
               left: 44,
               top: 24,
               width: 26,
               height: 10,
               transformOrigin: "left center",
            }}
         >
            <span
               style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 26,
                  height: 2,
                  borderRadius: 1,
                  background: diffFill,
               }}
            />
            <span
               style={{
                  position: "absolute",
                  left: 0,
                  top: 8,
                  width: 18,
                  height: 2,
                  borderRadius: 1,
                  background: diffFill,
               }}
            />
         </motion.div>
      </>
   );
};

/* Coloured overlay on the hairline; opacity-only so the line never repaints */
const GateFlash = ({
   background,
   times,
}: {
   background: string;
   times: number[];
}) => (
   <motion.div
      animate={{ opacity: FLASH }}
      transition={loop(times)}
      style={{ ...GATE_STYLE, background }}
   />
);

/* The PreToolUse hook gate: white hairline, amber then green flash, label */
const HookGate = () => (
   <>
      <div style={{ ...GATE_STYLE, background: WHITE_HAIRLINE }} />
      <GateFlash
         background={AMBER}
         times={[0, 0.44, 0.46, 0.49, 0.53, 0.58, 1]}
      />
      <GateFlash
         background={GREEN}
         times={[0, 0.64, 0.66, 0.69, 0.73, 0.78, 1]}
      />
      <span style={{ ...label, left: GATE_LEFT, top: 60, color: WHITE_LABEL }}>
         HOOK
      </span>
   </>
);

/* Attempt A is bounced at the gate; attempt B passes and lands as a commit */
const Attempts = ({ color }: TintProps) => (
   <>
      <motion.div
         animate={{
            y: [0, 0, 0, 14, 14, 8, 8, 0],
            opacity: [0, 0, 1, 1, 1, 1, 0, 0],
         }}
         transition={loop([0, 0.38, 0.4, 0.48, 0.5, 0.55, 0.6, 1], "easeInOut")}
         style={{ ...DOT_STYLE, background: color }}
      />
      <motion.div
         animate={{
            y: [0, 0, 0, 16, 28, 28, 0],
            opacity: [0, 0, 1, 1, 1, 0, 0],
         }}
         transition={loop([0, 0.58, 0.6, 0.68, 0.78, 0.82, 1], "easeInOut")}
         style={{ ...DOT_STYLE, background: color }}
      />
      <motion.div
         animate={{
            scale: [0.6, 0.6, 1, 1.3, 1, 1, 0.6],
            opacity: [0, 0, 1, 1, 1, 1, 0],
         }}
         transition={loop([0, 0.78, 0.82, 0.86, 0.9, 0.95, 1], "easeOut")}
         style={{
            ...DOT_STYLE,
            left: DOT_LEFT - 0.5,
            top: 67.5,
            width: 4,
            height: 4,
            background: GREEN,
         }}
      />
   </>
);

const AiDlcAnim = ({ color }: AiDlcAnimProps) => (
   <div style={{ width: 80, height: 80, position: "relative" }}>
      <ScaffoldPanel color={color} />
      <SpecAndDiff color={color} />
      <HookGate />
      <Attempts color={color} />
   </div>
);

export default AiDlcAnim;
