import { useMemo } from "react";
import { motion } from "motion/react";
import { getServices } from "@data/dataLoader";
import { staggerContainer } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import ServiceCard from "./ServiceCard";

const Services = () => {
   const services = useMemo(() => getServices(), []);
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <PageSection id="services" title="Services" subtitle="What I offer">
         <motion.div
            style={{
               maxWidth: 1152,
               margin: "0 auto",
               display: "grid",
               gap: 24,
               gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            }}
            variants={staggerContainer}
         >
            {services.map((service, i) => {
               const isWide = !isMobile && (i === 2 || i === 5);
               return (
                  <ServiceCard
                     key={service.id}
                     service={service}
                     index={i}
                     wide={isWide}
                  />
               );
            })}
         </motion.div>
      </PageSection>
   );
};

export default Services;
