import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import type { Certification } from "@/types";
import { staggerContainer } from "@utils/animations";
import SectionTitle from "./SectionTitle";
import CertificationCard from "./CertificationCard";

interface CertificationsSectionProps {
   certifications: Certification[];
}

const CertificationsSection = ({
   certifications,
}: CertificationsSectionProps) => {
   if (certifications.length === 0) return null;

   return (
      <div>
         <SectionTitle
            icon={
               <ShieldCheck
                  style={{ width: 18, height: 18, color: "#06b6d4" }}
               />
            }
            iconBg="rgba(6,182,212,0.1)"
            label="Certifications"
            count={certifications.length}
         />
         <motion.div
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
            variants={staggerContainer}
         >
            {certifications.map((cert) => (
               <CertificationCard key={cert.badgeId} cert={cert} />
            ))}
         </motion.div>
      </div>
   );
};

export default CertificationsSection;
