import { memo } from "react";
import { motion } from "motion/react";
import { CYAN, TEXT_PRIMARY } from "@/constants/theme";

interface NavSection {
   id: string;
   label: string;
}

interface DesktopNavProps {
   sections: NavSection[];
   activeSection: string;
   sectionProgress: number;
   onNavigate: (id: string) => void;
}

const DesktopNav = ({
   sections,
   activeSection,
   sectionProgress,
   onNavigate,
}: DesktopNavProps) => {
   return (
      <div
         style={{
            alignItems: "center",
            gap: 4,
            display: "flex",
         }}
      >
         {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
               <motion.button
                  key={section.id}
                  onClick={() => onNavigate(section.id)}
                  whileTap={{ scale: 0.94 }}
                  style={{
                     padding: "4px 12px",
                     fontSize: 12,
                     fontWeight: 500,
                     borderRadius: 10,
                     cursor: "pointer",
                     border: "none",
                     transition:
                        "color 0.2s ease, background-color 0.2s ease",
                     color: isActive ? CYAN : "rgba(165, 165, 192, 0.9)",
                     backgroundColor: isActive
                        ? "rgba(6, 182, 212, 0.1)"
                        : "transparent",
                     backdropFilter: isActive ? "blur(8px)" : "none",
                     display: "flex",
                     alignItems: "center",
                     gap: 4,
                     position: "relative",
                  }}
                  aria-current={isActive ? "true" : undefined}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                     if (!isActive) {
                        e.currentTarget.style.color = TEXT_PRIMARY;
                        e.currentTarget.style.backgroundColor =
                           "rgba(255, 255, 255, 0.05)";
                     }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                     if (!isActive) {
                        e.currentTarget.style.color =
                           "rgba(165, 165, 192, 0.9)";
                        e.currentTarget.style.backgroundColor = "transparent";
                     }
                  }}
                  aria-label={`Navigate to ${section.label}`}
               >
                  {/* Progress dot */}
                  {isActive && (
                     <span
                        style={{
                           width: 5,
                           height: 5,
                           borderRadius: "50%",
                           background: CYAN,
                           boxShadow: `0 0 ${6 + sectionProgress * 8}px rgba(6, 182, 212, ${0.3 + sectionProgress * 0.5})`,
                           transition: "box-shadow 0.15s ease",
                           flexShrink: 0,
                        }}
                     />
                  )}
                  {section.label}
               </motion.button>
            );
         })}
      </div>
   );
};

export default memo(DesktopNav);
