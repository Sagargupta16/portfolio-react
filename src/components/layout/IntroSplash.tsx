import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getName, getRole } from "@data/personal";
import useMotionPreference from "@hooks/useMotionPreference";
import { EASING, MONO_FONT, TEXT_MUTED } from "@/constants/theme";

const SEEN_KEY = "intro-seen";
// Stroke draw (1.1s) + fill (0.4s) run in CSS; the curtain lifts after this.
const HOLD_MS = 1700;

/** First visit of a browser session only; never on deep links, in Reduced motion, or in tests. */
const shouldShowIntro = (reducedMotion: boolean) => {
   if (reducedMotion || import.meta.env.MODE === "test") return false;
   if (globalThis.location?.hash) return false;
   try {
      return !globalThis.sessionStorage?.getItem(SEEN_KEY);
   } catch {
      return false; // storage blocked: skip rather than replay on every load
   }
};

/**
 * Opening curtain: the name is written on as an outline in the display face,
 * fills in, then the panel slides up to reveal the already-rendered hero.
 * Any click, tap, key or wheel skips it. Decorative, so hidden from AT.
 */
const IntroSplash = () => {
   const { reducedMotion } = useMotionPreference();
   const [visible, setVisible] = useState(() => shouldShowIntro(reducedMotion));

   useEffect(() => {
      if (!visible) return;
      try {
         globalThis.sessionStorage?.setItem(SEEN_KEY, "1");
      } catch {
         // ignore: the splash simply shows again next time
      }
      const timer = globalThis.setTimeout(() => setVisible(false), HOLD_MS);
      const skip = () => setVisible(false);
      const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
      for (const name of events)
         globalThis.addEventListener(name, skip, { passive: true });
      return () => {
         globalThis.clearTimeout(timer);
         for (const name of events) globalThis.removeEventListener(name, skip);
      };
   }, [visible]);

   const name = getName();

   return (
      <AnimatePresence>
         {visible && (
            <motion.div
               aria-hidden="true"
               className="intro-splash"
               initial={{ y: 0 }}
               exit={{
                  y: "-100%",
                  transition: { duration: 0.8, ease: EASING.cinematic },
               }}
            >
               <svg
                  className="intro-splash-name"
                  viewBox="0 0 1000 200"
                  preserveAspectRatio="xMidYMid meet"
                  role="presentation"
               >
                  <text x="500" y="135" textAnchor="middle">
                     {name}
                  </text>
               </svg>
               <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                     delay: 0.9,
                     duration: 0.5,
                     ease: EASING.cinematic,
                  }}
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 12,
                     letterSpacing: "0.2em",
                     textTransform: "uppercase",
                     color: TEXT_MUTED,
                     marginTop: 8,
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
