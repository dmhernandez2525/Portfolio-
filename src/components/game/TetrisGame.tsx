import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Play, ChevronDown, Pause, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Constants & Types ---
const ROWS = 20
const COLS = 10
const INITIAL_SPEED = 800
const MIN_SPEED = 80
const SPEED_DECREASE_PER_LEVEL = 50
const LINES_PER_LEVEL = 10

type Color = "cyan" | "purple" | "yellow" | "blue" | "orange" | "green" | "red" | "ghost"
type Board = (Color | null)[][]
type PieceType = "I" | "J" | "L" | "O" | "S" | "T" | "Z"

interface Piece {
  shape: number[][]
  color: Color
  type: PieceType
}

interface ActivePiece extends Piece {
  x: number
  y: number
}

// Standard Tetris pieces (SRS)
const SHAPES: Record<PieceType, { shape: number[][], color: Color }> = {
  I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: "cyan" },
  J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: "blue" },
  L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: "orange" },
  O: { shape: [[1,1], [1,1]], color: "yellow" },
  S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: "green" },
  T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: "purple" },
  Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: "red" },
}

// SRS Wall Kick Data for J, L, S, T, Z pieces
const WALL_KICKS_JLSTZ: Record<string, [number, number][]> = {
  "0->1": [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  "1->0": [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  "1->2": [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  "2->1": [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  "2->3": [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  "3->2": [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  "3->0": [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  "0->3": [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
}

// SRS Wall Kick Data for I piece
const WALL_KICKS_I: Record<string, [number, number][]> = {
  "0->1": [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  "1->0": [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  "1->2": [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
  "2->1": [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  "2->3": [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  "3->2": [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  "3->0": [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  "0->3": [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
}

const COLORS: Record<Color, string> = {
  cyan: "bg-cyan-400 shadow-[0_0_10px_#22d3ee]",
  blue: "bg-blue-500 shadow-[0_0_10px_#3b82f6]",
  orange: "bg-orange-500 shadow-[0_0_10px_#f97316]",
  yellow: "bg-yellow-400 shadow-[0_0_10px_#facc15]",
  green: "bg-green-500 shadow-[0_0_10px_#22c55e]",
  purple: "bg-purple-500 shadow-[0_0_10px_#a855f7]",
  red: "bg-red-500 shadow-[0_0_10px_#ef4444]",
  ghost: "bg-white/10 border border-white/30",
}

// Scoring based on official Tetris guidelines
const LINE_SCORES = [0, 100, 300, 500, 800] // 0, 1, 2, 3, 4 lines

// --- Helper Functions ---
const createBoard = (): Board => Array.from({ length: ROWS }, () => Array(COLS).fill(null))

const shuffleBag = (): PieceType[] => {
  const pieces: PieceType[] = ["I", "J", "L", "O", "S", "T", "Z"]
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]]
  }
  return pieces
}

const getPiece = (type: PieceType): Piece => ({
  ...SHAPES[type],
  type,
})

const getSpawnX = (piece: Piece): number => {
  return Math.floor((COLS - piece.shape[0].length) / 2)
}

export function TetrisGame() {
  const [board, setBoard] = useState<Board>(createBoard())
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null)
  const [heldPiece, setHeldPiece] = useState<PieceType | null>(null)
  const [canHold, setCanHold] = useState(true)
  const [pieceBag, setPieceBag] = useState<PieceType[]>([])
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [linesCleared, setLinesCleared] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem("tetris-highscore") || "0")
  )
  const [clearingLines, setClearingLines] = useState<number[]>([])
  const [rotationState, setRotationState] = useState(0) // 0, 1, 2, 3 for SRS

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lockDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get next pieces from bag
  const getNextPieces = useCallback((): PieceType[] => {
    let bag = [...pieceBag]
    while (bag.length < 7) {
      bag = [...bag, ...shuffleBag()]
    }
    return bag
  }, [pieceBag])

  const spawnPiece = useCallback((forcedType?: PieceType) => {
    const bag = getNextPieces()
    const type = forcedType || bag.shift()!
    if (!forcedType) {
      setPieceBag(bag.slice(0, bag.length))
    }

    const piece = getPiece(type)
    const newPiece: ActivePiece = {
      ...piece,
      x: getSpawnX(piece),
      y: 0
    }

    setRotationState(0)
    setCanHold(true)
    return newPiece
  }, [getNextPieces])

  // Check collision
  const checkCollision = useCallback((pieceX: number, pieceY: number, shape: number[][], boardState?: Board) => {
    const b = boardState || board
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pieceX + x
          const newY = pieceY + y

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true
          }
          if (newY >= 0 && b[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }, [board])

  // Rotate piece with SRS wall kicks
  const rotatePiece = useCallback((clockwise: boolean = true) => {
    if (!activePiece || activePiece.type === "O") return // O doesn't rotate

    const shape = activePiece.shape
    const rotated = clockwise
      ? shape[0].map((_, i) => shape.map(row => row[i]).reverse())
      : shape[0].map((_, i) => shape.map(row => row[shape[0].length - 1 - i]))

    const newRotation = clockwise
      ? (rotationState + 1) % 4
      : (rotationState + 3) % 4

    const kickKey = `${rotationState}->${newRotation}`
    const kicks = activePiece.type === "I" ? WALL_KICKS_I[kickKey] : WALL_KICKS_JLSTZ[kickKey]

    for (const [kickX, kickY] of kicks) {
      if (!checkCollision(activePiece.x + kickX, activePiece.y - kickY, rotated)) {
        setActivePiece(prev => prev ? {
          ...prev,
          shape: rotated,
          x: prev.x + kickX,
          y: prev.y - kickY
        } : null)
        setRotationState(newRotation)
        return
      }
    }
  }, [activePiece, rotationState, checkCollision])

  const handleGameOver = useCallback(() => {
    setGameOver(true)
    setIsPlaying(false)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("tetris-highscore", score.toString())
    }
  }, [score, highScore])

  // Merge piece into board and check for line clears
  const mergePiece = useCallback(() => {
    if (!activePiece) return

    const newBoard = board.map(row => [...row])
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value && activePiece.y + y >= 0) {
          newBoard[activePiece.y + y][activePiece.x + x] = activePiece.color
        }
      })
    })

    // Find completed lines
    const completedLines: number[] = []
    newBoard.forEach((row, index) => {
      if (row.every(cell => cell !== null)) {
        completedLines.push(index)
      }
    })

    if (completedLines.length > 0) {
      // Animate line clear
      setClearingLines(completedLines)

      setTimeout(() => {
        // Remove lines and add empty rows at top
        const filteredBoard = newBoard.filter((_, i) => !completedLines.includes(i))
        while (filteredBoard.length < ROWS) {
          filteredBoard.unshift(Array(COLS).fill(null))
        }

        setBoard(filteredBoard)
        setClearingLines([])

        // Update score and level
        const points = LINE_SCORES[completedLines.length] * level
        setScore(prev => prev + points)
        setLinesCleared(prev => {
          const newLines = prev + completedLines.length
          const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1
          setLevel(newLevel)
          return newLines
        })

        // Spawn next piece
        const next = spawnPiece()
        if (checkCollision(next.x, next.y, next.shape, filteredBoard)) {
          handleGameOver()
        } else {
          setActivePiece(next)
        }
      }, 200)
    } else {
      setBoard(newBoard)

      // Spawn next piece
      const next = spawnPiece()
      if (checkCollision(next.x, next.y, next.shape, newBoard)) {
        handleGameOver()
      } else {
        setActivePiece(next)
      }
    }
  }, [board, activePiece, level, spawnPiece, checkCollision, handleGameOver])



  // Move piece down
  const drop = useCallback(() => {
    if (!activePiece || clearingLines.length > 0) return

    if (checkCollision(activePiece.x, activePiece.y + 1, activePiece.shape)) {
      // Lock delay - give player a moment to adjust
      if (!lockDelayRef.current) {
        lockDelayRef.current = setTimeout(() => {
          mergePiece()
          lockDelayRef.current = null
        }, 500)
      }
    } else {
      if (lockDelayRef.current) {
        clearTimeout(lockDelayRef.current)
        lockDelayRef.current = null
      }
      setActivePiece(prev => prev ? { ...prev, y: prev.y + 1 } : null)
    }
  }, [activePiece, checkCollision, mergePiece, clearingLines])

  // Soft drop (faster fall + points)
  const softDrop = useCallback(() => {
    if (!activePiece || clearingLines.length > 0) return

    if (!checkCollision(activePiece.x, activePiece.y + 1, activePiece.shape)) {
      setActivePiece(prev => prev ? { ...prev, y: prev.y + 1 } : null)
      setScore(prev => prev + 1) // 1 point per cell soft dropped
    }
  }, [activePiece, checkCollision, clearingLines])

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!activePiece || clearingLines.length > 0) return

    let dropY = activePiece.y
    while (!checkCollision(activePiece.x, dropY + 1, activePiece.shape)) {
      dropY++
    }

    const cellsDropped = dropY - activePiece.y
    setScore(prev => prev + (cellsDropped * 2)) // 2 points per cell hard dropped

    setActivePiece(prev => prev ? { ...prev, y: dropY } : null)

    // Clear any lock delay and merge immediately
    if (lockDelayRef.current) {
      clearTimeout(lockDelayRef.current)
      lockDelayRef.current = null
    }

    setTimeout(() => mergePiece(), 0)
  }, [activePiece, checkCollision, mergePiece, clearingLines])

  // Move horizontally
  const move = useCallback((dir: -1 | 1) => {
    if (!activePiece || clearingLines.length > 0) return

    if (!checkCollision(activePiece.x + dir, activePiece.y, activePiece.shape)) {
      setActivePiece(prev => prev ? { ...prev, x: prev.x + dir } : null)

      // Reset lock delay if piece can move
      if (lockDelayRef.current) {
        clearTimeout(lockDelayRef.current)
        lockDelayRef.current = null
      }
    }
  }, [activePiece, checkCollision, clearingLines])

  // Hold piece
  const holdPiece = useCallback(() => {
    if (!activePiece || !canHold || clearingLines.length > 0) return

    const currentType = activePiece.type

    if (heldPiece) {
      // Swap with held piece
      const newPiece = spawnPiece(heldPiece)
      setActivePiece(newPiece)
    } else {
      // Just hold, spawn next
      const newPiece = spawnPiece()
      setActivePiece(newPiece)
    }

    setHeldPiece(currentType)
    setCanHold(false)
    setRotationState(0)
  }, [activePiece, heldPiece, canHold, spawnPiece, clearingLines])

  // Calculate ghost piece position
  const getGhostY = useCallback(() => {
    if (!activePiece) return 0

    let ghostY = activePiece.y
    while (!checkCollision(activePiece.x, ghostY + 1, activePiece.shape)) {
      ghostY++
    }
    return ghostY
  }, [activePiece, checkCollision])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver && clearingLines.length === 0) {
      const speed = Math.max(MIN_SPEED, INITIAL_SPEED - (level - 1) * SPEED_DECREASE_PER_LEVEL)
      gameLoopRef.current = setInterval(drop, speed)
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isPlaying, isPaused, gameOver, level, drop, clearingLines])

  // Keyboard input
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return

      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        setIsPaused(p => !p)
        return
      }

      if (isPaused) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          move(-1)
          break
        case "ArrowRight":
          e.preventDefault()
          move(1)
          break
        case "ArrowDown":
          e.preventDefault()
          softDrop()
          break
        case "ArrowUp":
        case "x":
        case "X":
          e.preventDefault()
          rotatePiece(true)
          break
        case "z":
        case "Z":
          e.preventDefault()
          rotatePiece(false)
          break
        case " ":
          e.preventDefault()
          hardDrop()
          break
        case "c":
        case "C":
        case "Shift":
          e.preventDefault()
          holdPiece()
          break
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isPlaying, isPaused, gameOver, move, softDrop, rotatePiece, hardDrop, holdPiece])

  const resetGame = () => {
    if (lockDelayRef.current) {
      clearTimeout(lockDelayRef.current)
      lockDelayRef.current = null
    }

    setBoard(createBoard())
    setScore(0)
    setLevel(1)
    setLinesCleared(0)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
    setHeldPiece(null)
    setCanHold(true)
    setClearingLines([])
    setRotationState(0)

    const newBag = shuffleBag()
    setPieceBag(newBag.slice(1))

    const firstPiece = getPiece(newBag[0])
    setActivePiece({
      ...firstPiece,
      x: getSpawnX(firstPiece),
      y: 0
    })
  }

  // Get next 3 pieces for preview
  const nextPieces = getNextPieces().slice(0, 3)
  const ghostY = getGhostY()

  // Render a piece preview (for hold and next)
  const renderPiecePreview = (type: PieceType | null, label: string, dimmed?: boolean) => {
    const piece = type ? SHAPES[type] : null
    return (
      <div className={cn(
        "bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border transition-all",
        dimmed
          ? "border-gray-300 dark:border-gray-700 opacity-50"
          : "border-cyan-500/30 dark:border-neon-cyan/30"
      )}>
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 text-center font-bold">
          {label}
        </div>
        <div className="w-16 h-12 flex items-center justify-center">
          {piece && (
            <div className="grid gap-[2px]" style={{
              gridTemplateColumns: `repeat(${piece.shape[0].length}, 12px)`
            }}>
              {piece.shape.flat().map((cell, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    cell ? COLORS[piece.color] : "bg-transparent"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center p-4 h-full bg-white dark:bg-black/90 text-foreground rounded-xl">
      {/* Left Panel: Hold & Stats */}
      <div className="flex md:flex-col gap-3 md:gap-4">
        {renderPiecePreview(heldPiece, "Hold (C)", !canHold)}

        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-cyan-500/30 dark:border-neon-cyan/30 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Score</div>
          <div className="text-xl font-bold text-cyan-600 dark:text-neon-cyan font-mono">{score.toLocaleString()}</div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-purple-500/30 dark:border-neon-purple/30 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Level</div>
          <div className="text-xl font-bold text-purple-600 dark:text-neon-purple font-mono">{level}</div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-green-500/30 text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Lines</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400 font-mono">{linesCleared}</div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-yellow-500/30 text-center">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-mono text-yellow-600 dark:text-yellow-400">{highScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Board */}
      <div className="relative bg-gray-100 dark:bg-gray-900 border-2 border-cyan-500/20 dark:border-neon-cyan/20 p-1 rounded-lg shadow-lg dark:shadow-[0_0_30px_rgba(137,247,254,0.1)]">
        <div
          className="grid gap-[1px] bg-gray-300/50 dark:bg-gray-800/50"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: "min(70vw, 250px)",
            height: "min(140vw, 500px)"
          }}
        >
          {board.map((row, y) => row.map((cell, x) => {
            let color = cell
            const isClearing = clearingLines.includes(y)

            // Render ghost piece
            if (isPlaying && !gameOver && activePiece && !isClearing) {
              const isGhost = activePiece.shape[y - ghostY]?.[x - activePiece.x]
              const isActive = activePiece.shape[y - activePiece.y]?.[x - activePiece.x]

              if (isActive) {
                color = activePiece.color
              } else if (isGhost && !color) {
                color = "ghost"
              }
            }

            return (
              <div
                key={`${x}-${y}`}
                className={cn(
                  "w-full h-full rounded-[2px] transition-all duration-75",
                  isClearing
                    ? "bg-white animate-pulse"
                    : color
                      ? COLORS[color]
                      : "bg-gray-200/50 dark:bg-gray-900/40"
                )}
              />
            )
          }))}
        </div>

        {/* Overlays */}
        {(!isPlaying || isPaused || gameOver) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
            {gameOver ? (
              <>
                <h2 className="text-2xl font-bold text-red-500 mb-2">GAME OVER</h2>
                <p className="text-lg mb-1 text-foreground">Score: {score.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mb-4">Lines: {linesCleared} | Level: {level}</p>
                {score >= highScore && score > 0 && (
                  <p className="text-yellow-500 font-bold mb-4">NEW HIGH SCORE!</p>
                )}
                <Button onClick={resetGame} size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
              </>
            ) : isPaused ? (
              <>
                <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">PAUSED</h2>
                <Button onClick={() => setIsPaused(false)} size="lg">
                  <Play className="mr-2 h-4 w-4" /> Resume
                </Button>
                <p className="text-xs text-muted-foreground mt-4">Press ESC or P to pause</p>
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl font-bold text-cyan-600 dark:text-neon-cyan mb-4">TETRIS</h2>
                <Button onClick={resetGame} size="lg" className="text-lg px-6 py-5">
                  <Play className="mr-2 h-5 w-5" /> Start Game
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel: Next Pieces & Controls */}
      <div className="flex md:flex-col gap-3 md:gap-4">
        {/* Next pieces preview */}
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border-2 border-pink-500/50 dark:border-neon-pink/50">
          <div className="text-[10px] text-pink-600 dark:text-neon-pink uppercase tracking-widest mb-2 font-bold text-center">Next</div>
          <div className="flex md:flex-col gap-2">
            {nextPieces.map((type, i) => {
              const piece = SHAPES[type]
              return (
                <div key={i} className={cn(
                  "w-14 h-10 flex items-center justify-center rounded bg-gray-200/50 dark:bg-black/50 p-1",
                  i === 0 && "ring-2 ring-pink-500/50"
                )}>
                  <div className="grid gap-[1px]" style={{
                    gridTemplateColumns: `repeat(${piece.shape[0].length}, 10px)`
                  }}>
                    {piece.shape.flat().map((cell, j) => (
                      <div
                        key={j}
                        className={cn(
                          "w-2.5 h-2.5 rounded-[1px]",
                          cell ? COLORS[piece.color] : "bg-transparent"
                        )}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Controls (Mobile/Visual) */}
        <div className="flex md:flex-col gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-400 active:bg-cyan-500/20"
              onClick={() => move(-1)}
              disabled={!isPlaying || isPaused}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-400 active:bg-cyan-500/20"
              onClick={() => rotatePiece()}
              disabled={!isPlaying || isPaused}
            >
              ↻
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-400 active:bg-cyan-500/20"
              onClick={() => move(1)}
              disabled={!isPlaying || isPaused}
            >
              →
            </Button>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-400 active:bg-cyan-500/20"
              onClick={softDrop}
              disabled={!isPlaying || isPaused}
            >
              ↓
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-400 active:bg-orange-500/20"
              onClick={hardDrop}
              disabled={!isPlaying || isPaused}
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-400 active:bg-purple-500/20"
              onClick={holdPiece}
              disabled={!isPlaying || isPaused || !canHold}
            >
              H
            </Button>
          </div>

          {isPlaying && !gameOver && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => setIsPaused(p => !p)}
            >
              {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
        </div>

        {/* Controls legend */}
        <div className="hidden md:block text-[10px] text-center text-muted-foreground font-mono space-y-0.5 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
          <p>←→ Move</p>
          <p>↑/X Rotate CW</p>
          <p>Z Rotate CCW</p>
          <p>↓ Soft Drop</p>
          <p>Space Hard Drop</p>
          <p>C/Shift Hold</p>
          <p>P/Esc Pause</p>
        </div>
      </div>
    </div>
  )
}
