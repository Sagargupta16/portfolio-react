import { useRef, useState, useCallback, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { getEmailConfig } from "@data/contact";
import { getSectionCopy } from "@data/sections";
import type { FormData, Status } from "./contactConstants";

const COPY = getSectionCopy("contact").form;

// EmailJS takes no abort signal, so a stalled request is raced against a
// timer: the spinner and the disabled Send button give way to a message
// instead of hanging. The request itself is left to finish or fail, and its
// real outcome replaces that message when it lands (a send that was only slow
// still ends on the confirmation). While it is unsettled it is kept in
// pendingSendRef, so a retry waits for it instead of mailing the message twice.
const SEND_TIMEOUT_MS = 15_000;
const SEND_TIMEOUT = new Error("EmailJS send timed out");

const withTimeout = <T>(work: Promise<T>, ms: number): Promise<T> => {
   let timer: ReturnType<typeof setTimeout> | undefined;
   const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(SEND_TIMEOUT), ms);
   });
   return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
};

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
   const pendingSendRef = useRef<Promise<void> | null>(null);
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
      // A dismissal's pending clear must not wipe this newer error.
      clearTimeout(clearTimerRef.current);
      setStatus({ type: "error", message, field });
      setToastVisible(true);
   }, []);

   useEffect(() => () => clearTimeout(clearTimerRef.current), []);

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

         // type="email" has already applied the WHATWG rule. The pattern keeps
         // that rule's characters and adds one check: a dotted domain, so a
         // typo like john@gmail is caught before it costs a reply.
         if (emailConfig.validation_pattern) {
            const pattern = new RegExp(emailConfig.validation_pattern);
            if (!pattern.test(formData.email)) {
               showError(COPY.invalid_email, "email");
               return;
            }
         }

         setIsLoading(true);
         setStatus({ type: "", message: "" });
         setToastVisible(false);

         const form = formElementRef.current;
         const senderName = formData.name;
         let send = pendingSendRef.current;
         if (!send) {
            // The outcome is applied by the send itself, not by the race below,
            // so it still lands if the timer has already given up on it.
            send = emailjs
               .sendForm(
                  emailConfig.service_id,
                  emailConfig.template_id,
                  form,
                  {
                     publicKey: emailConfig.public_key,
                  },
               )
               .then(
                  (result) => {
                     if (result.status === 200) {
                        setSentName(senderName);
                        setShowConfirmation(true);
                        setFormData({ name: "", email: "", message: "" });
                        form.reset();
                     } else {
                        // EmailJS resolved with a non-200 status -- surface it
                        // instead of silently doing nothing.
                        showError(COPY.send_failed);
                     }
                  },
                  () => showError(COPY.send_failed),
               )
               .finally(() => {
                  pendingSendRef.current = null;
               });
            pendingSendRef.current = send;
         }

         try {
            await withTimeout(send, SEND_TIMEOUT_MS);
         } catch (error) {
            showError(
               error === SEND_TIMEOUT ? COPY.send_timeout : COPY.send_failed,
            );
         } finally {
            setIsLoading(false);
         }
      },
      [emailConfig, formData.email, formData.name, showError],
   );

   const dismissToast = useCallback(() => {
      setToastVisible(false);
      clearTimeout(clearTimerRef.current);
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
