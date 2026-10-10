import type { CSSProperties } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
   type Variants,
} from "motion/react";
import { TEXT_PRIMARY } from "@/constants/theme";
import { getSkillIcon } from "@utils/skillIcons";
import { CHIP_SIZES } from "./skillChipStyles";

// At rest the chip is flat: the hairline and fill are fully transparent; the
// lift (skillChipStyles) fades them in. Motion owns every property (no CSS
// :hover), and its hover gesture ignores touch pointers, so a tap on a phone
// never leaves a sticky state.
const TRANSPARENT = "rgba(255, 255, 255, 0)";
const CHIP_TRANSITION: Transition = {
   scale: { type: "spring", stiffness: 500, damping: 28 },
   borderColor: { duration: 0.2 },
   backgroundColor: { duration: 0.2 },
};

const CHIP_BASE: CSSProperties = {
   display: "inline-flex",
   alignItems: "center",
   flexShrink: 0,
   whiteSpace: "nowrap",
   fontWeight: 600,
   color: TEXT_PRIMARY,
   cursor: "default",
   borderWidth: 1,
   borderStyle: "solid",
   borderColor: TRANSPARENT,
   backgroundColor: TRANSPARENT,
   borderRadius: 10,
};

interface SkillChipProps {
   name: string;
   small?: boolean;
   /** Lift on hover; undefined where the pointer cannot hover or in Reduced. */
   hover?: TargetAndTransition;
   focus?: TargetAndTransition;
   variants?: Variants;
   custom?: number;
}

/**
 * Icon + bold name (akobir tech-stack style, no box at rest). Brand glyphs
 * carry their official colour; the label stays white.
 */
const SkillChip = ({
   name,
   small = false,
   hover,
   focus,
   variants,
   custom,
}: Readonly<SkillChipProps>) => {
   const size = small ? CHIP_SIZES.small : CHIP_SIZES.regular;
   const icon = getSkillIcon(name);
   return (
      <motion.span
         custom={custom}
         variants={variants}
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
               aria-hidden="true"
            />
         )}
         {name}
      </motion.span>
   );
};

export default SkillChip;
