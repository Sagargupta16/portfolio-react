import { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ProfessionalExperience } from "@/types";
import ModalHeader from "./ModalHeader";
import ModalContent from "./ModalContent";

interface Props {
   experience: ProfessionalExperience | null;
   onClose: () => void;
}

const ExperienceModal = ({ experience, onClose }: Props) => {
   const scrollRef = useRef<HTMLDivElement>(null);

   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!experience) return;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onEsc);
      return () => {
         document.body.style.overflow = "";
         document.removeEventListener("keydown", onEsc);
      };
   }, [experience, onEsc]);

   return (
      <AnimatePresence>
         {experience && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               onClick={onClose}
               style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 20,
                  background: "rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  overscrollBehavior: "contain",
               }}
            >
               <motion.div
                  ref={scrollRef}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.97 }}
                  transition={{
                     duration: 0.35,
                     ease: [0.16, 1, 0.3, 1],
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  style={{
                     position: "relative",
                     width: "100%",
                     maxWidth: 720,
                     maxHeight: "85vh",
                     overflowY: "auto",
                     borderRadius: 20,
                     border: "1px solid rgba(255,255,255,0.1)",
                     background:
                        "linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(8,8,20,0.99) 100%)",
                     boxShadow:
                        "0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(6,182,212,0.04)",
                  }}
               >
                  <ModalHeader experience={experience} onClose={onClose} />
                  <ModalContent experience={experience} />
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default ExperienceModal;
