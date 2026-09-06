import { useEffect, useMemo, useRef } from "react";
import { animate, useInView } from "motion/react";
import { EASING } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";

interface Props {
   value: string | number;
   duration?: number;
}

const AnimatedCounter = ({ value, duration = 2 }: Props) => {
   const ref = useRef<HTMLSpanElement>(null);
   const numberRef = useRef<HTMLSpanElement>(null);
   const { reducedMotion } = useMotionPreference();
   const inView = useInView(ref, { once: true, amount: 0.5 });

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

   // The count writes textContent straight from Motion's frameloop: no React
   // state, so twelve tiles counting together cost zero commits. Reduced skips
   // the effect and renders the final value below.
   useEffect(() => {
      const node = numberRef.current;
      if (!inView || reducedMotion || !node) return;

      const controls = animate(0, numericValue, {
         duration,
         ease: EASING.cinematic,
         onUpdate: (latest) => {
            node.textContent = latest.toFixed(decimals);
         },
      });
      return () => controls.stop();
   }, [inView, reducedMotion, numericValue, decimals, duration]);

   // Short suffixes ("+", "k") read as part of the number; long ones
   // (" merged + 12 open") are annotations and shrink so they don't dominate.
   const suffixIsAnnotation = suffix.trim().length > 2;

   return (
      <span
         ref={ref}
         className="font-mono text-3xl font-bold text-accent-cyan tabular-nums"
      >
         <span ref={numberRef}>
            {(reducedMotion ? numericValue : 0).toFixed(decimals)}
         </span>
         {suffix && (
            <span
               className="text-accent-cyan/70"
               style={
                  suffixIsAnnotation
                     ? { fontSize: "0.5em", fontWeight: 600 }
                     : undefined
               }
            >
               {suffix}
            </span>
         )}
      </span>
   );
};

export default AnimatedCounter;
