import type { ReactNode, RefObject } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import { EASING } from "@/constants/theme";

interface ModalShellProps {
   /** When null the modal is closed. Any truthy value renders it. */
   isOpen: boolean;
   onClose: () => void;
   dialogRef: RefObject<HTMLDivElement | null>;
   isMobile: boolean;
   /** ID of the h1/h2/h3 that names this dialog for screen readers. */
   titleId: string;
   children: ReactNode;
}

/**
 * Full-viewport modal backdrop + card container used by ExperienceModal
 * and ProjectModal. Handles portal mount, AnimatePresence, the dim/blur
 * backdrop, slide-up-from-bottom on mobile, and the roled dialog frame.
 * Callers supply their own header and body as children; this shell only
 * owns the outer chrome.
 */
const ModalShell = ({
   isOpen,
   onClose,
   dialogRef,
   isMobile,
   titleId,
   children,
}: ModalShellProps) =>
   createPortal(
      <AnimatePresence>
         {isOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.25 }}
               onClick={onClose}
               style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: isMobile ? "flex-end" : "center",
                  justifyContent: "center",
                  padding: isMobile ? 0 : 20,
                  background: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  overscrollBehavior: "contain",
               }}
            >
               <motion.div
                  ref={dialogRef}
                  initial={{
                     opacity: 0,
                     y: isMobile ? 100 : 50,
                     scale: 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                     opacity: 0,
                     y: isMobile ? 100 : 30,
                     scale: 0.97,
                  }}
                  transition={{ duration: 0.4, ease: EASING.cinematic }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  tabIndex={-1}
                  style={{
                     position: "relative",
                     width: "100%",
                     maxWidth: isMobile ? "100%" : 720,
                     maxHeight: isMobile ? "92vh" : "85vh",
                     overflowY: "auto",
                     borderRadius: isMobile ? "20px 20px 0 0" : 20,
                     border: "1px solid rgba(255,255,255,0.1)",
                     background:
                        "linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(8,8,20,0.99) 100%)",
                     boxShadow:
                        "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgb(var(--ch-cyan) / 0.04)",
                  }}
               >
                  {children}
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );

export default ModalShell;
