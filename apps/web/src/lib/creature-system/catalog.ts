import type { CreatureSpecies } from "@/types/creature-system"

export const CREATURE_SPECIES: CreatureSpecies[] = [
  { id: "bug", name: "Bug", rarity: "common", lore: "Tiny debugger that multiplies when clicked.", difficultyTier: "easy", spawnWeight: 30 },
  { id: "sparkle", name: "Spark", rarity: "common", lore: "Ambient energy fragment from the portfolio core.", difficultyTier: "easy", spawnWeight: 30 },
  { id: "zap", name: "Zap", rarity: "rare", lore: "Charged anomaly that can summon a wizard.", difficultyTier: "medium", spawnWeight: 25 },
  { id: "ghost", name: "Ghost", rarity: "rare", lore: "Restless spirit guarding hidden routes.", difficultyTier: "medium", spawnWeight: 10 },
  { id: "monkey", name: "Monkey", rarity: "rare", lore: "Tree-swinging trickster from an older easter egg.", difficultyTier: "medium", spawnWeight: 5 },
  { id: "phoenix", name: "Phoenix", rarity: "legendary", lore: "Rises from defeated bug swarms and cleans corruption.", difficultyTier: "legendary", spawnWeight: 4, evolutionPath: ["phoenix-spark", "phoenix-prime"] },
  { id: "glitchling", name: "Glitchling", rarity: "epic", lore: "Pixel-scrambling creature born from unstable animations.", difficultyTier: "legendary", spawnWeight: 4, evolutionPath: ["glitchling-beta", "glitchling-core"] },
  { id: "bytecat", name: "Bytecat", rarity: "epic", lore: "Caches snippets and leaves pawprints in the console.", difficultyTier: "medium", spawnWeight: 4, evolutionPath: ["bytecat-plus", "bytecat-ultra"] },
  { id: "pixelworm", name: "Pixelworm", rarity: "epic", lore: "Tunnel-maker that reorders particles into glyphs.", difficultyTier: "medium", spawnWeight: 3, evolutionPath: ["pixelworm-spiral", "pixelworm-titan"] },
  { id: "holiday-sprite", name: "Holiday Sprite", rarity: "legendary", lore: "Appears only in December with festive particle trails.", difficultyTier: "legendary", seasonalMonth: 11, spawnWeight: 2 },
  { id: "flame-bytecat", name: "Flame Bytecat", rarity: "legendary", lore: "Breeding result of Phoenix and Bytecat.", difficultyTier: "legendary", spawnWeight: 0 },
  { id: "quantum-worm", name: "Quantum Worm", rarity: "legendary", lore: "Breeding result of Glitchling and Pixelworm.", difficultyTier: "legendary", spawnWeight: 0 },
]

export const CREATURE_SPECIES_MAP: Record<string, CreatureSpecies> = Object.fromEntries(
  CREATURE_SPECIES.map((species) => [species.id, species]),
)

export function getSpawnableSpecies(date: Date = new Date()): CreatureSpecies[] {
  const month = date.getMonth()
  return CREATURE_SPECIES.filter((species) => {
    if (species.spawnWeight <= 0) {
      return false
    }
    if (typeof species.seasonalMonth === "number" && species.seasonalMonth !== month) {
      return false
    }
    return true
  })
}

export function getDexSpecies(): CreatureSpecies[] {
  return CREATURE_SPECIES
}
