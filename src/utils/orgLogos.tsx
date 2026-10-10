import type { ReactNode } from "react";
import { FaAws } from "react-icons/fa";
import nitwLogo from "@assets/logos/nitw.svg";
import davvLogo from "@assets/logos/davv.svg";
import ikarusLogo from "@assets/logos/ikarus3d.webp";
import happyDaysLogo from "@assets/logos/happy-days-school.svg";
import kidsGardenLogo from "@assets/logos/kids-garden-school.svg";

const LOGO_IMAGES: Record<string, { src: string; wide?: boolean }> = {
   "National Institute of Technology Warangal": { src: nitwLogo },
   "Devi Ahilya Vishwavidyalaya (DAVV)": { src: davvLogo },
   "Ikarus-3D": { src: ikarusLogo, wide: true },
   "Happy Days School": { src: happyDaysLogo, wide: true },
   "Kids Garden School": { src: kidsGardenLogo },
};

/**
 * Organization mark (crest or logo) for experience/education cards, drawn
 * `size` px tall; wide marks get up to 1.5x that width, capped at `maxWidth`
 * so they stay inside a fixed tile. Returns null when no mark is registered --
 * callers keep their generic icon fallback.
 * Matching is prefix-based so "CSEA, NIT Warangal" also gets the NITW crest.
 */
export const getOrgLogo = (
   name: string,
   size = 18,
   maxWidth = Infinity,
): ReactNode => {
   if (name.includes("Amazon Web Services") || name.startsWith("AWS")) {
      return <FaAws size={size} color="#FF9900" aria-hidden="true" />;
   }
   const imageKey = Object.keys(LOGO_IMAGES).find(
      (k) =>
         name.includes(k) ||
         k.includes(name) ||
         (name.includes("NIT Warangal") && k.includes("Warangal")),
   );
   if (imageKey) {
      const image = LOGO_IMAGES[imageKey];
      const width = Math.min(image.wide ? size * 1.5 : size, maxWidth);
      return (
         <img
            src={image.src}
            alt=""
            aria-hidden="true"
            width={width}
            height={size}
            style={{
               width,
               height: size,
               objectFit: "contain",
               flexShrink: 0,
            }}
         />
      );
   }
   return null;
};
