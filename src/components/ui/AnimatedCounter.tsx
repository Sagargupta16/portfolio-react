import { useMemo, useRef } from "react";
import { useInView } from "motion/react";
import NumberFlow from "@number-flow/react";
import useMotionPreference from "@hooks/useMotionPreference";

interface Props {
   value: string | number;
   duration?: number;
   /** One step smaller, for counters set three across on a phone. */
   compact?: boolean;
}

const AnimatedCounter = ({
   value,
   duration = 2,
   compact = false,
}: Readonly<Props>) => {
   const ref = useRef<HTMLSpanElement>(null);
   const { reducedMotion } = useMotionPreference();
   const inView = useInView(ref, { once: true, amount: 0.5 });

   // Parse an optional prefix (e.g. "~"), the number (thousands separators and
   // one decimal point allowed, e.g. "4,000" or "9.5") and a trailing suffix
   // (e.g. "+", "k", "/10"). decimals drives toFixed so values like a CGPA of
   // 9.5 animate and land correctly instead of being truncated to an integer;
   // a value written with separators keeps them.
   const { prefix, numericValue, decimals, grouped, suffix } = useMemo(() => {
      const str = String(value);
      const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s.exec(str);
      if (match) {
         const num = match[2];
         const dot = num.indexOf(".");
         return {
            prefix: match[1],
            numericValue: Number.parseFloat(num.replaceAll(",", "")),
            decimals: dot === -1 ? 0 : num.length - dot - 1,
            grouped: num.includes(","),
            suffix: match[3],
         };
      }
      return {
         prefix: "",
         numericValue: 0,
         decimals: 0,
         grouped: false,
         suffix: str,
      };
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
         className={`font-mono ${compact ? "text-2xl" : "text-3xl"} font-bold text-accent-cyan tabular-nums`}
      >
         {prefix && <span className="text-accent-cyan/70">{prefix}</span>}
         <NumberFlow
            value={shown}
            animated={!reducedMotion}
            locales="en-US"
            format={{
               minimumFractionDigits: decimals,
               maximumFractionDigits: decimals,
               useGrouping: grouped,
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
