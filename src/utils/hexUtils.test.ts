import { textToHex, hexToText, hexToProgram, programToHex } from "./hexUtils";
import { expect, describe, it } from "vitest";

describe("hexUtils", () => {
  describe("textToHex", () => {
    it("should convert English text to hex correctly in gen1", () => {
      const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const language = "en";
      const gen = "1";
      const expectedHex =
        "80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert English text to hex correctly in gen2", () => {
      const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const language = "en";
      const gen = "2";
      const expectedHex =
        "80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert French text to hex correctly in gen1", () => {
      const text = "éèêëàâçùûüîïôÜ";
      const language = "fr";
      const gen = "1";
      const expectedHex = "BC BB CB C6 BA C8 BF BD CA C5 CC C7 C9 C2";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert German text to hex correctly in gen2", () => {
      const text = "äöüÄÖÜß";
      const language = "de";
      const gen = "2";
      const expectedHex = "C3 C4 C5 C0 C1 C2 BE";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert Italian text to hex correctly in gen1", () => {
      const text = "àèéìíñòóùú";
      const language = "it";
      const gen = "1";
      const expectedHex = "BA BB BC D0 D1 D2 D3 D4 BD D5";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert Spanish text to hex correctly in gen2", () => {
      const text = "áéíóúñ¿¡";
      const language = "es";
      const gen = "2";
      const expectedHex = "CF BC D1 D4 D5 D2 E4 E5";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert Japanese text to hex correctly in gen1", () => {
      const text =
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
      const language = "ja";
      const gen = "1";
      const expectedHex =
        "B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE 26 27 28 29 2A 2B 2C 2D 2E 2F 30 31 32 33 34 3A 3B 3C 3D 3E 44 45 46 47 48 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 9A 9B CD 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 D8 A6 A7 A8 A9 AA AB 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 19 1A 1B 3D 1C 40 41 42 47 43";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert Japanese text to hex correctly in gen2", () => {
      const text =
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ";
      const language = "ja";
      const gen = "2";
      const expectedHex =
        "B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE 26 27 28 29 2A 2B 2C 2D 2E 2F 30 31 32 33 34 3A 3B 3C 3D 3E 44 45 46 47 48 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 9A 9B CD 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 D8 A6 A7 A8 A9 AA AB 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 19 1A 1B 3D 1C 40 41 42 47 43";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert Japanese characters that normally do not take a voiced sound mark to hex", () => {
      const text = "あ゙い゙ゔえ゙お゙";
      const language = "ja";
      const gen = "1";
      const expectedHex = "21 22 23 24 25";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });

    it("should convert Korean text to hex correctly", () => {
      const text = "가나다라마바사아자차카타파하";
      const language = "ko";
      const gen = "2";
      const expectedHex =
        "01 01 02 3A 02 D9 03 C3 04 46 04 D9 05 B7 06 C6 07 AA 08 97 09 0B 09 88 09 F4 0A 6F";

      const result = textToHex(text, language, gen);
      expect(result).toBe(expectedHex);
    });
  });

  describe("hexToText", () => {
    it("should convert hex to English text correctly in gen1", () => {
      const hex =
        "80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9";
      const language = "en";
      const gen = "1";
      const expectedText = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to English text correctly in gen2", () => {
      const hex =
        "80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9";
      const language = "en";
      const gen = "2";
      const expectedText = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to French text correctly in gen1", () => {
      const hex = "BC BB CB C6 BA C8 BF BD CA C5 CC C7 C9 C2";
      const language = "fr";
      const gen = "1";
      const expectedText = "éèêëàâçùûüîïôÜ";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to German text correctly in gen2", () => {
      const hex = "C3 C4 C5 C0 C1 C2 BE";
      const language = "de";
      const gen = "2";
      const expectedText = "äöüÄÖÜß";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to Italian text correctly in gen1", () => {
      const hex = "BA BB BC D0 D1 D2 D3 D4 BD D5";
      const language = "it";
      const gen = "1";
      const expectedText = "àèéìíñòóùú";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to Spanish text correctly in gen2", () => {
      const hex = "CF BC D1 D4 D5 D2 E4 E5";
      const language = "es";
      const gen = "2";
      const expectedText = "áéíóúñ¿¡";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to Japanese text correctly in gen1", () => {
      const hex =
        "B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE 26 27 28 29 2A 2B 2C 2D 2E 2F 30 31 32 33 34 3A 3B 3C 3D 3E 44 45 46 47 48 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 9A 9B CD 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 D8 A6 A7 A8 A9 AA AB 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 19 1A 1B 3D 1C 40 41 42 47 43";
      const language = "ja";
      const gen = "1";
      const expectedText =
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらリるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフへホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブべボパピプぺポ";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to Japanese text correctly in gen2", () => {
      const hex =
        "B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE 26 27 28 29 2A 2B 2C 2D 2E 2F 30 31 32 33 34 3A 3B 3C 3D 3E 44 45 46 47 48 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 9A 9B CD 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 D8 A6 A7 A8 A9 AA AB 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11 12 13 19 1A 1B 3D 1C 40 41 42 47 43";
      const language = "ja";
      const gen = "2";
      const expectedText =
        "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらリるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフへホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブべボパピプぺポ";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to Japanese characters that normally do not take a voiced sound mark", () => {
      const hex = "21 22 23 24 25";
      const language = "ja";
      const gen = "1";
      const expectedText = "あ゙い゙ゔえ゙お゙";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });

    it("should convert hex to Korean text correctly", () => {
      const hex =
        "01 01 02 3A 02 D9 03 C3 04 46 04 D9 05 B7 06 C6 07 AA 08 97 09 0B 09 88 09 F4 0A 6F";
      const language = "ko";
      const gen = "1";
      const expectedText = "가나다라마바사아자차카타파하";

      const result = hexToText(hex, language, gen);
      expect(result).toBe(expectedText);
    });
  });

  describe("hexToProgram", () => {
    it("should convert hex to program correctly", () => {
      const hex =
        "00 01 01 01 02 03 04 05 06 06 07 08 08 08 09 0A 0B 0C 0D 0E 0E 0F 10 11 11 11 12 13 14 15 16 16 17 18 18 19 1A 1B 1C 1D 1E 1E 1F 20 20 21 21 21 22 23 24 25 26 26 27 28 28 29 2A 2B 2C 2D 2E 2E 2F 30 30 31 31 31 32 33 34 35 36 36 37 38 38 39 3A 3B 3C 3D 3E 3E 3F 40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F 60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C2 C2 C3 C3 C3 C4 C4 C4 C5 C6 C6 C7 C8 C9 CA CA CA CC CC CC CD CD CD CE CE CF D0 D1 D2 D2 D2 D3 D4 D4 D4 D5 D6 D6 D7 D8 D9 DA DA DA DB DC DC DC DD DE DE DF E0 E0 E1 E2 E3 E4 E5 E6 E6 E7 E8 E8 E9 EA EA EA EB EC ED EE EE EF F0 F0 F1 F2 F3 F4 F5 F6 F6 F7 F8 F8 F9 FA FA FA FB FC FD FE FE FF";
      const expectedProgram =
        "nop  \nld   bc,0101\nld   (bc),a\ninc  bc\ninc  b\ndec  b\nld   b,06\nrlca \nld   (0808),sp\nadd  hl,bc\nld   a,(bc)\ndec  bc\ninc  c\ndec  c\nld   c,0E\nrrca \nstop \nld   de,1111\nld   (de),a\ninc  de\ninc  d\ndec  d\nld   d,16\nrla  \njr   18\nadd  hl,de\nld   a,(de)\ndec  de\ninc  e\ndec  e\nld   e,1E\nrra  \njr   nz,20\nld   hl,2121\nldi  (hl),a\ninc  hl\ninc  h\ndec  h\nld   h,26\ndaa  \njr   z,28\nadd  hl,hl\nldi  a,(hl)\ndec  hl\ninc  l\ndec  l\nld   l,2E\ncpl  \njr   nc,30\nld   sp,3131\nldd  (hl),a\ninc  sp\ninc  (hl)\ndec  (hl)\nld   (hl),36\nscf  \njr   c,38\nadd  hl,sp\nldd  a,(hl)\ndec  sp\ninc  a\ndec  a\nld   a,3E\nccf  \nld   b,b\nld   b,c\nld   b,d\nld   b,e\nld   b,h\nld   b,l\nld   b,(hl)\nld   b,a\nld   c,b\nld   c,c\nld   c,d\nld   c,e\nld   c,h\nld   c,l\nld   c,(hl)\nld   c,a\nld   d,b\nld   d,c\nld   d,d\nld   d,e\nld   d,h\nld   d,l\nld   d,(hl)\nld   d,a\nld   e,b\nld   e,c\nld   e,d\nld   e,e\nld   e,h\nld   e,l\nld   e,(hl)\nld   e,a\nld   h,b\nld   h,c\nld   h,d\nld   h,e\nld   h,h\nld   h,l\nld   h,(hl)\nld   h,a\nld   l,b\nld   l,c\nld   l,d\nld   l,e\nld   l,h\nld   l,l\nld   l,(hl)\nld   l,a\nld   (hl),b\nld   (hl),c\nld   (hl),d\nld   (hl),e\nld   (hl),h\nld   (hl),l\nhalt \nld   (hl),a\nld   a,b\nld   a,c\nld   a,d\nld   a,e\nld   a,h\nld   a,l\nld   a,(hl)\nld   a,a\nadd  b\nadd  c\nadd  d\nadd  e\nadd  h\nadd  l\nadd  (hl)\nadd  a\nadc  b\nadc  c\nadc  d\nadc  e\nadc  h\nadc  l\nadc  (hl)\nadc  a\nsub  b\nsub  c\nsub  d\nsub  e\nsub  h\nsub  l\nsub  (hl)\nsub  a\nsbc  b\nsbc  c\nsbc  d\nsbc  e\nsbc  h\nsbc  l\nsbc  (hl)\nsbc  a\nand  b\nand  c\nand  d\nand  e\nand  h\nand  l\nand  (hl)\nand  a\nxor  b\nxor  c\nxor  d\nxor  e\nxor  h\nxor  l\nxor  (hl)\nxor  a\nor   b\nor   c\nor   d\nor   e\nor   h\nor   l\nor   (hl)\nor   a\ncp   b\ncp   c\ncp   d\ncp   e\ncp   h\ncp   l\ncp   (hl)\ncp   a\nret  nz\npop  bc\njp   nz,C2C2\njp   C3C3\ncall nz,C4C4\npush bc\nadd  a,C6\nrst  00\nret  z\nret  \njp   z,CACA\ncall z,CCCC\ncall CDCD\nadc  a,CE\nrst  08\nret  nc\npop  de\njp   nc,D2D2\nundefined opcode\ncall nc,D4D4\npush de\nsub  a,D6\nrst  10\nret  c\nreti \njp   c,DADA\nundefined opcode\ncall c,DCDC\nundefined opcode\nsbc  a,DE\nrst  18\nld   (ff00+E0),a\npop  hl\nld   (ff00+c),a\nundefined opcode\nundefined opcode\npush hl\nand  a,E6\nrst  20\nadd  sp,E8\njp   hl\nld   (EAEA),a\nundefined opcode\nundefined opcode\nundefined opcode\nxor  a,EE\nrst  28\nld   a,(ff00+F0)\npop  af\nld   a,(ff00+c)\ndi   \nundefined opcode\npush af\nor   a,F6\nrst  30\nld   hl,sp+F8\nld   sp,hl\nld   a,(FAFA)\nei   \nundefined opcode\nundefined opcode\ncp   a,FE\nrst  38";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex 01 to program ld bc,****", () => {
      const hex = "01";
      const expectedProgram = "ld   bc,****";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex 01 0 to program ld bc,**0*", () => {
      const hex = "01 0";
      const expectedProgram = "ld   bc,**0*";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex 01 01 to program ld bc,**01", () => {
      const hex = "01 01";
      const expectedProgram = "ld   bc,**01";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex 01 01 2 to program ld bc,2*01", () => {
      const hex = "01 01 2";
      const expectedProgram = "ld   bc,2*01";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex 06 to program ld b,**", () => {
      const hex = "06";
      const expectedProgram = "ld   b,**";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex 06 0 to program ld b,0*", () => {
      const hex = "06 0";
      const expectedProgram = "ld   b,0*";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert CB prefix hex to program correctly", () => {
      const hex =
        "CB 00 CB 01 CB 02 CB 03 CB 04 CB 05 CB 06 CB 07 CB 08 CB 09 CB 0A CB 0B CB 0C CB 0D CB 0E CB 0F CB 10 CB 11 CB 12 CB 13 CB 14 CB 15 CB 16 CB 17 CB 18 CB 19 CB 1A CB 1B CB 1C CB 1D CB 1E CB 1F CB 20 CB 21 CB 22 CB 23 CB 24 CB 25 CB 26 CB 27 CB 28 CB 29 CB 2A CB 2B CB 2C CB 2D CB 2E CB 2F CB 30 CB 31 CB 32 CB 33 CB 34 CB 35 CB 36 CB 37 CB 38 CB 39 CB 3A CB 3B CB 3C CB 3D CB 3E CB 3F CB 40 CB 41 CB 42 CB 43 CB 44 CB 45 CB 46 CB 47 CB 48 CB 49 CB 4A CB 4B CB 4C CB 4D CB 4E CB 4F CB 50 CB 51 CB 52 CB 53 CB 54 CB 55 CB 56 CB 57 CB 58 CB 59 CB 5A CB 5B CB 5C CB 5D CB 5E CB 5F CB 60 CB 61 CB 62 CB 63 CB 64 CB 65 CB 66 CB 67 CB 68 CB 69 CB 6A CB 6B CB 6C CB 6D CB 6E CB 6F CB 70 CB 71 CB 72 CB 73 CB 74 CB 75 CB 76 CB 77 CB 78 CB 79 CB 7A CB 7B CB 7C CB 7D CB 7E CB 7F CB 80 CB 81 CB 82 CB 83 CB 84 CB 85 CB 86 CB 87 CB 88 CB 89 CB 8A CB 8B CB 8C CB 8D CB 8E CB 8F CB 90 CB 91 CB 92 CB 93 CB 94 CB 95 CB 96 CB 97 CB 98 CB 99 CB 9A CB 9B CB 9C CB 9D CB 9E CB 9F CB A0 CB A1 CB A2 CB A3 CB A4 CB A5 CB A6 CB A7 CB A8 CB A9 CB AA CB AB CB AC CB AD CB AE CB AF CB B0 CB B1 CB B2 CB B3 CB B4 CB B5 CB B6 CB B7 CB B8 CB B9 CB BA CB BB CB BC CB BD CB BE CB BF CB C0 CB C1 CB C2 CB C3 CB C4 CB C5 CB C6 CB C7 CB C8 CB C9 CB CA CB CB CB CC CB CD CB CE CB CF CB D0 CB D1 CB D2 CB D3 CB D4 CB D5 CB D6 CB D7 CB D8 CB D9 CB DA CB DB CB DC CB DD CB DE CB DF CB E0 CB E1 CB E2 CB E3 CB E4 CB E5 CB E6 CB E7 CB E8 CB E9 CB EA CB EB CB EC CB ED CB EE CB EF CB F0 CB F1 CB F2 CB F3 CB F4 CB F5 CB F6 CB F7 CB F8 CB F9 CB FA CB FB CB FC CB FD CB FE CB FF CB";
      const expectedProgram =
        "rlc  b\nrlc  c\nrlc  d\nrlc  e\nrlc  h\nrlc  l\nrlc  (hl)\nrlc  a\nrrc  b\nrrc  c\nrrc  d\nrrc  e\nrrc  h\nrrc  l\nrrc  (hl)\nrrc  a\nrl   b\nrl   c\nrl   d\nrl   e\nrl   h\nrl   l\nrl   (hl)\nrl   a\nrr   b\nrr   c\nrr   d\nrr   e\nrr   h\nrr   l\nrr   (hl)\nrr   a\nsla  b\nsla  c\nsla  d\nsla  e\nsla  h\nsla  l\nsla  (hl)\nsla  a\nsra  b\nsra  c\nsra  d\nsra  e\nsra  h\nsra  l\nsra  (hl)\nsra  a\nswap b\nswap c\nswap d\nswap e\nswap h\nswap l\nswap (hl)\nswap a\nsrl  b\nsrl  c\nsrl  d\nsrl  e\nsrl  h\nsrl  l\nsrl  (hl)\nsrl  a\nbit  0,b\nbit  0,c\nbit  0,d\nbit  0,e\nbit  0,h\nbit  0,l\nbit  0,(hl)\nbit  0,a\nbit  1,b\nbit  1,c\nbit  1,d\nbit  1,e\nbit  1,h\nbit  1,l\nbit  1,(hl)\nbit  1,a\nbit  2,b\nbit  2,c\nbit  2,d\nbit  2,e\nbit  2,h\nbit  2,l\nbit  2,(hl)\nbit  2,a\nbit  3,b\nbit  3,c\nbit  3,d\nbit  3,e\nbit  3,h\nbit  3,l\nbit  3,(hl)\nbit  3,a\nbit  4,b\nbit  4,c\nbit  4,d\nbit  4,e\nbit  4,h\nbit  4,l\nbit  4,(hl)\nbit  4,a\nbit  5,b\nbit  5,c\nbit  5,d\nbit  5,e\nbit  5,h\nbit  5,l\nbit  5,(hl)\nbit  5,a\nbit  6,b\nbit  6,c\nbit  6,d\nbit  6,e\nbit  6,h\nbit  6,l\nbit  6,(hl)\nbit  6,a\nbit  7,b\nbit  7,c\nbit  7,d\nbit  7,e\nbit  7,h\nbit  7,l\nbit  7,(hl)\nbit  7,a\nres  0,b\nres  0,c\nres  0,d\nres  0,e\nres  0,h\nres  0,l\nres  0,(hl)\nres  0,a\nres  1,b\nres  1,c\nres  1,d\nres  1,e\nres  1,h\nres  1,l\nres  1,(hl)\nres  1,a\nres  2,b\nres  2,c\nres  2,d\nres  2,e\nres  2,h\nres  2,l\nres  2,(hl)\nres  2,a\nres  3,b\nres  3,c\nres  3,d\nres  3,e\nres  3,h\nres  3,l\nres  3,(hl)\nres  3,a\nres  4,b\nres  4,c\nres  4,d\nres  4,e\nres  4,h\nres  4,l\nres  4,(hl)\nres  4,a\nres  5,b\nres  5,c\nres  5,d\nres  5,e\nres  5,h\nres  5,l\nres  5,(hl)\nres  5,a\nres  6,b\nres  6,c\nres  6,d\nres  6,e\nres  6,h\nres  6,l\nres  6,(hl)\nres  6,a\nres  7,b\nres  7,c\nres  7,d\nres  7,e\nres  7,h\nres  7,l\nres  7,(hl)\nres  7,a\nset  0,b\nset  0,c\nset  0,d\nset  0,e\nset  0,h\nset  0,l\nset  0,(hl)\nset  0,a\nset  1,b\nset  1,c\nset  1,d\nset  1,e\nset  1,h\nset  1,l\nset  1,(hl)\nset  1,a\nset  2,b\nset  2,c\nset  2,d\nset  2,e\nset  2,h\nset  2,l\nset  2,(hl)\nset  2,a\nset  3,b\nset  3,c\nset  3,d\nset  3,e\nset  3,h\nset  3,l\nset  3,(hl)\nset  3,a\nset  4,b\nset  4,c\nset  4,d\nset  4,e\nset  4,h\nset  4,l\nset  4,(hl)\nset  4,a\nset  5,b\nset  5,c\nset  5,d\nset  5,e\nset  5,h\nset  5,l\nset  5,(hl)\nset  5,a\nset  6,b\nset  6,c\nset  6,d\nset  6,e\nset  6,h\nset  6,l\nset  6,(hl)\nset  6,a\nset  7,b\nset  7,c\nset  7,d\nset  7,e\nset  7,h\nset  7,l\nset  7,(hl)\nset  7,a\ndb   CB";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });

    it("should convert hex CB to program db CB", () => {
      const hex = "CB";
      const expectedProgram = "db   CB";

      const result = hexToProgram(hex);
      expect(result).toBe(expectedProgram);
    });
  });

  describe("programToHex", () => {
    it("should convert program to hex correctly", () => {
      const program =
        "nop\nld bc,0101\nld (bc),a\ninc bc\ninc b\ndec b\nld b,06\nrlca\nld (0808),sp\nadd hl,bc\nld a,(bc)\ndec bc\ninc c\ndec c\nld c,0E\nrrca\nstop\nld de,1111\nld (de),a\ninc de\ninc d\ndec d\nld d,16\nrla\njr 18\nadd hl,de\nld a,(de)\ndec de\ninc e\ndec e\nld e,1E\nrra\njr nz,20\nld hl,2121\nldi (hl),a\ninc hl\ninc h\ndec h\nld h,26\ndaa\njr z,28\nadd hl,hl\nldi a,(hl)\ndec hl\ninc l\ndec l\nld l,2E\ncpl\njr nc,30\nld sp,3131\nldd (hl),a\ninc sp\ninc (hl)\ndec (hl)\nld (hl),36\nscf\njr c,38\nadd hl,sp\nldd a,(hl)\ndec sp\ninc a\ndec a\nld a,3E\nccf\nld b,b\nld b,c\nld b,d\nld b,e\nld b,h\nld b,l\nld b,(hl)\nld b,a\nld c,b\nld c,c\nld c,d\nld c,e\nld c,h\nld c,l\nld c,(hl)\nld c,a\nld d,b\nld d,c\nld d,d\nld d,e\nld d,h\nld d,l\nld d,(hl)\nld d,a\nld e,b\nld e,c\nld e,d\nld e,e\nld e,h\nld e,l\nld e,(hl)\nld e,a\nld h,b\nld h,c\nld h,d\nld h,e\nld h,h\nld h,l\nld h,(hl)\nld h,a\nld l,b\nld l,c\nld l,d\nld l,e\nld l,h\nld l,l\nld l,(hl)\nld l,a\nld (hl),b\nld (hl),c\nld (hl),d\nld (hl),e\nld (hl),h\nld (hl),l\nhalt\nld (hl),a\nld a,b\nld a,c\nld a,d\nld a,e\nld a,h\nld a,l\nld a,(hl)\nld a,a\nadd b\nadd c\nadd d\nadd e\nadd h\nadd l\nadd (hl)\nadd a\nadc b\nadc c\nadc d\nadc e\nadc h\nadc l\nadc (hl)\nadc a\nsub b\nsub c\nsub d\nsub e\nsub h\nsub l\nsub (hl)\nsub a\nsbc b\nsbc c\nsbc d\nsbc e\nsbc h\nsbc l\nsbc (hl)\nsbc a\nand b\nand c\nand d\nand e\nand h\nand l\nand (hl)\nand a\nxor b\nxor c\nxor d\nxor e\nxor h\nxor l\nxor (hl)\nxor a\nor b\nor c\nor d\nor e\nor h\nor l\nor (hl)\nor a\ncp b\ncp c\ncp d\ncp e\ncp h\ncp l\ncp (hl)\ncp a\nret nz\npop bc\njp nz,C2C2\njp C3C3\ncall nz,C4C4\npush bc\nadd a,C6\nrst 00\nret z\nret\njp z,CACA\ncall z,CCCC\ncall CDCD\nadc a,CE\nrst 08\nret nc\npop de\njp nc,D2D2\nundefined opcode\ncall nc,D4D4\npush de\nsub a,D6\nrst 10\nret c\nreti\njp c,DADA\ncall c,DCDC\nsbc a,DE\nrst 18\nld (ff00+E0),a\npop hl\nld (ff00+c),a\npush hl\nand a,E6\nrst 20\nadd sp,E8\njp hl\nld (EAEA),a\nxor a,EE\nrst 28\nld a,(ff00+F0)\npop af\nld a,(ff00+c)\ndi\npush af\nor a,F6\nrst 30\nld hl,sp+F8\nld sp,hl\nld a,(FAFA)\nei\ncp a,FE\nrst 38";
      const expectedHex =
        "00 01 01 01 02 03 04 05 06 06 07 08 08 08 09 0A 0B 0C 0D 0E 0E 0F 10 11 11 11 12 13 14 15 16 16 17 18 18 19 1A 1B 1C 1D 1E 1E 1F 20 20 21 21 21 22 23 24 25 26 26 27 28 28 29 2A 2B 2C 2D 2E 2E 2F 30 30 31 31 31 32 33 34 35 36 36 37 38 38 39 3A 3B 3C 3D 3E 3E 3F 40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F 50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F 60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F 70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F 80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF C0 C1 C2 C2 C2 C3 C3 C3 C4 C4 C4 C5 C6 C6 C7 C8 C9 CA CA CA CC CC CC CD CD CD CE CE CF D0 D1 D2 D2 D2 D3 D4 D4 D4 D5 D6 D6 D7 D8 D9 DA DA DA DC DC DC DE DE DF E0 E0 E1 E2 E5 E6 E6 E7 E8 E8 E9 EA EA EA EE EE EF F0 F0 F1 F2 F3 F5 F6 F6 F7 F8 F8 F9 FA FA FA FB FE FE FF";

      const result = programToHex(program);
      expect(result).toBe(expectedHex);
    });

    it("should convert CB prefix program to hex correctly", () => {
      const program =
        "rlc b\nrlc c\nrlc d\nrlc e\nrlc h\nrlc l\nrlc (hl)\nrlc a\nrrc b\nrrc c\nrrc d\nrrc e\nrrc h\nrrc l\nrrc (hl)\nrrc a\nrl b\nrl c\nrl d\nrl e\nrl h\nrl l\nrl (hl)\nrl a\nrr b\nrr c\nrr d\nrr e\nrr h\nrr l\nrr (hl)\nrr a\nsla b\nsla c\nsla d\nsla e\nsla h\nsla l\nsla (hl)\nsla a\nsra b\nsra c\nsra d\nsra e\nsra h\nsra l\nsra (hl)\nsra a\nswap b\nswap c\nswap d\nswap e\nswap h\nswap l\nswap (hl)\nswap a\nsrl b\nsrl c\nsrl d\nsrl e\nsrl h\nsrl l\nsrl (hl)\nsrl a\nbit 0,b\nbit 0,c\nbit 0,d\nbit 0,e\nbit 0,h\nbit 0,l\nbit 0,(hl)\nbit 0,a\nbit 1,b\nbit 1,c\nbit 1,d\nbit 1,e\nbit 1,h\nbit 1,l\nbit 1,(hl)\nbit 1,a\nbit 2,b\nbit 2,c\nbit 2,d\nbit 2,e\nbit 2,h\nbit 2,l\nbit 2,(hl)\nbit 2,a\nbit 3,b\nbit 3,c\nbit 3,d\nbit 3,e\nbit 3,h\nbit 3,l\nbit 3,(hl)\nbit 3,a\nbit 4,b\nbit 4,c\nbit 4,d\nbit 4,e\nbit 4,h\nbit 4,l\nbit 4,(hl)\nbit 4,a\nbit 5,b\nbit 5,c\nbit 5,d\nbit 5,e\nbit 5,h\nbit 5,l\nbit 5,(hl)\nbit 5,a\nbit 6,b\nbit 6,c\nbit 6,d\nbit 6,e\nbit 6,h\nbit 6,l\nbit 6,(hl)\nbit 6,a\nbit 7,b\nbit 7,c\nbit 7,d\nbit 7,e\nbit 7,h\nbit 7,l\nbit 7,(hl)\nbit 7,a\nres 0,b\nres 0,c\nres 0,d\nres 0,e\nres 0,h\nres 0,l\nres 0,(hl)\nres 0,a\nres 1,b\nres 1,c\nres 1,d\nres 1,e\nres 1,h\nres 1,l\nres 1,(hl)\nres 1,a\nres 2,b\nres 2,c\nres 2,d\nres 2,e\nres 2,h\nres 2,l\nres 2,(hl)\nres 2,a\nres 3,b\nres 3,c\nres 3,d\nres 3,e\nres 3,h\nres 3,l\nres 3,(hl)\nres 3,a\nres 4,b\nres 4,c\nres 4,d\nres 4,e\nres 4,h\nres 4,l\nres 4,(hl)\nres 4,a\nres 5,b\nres 5,c\nres 5,d\nres 5,e\nres 5,h\nres 5,l\nres 5,(hl)\nres 5,a\nres 6,b\nres 6,c\nres 6,d\nres 6,e\nres 6,h\nres 6,l\nres 6,(hl)\nres 6,a\nres 7,b\nres 7,c\nres 7,d\nres 7,e\nres 7,h\nres 7,l\nres 7,(hl)\nres 7,a\nset 0,b\nset 0,c\nset 0,d\nset 0,e\nset 0,h\nset 0,l\nset 0,(hl)\nset 0,a\nset 1,b\nset 1,c\nset 1,d\nset 1,e\nset 1,h\nset 1,l\nset 1,(hl)\nset 1,a\nset 2,b\nset 2,c\nset 2,d\nset 2,e\nset 2,h\nset 2,l\nset 2,(hl)\nset 2,a\nset 3,b\nset 3,c\nset 3,d\nset 3,e\nset 3,h\nset 3,l\nset 3,(hl)\nset 3,a\nset 4,b\nset 4,c\nset 4,d\nset 4,e\nset 4,h\nset 4,l\nset 4,(hl)\nset 4,a\nset 5,b\nset 5,c\nset 5,d\nset 5,e\nset 5,h\nset 5,l\nset 5,(hl)\nset 5,a\nset 6,b\nset 6,c\nset 6,d\nset 6,e\nset 6,h\nset 6,l\nset 6,(hl)\nset 6,a\nset 7,b\nset 7,c\nset 7,d\nset 7,e\nset 7,h\nset 7,l\nset 7,(hl)\nset 7,a";
      const expectedHex =
        "CB 00 CB 01 CB 02 CB 03 CB 04 CB 05 CB 06 CB 07 CB 08 CB 09 CB 0A CB 0B CB 0C CB 0D CB 0E CB 0F CB 10 CB 11 CB 12 CB 13 CB 14 CB 15 CB 16 CB 17 CB 18 CB 19 CB 1A CB 1B CB 1C CB 1D CB 1E CB 1F CB 20 CB 21 CB 22 CB 23 CB 24 CB 25 CB 26 CB 27 CB 28 CB 29 CB 2A CB 2B CB 2C CB 2D CB 2E CB 2F CB 30 CB 31 CB 32 CB 33 CB 34 CB 35 CB 36 CB 37 CB 38 CB 39 CB 3A CB 3B CB 3C CB 3D CB 3E CB 3F CB 40 CB 41 CB 42 CB 43 CB 44 CB 45 CB 46 CB 47 CB 48 CB 49 CB 4A CB 4B CB 4C CB 4D CB 4E CB 4F CB 50 CB 51 CB 52 CB 53 CB 54 CB 55 CB 56 CB 57 CB 58 CB 59 CB 5A CB 5B CB 5C CB 5D CB 5E CB 5F CB 60 CB 61 CB 62 CB 63 CB 64 CB 65 CB 66 CB 67 CB 68 CB 69 CB 6A CB 6B CB 6C CB 6D CB 6E CB 6F CB 70 CB 71 CB 72 CB 73 CB 74 CB 75 CB 76 CB 77 CB 78 CB 79 CB 7A CB 7B CB 7C CB 7D CB 7E CB 7F CB 80 CB 81 CB 82 CB 83 CB 84 CB 85 CB 86 CB 87 CB 88 CB 89 CB 8A CB 8B CB 8C CB 8D CB 8E CB 8F CB 90 CB 91 CB 92 CB 93 CB 94 CB 95 CB 96 CB 97 CB 98 CB 99 CB 9A CB 9B CB 9C CB 9D CB 9E CB 9F CB A0 CB A1 CB A2 CB A3 CB A4 CB A5 CB A6 CB A7 CB A8 CB A9 CB AA CB AB CB AC CB AD CB AE CB AF CB B0 CB B1 CB B2 CB B3 CB B4 CB B5 CB B6 CB B7 CB B8 CB B9 CB BA CB BB CB BC CB BD CB BE CB BF CB C0 CB C1 CB C2 CB C3 CB C4 CB C5 CB C6 CB C7 CB C8 CB C9 CB CA CB CB CB CC CB CD CB CE CB CF CB D0 CB D1 CB D2 CB D3 CB D4 CB D5 CB D6 CB D7 CB D8 CB D9 CB DA CB DB CB DC CB DD CB DE CB DF CB E0 CB E1 CB E2 CB E3 CB E4 CB E5 CB E6 CB E7 CB E8 CB E9 CB EA CB EB CB EC CB ED CB EE CB EF CB F0 CB F1 CB F2 CB F3 CB F4 CB F5 CB F6 CB F7 CB F8 CB F9 CB FA CB FB CB FC CB FD CB FE CB FF";

      const result = programToHex(program);
      expect(result).toBe(expectedHex);
    });

    it("should convert program db CB to hex CB", () => {
      const program = "db CB";
      const expectedHex = "CB";

      const result = programToHex(program);
      expect(result).toBe(expectedHex);
    });
  });
});
