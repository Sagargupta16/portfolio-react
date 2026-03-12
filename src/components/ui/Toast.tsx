import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
   message: string;
   type?: "success" | "error";
   visible: boolean;
   onClose?: () => void;
}

const TOAST_COLORS = {
   success: {
      accent: "#22c55e",
      bg: "rgba(34, 197, 94, 0.08)",
      border: "rgba(34, 197, 94, 0.15)",
      icon: CheckCircle,
   },
   error: {
      accent: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.15)",
      icon: XCircle,
   },
};

const Toast = ({ message, type = "success", visible, onClose }: ToastProps) => {
   const config = TOAST_COLORS[type] || TOAST_COLORS.success;
   const Icon = config.icon;

   return createPortal(
      <AnimatePresence>
         {visible && (
            <motion.div
               initial={{ opacity: 0, y: 40, x: 20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, x: 20, scale: 0.95 }}
               transition={{ type: "spring", stiffness: 400, damping: 30 }}
               style={{
                  position: "fixed",
                  bottom: 32,
                  right: 32,
                  zIndex: 300,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  borderRadius: 14,
                  background: "rgba(15, 15, 35, 0.7)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: `1px solid ${config.border}`,
                  boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 20px ${config.bg}`,
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
                     color: "#eeeef5",
                     flex: 1,
                  }}
               >
                  {message}
               </span>
               {onClose && (
                  <button
                     onClick={onClose}
                     style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "none",
                        background: "rgba(255,255,255,0.05)",
                        color: "#6e6e90",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "color 0.2s",
                        flexShrink: 0,
                     }}
                     onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = "#eeeef5";
                     }}
                     onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.color = "#6e6e90";
                     }}
                     aria-label="Dismiss"
                  >
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
