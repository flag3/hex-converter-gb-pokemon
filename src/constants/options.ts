import type { SelectorOption } from "./../types";

export const LANGUAGE_OPTIONS: SelectorOption[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

export const GENERATION_OPTIONS: SelectorOption[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
];

export const CPU_MODE_OPTIONS: SelectorOption[] = [
  { value: "thumb", label: "Thumb" },
  { value: "arm", label: "ARM" },
];
