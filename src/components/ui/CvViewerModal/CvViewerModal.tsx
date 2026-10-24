import { lazy, Suspense, useCallback, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import useBreakpoint from "@hooks/useBreakpoint";
import useFocusTrap from "@hooks/useFocusTrap";
import useScrollLock from "@hooks/useScrollLock";
import ErrorBoundary from "@components/common/ErrorBoundary";
import ModalShell from "@components/ui/ModalShell";
import ModalHeaderShell from "@components/ui/ModalHeaderShell";
import { getResumeUrl } from "@data/personal";
import { getUiCopy } from "@data/ui";
import { BLUE_LIGHT, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";

// Kept lazy so the viewer code stays out of the initial bundle; the page
// images themselves only load when the modal opens.
const CvDocument = lazy(() => import("./CvDocument"));
const COPY = getUiCopy().cv;

/* Shown when the CV cannot load, whether the viewer chunk itself failed (the
   ErrorBoundary below, which also keeps the root boundary from blanking the
   page) or CvDocument could not fetch its pages. The download link stays. */
const CV_UNAVAILABLE = (
   <div
      style={{
         padding: "48px 24px",
         textAlign: "center",
         color: TEXT_SECONDARY,
         fontSize: 14,
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         gap: 16,
      }}
   >
      <p>{COPY.unavailable}</p>
      <a
         href={getResumeUrl()}
         className="btn-primary"
         style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            textDecoration: "none",
         }}
      >
         <Download size={15} />
         {COPY.download_instead}
      </a>
   </div>
);

interface CvViewerModalProps {
   isOpen: boolean;
   onClose: () => void;
}

const CvViewerModal = ({ isOpen, onClose }: CvViewerModalProps) => {
   const { isMobile } = useBreakpoint();
   const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);
   useScrollLock(isOpen);

   // A layer above (palette, open gloss) that handled this Escape already
   // called preventDefault, so one press closes only the topmost layer.
   const onEsc = useCallback(
      (e: KeyboardEvent) => {
         if (e.key !== "Escape" || e.defaultPrevented) return;
         e.preventDefault();
         onClose();
      },
      [onClose],
   );

   useEffect(() => {
      if (!isOpen) return;
      document.addEventListener("keydown", onEsc);
      return () => document.removeEventListener("keydown", onEsc);
   }, [isOpen, onEsc]);

   return (
      <ModalShell
         isOpen={isOpen}
         onClose={onClose}
         dialogRef={dialogRef}
         isMobile={isMobile}
         titleId="cv-viewer-title"
      >
         <ModalHeaderShell
            isMobile={isMobile}
            onClose={onClose}
            closeLabel={COPY.close}
         >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <FileText
                  size={isMobile ? 16 : 18}
                  style={{ color: BLUE_LIGHT, flexShrink: 0 }}
               />
               <h2
                  id="cv-viewer-title"
                  style={{
                     fontSize: isMobile ? 15 : 18,
                     fontWeight: 700,
                     color: TEXT_PRIMARY,
                  }}
               >
                  {COPY.title}
               </h2>
            </div>
         </ModalHeaderShell>

         {isOpen && (
            <ErrorBoundary fallback={CV_UNAVAILABLE}>
               <Suspense
                  fallback={
                     <div
                        className="skeleton"
                        style={{
                           margin: 16,
                           height: 420,
                           borderRadius: 8,
                        }}
                     />
                  }
               >
                  <CvDocument
                     isMobile={isMobile}
                     unavailable={CV_UNAVAILABLE}
                  />
               </Suspense>
            </ErrorBoundary>
         )}
      </ModalShell>
   );
};

export default CvViewerModal;
