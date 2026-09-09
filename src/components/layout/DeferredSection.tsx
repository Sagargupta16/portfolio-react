import {
   Suspense,
   useCallback,
   useEffect,
   useRef,
   useState,
   type ReactNode,
} from "react";
import ErrorBoundary from "@components/common/ErrorBoundary";
import SectionLoader from "@components/ui/SectionLoader";
import { CONTENT_SECTIONS, type ContentSectionId } from "@/constants/sections";
import useSectionNavigation from "@hooks/useSectionNavigation";

interface DeferredSectionProps {
   id: ContentSectionId;
   label: string;
   surface: string;
   children: ReactNode;
}

const PLACEHOLDER_STYLE = { minHeight: "60vh" };

const SectionReady = ({
   id,
   children,
}: {
   id: ContentSectionId;
   children: ReactNode;
}) => {
   const { markSectionReady } = useSectionNavigation();
   const onMount = useCallback(
      (node: HTMLDivElement | null) => {
         if (node) markSectionReady(id);
      },
      [id, markSectionReady],
   );
   return (
      <div ref={onMount} data-section-ready={id}>
         {children}
      </div>
   );
};

const DeferredSection = ({
   id,
   label,
   surface,
   children,
}: DeferredSectionProps) => {
   const sectionRef = useRef<HTMLElement>(null);
   const [nearViewport, setNearViewport] = useState(false);
   const { loadThrough } = useSectionNavigation();
   const index = CONTENT_SECTIONS.findIndex((section) => section.id === id);
   const shouldRender = nearViewport || index <= loadThrough;

   useEffect(() => {
      const element = sectionRef.current;
      if (!element || shouldRender) return;
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
               setNearViewport(true);
               observer.disconnect();
            }
         },
         { rootMargin: "400px 0px" },
      );
      observer.observe(element);
      return () => observer.disconnect();
   }, [shouldRender]);

   const placeholder = <SectionLoader label={label} loading={shouldRender} />;

   return (
      <section
         ref={sectionRef}
         id={id}
         aria-label={label}
         tabIndex={-1}
         className={surface}
         style={{ scrollMarginTop: 64 }}
      >
         {shouldRender ? (
            <ErrorBoundary
               fallback={
                  <SectionReady id={id}>
                     <div
                        role="alert"
                        style={{
                           ...PLACEHOLDER_STYLE,
                           maxWidth: 640,
                           margin: "0 auto",
                           padding: "96px 24px",
                           textAlign: "center",
                        }}
                     >
                        <h2>{label} is temporarily unavailable</h2>
                        <p
                           style={{
                              marginTop: 8,
                              color: "var(--color-text-secondary)",
                           }}
                        >
                           Refresh the page to try loading this section again.
                        </p>
                        <button
                           type="button"
                           className="btn-outline"
                           onClick={() => globalThis.location.reload()}
                           style={{ marginTop: 16 }}
                        >
                           Refresh page
                        </button>
                     </div>
                  </SectionReady>
               }
            >
               <Suspense fallback={placeholder}>
                  <SectionReady id={id}>{children}</SectionReady>
               </Suspense>
            </ErrorBoundary>
         ) : (
            placeholder
         )}
      </section>
   );
};

export default DeferredSection;
