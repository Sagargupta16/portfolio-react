import { useMemo, type ReactNode } from "react";
import useMediaQuery from "./useMediaQuery";
import { BreakpointContext } from "./breakpointContext";
import { MEDIA_QUERIES } from "@/constants/theme";

export const BreakpointProvider = ({ children }: { children: ReactNode }) => {
   const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);
   const isTablet = useMediaQuery(MEDIA_QUERIES.tablet);
   const value = useMemo(() => ({ isMobile, isTablet }), [isMobile, isTablet]);
   return (
      <BreakpointContext.Provider value={value}>
         {children}
      </BreakpointContext.Provider>
   );
};
