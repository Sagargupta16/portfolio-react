import { motion, type TransformProperties, type Variants } from "motion/react";
import { Send } from "lucide-react";
import useMotionPreference from "@hooks/useMotionPreference";
import { DURATION, EASING, TEXT_SECONDARY, RED } from "@/constants/theme";
import type { FormData, Status } from "./contactConstants";

interface ContactFormProps {
   // Callback ref from useContactForm: it also moves focus to the name field
   // when the form remounts after "Send another message".
   formRef: React.Ref<HTMLFormElement>;
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

/* The .btn-primary stylesheet owns the hover lift. The hover label only
   drives the arrow child; Motion writes the button transform during the
   press alone, so it never overrides the CSS lift (see passThroughTransform). */
const HOVER = "hover";
const SUBMIT_TAP = { scale: 0.97 };
const ARROW_NUDGE_PX = 3;
const ARROW_TRANSITION = { duration: DURATION.quick, ease: EASING.brisk };
const arrowVariants: Variants = { [HOVER]: { x: ARROW_NUDGE_PX } };

/* Once a whileTap settles, Motion writes transform: none inline, which beats
   the stylesheet hover lift for good. Returning the generated string as-is
   leaves the inline transform empty at rest. */
const passThroughTransform = (
   _transform: TransformProperties,
   generated: string,
) => generated;

const ContactForm = ({
   formRef,
   formData,
   isLoading,
   isMobile,
   status,
   onChange,
   onSubmit,
}: ContactFormProps) => {
   const { reducedMotion } = useMotionPreference();
   // The only programmatic validation today is the email-pattern check, so an
   // error status maps to the email field. Surface it inline + to AT.
   const emailError =
      status.type === "error" && status.field === "email" ? status.message : "";
   const hover = reducedMotion || isLoading ? undefined : HOVER;
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
            {/* .form-field draws the accent underline while its input has focus */}
            <div className="form-field">
               <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={onChange}
                  autoComplete="name"
                  maxLength={100}
                  required
                  className="form-input"
               />
            </div>
         </div>

         <div>
            <label htmlFor="contact-email" style={labelStyle}>
               Email
            </label>
            <div className="form-field">
               <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={onChange}
                  autoComplete="email"
                  maxLength={254}
                  required
                  className={`form-input${emailError ? " form-input--error" : ""}`}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={
                     emailError ? "contact-email-error" : undefined
                  }
               />
            </div>
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
            <div className="form-field">
               <textarea
                  id="contact-message"
                  name="message"
                  rows={isMobile ? 4 : 5}
                  placeholder="Tell me about your project or idea..."
                  value={formData.message}
                  onChange={onChange}
                  minLength={10}
                  maxLength={5000}
                  required
                  className="form-input"
                  style={{ resize: "vertical" }}
               />
            </div>
         </div>

         <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            aria-label={isLoading ? "Sending message..." : "Send message"}
            aria-busy={isLoading}
            whileHover={hover}
            whileFocus={hover}
            whileTap={isLoading ? undefined : SUBMIT_TAP}
            transformTemplate={passThroughTransform}
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
                  <motion.span
                     aria-hidden="true"
                     variants={arrowVariants}
                     transition={ARROW_TRANSITION}
                     style={{ display: "inline-flex" }}
                  >
                     <Send style={{ width: 16, height: 16 }} />
                  </motion.span>
                  Send Message
               </>
            )}
         </motion.button>
      </form>
   );
};

export default ContactForm;
