const BREEDING_TABLE: Record<string, string> = {
  "bytecat+phoenix": "flame-bytecat",
  "glitchling+pixelworm": "quantum-worm",
  "ghost+phoenix": "holiday-sprite",
}

function normalizePair(first: string, second: string): string {
  return [first, second].sort().join("+")
}

export function breedCreatures(first: string, second: string): string | null {
  if (!first || !second || first === second) {
    return null
  }

  return BREEDING_TABLE[normalizePair(first, second)] ?? null
}
