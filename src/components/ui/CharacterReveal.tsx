import { useRef, useMemo, type CSSProperties } from "react";
import { motion, useInView } from "motion/react";

type TagName = "h1" | "h2" | "h3" | "h4" | "p" | "span";

interface CharacterRevealProps {
   text: string;
   as?: TagName;
   className?: string;
   style?: CSSProperties;
   stagger?: number;
}

const motionTags = {
   h1: motion.h1,
   h2: motion.h2,
   h3: motion.h3,
   h4: motion.h4,
   p: motion.p,
   span: motion.span,
} as const;

const CharacterReveal = ({
   text,
   as = "span",
   className,
   style,
   stagger = 0.025,
}: CharacterRevealProps) => {
   const ref = useRef<HTMLElement>(null);
   const isInView = useInView(ref, {
      once: true,
      margin: "0px 0px -80px 0px",
   });

   // Group characters by word so line-wrapping happens at word boundaries --
   // per-character inline-blocks let the browser break mid-word ("Sagar G/upta").
   const words = useMemo(() => {
      const counts: Record<string, number> = {};
      return text.split(" ").map((word) => {
         counts[word] = (counts[word] ?? 0) + 1;
         return {
            id: `${word}-${counts[word]}`,
            chars: word.split("").map((char, i) => ({
               char,
               id: `${word}-${counts[word]}-${i}`,
            })),
         };
      });
   }, [text]);

   const MotionTag = motionTags[as];

   let charIndex = 0;

   return (
      <MotionTag
         ref={ref as never}
         className={className}
         style={{ display: "inline-block", ...style }}
         aria-label={text}
      >
         {words.map((word, wi) => (
            <span
               key={word.id}
               style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
               {word.chars.map(({ char, id }) => {
                  const delay = charIndex++ * stagger;
                  return (
                     <motion.span
                        key={id}
                        style={{ display: "inline-block" }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                           isInView
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 20 }
                        }
                        transition={{
                           type: "spring",
                           stiffness: 200,
                           damping: 15,
                           delay,
                        }}
                     >
                        {char}
                     </motion.span>
                  );
               })}
               {wi < words.length - 1 && <span>&nbsp;</span>}
            </span>
         ))}
      </MotionTag>
   );
};

export default CharacterReveal;
