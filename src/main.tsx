import App from "./App.tsx";
import "./index.css";
import { initI18next } from "./i18n/config";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

initI18next().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
