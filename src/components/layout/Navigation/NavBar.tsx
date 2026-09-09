import { memo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import {
   DURATION,
   EASING,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
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
                  fontSize: 15,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 10,
               }}
               aria-label="Scroll to top"
            >
               SG
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
            )}
         </div>
      </motion.nav>
   );
};

export default memo(NavBar);
