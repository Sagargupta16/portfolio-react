import { motion, type Variants } from "motion/react";
import { VIEWPORT_MARGIN } from "@utils/animations";
import { EASING } from "@/constants/theme";

interface Props {
   title: string;
   subtitle?: string;
}

// Badge pops first, then the title slides up out of its clip 120ms later.
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

const SectionHeader = ({ title, subtitle }: Props) => {
   return (
      <motion.div
         style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            marginBottom: 56,
            textAlign: "center",
         }}
         variants={headerContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      >
         {subtitle && (
            <motion.span className="badge-pill" variants={badgeReveal}>
               {subtitle}
            </motion.span>
         )}
         <h2
            className="display-heading"
            style={{
               fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
               lineHeight: 1.2,
               color: "var(--color-text-primary)",
               maxWidth: 640,
               overflow: "hidden",
            }}
         >
            {/* The padding rides on the sliding span so descenders keep room at
                rest while y: 100% parks the whole span below the clip. */}
            <motion.span
               variants={titleReveal}
               style={{ display: "block", paddingBottom: "0.1em" }}
            >
               {title}
            </motion.span>
         </h2>
      </motion.div>
   );
};

export default SectionHeader;
