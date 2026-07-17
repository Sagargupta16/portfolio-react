import { useEffect, useState } from "react";
import { ExternalLink, Download, ZoomIn, ZoomOut } from "lucide-react";
import { MONO_FONT, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";

// Pages are pre-rendered to high-res WebP at deploy time by
// scripts/prepare-resume.js -- no client-side PDF machinery, no blur.
const BASE = import.meta.env.BASE_URL;
const MANIFEST_URL = `${BASE}resume-pages/manifest.json`;
const RESUME_PDF = `${BASE}resume.pdf`;
const RESUME_DOWNLOAD_URL =
   "https://github.com/Sagargupta16/latex-resume/releases/latest/download/resume.pdf";

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];

interface Manifest {
   pages: number;
   width: number;
   height: number;
}

interface CvDocumentProps {
   isMobile: boolean;
}

const CvDocument = ({ isMobile }: CvDocumentProps) => {
   const [manifest, setManifest] = useState<Manifest | null>(null);
   const [zoomIdx, setZoomIdx] = useState(1);
   const [failed, setFailed] = useState(false);

   useEffect(() => {
      let cancelled = false;
      fetch(MANIFEST_URL)
         .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${r.status}`))))
         .then((m: Manifest) => {
            if (!cancelled) setManifest(m);
         })
         .catch(() => {
            if (!cancelled) setFailed(true);
         });
      return () => {
         cancelled = true;
      };
   }, []);

   const zoom = ZOOM_STEPS[zoomIdx];
   const aspect = manifest ? manifest.width / manifest.height : 0.707;

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

   let pageCountLabel = "Loading...";
   if (manifest) {
      pageCountLabel =
         manifest.pages === 1 ? "1 page" : `${manifest.pages} pages`;
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
               {pageCountLabel}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
      </div>
   );
};

export default CvDocument;
