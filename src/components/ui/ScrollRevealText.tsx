import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import useReducedMotion from "@utils/useReducedMotion";
import { CYAN, PURPLE } from "@/constants/theme";

interface ScrollRevealTextProps {
   text: string;
   className?: string;
   style?: React.CSSProperties;
}

const Word = ({
   word,
   index,
   total,
   progress,
}: {
   word: string;
   index: number;
   total: number;
   progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) => {
   const start = index / total;
   const end = Math.min(start + 1.5 / total, 1);
   const opacity = useTransform(progress, [start, end], [0.15, 1]);

   return (
      <motion.span
         style={{
            opacity,
            display: "inline-block",
            backgroundImage: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginRight: 6,
         }}
      >
         {word}
      </motion.span>
   );
};

const ScrollRevealText = ({
   text,
   className,
   style,
}: ScrollRevealTextProps) => {
   const containerRef = useRef<HTMLSpanElement>(null);
   const reducedMotion = useReducedMotion();

   const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start 0.9", "end 0.4"],
   });

   const words = text.split(" ");

   if (reducedMotion) {
      return (
         <span className={className} style={style}>
            {text}
         </span>
      );
   }

   return (
      <span
         ref={containerRef}
         className={className}
         style={{ display: "inline-flex", flexWrap: "wrap", ...style }}
      >
         {words.map((word, i) => (
            <Word
               key={`${word}-${i}`}
               word={word}
               index={i}
               total={words.length}
               progress={scrollYProgress}
            />
         ))}
      </span>
   );
};

export default ScrollRevealText;
