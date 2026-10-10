import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, ScanEye, Search, X } from "lucide-react";
import { setPaletteOpen } from "@utils/paletteState";
import { toggleAnnotations, useAnnotationsOn } from "@utils/annotationsState";
import {
   DURATION,
   EASING,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import MakerMark from "@components/ui/MakerMark";
import DesktopNav from "./DesktopNav";

interface NavSection {
   id: string;
   label: string;
}

interface NavBarProps {
   scrolled: boolean;
   hidden: boolean;
   /** Keyboard focus inside the bar brings a hidden bar back. */
   onFocusChange: (focused: boolean) => void;
   isMobile: boolean;
   sections: NavSection[];
   activeSection: string;
   mobileMenuOpen: boolean;
   onNavigate: (id: string) => void;
   onToggleMenu: () => void;
}

// 64px bar plus its hairline: fully clear of the viewport when hidden.
const HIDDEN_Y = -72;
const ENTRANCE_TRANSITION = {
   duration: DURATION.slow,
   ease: "easeOut" as const,
};
const SLIDE_TRANSITION = { duration: 0.3, ease: "easeOut" as const };
const COLOR_TRANSITION = { color: { duration: 0.2, ease: EASING.brisk } };
const ICON_HOVER = { color: TEXT_PRIMARY };

// Both glyphs sit absolutely centred in the 44px hit target so the swap never
// changes the button's box; only the glyph rotates and fades.
const ICON_TRANSITION = { duration: 0.18, ease: "easeOut" as const };
const ICON_ENTER = { rotate: -90, opacity: 0 };
const ICON_REST = { rotate: 0, opacity: 1 };
const ICON_EXIT = { rotate: 90, opacity: 0 };
const ICON_STYLE: React.CSSProperties = {
   position: "absolute",
   inset: 0,
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
};

const NavBar = ({
   scrolled,
   hidden,
   onFocusChange,
   isMobile,
   sections,
   activeSection,
   mobileMenuOpen,
   onNavigate,
   onToggleMenu,
}: NavBarProps) => {
   // The mount slide keeps its slow entrance; every later y change (hide on
   // scroll down, show on scroll up) uses the quicker slide.
   const [entered, setEntered] = useState(false);
   const annotationsOn = useAnnotationsOn();

   return (
      <motion.nav
         onFocusCapture={() => onFocusChange(true)}
         onBlurCapture={(e: React.FocusEvent<HTMLElement>) => {
            if (!e.currentTarget.contains(e.relatedTarget))
               onFocusChange(false);
         }}
         layoutRoot
         style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            height: 64,
            backgroundColor: scrolled
               ? "rgba(11, 16, 18, 0.92)"
               : "rgba(11, 16, 18, 0.5)",
            borderBottom: scrolled
               ? "1px solid rgba(255, 255, 255, 0.06)"
               : "1px solid transparent",
            transition: "background-color 0.3s, border-color 0.3s",
         }}
         initial={{ y: -80, opacity: 0 }}
         animate={{ y: hidden ? HIDDEN_Y : 0, opacity: 1 }}
         transition={entered ? SLIDE_TRANSITION : ENTRANCE_TRANSITION}
         onAnimationComplete={() => setEntered(true)}
         aria-label="Primary"
      >
         <div
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "space-between",
               height: "100%",
               paddingLeft: 24,
               paddingRight: 24,
               maxWidth: 1280,
               marginLeft: "auto",
               marginRight: "auto",
            }}
         >
            {/* Logo mark */}
            <button
               onClick={() => onNavigate("hero")}
               style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 10,
               }}
               aria-label="Scroll to top"
            >
               <MakerMark size={36} />
            </button>

            {/* Desktop nav links + CTA. Contact is the pill, so the link list skips it;
                the mobile menu (no pill) keeps the Contact entry. */}
            {!isMobile && (
               <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <DesktopNav
                     sections={sections.filter((s) => s.id !== "contact")}
                     activeSection={activeSection}
                     onNavigate={onNavigate}
                  />
                  <button
                     type="button"
                     onClick={toggleAnnotations}
                     className={`palette-trigger annotations-trigger${annotationsOn ? " is-on" : ""}`}
                     aria-pressed={annotationsOn}
                     title="How this site is built"
                  >
                     <ScanEye size={14} aria-hidden="true" />
                     <span>How it&apos;s built</span>
                  </button>
                  <button
                     type="button"
                     onClick={() => setPaletteOpen(true)}
                     className="palette-trigger"
                     aria-label="Open command palette"
                     aria-keyshortcuts="Control+K Meta+K"
                  >
                     <Search size={14} aria-hidden="true" />
                     <kbd>Ctrl K</kbd>
                  </button>
                  <button
                     onClick={() => onNavigate("contact")}
                     className="btn-pill"
                     style={{ fontSize: 13, minHeight: 44 }}
                     aria-label="Navigate to Contact"
                  >
                     Contact Me
                  </button>
               </div>
            )}

            {/* Mobile hamburger. Motion's hover gesture ignores touch pointers,
                so a tap never leaves the button stuck in its hover colour. */}
            {isMobile && (
               <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                     type="button"
                     onClick={toggleAnnotations}
                     className={`palette-trigger palette-trigger-icon annotations-trigger${annotationsOn ? " is-on" : ""}`}
                     aria-pressed={annotationsOn}
                     aria-label="How this site is built"
                  >
                     <ScanEye size={18} aria-hidden="true" />
                  </button>
                  <button
                     type="button"
                     onClick={() => setPaletteOpen(true)}
                     className="palette-trigger palette-trigger-icon"
                     aria-label="Open command palette"
                  >
                     <Search size={18} aria-hidden="true" />
                  </button>
                  <motion.button
                     onClick={onToggleMenu}
                     style={{
                        position: "relative",
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        color: TEXT_SECONDARY,
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                     }}
                     whileHover={ICON_HOVER}
                     whileFocus={ICON_HOVER}
                     transition={COLOR_TRANSITION}
                     aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                     aria-expanded={mobileMenuOpen}
                     aria-controls="mobile-menu"
                  >
                     <AnimatePresence mode="wait" initial={false}>
                        {mobileMenuOpen ? (
                           <motion.span
                              key="close"
                              style={ICON_STYLE}
                              initial={ICON_ENTER}
                              animate={ICON_REST}
                              exit={ICON_EXIT}
                              transition={ICON_TRANSITION}
                              aria-hidden="true"
                           >
                              <X size={22} />
                           </motion.span>
                        ) : (
                           <motion.span
                              key="open"
                              style={ICON_STYLE}
                              initial={ICON_ENTER}
                              animate={ICON_REST}
                              exit={ICON_EXIT}
                              transition={ICON_TRANSITION}
                              aria-hidden="true"
                           >
                              <Menu size={22} />
                           </motion.span>
                        )}
                     </AnimatePresence>
                  </motion.button>
               </div>
            )}
         </div>
      </motion.nav>
   );
};

export default memo(NavBar);
