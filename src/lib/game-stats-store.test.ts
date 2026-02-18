import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { buildGameStatsReport, clearGameStatsStore, getAchievements, getLeaderboard, getPlayerProfiles, getScoreRecords, submitGameScore, verifyScore } from "@/lib/game-stats-store"

describe("game-stats-store", () => {
  beforeEach(() => {
    clearGameStatsStore()
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-15T12:00:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("persists verified scores and supports leaderboard sorting", () => {
    const scoreA = submitGameScore({
      gameId: "snake",
      playerId: "p1",
      playerName: "Alpha",
      score: 400,
      won: true,
      durationSeconds: 120,
      config: { difficulty: "medium" },
    })
    submitGameScore({
      gameId: "snake",
      playerId: "p2",
      playerName: "Bravo",
      score: 650,
      won: false,
      durationSeconds: 160,
      config: { difficulty: "hard" },
    })

    expect(getScoreRecords().length).toBe(2)
    expect(verifyScore(scoreA)).toBe(true)

    const leaderboard = getLeaderboard({
      gameId: "snake",
      page: 1,
      pageSize: 10,
      sortBy: "score",
      sortOrder: "desc",
    })
    expect(leaderboard.rows[0]?.playerName).toBe("Bravo")
    expect(leaderboard.total).toBe(2)
  })

  it("unlocks achievements and computes streak logic", () => {
    for (let day = 0; day < 3; day += 1) {
      vi.setSystemTime(new Date(`2026-02-${15 + day}T12:00:00.000Z`))
      submitGameScore({
        gameId: "tetris",
        playerId: "player-streak",
        playerName: "Streak",
        score: 500 + day * 20,
        won: true,
        durationSeconds: 180,
        config: { mode: "standard" },
      })
    }

    const profiles = getPlayerProfiles()
    const profile = profiles.find((item) => item.id === "player-streak")
    expect(profile?.streakDays).toBe(3)
    expect(profile?.winStreak).toBe(3)

    const achievements = getAchievements("player-streak")
    expect(achievements.find((item) => item.id === "first-win")?.unlocked).toBe(true)
    expect(achievements.find((item) => item.id === "seven-day-streak")?.progress).toBe(3)

    const report = buildGameStatsReport()
    expect(report.sessionsStarted).toBe(3)
    expect(report.sessionsCompleted).toBe(3)
  })
})
