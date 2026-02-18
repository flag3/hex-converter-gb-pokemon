import { sanitizeHex, isValidHex, normalizeHex } from "./validationUtils";
import { describe, it, expect } from "vitest";

describe("validationUtils", () => {
  describe("sanitizeHex", () => {
    it("should keep valid hex characters and spaces", () => {
      expect(sanitizeHex("80 81 82")).toBe("80 81 82");
    });

    it("should remove invalid characters", () => {
      expect(sanitizeHex("GGZ!@#")).toBe("");
    });

    it("should keep uppercase and lowercase hex characters", () => {
      expect(sanitizeHex("aAbBcCdDeEfF09")).toBe("aAbBcCdDeEfF09");
    });

    it("should remove non-hex characters while keeping valid ones", () => {
      expect(sanitizeHex("80XY81")).toBe("8081");
    });

    it("should return empty string for empty input", () => {
      expect(sanitizeHex("")).toBe("");
    });
  });

  describe("isValidHex", () => {
    it("should return true for valid hex string with spaces", () => {
      expect(isValidHex("80 81 82")).toBe(true);
    });

    it("should return true for empty string", () => {
      expect(isValidHex("")).toBe(true);
    });

    it("should return true for uppercase and lowercase hex", () => {
      expect(isValidHex("aAbBcCdDeEfF")).toBe(true);
    });

    it("should return false for string containing invalid characters", () => {
      expect(isValidHex("80GG81")).toBe(false);
    });

    it("should return false for string with special characters", () => {
      expect(isValidHex("80!81")).toBe(false);
    });
  });

  describe("normalizeHex", () => {
    it("should split hex string with spaces into 2-character chunks", () => {
      expect(normalizeHex("80 81 82")).toEqual(["80", "81", "82"]);
    });

    it("should split hex string without spaces into 2-character chunks", () => {
      expect(normalizeHex("808182")).toEqual(["80", "81", "82"]);
    });

    it("should convert to uppercase", () => {
      expect(normalizeHex("ab cd ef")).toEqual(["AB", "CD", "EF"]);
    });

    it("should handle single character input", () => {
      expect(normalizeHex("8")).toEqual(["8"]);
    });

    it("should return empty array for empty string", () => {
      expect(normalizeHex("")).toEqual([]);
    });

    it("should handle mixed case input", () => {
      expect(normalizeHex("aB cD")).toEqual(["AB", "CD"]);
    });
  });
});
