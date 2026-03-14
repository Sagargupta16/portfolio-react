import { useRef, useState, useCallback, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { getEmailConfig } from "@data/dataLoader";
import type { FormData, Status } from "./contactConstants";

const useContactForm = () => {
   const formRef = useRef<HTMLFormElement>(null);
   const clearTimerRef = useRef<ReturnType<typeof setTimeout>>();
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

   useEffect(() => {
      if (status.type) {
         setToastVisible(true);
         const hideTimer = setTimeout(() => {
            setToastVisible(false);
            clearTimerRef.current = setTimeout(
               () => setStatus({ type: "", message: "" }),
               300,
            );
         }, 5000);
         return () => {
            clearTimeout(hideTimer);
            clearTimeout(clearTimerRef.current);
         };
      }
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
               setShowConfirmation(true);
               setFormData({ name: "", email: "", message: "" });
               formRef.current.reset();
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
      [emailConfig],
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
      handleChange,
      handleSubmit,
      dismissToast,
      resetConfirmation,
   };
};

export default useContactForm;
