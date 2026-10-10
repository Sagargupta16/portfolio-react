import { useState, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import useBreakpoint from "@hooks/useBreakpoint";
import useSectionNavigation from "@hooks/useSectionNavigation";
import { NAV_SECTIONS } from "@/constants/sections";
import NavBar from "./NavBar";
import MobileMenu from "./MobileMenu";

// Scroll offset (px) past which the bar picks up its solid background. The
// bar itself stays fixed at the top; it never slides away on scroll.
const SCROLLED_AFTER = 50;

const Nav = () => {
   const { isTablet: isMobile } = useBreakpoint();
   const { navigateToSection } = useSectionNavigation();
   const [activeSection, setActiveSection] = useState("hero");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);

   // Boolean flip only: React bails out when the value is unchanged, so the
   // bar never re-renders per frame while scrolling. Lenis drives the native
   // window scroll in root mode, so scrollY tracks it directly.
   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (y) => {
      setScrolled(y > SCROLLED_AFTER);
   });

   // DeferredSection keeps each anchor mounted while its content loads.
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
      for (const id of ["hero", ...NAV_SECTIONS.map((section) => section.id)]) {
         const element = document.getElementById(id);
         if (element) observer.observe(element);
      }
      return () => observer.disconnect();
   }, []);

   const scrollToSection = useCallback(
      (id: string) => {
         navigateToSection(id);
         setMobileMenuOpen(false);
      },
      [navigateToSection],
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
