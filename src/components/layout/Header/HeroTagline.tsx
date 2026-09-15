import { useEffect, useRef, useState } from "react";
import {
   AnimatePresence,
   motion,
   useInView,
   type Variants,
} from "motion/react";
import { getHeroTaglines } from "@data/personal";
import { EASING } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";
import { heroLabel } from "./heroMotion";

const TAGLINES = getHeroTaglines();
const TAGLINE_WORDS = TAGLINES.map((line) =>
   Array.from(line.matchAll(/\S+/g), (match) => ({
      text: match[0],
      offset: match.index,
   })),
);
const ROTATION_INTERVAL = 3000;

// Clear the old line before revealing the next; each word settles softly.
const lineVariants: Variants = {
   enter: {},
   visible: { transition: { staggerChildren: 0.035 } },
   exit: { transition: { staggerChildren: 0.018 } },
};
const wordVariants: Variants = {
   enter: { opacity: 0, y: "70%", scale: 0.96 },
   visible: {
      opacity: 1,
      y: "0%",
      scale: 1,
      transition: { duration: 0.46, ease: EASING.cinematic },
   },
   exit: {
      opacity: 0,
      y: "-55%",
      scale: 0.98,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
   },
};

// The sizing copies and animated line must use identical word boxes.
// Plain text measures slightly narrower and can clip a wrapped animated line.
const TaglineWords = ({
   words,
   animated = false,
}: {
   words: (typeof TAGLINE_WORDS)[number];
   animated?: boolean;
}) => (
   <span>
      {words.map((word) => (
         <span key={word.offset}>
            {word.offset > 0 && " "}
            {animated ? (
               <motion.span className="inline-block" variants={wordVariants}>
                  {word.text}
               </motion.span>
            ) : (
               <span className="inline-block">{word.text}</span>
            )}
         </span>
      ))}
   </span>
);

const HeroTagline = () => {
   const ref = useRef<HTMLDivElement>(null);
   const inView = useInView(ref, { amount: 0.5 });
   const { reducedMotion } = useMotionPreference();
   const [index, setIndex] = useState(0);

   useEffect(() => {
      if (reducedMotion || !inView || TAGLINES.length < 2) return;

      let timer: number | undefined;
      const syncTimer = () => {
         window.clearInterval(timer);
         if (!document.hidden) {
            timer = window.setInterval(
               () => setIndex((current) => (current + 1) % TAGLINES.length),
               ROTATION_INTERVAL,
            );
         }
      };

      syncTimer();
      document.addEventListener("visibilitychange", syncTimer);
      return () => {
         window.clearInterval(timer);
         document.removeEventListener("visibilitychange", syncTimer);
      };
   }, [inView, reducedMotion]);

   return (
      <motion.div
         ref={ref}
         variants={heroLabel}
         className="hero-tagline w-full min-w-0 font-semibold leading-relaxed text-accent-cyan"
         style={{ fontSize: "clamp(0.9375rem, 2vw, 1.125rem)" }}
      >
         <span className="sr-only">{TAGLINES[0]}</span>
         <span
            aria-hidden="true"
            className="relative grid w-full min-w-0 overflow-hidden"
         >
            {/* Shared grid cells reserve the tallest line, including wrapping. */}
            {TAGLINES.map((tagline, taglineIndex) => (
               <span
                  key={tagline}
                  className="invisible col-start-1 row-start-1"
               >
                  <TaglineWords words={TAGLINE_WORDS[taglineIndex]} />
               </span>
            ))}
            {reducedMotion ? (
               <span className="hero-tagline-current absolute inset-0 flex items-center justify-center">
                  <TaglineWords words={TAGLINE_WORDS[0]} />
               </span>
            ) : (
               <AnimatePresence initial={false} mode="wait">
                  <motion.span
                     key={index}
                     className="hero-tagline-current absolute inset-0 flex items-center justify-center"
                     variants={lineVariants}
                     initial="enter"
                     animate="visible"
                     exit="exit"
                  >
                     <TaglineWords words={TAGLINE_WORDS[index]} animated />
                  </motion.span>
               </AnimatePresence>
            )}
         </span>
      </motion.div>
   );
};

export default HeroTagline;
