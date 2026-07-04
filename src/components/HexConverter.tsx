import { useHexConverter } from "./../hooks/useHexConverter";
import type { CpuMode, Generation } from "./../types";
import { LANGUAGE_OPTIONS, GENERATION_OPTIONS, CPU_MODE_OPTIONS } from "./../constants/options";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";

export const HexConverter = () => {
  const { t, i18n } = useTranslation();
  const {
    gen,
    setGen,
    cpuMode,
    setCpuMode,
    text,
    hex,
    program,
    updateFromText,
    updateFromHex,
    updateFromProgram,
    reset,
  } = useHexConverter();

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
      {gen === "3" && (
        <div>
          {t("cpu")}
          <Select
            value={cpuMode}
            options={CPU_MODE_OPTIONS}
            onChange={(event) => setCpuMode(event.target.value as CpuMode)}
          />
        </div>
      )}
      <div className="input-container">
        <div>
          <label>{t("text")}</label>
          <Textarea value={text} onChange={(event) => updateFromText(event.target.value)} />
        </div>
        <div>
          <label>{t("hex")}</label>
          <Textarea value={hex} onChange={(event) => updateFromHex(event.target.value)} />
        </div>
        <div>
          <label>{t("program")}</label>
          <Textarea value={program} onChange={(event) => updateFromProgram(event.target.value)} />
        </div>
      </div>
      <Button onClick={reset} icon="material-symbols:delete-outline" />
    </div>
  );
};
