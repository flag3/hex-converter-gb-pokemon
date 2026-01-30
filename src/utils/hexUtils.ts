import { instructionMap, instructionCBMap } from "./../constants/instructionMaps";
import { languageMaps, koHexChar2ByteMap } from "./../constants/languageMaps";
import type { CharacterMap, Language, Generation, MapType, InstructionInfo } from "./../types";
import { getMemoizedInstructionMaps } from "./memoization";
import { normalizeHex } from "./validationUtils";

const getMap = (language: Language, gen: Generation, type: MapType): CharacterMap => {
  const defaultMap = languageMaps.en.gen1[type];
  const languageMap = languageMaps[language];
  if (!languageMap) return defaultMap;

  return gen === "2" ? languageMap.gen2[type] : languageMap.gen1[type];
};

const charHexMap = (language: Language, gen: Generation): CharacterMap => {
  return getMap(language, gen, "char");
};

const hexCharMap = (language: Language, gen: Generation): CharacterMap => {
  return getMap(language, gen, "hex");
};

export const textToHex = (text: string, language: Language, gen: Generation): string => {
  const result = [];
  const map = charHexMap(language, gen);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (["\u3099", "\u309A"].includes(nextChar)) {
      const combinedChar = char + nextChar;
      result.push(map[combinedChar] || "");
      i++;
    } else {
      result.push(map[char] || "");
    }
  }

  return result.join(" ");
};

export const hexToText = (hex: string, language: Language, gen: Generation): string => {
  const hexArray = normalizeHex(hex);
  const map = hexCharMap(language, gen);

  if (language === "ko") {
    const result = [];
    for (let i = 0; i < hexArray.length; i++) {
      const hex = hexArray[i];
      if (hex >= "00" && hex <= "0A" && i + 1 < hexArray.length) {
        const nextHex = hexArray[i + 1];
        result.push(koHexChar2ByteMap[hex]?.[nextHex]);
        i++;
      } else {
        result.push(map[hex]);
      }
    }
    return result.join("");
  }

  return hexArray.map((hex) => map[hex] || "").join("");
};

const processOperands = (instruction: string, operands: string[], operandCount: number): string => {
  if (operandCount === 2) {
    return instruction.replace(
      "**",
      `${operands[1] ? (operands[1].length === 1 ? `${operands[1]}*` : operands[1]) : "**"}${operands[0] ? (operands[0].length === 1 ? `${operands[0]}*` : operands[0]) : "**"}`,
    );
  }
  if (operandCount === 1) {
    return instruction.replace(
      "*",
      `${operands[0] ? (operands[0].length === 1 ? `${operands[0]}*` : operands[0]) : "**"}`,
    );
  }
  return instruction;
};

export const hexToProgram = (hex: string): string => {
  const hexArray = normalizeHex(hex);
  const result = [];

  for (let i = 0; i < hexArray.length; i++) {
    let instruction: string;

    if (hexArray[i] === "CB") {
      instruction = instructionCBMap[hexArray[++i]] || instructionMap[hexArray[i - 1]];
    } else {
      instruction = instructionMap[hexArray[i]] || "";
    }

    const operandCount = (instruction.match(/\*/g) || []).length;
    const operands = hexArray.slice(i + 1, i + 1 + operandCount);

    instruction = processOperands(instruction, operands, operandCount);
    i += operandCount;

    result.push(instruction);
  }

  return result.join("\n");
};

const patternToRegex = (pattern: string): RegExp => {
  let regexStr = "";
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === "*") {
      if (i + 1 < pattern.length && pattern[i + 1] === "*") {
        regexStr += "([0-9A-Fa-f]{4})";
        i++;
      } else {
        regexStr += "([0-9A-Fa-f]{2})";
      }
    } else if (pattern[i] === ",") {
      regexStr += "\\s*,\\s*";
    } else {
      const specialChars = /[.*+?^=!:${}()|[\]/\\]/;
      if (specialChars.test(pattern[i])) {
        regexStr += "\\" + pattern[i];
      } else {
        regexStr += pattern[i];
      }
    }
  }
  return new RegExp(`^${regexStr}$`);
};

const parseInstruction = (
  instructionPart: string,
  operandPart: string,
  map: { [instruction: string]: InstructionInfo[] },
): { opcode: string; operandsHex: string } | null => {
  if (!map[instructionPart]) return null;

  for (const { opcode, operandPattern } of map[instructionPart]) {
    if (operandPattern === "" && operandPart.length === 0) {
      return { opcode, operandsHex: "" };
    }

    const match = operandPart.match(patternToRegex(operandPattern));
    if (!match) continue;

    const operandsHex = match
      .slice(1)
      .map((wildcard) => {
        if (operandPattern.includes("**")) {
          return `${wildcard.slice(2, 4)} ${wildcard.slice(0, 2)}`;
        }
        return wildcard;
      })
      .join(" ")
      .toUpperCase();

    return { opcode, operandsHex };
  }

  return null;
};

export const programToHex = (program: string): string => {
  const lines = program.split("\n");
  const { instructionInfoMap, cbInstructionInfoMap } = getMemoizedInstructionMaps();

  return lines
    .map((line) => {
      line = line.replace(/\s+/g, " ").trim();

      if (cbInstructionInfoMap[line]) {
        const { opcode } = cbInstructionInfoMap[line][0];
        return `CB ${opcode}`;
      }

      const firstSpaceIndex = line.indexOf(" ");
      const instructionPart = firstSpaceIndex === -1 ? line : line.slice(0, firstSpaceIndex);
      const operandPart = firstSpaceIndex === -1 ? "" : line.slice(firstSpaceIndex + 1);

      const parsed = parseInstruction(instructionPart, operandPart, instructionInfoMap);
      if (!parsed) return "";

      const { opcode, operandsHex } = parsed;
      return operandsHex ? `${opcode} ${operandsHex}` : opcode;
    })
    .filter(Boolean)
    .join(" ");
};
