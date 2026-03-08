import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { getName, getSocialProfiles, getSiteConfig } from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import ICON_MAP from "@utils/iconMap";

const KONAMI = [
   "ArrowUp",
   "ArrowUp",
   "ArrowDown",
   "ArrowDown",
   "ArrowLeft",
   "ArrowRight",
   "ArrowLeft",
   "ArrowRight",
   "b",
   "a",
];

const Footer = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const name = useMemo(() => getName(), []);
   const socialProfiles = useMemo(() => getSocialProfiles(), []);
   const siteConfig = useMemo(() => getSiteConfig(), []);
   const techStack = siteConfig.tech_stack || [];
   const [easterEgg, setEasterEgg] = useState(false);
   const [konamiIdx, setKonamiIdx] = useState(0);

   const handleKey = useCallback(
      (e) => {
         if (e.key === KONAMI[konamiIdx]) {
            const next = konamiIdx + 1;
            if (next === KONAMI.length) {
               setEasterEgg(true);
               setKonamiIdx(0);
            } else {
               setKonamiIdx(next);
            }
         } else {
            setKonamiIdx(0);
         }
      },
      [konamiIdx],
   );

   useEffect(() => {
      globalThis.addEventListener("keydown", handleKey);
      return () => globalThis.removeEventListener("keydown", handleKey);
   }, [handleKey]);

   return (
      <footer
         style={{
            position: "relative",
            borderTop: "1px solid rgba(255, 255, 255, 0.04)",
         }}
      >
         {/* Gradient line at top */}
         <div
            style={{
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               height: 1,
               background:
                  "linear-gradient(to right, transparent, rgba(6,182,212,0.25), transparent)",
            }}
         />

         <motion.div
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 20,
               padding: "40px 24px",
               maxWidth: 1280,
               margin: "0 auto",
            }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{}}
         >
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
            <motion.div
               style={{ display: "flex", alignItems: "center", gap: 12 }}
               variants={staggerItem}
            >
               {socialProfiles.map((profile) => {
                  const IconComponent = ICON_MAP[profile.icon];
                  if (!IconComponent) return null;
                  return (
                     <motion.a
                        key={profile.id}
                        href={profile.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                           width: 36,
                           height: 36,
                           borderRadius: 8,
                           border: "1px solid rgba(255, 255, 255, 0.06)",
                           background: "rgba(255, 255, 255, 0.03)",
                           backdropFilter: "blur(12px)",
                           WebkitBackdropFilter: "blur(12px)",
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                           color: "#a5a5c0",
                           transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                           e.currentTarget.style.color = "#06b6d4";
                           e.currentTarget.style.borderColor =
                              "rgba(6, 182, 212, 0.3)";
                           e.currentTarget.style.background =
                              "rgba(6, 182, 212, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                           e.currentTarget.style.color = "#a5a5c0";
                           e.currentTarget.style.borderColor =
                              "rgba(255, 255, 255, 0.06)";
                           e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.03)";
                        }}
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Visit ${profile.name} profile`}
                     >
                        <IconComponent size={16} />
                     </motion.a>
                  );
               })}
            </motion.div>

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

            {/* Easter egg */}
            {easterEgg && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  style={{
                     padding: "8px 16px",
                     borderRadius: 8,
                     background:
                        "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))",
                     border: "1px solid rgba(6,182,212,0.3)",
                     fontFamily: "JetBrains Mono, ui-monospace, monospace",
                     fontSize: 12,
                     color: "#06b6d4",
                     textAlign: "center",
                  }}
               >
                  You found the secret! Thanks for exploring.
               </motion.div>
            )}
         </motion.div>
      </footer>
   );
};

export default Footer;
