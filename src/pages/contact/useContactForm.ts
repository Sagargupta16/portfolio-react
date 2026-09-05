import { useRef, useState, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { getEmailConfig } from "@data/contact";
import type { FormData, Status } from "./contactConstants";

const useContactForm = () => {
   const formElementRef = useRef<HTMLFormElement>(null);
   // Armed by resetConfirmation, consumed the next time the form mounts. The
   // form only remounts after the confirmation's exit animation (AnimatePresence
   // mode="wait"), so an effect keyed on showConfirmation would run while the
   // form is still absent; the ref callback is the one hook that fires on mount.
   const focusFirstFieldOnMountRef = useRef(false);
   const formRef = useCallback((node: HTMLFormElement | null) => {
      formElementRef.current = node;
      if (!node || !focusFirstFieldOnMountRef.current) return;
      focusFirstFieldOnMountRef.current = false;
      node
         .querySelector<HTMLInputElement>('input[name="name"]')
         ?.focus({ preventScroll: true });
   }, []);
   const clearTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined,
   );
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

   // Success is shown via the SendConfirmation screen, not a toast, so the only
   // toast path is errors. The toast is raised in the handlers alongside the
   // error status (not via an effect mirroring status.type) and stays until the
   // user dismisses it or edits a field -- no auto-dismiss timer.
   const showError = useCallback((message: string, field?: "email") => {
      setStatus({ type: "error", message, field });
      setToastVisible(true);
   }, []);

   const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setFormData((prev) => ({ ...prev, [name]: value }));
         if (status.message) setStatus({ type: "", message: "" });
         if (toastVisible) setToastVisible(false);
      },
      [status.message, toastVisible],
   );

   const handleSubmit = useCallback(
      async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault();

         const honeypot =
            formElementRef.current?.querySelector<HTMLInputElement>(
               '[name="website"]',
            );
         if (honeypot?.value) return;
         if (!formElementRef.current) return;

         if (emailConfig.validation_pattern) {
            const pattern = new RegExp(emailConfig.validation_pattern);
            if (!pattern.test(formData.email)) {
               showError("Please enter a valid email address.", "email");
               return;
            }
         }

         setIsLoading(true);
         setStatus({ type: "", message: "" });

         try {
            const result = await emailjs.sendForm(
               emailConfig.service_id,
               emailConfig.template_id,
               formElementRef.current,
               emailConfig.public_key,
            );

            if (result.status === 200) {
               setSentName(formData.name);
               setShowConfirmation(true);
               setFormData({ name: "", email: "", message: "" });
               formElementRef.current.reset();
            } else {
               // EmailJS resolved with a non-200 status -- surface it instead of
               // silently doing nothing.
               showError("Failed to send message. Please try again.");
            }
         } catch {
            showError("Failed to send message. Please try again.");
         } finally {
            setIsLoading(false);
         }
      },
      [emailConfig, formData.email, formData.name, showError],
   );

   const dismissToast = useCallback(() => {
      setToastVisible(false);
      clearTimerRef.current = setTimeout(
         () => setStatus({ type: "", message: "" }),
         300,
      );
   }, []);

   const resetConfirmation = useCallback(() => {
      focusFirstFieldOnMountRef.current = true;
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
