import type { ReactNode } from "react";
import { motion } from "motion/react";
import { sectionRevealEnhanced, VIEWPORT_MARGIN } from "@utils/animations";
import useBreakpoint from "@hooks/useBreakpoint";
import SectionHeader from "@components/ui/SectionHeader";

interface PageSectionProps {
   id: string;
   title: string;
   subtitle: string;
   children: ReactNode;
   maxWidth?: number;
}

const PageSection = ({
   id,
   title,
   subtitle,
   children,
   maxWidth,
}: PageSectionProps) => {
   const { isMobile } = useBreakpoint();

   return (
      <motion.div
         data-section-content={id}
         style={{
            padding: isMobile ? "64px 16px" : "96px 24px",
         }}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
         variants={sectionRevealEnhanced}
      >
         {maxWidth ? (
            <div style={{ maxWidth, margin: "0 auto" }}>
               <SectionHeader
                  sectionId={id}
                  title={title}
                  subtitle={subtitle}
               />
               {children}
            </div>
         ) : (
            <>
               <SectionHeader
                  sectionId={id}
                  title={title}
                  subtitle={subtitle}
               />
               {children}
            </>
         )}
      </motion.div>
   );
};

export default PageSection;
