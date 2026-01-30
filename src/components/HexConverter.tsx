import "./../App.css";
import { useHexConverter } from "./../hooks/useHexConverter";
import type { Generation, SelectorOption } from "./../types";
import { InputArea } from "./InputArea";
import { ResetButton } from "./ResetButton";
import { Selector } from "./Selector";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

export const HexConverter = () => {
  const { t, i18n } = useTranslation();
  const {
    gen,
    setGen,
    text,
    hex,
    program,
    updateFromText,
    updateFromHex,
    updateFromProgram,
    reset,
  } = useHexConverter();

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateFromText(event.target.value);
  };

  const handleHexChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateFromHex(event.target.value);
  };

  const handleProgramChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateFromProgram(event.target.value);
  };

  return (
    <div>
      <h2>{t("title")}</h2>
      <Selector
        label={t("language")}
        value={i18n.language}
        options={languageOptions}
        onChange={(event) => i18n.changeLanguage(event.target.value)}
      />
      {i18n.language !== "ko" && (
        <Selector
          label={t("gen")}
          value={gen}
          options={generationOptions}
          onChange={(event) => setGen(event.target.value as Generation)}
        />
      )}
      <div className="input-container">
        <InputArea label={t("text")} value={text} onChange={handleTextChange} />
        <InputArea label={t("hex")} value={hex} onChange={handleHexChange} />
        <InputArea label={t("program")} value={program} onChange={handleProgramChange} />
      </div>
      <ResetButton onClick={reset} />
    </div>
  );
};

const languageOptions: SelectorOption[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

const generationOptions: SelectorOption[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
];
