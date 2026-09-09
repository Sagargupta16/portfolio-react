import { use } from "react";
import { SectionNavigationContext } from "./sectionNavigationContext";

const useSectionNavigation = () => {
   const context = use(SectionNavigationContext);
   if (!context) {
      throw new Error(
         "useSectionNavigation must be used within SectionNavigationProvider",
      );
   }
   return context;
};

export default useSectionNavigation;
