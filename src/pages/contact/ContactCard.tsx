import { motion, type Variants } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ContactOption } from "@/types";
import { staggerItem } from "@utils/animations";
import useMotionPreference from "@hooks/useMotionPreference";
import { DURATION, EASING, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import { CONTACT_META, DEFAULT_CONTACT_META } from "./contactConstants";

interface ContactCardProps {
   option: ContactOption;
   isMobile: boolean;
}

/* Same lift language as the About highlight cards: one hover label on the
   link, the icon tile and the arrow animate their own "hover" variant.
   .glass-card CSS owns the border and background shift. */
const HOVER = "hover";
const LIFT_SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;
const ICON_SPRING = { type: "spring", stiffness: 420, damping: 16 } as const;
const ARROW_TRANSITION = { duration: DURATION.quick, ease: EASING.brisk };

const cardVariants: Variants = {
   ...staggerItem,
   [HOVER]: { y: -6, transition: LIFT_SPRING },
};
const tileVariants: Variants = { [HOVER]: { scale: 1.12, rotate: 6 } };
const arrowVariants: Variants = { [HOVER]: { x: 2, y: -2 } };

const ContactCard = ({ option, isMobile }: ContactCardProps) => {
   const { Icon, colors } = CONTACT_META[option.icon] ?? DEFAULT_CONTACT_META;
   const { reducedMotion } = useMotionPreference();
   const opensNewTab = option.link.startsWith("https://");
   const hover = reducedMotion ? undefined : HOVER;

   return (
      <motion.a
         href={option.link}
         target={opensNewTab ? "_blank" : undefined}
         rel={opensNewTab ? "noopener noreferrer" : undefined}
         variants={cardVariants}
         whileHover={hover}
         whileFocus={hover}
         className="glass-card"
         style={{
            padding: isMobile ? "16px 16px" : "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderLeft: `3px solid ${colors.accent}`,
            borderRadius: "0 16px 16px 0",
            textDecoration: "none",
            cursor: "pointer",
         }}
         aria-label={`${option.title}: ${option.value}${opensNewTab ? " (opens in a new tab)" : ""}`}
      >
         <motion.div
            variants={tileVariants}
            transition={ICON_SPRING}
            style={{
               width: 44,
               height: 44,
               borderRadius: 12,
               background: colors.bg,
               border: `1px solid ${colors.border}`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <Icon
               style={{
                  width: 20,
                  height: 20,
                  color: colors.accent,
               }}
            />
         </motion.div>
         <div style={{ minWidth: 0, flex: 1 }}>
            <p
               style={{
                  color: TEXT_MUTED,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
               }}
            >
               {option.title}
            </p>
            <p
               style={{
                  color: TEXT_PRIMARY,
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
               }}
            >
               {option.value}
            </p>
         </div>
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 4,
               color: colors.accent,
               fontSize: 12,
               fontWeight: 500,
               flexShrink: 0,
               whiteSpace: "nowrap",
            }}
         >
            {!isMobile && option.message}
            <motion.span
               aria-hidden="true"
               variants={arrowVariants}
               transition={ARROW_TRANSITION}
               style={{ display: "inline-flex" }}
            >
               <ArrowUpRight style={{ width: 14, height: 14 }} />
            </motion.span>
         </div>
      </motion.a>
   );
};

export default ContactCard;
