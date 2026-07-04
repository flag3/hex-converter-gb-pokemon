import { assembleThumb, disassembleThumb } from "./thumbUtils";
import { expect, describe, it } from "vitest";

const toHexBytes = (halfword: number): string => {
  const low = (halfword & 0xff).toString(16).toUpperCase().padStart(2, "0");
  const high = ((halfword >> 8) & 0xff).toString(16).toUpperCase().padStart(2, "0");
  return `${low} ${high}`;
};

describe("thumbUtils", () => {
  describe("disassembleThumb", () => {
    it("should disassemble representative instructions", () => {
      expect(disassembleThumb("00 00")).toBe("lsls r0, r0, #0x0");
      expect(disassembleThumb("01 20")).toBe("movs r0, #0x1");
      expect(disassembleThumb("88 42")).toBe("cmp r0, r1");
      expect(disassembleThumb("86 46")).toBe("mov lr, r0");
      expect(disassembleThumb("70 47")).toBe("bx lr");
      expect(disassembleThumb("04 48")).toBe("ldr r0, [pc, #0x10]");
      expect(disassembleThumb("10 60")).toBe("str r0, [r2, #0x0]");
      expect(disassembleThumb("10 B5")).toBe("push {r4, lr}");
      expect(disassembleThumb("10 BD")).toBe("pop {r4, pc}");
      expect(disassembleThumb("07 C1")).toBe("stmia r1!, {r0, r1, r2}");
      expect(disassembleThumb("FB D1")).toBe("bne #-0xA");
      expect(disassembleThumb("FF DF")).toBe("swi #0xFF");
      expect(disassembleThumb("FE E7")).toBe("b #-0x4");
      expect(disassembleThumb("80 B0")).toBe("sub sp, #0x0");
      expect(disassembleThumb("01 B0")).toBe("add sp, #0x4");
    });

    it("should combine bl prefix and suffix halfwords", () => {
      expect(disassembleThumb("00 F0 00 FA")).toBe("bl #0x400");
      expect(disassembleThumb("FF F7 FE FF")).toBe("bl #-0x4");
    });

    it("should keep a lone bl half as raw data", () => {
      expect(disassembleThumb("00 F0")).toBe(".hword 0xF000");
      expect(disassembleThumb("00 F8")).toBe(".hword 0xF800");
    });

    it("should emit .byte for a trailing odd byte", () => {
      expect(disassembleThumb("01 20 AB")).toBe("movs r0, #0x1\n.byte 0xAB");
    });
  });

  describe("assembleThumb", () => {
    it("should assemble representative instructions", () => {
      expect(assembleThumb("movs r0, #0x1")).toBe("01 20");
      expect(assembleThumb("push {r4, lr}")).toBe("10 B5");
      expect(assembleThumb("bx lr")).toBe("70 47");
      expect(assembleThumb("bl #0x400")).toBe("00 F0 00 FA");
      expect(assembleThumb(".hword 0xB1FF")).toBe("FF B1");
      expect(assembleThumb(".byte 0xAB")).toBe("AB");
    });

    it("should accept decimal immediates and flexible whitespace", () => {
      expect(assembleThumb("movs  r0,  #1")).toBe("01 20");
      expect(assembleThumb("adds r1, r2, 3")).toBe("D1 1C");
    });

    it("should skip invalid lines", () => {
      expect(assembleThumb("movs r0, #0x100")).toBe("");
      expect(assembleThumb("hello world")).toBe("");
      expect(assembleThumb("")).toBe("");
    });
  });

  describe("round trip", () => {
    it("should reassemble every disassembled halfword to identical bytes", () => {
      for (let halfword = 0; halfword <= 0xffff; halfword++) {
        const hex = toHexBytes(halfword);
        const program = disassembleThumb(hex);
        expect(assembleThumb(program), `halfword 0x${halfword.toString(16)} -> ${program}`).toBe(
          hex,
        );
      }
    });

    it("should round trip bl offsets across the full range", () => {
      const offsets = [0, 2, 0x400, 0x3ffffe, -2, -0x400, -0x400000];
      for (const offset of offsets) {
        const formatted =
          offset < 0
            ? `bl #-0x${(-offset).toString(16).toUpperCase()}`
            : `bl #0x${offset.toString(16).toUpperCase()}`;
        const hex = assembleThumb(formatted);
        expect(disassembleThumb(hex), formatted).toBe(formatted);
      }
    });
  });
});
