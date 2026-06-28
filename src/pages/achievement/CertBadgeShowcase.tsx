import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { fadeInUp } from "@utils/animations";
import type { Certification } from "@/types";
import { CYAN, TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import CertBadge from "./CertBadge";

interface CertBadgeShowcaseProps {
   certifications: Certification[];
}

const CertBadgeShowcase = ({ certifications }: CertBadgeShowcaseProps) => {
   const { isMobile } = useBreakpoint();
   const badgeSize = isMobile ? 90 : 120;

   return (
      <div>
         <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "0px 0px -60px 0px" }}
            variants={fadeInUp}
            style={{
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               gap: 8,
               marginBottom: 32,
            }}
         >
            <div
               style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(6,182,212,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <ShieldCheck
                  style={{ width: 18, height: 18, color: CYAN }}
               />
            </div>
            <h3
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
               }}
            >
               Industry Certifications
            </h3>
            <span
               style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: TEXT_MUTED,
                  padding: "2px 8px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.04)",
               }}
            >
               {certifications.length}
            </span>
         </motion.div>

         <div
            style={{
               display: "flex",
               flexWrap: "wrap",
               justifyContent: "center",
               gap: isMobile ? 20 : 36,
               paddingBottom: 16,
            }}
         >
            {certifications.map((cert, i) => (
               <CertBadge
                  key={cert.badgeId}
                  name={cert.name}
                  imageUrl={cert.imageUrl}
                  badgeUrl={cert.badgeUrl}
                  level={cert.level}
                  size={badgeSize}
                  floatDelay={i * 0.5}
                  entranceDelay={i * 0.1}
               />
            ))}
         </div>
      </div>
   );
};

export default CertBadgeShowcase;
