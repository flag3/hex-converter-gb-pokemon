import App from "./App.tsx";
import "./index.css";
import { initI18next } from "./i18n/config";
import "@primer/primitives/dist/css/functional/typography/typography.css";
import "@primer/primitives/dist/css/functional/themes/light.css";
import "@primer/primitives/dist/css/functional/themes/dark.css";
import { BaseStyles, ThemeProvider } from "@primer/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

void initI18next().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider colorMode="auto">
        <BaseStyles>
          <App />
        </BaseStyles>
      </ThemeProvider>
    </StrictMode>,
  );
});
