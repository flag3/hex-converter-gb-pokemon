export const REGISTER_NAMES = [
  "r0",
  "r1",
  "r2",
  "r3",
  "r4",
  "r5",
  "r6",
  "r7",
  "r8",
  "r9",
  "r10",
  "r11",
  "r12",
  "sp",
  "lr",
  "pc",
];

export const CONDITIONS = [
  "eq",
  "ne",
  "cs",
  "cc",
  "mi",
  "pl",
  "vs",
  "vc",
  "hi",
  "ls",
  "ge",
  "lt",
  "gt",
  "le",
];

export const REGISTER = "(\\w+)";
export const IMMEDIATE = "(#?-?(?:0x[0-9A-Fa-f]+|\\d+))";
export const LIST = "\\{([^}]*)\\}";

export const signExtend = (value: number, bits: number): number => {
  const shift = 32 - bits;
  return (value << shift) >> shift;
};

export const formatImmediate = (value: number): string => {
  return value < 0
    ? `#-0x${(-value).toString(16).toUpperCase()}`
    : `#0x${value.toString(16).toUpperCase()}`;
};

export const parseRegister = (token: string): number => {
  const index = REGISTER_NAMES.indexOf(token.toLowerCase());
  if (index !== -1) return index;
  const match = token.toLowerCase().match(/^r(\d+)$/);
  if (match) {
    const value = parseInt(match[1], 10);
    if (value <= 15) return value;
  }
  return -1;
};

export const parseImmediate = (token: string): number | null => {
  const match = token.match(/^#?(-?)(?:0x([0-9A-Fa-f]+)|(\d+))$/);
  if (!match) return null;
  const magnitude = match[2] !== undefined ? parseInt(match[2], 16) : parseInt(match[3], 10);
  return match[1] === "-" ? -magnitude : magnitude;
};

export const inRange = (value: number, min: number, max: number, multiple: number): boolean => {
  return value >= min && value <= max && value % multiple === 0;
};

export const toHexByte = (value: number): string => {
  return value.toString(16).toUpperCase().padStart(2, "0");
};
