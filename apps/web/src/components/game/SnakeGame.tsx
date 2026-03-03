import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Trophy, Pause } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Constants ---
const GRID_SIZE = 20
const INITIAL_SPEED = 150 // ms per move
const MIN_SPEED = 50 // Fastest possible
const SPEED_DECREASE_PER_FOOD = 3 // Get faster with each food

type Point = { x: number; y: number }
type Direction = Point

// Direction vectors
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
} as const

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Point>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Direction>(DIRECTIONS.RIGHT)
  const [nextDirection, setNextDirection] = useState<Direction>(DIRECTIONS.RIGHT)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem("snake-highscore") || "0")
  )
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [speed, setSpeed] = useState(INITIAL_SPEED)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Spawn food in a position not occupied by snake
  const spawnFood = useCallback((currentSnake: Point[]): Point => {
    const occupiedPositions = new Set(
      currentSnake.map(p => `${p.x},${p.y}`)
    )

    const availablePositions: Point[] = []
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!occupiedPositions.has(`${x},${y}`)) {
          availablePositions.push({ x, y })
        }
      }
    }

    if (availablePositions.length === 0) {
      // Win condition - snake fills the board
      return { x: -1, y: -1 }
    }

    return availablePositions[Math.floor(Math.random() * availablePositions.length)]
  }, [])

  // Reset game state
  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }]
    setSnake(initialSnake)
    setFood(spawnFood(initialSnake))
    setDirection(DIRECTIONS.RIGHT)
    setNextDirection(DIRECTIONS.RIGHT)
    setScore(0)
    setSpeed(INITIAL_SPEED)
    setGameOver(false)
    setIsPaused(false)
    setIsPlaying(true)
    setIsNewHighScore(false)
  }, [spawnFood])

  // End game and save high score
  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    const didBeatHighScore = score > highScore
    setIsNewHighScore(didBeatHighScore)
    if (didBeatHighScore) {
      setHighScore(score)
      localStorage.setItem("snake-highscore", score.toString())
    }
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }
  }, [score, highScore])

  // Game tick
  const tick = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    // Apply queued direction change
    setDirection(nextDirection)

    setSnake(prev => {
      const currentDirection = nextDirection
      const head = prev[0]
      const newHead: Point = {
        x: head.x + currentDirection.x,
        y: head.y + currentDirection.y
      }

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        endGame()
        return prev
      }

      // Self collision (check against all except tail which will move)
      const bodyToCheck = prev.slice(0, -1) // Exclude tail
      if (bodyToCheck.some(p => p.x === newHead.x && p.y === newHead.y)) {
        endGame()
        return prev
      }

      const newSnake = [newHead, ...prev]

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10)
        setSpeed(s => Math.max(MIN_SPEED, s - SPEED_DECREASE_PER_FOOD))
        const newFood = spawnFood(newSnake)
        if (newFood.x === -1) {
          // Win! Snake fills the board
          endGame()
          return prev
        }
        setFood(newFood)
        // Don't remove tail - snake grows
      } else {
        newSnake.pop() // Remove tail
      }

      return newSnake
    })
  }, [isPlaying, isPaused, gameOver, nextDirection, food, endGame, spawnFood])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(tick, speed)
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [isPlaying, isPaused, gameOver, speed, tick])

  // Check if direction change is valid (can't reverse)
  const isValidDirectionChange = useCallback((current: Direction, next: Direction): boolean => {
    // Can't reverse direction
    return !(current.x === -next.x && current.y === -next.y)
  }, [])

  // Change direction with validation
  const changeDirection = useCallback((newDir: Direction) => {
    if (isValidDirectionChange(direction, newDir)) {
      setNextDirection(newDir)
    }
  }, [direction, isValidDirectionChange])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Pause toggle
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (isPlaying && !gameOver) {
          setIsPaused(p => !p)
        }
        return
      }

      if (!isPlaying || isPaused || gameOver) return

      // Prevent default for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          changeDirection(DIRECTIONS.UP)
          break
        case "ArrowDown":
        case "s":
        case "S":
          changeDirection(DIRECTIONS.DOWN)
          break
        case "ArrowLeft":
        case "a":
        case "A":
          changeDirection(DIRECTIONS.LEFT)
          break
        case "ArrowRight":
        case "d":
        case "D":
          changeDirection(DIRECTIONS.RIGHT)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, isPaused, gameOver, changeDirection])

  // Touch/swipe controls for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !isPlaying || isPaused || gameOver) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const minSwipeDistance = 30

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        changeDirection(deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT)
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        changeDirection(deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP)
      }
    }

    touchStartRef.current = null
  }, [isPlaying, isPaused, gameOver, changeDirection])

  // Get snake segment type for rendering
  const getSegmentType = (index: number, length: number): "head" | "body" | "tail" => {
    if (index === 0) return "head"
    if (index === length - 1) return "tail"
    return "body"
  }

  // Calculate current speed percentage for display
  const speedPercentage = Math.round(((INITIAL_SPEED - speed) / (INITIAL_SPEED - MIN_SPEED)) * 100)

  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-white dark:bg-black/90 p-4 relative select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Stats Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-lg border border-cyan-500/30">
            <span className="text-sm text-muted-foreground mr-2">Score:</span>
            <span className="text-xl font-bold text-cyan-600 dark:text-neon-cyan font-mono">{score}</span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 text-xs">
            <span className="text-muted-foreground">Speed: </span>
            <span className="font-mono text-orange-600 dark:text-orange-400">{speedPercentage}%</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg border border-yellow-500/30">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-mono text-yellow-600 dark:text-yellow-400">{highScore}</span>
          </div>
          {isPlaying && !gameOver && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(p => !p)}
              className="text-xs"
            >
              {isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
        </div>
      </div>

      {/* Game Board */}
      <div
        className="relative bg-gray-100 dark:bg-gray-900 border-2 border-cyan-500/50 dark:border-neon-cyan/30 rounded-lg shadow-lg dark:shadow-[0_0_20px_rgba(137,247,254,0.1)] mt-20"
        style={{
          width: "min(85vw, 400px)",
          height: "min(85vw, 400px)",
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          gap: "1px",
          padding: "2px"
        }}
      >
        {/* Grid cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE
          const y = Math.floor(i / GRID_SIZE)
          const snakeIndex = snake.findIndex(p => p.x === x && p.y === y)
          const isSnake = snakeIndex !== -1
          const isFood = food.x === x && food.y === y
          const segmentType = isSnake ? getSegmentType(snakeIndex, snake.length) : null

          return (
            <div
              key={i}
              className={cn(
                "w-full h-full transition-all duration-100",
                // Snake head
                segmentType === "head" && "bg-cyan-500 dark:bg-neon-cyan shadow-md dark:shadow-[0_0_10px_#89f7fe] rounded-sm z-10 scale-105",
                // Snake body
                segmentType === "body" && "bg-cyan-400/70 dark:bg-neon-cyan/60 rounded-[2px]",
                // Snake tail
                segmentType === "tail" && "bg-cyan-300/50 dark:bg-neon-cyan/40 rounded-[2px]",
                // Food
                isFood && "bg-pink-500 dark:bg-neon-pink shadow-md dark:shadow-[0_0_10px_#E73C7E] rounded-full animate-pulse scale-90",
                // Empty cell
                !isSnake && !isFood && "bg-gray-200/30 dark:bg-gray-800/30 rounded-[1px]"
              )}
            />
          )
        })}

        {/* Overlays */}
        {(!isPlaying || isPaused || gameOver) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/70 backdrop-blur-sm z-20 rounded-lg">
            {gameOver ? (
              <>
                <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
                <p className="text-lg text-foreground mb-1">Final Score: {score}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Length: {snake.length} | Speed: {speedPercentage}%
                </p>
                {isNewHighScore && (
                  <p className="text-yellow-500 font-bold mb-4 animate-pulse">NEW HIGH SCORE!</p>
                )}
                <Button onClick={resetGame} size="lg" className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Play Again
                </Button>
              </>
            ) : isPaused ? (
              <>
                <h2 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">PAUSED</h2>
                <Button onClick={() => setIsPaused(false)} size="lg" className="gap-2">
                  <Play className="h-4 w-4" /> Resume
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Press ESC or P to pause</p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-cyan-600 dark:text-neon-cyan mb-4 font-mono">
                  SNAKE
                </h2>
                <Button onClick={resetGame} size="lg" className="gap-2 text-lg px-6 py-5">
                  <Play className="h-5 w-5" /> Start Game
                </Button>
                <div className="mt-6 text-muted-foreground text-sm font-mono text-center space-y-1">
                  <p>Arrow Keys or WASD to move</p>
                  <p>Swipe on mobile</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">Collect pink orbs • Avoid walls & yourself</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile D-Pad Controls */}
      <div className="md:hidden mt-6 grid grid-cols-3 gap-2 w-40">
        <div /> {/* Empty */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-lg active:bg-cyan-500/20"
          onClick={() => changeDirection(DIRECTIONS.UP)}
          disabled={!isPlaying || isPaused}
        >
          ↑
        </Button>
        <div /> {/* Empty */}

        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-lg active:bg-cyan-500/20"
          onClick={() => changeDirection(DIRECTIONS.LEFT)}
          disabled={!isPlaying || isPaused}
        >
          ←
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-lg"
          onClick={() => setIsPaused(p => !p)}
          disabled={!isPlaying}
        >
          {isPaused ? "▶" : "⏸"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-lg active:bg-cyan-500/20"
          onClick={() => changeDirection(DIRECTIONS.RIGHT)}
          disabled={!isPlaying || isPaused}
        >
          →
        </Button>

        <div /> {/* Empty */}
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-lg active:bg-cyan-500/20"
          onClick={() => changeDirection(DIRECTIONS.DOWN)}
          disabled={!isPlaying || isPaused}
        >
          ↓
        </Button>
        <div /> {/* Empty */}
      </div>

      {/* Desktop controls hint */}
      <div className="hidden md:block mt-4 text-xs text-muted-foreground text-center">
        <p>Arrow Keys / WASD to move • P to pause</p>
      </div>
    </div>
  )
}
