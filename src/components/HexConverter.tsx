import { useHexConverter } from "./../hooks/useHexConverter";
import type { CpuMode, Generation } from "./../types";
import { LANGUAGE_OPTIONS, GENERATION_OPTIONS, CPU_MODE_OPTIONS } from "./../constants/options";
import { Icon } from "@iconify/react";
import {
  FormControl,
  Heading,
  IconButton,
  SegmentedControl,
  Select,
  Stack,
  Textarea,
} from "@primer/react";
import { useId } from "react";
import { useTranslation } from "react-i18next";

const DeleteIcon = () => <Icon icon="material-symbols:delete-outline" />;

export const HexConverter = () => {
  const { t, i18n } = useTranslation();
  const cpuLabelId = useId();
  const {
    language,
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
          <Select value={language} onChange={(event) => i18n.changeLanguage(event.target.value)}>
            {LANGUAGE_OPTIONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
        {language !== "ko" && (
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
            <FormControl.Label as="span" id={cpuLabelId}>
              {t("cpu")}
            </FormControl.Label>
            <SegmentedControl
              aria-labelledby={cpuLabelId}
              onChange={(index) => setCpuMode(CPU_MODE_OPTIONS[index].value as CpuMode)}
            >
              {CPU_MODE_OPTIONS.map((option) => (
                <SegmentedControl.Button key={option.value} selected={cpuMode === option.value}>
                  {option.label}
                </SegmentedControl.Button>
              ))}
            </SegmentedControl>
          </FormControl>
        )}
      </Stack>
      <Stack className="hex-fields" direction="horizontal" justify="center" wrap="wrap">
        <FormControl>
          <FormControl.Label>{t("text")}</FormControl.Label>
          <Textarea
            value={text}
            onChange={(event) => updateFromText(event.target.value)}
            className="hex-textarea"
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>{t("hex")}</FormControl.Label>
          <Textarea
            value={hex}
            onChange={(event) => updateFromHex(event.target.value)}
            className="hex-textarea"
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>{t("program")}</FormControl.Label>
          <Textarea
            value={program}
            onChange={(event) => updateFromProgram(event.target.value)}
            className="hex-textarea"
          />
        </FormControl>
      </Stack>
      <Stack direction="horizontal" justify="center">
        <IconButton icon={DeleteIcon} aria-label={t("clear")} onClick={clear} />
      </Stack>
    </Stack>
  );
};
