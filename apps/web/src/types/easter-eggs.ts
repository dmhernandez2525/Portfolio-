export type EasterEggDifficulty = "easy" | "medium" | "legendary"

export type EasterEggCategory = "classic" | "bonus" | "seasonal" | "mini-game"

export type EasterEggRewardType = "theme" | "skin" | "badge"

export interface EasterEggReward {
  id: string
  type: EasterEggRewardType
  label: string
  description: string
}

export interface EasterEggDefinition {
  id: string
  name: string
  code?: string
  difficulty: EasterEggDifficulty
  category: EasterEggCategory
  hint: string
  description: string
  rewards: EasterEggReward[]
  seasonalMonth?: number
}

export interface EasterEggProgress {
  discoveredIds: string[]
  unlockedRewardIds: string[]
  completionPercentage: number
  completionistUnlocked: boolean
  totalDiscoverable: number
}

export interface EasterEggDiscoveryEvent {
  egg: EasterEggDefinition
  progress: EasterEggProgress
  isNewDiscovery: boolean
}

export interface EasterEggHintEvent {
  egg: EasterEggDefinition
  hint: string
}

export interface EasterEggMiniGameEvent {
  miniGameId: string
  title: string
}
