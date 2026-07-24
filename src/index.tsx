import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/bricolage-grotesque";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
   throw new Error("Root element #root not found. Check index.html.");
}

createRoot(rootElement).render(
   <StrictMode>
      <App />
   </StrictMode>,
);
