import { useState, type ReactNode, type RefObject } from "react";
import {
   motion,
   AnimatePresence,
   useDragControls,
   useMotionValue,
   useTransform,
   type PanInfo,
   type Variants,
} from "motion/react";
import { createPortal } from "react-dom";
import { EASING } from "@/constants/theme";

interface ModalShellProps {
   /** Whether the modal is rendered. */
   isOpen: boolean;
   onClose: () => void;
   dialogRef: RefObject<HTMLDivElement | null>;
   isMobile: boolean;
   /** ID of the h1/h2/h3 that names this dialog for screen readers. */
   titleId: string;
   children: ReactNode;
}

const BACKDROP_STYLE = {
   background: "rgba(0,0,0,0.3)",
   backdropFilter: "blur(12px)",
   WebkitBackdropFilter: "blur(12px)",
} as const;

/* Swipe-to-close thresholds. offset is the pointer travel, so with the 0.6
   bottom elastic the sheet itself has moved about 72px at the cutoff. */
const DISMISS_OFFSET_PX = 120;
const DISMISS_VELOCITY = 500;
const SHEET_ELASTIC = { top: 0, bottom: 0.6 };
const SHEET_CONSTRAINTS = { top: 0, bottom: 0 };

interface ExitCustom {
   isMobile: boolean;
   dragDismissed: boolean;
}

/* dragDismissed is true when the sheet was flung away: keep sliding down from
   where the finger let go instead of easing back up to the regular exit. */
const dialogVariants: Variants = {
   exit: ({ isMobile, dragDismissed }: ExitCustom) =>
      dragDismissed
         ? {
              opacity: 0,
              y: globalThis.innerHeight,
              transition: { duration: 0.3, ease: EASING.cinematic },
           }
         : { opacity: 0, y: isMobile ? 100 : 30, scale: 0.97 },
};

/**
 * Full-viewport modal backdrop + card container used by ExperienceModal
 * and ProjectModal. Handles portal mount, AnimatePresence, the dim/blur
 * backdrop, slide-up-from-bottom on mobile, and the roled dialog frame.
 * Callers supply their own header and body as children; this shell only
 * owns the outer chrome. On phones the sheet also gets a grab handle that
 * drags it down to dismiss, with the backdrop fading as it travels.
 */
const ModalShell = ({
   isOpen,
   onClose,
   dialogRef,
   isMobile,
   titleId,
   children,
}: ModalShellProps) => {
   const dragControls = useDragControls();
   const sheetY = useMotionValue(0);
   const backdropOpacity = useTransform(sheetY, [0, 300], [1, 0]);
   const [dragDismissed, setDragDismissed] = useState(false);
   const exitCustom: ExitCustom = { isMobile, dragDismissed };

   const handleDragEnd = (_e: unknown, info: PanInfo) => {
      if (
         info.offset.y > DISMISS_OFFSET_PX ||
         info.velocity.y > DISMISS_VELOCITY
      ) {
         setDragDismissed(true);
         onClose();
      }
      // Otherwise the 0/0 constraints spring the sheet back to rest.
   };

   return createPortal(
      <AnimatePresence
         custom={exitCustom}
         onExitComplete={() => setDragDismissed(false)}
      >
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
                  // Phones keep the bottom-anchored sheet but get breathing
                  // room from the screen edges; desktop pads all around.
                  padding: isMobile
                     ? "12px 12px max(16px, env(safe-area-inset-bottom))"
                     : 20,
                  // Phones paint the dim on a child layer so it can fade
                  // with the drag without fading the sheet along with it.
                  ...(!isMobile && BACKDROP_STYLE),
                  overscrollBehavior: "contain",
               }}
            >
               {isMobile && (
                  <motion.div
                     aria-hidden="true"
                     style={{
                        position: "absolute",
                        inset: 0,
                        ...BACKDROP_STYLE,
                        opacity: backdropOpacity,
                     }}
                  />
               )}
               <motion.div
                  ref={dialogRef}
                  custom={exitCustom}
                  variants={dialogVariants}
                  initial={{
                     opacity: 0,
                     y: isMobile ? 100 : 50,
                     scale: 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit="exit"
                  transition={{ duration: 0.4, ease: EASING.cinematic }}
                  drag={isMobile ? "y" : false}
                  dragControls={dragControls}
                  dragListener={false}
                  dragConstraints={SHEET_CONSTRAINTS}
                  dragElastic={SHEET_ELASTIC}
                  onDragEnd={handleDragEnd}
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
                     maxHeight: isMobile ? "calc(100dvh - 28px)" : "85dvh",
                     // Phones scroll an inner region so the grab handle
                     // stays put above the content.
                     overflowY: isMobile ? "hidden" : "auto",
                     ...(isMobile && {
                        display: "flex",
                        flexDirection: "column",
                     }),
                     // Sheet floats with side gaps now, so square bottom
                     // corners would read as a rendering bug -- round all four.
                     borderRadius: 20,
                     border: "1px solid rgba(255,255,255,0.1)",
                     background: "#0e1417",
                     boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
                     y: sheetY,
                  }}
               >
                  {isMobile ? (
                     <>
                        {/* Drag starts only here so the content keeps its
                            native scroll. */}
                        <div
                           aria-hidden="true"
                           className="sheet-handle"
                           onPointerDown={(e) => dragControls.start(e)}
                        />
                        <div
                           style={{
                              flex: 1,
                              minHeight: 0,
                              overflowY: "auto",
                              overscrollBehavior: "contain",
                           }}
                        >
                           {children}
                        </div>
                     </>
                  ) : (
                     children
                  )}
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

export default ModalShell;
