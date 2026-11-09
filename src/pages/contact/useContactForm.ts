import { useRef, useState, useCallback, useEffect, useReducer } from "react";
import emailjs from "@emailjs/browser";
import { getEmailConfig } from "@data/contact";
import { getSectionCopy } from "@data/sections";
import type { FormData } from "./contactConstants";
import { IDLE, sendReducer } from "./sendState";

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
   // mode="wait"), so an effect keyed on the "sent" state would run while the
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
   // One value for the whole lifecycle (sendState.ts). The sent state keeps
   // the sender's name, so the confirmation still greets them after the
   // fields are cleared.
   const [send, dispatch] = useReducer(sendReducer, IDLE);

   // Success is shown via the SendConfirmation screen, not a toast, so the only
   // toast is an error's. It stays until the user dismisses it or edits a
   // field -- no auto-dismiss timer.
   const showError = useCallback((message: string, field?: "email") => {
      dispatch({ type: "fail", message, field });
   }, []);

   useEffect(() => () => clearTimeout(clearTimerRef.current), []);

   const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setFormData((prev) => ({ ...prev, [name]: value }));
         dispatch({ type: "edit" });
      },
      [],
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

         dispatch({ type: "submit" });

         const form = formElementRef.current;
         const senderName = formData.name;
         let request = pendingSendRef.current;
         if (!request) {
            // The outcome is applied by the send itself, not by the race below,
            // so it still lands if the timer has already given up on it.
            request = emailjs
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
                        dispatch({ type: "sent", name: senderName });
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
            pendingSendRef.current = request;
         }

         try {
            await withTimeout(request, SEND_TIMEOUT_MS);
         } catch (error) {
            showError(
               error === SEND_TIMEOUT ? COPY.send_timeout : COPY.send_failed,
            );
         } finally {
            dispatch({ type: "settle" });
         }
      },
      [emailConfig, formData.email, formData.name, showError],
   );

   // The reducer only clears an error whose toast is already dismissed, so
   // this timer cannot wipe a newer error.
   const dismissToast = useCallback(() => {
      dispatch({ type: "dismiss" });
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(
         () => dispatch({ type: "clear" }),
         300,
      );
   }, []);

   const resetConfirmation = useCallback(() => {
      focusFirstFieldOnMountRef.current = true;
      dispatch({ type: "reset" });
   }, []);

   return {
      formRef,
      formData,
      send,
      handleChange,
      handleSubmit,
      dismissToast,
      resetConfirmation,
   };
};

export default useContactForm;
