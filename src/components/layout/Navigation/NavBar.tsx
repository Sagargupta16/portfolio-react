import { memo } from "react";
import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";
import DesktopNav from "./DesktopNav";

interface NavSection {
   id: string;
   label: string;
}

interface NavBarProps {
   scrolled: boolean;
   isMobile: boolean;
   sections: NavSection[];
   activeSection: string;
   mobileMenuOpen: boolean;
   onNavigate: (id: string) => void;
   onToggleMenu: () => void;
}

const NavBar = ({
   scrolled,
   isMobile,
   sections,
   activeSection,
   mobileMenuOpen,
   onNavigate,
   onToggleMenu,
}: NavBarProps) => {
   return (
      <motion.nav
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
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.7, ease: "easeOut" }}
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
                  width: 40,
                  height: 40,
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

            {/* Desktop nav links + CTA */}
            {!isMobile && (
               <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <DesktopNav
                     sections={sections}
                     activeSection={activeSection}
                     onNavigate={onNavigate}
                  />
                  <button
                     onClick={() => onNavigate("contact")}
                     className="btn-pill"
                     style={{ fontSize: 13 }}
                     aria-label="Navigate to Contact"
                  >
                     Contact Me
                  </button>
               </div>
            )}

            {/* Mobile hamburger */}
            {isMobile && (
               <button
                  onClick={onToggleMenu}
                  style={{
                     width: 44,
                     height: 44,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     borderRadius: 10,
                     color: TEXT_SECONDARY,
                     cursor: "pointer",
                     background: "none",
                     border: "none",
                     transition: "color 0.2s",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                     e.currentTarget.style.color = TEXT_PRIMARY;
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                     e.currentTarget.style.color = TEXT_SECONDARY;
                  }}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-menu"
               >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
               </button>
            )}
         </div>
      </motion.nav>
   );
};

export default memo(NavBar);
