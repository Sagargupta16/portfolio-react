import { useEffect, useState } from "react";
import {
   ExternalLink,
   Download,
   FileImage,
   FileText,
   ZoomIn,
   ZoomOut,
} from "lucide-react";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";
import CvWeb from "./CvWeb";
import type { CvJson } from "./cvTypes";

// Both views come from scripts/prepare-resume.js at deploy time: cv.json is
// the parsed .tex (web view), page-N.webp the rendered PDF pages. No
// client-side PDF machinery, no blur.
const BASE = import.meta.env.BASE_URL;
const MANIFEST_URL = `${BASE}resume-pages/manifest.json`;
const CV_JSON_URL = `${BASE}resume-pages/cv.json`;
const RESUME_PDF = `${BASE}resume.pdf`;
const RESUME_DOWNLOAD_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];

type View = "web" | "pages";

interface Manifest {
   pages: number;
   width: number;
   height: number;
}

interface CvDocumentProps {
   isMobile: boolean;
}

const getJson = <T,>(url: string, signal: AbortSignal) =>
   fetch(url, { signal }).then((r) =>
      r.ok
         ? (r.json() as Promise<T>)
         : Promise.reject(new Error(`${r.status}`)),
   );

const CvDocument = ({ isMobile }: CvDocumentProps) => {
   const [manifest, setManifest] = useState<Manifest | null>(null);
   const [cv, setCv] = useState<CvJson | null>(null);
   const [cvMissing, setCvMissing] = useState(false);
   const [view, setView] = useState<View>("web");
   const [zoomIdx, setZoomIdx] = useState(1);
   const [failed, setFailed] = useState(false);

   useEffect(() => {
      const controller = new AbortController();
      const { signal } = controller;
      getJson<Manifest>(MANIFEST_URL, signal)
         .then(setManifest)
         .catch((error: Error) => {
            if (error.name !== "AbortError") setFailed(true);
         });
      // Without cv.json (older build, parse skipped) the pages view is all there is.
      getJson<CvJson>(CV_JSON_URL, signal)
         .then(setCv)
         .catch((error: Error) => {
            if (error.name !== "AbortError") setCvMissing(true);
         });
      return () => controller.abort();
   }, []);

   const activeView: View = cvMissing ? "pages" : view;
   const zoom = ZOOM_STEPS[zoomIdx];
   const aspect = manifest ? manifest.width / manifest.height : 0.707;

   if (failed && (cvMissing || activeView === "pages")) {
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

   let statusLabel = "Loading...";
   if (activeView === "web" && cv?.version) statusLabel = `${cv.version}`;
   else if (activeView === "pages" && manifest)
      statusLabel = manifest.pages === 1 ? "1 page" : `${manifest.pages} pages`;

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
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
               {!cvMissing && (
                  <div
                     className="cv-view-toggle"
                     role="group"
                     aria-label="CV view"
                  >
                     <button
                        type="button"
                        aria-pressed={activeView === "web"}
                        onClick={() => setView("web")}
                     >
                        <FileText size={13} aria-hidden="true" />
                        Web
                     </button>
                     <button
                        type="button"
                        aria-pressed={activeView === "pages"}
                        onClick={() => setView("pages")}
                     >
                        <FileImage size={13} aria-hidden="true" />
                        PDF
                     </button>
                  </div>
               )}
               {!isMobile && (
                  <span
                     style={{
                        fontFamily: MONO_FONT,
                        fontSize: 11,
                        color: TEXT_MUTED,
                     }}
                  >
                     {statusLabel}
                  </span>
               )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
               {activeView === "pages" && (
                  <>
                     <button
                        onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
                        disabled={zoomIdx === 0}
                        aria-label="Zoom out"
                        className="btn-outline"
                        style={{
                           padding: "6px 10px",
                           opacity: zoomIdx === 0 ? 0.4 : 1,
                        }}
                     >
                        <ZoomOut size={14} />
                     </button>
                     {!isMobile && (
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
                     )}
                     <button
                        onClick={() =>
                           setZoomIdx((i) =>
                              Math.min(ZOOM_STEPS.length - 1, i + 1),
                           )
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
                  </>
               )}
               <a
                  href={RESUME_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the PDF in a new tab"
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
                  <Download size={14} aria-hidden="true" />
                  {isMobile ? "PDF" : "Download PDF"}
               </a>
            </div>
         </div>

         {activeView === "web" ? (
            <div
               style={{
                  padding: isMobile ? 10 : 20,
                  background: "#0a0f11",
               }}
            >
               {cv ? (
                  <CvWeb cv={cv} />
               ) : (
                  <div
                     className="skeleton"
                     style={{
                        width: "100%",
                        maxWidth: 860,
                        margin: "0 auto",
                        aspectRatio: String(aspect),
                        borderRadius: 6,
                     }}
                  />
               )}
            </div>
         ) : (
            <div
               style={{
                  overflow: "auto",
                  padding: isMobile ? 10 : 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: zoom > 1 ? "flex-start" : "center",
                  gap: 12,
                  background: "#0a0f11",
               }}
            >
               {manifest
                  ? Array.from({ length: manifest.pages }, (_, i) => (
                       <img
                          key={`page-${i + 1}`}
                          src={`${BASE}resume-pages/page-${i + 1}.webp`}
                          alt={`CV page ${i + 1} of ${manifest.pages}`}
                          width={manifest.width}
                          height={manifest.height}
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          onError={() => setFailed(true)}
                          style={{
                             width: `${zoom * 100}%`,
                             maxWidth: zoom === 1 ? 860 : undefined,
                             height: "auto",
                             borderRadius: 6,
                             boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                             flexShrink: 0,
                          }}
                       />
                    ))
                  : Array.from({ length: 2 }, (_, i) => (
                       <div
                          key={`skeleton-${i}`}
                          className="skeleton"
                          style={{
                             width: "100%",
                             maxWidth: 860,
                             aspectRatio: String(aspect),
                             borderRadius: 6,
                          }}
                       />
                    ))}
            </div>
         )}
      </div>
   );
};

export default CvDocument;
