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
            className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{
               maxWidth: 1152,
               margin: "0 auto",
               display: "grid",
               gap: 24,
               gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(320px, 1fr))",
            }}
            variants={staggerContainer}
         >
            {services.map((service, i) => (
               <ServiceCard key={service.id} service={service} index={i} />
            ))}
         </motion.div>
      </PageSection>
   );
};

export default Services;
