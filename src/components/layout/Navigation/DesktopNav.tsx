import { memo } from "react";
import { motion } from "motion/react";
import { EASING, TEXT_PRIMARY } from "@/constants/theme";
import { NAV_MORE_BLURBS, NAV_PRIMARY_IDS } from "@/constants/sections";
import NavMoreMenu from "./NavMoreMenu";

interface NavSection {
   id: string;
   label: string;
}

interface DesktopNavProps {
   sections: NavSection[];
   activeSection: string;
   onNavigate: (id: string) => void;
}

const TEXT_INACTIVE = "rgba(156, 169, 176, 0.9)";
const LABEL_HOVER = { color: TEXT_PRIMARY };
const LABEL_TRANSITION = {
   color: { duration: 0.2, ease: EASING.brisk },
   scale: { duration: 0.15, ease: EASING.brisk },
};
// One shared pill travels between labels (and onto "More" when a section
// inside it is active) as the scroll-spy moves; labels only change colour.
const PILL_TRANSITION = {
   type: "spring",
   stiffness: 500,
   damping: 40,
} as const;
const PILL_STYLE: React.CSSProperties = {
   position: "absolute",
   inset: 0,
   borderRadius: 8,
   backgroundColor: "rgba(255, 255, 255, 0.08)",
};
const LABEL_STYLE: React.CSSProperties = {
   position: "relative",
   alignItems: "center",
   padding: "6px 12px",
   minHeight: 44,
   fontSize: 13,
   fontWeight: 500,
   borderRadius: 8,
   cursor: "pointer",
   border: "none",
   background: "none",
   color: TEXT_INACTIVE,
};

const Pill = () => (
   <motion.span
      layoutId="nav-active"
      transition={PILL_TRANSITION}
      style={PILL_STYLE}
      aria-hidden="true"
   />
);

const DesktopNav = ({
   sections,
   activeSection,
   onNavigate,
}: DesktopNavProps) => {
   const primary = sections.filter(({ id }) =>
      (NAV_PRIMARY_IDS as readonly string[]).includes(id),
   );
   const more = sections
      .filter(({ id }) => !(NAV_PRIMARY_IDS as readonly string[]).includes(id))
      .map((section) => ({
         ...section,
         blurb: NAV_MORE_BLURBS[section.id as keyof typeof NAV_MORE_BLURBS],
      }));

   return (
      <div
         style={{
            alignItems: "center",
            gap: 4,
            display: "flex",
         }}
      >
         {primary.map((section) => {
            const isActive = activeSection === section.id;
            return (
               <motion.button
                  key={section.id}
                  onClick={() => onNavigate(section.id)}
                  whileTap={{ scale: 0.97 }}
                  whileHover={LABEL_HOVER}
                  whileFocus={LABEL_HOVER}
                  animate={{ color: isActive ? TEXT_PRIMARY : TEXT_INACTIVE }}
                  transition={LABEL_TRANSITION}
                  style={LABEL_STYLE}
                  aria-current={isActive ? "location" : undefined}
                  aria-label={`Navigate to ${section.label}`}
               >
                  {isActive && <Pill />}
                  <span style={{ position: "relative" }}>{section.label}</span>
               </motion.button>
            );
         })}
         {more.length > 0 && (
            <NavMoreMenu
               sections={more}
               activeSection={activeSection}
               onNavigate={onNavigate}
               pill={<Pill />}
               labelStyle={LABEL_STYLE}
               inactiveColor={TEXT_INACTIVE}
            />
         )}
      </div>
   );
};

export default memo(DesktopNav);
