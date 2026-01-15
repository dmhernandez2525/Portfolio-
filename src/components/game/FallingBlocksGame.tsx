import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowLeft, Play, RotateCcw, Trophy, Pause, Zap } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// --- Types ---
interface Block {
  id: number
  x: number
  y: number
  width: number
  height: number
  color: string
  speed: number
  type: "normal" | "bonus" | "bomb" | "slowmo"
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
}

interface FloatingText {
  id: number
  x: number
  y: number
  text: string
  color: string
  life: number
}

// --- Constants ---
const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]
const BONUS_COLOR = "#ffd700"
const BOMB_COLOR = "#ff6b6b"
const SLOWMO_COLOR = "#00d9ff"

const INITIAL_SPAWN_RATE = 1200
const MIN_SPAWN_RATE = 300
const INITIAL_SPEED = 1.5
const MAX_SPEED = 5
const COMBO_TIMEOUT = 1000 // ms to maintain combo
const SLOWMO_DURATION = 5000 // ms

export function FallingBlocksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem("falling-blocks-highscore") || "0", 10)
    }
    return 0
  })
  const [gameOver, setGameOver] = useState(false)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [slowMoActive, setSlowMoActive] = useState(false)
  const [showComboText, setShowComboText] = useState(false)

  // Game state refs (for animation loop)
  const gameState = useRef({
    blocks: [] as Block[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    lastSpawn: 0,
    spawnRate: INITIAL_SPAWN_RATE,
    speedMultiplier: 1,
    score: 0,
    lives: 3,
    combo: 0,
    lastHitTime: 0,
    isPlaying: false,
    isPaused: false,
    slowMoEndTime: 0,
    blocksDestroyed: 0
  })

  // End game
  const endGame = useCallback(() => {
    gameState.current.isPlaying = false
    setIsPlaying(false)
    setGameOver(true)

    if (gameState.current.score > highScore) {
      setHighScore(gameState.current.score)
      localStorage.setItem("falling-blocks-highscore", gameState.current.score.toString())
    }
  }, [highScore])

  // Create particles at position
  const createParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      particles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 4 + Math.random() * 4,
        life: 1
      })
    }
    gameState.current.particles.push(...particles)
  }, [])

  // Create floating text
  const createFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    gameState.current.floatingTexts.push({
      id: Date.now(),
      x,
      y,
      text,
      color,
      life: 1
    })
  }, [])

  // Start game
  const handleStartGame = useCallback(() => {
    gameState.current = {
      blocks: [],
      particles: [],
      floatingTexts: [],
      lastSpawn: 0,
      spawnRate: INITIAL_SPAWN_RATE,
      speedMultiplier: 1,
      score: 0,
      lives: 3,
      combo: 0,
      lastHitTime: 0,
      isPlaying: true,
      isPaused: false,
      slowMoEndTime: 0,
      blocksDestroyed: 0
    }

    setScore(0)
    setLives(3)
    setCombo(0)
    setMaxCombo(0)
    setGameOver(false)
    setIsPaused(false)
    setIsPlaying(true)
    setSlowMoActive(false)
  }, [])

  // Toggle pause
  const togglePause = useCallback(() => {
    if (!isPlaying || gameOver) return
    gameState.current.isPaused = !gameState.current.isPaused
    setIsPaused(p => !p)
  }, [isPlaying, gameOver])

  // Game loop
  useEffect(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    // Resize handler
    const handleResize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    // Game Loop
    const loop = (timestamp: number) => {
      if (!gameState.current.isPlaying) return

      const displayWidth = canvas.offsetWidth
      const displayHeight = canvas.offsetHeight

      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight)
      gradient.addColorStop(0, "#0a0a0a")
      gradient.addColorStop(1, "#1a1a2e")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, displayWidth, displayHeight)

      // Draw subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)"
      ctx.lineWidth = 1
      const gridSize = 50
      for (let x = 0; x < displayWidth; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, displayHeight)
        ctx.stroke()
      }
      for (let y = 0; y < displayHeight; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(displayWidth, y)
        ctx.stroke()
      }

      if (gameState.current.isPaused) {
        animationId = requestAnimationFrame(loop)
        return
      }

      // Check slow-mo
      const isSlowMo = timestamp < gameState.current.slowMoEndTime
      const timeMultiplier = isSlowMo ? 0.3 : 1
      setSlowMoActive(isSlowMo)

      // Check combo timeout
      if (gameState.current.combo > 0 && timestamp - gameState.current.lastHitTime > COMBO_TIMEOUT) {
        gameState.current.combo = 0
        setCombo(0)
        setShowComboText(false)
      }

      // Spawn blocks
      if (timestamp - gameState.current.lastSpawn > gameState.current.spawnRate) {
        const size = Math.random() * 30 + 35
        const baseSpeed = Math.min(MAX_SPEED, INITIAL_SPEED + gameState.current.blocksDestroyed * 0.02)

        // Determine block type (mostly normal, occasional power-ups)
        let type: Block["type"] = "normal"
        let color = COLORS[Math.floor(Math.random() * COLORS.length)]
        const rand = Math.random()

        if (rand > 0.95 && gameState.current.blocksDestroyed > 10) {
          type = "bomb"
          color = BOMB_COLOR
        } else if (rand > 0.9 && gameState.current.blocksDestroyed > 5) {
          type = "slowmo"
          color = SLOWMO_COLOR
        } else if (rand > 0.85) {
          type = "bonus"
          color = BONUS_COLOR
        }

        const block: Block = {
          id: timestamp,
          x: Math.random() * (displayWidth - size),
          y: -size,
          width: size,
          height: size,
          color,
          speed: (baseSpeed + Math.random() * 0.5) * gameState.current.speedMultiplier,
          type
        }

        gameState.current.blocks.push(block)
        gameState.current.lastSpawn = timestamp

        // Increase difficulty
        gameState.current.speedMultiplier += 0.002
        gameState.current.spawnRate = Math.max(MIN_SPAWN_RATE, INITIAL_SPAWN_RATE - gameState.current.score * 2)
      }

      // Update and draw blocks
      for (let i = gameState.current.blocks.length - 1; i >= 0; i--) {
        const block = gameState.current.blocks[i]
        block.y += block.speed * timeMultiplier

        // Draw block with glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = block.color
        ctx.fillStyle = block.color

        // Different shapes for different types
        if (block.type === "bomb") {
          // Circle for bomb
          ctx.beginPath()
          ctx.arc(block.x + block.width / 2, block.y + block.height / 2, block.width / 2, 0, Math.PI * 2)
          ctx.fill()
          // Bomb icon
          ctx.fillStyle = "#fff"
          ctx.font = `${block.width * 0.5}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("💣", block.x + block.width / 2, block.y + block.height / 2)
        } else if (block.type === "slowmo") {
          // Diamond for slow-mo
          ctx.beginPath()
          ctx.moveTo(block.x + block.width / 2, block.y)
          ctx.lineTo(block.x + block.width, block.y + block.height / 2)
          ctx.lineTo(block.x + block.width / 2, block.y + block.height)
          ctx.lineTo(block.x, block.y + block.height / 2)
          ctx.closePath()
          ctx.fill()
          // Clock icon
          ctx.fillStyle = "#fff"
          ctx.font = `${block.width * 0.4}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("⏱️", block.x + block.width / 2, block.y + block.height / 2)
        } else if (block.type === "bonus") {
          // Star shape for bonus
          ctx.beginPath()
          const cx = block.x + block.width / 2
          const cy = block.y + block.height / 2
          const spikes = 5
          const outerRadius = block.width / 2
          const innerRadius = block.width / 4
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI * j) / spikes - Math.PI / 2
            const px = cx + Math.cos(angle) * radius
            const py = cy + Math.sin(angle) * radius
            if (j === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.fill()
        } else {
          // Rounded rectangle for normal blocks
          const radius = 8
          ctx.beginPath()
          ctx.roundRect(block.x, block.y, block.width, block.height, radius)
          ctx.fill()
        }

        ctx.shadowBlur = 0

        // Check if block passed bottom
        if (block.y > displayHeight) {
          gameState.current.blocks.splice(i, 1)

          // Only lose life for normal blocks
          if (block.type === "normal") {
            gameState.current.lives -= 1
            setLives(gameState.current.lives)

            // Reset combo on miss
            gameState.current.combo = 0
            setCombo(0)
            setShowComboText(false)

            if (gameState.current.lives <= 0) {
              endGame()
              return
            }
          }
        }
      }

      // Update and draw particles
      for (let i = gameState.current.particles.length - 1; i >= 0; i--) {
        const p = gameState.current.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.2 // Gravity
        p.life -= 0.03

        if (p.life <= 0) {
          gameState.current.particles.splice(i, 1)
          continue
        }

        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Update and draw floating texts
      for (let i = gameState.current.floatingTexts.length - 1; i >= 0; i--) {
        const t = gameState.current.floatingTexts[i]
        t.y -= 2
        t.life -= 0.02

        if (t.life <= 0) {
          gameState.current.floatingTexts.splice(i, 1)
          continue
        }

        ctx.globalAlpha = t.life
        ctx.fillStyle = t.color
        ctx.font = "bold 20px monospace"
        ctx.textAlign = "center"
        ctx.fillText(t.text, t.x, t.y)
        ctx.globalAlpha = 1
      }

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
    }
  }, [isPlaying, endGame])

  // Handle click/tap
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || isPaused || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    // Check collisions (reverse order to hit top blocks first)
    for (let i = gameState.current.blocks.length - 1; i >= 0; i--) {
      const block = gameState.current.blocks[i]

      // Hit detection based on block type/shape
      let isHit = false

      if (block.type === "bomb") {
        // Circle hit detection
        const cx = block.x + block.width / 2
        const cy = block.y + block.height / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        isHit = dist <= block.width / 2
      } else if (block.type === "slowmo") {
        // Diamond hit detection (approximate with rectangle)
        isHit = x >= block.x && x <= block.x + block.width &&
                y >= block.y && y <= block.y + block.height
      } else {
        // Rectangle hit detection
        isHit = x >= block.x && x <= block.x + block.width &&
                y >= block.y && y <= block.y + block.height
      }

      if (isHit) {
        const now = performance.now()

        // Update combo
        if (now - gameState.current.lastHitTime < COMBO_TIMEOUT) {
          gameState.current.combo += 1
        } else {
          gameState.current.combo = 1
        }
        gameState.current.lastHitTime = now
        setCombo(gameState.current.combo)
        setMaxCombo(prev => Math.max(prev, gameState.current.combo))

        if (gameState.current.combo >= 3) {
          setShowComboText(true)
        }

        // Calculate points with combo multiplier
        const comboMultiplier = 1 + Math.floor(gameState.current.combo / 3) * 0.5
        let points = 10

        // Handle special block types
        if (block.type === "bomb") {
          // Clear all blocks on screen
          const blocksCleared = gameState.current.blocks.length
          gameState.current.blocks.forEach(b => {
            createParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 6)
          })
          gameState.current.blocks = []
          points = blocksCleared * 5
          createFloatingText(x, y, `BOOM! +${points}`, BOMB_COLOR)
        } else if (block.type === "slowmo") {
          // Activate slow motion
          gameState.current.slowMoEndTime = now + SLOWMO_DURATION
          gameState.current.blocks.splice(i, 1)
          points = 15
          createParticles(x, y, SLOWMO_COLOR, 12)
          createFloatingText(x, y, "SLOW-MO!", SLOWMO_COLOR)
        } else if (block.type === "bonus") {
          // Bonus points
          points = 25
          gameState.current.blocks.splice(i, 1)
          createParticles(x, y, BONUS_COLOR, 10)
          createFloatingText(x, y, `BONUS! +${Math.round(points * comboMultiplier)}`, BONUS_COLOR)
        } else {
          // Normal block
          gameState.current.blocks.splice(i, 1)
          createParticles(x, y, block.color, 8)

          if (gameState.current.combo >= 5) {
            createFloatingText(x, y, `${gameState.current.combo}x COMBO!`, "#ff00ff")
          } else if (gameState.current.combo >= 3) {
            createFloatingText(x, y, `+${Math.round(points * comboMultiplier)}`, "#00ff00")
          }
        }

        gameState.current.blocksDestroyed += 1
        gameState.current.score += Math.round(points * comboMultiplier)
        setScore(gameState.current.score)

        break // Only hit one block per click
      }
    }
  }, [isPlaying, isPaused, gameOver, createParticles, createFloatingText])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        togglePause()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [togglePause])

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden touch-none select-none">
      {/* Header UI */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
        <Link to="/games" className="pointer-events-auto">
          <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur border-white/20 hover:bg-white/20">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <div className="flex flex-col items-end gap-2 text-white">
          <div className="flex items-center gap-3">
            {/* Combo indicator */}
            {showComboText && combo >= 3 && (
              <div className="bg-purple-500/80 px-3 py-1 rounded-lg animate-pulse">
                <span className="font-bold font-mono">{combo}x COMBO!</span>
              </div>
            )}

            {/* Score */}
            <div className="bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
              <span className="text-2xl font-bold font-mono">{score.toLocaleString()}</span>
            </div>
          </div>

          {/* High score */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1 rounded-lg border border-yellow-500/30">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-mono text-yellow-400">{highScore.toLocaleString()}</span>
          </div>

          {/* Lives */}
          <div className="flex gap-1.5 mt-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300",
                  i < lives ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-gray-700"
                )}
              />
            ))}
          </div>

          {/* Power-up indicators */}
          {slowMoActive && (
            <div className="flex items-center gap-2 bg-cyan-500/30 px-3 py-1 rounded-lg border border-cyan-400/50 animate-pulse">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-mono">SLOW-MO ACTIVE</span>
            </div>
          )}

          {/* Pause button */}
          {isPlaying && !gameOver && (
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className="pointer-events-auto mt-1 bg-black/50 border-white/20"
            >
              {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
        style={{ touchAction: "none" }}
        onMouseDown={handleClick}
        onTouchStart={handleClick}
      />

      {/* Overlay */}
      {(!isPlaying || gameOver || isPaused) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-20">
          <Card className="w-full max-w-md p-6 bg-gray-900/95 border-white/10">
            <div className="text-center space-y-6">
              {isPaused && !gameOver ? (
                <>
                  <h1 className="text-3xl font-bold text-yellow-400">PAUSED</h1>
                  <Button
                    size="lg"
                    className="w-full text-lg gap-2"
                    onClick={togglePause}
                  >
                    <Play className="h-5 w-5" /> Resume
                  </Button>
                  <p className="text-xs text-gray-400">Press ESC or P to pause</p>
                </>
              ) : gameOver ? (
                <>
                  <h1 className="text-4xl font-bold text-red-500">GAME OVER</h1>
                  <div className="space-y-2">
                    <p className="text-2xl text-white font-mono">Score: {score.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Max Combo: {maxCombo}x</p>
                    {score >= highScore && score > 0 && (
                      <p className="text-yellow-400 font-bold animate-pulse">NEW HIGH SCORE!</p>
                    )}
                  </div>
                  <Button
                    size="lg"
                    className="w-full text-lg gap-2"
                    onClick={handleStartGame}
                  >
                    <RotateCcw className="h-5 w-5" /> Try Again
                  </Button>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                    Falling Blocks
                  </h1>
                  <p className="text-gray-400">
                    Tap or click blocks before they hit the bottom!
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-xs text-gray-500">
                    <div className="bg-white/5 p-2 rounded">
                      <div className="w-6 h-6 bg-yellow-500 rounded-sm mx-auto mb-1 flex items-center justify-center">⭐</div>
                      <p>Bonus</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                      <div className="w-6 h-6 bg-red-400 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px]">💣</div>
                      <p>Clear All</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded">
                      <div className="w-6 h-6 bg-cyan-400 mx-auto mb-1 rotate-45 flex items-center justify-center"><Zap className="w-3 h-3 -rotate-45" /></div>
                      <p>Slow-Mo</p>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-lg gap-2"
                    onClick={handleStartGame}
                  >
                    <Play className="h-5 w-5" /> Start Game
                  </Button>

                  {highScore > 0 && (
                    <p className="text-xs text-gray-500">
                      High Score: {highScore.toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
