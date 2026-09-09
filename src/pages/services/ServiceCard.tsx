import type { CSSProperties } from "react";
import { ArrowRight, Code } from "lucide-react";
import type { Variants } from "motion/react";
import type { Service } from "@/types";
import useBreakpoint from "@hooks/useBreakpoint";
import useMotionPreference from "@hooks/useMotionPreference";
import useSectionNavigation from "@hooks/useSectionNavigation";
import {
   DURATION,
   EASING,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import GlassCard from "@components/ui/GlassCard";
import { iconMap, ACCENT_COLORS } from "./servicesConstants";
import ServiceAnimation from "./ServiceAnimation";

interface ServiceCardProps {
   service: Service;
   index: number;
}

const bentoEntry: Variants = {
   hidden: { opacity: 0, y: 24 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASING.cinematic },
   },
};

/* Lift only: .glass-card CSS owns the border and background shift. */
const HOVER_LIFT = {
   y: -6,
   transition: { duration: DURATION.quick, ease: EASING.brisk },
};

const ServiceCard = ({ service, index }: ServiceCardProps) => {
   const { isMobile } = useBreakpoint();
   const { reducedMotion } = useMotionPreference();
   const { navigateToSection } = useSectionNavigation();
   const colors = ACCENT_COLORS[index % ACCENT_COLORS.length];
   const IconComponent = iconMap[service.title] || Code;
   const lift = reducedMotion ? undefined : HOVER_LIFT;

   return (
      <GlassCard
         className="service-card"
         style={
            {
               "--action-accent": colors.icon,
               padding: 0,
               overflow: "hidden",
            } as CSSProperties
         }
         variants={bentoEntry}
         whileHover={lift}
         whileFocus={lift}
      >
         <div
            style={{
               display: "flex",
               flexDirection: isMobile ? "column" : "row",
               height: "100%",
            }}
         >
            {/* Left: Animation */}
            <div
               style={{
                  width: isMobile ? "100%" : 150,
                  minHeight: isMobile ? 100 : "auto",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${colors.icon}06`,
                  borderRight: isMobile ? "none" : `1px solid ${colors.icon}12`,
                  borderBottom: isMobile
                     ? `1px solid ${colors.icon}12`
                     : "none",
                  position: "relative",
                  overflow: "hidden",
               }}
            >
               <div
                  className="service-art-light"
                  style={{
                     position: "absolute",
                     inset: 0,
                     background: `radial-gradient(circle at 50% 50%, ${colors.iconBg}, transparent 70%)`,
                     pointerEvents: "none",
                  }}
               />
               <ServiceAnimation
                  title={service.title}
                  color={colors.icon}
                  compact={isMobile}
               />
            </div>

            {/* Right: Content */}
            <div
               style={{
                  flex: 1,
                  minWidth: 0,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
               }}
            >
               <h3
                  style={{
                     fontSize: 16,
                     fontWeight: 700,
                     lineHeight: 1.4,
                     color: TEXT_PRIMARY,
                     marginBottom: 12,
                     display: "flex",
                     alignItems: "center",
                     gap: 8,
                  }}
               >
                  <IconComponent
                     style={{
                        width: 16,
                        height: 16,
                        color: colors.icon,
                        flexShrink: 0,
                     }}
                  />
                  {service.title}
               </h3>

               <ul
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     flex: 1,
                     gap: 6,
                  }}
               >
                  {service.list.map((item) => (
                     <li
                        key={item}
                        style={{
                           display: "flex",
                           alignItems: "flex-start",
                           gap: 8,
                           color: TEXT_SECONDARY,
                           fontSize: 13,
                           lineHeight: 1.6,
                        }}
                     >
                        <span
                           style={{
                              width: 4,
                              height: 4,
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
               <button
                  type="button"
                  className="text-action"
                  style={{ marginTop: 12, alignSelf: "flex-start" }}
                  onClick={() => navigateToSection("contact")}
                  aria-label={`Discuss ${service.title}`}
               >
                  Let's talk
                  <ArrowRight
                     size={16}
                     className="action-arrow"
                     aria-hidden="true"
                  />
               </button>
            </div>
         </div>
      </GlassCard>
   );
};

export default ServiceCard;
