import type { ReactNode } from "react";
import useReducedMotion from "@utils/useReducedMotion";

interface ServiceIconRingProps {
   color: string;
   children: ReactNode;
   isHovered: boolean;
}

const ServiceIconRing = ({
   color,
   children,
   isHovered,
}: ServiceIconRingProps) => {
   const reducedMotion = useReducedMotion();

   return (
      <div
         style={{
            position: "relative",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
         }}
      >
         {/* Inner ring */}
         <div
            style={{
               position: "absolute",
               width: 44,
               height: 44,
               borderRadius: "50%",
               border: `1px solid ${color}${isHovered ? "30" : "15"}`,
               animation: reducedMotion
                  ? "none"
                  : "ring-pulse 3s ease-in-out infinite",
               transition: "border-color 0.3s ease",
            }}
         />
         {/* Outer ring */}
         <div
            style={{
               position: "absolute",
               width: 60,
               height: 60,
               borderRadius: "50%",
               border: `1px solid ${color}${isHovered ? "18" : "08"}`,
               animation: reducedMotion
                  ? "none"
                  : "ring-pulse 3s ease-in-out infinite 1.5s",
               transition: "border-color 0.3s ease",
            }}
         />
         {children}
      </div>
   );
};

export default ServiceIconRing;
