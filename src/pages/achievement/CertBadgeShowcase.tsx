import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { fadeInUp } from "@utils/animations";
import type { Certification } from "@/types";
import { CYAN } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import { isCertActive, sortActiveFirst } from "@utils/certStatus";
import CertBadge from "./CertBadge";

interface CertBadgeShowcaseProps {
   certifications: Certification[];
}

const CertBadgeShowcase = ({ certifications }: CertBadgeShowcaseProps) => {
   const { isMobile } = useBreakpoint();
   const badgeSize = isMobile ? 90 : 120;
   // Expired badges stay visible (with their Expired tag) but go last, and the
   // heading count only covers the active ones.
   const ordered = sortActiveFirst(certifications);
   const activeCount = certifications.filter((c) => isCertActive(c)).length;

   return (
      <div>
         <motion.div
            className="subsection-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            variants={fadeInUp}
         >
            <ShieldCheck size={22} style={{ color: CYAN }} aria-hidden="true" />
            <h3>Industry Certifications</h3>
            <span className="subsection-count" title={`${activeCount} active`}>
               {activeCount}
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
            {ordered.map((cert, i) => (
               <CertBadge
                  key={cert.badgeId}
                  name={cert.name}
                  imageUrl={cert.imageUrl}
                  badgeUrl={cert.badgeUrl}
                  level={cert.level}
                  expiryDate={cert.expiryDate}
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
