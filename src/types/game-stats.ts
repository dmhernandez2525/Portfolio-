export type GameId =
  | "snake"
  | "tetris"
  | "chess"
  | "cookie-clicker"
  | "tanks"
  | "agar"
  | "mafia-wars"
  | "pokemon"
  | "shopping-cart-hero"
  | "game"

export interface GameScoreRecord {
  id: string
  gameId: GameId
  playerId: string
  playerName: string
  score: number
  won: boolean
  durationSeconds: number
  config: Record<string, string | number | boolean>
  timestamp: string
  hash: string
}

export interface AchievementRecord {
  id: string
  title: string
  description: string
  unlocked: boolean
  progress: number
  target: number
}

export interface PlayerProfile {
  id: string
  name: string
  totalGames: number
  totalWins: number
  totalScore: number
  streakDays: number
  winStreak: number
  lastPlayedAt?: string
}

export interface DailyChallenge {
  id: string
  gameId: GameId
  description: string
  targetScore: number
  date: string
}

export interface GameStatsReport {
  sessionsStarted: number
  sessionsCompleted: number
  averageDurationSeconds: number
  achievementsUnlocked: number
  streakLeaders: Array<{ playerId: string; name: string; streakDays: number }>
}
