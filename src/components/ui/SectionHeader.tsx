import { motion } from "motion/react";
import { fadeInUp, lineGrow } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";

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
            marginBottom: 64,
            textAlign: "center",
         }}
         variants={fadeInUp}
         initial="hidden"
         whileInView="visible"
         viewport={{ margin: "0px 0px -100px 0px" }}
      >
         {subtitle && (
            <span
               style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: MONO_FONT,
                  fontSize: 14,
                  color: "#6e6e90",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 9999,
                  padding: "6px 16px",
               }}
            >
               <span style={{ color: "#06b6d4" }}>{">"}</span>
               {subtitle}
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
               background: "linear-gradient(to right, #06b6d4, #a855f7)",
            }}
            variants={lineGrow}
            initial="hidden"
            whileInView="visible"
            viewport={{}}
         />
      </motion.div>
   );
};

export default SectionHeader;
