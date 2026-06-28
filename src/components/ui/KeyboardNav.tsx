import { useEffect, useCallback } from "react";
import { useLenis } from "lenis/react";

const SECTIONS = [
   "hero",
   "about",
   "experience",
   "education",
   "skills",
   "projects",
   "achievements",
   "services",
   "github",
   "contact",
];

const KeyboardNav = () => {
   const lenis = useLenis();
   const getCurrentSectionIndex = useCallback((): number => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewMiddle = scrollY + windowHeight * 0.35;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
         const el = document.getElementById(SECTIONS[i]);
         if (el) {
            const rect = el.getBoundingClientRect();
            const top = rect.top + scrollY;
            if (viewMiddle >= top) return i;
         }
      }
      return 0;
   }, []);

   const scrollToSection = useCallback(
      (id: string) => {
         const el = document.getElementById(id);
         if (!el) return;
         if (lenis) lenis.scrollTo(el, { offset: -64 });
         else el.scrollIntoView();
      },
      [lenis],
   );

   const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
         // Don't hijack key combos (Ctrl/Cmd/Alt) -- those belong to the browser/OS.
         if (e.ctrlKey || e.metaKey || e.altKey) return;

         // Ignore when typing in a field OR when focus is on any interactive
         // control (button/link/etc) -- bare-key shortcuts must not fire while a
         // control is focused (WCAG 2.1.4 Character Key Shortcuts).
         const target = e.target as HTMLElement;
         const tag = target.tagName;
         if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            tag === "BUTTON" ||
            tag === "A" ||
            target.isContentEditable ||
            target.closest("[role], button, a[href]")
         )
            return;

         // Number keys 1-9 jump to sections (0 = hero handled by 't')
         if (e.key >= "1" && e.key <= "9") {
            const index = Number.parseInt(e.key, 10);
            if (index < SECTIONS.length) {
               e.preventDefault();
               scrollToSection(SECTIONS[index]);
            }
            return;
         }

         // 0 or t = scroll to top (hero)
         if (e.key === "0" || e.key === "t") {
            e.preventDefault();
            scrollToSection("hero");
            return;
         }

         // j = next section, k = previous section
         if (e.key === "j" || e.key === "k") {
            e.preventDefault();
            const current = getCurrentSectionIndex();
            const next =
               e.key === "j"
                  ? Math.min(current + 1, SECTIONS.length - 1)
                  : Math.max(current - 1, 0);
            scrollToSection(SECTIONS[next]);
         }
      },
      [getCurrentSectionIndex, scrollToSection],
   );

   useEffect(() => {
      globalThis.addEventListener("keydown", handleKeyDown);
      return () => globalThis.removeEventListener("keydown", handleKeyDown);
   }, [handleKeyDown]);

   return null;
};

export default KeyboardNav;
