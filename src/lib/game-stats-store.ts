import type { AchievementRecord, DailyChallenge, GameId, GameScoreRecord, GameStatsReport, PlayerProfile } from "@/types/game-stats"

const SCORES_KEY = "game_stats_scores_v1"
const SECRET_KEY = "portfolio-game-secret-v1"
const MAX_SCORES = 5000

interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const memoryData = new Map<string, string>()
const memoryStorage: StorageLike = {
  getItem: (key) => memoryData.get(key) ?? null,
  setItem: (key, value) => {
    memoryData.set(key, value)
  },
  removeItem: (key) => {
    memoryData.delete(key)
  },
}

function isStorageLike(value: unknown): value is StorageLike {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<StorageLike>
  return typeof candidate.getItem === "function" && typeof candidate.setItem === "function" && typeof candidate.removeItem === "function"
}

function getStorage(): StorageLike {
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) return window.localStorage
  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.localStorage)) return globalThis.localStorage
  return memoryStorage
}

function hashString(input: string): string {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

function scorePayload(record: Omit<GameScoreRecord, "hash">): string {
  return JSON.stringify({ ...record, secret: SECRET_KEY })
}

function parseScores(raw: string | null): GameScoreRecord[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as GameScoreRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistScores(records: GameScoreRecord[]): GameScoreRecord[] {
  const trimmed = [...records]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, MAX_SCORES)
  getStorage().setItem(SCORES_KEY, JSON.stringify(trimmed))
  return trimmed
}

export function getScoreRecords(): GameScoreRecord[] {
  return parseScores(getStorage().getItem(SCORES_KEY))
}

export function clearGameStatsStore(): void {
  getStorage().removeItem(SCORES_KEY)
}

export function submitGameScore(input: Omit<GameScoreRecord, "id" | "timestamp" | "hash">): GameScoreRecord {
  const timestamp = new Date().toISOString()
  const baseRecord: Omit<GameScoreRecord, "hash"> = {
    id: `score-${Date.now()}`,
    timestamp,
    ...input,
  }

  const record: GameScoreRecord = {
    ...baseRecord,
    hash: hashString(scorePayload(baseRecord)),
  }
  persistScores([record, ...getScoreRecords()])
  return record
}

export function verifyScore(record: GameScoreRecord): boolean {
  const { hash, ...base } = record
  return hash === hashString(scorePayload(base))
}

export function getLeaderboard(params: {
  gameId: GameId
  page: number
  pageSize: number
  sortBy: "score" | "date" | "player"
  sortOrder: "asc" | "desc"
}): { rows: GameScoreRecord[]; total: number } {
  const filtered = getScoreRecords().filter((record) => record.gameId === params.gameId && verifyScore(record))
  const sorted = [...filtered].sort((a, b) => {
    const factor = params.sortOrder === "asc" ? 1 : -1
    if (params.sortBy === "score") return (a.score - b.score) * factor
    if (params.sortBy === "player") return a.playerName.localeCompare(b.playerName) * factor
    return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * factor
  })

  const start = (params.page - 1) * params.pageSize
  return {
    rows: sorted.slice(start, start + params.pageSize),
    total: sorted.length,
  }
}

function consecutiveDaysPlayed(timestamps: string[]): number {
  const days = [...new Set(timestamps.map((timestamp) => timestamp.slice(0, 10)))].sort().reverse()
  if (days.length === 0) return 0
  let streak = 1
  for (let index = 1; index < days.length; index += 1) {
    const previous = new Date(days[index - 1]).getTime()
    const current = new Date(days[index]).getTime()
    if (previous - current === 24 * 60 * 60 * 1000) {
      streak += 1
    } else {
      break
    }
  }
  return streak
}

function consecutiveWins(records: GameScoreRecord[]): number {
  const sorted = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  let streak = 0
  for (const record of sorted) {
    if (!record.won) break
    streak += 1
  }
  return streak
}

export function getPlayerProfiles(): PlayerProfile[] {
  const byPlayer = new Map<string, GameScoreRecord[]>()
  for (const record of getScoreRecords()) {
    const current = byPlayer.get(record.playerId) ?? []
    current.push(record)
    byPlayer.set(record.playerId, current)
  }

  return [...byPlayer.entries()].map(([playerId, records]) => {
    const totalScore = records.reduce((sum, record) => sum + record.score, 0)
    const totalWins = records.filter((record) => record.won).length
    const latest = [...records].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    return {
      id: playerId,
      name: latest?.playerName ?? playerId,
      totalGames: records.length,
      totalWins,
      totalScore,
      streakDays: consecutiveDaysPlayed(records.map((record) => record.timestamp)),
      winStreak: consecutiveWins(records),
      lastPlayedAt: latest?.timestamp,
    }
  })
}

export function getAchievements(playerId: string): AchievementRecord[] {
  const player = getPlayerProfiles().find((profile) => profile.id === playerId)
  const defaults = {
    totalGames: player?.totalGames ?? 0,
    totalWins: player?.totalWins ?? 0,
    streakDays: player?.streakDays ?? 0,
  }

  return [
    { id: "first-win", title: "First Victory", description: "Win your first game", target: 1, progress: defaults.totalWins, unlocked: defaults.totalWins >= 1 },
    { id: "ten-games", title: "Committed Player", description: "Play 10 sessions", target: 10, progress: defaults.totalGames, unlocked: defaults.totalGames >= 10 },
    { id: "seven-day-streak", title: "Weekly Streak", description: "Play 7 days in a row", target: 7, progress: defaults.streakDays, unlocked: defaults.streakDays >= 7 },
  ]
}

export function getDailyChallenge(now = new Date()): DailyChallenge {
  const gameIds: GameId[] = ["snake", "tetris", "chess", "cookie-clicker", "tanks", "agar", "mafia-wars", "pokemon", "shopping-cart-hero", "game"]
  const dateKey = now.toISOString().slice(0, 10)
  const dayIndex = Math.floor(now.getTime() / (24 * 60 * 60 * 1000))
  const gameId = gameIds[dayIndex % gameIds.length]
  const targetScore = 250 + (dayIndex % 5) * 150
  return {
    id: `daily-${dateKey}`,
    gameId,
    description: `Reach ${targetScore} points in ${gameId.replace("-", " ")} today.`,
    targetScore,
    date: dateKey,
  }
}

export function getWeeklyLeaderboard(gameId: GameId, now = new Date()): GameScoreRecord[] {
  const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000
  return getScoreRecords()
    .filter((record) => record.gameId === gameId && new Date(record.timestamp).getTime() >= weekAgo)
    .sort((a, b) => b.score - a.score)
}

export function buildGameStatsReport(): GameStatsReport {
  const records = getScoreRecords()
  const completed = records.filter((record) => record.won || record.durationSeconds > 0)
  const averageDuration = completed.length === 0 ? 0 : Math.round(completed.reduce((sum, record) => sum + record.durationSeconds, 0) / completed.length)
  const profiles = getPlayerProfiles().sort((a, b) => b.streakDays - a.streakDays).slice(0, 5)
  const unlocked = profiles.reduce((sum, profile) => sum + getAchievements(profile.id).filter((achievement) => achievement.unlocked).length, 0)

  return {
    sessionsStarted: records.length,
    sessionsCompleted: completed.length,
    averageDurationSeconds: averageDuration,
    achievementsUnlocked: unlocked,
    streakLeaders: profiles.map((profile) => ({ playerId: profile.id, name: profile.name, streakDays: profile.streakDays })),
  }
}
