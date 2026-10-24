/// <reference types="vite/client" />
import React, { type ReactNode, type ErrorInfo } from "react";
import {
   BG_PRIMARY,
   BLUE_LIGHT,
   GLASS_BORDER,
   TEXT_PRIMARY,
   TEXT_SECONDARY,
} from "@/constants/theme";
import { getUiCopy } from "@data/ui";

interface ErrorBoundaryProps {
   children: ReactNode;
   fallback?: ReactNode;
}

interface ErrorBoundaryState {
   hasError: boolean;
   error: Error | null;
   errorInfo: ErrorInfo | null;
}

const CONTAINER_STYLE: React.CSSProperties = {
   padding: "24px",
   textAlign: "center",
   background: "var(--color-bg-card)",
   border: `1px solid ${GLASS_BORDER}`,
   borderRadius: 12,
   margin: "20px",
   color: TEXT_PRIMARY,
};

const DETAILS_STYLE: React.CSSProperties = {
   whiteSpace: "pre-wrap",
   textAlign: "left",
   marginTop: "20px",
   color: TEXT_SECONDARY,
};

const BUTTON_STYLE: React.CSSProperties = {
   marginTop: "16px",
   padding: "8px 20px",
   background: BLUE_LIGHT,
   color: BG_PRIMARY,
   border: "none",
   borderRadius: 10,
   cursor: "pointer",
   fontWeight: 600,
};

class ErrorBoundary extends React.Component<
   ErrorBoundaryProps,
   ErrorBoundaryState
> {
   constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false, error: null, errorInfo: null };
   }

   static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
      return { hasError: true };
   }

   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      this.setState({ error, errorInfo });
      if (import.meta.env.DEV) {
         console.error("Error caught by boundary:", error, errorInfo);
      }
   }

   handleReload = () => globalThis.location.reload();

   render() {
      if (this.state.hasError) {
         if (this.props.fallback) {
            return this.props.fallback;
         }

         const copy = getUiCopy().error;
         return (
            <div style={CONTAINER_STYLE} role="alert">
               <h2>{copy.title}</h2>
               <p>{copy.body}</p>
               {import.meta.env.DEV && (
                  <details style={DETAILS_STYLE}>
                     <summary>Error Details (Development Only)</summary>
                     {this.state.error?.toString()}
                     <br />
                     {this.state.errorInfo?.componentStack}
                  </details>
               )}
               <button
                  onClick={this.handleReload}
                  aria-label={copy.refresh_label}
                  style={BUTTON_STYLE}
               >
                  {copy.refresh}
               </button>
            </div>
         );
      }

      return this.props.children;
   }
}

export default ErrorBoundary;
