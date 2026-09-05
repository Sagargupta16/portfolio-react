import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ContactOption } from "@/types";
import { staggerItem } from "@utils/animations";
import { TEXT_MUTED, TEXT_PRIMARY } from "@/constants/theme";
import { CONTACT_META, DEFAULT_CONTACT_META } from "./contactConstants";

interface ContactCardProps {
   option: ContactOption;
   isMobile: boolean;
}

const ContactCard = ({ option, isMobile }: ContactCardProps) => {
   const { Icon, colors } = CONTACT_META[option.icon] ?? DEFAULT_CONTACT_META;
   const opensNewTab = option.link.startsWith("https://");

   return (
      <motion.a
         href={option.link}
         target={opensNewTab ? "_blank" : undefined}
         rel={opensNewTab ? "noopener noreferrer" : undefined}
         variants={staggerItem}
         className="glass-card"
         style={{
            padding: isMobile ? "16px 16px" : "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderLeft: `3px solid ${colors.accent}`,
            borderRadius: "0 16px 16px 0",
            textDecoration: "none",
            cursor: "pointer",
         }}
         aria-label={`${option.title}: ${option.value}${opensNewTab ? " (opens in a new tab)" : ""}`}
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
                  color: TEXT_MUTED,
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
                  color: TEXT_PRIMARY,
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
