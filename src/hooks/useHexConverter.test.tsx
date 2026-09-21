import { createInstance } from "i18next";
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { useHexConverter } from "./useHexConverter";
import en from "../i18n/locales/en/translation.json";
import ja from "../i18n/locales/ja/translation.json";
import ko from "../i18n/locales/ko/translation.json";

it.each([
  { locale: "ja-JP", language: "ja", hex: "80", text: "ア" },
  { locale: "ko-KR", language: "ko", hex: "01 01", text: "가" },
  { locale: "en-US", language: "en", hex: "80", text: "A" },
  { locale: "zh-CN", language: "en", hex: "80", text: "A" },
  { locale: "ja", language: "ja", hex: "80", text: "ア" },
])(
  "uses the resolved language consistently for $locale",
  async ({ locale, language, hex, text }) => {
    const i18n = createInstance();
    await i18n.init({
      lng: locale,
      fallbackLng: "en",
      resources: {
        en: { translation: en },
        ja: { translation: ja },
        ko: { translation: ko },
      },
    });

    // Render-phase updates exercise real hook state without adding a DOM dependency.
    const Probe = () => {
      const converter = useHexConverter();
      const [step, setStep] = useState(0);
      expect(converter.language).toBe(language);
      if (step === 0) {
        converter.updateFromHex(hex);
        setStep(1);
      } else if (step === 1) {
        expect(converter.text).toBe(text);
        converter.updateFromText(text);
        setStep(2);
      } else {
        expect(converter.hex).toBe(hex);
      }
      return null;
    };

    renderToStaticMarkup(
      <I18nextProvider i18n={i18n}>
        <Probe />
      </I18nextProvider>,
    );
    expect(i18n.resolvedLanguage).toBe(language);
  },
);
