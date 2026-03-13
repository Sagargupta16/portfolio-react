import { useState } from "react";
import { Code } from "lucide-react";
import type { Variants } from "motion/react";
import type { Service } from "@/types";
import GlassCard from "@components/ui/GlassCard";
import { iconMap, ACCENT_COLORS } from "./servicesConstants";
import ServiceIconRing from "./ServiceIconRing";

interface ServiceCardProps {
   service: Service;
   index: number;
   wide?: boolean;
}

const bentoEntry: Variants = {
   hidden: { opacity: 0, y: 30, rotate: -2 },
   visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};

const ServiceCard = ({ service, index, wide = false }: ServiceCardProps) => {
   const [isHovered, setIsHovered] = useState(false);
   const IconComponent = iconMap[service.title] || Code;
   const colors = ACCENT_COLORS[index % ACCENT_COLORS.length];

   return (
      <GlassCard
         key={service.id}
         style={{
            padding: 32,
            gridColumn: wide ? "span 2" : undefined,
            position: "relative",
            overflow: "hidden",
         }}
         variants={bentoEntry}
         whileHover={{
            y: -8,
            rotate: 0,
            boxShadow: `0 12px 40px ${colors.borderHover}`,
            transition: { duration: 0.3 },
         }}
         onHoverStart={() => setIsHovered(true)}
         onHoverEnd={() => setIsHovered(false)}
      >
         {/* Accent gradient blob */}
         <div
            style={{
               position: "absolute",
               top: -20,
               right: -20,
               width: 120,
               height: 120,
               borderRadius: "50%",
               background: `radial-gradient(circle, ${colors.iconBg}, transparent 70%)`,
               pointerEvents: "none",
               opacity: isHovered ? 0.6 : 0.3,
               transition: "opacity 0.3s ease",
            }}
         />

         <ServiceIconRing color={colors.icon} isHovered={isHovered}>
            <div
               style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.iconBg,
               }}
            >
               <IconComponent
                  style={{ width: 28, height: 28, color: colors.icon }}
               />
            </div>
         </ServiceIconRing>

         <h3
            style={{
               fontSize: 18,
               fontWeight: 700,
               color: "#eeeef5",
               marginBottom: 16,
            }}
         >
            {service.title}
         </h3>

         <ul
            style={{
               display: "flex",
               flexDirection: "column",
               gap: 12,
            }}
         >
            {service.list.map((item) => (
               <li
                  key={item}
                  style={{
                     display: "flex",
                     alignItems: "flex-start",
                     gap: 12,
                     color: "#a5a5c0",
                     fontSize: 14,
                     lineHeight: 1.6,
                  }}
               >
                  <span
                     style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        marginTop: 8,
                        flexShrink: 0,
                        backgroundColor: colors.dot,
                     }}
                  />
                  {item}
               </li>
            ))}
         </ul>
      </GlassCard>
   );
};

export default ServiceCard;
