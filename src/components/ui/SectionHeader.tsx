import { motion } from "motion/react";
import { fadeInUp, lineGrow } from "@utils/animations";
import {
   MONO_FONT,
   CYAN,
   PURPLE,
   TEXT_MUTED,
   GLASS_BG,
   GLASS_BORDER,
} from "@/constants/theme";
import ScrollRevealText from "@components/ui/ScrollRevealText";

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
            gap: 16,
            marginBottom: 48,
            textAlign: "center",
         }}
         variants={fadeInUp}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      >
         {subtitle && (
            <span
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: MONO_FONT,
                  fontSize: 14,
                  color: TEXT_MUTED,
                  backgroundColor: GLASS_BG,
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: `1px solid ${GLASS_BORDER}`,
                  borderRadius: 9999,
                  padding: "4px 16px",
               }}
            >
               <span style={{ color: CYAN }}>{">"}</span>
               <ScrollRevealText text={subtitle} />
            </span>
         )}
         <h2
            className="gradient-text"
            style={{
               fontSize: "2.25rem",
               fontWeight: 700,
               letterSpacing: "-0.025em",
            }}
         >
            {title}
         </h2>
         <motion.div
            style={{
               height: 2,
               width: 80,
               borderRadius: 9999,
               marginTop: 4,
               background: `linear-gradient(to right, ${CYAN}, ${PURPLE})`,
            }}
            variants={lineGrow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
         />
      </motion.div>
   );
};

export default SectionHeader;
