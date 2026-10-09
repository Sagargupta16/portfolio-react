import { useMemo, useRef } from "react";
import { useInView } from "motion/react";
import NumberFlow from "@number-flow/react";
import useMotionPreference from "@hooks/useMotionPreference";

interface Props {
   value: string | number;
   duration?: number;
}

const AnimatedCounter = ({ value, duration = 2 }: Props) => {
   const ref = useRef<HTMLSpanElement>(null);
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

   // Digits roll into place (NumberFlow) once the tile is half in view: each
   // digit spins on its own wheel instead of a counter ticking through every
   // value. Reduced renders the final value with no animation.
   const shown = inView || reducedMotion ? numericValue : 0;
   const timing = {
      duration: duration * 1000 * 0.6,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
   };

   // Short suffixes ("+", "k") read as part of the number; long ones
   // (" merged + 12 open") are annotations and shrink so they don't dominate.
   const suffixIsAnnotation = suffix.trim().length > 2;

   return (
      <span
         ref={ref}
         className="font-mono text-3xl font-bold text-accent-cyan tabular-nums"
      >
         <NumberFlow
            value={shown}
            animated={!reducedMotion}
            format={{
               minimumFractionDigits: decimals,
               maximumFractionDigits: decimals,
               useGrouping: false,
            }}
            spinTiming={timing}
            transformTiming={timing}
         />
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
