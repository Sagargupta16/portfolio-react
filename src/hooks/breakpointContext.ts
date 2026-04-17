import { createContext } from "react";

export interface BreakpointValue {
   isMobile: boolean;
   isTablet: boolean;
}

export const BreakpointContext = createContext<BreakpointValue | null>(null);
