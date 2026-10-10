import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { motion } from "motion/react";
import useMediaQuery from "@hooks/useMediaQuery";
import { fadeInUp } from "@utils/animations";
import { MEDIA_QUERIES } from "@/constants/theme";
import SkillChip from "./SkillChip";
import { CHIP_LIFT, CHIP_SIZES } from "./skillChipStyles";

interface SkillRailProps {
   items: string[];
   /** Run right to left's mirror image, so stacked rails pass each other. */
   reverse?: boolean;
}

/* One copy of the list must be wider than the rail or the seam shows a gap.
   A short category repeats inside each copy until it reaches this many chips
   (about 1,400px at ~120px a chip, clear of the 1,152px section). */
const MIN_CHIPS_PER_COPY = 12;
/* Every rail travels at the same speed whatever its length: the loop runs for
   one copy's measured width at this rate. The chip-count estimate covers the
   first paint, before the track has been measured. */
const PX_PER_SECOND = 40;
const SECONDS_PER_CHIP = 3;

/**
 * One category as a slow marquee of skill chips, like the learning-badge rail:
 * the .badge-rail stylesheet owns the loop, the edge fades and the hover pause.
 * The moving track is decorative; screen readers get the plain list once.
 */
const SkillRail = ({ items, reverse = false }: Readonly<SkillRailProps>) => {
   const canHover = useMediaQuery(MEDIA_QUERIES.hover);
   const railRef = useRef<HTMLDivElement>(null);
   const trackRef = useRef<HTMLDivElement>(null);

   // Set the duration on the element itself, so a font swap or resize never
   // re-renders the chips. The track holds two copies; one copy is half.
   useLayoutEffect(() => {
      const rail = railRef.current;
      const track = trackRef.current;
      if (!rail || !track) return;
      const apply = () => {
         const copyWidth = track.scrollWidth / 2;
         if (copyWidth > 0) {
            rail.style.setProperty(
               "--rail-duration",
               `${(copyWidth / PX_PER_SECOND).toFixed(1)}s`,
            );
         }
      };
      apply();
      const observer = new ResizeObserver(apply);
      observer.observe(track);
      return () => observer.disconnect();
   }, []);

   const repeats = Math.max(1, Math.ceil(MIN_CHIPS_PER_COPY / items.length));
   const copy = Array.from({ length: repeats }, (_, round) =>
      items.map((name) => ({ name, key: `${round}:${name}` })),
   ).flat();

   const railStyle = {
      "--rail-duration": `${copy.length * SECONDS_PER_CHIP}s`,
      "--rail-gap": `${CHIP_SIZES.regular.columnGap}px`,
   } as CSSProperties;

   const renderCopy = (half: string) => (
      <div className="badge-rail__group skill-rail__group">
         {copy.map(({ name, key }) => (
            <SkillChip
               key={`${half}:${key}`}
               name={name}
               hover={canHover ? CHIP_LIFT : undefined}
            />
         ))}
      </div>
   );

   return (
      <motion.div
         ref={railRef}
         variants={fadeInUp}
         className={`badge-rail skill-rail${reverse ? " skill-rail--reverse" : ""}`}
         style={railStyle}
      >
         <ul className="sr-only">
            {items.map((name) => (
               <li key={name}>{name}</li>
            ))}
         </ul>
         <div ref={trackRef} className="badge-rail__track" aria-hidden="true">
            {renderCopy("a")}
            {renderCopy("b")}
         </div>
      </motion.div>
   );
};

export default SkillRail;
