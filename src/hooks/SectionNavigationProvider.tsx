import {
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
   type ReactNode,
} from "react";
import { useLenis } from "lenis/react";
import { CONTENT_SECTIONS, type ContentSectionId } from "@/constants/sections";
import useMotionPreference from "./useMotionPreference";
import { SectionNavigationContext } from "./sectionNavigationContext";

const SECTION_IDS = new Set<string>([
   "hero",
   "main-content",
   ...CONTENT_SECTIONS.map(({ id }) => id),
]);
const sectionIndex = (id: string) =>
   CONTENT_SECTIONS.findIndex((section) => section.id === id);
const readHash = () => {
   const id = globalThis.location.hash.slice(1);
   return SECTION_IDS.has(id) ? id : "hero";
};

interface NavigationRequest {
   id: string;
   immediate: boolean;
   focus: boolean;
}

export const SectionNavigationProvider = ({
   children,
}: {
   children: ReactNode;
}) => {
   const lenis = useLenis();
   const { reducedMotion } = useMotionPreference();
   const [loadThrough, setLoadThrough] = useState(() =>
      sectionIndex(readHash()),
   );
   const [readySections, setReadySections] = useState<Set<string>>(
      () => new Set(),
   );
   const [request, setRequest] = useState<NavigationRequest>(() => ({
      id: readHash(),
      immediate: true,
      focus: SECTION_IDS.has(globalThis.location.hash.slice(1)),
   }));
   const handledRequestRef = useRef<NavigationRequest | null>(null);

   const requestSection = useCallback((id: string, immediate: boolean) => {
      handledRequestRef.current = null;
      // Earlier sections must settle before measuring a distant destination.
      // Keep them mounted afterwards so navigation never discards local state.
      setLoadThrough((current) => Math.max(current, sectionIndex(id)));
      setRequest({ id, immediate, focus: true });
   }, []);

   const navigateToSection = useCallback(
      (id: string) => {
         if (!SECTION_IDS.has(id)) return;
         if (globalThis.location.hash !== `#${id}`) {
            globalThis.history.pushState(null, "", `#${id}`);
         }
         requestSection(id, false);
      },
      [requestSection],
   );

   const markSectionReady = useCallback((id: ContentSectionId) => {
      setReadySections((current) =>
         current.has(id) ? current : new Set([...current, id]),
      );
   }, []);

   useEffect(() => {
      const previousRestoration = globalThis.history.scrollRestoration;
      globalThis.history.scrollRestoration = "manual";
      const onHistoryChange = () => requestSection(readHash(), true);
      globalThis.addEventListener("hashchange", onHistoryChange);
      globalThis.addEventListener("popstate", onHistoryChange);
      return () => {
         globalThis.history.scrollRestoration = previousRestoration;
         globalThis.removeEventListener("hashchange", onHistoryChange);
         globalThis.removeEventListener("popstate", onHistoryChange);
      };
   }, [requestSection]);

   useEffect(() => {
      if (handledRequestRef.current === request) return;
      const precedingSections = CONTENT_SECTIONS.slice(
         0,
         sectionIndex(request.id) + 1,
      );
      if (precedingSections.some(({ id }) => !readySections.has(id))) return;
      const target = document.getElementById(request.id);
      if (!target) return;
      handledRequestRef.current = request;

      const focusTarget = () => {
         if (
            request.focus &&
            handledRequestRef.current === request &&
            target.isConnected
         ) {
            target.focus({ preventScroll: true });
         }
      };

      if (lenis && !reducedMotion) {
         lenis.resize();
         // Lenis honors the anchor's scroll-margin-top, just like native scroll.
         lenis.scrollTo(target, {
            immediate: request.immediate,
            userData: { source: "nav" },
            onComplete: focusTarget,
         });
      } else {
         target.scrollIntoView({ behavior: "instant", block: "start" });
         focusTarget();
      }
   }, [request, readySections, lenis, reducedMotion]);

   const value = useMemo(
      () => ({ loadThrough, markSectionReady, navigateToSection }),
      [loadThrough, markSectionReady, navigateToSection],
   );

   return (
      <SectionNavigationContext value={value}>
         {children}
      </SectionNavigationContext>
   );
};
