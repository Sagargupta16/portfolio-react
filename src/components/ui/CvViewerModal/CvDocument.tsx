import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ExternalLink, Download, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";

// Bundle the worker instead of pulling it from a CDN -- keeps the viewer
// working offline and pins the version to the installed pdfjs-dist.
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Base-path-aware: the site deploys under /portfolio-react/.
const RESUME_PDF = `${import.meta.env.BASE_URL}resume.pdf`;
const RESUME_DOWNLOAD_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];

interface CvDocumentProps {
   isMobile: boolean;
}

/**
 * The pdf.js document body of the CV viewer. Split from the modal wrapper so
 * react-pdf (+ its worker) only loads when the viewer actually opens.
 */
const CvDocument = ({ isMobile }: CvDocumentProps) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const [containerWidth, setContainerWidth] = useState(0);
   const [numPages, setNumPages] = useState(0);
   const [zoomIdx, setZoomIdx] = useState(1);
   const [failed, setFailed] = useState(false);

   // Fit the page to the modal width; re-measure on resize.
   useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const measure = () => setContainerWidth(el.clientWidth);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
   }, []);

   const onLoad = useCallback(
      ({ numPages: n }: { numPages: number }) => setNumPages(n),
      [],
   );

   const zoom = ZOOM_STEPS[zoomIdx];
   const pageWidth = containerWidth
      ? Math.min(containerWidth - 8, 900) * zoom
      : undefined;
   const pageCountLabel =
      numPages === 1 ? "1 page" : `${numPages} pages`;

   if (failed) {
      return (
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
            <p>The inline viewer could not load the CV.</p>
            <a
               href={RESUME_DOWNLOAD_URL}
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
               Download CV instead
            </a>
         </div>
      );
   }

   return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
         {/* Toolbar */}
         <div
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "space-between",
               gap: 8,
               padding: isMobile ? "10px 14px" : "10px 20px",
               borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
         >
            <span
               style={{
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  color: TEXT_MUTED,
               }}
            >
               {numPages > 0 ? pageCountLabel : "Loading..."}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
               <button
                  onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
                  disabled={zoomIdx === 0}
                  aria-label="Zoom out"
                  className="btn-outline"
                  style={{ padding: "6px 10px", opacity: zoomIdx === 0 ? 0.4 : 1 }}
               >
                  <ZoomOut size={14} />
               </button>
               <span
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 11,
                     color: TEXT_SECONDARY,
                     minWidth: 38,
                     textAlign: "center",
                  }}
               >
                  {Math.round(zoom * 100)}%
               </span>
               <button
                  onClick={() =>
                     setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
                  }
                  disabled={zoomIdx === ZOOM_STEPS.length - 1}
                  aria-label="Zoom in"
                  className="btn-outline"
                  style={{
                     padding: "6px 10px",
                     opacity: zoomIdx === ZOOM_STEPS.length - 1 ? 0.4 : 1,
                  }}
               >
                  <ZoomIn size={14} />
               </button>
               <a
                  href={RESUME_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open CV in a new tab"
                  className="btn-outline"
                  style={{
                     display: "inline-flex",
                     padding: "6px 10px",
                     textDecoration: "none",
                  }}
               >
                  <ExternalLink size={14} />
               </a>
               <a
                  href={RESUME_DOWNLOAD_URL}
                  aria-label="Download CV"
                  className="btn-primary"
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 6,
                     padding: "6px 12px",
                     fontSize: 12,
                     textDecoration: "none",
                  }}
               >
                  <Download size={14} />
                  {!isMobile && "Download"}
               </a>
            </div>
         </div>

         {/* Pages */}
         <div
            ref={containerRef}
            style={{
               overflow: "auto",
               padding: isMobile ? 8 : 16,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 12,
               background: "#0a0f11",
            }}
         >
            <Document
               file={RESUME_PDF}
               onLoadSuccess={onLoad}
               onLoadError={() => setFailed(true)}
               loading={
                  <div
                     className="skeleton"
                     style={{
                        width: pageWidth ?? 320,
                        aspectRatio: "0.773",
                        borderRadius: 6,
                     }}
                  />
               }
               error={<span />}
            >
               {Array.from({ length: numPages }, (_, i) => (
                  <Page
                     key={`page-${i + 1}`}
                     pageNumber={i + 1}
                     width={pageWidth}
                     loading={
                        <div
                           className="skeleton"
                           style={{
                              width: pageWidth ?? 320,
                              aspectRatio: "0.773",
                              borderRadius: 6,
                           }}
                        />
                     }
                  />
               ))}
            </Document>
         </div>
      </div>
   );
};

export default CvDocument;
