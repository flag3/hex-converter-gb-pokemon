import type { CpuMode, Language, Generation } from "./../types";
import { isLanguage } from "./../types";
import { textToHex, hexToText, hexToProgram, programToHex } from "./../utils/hexUtils";
import { sanitizeHex } from "./../utils/validationUtils";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

export const useHexConverter = () => {
  const { i18n } = useTranslation();
  const language: Language = isLanguage(i18n.language) ? i18n.language : "en";
  const [gen, setGen] = useState<Generation>("1");
  const [cpuMode, setCpuMode] = useState<CpuMode>("thumb");
  const [text, setText] = useState("");
  const [hex, setHex] = useState("");
  const [program, setProgram] = useState("");

  const updateFromText = useCallback(
    (newText: string) => {
      const newHex = textToHex(newText, language, gen);
      const newProgram = hexToProgram(newHex, gen, cpuMode);
      setText(newText);
      setHex(newHex);
      setProgram(newProgram);
    },
    [language, gen, cpuMode],
  );

  const updateFromHex = useCallback(
    (newHex: string) => {
      const cleanedHex = sanitizeHex(newHex);
      const newText = hexToText(cleanedHex, language, gen);
      const newProgram = hexToProgram(cleanedHex, gen, cpuMode);
      setHex(cleanedHex);
      setText(newText);
      setProgram(newProgram);
    },
    [language, gen, cpuMode],
  );

  const updateFromProgram = useCallback(
    (newProgram: string) => {
      const newHex = programToHex(newProgram, gen, cpuMode);
      const newText = hexToText(newHex, language, gen);
      setProgram(newProgram);
      setHex(newHex);
      setText(newText);
    },
    [language, gen, cpuMode],
  );

  const reset = useCallback(() => {
    setText("");
    setHex("");
    setProgram("");
  }, []);

  return {
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
  };
};
