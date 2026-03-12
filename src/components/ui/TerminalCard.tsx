import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useInView } from "motion/react";
import { RotateCcw } from "lucide-react";
import { MONO_FONT, TEXT_MUTED, CYAN, GREEN } from "@/constants/theme";

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

const TerminalCard = ({
   title = "Terminal",
   prompt = "~",
   lines,
   typingSpeed = 35,
}: TerminalCardProps) => {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, {
      once: false,
      margin: "0px 0px -60px 0px",
   });
   const [visibleLines, setVisibleLines] = useState<number>(0);
   const [typedChars, setTypedChars] = useState<number>(0);
   const [isTyping, setIsTyping] = useState(false);
   const [runKey, setRunKey] = useState(0);

   const currentLine = lines[visibleLines] as TerminalLine | undefined;
   const isCurrentCommand = currentLine?.type === "command";

   // Reset when scrolled out, start when scrolled in
   useEffect(() => {
      if (isInView && visibleLines === 0 && !isTyping) {
         const raf = requestAnimationFrame(() => setIsTyping(true));
         return () => cancelAnimationFrame(raf);
      }
      if (!isInView && visibleLines > 0) {
         const reset = requestAnimationFrame(() => {
            setVisibleLines(0);
            setTypedChars(0);
            setIsTyping(false);
         });
         return () => cancelAnimationFrame(reset);
      }
   }, [isInView, visibleLines, isTyping]);

   // Type command characters one by one
   useEffect(() => {
      if (!isTyping || visibleLines >= lines.length) return;

      const line = lines[visibleLines];
      if (line.type === "command") {
         if (typedChars < line.text.length) {
            const timeout = setTimeout(
               () => setTypedChars((c) => c + 1),
               typingSpeed + Math.random() * 20,
            );
            return () => clearTimeout(timeout);
         }
         // Command fully typed, pause then move to next
         const timeout = setTimeout(() => {
            setVisibleLines((v) => v + 1);
            setTypedChars(0);
         }, 300);
         return () => clearTimeout(timeout);
      }
      // Output lines appear instantly after a short delay
      const delay = line.delay ?? 80;
      const timeout = setTimeout(() => {
         setVisibleLines((v) => v + 1);
         setTypedChars(0);
      }, delay);
      return () => clearTimeout(timeout);
   }, [isTyping, visibleLines, typedChars, lines, typingSpeed]);

   const handleRerun = useCallback(() => {
      setVisibleLines(0);
      setTypedChars(0);
      setIsTyping(true);
      setRunKey((k) => k + 1);
   }, []);

   const getLineColor = (type: TerminalLine["type"]) => {
      switch (type) {
         case "success":
            return GREEN;
         case "accent":
            return CYAN;
         default:
            return "rgb(var(--ch-white) / 0.7)";
      }
   };

   return (
      <motion.div
         ref={ref}
         initial={{ opacity: 0, y: 30 }}
         animate={isInView ? { opacity: 1, y: 0 } : {}}
         transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
         style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgb(var(--ch-white) / 0.06)",
            background: "rgb(var(--ch-glass) / 0.5)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
         }}
      >
         {/* Chrome bar */}
         <div
            style={{
               height: 36,
               background: "rgb(var(--ch-bg-sec) / 0.8)",
               borderBottom: "1px solid rgb(var(--ch-white) / 0.06)",
               display: "flex",
               alignItems: "center",
               padding: "0 12px",
               justifyContent: "space-between",
            }}
         >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <div style={{ display: "flex", gap: 5 }}>
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
               aria-label="Re-run"
               style={{
                  background: "rgb(var(--ch-white) / 0.05)",
                  border: "1px solid rgb(var(--ch-white) / 0.08)",
                  borderRadius: 6,
                  padding: "4px 10px",
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
               padding: "14px 16px",
               fontFamily: MONO_FONT,
               fontSize: 13,
               lineHeight: 1.8,
               minHeight: 120,
            }}
         >
            {lines.slice(0, visibleLines).map((line, i) => (
               <div
                  key={`${runKey}-${i}`}
                  style={{ color: getLineColor(line.type) }}
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
            {isCurrentCommand && visibleLines < lines.length && (
               <div style={{ color: "rgb(var(--ch-white) / 0.7)" }}>
                  <span style={{ color: TEXT_MUTED }}>{prompt} % </span>
                  {currentLine.text.substring(0, typedChars)}
                  <span className="typewriter-cursor" />
               </div>
            )}

            {/* Idle cursor */}
            {visibleLines >= lines.length && (
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
