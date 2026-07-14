import { motion } from "motion/react";
import { Send } from "lucide-react";
import { TEXT_SECONDARY, RED } from "@/constants/theme";
import type { FormData, Status } from "./contactConstants";

interface ContactFormProps {
   formRef: React.RefObject<HTMLFormElement | null>;
   formData: FormData;
   isLoading: boolean;
   isMobile: boolean;
   status: Status;
   onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => void;
   onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const labelStyle: React.CSSProperties = {
   display: "block",
   fontSize: 12,
   fontWeight: 600,
   color: TEXT_SECONDARY,
   textTransform: "uppercase",
   letterSpacing: "0.05em",
   marginBottom: 8,
};

const ContactForm = ({
   formRef,
   formData,
   isLoading,
   isMobile,
   status,
   onChange,
   onSubmit,
}: ContactFormProps) => {
   // The only programmatic validation today is the email-pattern check, so an
   // error status maps to the email field. Surface it inline + to AT.
   const emailError = status.type === "error" ? status.message : "";
   return (
      <form
         ref={formRef}
         onSubmit={onSubmit}
         className="glass-card"
         style={{
            padding: isMobile ? "20px 18px" : "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
         }}
      >
         {/* Honeypot -- hidden from humans, bots fill it */}
         <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="website-hp">Website</label>
            <input
               id="website-hp"
               type="text"
               name="website"
               tabIndex={-1}
               autoComplete="off"
            />
         </div>

         <div>
            <label htmlFor="contact-name" style={labelStyle}>
               Name
            </label>
            <input
               id="contact-name"
               type="text"
               name="name"
               placeholder="John Doe"
               value={formData.name}
               onChange={onChange}
               required
               className="form-input"
            />
         </div>

         <div>
            <label htmlFor="contact-email" style={labelStyle}>
               Email
            </label>
            <input
               id="contact-email"
               type="email"
               name="email"
               placeholder="john@example.com"
               value={formData.email}
               onChange={onChange}
               required
               className={`form-input${emailError ? " form-input--error" : ""}`}
               aria-invalid={emailError ? true : undefined}
               aria-describedby={emailError ? "contact-email-error" : undefined}
            />
            {emailError && (
               <p
                  id="contact-email-error"
                  role="alert"
                  style={{
                     margin: "6px 2px 0",
                     fontSize: 12,
                     color: RED,
                  }}
               >
                  {emailError}
               </p>
            )}
         </div>

         <div>
            <label htmlFor="contact-message" style={labelStyle}>
               Message
            </label>
            <textarea
               id="contact-message"
               name="message"
               rows={isMobile ? 4 : 5}
               placeholder="Tell me about your project or idea..."
               value={formData.message}
               onChange={onChange}
               required
               className="form-input"
               style={{ resize: "vertical" }}
            />
         </div>

         <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            aria-label={isLoading ? "Sending message..." : "Send message"}
            aria-busy={isLoading}
            whileHover={isLoading ? undefined : { scale: 1.02 }}
            whileTap={isLoading ? undefined : { scale: 0.97 }}
            style={{
               width: "100%",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               gap: 8,
               opacity: isLoading ? 0.6 : 1,
               cursor: isLoading ? "not-allowed" : "pointer",
            }}
         >
            {isLoading ? (
               <div
                  aria-hidden="true"
                  style={{
                     width: 20,
                     height: 20,
                     border: "2px solid rgba(255,255,255,0.3)",
                     borderTopColor: "#fff",
                     borderRadius: "50%",
                     animation: "spin 0.7s linear infinite",
                  }}
               />
            ) : (
               <>
                  <Send style={{ width: 16, height: 16 }} />
                  Send Message
               </>
            )}
         </motion.button>
      </form>
   );
};

export default ContactForm;
