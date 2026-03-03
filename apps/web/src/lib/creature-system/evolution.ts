import { CREATURE_SPECIES_MAP } from "@/lib/creature-system/catalog"

const EVOLUTION_THRESHOLDS = [1, 4, 8]

export function getEvolutionStage(speciesId: string, catches: number): string {
  const species = CREATURE_SPECIES_MAP[speciesId]
  if (!species || !species.evolutionPath || species.evolutionPath.length === 0) {
    return speciesId
  }

  const stageIndex = EVOLUTION_THRESHOLDS.findIndex((threshold, index) => {
    const nextThreshold = EVOLUTION_THRESHOLDS[index + 1] ?? Number.POSITIVE_INFINITY
    return catches >= threshold && catches < nextThreshold
  })

  if (stageIndex <= 0) {
    return speciesId
  }

  const evolutionIndex = Math.min(stageIndex - 1, species.evolutionPath.length - 1)
  return species.evolutionPath[evolutionIndex]
}

export function evolvedBetween(speciesId: string, previousCatches: number, nextCatches: number): boolean {
  return getEvolutionStage(speciesId, previousCatches) !== getEvolutionStage(speciesId, nextCatches)
}
