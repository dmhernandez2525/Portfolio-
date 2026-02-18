import { useEffect, useMemo, useRef, useState } from "react"
import { GameAudioEngine } from "@/lib/game/audio-engine"
import { ReplayRecorder } from "@/lib/game/replay-recorder"
import { loadGameEnhancementState, saveGameEnhancementState } from "@/lib/game/save-state"
import type { DifficultySettings, GameAchievement, GameEnhancementState } from "@/types/game-enhancement"
import type { GameId } from "@/types/game-stats"

const DIFFICULTY_PRESETS: Record<"easy" | "medium" | "hard", DifficultySettings> = {
  easy: { preset: "easy", speedMultiplier: 0.85, enemyMultiplier: 0.8, rewardMultiplier: 1.1 },
  medium: { preset: "medium", speedMultiplier: 1, enemyMultiplier: 1, rewardMultiplier: 1 },
  hard: { preset: "hard", speedMultiplier: 1.2, enemyMultiplier: 1.3, rewardMultiplier: 1.2 },
}

function initialAchievements(): GameAchievement[] {
  return [
    { id: "first-score", title: "First Points", unlocked: false },
    { id: "combo-master", title: "Combo Master", unlocked: false },
    { id: "streak-mode", title: "Streak Mode", unlocked: false },
  ]
}

function applyAchievementRules(state: GameEnhancementState): GameEnhancementState {
  return {
    ...state,
    achievements: state.achievements.map((achievement) => {
      if (achievement.id === "first-score") return { ...achievement, unlocked: achievement.unlocked || state.score > 0 }
      if (achievement.id === "combo-master") return { ...achievement, unlocked: achievement.unlocked || state.combo >= 10 }
      if (achievement.id === "streak-mode") return { ...achievement, unlocked: achievement.unlocked || state.multiplier >= 3 }
      return achievement
    }),
  }
}

export function useGameEnhancements(gameId: GameId) {
  const audioRef = useRef(new GameAudioEngine())
  const replayRef = useRef(new ReplayRecorder())
  const [fps, setFps] = useState<number>(60)
  const [achievementToasts, setAchievementToasts] = useState<string[]>([])
  const [state, setState] = useState<GameEnhancementState>(() => {
    const stored = loadGameEnhancementState(gameId)
    return (
      stored ?? {
        gameId,
        score: 0,
        combo: 0,
        multiplier: 1,
        difficulty: DIFFICULTY_PRESETS.medium,
        replay: [],
        achievements: initialAchievements(),
      }
    )
  })

  const unlockedAchievements = useMemo(() => state.achievements.filter((achievement) => achievement.unlocked), [state.achievements])

  useEffect(() => {
    saveGameEnhancementState(state)
  }, [state])

  useEffect(() => {
    if (achievementToasts.length === 0) return
    const timeout = window.setTimeout(() => {
      setAchievementToasts((current) => current.slice(1))
    }, 2400)
    return () => window.clearTimeout(timeout)
  }, [achievementToasts])

  useEffect(() => {
    let frameCount = 0
    let startedAt = performance.now()
    let rafId = 0

    const loop = () => {
      frameCount += 1
      const now = performance.now()
      if (now - startedAt >= 1000) {
        setFps(frameCount)
        frameCount = 0
        startedAt = now
      }
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const setDifficultyPreset = (preset: "easy" | "medium" | "hard"): void => {
    setState((current) => ({ ...current, difficulty: DIFFICULTY_PRESETS[preset] }))
  }

  const setCustomDifficulty = (settings: Omit<DifficultySettings, "preset">): void => {
    setState((current) => ({ ...current, difficulty: { preset: "custom", ...settings } }))
  }

  const updateMetrics = (metrics: { score: number; combo: number; multiplier: number }): void => {
    setState((current) => {
      const next = applyAchievementRules({
        ...current,
        score: metrics.score,
        combo: metrics.combo,
        multiplier: metrics.multiplier,
      })
      if (next.score > current.score) audioRef.current.play("collect")
      const newlyUnlocked = next.achievements.filter((achievement, index) => achievement.unlocked && !current.achievements[index].unlocked)
      if (newlyUnlocked.length > 0) {
        audioRef.current.play("achievement")
        setAchievementToasts((currentToasts) => [...currentToasts, ...newlyUnlocked.map((achievement) => achievement.title)])
      }
      return next
    })
  }

  const recordInput = (input: string): void => {
    replayRef.current.record(input)
    setState((current) => ({ ...current, replay: replayRef.current.snapshot() }))
  }

  const resetReplay = (): void => {
    replayRef.current.clear()
    setState((current) => ({ ...current, replay: [] }))
  }

  return {
    state,
    fps,
    achievementToasts,
    unlockedAchievements,
    updateMetrics,
    setDifficultyPreset,
    setCustomDifficulty,
    recordInput,
    resetReplay,
    setAudioMuted: (value: boolean) => audioRef.current.setMuted(value),
    setAudioVolume: (value: number) => audioRef.current.setVolume(value),
    getAudioSettings: () => audioRef.current.getSettings(),
  }
}
