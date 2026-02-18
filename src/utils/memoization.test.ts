import { getMemoizedInstructionMaps } from "./memoization";
import { describe, it, expect } from "vitest";

describe("getMemoizedInstructionMaps", () => {
  it("should return an object with instructionInfoMap and cbInstructionInfoMap", () => {
    const maps = getMemoizedInstructionMaps();
    expect(maps).toHaveProperty("instructionInfoMap");
    expect(maps).toHaveProperty("cbInstructionInfoMap");
  });

  it("should populate instructionInfoMap with instructions", () => {
    const { instructionInfoMap } = getMemoizedInstructionMaps();
    expect(Object.keys(instructionInfoMap).length).toBeGreaterThan(0);
  });

  it("should map 'nop' to opcode 00 with no operands", () => {
    const { instructionInfoMap } = getMemoizedInstructionMaps();
    expect(instructionInfoMap["nop"]).toBeDefined();
    expect(instructionInfoMap["nop"][0].opcode).toBe("00");
    expect(instructionInfoMap["nop"][0].operandPattern).toBe("");
  });

  it("should map 'ld' to multiple opcodes", () => {
    const { instructionInfoMap } = getMemoizedInstructionMaps();
    expect(instructionInfoMap["ld"]).toBeDefined();
    expect(instructionInfoMap["ld"].length).toBeGreaterThan(1);
  });

  it("should populate cbInstructionInfoMap with CB prefix instructions", () => {
    const { cbInstructionInfoMap } = getMemoizedInstructionMaps();
    expect(Object.keys(cbInstructionInfoMap).length).toBeGreaterThan(0);
  });

  it("should return the same object reference on subsequent calls (memoization)", () => {
    const maps1 = getMemoizedInstructionMaps();
    const maps2 = getMemoizedInstructionMaps();
    expect(maps1).toBe(maps2);
  });
});
