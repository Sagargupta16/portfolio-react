import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import {
   BLUE_LIGHT,
   DURATION,
   EASING,
   TEXT_PRIMARY,
   TEXT_MUTED,
} from "@/constants/theme";
import { getSectionCopy } from "@data/sections";
import { getUiCopy } from "@data/ui";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import { fillTemplate } from "@utils/fillTemplate";
import "./contact-form.css";

const COPY = getSectionCopy("contact").sent;
const LOG = COPY.log;
// The same shell prompt as the command palette.
const PROMPT = getUiCopy().palette.prompt;

/* The push log's timeline, in seconds from mount: the command types itself
   in, each output line lands in turn, then the title block follows, about
   1.2 s in all. Reduced shows every line and the title at once. */
const TYPE_START = 0.15;
const TYPE_STEP = 0.02;
const TYPE_FADE = 0.05;
const LINE_STEP = 0.2;
const LINE_FADE = 0.18;

// Keyed and timed up front, so each typed character keeps one stable key.
const COMMAND_CHARS = [...LOG.command].map((char, at) => ({
   key: `c${at}`,
   char,
   delay: TYPE_START + at * TYPE_STEP,
}));
const TYPED_AT = TYPE_START + COMMAND_CHARS.length * TYPE_STEP;
const lineDelay = (row: number) => TYPED_AT + 0.12 + row * LINE_STEP;
const OUTPUT_ROWS = ["counting", "writing", "done"] as const;
const RESULT_DELAY = lineDelay(OUTPUT_ROWS.length - 1) + LINE_FADE / 2;

const CHAR_HIDDEN = { opacity: 0 };
const CHAR_SHOWN = { opacity: 1 };
const LINE_HIDDEN = { opacity: 0, x: -6 };
const LINE_SHOWN = { opacity: 1, x: 0 };

interface PushLogProps {
   senderName: string;
   reducedMotion: boolean;
}

/* The send's "git push" moment, in the command palette's shell look.
   Decorative: the heading and thanks line below carry the result for
   assistive tech, so the log stays out of the status region's reading. */
const PushLog = ({ senderName, reducedMotion }: PushLogProps) => (
   <div className="push-log" aria-hidden="true">
      <div className="push-log-prompt">
         <span className="push-log-sign">{PROMPT}</span>
         <span className="push-log-command">
            {COMMAND_CHARS.map(({ key, char, delay }) => (
               <motion.span
                  key={key}
                  initial={reducedMotion ? false : CHAR_HIDDEN}
                  animate={CHAR_SHOWN}
                  transition={{ delay, duration: TYPE_FADE }}
               >
                  {char}
               </motion.span>
            ))}
         </span>
      </div>
      <div className="push-log-body">
         {OUTPUT_ROWS.map((row, index) => (
            <motion.p
               key={row}
               className={row === "done" ? "push-log-done" : undefined}
               initial={reducedMotion ? false : LINE_HIDDEN}
               animate={LINE_SHOWN}
               transition={{
                  delay: lineDelay(index),
                  duration: LINE_FADE,
                  ease: EASING.cinematic,
               }}
            >
               {fillTemplate(LOG[row], { name: senderName })}
            </motion.p>
         ))}
      </div>
   </div>
);

interface SendConfirmationProps {
   onReset: () => void;
   senderName: string;
}

const SendConfirmation = ({ onReset, senderName }: SendConfirmationProps) => {
   const headingRef = useRef<HTMLHeadingElement>(null);
   const { isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();
   // The result lands as the push log finishes; Reduced shows both at once.
   const resultDelay = reducedMotion ? 0 : RESULT_DELAY;
   // "Send another" stays inert until it is visible, so a click on the still
   // transparent button during the log cannot reset the form unseen.
   const [landed, setLanded] = useState(reducedMotion);

   // The form (and its focused submit button) unmounts on success, which drops
   // focus to <body>. Land it on the heading so keyboard users stay oriented
   // and screen readers read the result -- a live region that mounts already
   // populated is not reliably announced on its own. preventScroll keeps the
   // native focus jump from fighting Lenis, which owns page scrolling.
   useEffect(() => {
      headingRef.current?.focus({ preventScroll: true });
   }, []);

   return (
      <div
         className="glass-card"
         role="status"
         aria-live="polite"
         style={{
            padding: isMobile ? "32px 18px" : "48px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            minHeight: 280,
            textAlign: "center",
         }}
      >
         <PushLog senderName={senderName} reducedMotion={reducedMotion} />
         <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
               duration: DURATION.default,
               ease: EASING.cinematic,
               delay: resultDelay,
            }}
            onAnimationComplete={() => setLanded(true)}
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 12,
            }}
         >
            <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: resultDelay,
               }}
            >
               <CheckCircle size={48} style={{ color: BLUE_LIGHT }} />
            </motion.div>
            <h3
               ref={headingRef}
               tabIndex={-1}
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
               }}
            >
               {COPY.title}
            </h3>
            {senderName && (
               <p style={{ fontSize: 14, color: TEXT_MUTED }}>
                  {fillTemplate(COPY.thanks, { name: senderName })}
               </p>
            )}
            <button
               type="button"
               className="btn-outline"
               inert={!landed}
               onClick={onReset}
               style={{ marginTop: 8 }}
            >
               {COPY.again}
            </button>
         </motion.div>
      </div>
   );
};

export default SendConfirmation;
