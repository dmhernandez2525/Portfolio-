import { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Pause, Play, RotateCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants"
import { createCharacter, updateCharacter, updateButtons, updateLevers, updateMovingPlatforms, collectGems } from "./engine"
import { render } from "./renderer"
import { createInputState, handleKeyDown, handleKeyUp } from "./controls"
import { levels, cloneLevel } from "./levels"
import type { GameState, GamePhase, InputState } from "./types"

const SAVE_KEY = "fireboy-watergirl-save"

interface SaveData {
  bestTimes: (number | null)[]
  unlockedLevels: number
}

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data.bestTimes && typeof data.unlockedLevels === "number") return data
    }
  } catch { /* ignore */ }
  return { bestTimes: levels.map(() => null), unlockedLevels: 1 }
}

function saveSave(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
}

function createGameState(levelIndex: number, save: SaveData): GameState {
  const level = cloneLevel(levelIndex)
  return {
    fire: createCharacter(level.fireSpawn, "fire"),
    water: createCharacter(level.waterSpawn, "water"),
    level,
    levelIndex,
    phase: "playing",
    fireGems: 0,
    waterGems: 0,
    totalFireGems: level.gems.filter(g => g.type === "fire").length,
    totalWaterGems: level.gems.filter(g => g.type === "water").length,
    timer: 0,
    bestTimes: save.bestTimes,
    unlockedLevels: save.unlockedLevels,
    deathMessage: "",
  }
}

export function FireboyWatergirlGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<GameState | null>(null)
  const inputRef = useRef<InputState>(createInputState())
  const leverPressedRef = useRef<Set<string>>(new Set())
  const lastTimeRef = useRef<number>(0)
  const animIdRef = useRef<number>(0)

  const [phase, setPhase] = useState<GamePhase>("menu")
  const [levelIndex, setLevelIndex] = useState(0)
  const [save, setSave] = useState<SaveData>(loadSave)
  const [completionData, setCompletionData] = useState<{
    fireGems: number; waterGems: number; totalFire: number; totalWater: number; time: number; bestTime: number | null
  } | null>(null)

  const startLevel = useCallback((index: number) => {
    const currentSave = loadSave()
    setSave(currentSave)
    stateRef.current = createGameState(index, currentSave)
    inputRef.current = createInputState()
    leverPressedRef.current = new Set()
    lastTimeRef.current = performance.now()
    setLevelIndex(index)
    setPhase("playing")
    setCompletionData(null)
  }, [])

  const restartLevel = useCallback(() => {
    startLevel(levelIndex)
  }, [levelIndex, startLevel])

  // Game loop
  useEffect(() => {
    if (phase !== "playing" && phase !== "game-over") return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const loop = (timestamp: number) => {
      const state = stateRef.current
      if (!state || state.phase === "paused") {
        animIdRef.current = requestAnimationFrame(loop)
        return
      }

      // Delta time for timer (capped at 100ms to prevent huge jumps)
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = timestamp

      if (state.phase === "playing") {
        state.timer += dt
        const input = inputRef.current

        // Update moving platforms first (so characters can ride them)
        updateMovingPlatforms(state.level, state.fire, state.water)

        // Update characters
        updateCharacter(state.fire, {
          left: input.fireLeft, right: input.fireRight, up: input.fireUp,
        }, state.level, dt)

        updateCharacter(state.water, {
          left: input.waterLeft, right: input.waterRight, up: input.waterUp,
        }, state.level, dt)

        // Update triggers
        updateButtons(state.level, state.fire, state.water)
        updateLevers(state.level, state.fire, state.water, leverPressedRef.current)

        // Collect gems
        const { fireCollected, waterCollected } = collectGems(state.level, state.fire, state.water)
        state.fireGems += fireCollected
        state.waterGems += waterCollected

        // Check death
        if (!state.fire.alive || !state.water.alive) {
          if (!state.fire.alive && !state.water.alive) {
            state.deathMessage = "Both characters died!"
          } else if (!state.fire.alive) {
            state.deathMessage = "Fireboy died!"
          } else {
            state.deathMessage = "Watergirl died!"
          }
          state.phase = "game-over"
          setPhase("game-over")
        }

        // Check level completion
        if (state.fire.atExit && state.water.atExit) {
          const time = Math.floor(state.timer)
          const bestTime = state.bestTimes[state.levelIndex]
          const newBest = bestTime === null || time < bestTime

          if (newBest) {
            state.bestTimes[state.levelIndex] = time
          }

          const newUnlocked = Math.max(state.unlockedLevels, state.levelIndex + 2)
          state.unlockedLevels = newUnlocked

          const newSave: SaveData = {
            bestTimes: [...state.bestTimes],
            unlockedLevels: newUnlocked,
          }
          saveSave(newSave)
          setSave(newSave)

          setCompletionData({
            fireGems: state.fireGems,
            waterGems: state.waterGems,
            totalFire: state.totalFireGems,
            totalWater: state.totalWaterGems,
            time,
            bestTime: newBest ? time : bestTime,
          })

          state.phase = "level-complete"
          if (state.levelIndex >= levels.length - 1) {
            setPhase("all-complete")
          } else {
            setPhase("level-complete")
          }
          render(ctx, state)
          return
        }
      }

      // Render
      render(ctx, state)
      animIdRef.current = requestAnimationFrame(loop)
    }

    animIdRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animIdRef.current)
  }, [phase])

  // Keyboard handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === "Escape") {
        if (phase === "playing") {
          if (stateRef.current) stateRef.current.phase = "paused"
          setPhase("paused")
        } else if (phase === "paused") {
          if (stateRef.current) stateRef.current.phase = "playing"
          lastTimeRef.current = performance.now()
          setPhase("playing")
        }
        return
      }

      if (e.key === " ") {
        if (phase === "game-over") {
          restartLevel()
        }
        return
      }

      handleKeyDown(inputRef.current, e.key)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      handleKeyUp(inputRef.current, e.key)
    }

    const onBlur = () => {
      inputRef.current = createInputState()
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [phase, restartLevel])

  // Touch controls for mobile
  const handleTouch = useCallback((type: "fire" | "water", action: "left" | "right" | "up", pressed: boolean) => {
    const input = inputRef.current
    if (type === "fire") {
      if (action === "left") input.fireLeft = pressed
      else if (action === "right") input.fireRight = pressed
      else if (action === "up") input.fireUp = pressed
    } else {
      if (action === "left") input.waterLeft = pressed
      else if (action === "right") input.waterRight = pressed
      else if (action === "up") input.waterUp = pressed
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden flex flex-col items-center justify-center">
      {/* Top bar */}
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-center z-20">
        <Link to="/games">
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-1" /> Games
          </Button>
        </Link>
        {phase === "playing" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              if (stateRef.current) stateRef.current.phase = "paused"
              setPhase("paused")
            }}
          >
            <Pause className="w-4 h-4 mr-1" /> Pause
          </Button>
        )}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-purple-900/30 rounded-lg max-w-full max-h-[70vh]"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Mobile touch controls */}
      {phase === "playing" && (
        <div className="md:hidden flex w-full max-w-[800px] mt-2 gap-2 px-2">
          {/* Watergirl controls (left side) */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-blue-400 text-xs font-bold">Watergirl</span>
            <div className="flex gap-1">
              <TouchButton label="W" onPress={() => handleTouch("water", "up", true)} onRelease={() => handleTouch("water", "up", false)} color="blue" />
            </div>
            <div className="flex gap-1">
              <TouchButton label="A" onPress={() => handleTouch("water", "left", true)} onRelease={() => handleTouch("water", "left", false)} color="blue" />
              <TouchButton label="D" onPress={() => handleTouch("water", "right", true)} onRelease={() => handleTouch("water", "right", false)} color="blue" />
            </div>
          </div>
          {/* Fireboy controls (right side) */}
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-orange-400 text-xs font-bold">Fireboy</span>
            <div className="flex gap-1">
              <TouchButton label="^" onPress={() => handleTouch("fire", "up", true)} onRelease={() => handleTouch("fire", "up", false)} color="orange" />
            </div>
            <div className="flex gap-1">
              <TouchButton label="<" onPress={() => handleTouch("fire", "left", true)} onRelease={() => handleTouch("fire", "left", false)} color="orange" />
              <TouchButton label=">" onPress={() => handleTouch("fire", "right", true)} onRelease={() => handleTouch("fire", "right", false)} color="orange" />
            </div>
          </div>
        </div>
      )}

      {/* Menu overlay */}
      {phase === "menu" && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center max-w-md mx-4">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-orange-400">Fireboy</span>
              <span className="text-white"> & </span>
              <span className="text-blue-400">Watergirl</span>
            </h1>
            <p className="text-gray-400 text-sm mb-6">The Temple of Elements</p>

            <div className="mb-6 text-left bg-white/5 rounded-lg p-4 text-xs text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span><span className="text-orange-400 font-bold">Fireboy:</span> Arrow Keys</span>
                <span className="text-gray-500">Safe in lava, dies in water</span>
              </div>
              <div className="flex justify-between">
                <span><span className="text-blue-400 font-bold">Watergirl:</span> W A D</span>
                <span className="text-gray-500">Safe in water, dies in lava</span>
              </div>
              <div className="text-gray-500 pt-1">Green goo kills both. Both must reach their door.</div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-white text-sm font-semibold">Select Level</p>
              <div className="flex flex-wrap justify-center gap-2">
                {levels.map((lvl, i) => {
                  const unlocked = i < save.unlockedLevels
                  const best = save.bestTimes[i]
                  return (
                    <button
                      key={i}
                      disabled={!unlocked}
                      onClick={() => unlocked && startLevel(i)}
                      className={`w-20 h-20 rounded-lg border text-center p-1 transition-all ${
                        unlocked
                          ? "border-purple-500/50 bg-purple-900/30 hover:bg-purple-800/50 hover:border-purple-400 cursor-pointer"
                          : "border-gray-700 bg-gray-900/50 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-lg font-bold text-white">{i + 1}</div>
                      <div className="text-[9px] text-gray-400 leading-tight">{lvl.name}</div>
                      {best !== null && (
                        <div className="text-[9px] text-green-400 mt-0.5">{best}s</div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {phase === "paused" && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">Paused</h2>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  if (stateRef.current) stateRef.current.phase = "playing"
                  lastTimeRef.current = performance.now()
                  setPhase("playing")
                }}
                className="bg-purple-600 hover:bg-purple-500"
              >
                <Play className="w-4 h-4 mr-2" /> Resume
              </Button>
              <Button variant="outline" onClick={restartLevel} className="text-white border-white/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Restart Level
              </Button>
              <Button variant="outline" onClick={() => setPhase("menu")} className="text-white border-white/30">
                <Home className="w-4 h-4 mr-2" /> Level Select
              </Button>
            </div>
            <p className="text-gray-500 text-xs">Press ESC to resume</p>
          </div>
        </div>
      )}

      {/* Level complete overlay */}
      {phase === "level-complete" && completionData && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center space-y-4 max-w-sm mx-4">
            <h2 className="text-3xl font-bold text-green-400">Level Complete!</h2>
            <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between text-orange-400">
                <span>Fire Gems</span>
                <span>{completionData.fireGems}/{completionData.totalFire}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>Water Gems</span>
                <span>{completionData.waterGems}/{completionData.totalWater}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Time</span>
                <span>{completionData.time}s</span>
              </div>
              {completionData.bestTime !== null && (
                <div className="flex justify-between text-yellow-400 text-xs">
                  <span>Best Time</span>
                  <span>{completionData.bestTime}s</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {levelIndex < levels.length - 1 && (
                <Button
                  onClick={() => startLevel(levelIndex + 1)}
                  className="bg-green-600 hover:bg-green-500"
                >
                  Next Level
                </Button>
              )}
              <Button variant="outline" onClick={restartLevel} className="text-white border-white/30">
                <RotateCcw className="w-4 h-4 mr-2" /> Replay
              </Button>
              <Button variant="outline" onClick={() => setPhase("menu")} className="text-white border-white/30">
                Level Select
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* All complete overlay */}
      {phase === "all-complete" && completionData && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center space-y-4 max-w-sm mx-4">
            <h2 className="text-4xl font-bold">
              <span className="text-orange-400">Fire</span>
              <span className="text-white"> & </span>
              <span className="text-blue-400">Water</span>
            </h2>
            <p className="text-2xl font-bold text-yellow-400">Temple Complete!</p>
            <p className="text-gray-400 text-sm">
              You completed all {levels.length} levels. Great teamwork!
            </p>
            <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between text-orange-400">
                <span>Fire Gems</span>
                <span>{completionData.fireGems}/{completionData.totalFire}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>Water Gems</span>
                <span>{completionData.waterGems}/{completionData.totalWater}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Final Level Time</span>
                <span>{completionData.time}s</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setPhase("menu")} className="text-white border-white/30">
                Level Select
              </Button>
              <Link to="/games">
                <Button className="w-full bg-purple-600 hover:bg-purple-500">
                  Back to Games
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TouchButton({ label, onPress, onRelease, color }: {
  label: string
  onPress: () => void
  onRelease: () => void
  color: "orange" | "blue"
}) {
  const colorClass = color === "orange"
    ? "bg-orange-600/50 border-orange-500/50 active:bg-orange-500/70"
    : "bg-blue-600/50 border-blue-500/50 active:bg-blue-500/70"

  return (
    <button
      className={`w-12 h-12 rounded-lg border font-bold text-white text-lg select-none ${colorClass}`}
      onTouchStart={(e) => { e.preventDefault(); onPress() }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease() }}
      onTouchCancel={(e) => { e.preventDefault(); onRelease() }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
    >
      {label}
    </button>
  )
}
