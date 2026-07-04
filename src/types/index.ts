export type Language = "en" | "fr" | "de" | "it" | "es" | "ja" | "ko";

const LANGUAGES: readonly Language[] = ["en", "fr", "de", "it", "es", "ja", "ko"];

export const isLanguage = (value: string): value is Language => {
  return (LANGUAGES as readonly string[]).includes(value);
};
export type Generation = "1" | "2" | "3";

export type CpuMode = "thumb" | "arm";

export interface CharacterMap {
  [key: string]: string;
}

export interface GenerationMaps {
  hex: CharacterMap;
  char: CharacterMap;
}

export type LanguageMap = Record<
  Language,
  {
    gen1: GenerationMaps;
    gen2: GenerationMaps;
  }
>;

export interface InstructionInfo {
  opcode: string;
  operandPattern: string;
}

export interface SelectorOption {
  value: string;
  label: string;
}

export type MapType = "hex" | "char";
