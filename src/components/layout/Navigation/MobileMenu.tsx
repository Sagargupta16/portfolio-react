import { memo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { TEXT_SECONDARY, GLASS_BORDER, DURATION } from "@/constants/theme";
import useFocusTrap from "@hooks/useFocusTrap";
import useScrollLock from "@hooks/useScrollLock";
import { getUiCopy } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";

const COPY = getUiCopy().nav;

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
   const panelRef = useFocusTrap<HTMLDivElement>(open);
   useScrollLock(open);

   // Skips an Escape a layer above (the palette) already handled, so one press
   // closes only the topmost layer.
   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key !== "Escape" || e.defaultPrevented) return;
         e.preventDefault();
         onClose();
      },
      [onClose],
   );

   // While open: lock page scroll and allow Escape to dismiss -- mirrors the
   // project/experience modal behavior so the overlay can't be tabbed/scrolled
   // behind on touch. useFocusTrap restores focus to the hamburger on close.
   useEffect(() => {
      if (!open) return;
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
   }, [open, onEsc]);

   return (
      <AnimatePresence>
         {open && (
            <motion.div
               style={{ position: "fixed", inset: 0, zIndex: 40 }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: DURATION.quick }}
            >
               {/* Backdrop */}
               <motion.div
                  style={{
                     position: "absolute",
                     inset: 0,
                     backgroundColor: "rgb(var(--ch-black) / 0.55)",
                  }}
                  onClick={onClose}
               />

               {/* Slide-in panel */}
               <motion.div
                  ref={panelRef}
                  id="mobile-menu"
                  role="dialog"
                  aria-modal="true"
                  aria-label={COPY.menu_label}
                  tabIndex={-1}
                  data-lenis-prevent
                  style={{
                     position: "absolute",
                     top: 64,
                     right: 0,
                     bottom: 0,
                     width: "min(288px, 85vw)",
                     overflowY: "auto",
                     overscrollBehavior: "contain",
                     backgroundColor: "rgb(var(--ch-bg) / 0.97)",
                     borderLeft: `1px solid ${GLASS_BORDER}`,
                     boxShadow: "-10px 0 40px rgb(var(--ch-black) / 0.3)",
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
                        type="button"
                        onClick={onClose}
                        aria-label={COPY.menu_dismiss}
                        style={{
                           width: 44,
                           height: 44,
                           alignSelf: "flex-end",
                           display: "inline-flex",
                           alignItems: "center",
                           justifyContent: "center",
                           color: TEXT_SECONDARY,
                           background: "transparent",
                           border: "none",
                           borderRadius: 10,
                           cursor: "pointer",
                        }}
                     >
                        <X size={20} />
                     </button>
                     <button
                        type="button"
                        onClick={() => onNavigate("hero")}
                        className="mobile-nav-link"
                        aria-current={
                           activeSection === "hero" ? "location" : undefined
                        }
                     >
                        <span className="mobile-nav-number" aria-hidden="true">
                           00
                        </span>
                        {COPY.home}
                        <ArrowRight
                           size={16}
                           className="action-arrow"
                           aria-hidden="true"
                        />
                     </button>
                     {sections.map((section, index) => {
                        const isActive = activeSection === section.id;
                        return (
                           <motion.button
                              key={section.id}
                              type="button"
                              onClick={() => onNavigate(section.id)}
                              className="mobile-nav-link"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              aria-current={isActive ? "location" : undefined}
                              aria-label={fillTemplate(COPY.navigate_label, {
                                 label: section.label,
                              })}
                           >
                              <span
                                 className="mobile-nav-number"
                                 aria-hidden="true"
                              >
                                 {String(index + 1).padStart(2, "0")}
                              </span>
                              {section.label}
                              <ArrowRight
                                 size={16}
                                 className="action-arrow"
                                 aria-hidden="true"
                              />
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
