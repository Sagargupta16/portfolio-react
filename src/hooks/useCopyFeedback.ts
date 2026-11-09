import { useEffect, useRef, useState } from "react";

export type CopyResult = "copied" | "failed";
/** idle --copy--> copied | failed --after resetMs--> idle */
export type CopyState = "idle" | CopyResult;

/**
 * Clipboard feedback for one copy control. `copy` writes the text, shows the
 * result for `resetMs`, then returns to idle; a copy during the feedback
 * restarts it. `onIdle` runs as the feedback ends, with the result that is
 * ending. Shared by every copy control, so they all fail the same way.
 */
const useCopyFeedback = (
   resetMs = 1600,
   onIdle?: (ended: CopyResult) => void,
) => {
   const [state, setState] = useState<CopyState>("idle");
   const resetRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
   );
   useEffect(() => () => clearTimeout(resetRef.current), []);

   const copy = async (text: string): Promise<CopyResult> => {
      let result: CopyResult = "copied";
      try {
         await navigator.clipboard.writeText(text);
      } catch {
         // Permission refused, or no clipboard outside a secure context.
         result = "failed";
      }
      setState(result);
      clearTimeout(resetRef.current);
      resetRef.current = setTimeout(() => {
         setState("idle");
         onIdle?.(result);
      }, resetMs);
      return result;
   };

   return { state, copy };
};

export default useCopyFeedback;
