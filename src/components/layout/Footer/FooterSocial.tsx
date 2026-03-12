import { useMemo } from "react";
import { motion } from "motion/react";
import { getSocialProfiles } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import ICON_MAP from "@utils/iconMap";

const FooterSocial = () => {
   const socialProfiles = useMemo(() => getSocialProfiles(), []);

   return (
      <motion.div
         style={{ display: "flex", alignItems: "center", gap: 12 }}
         variants={staggerItem}
      >
         {socialProfiles.map((profile) => {
            const IconComponent = ICON_MAP[profile.icon];
            if (!IconComponent) return null;
            return (
               <motion.a
                  key={profile.id}
                  href={profile.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                     width: 36,
                     height: 36,
                     borderRadius: 8,
                     border: "1px solid rgba(255, 255, 255, 0.06)",
                     background: "rgba(255, 255, 255, 0.03)",
                     backdropFilter: "blur(12px)",
                     WebkitBackdropFilter: "blur(12px)",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: "#a5a5c0",
                     transition: "all 0.3s",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                     e.currentTarget.style.color = "#06b6d4";
                     e.currentTarget.style.borderColor =
                        "rgba(6, 182, 212, 0.3)";
                     e.currentTarget.style.background =
                        "rgba(6, 182, 212, 0.08)";
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                     e.currentTarget.style.color = "#a5a5c0";
                     e.currentTarget.style.borderColor =
                        "rgba(255, 255, 255, 0.06)";
                     e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.03)";
                  }}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Visit ${profile.name} profile`}
               >
                  <IconComponent size={16} />
               </motion.a>
            );
         })}
      </motion.div>
   );
};

export default FooterSocial;
