import { getSpawnableSpecies } from "@/lib/creature-system/catalog"

export function getSpawnPool(date: Date = new Date()): Array<{ speciesId: string; weight: number }> {
  return getSpawnableSpecies(date).map((species) => ({
    speciesId: species.id,
    weight: species.spawnWeight,
  }))
}

export function pickSpawnSpecies(randomValue: number, date: Date = new Date()): string {
  const pool = getSpawnPool(date)
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0)
  if (totalWeight <= 0) {
    return "bug"
  }

  let cursor = randomValue * totalWeight
  for (const entry of pool) {
    cursor -= entry.weight
    if (cursor <= 0) {
      return entry.speciesId
    }
  }

  return pool[pool.length - 1].speciesId
}

export function hasSeasonalSpawn(date: Date = new Date()): boolean {
  return getSpawnPool(date).some((entry) => entry.speciesId === "holiday-sprite")
}
