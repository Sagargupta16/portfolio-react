import { motion } from "motion/react";
import { GREEN, MONO_FONT, TEXT_SECONDARY } from "@/constants/theme";
import { bentoCellItem } from "@utils/animations";

interface StatusBadgeProps {
   statusText: string;
}

const StatusBadge = ({ statusText }: StatusBadgeProps) => (
   <motion.div
      variants={bentoCellItem}
      className="glass-card"
      style={{
         padding: "14px 18px",
         borderLeft: `3px solid ${GREEN}`,
         display: "flex",
         alignItems: "center",
         gap: 10,
      }}
   >
      <span
         className="animate-glow-pulse"
         style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: GREEN,
            display: "inline-block",
            flexShrink: 0,
         }}
      />
      <div>
         <p
            style={{
               fontFamily: MONO_FONT,
               color: GREEN,
               fontSize: 12,
               fontWeight: 600,
               lineHeight: 1.2,
            }}
         >
            {statusText}
         </p>
         <p
            style={{
               color: TEXT_SECONDARY,
               fontSize: 11,
               marginTop: 2,
            }}
         >
            Available for collaboration
         </p>
      </div>
   </motion.div>
);

export default StatusBadge;
