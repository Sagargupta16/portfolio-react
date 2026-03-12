import { Send } from "lucide-react";
import type { FormData } from "./contactConstants";

interface ContactFormProps {
   formRef: React.RefObject<HTMLFormElement | null>;
   formData: FormData;
   isLoading: boolean;
   isMobile: boolean;
   onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
   ) => void;
   onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const labelStyle: React.CSSProperties = {
   display: "block",
   fontSize: 12,
   fontWeight: 600,
   color: "#a5a5c0",
   textTransform: "uppercase",
   letterSpacing: "0.05em",
   marginBottom: 8,
};

const ContactForm = ({
   formRef,
   formData,
   isLoading,
   isMobile,
   onChange,
   onSubmit,
}: ContactFormProps) => (
   <form
      ref={formRef}
      onSubmit={onSubmit}
      className="glass-card"
      style={{
         padding: isMobile ? "20px 18px" : "32px 28px",
         display: "flex",
         flexDirection: "column",
         gap: 18,
      }}
   >
      {/* Honeypot -- hidden from humans, bots fill it */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
         <input type="text" name="website" tabIndex={-1} autoComplete="off" />
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
            className="form-input"
         />
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
            style={{ resize: "none" }}
         />
      </div>

      <button
         type="submit"
         disabled={isLoading}
         className="btn-primary"
         aria-label={isLoading ? "Sending message..." : "Send message"}
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
      </button>
   </form>
);

export default ContactForm;
