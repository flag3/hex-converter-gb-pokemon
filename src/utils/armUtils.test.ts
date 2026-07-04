import { assembleArm, disassembleArm } from "./armUtils";
import { expect, describe, it } from "vitest";

const toHexWord = (word: number): string => {
  return [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff]
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
};

describe("armUtils", () => {
  describe("disassembleArm", () => {
    it("should disassemble representative instructions", () => {
      expect(disassembleArm(toHexWord(0xe1a00000))).toBe("mov r0, r0");
      expect(disassembleArm(toHexWord(0xe3a00301))).toBe("mov r0, #0x4000000");
      expect(disassembleArm(toHexWord(0xe12fff1e))).toBe("bx lr");
      expect(disassembleArm(toHexWord(0xe0810002))).toBe("add r0, r1, r2");
      expect(disassembleArm(toHexWord(0xe2422001))).toBe("sub r2, r2, #0x1");
      expect(disassembleArm(toHexWord(0xe1510002))).toBe("cmp r1, r2");
      expect(disassembleArm(toHexWord(0xe1a01102))).toBe("mov r1, r2, lsl #0x2");
      expect(disassembleArm(toHexWord(0xe1a01312))).toBe("mov r1, r2, lsl r3");
      expect(disassembleArm(toHexWord(0xe1a01062))).toBe("mov r1, r2, rrx");
      expect(disassembleArm(toHexWord(0xe5901004))).toBe("ldr r1, [r0, #0x4]");
      expect(disassembleArm(toHexWord(0xe5b01004))).toBe("ldr r1, [r0, #0x4]!");
      expect(disassembleArm(toHexWord(0xe4901004))).toBe("ldr r1, [r0], #0x4");
      expect(disassembleArm(toHexWord(0xe59f0000))).toBe("ldr r0, [pc]");
      expect(disassembleArm(toHexWord(0xe7910002))).toBe("ldr r0, [r1, r2]");
      expect(disassembleArm(toHexWord(0xe7110002))).toBe("ldr r0, [r1, -r2]");
      expect(disassembleArm(toHexWord(0xe1d010b4))).toBe("ldrh r1, [r0, #0x4]");
      expect(disassembleArm(toHexWord(0xe1d010d4))).toBe("ldrsb r1, [r0, #0x4]");
      expect(disassembleArm(toHexWord(0xe92d4010))).toBe("stmdb sp!, {r4, lr}");
      expect(disassembleArm(toHexWord(0xe8bd8010))).toBe("ldmia sp!, {r4, pc}");
      expect(disassembleArm(toHexWord(0xeb000000))).toBe("bl #0x0");
      expect(disassembleArm(toHexWord(0xea000010))).toBe("b #0x40");
      expect(disassembleArm(toHexWord(0x0a000010))).toBe("beq #0x40");
      expect(disassembleArm(toHexWord(0xef020000))).toBe("swi #0x20000");
      expect(disassembleArm(toHexWord(0xe10f0000))).toBe("mrs r0, cpsr");
      expect(disassembleArm(toHexWord(0xe129f000))).toBe("msr cpsr_fc, r0");
      expect(disassembleArm(toHexWord(0xe0000291))).toBe("mul r0, r1, r2");
      expect(disassembleArm(toHexWord(0xe0821493))).toBe("umull r1, r2, r3, r4");
      expect(disassembleArm(toHexWord(0xe1010092))).toBe("swp r0, r2, [r1]");
    });

    it("should keep condition suffixes", () => {
      expect(disassembleArm(toHexWord(0x03a00001))).toBe("moveq r0, #0x1");
      expect(disassembleArm(toHexWord(0x13a00001))).toBe("movne r0, #0x1");
      expect(disassembleArm(toHexWord(0xc3a00001))).toBe("movgt r0, #0x1");
    });

    it("should emit .word for undefined and coprocessor space", () => {
      expect(disassembleArm(toHexWord(0xf0000000))).toBe(".word 0xF0000000");
      expect(disassembleArm(toHexWord(0xee000000))).toBe(".word 0xEE000000");
    });

    it("should emit .hword and .byte for trailing bytes", () => {
      expect(disassembleArm("1E FF 2F E1 01 20 AB")).toBe("bx lr\n.hword 0x2001\n.byte 0xAB");
    });

    it("should show non-canonical immediate rotations explicitly", () => {
      expect(disassembleArm(toHexWord(0xe3a00101))).toBe("mov r0, #0x40000000");
      expect(disassembleArm(toHexWord(0xe3a00004))).toBe("mov r0, #0x4");
      expect(disassembleArm(toHexWord(0xe3a00f01))).toBe("mov r0, #0x1, #0x1E");
      expect(assembleArm("mov r0, #0x1, #0x1E")).toBe(toHexWord(0xe3a00f01));
    });
  });

  describe("assembleArm", () => {
    it("should assemble representative instructions", () => {
      expect(assembleArm("mov r0, #0x4000000")).toBe(toHexWord(0xe3a00301));
      expect(assembleArm("bx lr")).toBe(toHexWord(0xe12fff1e));
      expect(assembleArm("stmdb sp!, {r4, lr}")).toBe(toHexWord(0xe92d4010));
      expect(assembleArm("ldmia sp!, {r4, pc}")).toBe(toHexWord(0xe8bd8010));
      expect(assembleArm("swi #0x20000")).toBe(toHexWord(0xef020000));
      expect(assembleArm(".word 0xF0000000")).toBe(toHexWord(0xf0000000));
    });

    it("should accept register ranges in lists and decimal immediates", () => {
      expect(assembleArm("stmdb sp!, {r4-r6, lr}")).toBe(toHexWord(0xe92d4070));
      expect(assembleArm("mov r0, #1")).toBe(toHexWord(0xe3a00001));
    });

    it("should skip invalid lines", () => {
      expect(assembleArm("mov r0, #0x101")).toBe("");
      expect(assembleArm("hello world")).toBe("");
      expect(assembleArm("ldrt r0, [r1, #0x4]!")).toBe("");
    });
  });

  describe("round trip", () => {
    it("should reassemble pseudo-random words to identical bytes", () => {
      let seed = 0x12345678;
      const next = (): number => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed;
      };

      for (let i = 0; i < 100000; i++) {
        const word = next();
        const hex = toHexWord(word);
        const program = disassembleArm(hex);
        expect(assembleArm(program), `word 0x${word.toString(16)} -> ${program}`).toBe(hex);
      }
    });

    it("should reassemble structured sweeps to identical bytes", () => {
      const lowPatterns = [0x0000, 0x0090, 0x0f10, 0x1002, 0x00b4, 0xf000, 0x0102, 0x4010];
      for (const low of lowPatterns) {
        for (let high = 0; high <= 0xffff; high += 7) {
          const word = ((high << 16) | low) >>> 0;
          const hex = toHexWord(word);
          const program = disassembleArm(hex);
          expect(assembleArm(program), `word 0x${word.toString(16)} -> ${program}`).toBe(hex);
        }
      }
    });
  });
});
