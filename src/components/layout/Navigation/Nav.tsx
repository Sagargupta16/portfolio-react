import { useState, useEffect, useCallback } from "react";
import useBreakpoint from "@hooks/useBreakpoint";
import useScrolledPast from "@hooks/useScrolledPast";
import useSectionNavigation from "@hooks/useSectionNavigation";
import { NAV_SECTIONS } from "@/constants/sections";
import NavBar from "./NavBar";
import MobileMenu from "./MobileMenu";

// Scroll offset (px) past which the bar picks up its solid background. The
// bar itself stays fixed at the top; it never slides away on scroll.
const SCROLLED_AFTER = 50;

/** One entry of the section list the bar, the desktop links and the mobile
    menu all render. */
export type NavSection = (typeof NAV_SECTIONS)[number];

const Nav = () => {
   const { isTablet: isMobile } = useBreakpoint();
   const { navigateToSection } = useSectionNavigation();
   const [activeSection, setActiveSection] = useState("hero");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const scrolled = useScrolledPast(SCROLLED_AFTER);

   // The overlay only exists on the mobile layout. Leaving it closes the menu
   // in the same render, so shrinking back to a phone width does not reopen it.
   if (!isMobile && mobileMenuOpen) setMobileMenuOpen(false);

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

         {/* Mobile overlay menu, closed while the desktop layout is up */}
         <MobileMenu
            open={mobileMenuOpen && isMobile}
            sections={NAV_SECTIONS}
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onClose={closeMenu}
         />
      </>
   );
};

export default Nav;
