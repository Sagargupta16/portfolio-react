import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import { CYAN, TEXT_PRIMARY, TEXT_MUTED } from "@/constants/theme";

interface SendConfirmationProps {
   onReset: () => void;
   senderName: string;
}

const SendConfirmation = ({ onReset, senderName }: SendConfirmationProps) => {
   const headingRef = useRef<HTMLHeadingElement>(null);

   // The form (and its focused submit button) unmounts on success, which drops
   // focus to <body>. Land it on the heading so keyboard users stay oriented
   // and screen readers read the result -- a live region that mounts already
   // populated is not reliably announced on its own. preventScroll keeps the
   // native focus jump from fighting Lenis, which owns page scrolling.
   useEffect(() => {
      headingRef.current?.focus({ preventScroll: true });
   }, []);

   return (
      <div
         className="glass-card"
         role="status"
         aria-live="polite"
         style={{
            padding: "48px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 280,
            textAlign: "center",
         }}
      >
         <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               gap: 12,
            }}
         >
            <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
               <CheckCircle size={48} style={{ color: CYAN }} />
            </motion.div>
            <h3
               ref={headingRef}
               tabIndex={-1}
               style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
               }}
            >
               Message sent!
            </h3>
            {senderName && (
               <p style={{ fontSize: 14, color: TEXT_MUTED }}>
                  Thanks, {senderName}! I'll get back to you soon.
               </p>
            )}
            <button
               type="button"
               className="btn-outline"
               onClick={onReset}
               style={{ marginTop: 8 }}
            >
               Send another message
            </button>
         </motion.div>
      </div>
   );
};

export default SendConfirmation;
