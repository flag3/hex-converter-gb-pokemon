import type { CpuMode, Language, Generation } from "./../types";
import { isLanguage } from "./../types";
import { textToHex, hexToText, hexToProgram, programToHex } from "./../utils/hexUtils";
import { sanitizeHex } from "./../utils/validationUtils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useHexConverter = () => {
  const { i18n } = useTranslation();
  const language: Language = isLanguage(i18n.language) ? i18n.language : "en";
  const [gen, setGen] = useState<Generation>("1");
  const [cpuMode, setCpuMode] = useState<CpuMode>("thumb");
  const [text, setText] = useState("");
  const [hex, setHex] = useState("");
  const [program, setProgram] = useState("");

  const updateFromText = (newText: string) => {
    const newHex = textToHex(newText, language, gen);
    setText(newText);
    setHex(newHex);
    setProgram(hexToProgram(newHex, gen, cpuMode));
  };

  const updateFromHex = (newHex: string) => {
    const cleanedHex = sanitizeHex(newHex);
    setHex(cleanedHex);
    setText(hexToText(cleanedHex, language, gen));
    setProgram(hexToProgram(cleanedHex, gen, cpuMode));
  };

  const updateFromProgram = (newProgram: string) => {
    const newHex = programToHex(newProgram, gen, cpuMode);
    setProgram(newProgram);
    setHex(newHex);
    setText(hexToText(newHex, language, gen));
  };

  const clear = () => {
    setText("");
    setHex("");
    setProgram("");
  };

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
    clear,
  };
};
