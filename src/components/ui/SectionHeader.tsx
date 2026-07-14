import { motion } from "motion/react";
import { fadeInUp } from "@utils/animations";

interface Props {
   title: string;
   subtitle?: string;
}

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
         variants={fadeInUp}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      >
         {subtitle && <span className="badge-pill">{subtitle}</span>}
         <h2
            style={{
               fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
               fontWeight: 600,
               letterSpacing: "-0.02em",
               lineHeight: 1.2,
               color: "var(--color-text-primary)",
               maxWidth: 640,
            }}
         >
            {title}
         </h2>
      </motion.div>
   );
};

export default SectionHeader;
