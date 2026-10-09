import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// opsz builds: the optical-size axis gives big headlines the display cut
// instead of a scaled-up text cut (font-optical-sizing is on in index.css).
import "@fontsource-variable/inter/opsz.css";
import "@fontsource-variable/geist-mono";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
// Accent face: one italic serif word per headline (.accent-serif) only.
import "@fontsource/instrument-serif/latin-400-italic.css";
// Signature face: intro splash, the hero name and the footer wordmark only.
import "@fontsource/yellowtail/latin-400.css";
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
