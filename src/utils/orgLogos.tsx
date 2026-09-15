import type { ReactNode } from "react";
import { FaAws } from "react-icons/fa";
import nitwLogo from "@assets/logos/nitw.webp";
import davvLogo from "@assets/logos/davv.webp";
import ikarusLogo from "@assets/logos/ikarus3d.webp";
import happyDaysLogo from "@assets/logos/happy-days-school.webp";
import kidsGardenLogo from "@assets/logos/kids-garden-school.webp";

const LOGO_IMAGES: Record<string, { src: string; wide?: boolean }> = {
   "National Institute of Technology Warangal": { src: nitwLogo },
   "Devi Ahilya Vishwavidyalaya (DAVV)": { src: davvLogo },
   "Ikarus-3D": { src: ikarusLogo, wide: true },
   "Happy Days School": { src: happyDaysLogo, wide: true },
   "Kids Garden School": { src: kidsGardenLogo },
};

/**
 * Real organization mark for experience/education cards.
 * Returns null when no official mark is available -- callers keep their
 * generic icon fallback so schools and small orgs still render fine.
 * Matching is prefix-based so "CSEA, NIT Warangal" also gets the NITW crest.
 */
export const getOrgLogo = (name: string, size = 18): ReactNode => {
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
      const width = image.wide ? size * 1.5 : size;
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
