import {
  CONDITIONS,
  IMMEDIATE,
  REGISTER,
  REGISTER_NAMES,
  formatImmediate,
  inRange,
  parseImmediate,
  parseRegister,
  signExtend,
  toHexByte,
} from "./assemblyCommon";
import { normalizeHex } from "./validationUtils";

const DATA_PROCESSING_OPS = [
  "and",
  "eor",
  "sub",
  "rsb",
  "add",
  "adc",
  "sbc",
  "rsc",
  "tst",
  "teq",
  "cmp",
  "cmn",
  "orr",
  "mov",
  "bic",
  "mvn",
];
const SHIFT_NAMES = ["lsl", "lsr", "asr", "ror"];
const MULTIPLY_LONG_OPS = ["umull", "umlal", "smull", "smlal"];
const HALFWORD_LOAD_OPS = ["ldrh", "ldrsb", "ldrsh"];
const PSR_FIELD_BITS = [
  { bit: 1 << 19, name: "f" },
  { bit: 1 << 18, name: "s" },
  { bit: 1 << 17, name: "x" },
  { bit: 1 << 16, name: "c" },
];

const ror32 = (value: number, amount: number): number => {
  if (amount === 0) return value >>> 0;
  return ((value >>> amount) | (value << (32 - amount))) >>> 0;
};

const rol32 = (value: number, amount: number): number => {
  if (amount === 0) return value >>> 0;
  return ((value << amount) | (value >>> (32 - amount))) >>> 0;
};

const encodeRotatedImmediate = (value: number): number | null => {
  const unsigned = value >>> 0;
  for (let field = 0; field < 16; field++) {
    const imm8 = rol32(unsigned, field * 2);
    if (imm8 <= 0xff) return (field << 8) | imm8;
  }
  return null;
};

const decodeRotatedImmediate = (word: number): string => {
  const imm8 = word & 0xff;
  const rotationField = (word >> 8) & 15;
  const value = ror32(imm8, rotationField * 2);
  const canonical = encodeRotatedImmediate(value);
  if (canonical === ((rotationField << 8) | imm8)) return formatImmediate(value);
  return `${formatImmediate(imm8)}, ${formatImmediate(rotationField * 2)}`;
};

const decodeShiftedRegister = (word: number): string | null => {
  const rm = REGISTER_NAMES[word & 15];
  const type = (word >> 5) & 3;

  if (word & 0x10) {
    if (word & 0x80) return null;
    return `${rm}, ${SHIFT_NAMES[type]} ${REGISTER_NAMES[(word >> 8) & 15]}`;
  }

  const amount = (word >> 7) & 31;
  if (type === 0) return amount === 0 ? rm : `${rm}, lsl ${formatImmediate(amount)}`;
  if (type === 1) return `${rm}, lsr ${formatImmediate(amount === 0 ? 32 : amount)}`;
  if (type === 2) return `${rm}, asr ${formatImmediate(amount === 0 ? 32 : amount)}`;
  return amount === 0 ? `${rm}, rrx` : `${rm}, ror ${formatImmediate(amount)}`;
};

const formatOffsetImmediate = (value: number, isUp: number): string => {
  return `#${isUp ? "" : "-"}0x${value.toString(16).toUpperCase()}`;
};

const formatAddress = (
  baseRegister: number,
  offset: string,
  hasOffset: boolean,
  isPreIndexed: number,
  writesBack: number,
): string => {
  const base = REGISTER_NAMES[baseRegister];
  if (!isPreIndexed) return `[${base}], ${offset}`;
  const inner = hasOffset ? `[${base}, ${offset}]` : `[${base}]`;
  return writesBack ? `${inner}!` : inner;
};

const formatFullRegisterList = (mask: number): string => {
  const names = [];
  for (let bit = 0; bit < 16; bit++) {
    if (mask & (1 << bit)) names.push(REGISTER_NAMES[bit]);
  }
  return `{${names.join(", ")}}`;
};

const decodeWord = (word: number): string | null => {
  const conditionIndex = (word >>> 28) & 15;
  if (conditionIndex === 15) return null;
  const cond = conditionIndex === 14 ? "" : CONDITIONS[conditionIndex];

  if ((word & 0x0ffffff0) === 0x012fff10) {
    return `bx${cond} ${REGISTER_NAMES[word & 15]}`;
  }

  if ((word & 0x0fbf0fff) === 0x010f0000) {
    const psr = (word >> 22) & 1 ? "spsr" : "cpsr";
    return `mrs${cond} ${REGISTER_NAMES[(word >> 12) & 15]}, ${psr}`;
  }

  if ((word & 0x0fb0fff0) === 0x0120f000 || (word & 0x0fb0f000) === 0x0320f000) {
    const psr = (word >> 22) & 1 ? "spsr" : "cpsr";
    const fields = PSR_FIELD_BITS.filter(({ bit }) => word & bit)
      .map(({ name }) => name)
      .join("");
    const operand = (word >> 25) & 1 ? decodeRotatedImmediate(word) : REGISTER_NAMES[word & 15];
    return `msr${cond} ${psr}_${fields}, ${operand}`;
  }

  if ((word & 0x0fc000f0) === 0x00000090) {
    const setsFlags = (word >> 20) & 1 ? "s" : "";
    const rd = REGISTER_NAMES[(word >> 16) & 15];
    const rn = (word >> 12) & 15;
    const rs = REGISTER_NAMES[(word >> 8) & 15];
    const rm = REGISTER_NAMES[word & 15];
    if ((word >> 21) & 1) {
      return `mla${cond}${setsFlags} ${rd}, ${rm}, ${rs}, ${REGISTER_NAMES[rn]}`;
    }
    if (rn !== 0) return null;
    return `mul${cond}${setsFlags} ${rd}, ${rm}, ${rs}`;
  }

  if ((word & 0x0f8000f0) === 0x00800090) {
    const op = MULTIPLY_LONG_OPS[(word >> 21) & 3];
    const setsFlags = (word >> 20) & 1 ? "s" : "";
    const rdHi = REGISTER_NAMES[(word >> 16) & 15];
    const rdLo = REGISTER_NAMES[(word >> 12) & 15];
    const rs = REGISTER_NAMES[(word >> 8) & 15];
    const rm = REGISTER_NAMES[word & 15];
    return `${op}${cond}${setsFlags} ${rdLo}, ${rdHi}, ${rm}, ${rs}`;
  }

  if ((word & 0x0fb00ff0) === 0x01000090) {
    const byteSuffix = (word >> 22) & 1 ? "b" : "";
    const rn = REGISTER_NAMES[(word >> 16) & 15];
    const rd = REGISTER_NAMES[(word >> 12) & 15];
    return `swp${cond}${byteSuffix} ${rd}, ${REGISTER_NAMES[word & 15]}, [${rn}]`;
  }

  if ((word & 0x0e000090) === 0x00000090) {
    const shBits = (word >> 5) & 3;
    if (shBits === 0) return null;
    const isPreIndexed = (word >> 24) & 1;
    const isUp = (word >> 23) & 1;
    const isImmediate = (word >> 22) & 1;
    const writesBack = (word >> 21) & 1;
    const isLoad = (word >> 20) & 1;
    if (!isPreIndexed && writesBack) return null;
    if (!isLoad && shBits !== 1) return null;

    const name = isLoad ? `ldr${cond}${HALFWORD_LOAD_OPS[shBits - 1].slice(3)}` : `str${cond}h`;
    const rn = (word >> 16) & 15;
    const rd = REGISTER_NAMES[(word >> 12) & 15];

    let offset: string;
    let hasOffset: boolean;
    if (isImmediate) {
      const value = (((word >> 8) & 15) << 4) | (word & 15);
      offset = formatOffsetImmediate(value, isUp);
      hasOffset = value !== 0 || !isUp;
    } else {
      if ((word >> 8) & 15) return null;
      offset = `${isUp ? "" : "-"}${REGISTER_NAMES[word & 15]}`;
      hasOffset = true;
    }
    return `${name} ${rd}, ${formatAddress(rn, offset, hasOffset, isPreIndexed, writesBack)}`;
  }

  if ((word & 0x0c000000) === 0x00000000) {
    const opcode = (word >> 21) & 15;
    const setsFlags = (word >> 20) & 1;
    const rn = (word >> 16) & 15;
    const rd = (word >> 12) & 15;
    const operand = (word >> 25) & 1 ? decodeRotatedImmediate(word) : decodeShiftedRegister(word);
    if (operand === null) return null;

    const name = DATA_PROCESSING_OPS[opcode];
    if (opcode >= 8 && opcode <= 11) {
      if (!setsFlags || rd !== 0) return null;
      return `${name}${cond} ${REGISTER_NAMES[rn]}, ${operand}`;
    }
    const suffix = setsFlags ? "s" : "";
    if (opcode === 13 || opcode === 15) {
      if (rn !== 0) return null;
      return `${name}${cond}${suffix} ${REGISTER_NAMES[rd]}, ${operand}`;
    }
    return `${name}${cond}${suffix} ${REGISTER_NAMES[rd]}, ${REGISTER_NAMES[rn]}, ${operand}`;
  }

  if ((word & 0x0c000000) === 0x04000000) {
    const isRegisterOffset = (word >> 25) & 1;
    if (isRegisterOffset && word & 0x10) return null;
    const isPreIndexed = (word >> 24) & 1;
    const isUp = (word >> 23) & 1;
    const isByte = (word >> 22) & 1;
    const writesBack = (word >> 21) & 1;
    const isLoad = (word >> 20) & 1;
    const rn = (word >> 16) & 15;
    const rd = REGISTER_NAMES[(word >> 12) & 15];

    let offset: string;
    let hasOffset: boolean;
    if (isRegisterOffset) {
      const shifted = decodeShiftedRegister(word);
      if (shifted === null) return null;
      offset = `${isUp ? "" : "-"}${shifted}`;
      hasOffset = true;
    } else {
      const value = word & 0xfff;
      offset = formatOffsetImmediate(value, isUp);
      hasOffset = value !== 0 || !isUp;
    }

    const userMode = !isPreIndexed && writesBack ? "t" : "";
    const name = `${isLoad ? "ldr" : "str"}${cond}${isByte ? "b" : ""}${userMode}`;
    return `${name} ${rd}, ${formatAddress(rn, offset, hasOffset, isPreIndexed, writesBack)}`;
  }

  if ((word & 0x0e000000) === 0x08000000) {
    const isPreIndexed = (word >> 24) & 1;
    const isUp = (word >> 23) & 1;
    const psrSuffix = (word >> 22) & 1 ? "^" : "";
    const writeBack = (word >> 21) & 1 ? "!" : "";
    const isLoad = (word >> 20) & 1;
    const mode = isPreIndexed ? (isUp ? "ib" : "db") : isUp ? "ia" : "da";
    const rn = REGISTER_NAMES[(word >> 16) & 15];
    const list = formatFullRegisterList(word & 0xffff);
    return `${isLoad ? "ldm" : "stm"}${cond}${mode} ${rn}${writeBack}, ${list}${psrSuffix}`;
  }

  if ((word & 0x0e000000) === 0x0a000000) {
    const link = (word >> 24) & 1 ? "l" : "";
    return `b${link}${cond} ${formatImmediate(signExtend(word & 0xffffff, 24) << 2)}`;
  }

  if ((word & 0x0f000000) === 0x0f000000) {
    return `swi${cond} ${formatImmediate(word & 0xffffff)}`;
  }

  return null;
};

const formatWordData = (word: number): string => {
  return `.word 0x${(word >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
};

export const disassembleArm = (hex: string): string => {
  const hexArray = normalizeHex(hex);
  const result = [];

  let i = 0;
  for (; i + 3 < hexArray.length; i += 4) {
    const word =
      (parseInt(hexArray[i], 16) |
        (parseInt(hexArray[i + 1], 16) << 8) |
        (parseInt(hexArray[i + 2], 16) << 16) |
        (parseInt(hexArray[i + 3], 16) << 24)) >>>
      0;
    result.push(decodeWord(word) ?? formatWordData(word));
  }

  if (i + 1 < hexArray.length) {
    const halfword = parseInt(hexArray[i], 16) | (parseInt(hexArray[i + 1], 16) << 8);
    result.push(`.hword 0x${halfword.toString(16).toUpperCase().padStart(4, "0")}`);
    i += 2;
  }
  if (i < hexArray.length) {
    result.push(`.byte 0x${hexArray[i]}`);
  }

  return result.join("\n");
};

const COND = "(eq|ne|cs|cc|mi|pl|vs|vc|hi|ls|ge|lt|gt|le|al)?";
const SIGNED_OFFSET = "#(-?)(0x[0-9A-Fa-f]+|\\d+)";

const parseCondition = (token: string | undefined): number => {
  if (!token || token.toLowerCase() === "al") return 14;
  return CONDITIONS.indexOf(token.toLowerCase());
};

const parseShiftedRegisterOperand = (text: string): number | null => {
  let match = text.match(/^(\w+)$/);
  if (match) {
    const rm = parseRegister(match[1]);
    return rm < 0 ? null : rm;
  }

  match = text.match(/^(\w+), rrx$/i);
  if (match) {
    const rm = parseRegister(match[1]);
    return rm < 0 ? null : (3 << 5) | rm;
  }

  match = text.match(new RegExp(`^(\\w+), (lsl|lsr|asr|ror) ${IMMEDIATE}$`, "i"));
  if (match) {
    const rm = parseRegister(match[1]);
    const type = SHIFT_NAMES.indexOf(match[2].toLowerCase());
    const amount = parseImmediate(match[3]);
    if (rm < 0 || amount === null) return null;
    if (type === 0 && inRange(amount, 0, 31, 1)) return (amount << 7) | rm;
    if ((type === 1 || type === 2) && inRange(amount, 1, 32, 1)) {
      return (((amount === 32 ? 0 : amount) & 31) << 7) | (type << 5) | rm;
    }
    if (type === 3 && inRange(amount, 1, 31, 1)) return (amount << 7) | (type << 5) | rm;
    return null;
  }

  match = text.match(/^(\w+), (lsl|lsr|asr|ror) (\w+)$/i);
  if (match) {
    const rm = parseRegister(match[1]);
    const type = SHIFT_NAMES.indexOf(match[2].toLowerCase());
    const rs = parseRegister(match[3]);
    if (rm < 0 || rs < 0) return null;
    return (rs << 8) | (type << 5) | 0x10 | rm;
  }

  return null;
};

const parseOperand2 = (text: string): { isImmediate: boolean; bits: number } | null => {
  const trimmed = text.trim();

  const pairMatch = trimmed.match(/^#(0x[0-9A-Fa-f]+|\d+), #(0x[0-9A-Fa-f]+|\d+)$/i);
  if (pairMatch) {
    const imm8 = parseImmediate(pairMatch[1]);
    const rotation = parseImmediate(pairMatch[2]);
    if (imm8 === null || rotation === null) return null;
    if (!inRange(imm8, 0, 255, 1) || !inRange(rotation, 0, 30, 2)) return null;
    return { isImmediate: true, bits: ((rotation / 2) << 8) | imm8 };
  }

  const immediateMatch = trimmed.match(/^#(-?)(0x[0-9A-Fa-f]+|\d+)$/i);
  if (immediateMatch) {
    const magnitude = parseImmediate(immediateMatch[2]);
    if (magnitude === null) return null;
    const value = immediateMatch[1] === "-" ? -magnitude >>> 0 : magnitude >>> 0;
    const encoded = encodeRotatedImmediate(value);
    if (encoded === null) return null;
    return { isImmediate: true, bits: encoded };
  }

  const shifted = parseShiftedRegisterOperand(trimmed);
  if (shifted === null) return null;
  return { isImmediate: false, bits: shifted };
};

interface AddressInfo {
  preIndexed: number;
  up: number;
  writeBack: number;
  baseRegister: number;
  registerOffset: boolean;
  bits: number;
}

const parseWordAddress = (text: string): AddressInfo | null => {
  let match = text.match(/^\[(\w+)\](!?)$/);
  if (match) {
    const rn = parseRegister(match[1]);
    if (rn < 0) return null;
    return {
      preIndexed: 1,
      up: 1,
      writeBack: match[2] ? 1 : 0,
      baseRegister: rn,
      registerOffset: false,
      bits: 0,
    };
  }

  match = text.match(new RegExp(`^\\[(\\w+), ${SIGNED_OFFSET}\\](!?)$`, "i"));
  if (match) {
    const rn = parseRegister(match[1]);
    const value = parseImmediate(match[3]);
    if (rn < 0 || value === null || !inRange(value, 0, 0xfff, 1)) return null;
    return {
      preIndexed: 1,
      up: match[2] === "-" ? 0 : 1,
      writeBack: match[4] ? 1 : 0,
      baseRegister: rn,
      registerOffset: false,
      bits: value,
    };
  }

  match = text.match(/^\[(\w+), (-?)([^\]]+)\](!?)$/);
  if (match) {
    const rn = parseRegister(match[1]);
    const shifted = parseShiftedRegisterOperand(match[3].trim());
    if (rn < 0 || shifted === null || shifted & 0x10) return null;
    return {
      preIndexed: 1,
      up: match[2] === "-" ? 0 : 1,
      writeBack: match[4] ? 1 : 0,
      baseRegister: rn,
      registerOffset: true,
      bits: shifted,
    };
  }

  match = text.match(new RegExp(`^\\[(\\w+)\\], ${SIGNED_OFFSET}$`, "i"));
  if (match) {
    const rn = parseRegister(match[1]);
    const value = parseImmediate(match[3]);
    if (rn < 0 || value === null || !inRange(value, 0, 0xfff, 1)) return null;
    return {
      preIndexed: 0,
      up: match[2] === "-" ? 0 : 1,
      writeBack: 0,
      baseRegister: rn,
      registerOffset: false,
      bits: value,
    };
  }

  match = text.match(/^\[(\w+)\], (-?)(.+)$/);
  if (match) {
    const rn = parseRegister(match[1]);
    const shifted = parseShiftedRegisterOperand(match[3].trim());
    if (rn < 0 || shifted === null || shifted & 0x10) return null;
    return {
      preIndexed: 0,
      up: match[2] === "-" ? 0 : 1,
      writeBack: 0,
      baseRegister: rn,
      registerOffset: true,
      bits: shifted,
    };
  }

  return null;
};

const parseHalfwordAddress = (text: string): AddressInfo | null => {
  const address = parseWordAddress(text);
  if (address === null) return null;
  if (address.registerOffset) {
    if (address.bits & 0xff0) return null;
  } else if (address.bits > 0xff) {
    return null;
  }
  return address;
};

const parseFullRegisterList = (body: string): number | null => {
  let mask = 0;
  const trimmed = body.trim();
  if (trimmed === "") return 0;

  for (const token of trimmed.split(",")) {
    const range = token.trim().split("-");
    if (range.length === 2) {
      const start = parseRegister(range[0].trim());
      const end = parseRegister(range[1].trim());
      if (start < 0 || end < 0 || start > end) return null;
      for (let register = start; register <= end; register++) mask |= 1 << register;
      continue;
    }
    const register = parseRegister(token.trim());
    if (register < 0) return null;
    mask |= 1 << register;
  }
  return mask;
};

interface ArmEncodingRule {
  regex: RegExp;
  encode: (match: RegExpMatchArray) => number | null;
}

const validRegisters = (...registers: number[]): boolean => {
  return registers.every((register) => register >= 0);
};

const encodeDataProcessing = (
  condition: number,
  opcode: number,
  setsFlags: number,
  rn: number,
  rd: number,
  operand: { isImmediate: boolean; bits: number },
): number => {
  return (
    ((condition << 28) |
      ((operand.isImmediate ? 1 : 0) << 25) |
      (opcode << 21) |
      (setsFlags << 20) |
      (rn << 16) |
      (rd << 12) |
      operand.bits) >>>
    0
  );
};

const encodeHalfwordTransfer = (
  condition: number,
  isLoad: number,
  shBits: number,
  rd: number,
  address: AddressInfo,
): number => {
  const offsetBits = address.registerOffset
    ? address.bits & 15
    : (((address.bits >> 4) & 15) << 8) | (address.bits & 15);
  return (
    ((condition << 28) |
      (address.preIndexed << 24) |
      (address.up << 23) |
      ((address.registerOffset ? 0 : 1) << 22) |
      (address.writeBack << 21) |
      (isLoad << 20) |
      (address.baseRegister << 16) |
      (rd << 12) |
      (shBits << 5) |
      0x90 |
      offsetBits) >>>
    0
  );
};

const ARM_ENCODING_RULES: ArmEncodingRule[] = [
  {
    regex: new RegExp(`^bx${COND} ${REGISTER}$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rm = parseRegister(match[2]);
      if (condition < 0 || rm < 0) return null;
      return (condition << 28) | 0x012fff10 | rm;
    },
  },
  {
    regex: new RegExp(`^mrs${COND} ${REGISTER}, (cpsr|spsr)$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rd = parseRegister(match[2]);
      if (condition < 0 || rd < 0) return null;
      const psrBit = match[3].toLowerCase() === "spsr" ? 1 << 22 : 0;
      return (condition << 28) | 0x010f0000 | psrBit | (rd << 12);
    },
  },
  {
    regex: new RegExp(`^msr${COND} (cpsr|spsr)_([fsxc]*), (.+)$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      if (condition < 0) return null;
      const psrBit = match[2].toLowerCase() === "spsr" ? 1 << 22 : 0;
      let fieldMask = 0;
      for (const field of match[3].toLowerCase()) {
        const entry = PSR_FIELD_BITS.find(({ name }) => name === field);
        if (!entry || fieldMask & entry.bit) return null;
        fieldMask |= entry.bit;
      }
      const operand = parseOperand2(match[4]);
      if (operand === null) return null;
      if (!operand.isImmediate && operand.bits & 0xff0) return null;
      const immediateBit = operand.isImmediate ? 1 << 25 : 0;
      return (
        ((condition << 28) | immediateBit | 0x0120f000 | psrBit | fieldMask | operand.bits) >>> 0
      );
    },
  },
  {
    regex: new RegExp(`^mul${COND}(s?) ${REGISTER}, ${REGISTER}, ${REGISTER}$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rd = parseRegister(match[3]);
      const rm = parseRegister(match[4]);
      const rs = parseRegister(match[5]);
      if (condition < 0 || !validRegisters(rd, rm, rs)) return null;
      const setsFlags = match[2] ? 1 << 20 : 0;
      return (condition << 28) | setsFlags | (rd << 16) | (rs << 8) | 0x90 | rm;
    },
  },
  {
    regex: new RegExp(`^mla${COND}(s?) ${REGISTER}, ${REGISTER}, ${REGISTER}, ${REGISTER}$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rd = parseRegister(match[3]);
      const rm = parseRegister(match[4]);
      const rs = parseRegister(match[5]);
      const rn = parseRegister(match[6]);
      if (condition < 0 || !validRegisters(rd, rm, rs, rn)) return null;
      const setsFlags = match[2] ? 1 << 20 : 0;
      return (
        (condition << 28) | (1 << 21) | setsFlags | (rd << 16) | (rn << 12) | (rs << 8) | 0x90 | rm
      );
    },
  },
  {
    regex: new RegExp(
      `^(umull|umlal|smull|smlal)${COND}(s?) ${REGISTER}, ${REGISTER}, ${REGISTER}, ${REGISTER}$`,
      "i",
    ),
    encode: (match) => {
      const op = MULTIPLY_LONG_OPS.indexOf(match[1].toLowerCase());
      const condition = parseCondition(match[2]);
      const rdLo = parseRegister(match[4]);
      const rdHi = parseRegister(match[5]);
      const rm = parseRegister(match[6]);
      const rs = parseRegister(match[7]);
      if (condition < 0 || !validRegisters(rdLo, rdHi, rm, rs)) return null;
      const setsFlags = match[3] ? 1 << 20 : 0;
      return (
        ((condition << 28) |
          (1 << 23) |
          (op << 21) |
          setsFlags |
          (rdHi << 16) |
          (rdLo << 12) |
          (rs << 8) |
          0x90 |
          rm) >>>
        0
      );
    },
  },
  {
    regex: new RegExp(`^swp${COND}(b?) ${REGISTER}, ${REGISTER}, \\[${REGISTER}\\]$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rd = parseRegister(match[3]);
      const rm = parseRegister(match[4]);
      const rn = parseRegister(match[5]);
      if (condition < 0 || !validRegisters(rd, rm, rn)) return null;
      const byteBit = match[2] ? 1 << 22 : 0;
      return (condition << 28) | 0x01000090 | byteBit | (rn << 16) | (rd << 12) | rm;
    },
  },
  {
    regex: new RegExp(`^ldr${COND}(h|sb|sh) ${REGISTER}, (.+)$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rd = parseRegister(match[3]);
      const address = parseHalfwordAddress(match[4].trim());
      if (condition < 0 || rd < 0 || address === null) return null;
      const shBits = ["h", "sb", "sh"].indexOf(match[2].toLowerCase()) + 1;
      return encodeHalfwordTransfer(condition, 1, shBits, rd, address);
    },
  },
  {
    regex: new RegExp(`^str${COND}h ${REGISTER}, (.+)$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const rd = parseRegister(match[2]);
      const address = parseHalfwordAddress(match[3].trim());
      if (condition < 0 || rd < 0 || address === null) return null;
      return encodeHalfwordTransfer(condition, 0, 1, rd, address);
    },
  },
  {
    regex: new RegExp(`^(ldr|str)${COND}(b?)(t?) ${REGISTER}, (.+)$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[2]);
      const rd = parseRegister(match[5]);
      const address = parseWordAddress(match[6].trim());
      if (condition < 0 || rd < 0 || address === null) return null;

      const isLoad = match[1].toLowerCase() === "ldr" ? 1 : 0;
      const userMode = match[4] ? 1 : 0;
      if (userMode && (address.preIndexed || address.writeBack)) return null;
      const writeBack = userMode ? 1 : address.writeBack;

      return (
        ((condition << 28) |
          (1 << 26) |
          ((address.registerOffset ? 1 : 0) << 25) |
          (address.preIndexed << 24) |
          (address.up << 23) |
          ((match[3] ? 1 : 0) << 22) |
          (writeBack << 21) |
          (isLoad << 20) |
          (address.baseRegister << 16) |
          (rd << 12) |
          address.bits) >>>
        0
      );
    },
  },
  {
    regex: new RegExp(`^(ldm|stm)${COND}(ia|ib|da|db) ${REGISTER}(!?), \\{([^}]*)\\}(\\^?)$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[2]);
      const rn = parseRegister(match[4]);
      const mask = parseFullRegisterList(match[6]);
      if (condition < 0 || rn < 0 || mask === null) return null;
      const isLoad = match[1].toLowerCase() === "ldm" ? 1 : 0;
      const modeName = match[3].toLowerCase();
      const preIndexed = modeName === "ib" || modeName === "db" ? 1 : 0;
      const up = modeName === "ia" || modeName === "ib" ? 1 : 0;
      return (
        ((condition << 28) |
          (1 << 27) |
          (preIndexed << 24) |
          (up << 23) |
          ((match[7] ? 1 : 0) << 22) |
          ((match[5] ? 1 : 0) << 21) |
          (isLoad << 20) |
          (rn << 16) |
          mask) >>>
        0
      );
    },
  },
  {
    regex: new RegExp(`^b(l?)${COND} ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[2]);
      const offset = parseImmediate(match[3]);
      if (condition < 0 || offset === null) return null;
      if (offset % 4 !== 0 || offset < -0x2000000 || offset > 0x1fffffc) return null;
      const link = match[1] ? 1 << 24 : 0;
      return ((condition << 28) | (5 << 25) | link | ((offset >> 2) & 0xffffff)) >>> 0;
    },
  },
  {
    regex: new RegExp(`^swi${COND} ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const condition = parseCondition(match[1]);
      const value = parseImmediate(match[2]);
      if (condition < 0 || value === null || !inRange(value, 0, 0xffffff, 1)) return null;
      return ((condition << 28) | (0xf << 24) | value) >>> 0;
    },
  },
  {
    regex: new RegExp(
      `^(and|eor|sub|rsb|add|adc|sbc|rsc|orr|bic)${COND}(s?) ${REGISTER}, ${REGISTER}, (.+)$`,
      "i",
    ),
    encode: (match) => {
      const opcode = DATA_PROCESSING_OPS.indexOf(match[1].toLowerCase());
      const condition = parseCondition(match[2]);
      const rd = parseRegister(match[4]);
      const rn = parseRegister(match[5]);
      const operand = parseOperand2(match[6]);
      if (condition < 0 || !validRegisters(rd, rn) || operand === null) return null;
      return encodeDataProcessing(condition, opcode, match[3] ? 1 : 0, rn, rd, operand);
    },
  },
  {
    regex: new RegExp(`^(mov|mvn)${COND}(s?) ${REGISTER}, (.+)$`, "i"),
    encode: (match) => {
      const opcode = DATA_PROCESSING_OPS.indexOf(match[1].toLowerCase());
      const condition = parseCondition(match[2]);
      const rd = parseRegister(match[4]);
      const operand = parseOperand2(match[5]);
      if (condition < 0 || rd < 0 || operand === null) return null;
      return encodeDataProcessing(condition, opcode, match[3] ? 1 : 0, 0, rd, operand);
    },
  },
  {
    regex: new RegExp(`^(tst|teq|cmp|cmn)${COND} ${REGISTER}, (.+)$`, "i"),
    encode: (match) => {
      const opcode = DATA_PROCESSING_OPS.indexOf(match[1].toLowerCase());
      const condition = parseCondition(match[2]);
      const rn = parseRegister(match[3]);
      const operand = parseOperand2(match[4]);
      if (condition < 0 || rn < 0 || operand === null) return null;
      return encodeDataProcessing(condition, opcode, 1, rn, 0, operand);
    },
  },
  {
    regex: new RegExp(`^\\.word ${IMMEDIATE}$`, "i"),
    encode: (match) => {
      const value = parseImmediate(match[1]);
      if (value === null || value < 0 || value > 0xffffffff) return null;
      return value >>> 0;
    },
  },
];

const HWORD_RULE = new RegExp(`^\\.hword ${IMMEDIATE}$`, "i");
const BYTE_RULE = new RegExp(`^\\.byte ${IMMEDIATE}$`, "i");

const encodeArmLine = (line: string): string | null => {
  const byteMatch = line.match(BYTE_RULE);
  if (byteMatch) {
    const value = parseImmediate(byteMatch[1]);
    if (value === null || !inRange(value, 0, 0xff, 1)) return null;
    return toHexByte(value);
  }

  const halfwordMatch = line.match(HWORD_RULE);
  if (halfwordMatch) {
    const value = parseImmediate(halfwordMatch[1]);
    if (value === null || !inRange(value, 0, 0xffff, 1)) return null;
    return `${toHexByte(value & 0xff)} ${toHexByte((value >> 8) & 0xff)}`;
  }

  for (const { regex, encode } of ARM_ENCODING_RULES) {
    const match = line.match(regex);
    if (!match) continue;
    const word = encode(match);
    if (word === null) continue;
    return [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff]
      .map(toHexByte)
      .join(" ");
  }

  return null;
};

export const assembleArm = (program: string): string => {
  return program
    .split("\n")
    .map((line) => encodeArmLine(line.replace(/\s+/g, " ").trim()))
    .filter((hex): hex is string => hex !== null && hex !== "")
    .join(" ");
};
