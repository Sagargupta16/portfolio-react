import { motion } from "motion/react";
import { Menu, X } from "lucide-react";
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
   sectionProgress: number;
   mobileMenuOpen: boolean;
   onNavigate: (id: string) => void;
   onToggleMenu: () => void;
}

const NavBar = ({
   scrolled,
   isMobile,
   sections,
   activeSection,
   sectionProgress,
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
               ? "rgba(10, 10, 26, 0.6)"
               : "rgba(10, 10, 26, 0.2)",
            backdropFilter: scrolled ? "blur(24px)" : "blur(12px)",
            WebkitBackdropFilter: scrolled ? "blur(24px)" : "blur(12px)",
            boxShadow: scrolled
               ? "0 10px 40px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.04)"
               : "none",
            borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
            transition:
               "background-color 0.3s, backdrop-filter 0.3s, box-shadow 0.3s",
         }}
         initial={{ y: -80, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
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
            {/* Logo */}
            <button
               onClick={() => onNavigate("hero")}
               className="glow-cyan-text"
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#06b6d4",
                  letterSpacing: "0.05em",
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
               }}
               aria-label="Scroll to top"
            >
               {"<SG />"}
            </button>

            {/* Desktop nav links */}
            {!isMobile && (
               <DesktopNav
                  sections={sections}
                  activeSection={activeSection}
                  sectionProgress={sectionProgress}
                  onNavigate={onNavigate}
               />
            )}

            {/* Mobile hamburger */}
            {isMobile && (
               <button
                  onClick={onToggleMenu}
                  style={{
                     width: 40,
                     height: 40,
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     borderRadius: 8,
                     color: "#a5a5c0",
                     cursor: "pointer",
                     background: "none",
                     border: "none",
                     transition: "color 0.2s",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                     e.currentTarget.style.color = "#06b6d4";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                     e.currentTarget.style.color = "#a5a5c0";
                  }}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
               >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
               </button>
            )}
         </div>
      </motion.nav>
   );
};

export default NavBar;
