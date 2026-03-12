import type { ReactNode } from "react";
import { motion } from "motion/react";
import { sectionRevealEnhanced } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
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
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <motion.section
         id={id}
         className="py-24 px-6"
         style={{
            padding: isMobile ? "64px 16px" : "96px 24px",
            scrollMarginTop: 64,
         }}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
         variants={sectionRevealEnhanced}
      >
         {maxWidth ? (
            <div style={{ maxWidth, margin: "0 auto" }}>
               <SectionHeader title={title} subtitle={subtitle} />
               {children}
            </div>
         ) : (
            <>
               <SectionHeader title={title} subtitle={subtitle} />
               {children}
            </>
         )}
      </motion.section>
   );
};

export default PageSection;
