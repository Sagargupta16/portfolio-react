import { motion } from "motion/react";
import Toast from "@components/ui/Toast";
import { getContactOptions } from "@data/dataLoader";
import { rotateInUp, staggerContainer } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";
import useContactForm from "./useContactForm";

const Contact = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const contactOptions = getContactOptions();

   const {
      formRef,
      formData,
      status,
      isLoading,
      toastVisible,
      handleChange,
      handleSubmit,
      dismissToast,
   } = useContactForm();

   return (
      <PageSection
         id="contact"
         title="Get In Touch"
         subtitle="Let's work together"
      >
         <motion.div
            style={{
               maxWidth: 896,
               margin: "0 auto",
               display: "grid",
               gap: isMobile ? 24 : 32,
               gridTemplateColumns: isMobile ? "1fr" : "2fr 3fr",
            }}
            variants={staggerContainer}
         >
            {/* Contact Options - Left Column */}
            <motion.div
               style={{ display: "flex", flexDirection: "column", gap: 14 }}
               variants={staggerContainer}
            >
               {contactOptions.map((option) => (
                  <ContactCard
                     key={option.id}
                     option={option}
                     isMobile={isMobile}
                  />
               ))}
            </motion.div>

            {/* Contact Form - Right Column */}
            <motion.div variants={rotateInUp}>
               <ContactForm
                  formRef={formRef}
                  formData={formData}
                  isLoading={isLoading}
                  isMobile={isMobile}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
               />

               <Toast
                  message={status.message || ""}
                  type={(status.type || "success") as "success" | "error"}
                  visible={toastVisible}
                  onClose={dismissToast}
               />
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Contact;
