import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { EASING, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";

interface MoreSection {
   id: string;
   label: string;
   blurb?: string;
}

interface NavMoreMenuProps {
   sections: MoreSection[];
   activeSection: string;
   onNavigate: (id: string) => void;
   /** The shared nav pill, rendered when a section in this menu is active. */
   pill: React.ReactNode;
   labelStyle: React.CSSProperties;
   inactiveColor: string;
}

// Hovering out leaves a beat before closing, so a diagonal move from the
// trigger to the panel never drops the menu.
const CLOSE_DELAY_MS = 140;
const PANEL_TRANSITION = { duration: 0.16, ease: EASING.brisk };
const PANEL_HIDDEN = { opacity: 0, y: -6, scale: 0.97 };
const PANEL_SHOWN = { opacity: 1, y: 0, scale: 1 };
const CHEVRON_TRANSITION = { duration: 0.18, ease: EASING.brisk };

const PANEL_STYLE: React.CSSProperties = {
   position: "absolute",
   top: "calc(100% + 8px)",
   right: 0,
   width: 280,
   padding: 6,
   borderRadius: 14,
   background: "rgb(14 20 23 / 0.98)",
   border: "1px solid rgba(255, 255, 255, 0.08)",
   boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
   transformOrigin: "top right",
   listStyle: "none",
   margin: 0,
};

/**
 * "More" in the desktop nav: a disclosure button over the secondary sections.
 * Click toggles it everywhere; a mouse also opens it on hover. Escape, an
 * outside press, a pick, or focus leaving the menu closes it.
 */
const NavMoreMenu = ({
   sections,
   activeSection,
   onNavigate,
   pill,
   labelStyle,
   inactiveColor,
}: Readonly<NavMoreMenuProps>) => {
   const [open, setOpen] = useState(false);
   const wrapRef = useRef<HTMLDivElement>(null);
   const triggerRef = useRef<HTMLButtonElement>(null);
   const closeTimerRef = useRef<number | undefined>(undefined);
   const panelId = useId();
   const activeInMenu = sections.some(({ id }) => id === activeSection);

   const cancelClose = () => globalThis.clearTimeout(closeTimerRef.current);
   const close = useCallback(() => {
      globalThis.clearTimeout(closeTimerRef.current);
      setOpen(false);
   }, []);

   useEffect(() => {
      if (!open) return;
      const onPointerDown = (e: PointerEvent) => {
         if (!wrapRef.current?.contains(e.target as Node)) close();
      };
      const onKeyDown = (e: KeyboardEvent) => {
         if (e.key !== "Escape") return;
         close();
         triggerRef.current?.focus();
      };
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
      return () => {
         document.removeEventListener("pointerdown", onPointerDown);
         document.removeEventListener("keydown", onKeyDown);
      };
   }, [open, close]);

   useEffect(() => () => globalThis.clearTimeout(closeTimerRef.current), []);

   const onPointerEnter = (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelClose();
      setOpen(true);
   };
   const onPointerLeave = (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelClose();
      closeTimerRef.current = globalThis.setTimeout(
         () => setOpen(false),
         CLOSE_DELAY_MS,
      );
   };
   const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget)) close();
   };

   const pick = (id: string) => {
      close();
      onNavigate(id);
   };

   return (
      <div
         ref={wrapRef}
         style={{ position: "relative" }}
         onPointerEnter={onPointerEnter}
         onPointerLeave={onPointerLeave}
         onBlur={onBlur}
      >
         <motion.button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            whileTap={{ scale: 0.97 }}
            animate={{
               color: activeInMenu || open ? TEXT_PRIMARY : inactiveColor,
            }}
            style={{ ...labelStyle, display: "inline-flex", gap: 4 }}
            aria-expanded={open}
            aria-controls={panelId}
         >
            {activeInMenu && pill}
            <span style={{ position: "relative" }}>More</span>
            <motion.span
               aria-hidden="true"
               style={{ position: "relative", display: "inline-flex" }}
               animate={{ rotate: open ? 180 : 0 }}
               transition={CHEVRON_TRANSITION}
            >
               <ChevronDown size={14} />
            </motion.span>
         </motion.button>

         <AnimatePresence>
            {open && (
               <motion.ul
                  id={panelId}
                  style={PANEL_STYLE}
                  initial={PANEL_HIDDEN}
                  animate={PANEL_SHOWN}
                  exit={PANEL_HIDDEN}
                  transition={PANEL_TRANSITION}
               >
                  {sections.map((section) => {
                     const isActive = section.id === activeSection;
                     return (
                        <li key={section.id}>
                           <button
                              type="button"
                              className={`nav-more-item${isActive ? " is-active" : ""}`}
                              onClick={() => pick(section.id)}
                              aria-current={isActive ? "location" : undefined}
                           >
                              <span
                                 className="nav-more-item__label"
                                 style={{ color: TEXT_PRIMARY }}
                              >
                                 {section.label}
                              </span>
                              {section.blurb && (
                                 <span
                                    className="nav-more-item__blurb"
                                    style={{ color: TEXT_SECONDARY }}
                                 >
                                    {section.blurb}
                                 </span>
                              )}
                           </button>
                        </li>
                     );
                  })}
               </motion.ul>
            )}
         </AnimatePresence>
      </div>
   );
};

export default NavMoreMenu;
