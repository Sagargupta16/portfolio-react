import { motion, AnimatePresence } from "motion/react";
import { UserPlus } from "lucide-react";
import Toast from "@components/ui/Toast";
import { getContactOptions } from "@data/contact";
import { rotateInUp, staggerContainer, staggerItem } from "@utils/animations";
import { MAX_WIDTH_FORM, TEXT_MUTED } from "@/constants/theme";
import useBreakpoint from "@hooks/useBreakpoint";
import PageSection from "@components/layout/PageSection";
import ContactCard from "./ContactCard";
import ContactForm from "./ContactForm";
import SendConfirmation from "./SendConfirmation";
import useContactForm from "./useContactForm";

// Generated at the site root by the build, so it follows the deploy base path.
const VCARD_HREF = `${import.meta.env.BASE_URL}sagar-gupta.vcf`;

const Contact = () => {
   const { isMobile } = useBreakpoint();
   const contactOptions = getContactOptions();

   const {
      formRef,
      formData,
      status,
      isLoading,
      toastVisible,
      showConfirmation,
      sentName,
      handleChange,
      handleSubmit,
      dismissToast,
      resetConfirmation,
   } = useContactForm();

   return (
      <PageSection
         id="contact"
         title="Let's *talk*"
         subtitle="Send a note or book a call"
         maxWidth={MAX_WIDTH_FORM}
      >
         <motion.div
            style={{
               maxWidth: MAX_WIDTH_FORM,
               margin: "0 auto",
               display: "grid",
               gap: isMobile ? 24 : 32,
               gridTemplateColumns: isMobile ? "1fr" : "2fr 3fr",
            }}
            variants={staggerContainer}
         >
            {/* Contact Options - Left Column */}
            <motion.div
               style={{ display: "flex", flexDirection: "column", gap: 12 }}
               variants={staggerContainer}
            >
               {contactOptions.map((option) => (
                  <ContactCard
                     key={option.id}
                     option={option}
                     isMobile={isMobile}
                  />
               ))}

               {/* One tap drops a vCard into the phone's contacts app */}
               <motion.div
                  variants={staggerItem}
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     alignItems: isMobile ? "stretch" : "flex-start",
                     gap: 6,
                     marginTop: 4,
                  }}
               >
                  <a
                     href={VCARD_HREF}
                     download="sagar-gupta.vcf"
                     className="btn-outline"
                     aria-describedby="contact-vcard-hint"
                     style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        minHeight: 44,
                        padding: "8px 16px",
                        fontSize: 14,
                        textDecoration: "none",
                     }}
                  >
                     <UserPlus
                        aria-hidden="true"
                        style={{ width: 16, height: 16 }}
                     />
                     Save contact card
                  </a>
                  <p
                     id="contact-vcard-hint"
                     style={{
                        fontSize: 12,
                        color: TEXT_MUTED,
                        textAlign: isMobile ? "center" : "left",
                     }}
                  >
                     Adds me to your phone&apos;s contacts
                  </p>
               </motion.div>
            </motion.div>

            {/* Contact Form - Right Column */}
            <motion.div variants={rotateInUp}>
               <AnimatePresence mode="wait">
                  {showConfirmation ? (
                     <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                     >
                        <SendConfirmation
                           onReset={resetConfirmation}
                           senderName={sentName}
                        />
                     </motion.div>
                  ) : (
                     <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                     >
                        <ContactForm
                           formRef={formRef}
                           formData={formData}
                           isLoading={isLoading}
                           isMobile={isMobile}
                           status={status}
                           onChange={handleChange}
                           onSubmit={handleSubmit}
                        />
                     </motion.div>
                  )}
               </AnimatePresence>

               <Toast
                  message={status.message || ""}
                  type="error"
                  visible={toastVisible}
                  onClose={dismissToast}
               />
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Contact;
