export type CreatureRarity = "common" | "rare" | "epic" | "legendary"

export interface CreatureSpecies {
  id: string
  name: string
  rarity: CreatureRarity
  lore: string
  difficultyTier: "easy" | "medium" | "legendary"
  seasonalMonth?: number
  evolutionPath?: string[]
  spawnWeight: number
}

export interface CreatureCollectionEntry {
  speciesId: string
  catches: number
  firstCaughtAt: number
  lastCaughtAt: number
  rarity: CreatureRarity
}

export interface CreatureDexState {
  entries: Record<string, CreatureCollectionEntry>
  unlockedLore: string[]
  completionPercentage: number
}

export interface CreatureTradeMessage {
  speciesId: string
  timestamp: number
  senderId: string
}
