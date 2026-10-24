import { useMemo } from "react";
import { motion, type Variants } from "motion/react";
import { MapPin, Briefcase, GraduationCap, Languages } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
   getLocation,
   getRole,
   getEmployer,
   getLanguages,
} from "@data/personal";
import { getEducation } from "@data/education";
import { getSectionCopy } from "@data/sections";
import { fillTemplate } from "@utils/fillTemplate";
import {
   BLUE_LIGHT,
   DURATION,
   EASING,
   TEXT_MUTED,
   TEXT_PRIMARY,
   MONO_FONT,
} from "@/constants/theme";

interface Fact {
   Icon: LucideIcon;
   label: string;
   value: string;
}

/* Each chip rises in a beat after the one before it; the delay is capped so a
   longer list would still settle inside the section reveal. */
const FACT_STAGGER_S = 0.07;
const MAX_STAGGER_S = 0.3;

const factItem: Variants = {
   hidden: { opacity: 0, y: 10 },
   visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
         delay: Math.min(index * FACT_STAGGER_S, MAX_STAGGER_S),
         duration: DURATION.default,
         ease: EASING.cinematic,
      },
   }),
};

/**
 * Compact facts band under the About bio -- location, role, degree, languages.
 * Replaces the old stat-counter grid, which duplicated the hero stats verbatim.
 */
const QuickFacts = ({ isMobile }: { isMobile: boolean }) => {
   const facts = useMemo<Fact[]>(() => {
      const degree = getEducation()[0];
      // "Master of Computer Applications (MCA)" -> "MCA" without regex
      // (Sonar S8786 flags the capture-group pattern for backtracking).
      const title = degree?.title ?? "";
      const open = title.indexOf("(");
      const close = title.indexOf(")", open + 1);
      const degreeShort =
         open !== -1 && close !== -1 ? title.slice(open + 1, close) : title;
      const copy = getSectionCopy("about").facts;
      return [
         { Icon: MapPin, label: copy.based_in, value: getLocation() },
         {
            Icon: Briefcase,
            label: copy.role,
            value: fillTemplate(copy.role_value, {
               role: getRole(),
               employer: getEmployer(),
            }),
         },
         {
            Icon: GraduationCap,
            label: copy.education,
            value: fillTemplate(copy.education_value, { degree: degreeShort }),
         },
         {
            Icon: Languages,
            label: copy.languages,
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
            borderTop: "1px dashed rgb(var(--ch-white) / 0.12)",
         }}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      >
         {facts.map(({ Icon, label, value }, index) => (
            <motion.div
               key={label}
               variants={factItem}
               custom={index}
               style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 6,
                  minWidth: 0,
               }}
            >
               <Icon size={18} style={{ color: BLUE_LIGHT }} />
               <span
                  style={{
                     fontFamily: MONO_FONT,
                     fontSize: 11,
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
