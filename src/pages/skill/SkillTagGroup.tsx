import type { CSSProperties } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
   type Variants,
} from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";
import {
   DURATION,
   EASING,
   MEDIA_QUERIES,
   TEXT_PRIMARY,
} from "@/constants/theme";
import { getSkillIcon } from "@utils/skillIcons";

interface SkillTagGroupProps {
   items: string[];
   /** Compact rendering for secondary categories. */
   small?: boolean;
}

// The chips wave in behind the category rule: 40ms per chip, capped so a
// 17-item row still finishes arriving within a third of a second.
const RULE_LEAD = 0.12;
const WAVE_STEP = 0.04;
const WAVE_CAP = 0.24;
const chipVariants: Variants = {
   hidden: { opacity: 0, y: 12 },
   visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
         duration: DURATION.default,
         ease: EASING.cinematic,
         delay: RULE_LEAD + Math.min(index * WAVE_STEP, WAVE_CAP),
      },
   }),
};

// At rest the chip is flat: the hairline and fill are fully transparent.
// Hover and focus lift it on a spring and fade the hairline and fill in.
// Motion owns every property (no CSS :hover), and its hover gesture ignores
// touch pointers, so a tap on a phone never leaves a sticky state.
const TRANSPARENT = "rgba(255, 255, 255, 0)";
const HAIRLINE_LIT = "rgba(255, 255, 255, 0.14)";
const FILL_LIT = "rgba(255, 255, 255, 0.04)";
const CHIP_LIFT: TargetAndTransition = {
   scale: 1.06,
   borderColor: HAIRLINE_LIT,
   backgroundColor: FILL_LIT,
};
const CHIP_TRANSITION: Transition = {
   scale: { type: "spring", stiffness: 500, damping: 28 },
   borderColor: { duration: 0.2 },
   backgroundColor: { duration: 0.2 },
};

// Padding replaces part of the old gaps, so the visual rhythm is unchanged.
const SIZES = {
   regular: {
      padding: "6px 12px",
      columnGap: 20,
      rowGap: 12,
      gap: 10,
      fontSize: 15,
      icon: 20,
   },
   small: {
      padding: "5px 10px",
      columnGap: 8,
      rowGap: 6,
      gap: 8,
      fontSize: 13,
      icon: 16,
   },
} as const;

const CHIP_BASE: CSSProperties = {
   display: "inline-flex",
   alignItems: "center",
   fontWeight: 600,
   color: TEXT_PRIMARY,
   cursor: "default",
   borderWidth: 1,
   borderStyle: "solid",
   borderColor: TRANSPARENT,
   backgroundColor: TRANSPARENT,
   borderRadius: 10,
};

/**
 * Icon + bold name chips (akobir tech-stack style, no boxes at rest).
 * Brand glyphs carry their official color; the label stays white. Inherits
 * hidden/visible from the category above, so the wave fires once in view.
 */
const SkillTagGroup = ({ items, small = false }: SkillTagGroupProps) => {
   const { reducedMotion } = useMotionPreference();
   const canHover = useMediaQuery(MEDIA_QUERIES.hover);
   const size = small ? SIZES.small : SIZES.regular;
   // Hover only where the primary pointer can hover; focus keeps keyboard parity.
   const hover = canHover && !reducedMotion ? CHIP_LIFT : undefined;
   const focus = reducedMotion ? undefined : CHIP_LIFT;

   return (
      <div
         style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            columnGap: size.columnGap,
            rowGap: size.rowGap,
         }}
      >
         {items.map((skill, index) => {
            const icon = getSkillIcon(skill);
            return (
               <motion.span
                  key={skill}
                  custom={index}
                  variants={chipVariants}
                  whileHover={hover}
                  whileFocus={focus}
                  transition={CHIP_TRANSITION}
                  style={{
                     ...CHIP_BASE,
                     padding: size.padding,
                     gap: size.gap,
                     fontSize: size.fontSize,
                  }}
               >
                  {icon && (
                     <icon.Icon
                        size={size.icon}
                        color={icon.color}
                        style={{ flexShrink: 0 }}
                     />
                  )}
                  {skill}
               </motion.span>
            );
         })}
      </div>
   );
};

export default SkillTagGroup;
