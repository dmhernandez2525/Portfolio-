import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Play, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Constants & Types ---
const ROWS = 20
const COLS = 10
const SPEED_START = 800
const SPEED_DECREMENT = 50

type Color = "cyan" | "purple" | "yellow" | "blue" | "orange" | "green" | "red" | "ghost"
type Board = (Color | null)[][]

const SHAPES: Record<string, { shape: number[][], color: Color }> = {
  I: { shape: [[1, 1, 1, 1]], color: "cyan" },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: "blue" },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: "orange" },
  O: { shape: [[1, 1], [1, 1]], color: "yellow" },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: "green" },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: "purple" },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: "red" },
}

const COLORS: Record<Color, string> = {
  cyan: "bg-cyan-400 shadow-[0_0_15px_#22d3ee]",
  blue: "bg-blue-500 shadow-[0_0_15px_#3b82f6]",
  orange: "bg-orange-500 shadow-[0_0_15px_#f97316]",
  yellow: "bg-yellow-400 shadow-[0_0_15px_#facc15]",
  green: "bg-green-500 shadow-[0_0_15px_#22c55e]",
  purple: "bg-purple-500 shadow-[0_0_15px_#a855f7]",
  red: "bg-red-500 shadow-[0_0_15px_#ef4444]",
  ghost: "bg-white/10 border border-white/20", // For shadow piece
}

// --- Helper Functions ---
const createBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(null))

const getRandomPiece = () => {
  const keys = Object.keys(SHAPES)
  const key = keys[Math.floor(Math.random() * keys.length)]
  return { ...SHAPES[key], type: key }
}

export function TetrisGame() {
  const [board, setBoard] = useState<Board>(createBoard())
  const [activePiece, setActivePiece] = useState({ 
    shape: SHAPES.T.shape, 
    color: SHAPES.T.color, 
    x: 3, 
    y: 0 
  })
  const [nextPiece, setNextPiece] = useState(getRandomPiece())
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // --- Game Logic ---
  const checkCollision = useCallback((pieceX: number, pieceY: number, shape: number[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pieceX + x
          const newY = pieceY + y
          
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
            return true
          }
        }
      }
    }
    return false
  }, [board])

  const rotatePiece = useCallback(() => {
    const rotated = activePiece.shape[0].map((_, index) =>
      activePiece.shape.map(row => row[index]).reverse()
    )
    if (!checkCollision(activePiece.x, activePiece.y, rotated)) {
        setActivePiece(prev => ({ ...prev, shape: rotated }))
    } else if (!checkCollision(activePiece.x - 1, activePiece.y, rotated)) {
        setActivePiece(prev => ({ ...prev, shape: rotated, x: prev.x - 1 }))
    } else if (!checkCollision(activePiece.x + 1, activePiece.y, rotated)) {
        setActivePiece(prev => ({ ...prev, shape: rotated, x: prev.x + 1 }))
    }
  }, [activePiece, checkCollision])

  const mergePiece = useCallback(() => {
    const newBoard = board.map(row => [...row])
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
            if (activePiece.y + y >= 0) {
                newBoard[activePiece.y + y][activePiece.x + x] = activePiece.color
            }
        }
      })
    })

    let linesCleared = 0
    const finalBoard = newBoard.filter(row => {
        const full = row.every(cell => cell !== null)
        if (full) linesCleared++
        return !full
    })

    while (finalBoard.length < ROWS) {
        finalBoard.unshift(Array(COLS).fill(null))
    }

    if (linesCleared > 0) {
        setScore(prev => prev + (linesCleared * 100 * level))
        setLevel(prev => Math.floor((prev + (linesCleared * 100 * level)) / 1000) + 1)
    }

    setBoard(finalBoard)
    
    const newPiece = nextPiece
    setNextPiece(getRandomPiece())
    
    if (checkCollision(3, 0, newPiece.shape)) {
        setGameOver(true)
        setIsPlaying(false)
    } else {
        setActivePiece({ ...newPiece, x: 3, y: 0 })
    }
  }, [board, activePiece, nextPiece, checkCollision, level])

  const drop = useCallback(() => {
    if (checkCollision(activePiece.x, activePiece.y + 1, activePiece.shape)) {
        mergePiece()
    } else {
        setActivePiece(prev => ({ ...prev, y: prev.y + 1 }))
    }
  }, [activePiece, checkCollision, mergePiece])

  const move = useCallback((dir: -1 | 1) => {
    if (!checkCollision(activePiece.x + dir, activePiece.y, activePiece.shape)) {
        setActivePiece(prev => ({ ...prev, x: prev.x + dir }))
    }
  }, [activePiece, checkCollision])

  const hardDrop = useCallback(() => {
    let dropY = activePiece.y
    while (!checkCollision(activePiece.x, dropY + 1, activePiece.shape)) {
        dropY++
    }
    setActivePiece(prev => ({ ...prev, y: dropY }))
  }, [activePiece, checkCollision])

  // Shadow Piece Calculation
  let shadowY = activePiece.y
  while (!checkCollision(activePiece.x, shadowY + 1, activePiece.shape) && isPlaying) {
      shadowY++
  }

  // --- Game Loop ---
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      const speed = Math.max(100, SPEED_START - (level - 1) * SPEED_DECREMENT)
      gameLoopRef.current = setInterval(drop, speed)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, isPaused, gameOver, level, drop]) // Added drop to dep array

  // --- Inputs ---
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || gameOver) return

      if (e.key === "ArrowLeft") move(-1)
      if (e.key === "ArrowRight") move(1)
      if (e.key === "ArrowDown") drop()
      if (e.key === "ArrowUp") rotatePiece()
      if (e.key === " ") hardDrop()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isPlaying, isPaused, gameOver, move, drop, rotatePiece, hardDrop])

  const resetGame = () => {
    setBoard(createBoard())
    setScore(0)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
    setActivePiece({ ...getRandomPiece(), x: 3, y: 0 })
    setNextPiece(getRandomPiece())
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-4 h-full bg-black/90 text-white rounded-xl">
        
        {/* Left Panel: Stats */}
        <div className="flex flex-col gap-4 min-w-[120px]">
            <div className="bg-gray-900 p-4 rounded-lg border border-neon-cyan/30 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Score</div>
                <div className="text-2xl font-bold text-neon-cyan font-mono">{score}</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-neon-purple/30 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Level</div>
                <div className="text-2xl font-bold text-neon-purple font-mono">{level}</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Next</div>
                <div className="grid grid-cols-4 gap-1 w-16 h-12 mx-auto place-content-center">
                     {nextPiece.shape.map((row, y) => row.map((cell, x) => (
                        <div key={`${x}-${y}`} className={cn("w-3 h-3 rounded-[1px]", cell ? COLORS[nextPiece.color] : "bg-transparent")} />
                     )))}
                </div>
            </div>
        </div>

        {/* Main Board */}
        <div className="relative bg-gray-900 border-2 border-neon-cyan/20 p-1 rounded-lg shadow-[0_0_30px_rgba(137,247,254,0.1)]">
            <div 
                className="grid gap-[1px] bg-gray-800/50"
                style={{ 
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                    width: "min(70vw, 300px)",
                    height: "min(140vw, 600px)"
                }}
            >
                {board.map((row, y) => row.map((cell, x) => {
                    // Render Active Piece
                    let color = cell

                    if (isPlaying && !gameOver) {
                         // Check Shadow
                         const isShadow = activePiece.shape[y - shadowY]?.[x - activePiece.x]
                         
                         // Check Actual Piece
                         const isActive = activePiece.shape[y - activePiece.y]?.[x - activePiece.x]

                         if (isActive) {
                             color = activePiece.color
                         } else if (isShadow) {
                             // Only render shadow if screen position is valid and cell is empty
                             if (board[y][x] === null) {
                                  color = "ghost"
                             }
                         }
                    }

                    return (
                        <div 
                            key={`${x}-${y}`} 
                            className={cn(
                                "w-full h-full rounded-[2px] transition-all duration-75",
                                color ? COLORS[color] : "bg-gray-900/40"
                            )}
                        />
                    )
                }))}
            </div>

            {/* Overlays */}
            {(!isPlaying || isPaused || gameOver) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    {gameOver ? (
                        <>
                            <h2 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h2>
                            <p className="text-xl mb-6">Final Score: {score}</p>
                            <Button onClick={resetGame} size="lg" className="bg-neon-cyan text-black hover:bg-cyan-300">
                                <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                            </Button>
                        </>
                    ) : isPaused ? (
                        <>
                            <h2 className="text-3xl font-bold text-yellow-400 mb-6">PAUSED</h2>
                            <Button onClick={() => setIsPaused(false)} size="lg">
                                <Play className="mr-2 h-4 w-4" /> Resume
                            </Button>
                        </>
                    ) : (
                        <Button onClick={resetGame} size="lg" className="text-xl px-8 py-6 bg-neon-cyan text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(137,247,254,0.5)]">
                             <Play className="mr-2 h-6 w-6" /> Start Game
                        </Button>
                    )}
                </div>
            )}
        </div>

        {/* Controls (Mobile/Visual) */}
        <div className="flex md:flex-col gap-4">
             <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-gray-600 active:bg-neon-cyan/20"
                onClick={() => move(-1)}
            >
                ←
             </Button>
             <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-gray-600 active:bg-neon-cyan/20"
                onClick={rotatePiece}
            >
                 ↻
             </Button>
             <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-gray-600 active:bg-neon-cyan/20"
                onClick={() => move(1)}
            >
                →
             </Button>
             <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-gray-600 active:bg-neon-cyan/20 md:mt-4"
                onClick={hardDrop}
            >
                 <ChevronDown className="h-6 w-6" />
             </Button>
             
             <div className="hidden md:block mt-8 text-xs text-center text-muted-foreground font-mono">
                <p>Space: Drop</p>
                <p>↑: Rotate</p>
             </div>
        </div>

    </div>
  )
}
