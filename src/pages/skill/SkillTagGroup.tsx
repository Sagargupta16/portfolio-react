import type { Variants } from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import useMotionPreference from "@hooks/useMotionPreference";
import { DURATION, EASING, MEDIA_QUERIES } from "@/constants/theme";
import SkillChip from "./SkillChip";
import { CHIP_LIFT, CHIP_SIZES } from "./skillChipStyles";

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

/**
 * Wrapped, centred chips: the secondary categories, and every category in
 * Reduced mode. Inherits hidden/visible from the category above, so the wave
 * fires once in view.
 */
const SkillTagGroup = ({ items, small = false }: SkillTagGroupProps) => {
   const { reducedMotion } = useMotionPreference();
   const canHover = useMediaQuery(MEDIA_QUERIES.hover);
   const size = small ? CHIP_SIZES.small : CHIP_SIZES.regular;
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
         {items.map((skill, index) => (
            <SkillChip
               key={skill}
               name={skill}
               small={small}
               hover={hover}
               focus={focus}
               variants={chipVariants}
               custom={index}
            />
         ))}
      </div>
   );
};

export default SkillTagGroup;
