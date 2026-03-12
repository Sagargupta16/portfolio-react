import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ContactOption } from "@/types";
import { staggerItem } from "@utils/animations";
import { getContactMeta } from "./contactConstants";

interface ContactCardProps {
   option: ContactOption;
   isMobile: boolean;
}

const ContactCard = ({ option, isMobile }: ContactCardProps) => {
   const { Icon, colors } = getContactMeta(option.title);

   return (
      <motion.a
         href={option.link}
         target="_blank"
         rel="noopener noreferrer"
         variants={staggerItem}
         className="glass-card"
         style={{
            padding: isMobile ? "16px 14px" : "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            borderLeft: `3px solid ${colors.accent}`,
            borderRadius: "0 16px 16px 0",
            textDecoration: "none",
            cursor: "pointer",
         }}
         aria-label={`${option.title}: ${option.value}`}
      >
         <div
            style={{
               width: 44,
               height: 44,
               borderRadius: 12,
               background: colors.bg,
               border: `1px solid ${colors.border}`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
            }}
         >
            <Icon
               style={{
                  width: 20,
                  height: 20,
                  color: colors.accent,
               }}
            />
         </div>
         <div style={{ minWidth: 0, flex: 1 }}>
            <p
               style={{
                  color: "#6e6e90",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
               }}
            >
               {option.title}
            </p>
            <p
               style={{
                  color: "#eeeef5",
                  fontSize: isMobile ? 13 : 14,
                  fontWeight: 500,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
               }}
            >
               {option.value}
            </p>
         </div>
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 4,
               color: colors.accent,
               fontSize: 12,
               fontWeight: 500,
               flexShrink: 0,
               whiteSpace: "nowrap",
            }}
         >
            {!isMobile && option.message}
            <ArrowUpRight style={{ width: 14, height: 14 }} />
         </div>
      </motion.a>
   );
};

export default ContactCard;
