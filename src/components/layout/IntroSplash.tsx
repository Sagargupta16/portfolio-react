import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getName, getRole } from "@data/personal";
import { markIntroActive, markIntroDone } from "@utils/introState";
import useMotionPreference from "@hooks/useMotionPreference";
import { EASING, MONO_FONT, TEXT_MUTED } from "@/constants/theme";

// Stroke draw (1.3s) + fill (0.5s) run in CSS once the script face is ready.
const HOLD_MS = 2000;
// Never hold the page hostage to a slow font: draw with what we have after this.
const FONT_WAIT_MS = 700;
const SIGNATURE_FONT = '400 1em "Yellowtail"';

/** Every full page load; never on deep links, in Reduced motion, or in tests. */
const shouldShowIntro = (reducedMotion: boolean) => {
   if (reducedMotion || import.meta.env.MODE === "test") return false;
   return !globalThis.location?.hash;
};

/**
 * Opening curtain: the name is signed on in a script face (stroke draw, then
 * fill), then the panel slides up to reveal the already-rendered hero.
 * Any click, tap, key or wheel skips it. Decorative, so hidden from AT.
 */
const IntroSplash = () => {
   const { reducedMotion } = useMotionPreference();
   const [visible, setVisible] = useState(() => {
      const show = shouldShowIntro(reducedMotion);
      // Before the hero renders (earlier sibling), so it starts held back.
      if (show) markIntroActive();
      return show;
   });
   const [fontReady, setFontReady] = useState(false);

   // The hero's entrance starts the moment the curtain begins to lift.
   const leave = () => {
      markIntroDone();
      setVisible(false);
   };

   // Start the draw only once the script font is loaded (or after a short cap),
   // so the stroke never animates a fallback face and then swaps.
   useEffect(() => {
      if (!visible) return;
      let done = false;
      const ready = () => {
         if (!done) {
            done = true;
            setFontReady(true);
         }
      };
      const cap = globalThis.setTimeout(ready, FONT_WAIT_MS);
      globalThis.document?.fonts?.load(SIGNATURE_FONT).then(ready, ready);
      return () => globalThis.clearTimeout(cap);
   }, [visible]);

   // Any input skips, from the first frame (even while the font is loading).
   useEffect(() => {
      if (!visible) return;
      const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
      for (const name of events)
         globalThis.addEventListener(name, leave, { passive: true });
      return () => {
         for (const name of events) globalThis.removeEventListener(name, leave);
      };
   });

   // The hold timer starts once the signature can actually be drawn.
   useEffect(() => {
      if (!visible || !fontReady) return;
      const timer = globalThis.setTimeout(leave, HOLD_MS);
      return () => globalThis.clearTimeout(timer);
   });

   // Never leave the hero held back if the splash unmounts some other way.
   useEffect(() => () => markIntroDone(), []);

   return (
      <AnimatePresence>
         {visible && (
            <motion.div
               aria-hidden="true"
               className={`intro-splash${fontReady ? " intro-splash--ready" : ""}`}
               initial={{ y: 0 }}
               exit={{
                  y: "-100%",
                  transition: { duration: 0.8, ease: EASING.cinematic },
               }}
            >
               <svg
                  className="intro-splash-name"
                  viewBox="0 0 1000 240"
                  preserveAspectRatio="xMidYMid meet"
                  focusable="false"
               >
                  <text x="500" y="165" textAnchor="middle">
                     {getName()}
                  </text>
               </svg>
               <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={fontReady ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                     delay: 1.1,
                     duration: 0.5,
                     ease: EASING.cinematic,
                  }}
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 12,
                     letterSpacing: "0.2em",
                     textTransform: "uppercase",
                     color: TEXT_MUTED,
                     marginTop: 4,
                  }}
               >
                  {getRole()}
               </motion.p>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default IntroSplash;
