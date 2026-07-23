import { useHexConverter } from "./../hooks/useHexConverter";
import type { CpuMode, Generation } from "./../types";
import { LANGUAGE_OPTIONS, GENERATION_OPTIONS, CPU_MODE_OPTIONS } from "./../constants/options";
import { Icon } from "@iconify/react";
import { FormControl, Heading, IconButton, Select, Stack, Textarea } from "@primer/react";
import { useTranslation } from "react-i18next";

const DeleteIcon = () => <Icon icon="material-symbols:delete-outline" />;

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
    clear,
  } = useHexConverter();

  return (
    <Stack gap="normal">
      <Heading as="h1">{t("title")}</Heading>
      <Stack direction="horizontal" gap="normal" wrap="wrap" justify="center">
        <FormControl>
          <FormControl.Label>{t("language")}</FormControl.Label>
          <Select
            value={i18n.language}
            onChange={(event) => i18n.changeLanguage(event.target.value)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        {i18n.language !== "ko" && (
          <FormControl>
            <FormControl.Label>{t("gen")}</FormControl.Label>
            <Select value={gen} onChange={(event) => setGen(event.target.value as Generation)}>
              {GENERATION_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
        {gen === "3" && (
          <FormControl>
            <FormControl.Label>{t("cpu")}</FormControl.Label>
            <Select value={cpuMode} onChange={(event) => setCpuMode(event.target.value as CpuMode)}>
              {CPU_MODE_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
      <div className="hex-fields">
        <FormControl>
          <FormControl.Label>{t("text")}</FormControl.Label>
          <Textarea
            value={text}
            onChange={(event) => updateFromText(event.target.value)}
            resize="vertical"
            className="hex-textarea"
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>{t("hex")}</FormControl.Label>
          <Textarea
            value={hex}
            onChange={(event) => updateFromHex(event.target.value)}
            resize="vertical"
            className="hex-textarea"
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>{t("program")}</FormControl.Label>
          <Textarea
            value={program}
            onChange={(event) => updateFromProgram(event.target.value)}
            resize="vertical"
            className="hex-textarea"
          />
        </FormControl>
      </div>
      <Stack direction="horizontal" justify="center">
        <IconButton icon={DeleteIcon} aria-label={t("clear")} onClick={clear} />
      </Stack>
    </Stack>
  );
};
