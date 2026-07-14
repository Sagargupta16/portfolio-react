import { useState, useEffect, useCallback, useRef } from "react";
import { useLenis } from "lenis/react";
import useBreakpoint from "@hooks/useBreakpoint";
import NavBar from "./NavBar";
import MobileMenu from "./MobileMenu";

interface NavSection {
   id: string;
   label: string;
}

const NAV_SECTIONS: NavSection[] = [
   { id: "about", label: "About" },
   { id: "experience", label: "Experience" },
   { id: "education", label: "Education" },
   { id: "skills", label: "Skills" },
   { id: "projects", label: "Projects" },
   { id: "achievements", label: "Awards" },
   { id: "services", label: "Services" },
   { id: "github", label: "GitHub" },
   { id: "contact", label: "Contact" },
];

const Nav = () => {
   const { isTablet: isMobile } = useBreakpoint();
   const [activeSection, setActiveSection] = useState("hero");
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const activeSectionRef = useRef("hero");

   // Lightweight scroll listener for nav background only
   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   // IntersectionObserver-based scroll-spy (replaces per-scroll DOM queries)
   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            for (const entry of entries) {
               if (entry.isIntersecting) {
                  const id = entry.target.id;
                  activeSectionRef.current = id;
                  setActiveSection(id);
               }
            }
         },
         {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: "-35% 0px -60% 0px",
         },
      );

      const heroEl = document.getElementById("hero");
      if (heroEl) observer.observe(heroEl);
      for (const section of NAV_SECTIONS) {
         const el = document.getElementById(section.id);
         if (el) observer.observe(el);
      }

      return () => observer.disconnect();
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
