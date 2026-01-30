import { instructionMap, instructionCBMap } from "./../constants/instructionMaps";
import type { InstructionMaps, InstructionInfo } from "./../types";

let cachedInstructionMaps: InstructionMaps | null = null;

export const getMemoizedInstructionMaps = (): InstructionMaps => {
  if (cachedInstructionMaps) {
    return cachedInstructionMaps;
  }

  const instructionInfoMap: { [instruction: string]: InstructionInfo[] } = {};
  const cbInstructionInfoMap: { [instruction: string]: InstructionInfo[] } = {};

  Object.entries(instructionMap).forEach(([hex, template]) => {
    const firstSpaceIndex = template.indexOf(" ");
    const instruction = firstSpaceIndex === -1 ? template : template.slice(0, firstSpaceIndex);
    const operandPattern = firstSpaceIndex === -1 ? "" : template.slice(firstSpaceIndex + 1).trim();

    if (!instructionInfoMap[instruction]) {
      instructionInfoMap[instruction] = [];
    }

    instructionInfoMap[instruction].push({
      opcode: hex,
      operandPattern,
    });
  });

  Object.entries(instructionCBMap).forEach(([hex, template]) => {
    const normalizedTemplate = template.replace(/\s+/g, " ");
    if (!cbInstructionInfoMap[normalizedTemplate]) {
      cbInstructionInfoMap[normalizedTemplate] = [];
    }

    cbInstructionInfoMap[normalizedTemplate].push({
      opcode: hex,
      operandPattern: "",
    });
  });

  cachedInstructionMaps = {
    instructionInfoMap,
    cbInstructionInfoMap,
  };

  return cachedInstructionMaps;
};
