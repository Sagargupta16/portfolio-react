import { useState, useEffect, useCallback } from "react";
import { useLenis } from "lenis/react";
import useBreakpoint from "@hooks/useBreakpoint";
import { NAV_SECTIONS } from "@/constants/sections";
import NavBar from "./NavBar";
import MobileMenu from "./MobileMenu";

const Nav = () => {
   const { isTablet: isMobile } = useBreakpoint();
   const [activeSection, setActiveSection] = useState("hero");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);

   // Lightweight scroll listener for nav background only
   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   // Observe the current element for each section ID. Suspense placeholders are
   // replaced as lazy chunks resolve, so a MutationObserver attaches the
   // scroll-spy to each replacement instead of capturing only the initial DOM.
   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            for (const entry of entries) {
               if (entry.isIntersecting) setActiveSection(entry.target.id);
            }
         },
         {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: "-35% 0px -60% 0px",
         },
      );
      const observedElements = new Set<Element>();
      const observeMountedSections = () => {
         for (const id of [
            "hero",
            ...NAV_SECTIONS.map((section) => section.id),
         ]) {
            const element = document.getElementById(id);
            if (element && !observedElements.has(element)) {
               observedElements.add(element);
               observer.observe(element);
            }
         }
      };

      observeMountedSections();
      const main = document.getElementById("main-content");
      const mountObserver = new MutationObserver(observeMountedSections);
      if (main) mountObserver.observe(main, { childList: true, subtree: true });

      return () => {
         mountObserver.disconnect();
         observer.disconnect();
      };
   }, []);

   const lenis = useLenis();
   const scrollToSection = useCallback(
      (id: string) => {
         const el = document.getElementById(id);
         if (el) {
            // Route through Lenis so smooth scrolling matches the rest of the
            // page (CSS scroll-behavior is auto now, so native smooth is off).
            if (lenis) lenis.scrollTo(el, { offset: -64 });
            else el.scrollIntoView();
         }
         setMobileMenuOpen(false);
      },
      [lenis],
   );

   const toggleMenu = useCallback(() => setMobileMenuOpen((o) => !o), []);
   const closeMenu = useCallback(() => setMobileMenuOpen(false), []);

   return (
      <>
         <NavBar
            scrolled={scrolled}
            isMobile={isMobile}
            sections={NAV_SECTIONS}
            activeSection={activeSection}
            mobileMenuOpen={mobileMenuOpen}
            onNavigate={scrollToSection}
            onToggleMenu={toggleMenu}
         />

         {/* Mobile overlay menu */}
         <MobileMenu
            open={mobileMenuOpen}
            sections={NAV_SECTIONS}
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onClose={closeMenu}
         />
      </>
   );
};

export default Nav;
