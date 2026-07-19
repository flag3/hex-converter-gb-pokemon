import type { CharacterMap } from "./../types";

export const invertMap = (map: CharacterMap): CharacterMap => {
  return Object.fromEntries(
    Object.entries(map)
      .filter(([, char]) => char !== "")
      .map(([hex, char]) => [char, hex]),
  );
};
