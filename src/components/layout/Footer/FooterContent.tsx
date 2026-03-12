import { useMemo } from "react";
import { motion } from "motion/react";
import { getName, getSiteConfig } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import FooterSocial from "./FooterSocial";

const FooterContent = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const name = useMemo(() => getName(), []);
   const siteConfig = useMemo(() => getSiteConfig(), []);
   const techStack = siteConfig.tech_stack || [];

   return (
      <>
         {/* Logo */}
         <motion.span
            className="glow-cyan-text"
            style={{
               fontFamily: "JetBrains Mono, ui-monospace, monospace",
               fontSize: 24,
               fontWeight: 700,
               color: "#06b6d4",
            }}
            variants={staggerItem}
         >
            SG
         </motion.span>

         {/* Social links */}
         <FooterSocial />

         {/* Built with tech strip */}
         <motion.div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 8,
               flexWrap: "wrap",
               justifyContent: "center",
            }}
            variants={staggerItem}
         >
            <span
               style={{
                  fontSize: 11,
                  color: "#4a4a6a",
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
               }}
            >
               Built with
            </span>
            {techStack.map((tech) => (
               <span
                  key={tech}
                  style={{
                     fontSize: 10,
                     color: "#6e6e90",
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     padding: "2px 8px",
                     borderRadius: 4,
                     background: "rgba(255,255,255,0.03)",
                     border: "1px solid rgba(255,255,255,0.04)",
                  }}
               >
                  {tech}
               </span>
            ))}
         </motion.div>

         {/* Copyright + keyboard hint */}
         <motion.div
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 6,
            }}
            variants={staggerItem}
         >
            <p
               style={{
                  color: "#6e6e90",
                  fontSize: 14,
                  textAlign: "center",
               }}
            >
               &copy; {new Date().getFullYear()} {name}
            </p>
            {!isMobile && (
               <p
                  style={{
                     color: "#3a3a50",
                     fontSize: 10,
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     textAlign: "center",
                  }}
               >
                  Press 0-9 to navigate sections &middot; j/k to scroll
               </p>
            )}
         </motion.div>
      </>
   );
};

export default FooterContent;
