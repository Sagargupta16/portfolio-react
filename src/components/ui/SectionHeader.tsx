import { motion, type Variants } from "motion/react";
import { VIEWPORT_MARGIN } from "@utils/animations";
import { EASING, MAX_WIDTH } from "@/constants/theme";
import { CONTENT_SECTIONS } from "@/constants/sections";

interface Props {
   sectionId: string;
   title: string;
   subtitle?: string;
}

// The eyebrow appears first, then the title slides up out of its clip.
const headerContainer: Variants = {
   hidden: {},
   visible: { transition: { staggerChildren: 0.12 } },
};

const badgeReveal: Variants = {
   hidden: { opacity: 0, scale: 0.92 },
   visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: EASING.brisk },
   },
};

const titleReveal: Variants = {
   hidden: { y: "100%" },
   visible: { y: 0, transition: { duration: 0.7, ease: EASING.cinematic } },
};

const ruleReveal: Variants = {
   hidden: { opacity: 0, scaleX: 0 },
   visible: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: 0.6, ease: EASING.cinematic },
   },
};

const SectionHeader = ({ sectionId, title, subtitle }: Props) => {
   const sectionIndex = CONTENT_SECTIONS.findIndex(
      ({ id }) => id === sectionId,
   );

   return (
      <motion.div
         className="section-header"
         style={{
            maxWidth: MAX_WIDTH,
         }}
         variants={headerContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      >
         {subtitle && (
            <motion.div
               className="section-header-eyebrow"
               variants={badgeReveal}
            >
               {sectionIndex >= 0 && (
                  <span aria-hidden="true" className="section-header-number">
                     {String(sectionIndex + 1).padStart(2, "0")} /
                  </span>
               )}
               {subtitle}
            </motion.div>
         )}
         <div className="section-header-heading">
            <h2 className="display-heading">
               {/* Keep room for descenders inside the animated clipping area. */}
               <motion.span
                  variants={titleReveal}
                  style={{ display: "block", paddingBottom: "0.1em" }}
               >
                  {title}
               </motion.span>
            </h2>
            <motion.span
               className="section-header-rule"
               variants={ruleReveal}
               style={{ transformOrigin: "left" }}
               aria-hidden="true"
            />
         </div>
      </motion.div>
   );
};

export default SectionHeader;
