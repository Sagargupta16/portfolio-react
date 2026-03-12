import { motion } from "motion/react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import type { Certification } from "@/types";
import { clipRevealUp } from "@utils/animations";

interface CertificationCardProps {
   cert: Certification;
}

const CertificationCard = ({ cert }: CertificationCardProps) => (
   <motion.div
      className="glass-card"
      style={{
         padding: "14px 20px",
         display: "flex",
         alignItems: "center",
         gap: 16,
      }}
      variants={clipRevealUp}
   >
      {cert.imageUrl ? (
         <img
            src={cert.imageUrl}
            alt={cert.name}
            loading="lazy"
            style={{
               width: 40,
               height: 40,
               borderRadius: 8,
               objectFit: "contain",
               flexShrink: 0,
               background: "rgba(255,255,255,0.03)",
            }}
         />
      ) : (
         <div
            style={{
               width: 40,
               height: 40,
               borderRadius: 8,
               background: "rgba(6,182,212,0.1)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <ShieldCheck style={{ width: 20, height: 20, color: "#06b6d4" }} />
         </div>
      )}
      <span
         style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#eeeef5",
            flex: 1,
            lineHeight: 1.4,
         }}
      >
         {cert.name}
      </span>
      {cert.level && (
         <span className="tag tag-purple" style={{ flexShrink: 0 }}>
            {cert.level}
         </span>
      )}
      {cert.badgeUrl && (
         <a
            href={cert.badgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
               color: "#06b6d4",
               flexShrink: 0,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               width: 32,
               height: 32,
               borderRadius: 8,
            }}
            title="View Badge"
         >
            <ExternalLink style={{ width: 16, height: 16 }} />
         </a>
      )}
   </motion.div>
);

export default CertificationCard;
