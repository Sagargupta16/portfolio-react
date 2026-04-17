import { useContext } from "react";
import useMediaQuery from "./useMediaQuery";
import { BreakpointContext, type BreakpointValue } from "./breakpointContext";
import { MEDIA_QUERIES } from "@/constants/theme";

/**
 * Access the current breakpoint state. Falls back to fresh useMediaQuery
 * calls if used outside BreakpointProvider -- keeps components self-sufficient
 * in tests.
 */
const useBreakpoint = (): BreakpointValue => {
   const ctx = useContext(BreakpointContext);
   const fallbackIsMobile = useMediaQuery(MEDIA_QUERIES.mobile);
   const fallbackIsTablet = useMediaQuery(MEDIA_QUERIES.tablet);
   return ctx ?? { isMobile: fallbackIsMobile, isTablet: fallbackIsTablet };
};

export default useBreakpoint;
