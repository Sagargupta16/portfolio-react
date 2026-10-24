import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { GREEN, RED, TEXT_PRIMARY, TEXT_MUTED } from "@/constants/theme";
import { getUiCopy } from "@data/ui";

interface ToastProps {
   message: string;
   type?: "success" | "error";
   visible: boolean;
   onClose?: () => void;
}

const TOAST_COLORS = {
   success: {
      accent: GREEN,
      border: "rgb(var(--ch-green) / 0.15)",
      icon: CheckCircle,
   },
   error: {
      accent: RED,
      border: "rgb(var(--ch-red) / 0.15)",
      icon: XCircle,
   },
};

// Grows the 24px dismiss button's hit area to 44px without changing how it
// looks; the toast's 12px vertical padding and gap leave room for it.
const DISMISS_HIT_AREA: React.CSSProperties = {
   position: "absolute",
   inset: -10,
};

const Toast = ({ message, type = "success", visible, onClose }: ToastProps) => {
   const config = TOAST_COLORS[type] || TOAST_COLORS.success;
   const Icon = config.icon;

   return createPortal(
      <AnimatePresence>
         {visible && (
            <motion.div
               role={type === "error" ? "alert" : "status"}
               aria-live={type === "error" ? undefined : "polite"}
               initial={{ opacity: 0, y: 40, x: 20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
               transition={{ type: "spring", stiffness: 400, damping: 30 }}
               style={{
                  position: "fixed",
                  bottom: 88,
                  right: 32,
                  zIndex: 300,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 20px",
                  borderRadius: 12,
                  background: "rgb(var(--ch-glass) / 0.7)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: `1px solid ${config.border}`,
                  boxShadow: "0 10px 40px rgb(var(--ch-black) / 0.4)",
                  maxWidth: 360,
                  minWidth: 240,
               }}
            >
               <Icon
                  style={{
                     width: 20,
                     height: 20,
                     color: config.accent,
                     flexShrink: 0,
                  }}
               />
               <span
                  style={{
                     fontSize: 14,
                     fontWeight: 500,
                     color: TEXT_PRIMARY,
                     flex: 1,
                  }}
               >
                  {message}
               </span>
               {onClose && (
                  <button
                     onClick={onClose}
                     style={{
                        position: "relative",
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "none",
                        background: "rgb(var(--ch-white) / 0.05)",
                        color: TEXT_MUTED,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 0.2s",
                        flexShrink: 0,
                     }}
                     onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = TEXT_PRIMARY;
                     }}
                     onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = TEXT_MUTED;
                     }}
                     aria-label={getUiCopy().toast_dismiss}
                  >
                     <span aria-hidden="true" style={DISMISS_HIT_AREA} />
                     <X size={14} />
                  </button>
               )}
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

export default Toast;
