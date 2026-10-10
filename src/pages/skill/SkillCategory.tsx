import type { ComponentType, CSSProperties } from "react";
import { motion, type Variants } from "motion/react";
import { VIEWPORT_MARGIN } from "@utils/animations";
import { CYAN, DURATION, EASING } from "@/constants/theme";
import useMotionPreference from "@hooks/useMotionPreference";
import SkillTagGroup from "./SkillTagGroup";
import SkillRail from "./SkillRail";

/** A lucide glyph, typed loosely so the section owns no lucide types. */
export type CategoryGlyph = ComponentType<{
   size?: number;
   strokeWidth?: number;
}>;

interface SkillCategoryProps {
   label: string;
   items: string[];
   glyph: CategoryGlyph;
   /** Position in its list: offsets the breathing so rows never pulse in unison. */
   index: number;
   /** Compact secondary rendering: h4 and the small chips, never a rail. */
   small?: boolean;
   /** Let the glyph breathe once in view. Primary rows only. */
   breathe?: boolean;
   /** Render as moving rails; the list splits evenly across `rails` rows. */
   rails?: number;
   /** Rails above this category in the section, so directions keep alternating. */
   railOffset?: number;
}

// The rule lands first; the chips wave in behind it (see SkillTagGroup).
const ruleVariants: Variants = {
   hidden: { opacity: 0, y: 12 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.default, ease: EASING.cinematic },
   },
};

// Slow exhale: the glyph dims and shrinks at the midpoint and is back on its
// first frame at the end. Three keyframes, so ease is a per-segment array:
// opacity runs on WAAPI and scale on the frameloop, and one ease string
// would let the two drift apart.
const BREATH_TIMES = [0, 0.5, 1];
const BREATH_DURATION = 6;
const BREATH_OFFSET = 0.7;
const breathVariants: Variants = {
   visible: (index: number) => ({
      opacity: [1, 0.55, 1],
      scale: [1, 0.9, 1],
      transition: {
         duration: BREATH_DURATION,
         times: BREATH_TIMES,
         ease: BREATH_TIMES.slice(1).map(() => "easeInOut" as const),
         repeat: Infinity,
         delay: index * BREATH_OFFSET,
      },
   }),
};

const GLYPH_SIZE = 14;
const GLYPH_STYLE: CSSProperties = {
   display: "inline-flex",
   color: CYAN,
   lineHeight: 0,
};
const LABEL_STYLE: CSSProperties = {
   display: "inline-flex",
   alignItems: "center",
   gap: 8,
};
const RAILS_STYLE: CSSProperties = {
   display: "flex",
   flexDirection: "column",
   gap: 10,
};

/** Split a list into `count` rows of near-equal length, order kept. */
const splitRows = (items: string[], count: number): string[][] => {
   const size = Math.ceil(items.length / count);
   return Array.from({ length: count }, (_, row) =>
      items.slice(row * size, (row + 1) * size),
   ).filter((row) => row.length > 0);
};

/**
 * One category of the Skills section with its own in-view trigger: the dashed
 * rule (glyph + label) rises, then the chips arrive, as moving rails in Full
 * mode or a wrapped group. Reduced always gets the wrapped group: every chip
 * at rest, nothing clipped, and the glyph stays still.
 */
const SkillCategory = ({
   label,
   items,
   glyph: Glyph,
   index,
   small = false,
   breathe = false,
   rails = 0,
   railOffset = 0,
}: SkillCategoryProps) => {
   const { preference, reducedMotion } = useMotionPreference();
   const Heading = small ? motion.h4 : motion.h3;
   const breathing = breathe && !reducedMotion ? breathVariants : undefined;
   const asRails = rails > 0 && !small && !reducedMotion;

   return (
      <motion.div
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: VIEWPORT_MARGIN }}
      >
         <Heading
            className="dashed-rule dashed-rule--centered"
            style={{ marginBottom: asRails ? 20 : 28 }}
            variants={ruleVariants}
         >
            <span style={LABEL_STYLE}>
               <motion.span
                  key={preference}
                  aria-hidden="true"
                  style={GLYPH_STYLE}
                  variants={breathing}
                  custom={index}
               >
                  <Glyph size={GLYPH_SIZE} strokeWidth={2} />
               </motion.span>
               {label}
            </span>
         </Heading>
         {asRails ? (
            <div style={RAILS_STYLE}>
               {splitRows(items, rails).map((row, rowIndex) => (
                  <SkillRail
                     key={row[0]}
                     items={row}
                     reverse={(railOffset + rowIndex) % 2 === 1}
                  />
               ))}
            </div>
         ) : (
            <SkillTagGroup items={items} small={small} />
         )}
      </motion.div>
   );
};

export default SkillCategory;
