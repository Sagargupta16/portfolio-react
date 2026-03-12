import { useState, useEffect, useRef, useMemo } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
   value: string | number;
   duration?: number;
}

const AnimatedCounter = ({ value, duration = 2 }: Props) => {
   const [count, setCount] = useState<number>(0);
   const hasAnimated = useRef<boolean>(false);

   const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: true,
   });

   const { numericValue, suffix } = useMemo(() => {
      const str = String(value);
      let i = 0;
      while (i < str.length && str[i] >= "0" && str[i] <= "9") i++;
      if (i > 0) {
         return {
            numericValue: Number.parseInt(str.slice(0, i), 10),
            suffix: str.slice(i),
         };
      }
      return { numericValue: 0, suffix: str };
   }, [value]);

   useEffect(() => {
      if (!inView || hasAnimated.current) return;
      hasAnimated.current = true;

      const startTime = performance.now();
      const durationMs = duration * 1000;

      const animate = (currentTime: number) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / durationMs, 1);

         const eased = 1 - Math.pow(1 - progress, 3);
         const current = Math.round(eased * numericValue);

         setCount(current);

         if (progress < 1) {
            requestAnimationFrame(animate);
         }
      };

      requestAnimationFrame(animate);
   }, [inView, numericValue, duration]);

   return (
      <span
         ref={ref}
         className="font-mono text-3xl font-bold text-accent-cyan glow-cyan-text"
      >
         {count}
         {suffix && <span className="text-accent-cyan/70">{suffix}</span>}
      </span>
   );
};

export default AnimatedCounter;
