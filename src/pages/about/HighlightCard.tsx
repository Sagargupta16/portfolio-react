import { motion, type Variants } from "motion/react";
import { Briefcase, GraduationCap, Rocket, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   CYAN,
   PURPLE,
   GREEN,
   AMBER,
   DURATION,
   EASING,
   TEXT_SECONDARY,
} from "@/constants/theme";

const HIGHLIGHT_ICONS: { Icon: LucideIcon; color: string }[] = [
   { Icon: Briefcase, color: CYAN },
   { Icon: GraduationCap, color: PURPLE },
   { Icon: Rocket, color: GREEN },
   { Icon: Trophy, color: AMBER },
];

interface HighlightCardProps {
   text: string;
   index: number;
   isMobile: boolean;
}

/* One hover label on the card; the icon tile and the accent hairline animate
   their own "hover" variant so the card responds as a unit with zero state.
   The entrance stagger lives on the parent container (About.tsx): Motion
   settles back from a hover with the visible transition, so a delay here
   would also delay the settle. */
const HOVER = "hover";
const LIFT_SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;
const ICON_SPRING = { type: "spring", stiffness: 420, damping: 16 } as const;
const HAIRLINE_TRANSITION = { duration: DURATION.quick, ease: EASING.brisk };
const HAIRLINE_REST = { opacity: 0.4, scaleY: 0.6 };

const cardVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.default, ease: EASING.cinematic },
   },
   [HOVER]: { y: -6, transition: LIFT_SPRING },
};
const iconVariants: Variants = { [HOVER]: { scale: 1.12, rotate: 6 } };
const hairlineVariants: Variants = { [HOVER]: { opacity: 1, scaleY: 1 } };

const HighlightCard = ({ text, index, isMobile }: HighlightCardProps) => {
   const { Icon, color } = HIGHLIGHT_ICONS[index];
   const { reducedMotion } = useMotionPreference();
   const cleanText = text.replace(/^[^\s]+\s/, "");
   const hover = reducedMotion ? undefined : HOVER;

   return (
      <motion.div
         variants={cardVariants}
         whileHover={hover}
         whileFocus={hover}
         style={{
            position: "relative",
            display: "flex",
            gap: isMobile ? 10 : 14,
            alignItems: "flex-start",
            padding: isMobile ? "12px 14px" : "14px 16px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
         }}
      >
         {/* Accent hairline: dim and short at rest, full and bright on hover */}
         <motion.span
            aria-hidden="true"
            variants={hairlineVariants}
            transition={HAIRLINE_TRANSITION}
            style={{
               ...HAIRLINE_REST,
               position: "absolute",
               left: 0,
               top: 12,
               bottom: 12,
               width: 2,
               borderRadius: 2,
               background: color,
            }}
         />
         <motion.div
            variants={iconVariants}
            transition={ICON_SPRING}
            style={{
               width: 32,
               height: 32,
               borderRadius: 10,
               background: `${color}12`,
               border: `1px solid ${color}20`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
               marginTop: 1,
            }}
         >
            <Icon style={{ width: 16, height: 16, color }} />
         </motion.div>
         <p
            style={{
               color: TEXT_SECONDARY,
               fontSize: isMobile ? 13 : 14,
               lineHeight: 1.7,
               margin: 0,
            }}
         >
            {cleanText}
         </p>
      </motion.div>
   );
};

export default HighlightCard;
