import { useHexConverter } from "./../hooks/useHexConverter";
import type { Generation } from "./../types";
import { LANGUAGE_OPTIONS, GENERATION_OPTIONS } from "./../constants/options";
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
          options={LANGUAGE_OPTIONS}
          onChange={(event) => i18n.changeLanguage(event.target.value)}
        />
      </div>
      {i18n.language !== "ko" && (
        <div>
          {t("gen")}
          <Select
            value={gen}
            options={GENERATION_OPTIONS}
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
