import { useMemo } from "react";
import { motion } from "motion/react";
import { getSectionCopy } from "@data/sections";
import { getServices } from "@data/services";
import { staggerContainer } from "@utils/animations";
import { MAX_WIDTH } from "@/constants/theme";
import PageSection from "@components/layout/PageSection";
import ServiceCard from "./ServiceCard";
import "./services.css";

const Services = () => {
   const services = useMemo(() => getServices(), []);
   const { title, subtitle } = getSectionCopy("services");

   return (
      <PageSection id="services" title={title} subtitle={subtitle}>
         <motion.div
            className="service-grid"
            style={{
               maxWidth: MAX_WIDTH,
               margin: "0 auto",
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
