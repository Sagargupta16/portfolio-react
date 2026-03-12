import { motion, AnimatePresence } from "motion/react";
import { CYAN, TEXT_SECONDARY } from "@/constants/theme";

interface NavSection {
   id: string;
   label: string;
}

interface MobileMenuProps {
   open: boolean;
   sections: NavSection[];
   activeSection: string;
   onNavigate: (id: string) => void;
   onClose: () => void;
}

const MobileMenu = ({
   open,
   sections,
   activeSection,
   onNavigate,
   onClose,
}: MobileMenuProps) => {
   return (
      <AnimatePresence>
         {open && (
            <motion.div
               style={{ position: "fixed", inset: 0, zIndex: 40 }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
            >
               {/* Backdrop */}
               <motion.div
                  style={{
                     position: "absolute",
                     inset: 0,
                     backgroundColor: "rgba(0, 0, 0, 0.4)",
                     backdropFilter: "blur(8px)",
                     WebkitBackdropFilter: "blur(8px)",
                  }}
                  onClick={onClose}
               />

               {/* Slide-in panel */}
               <motion.div
                  style={{
                     position: "absolute",
                     top: 64,
                     right: 0,
                     bottom: 0,
                     width: 288,
                     backgroundColor: "rgba(12, 12, 30, 0.7)",
                     backdropFilter: "blur(24px)",
                     WebkitBackdropFilter: "blur(24px)",
                     borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
                     boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.3)",
                  }}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{
                     type: "spring",
                     stiffness: 300,
                     damping: 30,
                  }}
               >
                  <div
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "24px 12px",
                        gap: 2,
                     }}
                  >
                     <button
                        onClick={() => onNavigate("hero")}
                        style={{
                           textAlign: "left",
                           padding: "12px 16px",
                           borderRadius: 8,
                           fontSize: 14,
                           fontWeight: 500,
                           cursor: "pointer",
                           border: "none",
                           transition: "all 0.2s",
                           color:
                              activeSection === "hero" ? CYAN : TEXT_SECONDARY,
                           backgroundColor:
                              activeSection === "hero"
                                 ? "rgba(6, 182, 212, 0.08)"
                                 : "transparent",
                        }}
                     >
                        Home
                     </button>
                     {sections.map((section, index) => {
                        const isActive = activeSection === section.id;
                        return (
                           <motion.button
                              key={section.id}
                              onClick={() => onNavigate(section.id)}
                              style={{
                                 textAlign: "left",
                                 padding: "12px 16px",
                                 borderRadius: 8,
                                 fontSize: 14,
                                 fontWeight: 500,
                                 cursor: "pointer",
                                 border: "none",
                                 transition: "all 0.2s",
                                 color: isActive ? CYAN : TEXT_SECONDARY,
                                 backgroundColor: isActive
                                    ? "rgba(6, 182, 212, 0.08)"
                                    : "transparent",
                              }}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              aria-label={`Navigate to ${section.label}`}
                           >
                              {section.label}
                           </motion.button>
                        );
                     })}
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default MobileMenu;
