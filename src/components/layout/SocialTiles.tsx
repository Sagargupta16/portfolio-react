import type { CSSProperties } from "react";
import {
   motion,
   type TargetAndTransition,
   type Transition,
} from "motion/react";
import { getSocialProfiles } from "@data/personal";
import { getUiCopy, newTabLabel } from "@data/ui";
import { fillTemplate } from "@utils/fillTemplate";
import ICON_MAP from "@utils/iconMap";
import useMotionPreference from "@hooks/useMotionPreference";

interface SocialTilesProps {
   tileStyle: CSSProperties;
   /** Hover and keyboard focus share this target. */
   hover: TargetAndTransition;
   tap: TargetAndTransition;
   transition: Transition;
   iconSize: number;
}

/**
 * One square link per social profile, shared by the hero and the footer. The
 * two differ only in the tile's look and motion, passed in as props; the
 * parent supplies the row they sit in.
 */
const SocialTiles = ({
   tileStyle,
   hover,
   tap,
   transition,
   iconSize,
}: SocialTilesProps) => {
   const { reducedMotion } = useMotionPreference();
   // Reduced keeps the tiles at their resting design; the press stays.
   const hoverTarget = reducedMotion ? undefined : hover;

   return getSocialProfiles().map((profile) => {
      const IconComponent = ICON_MAP[profile.icon];
      if (!IconComponent) return null;
      return (
         <motion.a
            key={profile.id}
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            style={tileStyle}
            whileHover={hoverTarget}
            whileFocus={hoverTarget}
            whileTap={tap}
            transition={transition}
            aria-label={newTabLabel(
               fillTemplate(getUiCopy().profile_label, {
                  name: profile.name,
               }),
            )}
         >
            <IconComponent size={iconSize} aria-hidden="true" />
         </motion.a>
      );
   });
};

export default SocialTiles;
