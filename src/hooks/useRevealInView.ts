import { useRef } from "react";
import { useInView } from "motion/react";

// MarginType not re-exported by motion/react -- pass-through typed as the
// literal template the library expects. Using a string here is safe because
// useInView normalizes the value at runtime.
type Margin = `${number}px ${number}px ${number}px ${number}px`;

/**
 * Shared hook for glass-panel reveal-on-scroll cards.
 * Returns a ref to attach and a boolean indicating visibility.
 */
const useRevealInView = (margin: Margin = "0px 0px -60px 0px") => {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, { once: false, margin });
   return { ref, isInView } as const;
};

export default useRevealInView;
