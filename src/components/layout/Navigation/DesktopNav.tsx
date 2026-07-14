import { memo } from "react";
import { motion } from "motion/react";
import { TEXT_PRIMARY } from "@/constants/theme";

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
                     padding: "6px 12px",
                     fontSize: 13,
                     fontWeight: 500,
                     borderRadius: 8,
                     cursor: "pointer",
                     border: "none",
                     transition: "color 0.2s ease, background-color 0.2s ease",
                     color: isActive
                        ? TEXT_PRIMARY
                        : "rgba(156, 169, 176, 0.9)",
                     backgroundColor: isActive
                        ? "rgba(255, 255, 255, 0.08)"
                        : "transparent",
                  }}
                  aria-current={isActive ? "true" : undefined}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                     if (!isActive) {
                        e.currentTarget.style.color = TEXT_PRIMARY;
                     }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                     if (!isActive) {
                        e.currentTarget.style.color =
                           "rgba(156, 169, 176, 0.9)";
                     }
                  }}
                  aria-label={`Navigate to ${section.label}`}
               >
                  {section.label}
               </motion.button>
            );
         })}
      </div>
   );
};

export default memo(DesktopNav);
