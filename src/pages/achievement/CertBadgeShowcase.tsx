import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { fadeInUp } from "@utils/animations";
import type { Certification } from "@/types";
import useMediaQuery from "@utils/useMediaQuery";
import CertBadge from "./CertBadge";

interface CertBadgeShowcaseProps {
   certifications: Certification[];
}

const CertBadgeShowcase = ({ certifications }: CertBadgeShowcaseProps) => {
   const isMobile = useMediaQuery("(max-width: 768px)");
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
               gap: 10,
               marginBottom: 32,
            }}
         >
            <div
               style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(6,182,212,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <ShieldCheck
                  style={{ width: 18, height: 18, color: "#06b6d4" }}
               />
            </div>
            <h3
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#eeeef5",
               }}
            >
               Industry Certifications
            </h3>
            <span
               style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6e6e90",
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
