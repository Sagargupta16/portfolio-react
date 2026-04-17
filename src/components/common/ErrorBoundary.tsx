/// <reference types="vite/client" />
import React, { type ReactNode, type ErrorInfo } from "react";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";

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
   background: "rgba(15, 15, 30, 0.85)",
   border: "1px solid rgba(255, 255, 255, 0.08)",
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
   background: CYAN,
   color: "#0a0a1a",
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

         return (
            <div style={CONTAINER_STYLE} role="alert">
               <h2>Something went wrong</h2>
               <p>
                  Sorry for the inconvenience. Try refreshing the page to
                  continue.
               </p>
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
                  aria-label="Refresh the page"
                  style={BUTTON_STYLE}
               >
                  Refresh Page
               </button>
            </div>
         );
      }

      return this.props.children;
   }
}

export default ErrorBoundary;
