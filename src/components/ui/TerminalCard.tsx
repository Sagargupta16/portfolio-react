import { useCallback, useEffect, useReducer } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import {
   MONO_FONT,
   TEXT_MUTED,
   CYAN,
   GREEN,
   GLASS_PANEL_STYLE,
   CHROME_BAR_STYLE,
} from "@/constants/theme";
import {
   PANEL_INITIAL,
   PANEL_VISIBLE,
   PANEL_TRANSITION,
} from "@utils/animations";
import { cryptoRandom } from "@utils/random";
import useRevealInView from "@hooks/useRevealInView";

interface TerminalLine {
   text: string;
   type: "command" | "output" | "success" | "accent";
   delay?: number;
}

interface TerminalCardProps {
   title?: string;
   prompt?: string;
   lines: TerminalLine[];
   typingSpeed?: number;
}

type Phase = "idle" | "typing" | "done";

interface State {
   phase: Phase;
   visibleLines: number;
   typedChars: number;
   runKey: number;
}

type Action =
   | { type: "start" }
   | { type: "reset" }
   | { type: "typeChar" }
   | { type: "advanceLine" }
   | { type: "rerun" };

const INITIAL_STATE: State = {
   phase: "idle",
   visibleLines: 0,
   typedChars: 0,
   runKey: 0,
};

const reducer = (state: State, action: Action): State => {
   switch (action.type) {
      case "start":
         return { ...state, phase: "typing" };
      case "reset":
         return { ...INITIAL_STATE, runKey: state.runKey };
      case "typeChar":
         return { ...state, typedChars: state.typedChars + 1 };
      case "advanceLine":
         return {
            ...state,
            visibleLines: state.visibleLines + 1,
            typedChars: 0,
         };
      case "rerun":
         return {
            phase: "typing",
            visibleLines: 0,
            typedChars: 0,
            runKey: state.runKey + 1,
         };
      default:
         return state;
   }
};

const LINE_COLORS: Record<TerminalLine["type"], string> = {
   success: GREEN,
   accent: CYAN,
   command: "rgb(var(--ch-white) / 0.7)",
   output: "rgb(var(--ch-white) / 0.7)",
};

const TerminalCard = ({
   title = "Terminal",
   prompt = "~",
   lines,
   typingSpeed = 35,
}: TerminalCardProps) => {
   const { ref, isInView } = useRevealInView();
   const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
   const { phase, visibleLines, typedChars, runKey } = state;

   const currentLine = lines[visibleLines] as TerminalLine | undefined;
   const isCurrentCommand = currentLine?.type === "command";
   const isComplete = visibleLines >= lines.length;

   // Reset when scrolled out, start when scrolled in
   useEffect(() => {
      if (isInView && phase === "idle") {
         const raf = requestAnimationFrame(() => dispatch({ type: "start" }));
         return () => cancelAnimationFrame(raf);
      }
      if (!isInView && phase !== "idle") {
         const raf = requestAnimationFrame(() => dispatch({ type: "reset" }));
         return () => cancelAnimationFrame(raf);
      }
   }, [isInView, phase]);

   // Progress through lines
   useEffect(() => {
      if (phase !== "typing" || isComplete) return;

      const line = lines[visibleLines];
      if (line.type === "command") {
         if (typedChars < line.text.length) {
            const timeout = setTimeout(
               () => dispatch({ type: "typeChar" }),
               typingSpeed + cryptoRandom() * 20,
            );
            return () => clearTimeout(timeout);
         }
         const timeout = setTimeout(
            () => dispatch({ type: "advanceLine" }),
            300,
         );
         return () => clearTimeout(timeout);
      }
      const delay = line.delay ?? 80;
      const timeout = setTimeout(
         () => dispatch({ type: "advanceLine" }),
         delay,
      );
      return () => clearTimeout(timeout);
   }, [phase, visibleLines, typedChars, lines, typingSpeed, isComplete]);

   const handleRerun = useCallback(() => dispatch({ type: "rerun" }), []);

   return (
      <motion.div
         ref={ref}
         initial={PANEL_INITIAL}
         animate={isInView ? PANEL_VISIBLE : {}}
         transition={PANEL_TRANSITION}
         style={GLASS_PANEL_STYLE}
      >
         {/* Chrome bar */}
         <div
            style={{
               ...CHROME_BAR_STYLE,
               height: 36,
               padding: "0 12px",
               justifyContent: "space-between",
            }}
         >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                     <div
                        key={i}
                        style={{
                           width: 7,
                           height: 7,
                           borderRadius: "50%",
                           background: "rgb(var(--ch-white) / 0.12)",
                        }}
                     />
                  ))}
               </div>
               <span
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     color: TEXT_MUTED,
                  }}
               >
                  {title}
               </span>
            </div>
            <button
               onClick={handleRerun}
               aria-label="Re-run terminal"
               style={{
                  background: "rgb(var(--ch-white) / 0.05)",
                  border: "1px solid rgb(var(--ch-white) / 0.08)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: TEXT_MUTED,
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  transition: "all 0.2s ease",
               }}
               onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                     "rgb(var(--ch-cyan) / 0.3)";
                  e.currentTarget.style.color = CYAN;
               }}
               onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                     "rgb(var(--ch-white) / 0.08)";
                  e.currentTarget.style.color = TEXT_MUTED;
               }}
            >
               <RotateCcw size={11} />
               Re-run
            </button>
         </div>

         {/* Terminal body */}
         <div
            key={runKey}
            style={{
               padding: "12px 16px",
               fontFamily: MONO_FONT,
               fontSize: 12,
               lineHeight: 1.7,
               minHeight: 120,
            }}
         >
            {lines.slice(0, visibleLines).map((line, i) => (
               <div
                  key={`${runKey}-${i}`}
                  style={{ color: LINE_COLORS[line.type] }}
               >
                  {line.type === "command" && (
                     <span style={{ color: TEXT_MUTED }}>{prompt} % </span>
                  )}
                  {line.type === "success" && (
                     <span style={{ marginRight: 4 }}>&#10003;</span>
                  )}
                  {line.text}
               </div>
            ))}

            {/* Currently typing line */}
            {isCurrentCommand && !isComplete && (
               <div style={{ color: "rgb(var(--ch-white) / 0.7)" }}>
                  <span style={{ color: TEXT_MUTED }}>{prompt} % </span>
                  {currentLine.text.substring(0, typedChars)}
                  <span className="typewriter-cursor" />
               </div>
            )}

            {/* Idle cursor */}
            {isComplete && (
               <div>
                  <span style={{ color: TEXT_MUTED }}>{prompt} % </span>
                  <span className="typewriter-cursor" />
               </div>
            )}
         </div>
      </motion.div>
   );
};

export default TerminalCard;
