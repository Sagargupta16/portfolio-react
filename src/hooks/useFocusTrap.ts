import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
   "a[href]",
   "button:not([disabled])",
   "textarea:not([disabled])",
   "input:not([disabled])",
   "select:not([disabled])",
   '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Trap Tab / Shift-Tab focus inside a container while `active` is true,
 * and restore focus to the previously-focused element when deactivated.
 * Pair with `role="dialog"` + `aria-modal="true"` for WCAG-compliant modals.
 */
const useFocusTrap = <T extends HTMLElement>(
   active: boolean,
): RefObject<T | null> => {
   const containerRef = useRef<T>(null);
   const previouslyFocused = useRef<HTMLElement | null>(null);

   useEffect(() => {
      if (!active) return;
      const container = containerRef.current;
      if (!container) return;

      previouslyFocused.current = document.activeElement as HTMLElement | null;

      const focusables = Array.from(
         container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      (focusables[0] ?? container).focus();

      const onKeyDown = (e: KeyboardEvent) => {
         if (e.key !== "Tab") return;
         const nodes = Array.from(
            container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
         );
         if (nodes.length === 0) {
            e.preventDefault();
            return;
         }
         const first = nodes[0];
         const last = nodes[nodes.length - 1];
         const active = document.activeElement as HTMLElement | null;
         // If focus has escaped the container (e.g. landed on the backdrop or
         // body), pull it back in rather than letting Tab walk into the page
         // behind the modal.
         if (!container.contains(active)) {
            (e.shiftKey ? last : first)?.focus();
            e.preventDefault();
            return;
         }
         if (e.shiftKey && active === first) {
            last?.focus();
            e.preventDefault();
         } else if (!e.shiftKey && active === last) {
            first?.focus();
            e.preventDefault();
         }
      };

      document.addEventListener("keydown", onKeyDown);
      return () => {
         document.removeEventListener("keydown", onKeyDown);
         previouslyFocused.current?.focus?.();
      };
   }, [active]);

   return containerRef;
};

export default useFocusTrap;
