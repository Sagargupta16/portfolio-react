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

   const chars = useMemo(() => {
      const counts: Record<string, number> = {};
      return text.split("").map((char) => {
         counts[char] = (counts[char] ?? 0) + 1;
         return { char, id: `${char}-${counts[char]}` };
      });
   }, [text]);

   const MotionTag = motionTags[as];

   return (
      <MotionTag
         ref={ref as never}
         className={className}
         style={{ display: "inline-block", ...style }}
         aria-label={text}
      >
         {chars.map(({ char, id }, i) => {
            if (char === " ") {
               return (
                  <span key={id} style={{ display: "inline-block" }}>
                     &nbsp;
                  </span>
               );
            }
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
                     delay: i * stagger,
                  }}
               >
                  {char}
               </motion.span>
            );
         })}
      </MotionTag>
   );
};

export default CharacterReveal;
