import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const GRID_SIZE = 20
const SPEED = 100

type Point = { x: number; y: number }

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Point>({ x: 15, y: 15 })
  const [direction, setDirection] = useState<Point>({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(parseInt(localStorage.getItem("snake-highscore") || "0"))
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const spawnFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
  }, [])

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(spawnFood())
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }

  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("snake-highscore", score.toString())
    }
    if (gameLoopRef.current) clearInterval(gameLoopRef.current)
  }, [score, highScore])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return
      
      switch (e.key) {
        case "ArrowUp": if (direction.y === 0) setDirection({ x: 0, y: -1 }); break
        case "ArrowDown": if (direction.y === 0) setDirection({ x: 0, y: 1 }); break
        case "ArrowLeft": if (direction.x === 0) setDirection({ x: -1, y: 0 }); break
        case "ArrowRight": if (direction.x === 0) setDirection({ x: 1, y: 0 }); break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, direction])

  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = setInterval(() => {
        setSnake(prev => {
          const newHead = { x: prev[0].x + direction.x, y: prev[0].y + direction.y }

          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            endGame()
            return prev
          }

          // Self collision
          if (prev.some(p => p.x === newHead.x && p.y === newHead.y)) {
            endGame()
            return prev
          }

          const newSnake = [newHead, ...prev]
          
          // Food collision
          if (newHead.x === food.x && newHead.y === food.y) {
            setScore(s => s + 10)
            setFood(spawnFood())
          } else {
            newSnake.pop()
          }

          return newSnake
        })
      }, SPEED)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, direction, food, spawnFood, endGame])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-black/90 p-4 relative">
        <div className="absolute top-4 right-4 flex gap-4 text-neon-cyan font-mono z-10">
            <span>Score: {score}</span>
            <span className="flex items-center gap-1 text-yellow-400"><Trophy className="w-4 h-4" /> {highScore}</span>
        </div>

        <div 
          className="relative bg-gray-900 border-2 border-neon-cyan/30 rounded-lg shadow-[0_0_20px_rgba(137,247,254,0.1)]"
          style={{ 
            width: "min(80vw, 400px)", 
            height: "min(80vw, 400px)",
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE
            const y = Math.floor(i / GRID_SIZE)
            const isSnake = snake.some(p => p.x === x && p.y === y)
            const isFood = food.x === x && food.y === y
            const isHead = snake[0].x === x && snake[0].y === y
            
            return (
              <div 
                key={i} 
                className={cn(
                  "w-full h-full transition-all duration-150",
                  isHead ? "bg-neon-cyan shadow-[0_0_10px_#89f7fe] z-10 scale-110 rounded-sm" : 
                  isSnake ? "bg-neon-cyan/60 rounded-sm" : 
                  isFood ? "bg-neon-pink shadow-[0_0_10px_#E73C7E] animate-pulse rounded-full" : "transparent"
                )} 
              />
            )
          })}
          
          {(!isPlaying || gameOver) && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-20">
                <h2 className="text-3xl font-bold text-neon-cyan mb-4 font-mono">
                    {gameOver ? "GAME OVER" : "NEON SNAKE"}
                </h2>
                <Button onClick={resetGame} size="lg" className="gap-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
                     {gameOver ? <RotateCcw /> : <Play />}
                     {gameOver ? "Retry" : "Start"}
                </Button>
                <div className="mt-4 text-muted-foreground text-sm font-mono text-center">
                    Use Arrow Keys to Move<br/>
                    Collect Pink Orbs
                </div>
             </div>
          )}
        </div>
    </div>
  )
}
