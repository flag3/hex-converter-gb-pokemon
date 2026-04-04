import type { LanguageMap } from "./../types";
import {
  enGen1HexCharMap,
  enGen1CharHexMap,
  enGen2HexCharMap,
  enGen2CharHexMap,
} from "./enCharMaps";
import {
  frdeGen1HexCharMap,
  frdeGen1CharHexMap,
  frdeGen2HexCharMap,
  frdeGen2CharHexMap,
} from "./frdeCharMaps";
import {
  itesGen1HexCharMap,
  itesGen1CharHexMap,
  itesGen2HexCharMap,
  itesGen2CharHexMap,
} from "./itesCharMaps";
import {
  jaGen1HexCharMap,
  jaGen1CharHexMap,
  jaGen2HexCharMap,
  jaGen2CharHexMap,
} from "./jaCharMaps";
import { koHexCharMap, koCharHexMap } from "./koCharMaps";

const frdeMaps = {
  gen1: { hex: frdeGen1HexCharMap, char: frdeGen1CharHexMap },
  gen2: { hex: frdeGen2HexCharMap, char: frdeGen2CharHexMap },
};

const itesMaps = {
  gen1: { hex: itesGen1HexCharMap, char: itesGen1CharHexMap },
  gen2: { hex: itesGen2HexCharMap, char: itesGen2CharHexMap },
};

const koMaps = {
  gen1: { hex: koHexCharMap, char: koCharHexMap },
  gen2: { hex: koHexCharMap, char: koCharHexMap },
};

export const languageMaps: LanguageMap = {
  en: {
    gen1: { hex: enGen1HexCharMap, char: enGen1CharHexMap },
    gen2: { hex: enGen2HexCharMap, char: enGen2CharHexMap },
  },
  fr: frdeMaps,
  de: frdeMaps,
  it: itesMaps,
  es: itesMaps,
  ja: {
    gen1: { hex: jaGen1HexCharMap, char: jaGen1CharHexMap },
    gen2: { hex: jaGen2HexCharMap, char: jaGen2CharHexMap },
  },
  ko: koMaps,
};

export { koHexChar2ByteMap } from "./koCharMaps";
