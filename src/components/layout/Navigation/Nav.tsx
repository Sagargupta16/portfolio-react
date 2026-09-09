import { useState, useEffect, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { useLenis } from "lenis/react";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import useSectionNavigation from "@hooks/useSectionNavigation";
import { NAV_SECTIONS } from "@/constants/sections";
import NavBar from "./NavBar";
import MobileMenu from "./MobileMenu";

// Scroll offsets (px) past which the bar picks up its solid background and,
// while still moving down, slides out of the way.
const SCROLLED_AFTER = 50;
const HIDE_AFTER = 120;
const NAV_SCROLL = { source: "nav" };

const Nav = () => {
   const { isTablet: isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();
   const { navigateToSection } = useSectionNavigation();
   const [activeSection, setActiveSection] = useState("hero");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const [hidden, setHidden] = useState(false);
   const [navFocused, setNavFocused] = useState(false);

   // Boolean flips only: React bails out when the value is unchanged, so the
   // bar never re-renders per frame while scrolling. Lenis drives the native
   // window scroll in root mode, so scrollY tracks it directly.
   const lenis = useLenis();
   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (y) => {
      const previous = scrollY.getPrevious() ?? y;
      setScrolled(y > SCROLLED_AFTER);
      // A scroll the nav itself started never hides the bar. Lenis carries the
      // userData of that scroll until it settles or the user takes over, and
      // its last frame is reported after it has settled and dropped the
      // userData, so a settled Lenis is skipped too (that frame decides
      // nothing: the direction was already set by the frames before it).
      const navScroll = lenis?.userData.source === NAV_SCROLL.source;
      const lenisSettled = lenis?.isScrolling === false;
      if (navScroll || lenisSettled) return;
      setHidden(y > HIDE_AFTER && y > previous);
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
            // The bar stays put while the menu is open (it anchors the panel)
            // and in Reduced mode, where a moving fixed bar is the kind of
            // motion the control exists to switch off.
            hidden={hidden && !mobileMenuOpen && !reducedMotion && !navFocused}
            onFocusChange={setNavFocused}
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
