import {
   useEffect,
   useState,
   type Dispatch,
   type ReactNode,
   type SetStateAction,
} from "react";
import {
   ExternalLink,
   Download,
   FileImage,
   FileText,
   ZoomIn,
   ZoomOut,
} from "lucide-react";
import { getResumeUrl } from "@data/personal";
import { getUiCopy } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import {
   BG_PRIMARY,
   MONO_FONT,
   TEXT_MUTED,
   TEXT_SECONDARY,
} from "@/constants/theme";
import CvWeb from "./CvWeb";
import type { CvJson } from "./cvTypes";
import "./cv-viewer.css";

// Both views come from scripts/prepare-resume.js at deploy time: cv.json is
// the parsed .tex (web view), page-N.webp the rendered PDF pages. No
// client-side PDF machinery, no blur.
const BASE = import.meta.env.BASE_URL;
const MANIFEST_URL = `${BASE}resume-pages/manifest.json`;
const CV_JSON_URL = `${BASE}resume-pages/cv.json`;
const RESUME_PDF = `${BASE}resume.pdf`;
const RESUME_DOWNLOAD_URL = getResumeUrl();
const COPY = getUiCopy().cv;

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];

type View = "web" | "pages";

interface Manifest {
   pages: number;
   width: number;
   height: number;
}

interface CvDocumentProps {
   isMobile: boolean;
   /** Rendered in place of the viewer when the CV pages cannot load. */
   unavailable: ReactNode;
}

const getJson = <T,>(url: string, signal: AbortSignal) =>
   fetch(url, { signal }).then((r) =>
      r.ok
         ? (r.json() as Promise<T>)
         : Promise.reject(new Error(`${r.status}`)),
   );

/** Fetches the page manifest and the parsed CV once; aborts on unmount. */
const useCvSources = () => {
   const [manifest, setManifest] = useState<Manifest | null>(null);
   const [cv, setCv] = useState<CvJson | null>(null);
   const [cvMissing, setCvMissing] = useState(false);
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

   return { manifest, cv, cvMissing, failed, setFailed };
};

const statusLabelFor = (
   view: View,
   cv: CvJson | null,
   manifest: Manifest | null,
) => {
   if (view === "web" && cv?.version) return `${cv.version}`;
   if (view === "pages" && manifest)
      return fillTemplate(
         manifest.pages === 1 ? COPY.pages_one : COPY.pages_many,
         { count: manifest.pages },
      );
   return COPY.loading;
};

interface ZoomControlsProps {
   isMobile: boolean;
   zoomIdx: number;
   setZoomIdx: Dispatch<SetStateAction<number>>;
}

const ZoomControls = ({ isMobile, zoomIdx, setZoomIdx }: ZoomControlsProps) => (
   <>
      <button
         onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
         disabled={zoomIdx === 0}
         aria-label={COPY.zoom_out}
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
            {Math.round(ZOOM_STEPS[zoomIdx] * 100)}%
         </span>
      )}
      <button
         onClick={() =>
            setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
         }
         disabled={zoomIdx === ZOOM_STEPS.length - 1}
         aria-label={COPY.zoom_in}
         className="btn-outline"
         style={{
            padding: "6px 10px",
            opacity: zoomIdx === ZOOM_STEPS.length - 1 ? 0.4 : 1,
         }}
      >
         <ZoomIn size={14} />
      </button>
   </>
);

interface CvToolbarProps extends ZoomControlsProps {
   view: View;
   showToggle: boolean;
   onViewChange: (view: View) => void;
   statusLabel: string;
}

const CvToolbar = ({
   isMobile,
   view,
   showToggle,
   onViewChange,
   statusLabel,
   zoomIdx,
   setZoomIdx,
}: CvToolbarProps) => (
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
         {showToggle && (
            <fieldset className="cv-view-toggle" aria-label={COPY.view_label}>
               <button
                  type="button"
                  aria-pressed={view === "web"}
                  onClick={() => onViewChange("web")}
               >
                  <FileText size={13} aria-hidden="true" />
                  {COPY.view_web}
               </button>
               <button
                  type="button"
                  aria-pressed={view === "pages"}
                  onClick={() => onViewChange("pages")}
               >
                  <FileImage size={13} aria-hidden="true" />
                  {COPY.view_pages}
               </button>
            </fieldset>
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
         {view === "pages" && (
            <ZoomControls
               isMobile={isMobile}
               zoomIdx={zoomIdx}
               setZoomIdx={setZoomIdx}
            />
         )}
         <a
            href={RESUME_PDF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={COPY.open_pdf}
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
            {isMobile ? COPY.download_short : COPY.download}
         </a>
      </div>
   </div>
);

interface CvWebViewProps {
   cv: CvJson | null;
   aspect: number;
   isMobile: boolean;
}

const CvWebView = ({ cv, aspect, isMobile }: CvWebViewProps) => (
   <div
      style={{
         padding: isMobile ? 10 : 20,
         background: BG_PRIMARY,
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
);

interface CvPagesProps {
   manifest: Manifest | null;
   zoom: number;
   aspect: number;
   isMobile: boolean;
   onError: () => void;
}

const CvPages = ({
   manifest,
   zoom,
   aspect,
   isMobile,
   onError,
}: CvPagesProps) => (
   <div
      style={{
         overflow: "auto",
         padding: isMobile ? 10 : 16,
         display: "flex",
         flexDirection: "column",
         alignItems: zoom > 1 ? "flex-start" : "center",
         gap: 12,
         background: BG_PRIMARY,
      }}
   >
      {manifest
         ? Array.from({ length: manifest.pages }, (_, i) => (
              <img
                 key={`page-${i + 1}`}
                 src={`${BASE}resume-pages/page-${i + 1}.webp`}
                 alt={fillTemplate(COPY.page_alt, {
                    page: i + 1,
                    pages: manifest.pages,
                 })}
                 width={manifest.width}
                 height={manifest.height}
                 loading={i === 0 ? "eager" : "lazy"}
                 decoding="async"
                 onError={onError}
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
);

const CvDocument = ({ isMobile, unavailable }: CvDocumentProps) => {
   const { manifest, cv, cvMissing, failed, setFailed } = useCvSources();
   const [view, setView] = useState<View>("web");
   const [zoomIdx, setZoomIdx] = useState(1);

   // A missing cv.json always lands on the pages view.
   const activeView: View = cvMissing ? "pages" : view;
   const aspect = manifest ? manifest.width / manifest.height : 0.707;

   if (failed && activeView === "pages") return unavailable;

   return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
         <CvToolbar
            isMobile={isMobile}
            view={activeView}
            showToggle={!cvMissing}
            onViewChange={setView}
            statusLabel={statusLabelFor(activeView, cv, manifest)}
            zoomIdx={zoomIdx}
            setZoomIdx={setZoomIdx}
         />
         {activeView === "web" ? (
            <CvWebView cv={cv} aspect={aspect} isMobile={isMobile} />
         ) : (
            <CvPages
               manifest={manifest}
               zoom={ZOOM_STEPS[zoomIdx]}
               aspect={aspect}
               isMobile={isMobile}
               onError={() => setFailed(true)}
            />
         )}
      </div>
   );
};

export default CvDocument;
