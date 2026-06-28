import { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
   value: string | number;
   duration?: number;
}

const AnimatedCounter = ({ value, duration = 2 }: Props) => {
   const [count, setCount] = useState<number>(0);

   const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: true,
   });

   // Parse a leading number (incl. one decimal point, e.g. "9.5") + trailing
   // suffix (e.g. "+", "k"). decimals drives toFixed so values like a CGPA of
   // 9.5 animate and land correctly instead of being truncated to an integer.
   const { numericValue, decimals, suffix } = useMemo(() => {
      const str = String(value);
      const match = /^(\d+(?:\.\d+)?)(.*)$/s.exec(str);
      if (match) {
         const num = match[1];
         const dot = num.indexOf(".");
         return {
            numericValue: Number.parseFloat(num),
            decimals: dot === -1 ? 0 : num.length - dot - 1,
            suffix: match[2],
         };
      }
      return { numericValue: 0, decimals: 0, suffix: str };
   }, [value]);

   useEffect(() => {
      if (!inView) return;

      let rafId = 0;
      const startTime = performance.now();
      const durationMs = duration * 1000;

      const animate = (currentTime: number) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / durationMs, 1);
         const eased = 1 - Math.pow(1 - progress, 3);
         setCount(eased * numericValue);
         if (progress < 1) rafId = requestAnimationFrame(animate);
      };

      rafId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(rafId);
   }, [inView, numericValue, duration]);

   return (
      <span
         ref={ref}
         className="font-mono text-3xl font-bold text-accent-cyan glow-cyan-text tabular-nums"
      >
         {count.toFixed(decimals)}
         {suffix && <span className="text-accent-cyan/70">{suffix}</span>}
      </span>
   );
};

export default AnimatedCounter;
