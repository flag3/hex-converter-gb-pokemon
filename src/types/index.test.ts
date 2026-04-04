import { isLanguage } from "./index";
import { describe, it, expect } from "vitest";

describe("isLanguage", () => {
  it("should return true for all valid language codes", () => {
    const validLanguages = ["en", "fr", "de", "it", "es", "ja", "ko"];
    for (const lang of validLanguages) {
      expect(isLanguage(lang)).toBe(true);
    }
  });

  it("should return false for unknown language codes", () => {
    expect(isLanguage("zh")).toBe(false);
    expect(isLanguage("pt")).toBe(false);
    expect(isLanguage("ru")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isLanguage("")).toBe(false);
  });

  it("should return false for partial matches", () => {
    expect(isLanguage("e")).toBe(false);
    expect(isLanguage("eng")).toBe(false);
  });
});
