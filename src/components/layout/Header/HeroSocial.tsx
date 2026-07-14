import { useMemo } from "react";
import { motion } from "motion/react";
import { getSocialProfiles } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import { TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";
import ICON_MAP from "@utils/iconMap";

const HeroSocial = () => {
   const socialProfiles = useMemo(() => getSocialProfiles(), []);

   return (
      <motion.div
         className="flex items-center gap-3 mt-2"
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
                     width: 40,
                     height: 40,
                     borderRadius: 10,
                     border: "1px solid rgba(255, 255, 255, 0.08)",
                     background: "rgba(255, 255, 255, 0.04)",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     color: TEXT_SECONDARY,
                     transition: "all 0.3s",
                  }}
                  whileHover={{
                     scale: 1.1,
                     y: -3,
                     color: TEXT_PRIMARY,
                     borderColor: "rgba(255, 255, 255, 0.2)",
                     background: "rgba(255, 255, 255, 0.08)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Visit ${profile.name} profile`}
               >
                  <IconComponent size={18} />
               </motion.a>
            );
         })}
      </motion.div>
   );
};

export default HeroSocial;
