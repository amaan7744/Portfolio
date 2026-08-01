import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import App from "./App.jsx";

const root = document.getElementById("root");
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// If the page already has prerendered markup (from scripts/prerender.mjs),
// hydrate it instead of re-rendering from scratch — keeps first paint fast
// and avoids a content flash for crawlers and real visitors alike.
if (root.hasChildNodes()) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
