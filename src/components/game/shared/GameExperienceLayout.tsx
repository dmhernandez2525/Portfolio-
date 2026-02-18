import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { GameEnhancementDock } from "@/components/game/shared/GameEnhancementDock"
import { GameAchievementToastStack } from "@/components/game/shared/GameAchievementToastStack"
import { GameStatsOverlay } from "@/components/game/shared/GameStatsOverlay"
import { GameTutorialOverlay } from "@/components/game/shared/GameTutorialOverlay"
import { SharedLeaderboard } from "@/components/game/shared/SharedLeaderboard"
import { useGameEnhancements } from "@/hooks/game/useGameEnhancements"
import type { TutorialStep } from "@/types/game-enhancement"
import type { GameId } from "@/types/game-stats"

interface GameExperienceLayoutProps {
  gameId: GameId
  children: ReactNode
}

function tutorialForGame(gameId: GameId): TutorialStep[] {
  return [
    {
      id: `${gameId}-controls`,
      title: "Controls",
      description: "Use keyboard or touch gestures to control movement and actions.",
    },
    {
      id: `${gameId}-objective`,
      title: "Objective",
      description: "Build score through clean plays while preserving your combo and multiplier.",
    },
    {
      id: `${gameId}-leaderboard`,
      title: "Compete",
      description: "Submit high scores to climb the shared leaderboard.",
    },
  ]
}

export function GameExperienceLayout({ gameId, children }: GameExperienceLayoutProps) {
  const enhancements = useGameEnhancements(gameId)
  const [tutorialOpen, setTutorialOpen] = useState<boolean>(false)
  const [tutorialStep, setTutorialStep] = useState<number>(0)
  const tutorialSteps = useMemo(() => tutorialForGame(gameId), [gameId])
  const audioSettings = enhancements.getAudioSettings()

  const handleInput = (input: string): void => {
    enhancements.recordInput(input)
    const nextCombo = Math.min(20, enhancements.state.combo + 1)
    const multiplier = Math.max(1, 1 + nextCombo / 10)
    const scoreDelta = Math.round(10 * enhancements.state.difficulty.rewardMultiplier)
    enhancements.updateMetrics({
      score: enhancements.state.score + scoreDelta,
      combo: nextCombo,
      multiplier,
    })
  }

  return (
    <div
      className="relative"
      onKeyDown={(event) => handleInput(`key:${event.key}`)}
      onTouchStart={() => handleInput("touch")}
      tabIndex={-1}
    >
      {children}

      <GameStatsOverlay
        fps={enhancements.fps}
        score={enhancements.state.score}
        combo={enhancements.state.combo}
        multiplier={enhancements.state.multiplier}
      />

      <div className="fixed bottom-4 left-4 z-40 w-[280px]">
        <SharedLeaderboard gameId={gameId} />
      </div>

      <GameEnhancementDock
        difficulty={enhancements.state.difficulty}
        achievements={enhancements.unlockedAchievements}
        audioMuted={audioSettings.muted}
        audioVolume={audioSettings.volume}
        onDifficultyPreset={enhancements.setDifficultyPreset}
        onCustomDifficulty={enhancements.setCustomDifficulty}
        onAudioMuted={enhancements.setAudioMuted}
        onAudioVolume={enhancements.setAudioVolume}
        onOpenTutorial={() => {
          setTutorialStep(0)
          setTutorialOpen(true)
        }}
      />

      <GameAchievementToastStack items={enhancements.achievementToasts} />

      <GameTutorialOverlay
        open={tutorialOpen}
        steps={tutorialSteps}
        currentStep={tutorialStep}
        onClose={() => setTutorialOpen(false)}
        onPrevious={() => setTutorialStep((value) => Math.max(0, value - 1))}
        onNext={() => {
          if (tutorialStep >= tutorialSteps.length - 1) {
            setTutorialOpen(false)
            return
          }
          setTutorialStep((value) => value + 1)
        }}
      />
    </div>
  )
}
