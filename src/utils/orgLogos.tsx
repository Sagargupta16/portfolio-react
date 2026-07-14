import type { ReactNode } from "react";
import { FaAws } from "react-icons/fa";
import nitwLogo from "@assets/logos/nitw.webp";
import davvLogo from "@assets/logos/davv.webp";

const LOGO_IMAGES: Record<string, string> = {
   "National Institute of Technology Warangal": nitwLogo,
   "Devi Ahilya Vishwavidyalaya (DAVV)": davvLogo,
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
      return (
         <img
            src={LOGO_IMAGES[imageKey]}
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
            style={{ width: size, height: size, objectFit: "contain" }}
         />
      );
   }
   return null;
};
