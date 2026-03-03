import { useEffect, useMemo, useState } from "react"

interface EasterEggMiniGameModalProps {
  gameId: string | null
  title: string
  onClose: () => void
}

type GameResult = "idle" | "running" | "won" | "lost"

const ORBIT_TARGET_SCORE = 8
const ORBIT_DURATION_SECONDS = 15
const PIXEL_DURATION_SECONDS = 20

function randomTargetPosition(): { x: number; y: number } {
  return {
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 70,
  }
}

function generatePattern(): string[] {
  const alphabet = ["A", "S", "D", "F", "J", "K"]
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)])
}

function OrbitRunnerGame() {
  const [result, setResult] = useState<GameResult>("idle")
  const [timeLeft, setTimeLeft] = useState(ORBIT_DURATION_SECONDS)
  const [score, setScore] = useState(0)
  const [target, setTarget] = useState(randomTargetPosition)

  useEffect(() => {
    if (result !== "running") {
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setResult((score >= ORBIT_TARGET_SCORE ? "won" : "lost"))
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [result, score])

  const start = () => {
    setResult("running")
    setTimeLeft(ORBIT_DURATION_SECONDS)
    setScore(0)
    setTarget(randomTargetPosition())
  }

  const handleTargetClick = () => {
    if (result !== "running") {
      return
    }

    setScore((current) => current + 1)
    setTarget(randomTargetPosition())
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click the orbit target {ORBIT_TARGET_SCORE} times before the timer ends.
      </p>
      <div className="rounded border border-border p-3 text-xs flex items-center justify-between">
        <span>Time: {timeLeft}s</span>
        <span>Score: {score}</span>
      </div>

      <div className="relative h-56 rounded border border-border bg-muted/30 overflow-hidden">
        <button
          type="button"
          onClick={handleTargetClick}
          className="absolute size-8 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.7)]"
          style={{ left: `${target.x}%`, top: `${target.y}%`, transform: "translate(-50%, -50%)" }}
          aria-label="Orbit target"
        />
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={start} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm">
          {result === "running" ? "Restart" : "Start"}
        </button>
        <span className="text-sm">
          {result === "won" ? "You won Orbit Runner." : ""}
          {result === "lost" ? "Time ran out. Try again." : ""}
        </span>
      </div>
    </div>
  )
}

function PixelPortalGame() {
  const [result, setResult] = useState<GameResult>("idle")
  const [timeLeft, setTimeLeft] = useState(PIXEL_DURATION_SECONDS)
  const [entered, setEntered] = useState<string[]>([])
  const [pattern, setPattern] = useState<string[]>(() => generatePattern())

  const progressText = useMemo(() => entered.join(" "), [entered])

  useEffect(() => {
    if (result !== "running") {
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setResult("lost")
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [result])

  useEffect(() => {
    if (result !== "running") {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const next = event.key.toUpperCase()
      if (next.length !== 1) {
        return
      }

      setEntered((current) => {
        const expected = pattern[current.length]
        if (next !== expected) {
          return []
        }

        const updated = [...current, next]
        if (updated.length === pattern.length) {
          setResult("won")
        }
        return updated
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pattern, result])

  const start = () => {
    setPattern(generatePattern())
    setEntered([])
    setResult("running")
    setTimeLeft(PIXEL_DURATION_SECONDS)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Type the pattern exactly in order before the countdown ends.</p>
      <div className="rounded border border-border p-3 text-xs flex items-center justify-between">
        <span>Time: {timeLeft}s</span>
        <span>{entered.length}/{pattern.length}</span>
      </div>
      <div className="rounded border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Pattern</p>
        <p className="font-mono text-lg tracking-[0.4em]">{pattern.join(" ")}</p>
      </div>
      <div className="rounded border border-border p-3 min-h-12">
        <p className="text-xs text-muted-foreground">Typed</p>
        <p className="font-mono text-sm">{progressText || "..."}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={start} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm">
          {result === "running" ? "Restart" : "Start"}
        </button>
        <span className="text-sm">
          {result === "won" ? "Portal stabilized. You won." : ""}
          {result === "lost" ? "Sequence failed. Try again." : ""}
        </span>
      </div>
    </div>
  )
}

export function EasterEggMiniGameModal({ gameId, title, onClose }: EasterEggMiniGameModalProps) {
  if (!gameId) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-xl border border-border bg-background p-4 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-base">{title}</h3>
          <button type="button" onClick={onClose} className="px-2.5 py-1 rounded border border-border text-sm">
            Close
          </button>
        </div>

        {gameId === "orbit-runner" ? <OrbitRunnerGame /> : <PixelPortalGame />}
      </div>
    </div>
  )
}
