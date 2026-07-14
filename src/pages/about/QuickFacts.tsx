import { useMemo } from "react";
import { motion } from "motion/react";
import { MapPin, Briefcase, GraduationCap, Languages } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
   getLocation,
   getTitle,
   getLanguages,
   getEducation,
} from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import { CYAN, TEXT_MUTED, TEXT_PRIMARY, MONO_FONT } from "@/constants/theme";

interface Fact {
   Icon: LucideIcon;
   label: string;
   value: string;
}

/**
 * Compact facts band under the About bio -- location, role, degree, languages.
 * Replaces the old stat-counter grid, which duplicated the hero stats verbatim.
 */
const QuickFacts = ({ isMobile }: { isMobile: boolean }) => {
   const facts = useMemo<Fact[]>(() => {
      const degree = getEducation()[0];
      return [
         { Icon: MapPin, label: "Based in", value: getLocation() },
         {
            Icon: Briefcase,
            label: "Role",
            // "Cloud Consultant -- Professional Services (DevOps/MLOps) at AWS"
            // is a mouthful for a fact chip; keep the part before the dash.
            value: getTitle().split(" -- ")[0] + " @ AWS",
         },
         {
            Icon: GraduationCap,
            label: "Education",
            // "Master of Computer Applications (MCA)" -> "MCA"
            value: `${/\(([^)]+)\)/.exec(degree?.title ?? "")?.[1] ?? degree?.title ?? ""}, NIT Warangal`,
         },
         {
            Icon: Languages,
            label: "Languages",
            value: getLanguages()
               .map((l) => l.name)
               .join(", "),
         },
      ];
   }, []);

   return (
      <motion.div
         style={{
            display: "grid",
            gridTemplateColumns: isMobile
               ? "repeat(2, minmax(0, 1fr))"
               : "repeat(4, 1fr)",
            gap: isMobile ? 16 : 24,
            marginTop: isMobile ? 40 : 56,
            paddingTop: isMobile ? 24 : 32,
            borderTop: "1px dashed rgba(255,255,255,0.12)",
         }}
         variants={staggerContainer}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      >
         {facts.map(({ Icon, label, value }) => (
            <motion.div
               key={label}
               variants={staggerItem}
               style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 6,
                  minWidth: 0,
               }}
            >
               <Icon size={18} style={{ color: CYAN }} />
               <span
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 10,
                     fontWeight: 600,
                     letterSpacing: "0.12em",
                     textTransform: "uppercase",
                     color: TEXT_MUTED,
                  }}
               >
                  {label}
               </span>
               <span
                  style={{
                     fontSize: isMobile ? 13 : 14,
                     fontWeight: 600,
                     color: TEXT_PRIMARY,
                     lineHeight: 1.4,
                  }}
               >
                  {value}
               </span>
            </motion.div>
         ))}
      </motion.div>
   );
};

export default QuickFacts;
