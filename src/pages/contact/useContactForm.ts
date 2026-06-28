import { useRef, useState, useCallback, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { getEmailConfig } from "@data/dataLoader";
import type { FormData, Status } from "./contactConstants";

const useContactForm = () => {
   const formRef = useRef<HTMLFormElement>(null);
   const clearTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
   const emailConfig = getEmailConfig();

   const [formData, setFormData] = useState<FormData>({
      name: "",
      email: "",
      message: "",
   });
   const [status, setStatus] = useState<Status>({ type: "", message: "" });
   const [isLoading, setIsLoading] = useState(false);
   const [toastVisible, setToastVisible] = useState(false);
   const [showConfirmation, setShowConfirmation] = useState(false);
   // Preserve the sender's name across the form reset so the success screen can
   // still greet them -- formData is cleared in the same batch as showConfirmation.
   const [sentName, setSentName] = useState("");

   useEffect(() => {
      // Success is shown via the SendConfirmation screen, not a toast, so the
      // only toast path is errors. Errors carry recovery instructions, so they
      // stay until the user dismisses or edits a field (no auto-dismiss timer).
      if (status.type === "error") setToastVisible(true);
   }, [status.type]);

   const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setFormData((prev) => ({ ...prev, [name]: value }));
         if (status.message) setStatus({ type: "", message: "" });
      },
      [status.message],
   );

   const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault();

         const honeypot =
            formRef.current?.querySelector<HTMLInputElement>(
               '[name="website"]',
            );
         if (honeypot?.value) return;
         if (!formRef.current) return;

         if (emailConfig.validation_pattern) {
            const pattern = new RegExp(emailConfig.validation_pattern);
            if (!pattern.test(formData.email)) {
               setStatus({
                  type: "error",
                  message: "Please enter a valid email address.",
               });
               return;
            }
         }

         setIsLoading(true);
         setStatus({ type: "", message: "" });

         try {
            const result = await emailjs.sendForm(
               emailConfig.service_id,
               emailConfig.template_id,
               formRef.current,
               emailConfig.public_key,
            );

            if (result.status === 200) {
               setSentName(formData.name);
               setShowConfirmation(true);
               setFormData({ name: "", email: "", message: "" });
               formRef.current.reset();
            } else {
               // EmailJS resolved with a non-200 status -- surface it instead of
               // silently doing nothing.
               setStatus({
                  type: "error",
                  message: "Failed to send message. Please try again.",
               });
            }
         } catch {
            setStatus({
               type: "error",
               message: "Failed to send message. Please try again.",
            });
         } finally {
            setIsLoading(false);
         }
      },
      [emailConfig, formData.email, formData.name],
   );

   const dismissToast = useCallback(() => {
      setToastVisible(false);
      clearTimerRef.current = setTimeout(
         () => setStatus({ type: "", message: "" }),
         300,
      );
   }, []);

   const resetConfirmation = useCallback(() => {
      setShowConfirmation(false);
   }, []);

   return {
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
   };
};

export default useContactForm;
