import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { DifficultySettings, GameAchievement } from "@/types/game-enhancement"

interface GameEnhancementDockProps {
  difficulty: DifficultySettings
  achievements: GameAchievement[]
  audioMuted: boolean
  audioVolume: number
  onDifficultyPreset: (preset: "easy" | "medium" | "hard") => void
  onCustomDifficulty: (settings: Omit<DifficultySettings, "preset">) => void
  onAudioMuted: (value: boolean) => void
  onAudioVolume: (value: number) => void
  onOpenTutorial: () => void
}

export function GameEnhancementDock({
  difficulty,
  achievements,
  audioMuted,
  audioVolume,
  onDifficultyPreset,
  onCustomDifficulty,
  onAudioMuted,
  onAudioVolume,
  onOpenTutorial,
}: GameEnhancementDockProps) {
  const [customSpeed, setCustomSpeed] = useState(difficulty.speedMultiplier)
  const [customEnemies, setCustomEnemies] = useState(difficulty.enemyMultiplier)
  const [customReward, setCustomReward] = useState(difficulty.rewardMultiplier)

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[300px] rounded-lg border border-border bg-background/95 p-3 text-xs shadow-lg">
      <p className="font-semibold">Game Enhancements</p>
      <div className="mt-2 flex gap-1">
        <Button size="sm" variant={difficulty.preset === "easy" ? "default" : "outline"} onClick={() => onDifficultyPreset("easy")}>
          Easy
        </Button>
        <Button size="sm" variant={difficulty.preset === "medium" ? "default" : "outline"} onClick={() => onDifficultyPreset("medium")}>
          Medium
        </Button>
        <Button size="sm" variant={difficulty.preset === "hard" ? "default" : "outline"} onClick={() => onDifficultyPreset("hard")}>
          Hard
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1">
        <input type="number" className="rounded border border-input px-1 py-1" step={0.1} value={customSpeed} onChange={(event) => setCustomSpeed(Number(event.target.value))} />
        <input type="number" className="rounded border border-input px-1 py-1" step={0.1} value={customEnemies} onChange={(event) => setCustomEnemies(Number(event.target.value))} />
        <input type="number" className="rounded border border-input px-1 py-1" step={0.1} value={customReward} onChange={(event) => setCustomReward(Number(event.target.value))} />
      </div>
      <Button className="mt-1 w-full" size="sm" variant="outline" onClick={() => onCustomDifficulty({ speedMultiplier: customSpeed, enemyMultiplier: customEnemies, rewardMultiplier: customReward })}>
        Apply Custom Difficulty
      </Button>

      <div className="mt-2 rounded border border-border p-2">
        <label className="flex items-center justify-between">
          <span>Mute Audio</span>
          <input type="checkbox" checked={audioMuted} onChange={(event) => onAudioMuted(event.target.checked)} />
        </label>
        <label className="mt-1 block">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            className="mt-1 w-full"
            value={audioVolume}
            onChange={(event) => onAudioVolume(Number(event.target.value))}
          />
        </label>
      </div>

      <Button size="sm" className="mt-2 w-full" onClick={onOpenTutorial}>
        Open Tutorial
      </Button>

      <div className="mt-2 rounded border border-border p-2">
        <p className="font-medium">Achievements</p>
        <ul className="mt-1 space-y-1">
          {achievements.map((achievement) => (
            <li key={achievement.id} className={achievement.unlocked ? "text-emerald-500" : "text-muted-foreground"}>
              {achievement.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
