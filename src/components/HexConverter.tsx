import { useHexConverter } from "./../hooks/useHexConverter";
import type { Generation, SelectorOption } from "./../types";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";

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
      <div>
        {t("language")}
        <Select
          value={i18n.language}
          options={languageOptions}
          onChange={(event) => i18n.changeLanguage(event.target.value)}
        />
      </div>
      {i18n.language !== "ko" && (
        <div>
          {t("gen")}
          <Select
            value={gen}
            options={generationOptions}
            onChange={(event) => setGen(event.target.value as Generation)}
          />
        </div>
      )}
      <div className="input-container">
        <div>
          <label>{t("text")}</label>
          <Textarea value={text} onChange={handleTextChange} />
        </div>
        <div>
          <label>{t("hex")}</label>
          <Textarea value={hex} onChange={handleHexChange} />
        </div>
        <div>
          <label>{t("program")}</label>
          <Textarea value={program} onChange={handleProgramChange} />
        </div>
      </div>
      <Button onClick={reset} icon="material-symbols:delete-outline" />
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
