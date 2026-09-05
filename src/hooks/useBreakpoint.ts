import { use } from "react";
import { BreakpointContext, type BreakpointValue } from "./breakpointContext";

/** Access breakpoint state supplied once at the application root. */
const useBreakpoint = (): BreakpointValue => {
   const context = use(BreakpointContext);
   if (!context) {
      throw new Error("useBreakpoint must be used within BreakpointProvider");
   }
   return context;
};

export default useBreakpoint;
