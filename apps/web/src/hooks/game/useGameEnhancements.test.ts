import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useGameEnhancements } from "@/hooks/game/useGameEnhancements"
import { loadGameEnhancementState } from "@/lib/game/save-state"

describe("useGameEnhancements", () => {
  it("applies difficulty scaling and unlocks achievements", () => {
    const { result } = renderHook(() => useGameEnhancements("snake"))

    act(() => {
      result.current.setDifficultyPreset("hard")
    })
    expect(result.current.state.difficulty.speedMultiplier).toBeGreaterThan(1)

    act(() => {
      result.current.updateMetrics({ score: 120, combo: 12, multiplier: 3.2 })
    })

    expect(result.current.unlockedAchievements.some((item) => item.id === "first-score")).toBe(true)
    expect(result.current.unlockedAchievements.some((item) => item.id === "combo-master")).toBe(true)
    expect(result.current.unlockedAchievements.some((item) => item.id === "streak-mode")).toBe(true)
    expect(result.current.achievementToasts.length).toBeGreaterThan(0)
  })

  it("records replay inputs and persists state", () => {
    const { result } = renderHook(() => useGameEnhancements("tetris"))

    act(() => {
      result.current.recordInput("ArrowLeft")
      result.current.recordInput("ArrowRight")
    })
    expect(result.current.state.replay.length).toBe(2)

    const saved = loadGameEnhancementState("tetris")
    expect(saved).not.toBeNull()
    expect(saved?.replay.length).toBe(2)
  })
})
