import { motion } from "motion/react";
import { fadeInUp } from "@utils/animations";

const SectionIcon = ({
   bg,
   children,
}: {
   bg: string;
   children: React.ReactNode;
}) => (
   <div
      style={{
         width: 36,
         height: 36,
         borderRadius: 10,
         background: bg,
         display: "flex",
         alignItems: "center",
         justifyContent: "center",
      }}
   >
      {children}
   </div>
);

interface SectionTitleProps {
   icon: React.ReactNode;
   iconBg: string;
   label: string;
   count: number;
}

const SectionTitle = ({ icon, iconBg, label, count }: SectionTitleProps) => (
   <motion.h3
      style={{
         fontSize: 20,
         fontWeight: 700,
         color: "#eeeef5",
         marginBottom: 24,
         display: "flex",
         alignItems: "center",
         gap: 12,
      }}
      variants={fadeInUp}
   >
      <SectionIcon bg={iconBg}>{icon}</SectionIcon>
      {label}
      <span
         style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#6e6e90",
            marginLeft: 4,
         }}
      >
         ({count})
      </span>
   </motion.h3>
);

export default SectionTitle;
