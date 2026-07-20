import {
  CONDITIONS,
  IMMEDIATE,
  LIST,
  REGISTER,
  REGISTER_NAMES,
  formatImmediate,
  halfwordToHex,
  inRange,
  parseByteDirective,
  parseImmediate,
  parseRegister,
  parseRegisterList,
  signExtend,
} from "./assemblyCommon";
import { normalizeHex } from "./validationUtils";

const SHIFT_OPS = ["lsls", "lsrs", "asrs"];
const IMMEDIATE_OPS = ["movs", "cmp", "adds", "subs"];
const ALU_OPS = [
  "ands",
  "eors",
  "lsls",
  "lsrs",
  "asrs",
  "adcs",
  "sbcs",
  "rors",
  "tst",
  "negs",
  "cmp",
  "cmn",
  "orrs",
  "muls",
  "bics",
  "mvns",
];
const HI_REGISTER_OPS = ["add", "cmp", "mov"];
const REGISTER_TRANSFER_OPS = ["str", "strb", "ldr", "ldrb"];
const SIGNED_TRANSFER_OPS = ["strh", "ldrsb", "ldrh", "ldrsh"];

const formatRegisterList = (mask: number, extra?: string): string => {
  const names = [];
  for (let bit = 0; bit < 8; bit++) {
    if (mask & (1 << bit)) names.push(REGISTER_NAMES[bit]);
  }
  if (extra) names.push(extra);
  return `{${names.join(", ")}}`;
};

const decodeHalfword = (halfword: number): string | null => {
  const rd = halfword & 7;
  const rs = (halfword >> 3) & 7;

  if ((halfword & 0xf800) === 0x1800) {
    const op = (halfword >> 9) & 1 ? "subs" : "adds";
    const value = (halfword >> 6) & 7;
    return (halfword >> 10) & 1
      ? `${op} ${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rs]}, ${formatImmediate(value)}`
      : `${op} ${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rs]}, ${REGISTER_NAMES[value]}`;
  }

  if ((halfword & 0xe000) === 0x0000) {
    const op = SHIFT_OPS[(halfword >> 11) & 3];
    const offset = (halfword >> 6) & 31;
    return `${op} ${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rs]}, ${formatImmediate(offset)}`;
  }

  if ((halfword & 0xe000) === 0x2000) {
    const op = IMMEDIATE_OPS[(halfword >> 11) & 3];
    const register = (halfword >> 8) & 7;
    return `${op} ${REGISTER_NAMES[register]}, ${formatImmediate(halfword & 0xff)}`;
  }

  if ((halfword & 0xfc00) === 0x4000) {
    const op = ALU_OPS[(halfword >> 6) & 15];
    return `${op} ${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rs]}`;
  }

  if ((halfword & 0xfc00) === 0x4400) {
    const op = (halfword >> 8) & 3;
    const highRd = rd | (((halfword >> 7) & 1) << 3);
    const highRs = rs | (((halfword >> 6) & 1) << 3);
    if (op === 3) {
      if ((halfword & 0x87) !== 0) return null;
      return `bx ${REGISTER_NAMES[highRs]}`;
    }
    if (highRd < 8 && highRs < 8) return null;
    return `${HI_REGISTER_OPS[op]} ${REGISTER_NAMES[highRd]}, ${REGISTER_NAMES[highRs]}`;
  }

  if ((halfword & 0xf800) === 0x4800) {
    const register = (halfword >> 8) & 7;
    return `ldr ${REGISTER_NAMES[register]}, [pc, ${formatImmediate((halfword & 0xff) << 2)}]`;
  }

  if ((halfword & 0xf000) === 0x5000) {
    const offsetRegister = (halfword >> 6) & 7;
    const op =
      halfword & 0x0200
        ? SIGNED_TRANSFER_OPS[(halfword >> 10) & 3]
        : REGISTER_TRANSFER_OPS[(halfword >> 10) & 3];
    return `${op} ${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rs]}, ${REGISTER_NAMES[offsetRegister]}]`;
  }

  if ((halfword & 0xe000) === 0x6000) {
    const isByte = (halfword >> 12) & 1;
    const op = `${(halfword >> 11) & 1 ? "ldr" : "str"}${isByte ? "b" : ""}`;
    const offset = ((halfword >> 6) & 31) << (isByte ? 0 : 2);
    return `${op} ${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rs]}, ${formatImmediate(offset)}]`;
  }

  if ((halfword & 0xf000) === 0x8000) {
    const op = (halfword >> 11) & 1 ? "ldrh" : "strh";
    const offset = ((halfword >> 6) & 31) << 1;
    return `${op} ${REGISTER_NAMES[rd]}, [${REGISTER_NAMES[rs]}, ${formatImmediate(offset)}]`;
  }

  if ((halfword & 0xf000) === 0x9000) {
    const op = (halfword >> 11) & 1 ? "ldr" : "str";
    const register = (halfword >> 8) & 7;
    return `${op} ${REGISTER_NAMES[register]}, [sp, ${formatImmediate((halfword & 0xff) << 2)}]`;
  }

  if ((halfword & 0xf000) === 0xa000) {
    const base = (halfword >> 11) & 1 ? "sp" : "pc";
    const register = (halfword >> 8) & 7;
    return `add ${REGISTER_NAMES[register]}, ${base}, ${formatImmediate((halfword & 0xff) << 2)}`;
  }

  if ((halfword & 0xff00) === 0xb000) {
    const op = (halfword >> 7) & 1 ? "sub" : "add";
    return `${op} sp, ${formatImmediate((halfword & 0x7f) << 2)}`;
  }

  if ((halfword & 0xf600) === 0xb400) {
    const isPop = (halfword >> 11) & 1;
    const extra = (halfword >> 8) & 1 ? (isPop ? "pc" : "lr") : undefined;
    return `${isPop ? "pop" : "push"} ${formatRegisterList(halfword & 0xff, extra)}`;
  }

  if ((halfword & 0xf000) === 0xc000) {
    const op = (halfword >> 11) & 1 ? "ldmia" : "stmia";
    const register = (halfword >> 8) & 7;
    return `${op} ${REGISTER_NAMES[register]}!, ${formatRegisterList(halfword & 0xff)}`;
  }

  if ((halfword & 0xf000) === 0xd000) {
    const condition = (halfword >> 8) & 15;
    if (condition === 15) return `swi ${formatImmediate(halfword & 0xff)}`;
    if (condition === 14) return null;
    return `b${CONDITIONS[condition]} ${formatImmediate(signExtend(halfword & 0xff, 8) << 1)}`;
  }

  if ((halfword & 0xf800) === 0xe000) {
    return `b ${formatImmediate(signExtend(halfword & 0x7ff, 11) << 1)}`;
  }

  return null;
};

const BL_PREFIX_MASK = 0xf800;
const BL_HIGH_PREFIX = 0xf000;
const BL_LOW_PREFIX = 0xf800;

const formatHalfwordData = (halfword: number): string => {
  return `.hword 0x${halfword.toString(16).toUpperCase().padStart(4, "0")}`;
};

export const disassembleThumb = (hex: string): string => {
  const hexArray = normalizeHex(hex);
  const result = [];

  for (let i = 0; i < hexArray.length; i += 2) {
    if (i + 1 >= hexArray.length) {
      result.push(`.byte 0x${hexArray[i]}`);
      break;
    }

    const halfword = parseInt(hexArray[i], 16) | (parseInt(hexArray[i + 1], 16) << 8);

    if ((halfword & BL_PREFIX_MASK) === BL_HIGH_PREFIX && i + 3 < hexArray.length) {
      const next = parseInt(hexArray[i + 2], 16) | (parseInt(hexArray[i + 3], 16) << 8);
      if ((next & BL_PREFIX_MASK) === BL_LOW_PREFIX) {
        const offset = (signExtend(halfword & 0x7ff, 11) << 12) | ((next & 0x7ff) << 1);
        result.push(`bl ${formatImmediate(offset)}`);
        i += 2;
        continue;
      }
    }

    result.push(decodeHalfword(halfword) ?? formatHalfwordData(halfword));
  }

  return result.join("\n");
};

const parseLowRegisterList = (body: string): number | null => {
  const mask = parseRegisterList(body);
  return mask === null || mask & ~0xff ? null : mask;
};

interface EncodingRule {
  regex: RegExp;
  encode: (match: RegExpMatchArray) => number[] | null;
}

const lowRegisters = (...registers: number[]): boolean => {
  return registers.every((register) => register >= 0 && register <= 7);
};

const ENCODING_RULES: EncodingRule[] = [
  {
    regex: new RegExp(`^(lsls|lsrs|asrs) ${REGISTER}, ${REGISTER}, ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const op = SHIFT_OPS.indexOf(match[1].toLowerCase());
      const rd = parseRegister(match[2]);
      const rs = parseRegister(match[3]);
      const offset = parseImmediate(match[4]);
      if (!lowRegisters(rd, rs) || offset === null || !inRange(offset, 0, 31, 1)) return null;
      return [(op << 11) | (offset << 6) | (rs << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(adds|subs) ${REGISTER}, ${REGISTER}, ${REGISTER}$`, "i"),
    encode: (match) => {
      const isSub = match[1].toLowerCase() === "subs" ? 1 : 0;
      const rd = parseRegister(match[2]);
      const rs = parseRegister(match[3]);
      const rn = parseRegister(match[4]);
      if (!lowRegisters(rd, rs, rn)) return null;
      return [0x1800 | (isSub << 9) | (rn << 6) | (rs << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(adds|subs) ${REGISTER}, ${REGISTER}, ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const isSub = match[1].toLowerCase() === "subs" ? 1 : 0;
      const rd = parseRegister(match[2]);
      const rs = parseRegister(match[3]);
      const value = parseImmediate(match[4]);
      if (!lowRegisters(rd, rs) || value === null || !inRange(value, 0, 7, 1)) return null;
      return [0x1c00 | (isSub << 9) | (value << 6) | (rs << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(movs|cmp|adds|subs) ${REGISTER}, ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const op = IMMEDIATE_OPS.indexOf(match[1].toLowerCase());
      const rd = parseRegister(match[2]);
      const value = parseImmediate(match[3]);
      if (!lowRegisters(rd) || value === null || !inRange(value, 0, 255, 1)) return null;
      return [0x2000 | (op << 11) | (rd << 8) | value];
    },
  },
  {
    regex: new RegExp(
      `^(ands|eors|lsls|lsrs|asrs|adcs|sbcs|rors|tst|negs|cmp|cmn|orrs|muls|bics|mvns) ${REGISTER}, ${REGISTER}$`,
      "i",
    ),
    encode: (match) => {
      const rd = parseRegister(match[2]);
      const rs = parseRegister(match[3]);
      if (!lowRegisters(rd, rs)) return null;
      const op = ALU_OPS.indexOf(match[1].toLowerCase());
      return [0x4000 | (op << 6) | (rs << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(add|cmp|mov) ${REGISTER}, ${REGISTER}$`, "i"),
    encode: (match) => {
      const op = HI_REGISTER_OPS.indexOf(match[1].toLowerCase());
      const rd = parseRegister(match[2]);
      const rs = parseRegister(match[3]);
      if (rd < 0 || rs < 0) return null;
      if (op === 1 && lowRegisters(rd, rs)) {
        return [0x4280 | (rs << 3) | rd];
      }
      return [0x4400 | (op << 8) | ((rd >> 3) << 7) | (rs << 3) | (rd & 7)];
    },
  },
  {
    regex: new RegExp(`^bx ${REGISTER}$`, "i"),
    encode: (match) => {
      const rs = parseRegister(match[1]);
      if (rs < 0) return null;
      return [0x4700 | (rs << 3)];
    },
  },
  {
    regex: new RegExp(`^ldr ${REGISTER}, \\[pc, ${IMMEDIATE}\\]$`, "i"),
    encode: (match) => {
      const rd = parseRegister(match[1]);
      const offset = parseImmediate(match[2]);
      if (!lowRegisters(rd) || offset === null || !inRange(offset, 0, 1020, 4)) return null;
      return [0x4800 | (rd << 8) | (offset >> 2)];
    },
  },
  {
    regex: new RegExp(`^(str|strb|ldr|ldrb) ${REGISTER}, \\[${REGISTER}, ${REGISTER}\\]$`, "i"),
    encode: (match) => {
      const op = REGISTER_TRANSFER_OPS.indexOf(match[1].toLowerCase());
      const rd = parseRegister(match[2]);
      const rb = parseRegister(match[3]);
      const ro = parseRegister(match[4]);
      if (!lowRegisters(rd, rb, ro)) return null;
      return [0x5000 | (op << 10) | (ro << 6) | (rb << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(strh|ldrsb|ldrh|ldrsh) ${REGISTER}, \\[${REGISTER}, ${REGISTER}\\]$`, "i"),
    encode: (match) => {
      const op = SIGNED_TRANSFER_OPS.indexOf(match[1].toLowerCase());
      const rd = parseRegister(match[2]);
      const rb = parseRegister(match[3]);
      const ro = parseRegister(match[4]);
      if (!lowRegisters(rd, rb, ro)) return null;
      return [0x5200 | (op << 10) | (ro << 6) | (rb << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(str|ldr) ${REGISTER}, \\[sp, ${IMMEDIATE}\\]$`, "i"),
    encode: (match) => {
      const isLoad = match[1].toLowerCase() === "ldr" ? 1 : 0;
      const rd = parseRegister(match[2]);
      const offset = parseImmediate(match[3]);
      if (!lowRegisters(rd) || offset === null || !inRange(offset, 0, 1020, 4)) return null;
      return [0x9000 | (isLoad << 11) | (rd << 8) | (offset >> 2)];
    },
  },
  {
    regex: new RegExp(`^(str|ldr) ${REGISTER}, \\[${REGISTER}, ${IMMEDIATE}\\]$`, "i"),
    encode: (match) => {
      const isLoad = match[1].toLowerCase() === "ldr" ? 1 : 0;
      const rd = parseRegister(match[2]);
      const rb = parseRegister(match[3]);
      const offset = parseImmediate(match[4]);
      if (!lowRegisters(rd, rb) || offset === null || !inRange(offset, 0, 124, 4)) return null;
      return [0x6000 | (isLoad << 11) | ((offset >> 2) << 6) | (rb << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(strb|ldrb) ${REGISTER}, \\[${REGISTER}, ${IMMEDIATE}\\]$`, "i"),
    encode: (match) => {
      const isLoad = match[1].toLowerCase() === "ldrb" ? 1 : 0;
      const rd = parseRegister(match[2]);
      const rb = parseRegister(match[3]);
      const offset = parseImmediate(match[4]);
      if (!lowRegisters(rd, rb) || offset === null || !inRange(offset, 0, 31, 1)) return null;
      return [0x7000 | (isLoad << 11) | (offset << 6) | (rb << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^(strh|ldrh) ${REGISTER}, \\[${REGISTER}, ${IMMEDIATE}\\]$`, "i"),
    encode: (match) => {
      const isLoad = match[1].toLowerCase() === "ldrh" ? 1 : 0;
      const rd = parseRegister(match[2]);
      const rb = parseRegister(match[3]);
      const offset = parseImmediate(match[4]);
      if (!lowRegisters(rd, rb) || offset === null || !inRange(offset, 0, 62, 2)) return null;
      return [0x8000 | (isLoad << 11) | ((offset >> 1) << 6) | (rb << 3) | rd];
    },
  },
  {
    regex: new RegExp(`^add ${REGISTER}, (pc|sp), ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const rd = parseRegister(match[1]);
      const isSp = match[2].toLowerCase() === "sp" ? 1 : 0;
      const offset = parseImmediate(match[3]);
      if (!lowRegisters(rd) || offset === null || !inRange(offset, 0, 1020, 4)) return null;
      return [0xa000 | (isSp << 11) | (rd << 8) | (offset >> 2)];
    },
  },
  {
    regex: new RegExp(`^(add|sub) sp, ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const isSub = match[1].toLowerCase() === "sub" ? 1 : 0;
      const offset = parseImmediate(match[2]);
      if (offset === null || !inRange(offset, 0, 508, 4)) return null;
      return [0xb000 | (isSub << 7) | (offset >> 2)];
    },
  },
  {
    regex: new RegExp(`^(push|pop) ${LIST}$`, "i"),
    encode: (match) => {
      const isPop = match[1].toLowerCase() === "pop" ? 1 : 0;
      const extraName = isPop ? "pc" : "lr";
      const tokens = match[2].trim() === "" ? [] : match[2].split(",").map((token) => token.trim());
      const extraIndex = tokens.findIndex((token) => token.toLowerCase() === extraName);
      const hasExtra = extraIndex !== -1 ? 1 : 0;
      const listTokens = tokens.filter((_, index) => index !== extraIndex);
      const mask = parseLowRegisterList(listTokens.join(","));
      if (mask === null) return null;
      return [0xb400 | (isPop << 11) | (hasExtra << 8) | mask];
    },
  },
  {
    regex: new RegExp(`^(stmia|ldmia) ${REGISTER}!, ${LIST}$`, "i"),
    encode: (match) => {
      const isLoad = match[1].toLowerCase() === "ldmia" ? 1 : 0;
      const rb = parseRegister(match[2]);
      const mask = parseLowRegisterList(match[3]);
      if (!lowRegisters(rb) || mask === null) return null;
      return [0xc000 | (isLoad << 11) | (rb << 8) | mask];
    },
  },
  {
    regex: new RegExp(`^b(${CONDITIONS.join("|")}) ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const condition = CONDITIONS.indexOf(match[1].toLowerCase());
      const offset = parseImmediate(match[2]);
      if (offset === null || offset % 2 !== 0 || offset < -256 || offset > 254) return null;
      return [0xd000 | (condition << 8) | ((offset >> 1) & 0xff)];
    },
  },
  {
    regex: new RegExp(`^swi ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const value = parseImmediate(match[1]);
      if (value === null || !inRange(value, 0, 255, 1)) return null;
      return [0xdf00 | value];
    },
  },
  {
    regex: new RegExp(`^b ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const offset = parseImmediate(match[1]);
      if (offset === null || offset % 2 !== 0 || offset < -2048 || offset > 2046) return null;
      return [0xe000 | ((offset >> 1) & 0x7ff)];
    },
  },
  {
    regex: new RegExp(`^bl ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const offset = parseImmediate(match[1]);
      if (offset === null || offset % 2 !== 0 || offset < -0x400000 || offset > 0x3ffffe) {
        return null;
      }
      return [0xf000 | ((offset >> 12) & 0x7ff), 0xf800 | ((offset >> 1) & 0x7ff)];
    },
  },
  {
    regex: new RegExp(`^\\.hword ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const value = parseImmediate(match[1]);
      if (value === null || !inRange(value, 0, 0xffff, 1)) return null;
      return [value];
    },
  },
];

const encodeLine = (line: string): string | null => {
  const byte = parseByteDirective(line);
  if (byte !== null) return byte;

  for (const { regex, encode } of ENCODING_RULES) {
    const match = line.match(regex);
    if (!match) continue;
    const halfwords = encode(match);
    if (!halfwords) continue;
    return halfwords.map(halfwordToHex).join(" ");
  }

  return null;
};

export const assembleThumb = (program: string): string => {
  return program
    .split("\n")
    .map((line) => encodeLine(line.replace(/\s+/g, " ").trim()))
    .filter((hex): hex is string => hex !== null && hex !== "")
    .join(" ");
};
