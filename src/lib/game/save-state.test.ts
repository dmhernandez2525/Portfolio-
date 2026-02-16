import { describe, expect, it } from "vitest"
import { clearGameEnhancementState, loadGameEnhancementState, saveGameEnhancementState } from "@/lib/game/save-state"

describe("game save-state", () => {
  it("serializes and restores enhancement state", () => {
    const state = {
      gameId: "snake" as const,
      score: 420,
      combo: 4,
      multiplier: 1.6,
      difficulty: { preset: "hard" as const, speedMultiplier: 1.2, enemyMultiplier: 1.3, rewardMultiplier: 1.2 },
      replay: [{ timestampMs: 10, input: "ArrowRight" }],
      achievements: [{ id: "first-score", title: "First Points", unlocked: true }],
    }

    saveGameEnhancementState(state)
    const restored = loadGameEnhancementState("snake")
    expect(restored).not.toBeNull()
    expect(restored?.score).toBe(420)
    expect(restored?.replay.length).toBe(1)

    clearGameEnhancementState("snake")
    expect(loadGameEnhancementState("snake")).toBeNull()
  })
})
