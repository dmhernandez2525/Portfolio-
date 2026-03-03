import type { GameId } from "@/types/game-stats"

export type DifficultyPreset = "easy" | "medium" | "hard" | "custom"

export interface DifficultySettings {
  preset: DifficultyPreset
  speedMultiplier: number
  enemyMultiplier: number
  rewardMultiplier: number
}

export interface TutorialStep {
  id: string
  title: string
  description: string
}

export interface ReplayEvent {
  timestampMs: number
  input: string
}

export interface GameAchievement {
  id: string
  title: string
  unlocked: boolean
}

export interface GameEnhancementState {
  gameId: GameId
  score: number
  combo: number
  multiplier: number
  difficulty: DifficultySettings
  replay: ReplayEvent[]
  achievements: GameAchievement[]
}
