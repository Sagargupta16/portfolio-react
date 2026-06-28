import { memo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CYAN, TEXT_SECONDARY, GLASS_BORDER } from "@/constants/theme";
import useFocusTrap from "@hooks/useFocusTrap";

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

const rowStyle = (isActive: boolean): React.CSSProperties => ({
   textAlign: "left",
   padding: "12px 16px",
   minHeight: 44,
   display: "flex",
   alignItems: "center",
   borderRadius: 10,
   fontSize: 14,
   fontWeight: 500,
   cursor: "pointer",
   border: "none",
   transition: "color 0.2s ease, background-color 0.2s ease",
   color: isActive ? CYAN : TEXT_SECONDARY,
   backgroundColor: isActive ? "rgb(var(--ch-cyan) / 0.08)" : "transparent",
});

const MobileMenu = ({
   open,
   sections,
   activeSection,
   onNavigate,
   onClose,
}: MobileMenuProps) => {
   const panelRef = useFocusTrap<HTMLDivElement>(open);

   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      },
      [onClose],
   );

   // While open: lock body scroll and allow Escape to dismiss -- mirrors the
   // project/experience modal behavior so the overlay can't be tabbed/scrolled
   // behind on touch. useFocusTrap restores focus to the hamburger on close.
   useEffect(() => {
      if (!open) return;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onEsc);
      return () => {
         document.body.style.overflow = "";
         document.removeEventListener("keydown", onEsc);
      };
   }, [open, onEsc]);

   return (
      <AnimatePresence>
         {open && (
            <motion.div
               style={{ position: "fixed", inset: 0, zIndex: 40 }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.25 }}
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
                  ref={panelRef}
                  id="mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Navigation menu"
                  tabIndex={-1}
                  style={{
                     position: "absolute",
                     top: 64,
                     right: 0,
                     bottom: 0,
                     width: "min(288px, 85vw)",
                     backgroundColor: "rgba(12, 12, 30, 0.7)",
                     backdropFilter: "blur(24px)",
                     WebkitBackdropFilter: "blur(24px)",
                     borderLeft: `1px solid ${GLASS_BORDER}`,
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
                        style={rowStyle(activeSection === "hero")}
                        aria-current={
                           activeSection === "hero" ? "true" : undefined
                        }
                     >
                        Home
                     </button>
                     {sections.map((section, index) => {
                        const isActive = activeSection === section.id;
                        return (
                           <motion.button
                              key={section.id}
                              onClick={() => onNavigate(section.id)}
                              style={rowStyle(isActive)}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              aria-current={isActive ? "true" : undefined}
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

export default memo(MobileMenu);
