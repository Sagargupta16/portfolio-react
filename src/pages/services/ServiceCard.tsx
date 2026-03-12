import { Code } from "lucide-react";
import type { Service } from "@/types";
import { flipInY } from "@utils/animations";
import GlassCard from "@components/ui/GlassCard";
import { iconMap, ACCENT_COLORS } from "./servicesConstants";

interface ServiceCardProps {
   service: Service;
   index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
   const IconComponent = iconMap[service.title] || Code;
   const colors = ACCENT_COLORS[index % ACCENT_COLORS.length];

   return (
      <GlassCard key={service.id} style={{ padding: 32 }} variants={flipInY}>
         <div
            style={{
               width: 56,
               height: 56,
               borderRadius: 12,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               marginBottom: 20,
               backgroundColor: colors.iconBg,
            }}
         >
            <IconComponent
               style={{ width: 28, height: 28, color: colors.icon }}
            />
         </div>

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
