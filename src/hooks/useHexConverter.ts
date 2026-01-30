import type { Language, Generation } from "./../types";
import { textToHex, hexToText, hexToProgram, programToHex } from "./../utils/hexUtils";
import { sanitizeHex } from "./../utils/validationUtils";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

export const useHexConverter = () => {
  const { i18n } = useTranslation();
  const [gen, setGen] = useState<Generation>("1");
  const [text, setText] = useState("");
  const [hex, setHex] = useState("");
  const [program, setProgram] = useState("");

  const updateFromText = useCallback(
    (newText: string) => {
      const newHex = textToHex(newText, i18n.language as Language, gen);
      const newProgram = hexToProgram(newHex);
      setText(newText);
      setHex(newHex);
      setProgram(newProgram);
    },
    [i18n.language, gen],
  );

  const updateFromHex = useCallback(
    (newHex: string) => {
      const cleanedHex = sanitizeHex(newHex);
      const newText = hexToText(cleanedHex, i18n.language as Language, gen);
      const newProgram = hexToProgram(cleanedHex);
      setHex(cleanedHex);
      setText(newText);
      setProgram(newProgram);
    },
    [i18n.language, gen],
  );

  const updateFromProgram = useCallback(
    (newProgram: string) => {
      const newHex = programToHex(newProgram);
      const newText = hexToText(newHex, i18n.language as Language, gen);
      setProgram(newProgram);
      setHex(newHex);
      setText(newText);
    },
    [i18n.language, gen],
  );

  const reset = useCallback(() => {
    setText("");
    setHex("");
    setProgram("");
  }, []);

  return {
    gen,
    setGen,
    text,
    hex,
    program,
    updateFromText,
    updateFromHex,
    updateFromProgram,
    reset,
  };
};
