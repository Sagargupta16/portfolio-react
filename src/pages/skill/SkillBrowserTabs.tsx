import { motion } from "motion/react";
import { MONO_FONT, TEXT_MUTED, CYAN, PURPLE } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";

interface SkillBrowserTabsProps {
   categories: Array<{ key: string; label: string }>;
   activeKey: string;
   onSelect: (key: string) => void;
}

const SkillBrowserTabs = ({
   categories,
   activeKey,
   onSelect,
}: SkillBrowserTabsProps) => {
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <div
         style={{
            display: "flex",
            gap: isMobile ? 0 : 4,
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
         }}
      >
         {categories.map(({ key, label }) => {
            const isActive = key === activeKey;
            return (
               <button
                  key={key}
                  onClick={() => onSelect(key)}
                  style={{
                     position: "relative",
                     padding: isMobile ? "12px 10px" : "12px 16px",
                     fontFamily: MONO_FONT,
                     fontSize: isMobile ? 10 : 12,
                     fontWeight: 600,
                     textTransform: "uppercase",
                     letterSpacing: "0.04em",
                     color: isActive ? CYAN : TEXT_MUTED,
                     background: "none",
                     border: "none",
                     cursor: "pointer",
                     whiteSpace: "nowrap",
                     transition: "color 0.2s ease",
                     flexShrink: 0,
                  }}
               >
                  {label}
                  {isActive && (
                     <motion.div
                        layoutId="skill-tab-underline"
                        style={{
                           position: "absolute",
                           bottom: -1,
                           left: 8,
                           right: 8,
                           height: 2,
                           borderRadius: 1,
                           background: `linear-gradient(90deg, ${CYAN}, ${PURPLE})`,
                        }}
                        transition={{
                           type: "spring",
                           stiffness: 400,
                           damping: 30,
                        }}
                     />
                  )}
               </button>
            );
         })}
      </div>
   );
};

export default SkillBrowserTabs;
