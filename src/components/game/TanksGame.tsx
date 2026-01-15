import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { Link } from "react-router-dom"

// --- Types ---
interface Tank {
  x: number
  y: number
  angle: number // Barrel angle in degrees
  power: number // 0-100
  health: number
  maxHealth: number
  color: string
  name: string
  isAI?: boolean
}

interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  active: boolean
}

interface Explosion {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

// --- Constants ---
const GRAVITY = 0.15
const MAX_POWER = 100
const TANK_WIDTH = 40
const TANK_HEIGHT = 20
const BARREL_LENGTH = 25
const EXPLOSION_RADIUS = 30
const TERRAIN_DAMAGE_RADIUS = 25

export function TanksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [currentTurn, setCurrentTurn] = useState(0) // 0 = player 1, 1 = player 2/AI
  const [wind, setWind] = useState(0)
  const [isFiring, setIsFiring] = useState(false)
  const [gameMode, setGameMode] = useState<"ai" | "2player">("ai")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [roundsWon, setRoundsWon] = useState({ player1: 0, player2: 0 })

  // Game state refs
  const gameState = useRef({
    terrain: [] as number[],
    tanks: [
      { x: 100, y: 0, angle: 45, power: 50, health: 100, maxHealth: 100, color: "#3b82f6", name: "Player 1" },
      { x: 700, y: 0, angle: 135, power: 50, health: 100, maxHealth: 100, color: "#ef4444", name: "AI", isAI: true }
    ] as Tank[],
    projectile: null as Projectile | null,
    explosions: [] as Explosion[],
    isAnimating: false
  })

  // Generate random terrain
  const generateTerrain = useCallback((width: number, height: number) => {
    const terrain: number[] = []
    const segments = 10
    const segmentWidth = width / segments

    // Generate control points
    const controlPoints: number[] = []
    for (let i = 0; i <= segments; i++) {
      const minHeight = height * 0.3
      const maxHeight = height * 0.7
      controlPoints.push(minHeight + Math.random() * (maxHeight - minHeight))
    }

    // Interpolate terrain
    for (let x = 0; x < width; x++) {
      const segment = Math.floor(x / segmentWidth)
      const t = (x % segmentWidth) / segmentWidth

      // Smooth interpolation
      const p0 = controlPoints[Math.max(0, segment - 1)]
      const p1 = controlPoints[segment]
      const p2 = controlPoints[Math.min(segments, segment + 1)]
      const p3 = controlPoints[Math.min(segments, segment + 2)]

      // Catmull-Rom interpolation
      const t2 = t * t
      const t3 = t2 * t
      const y = 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      )

      terrain.push(Math.max(50, Math.min(height - 50, y)))
    }

    return terrain
  }, [])

  // Place tanks on terrain
  const placeTanks = useCallback((terrain: number[], width: number) => {
    const tank1X = Math.floor(width * 0.15)
    const tank2X = Math.floor(width * 0.85)

    gameState.current.tanks[0].x = tank1X
    gameState.current.tanks[0].y = terrain[tank1X]
    gameState.current.tanks[0].health = 100
    gameState.current.tanks[0].angle = 45

    gameState.current.tanks[1].x = tank2X
    gameState.current.tanks[1].y = terrain[tank2X]
    gameState.current.tanks[1].health = 100
    gameState.current.tanks[1].angle = 135
    gameState.current.tanks[1].name = gameMode === "ai" ? "AI" : "Player 2"
    gameState.current.tanks[1].isAI = gameMode === "ai"
  }, [gameMode])

  // Start new game/round
  const startGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const terrain = generateTerrain(canvas.width, canvas.height)
    gameState.current.terrain = terrain
    placeTanks(terrain, canvas.width)
    gameState.current.projectile = null
    gameState.current.explosions = []
    gameState.current.isAnimating = false

    setWind((Math.random() - 0.5) * 4)
    setCurrentTurn(0)
    setIsFiring(false)
    setGameOver(false)
    setWinner(null)
    setIsPlaying(true)
  }, [generateTerrain, placeTanks])

  // Fire projectile
  const fire = useCallback(() => {
    if (isFiring || gameOver || !isPlaying) return

    const tank = gameState.current.tanks[currentTurn]
    const angleRad = (tank.angle * Math.PI) / 180
    const powerFactor = tank.power / 100

    gameState.current.projectile = {
      x: tank.x + Math.cos(angleRad) * BARREL_LENGTH,
      y: tank.y - TANK_HEIGHT - Math.sin(angleRad) * BARREL_LENGTH,
      vx: Math.cos(angleRad) * powerFactor * 12,
      vy: -Math.sin(angleRad) * powerFactor * 12,
      active: true
    }

    setIsFiring(true)
    gameState.current.isAnimating = true
  }, [currentTurn, isFiring, gameOver, isPlaying])

  // AI turn logic
  const aiTurn = useCallback(() => {
    const ai = gameState.current.tanks[1]
    const player = gameState.current.tanks[0]

    // Calculate ideal angle and power
    const dx = player.x - ai.x
    const dy = ai.y - player.y // Terrain Y is inverted

    // Base angle toward player - for right-side tank
    let idealAngle = Math.atan2(dy, -dx) * (180 / Math.PI) + 90

    // Add randomness based on difficulty
    const randomness = difficulty === "easy" ? 25 : difficulty === "medium" ? 12 : 4
    idealAngle += (Math.random() - 0.5) * randomness

    // Calculate power based on distance with better formula
    const distance = Math.sqrt(dx * dx + dy * dy)
    let idealPower = Math.min(100, Math.max(25,
      distance / 6.5 - wind * 3 + (Math.random() - 0.5) * (randomness / 2)
    ))

    ai.angle = Math.max(91, Math.min(179, idealAngle))
    ai.power = Math.max(20, Math.min(100, idealPower))

    // Fire quickly - no long delay
    setTimeout(fire, 300)
  }, [difficulty, wind, fire])

  // Adjust angle
  const adjustAngle = useCallback((delta: number) => {
    if (isFiring || gameOver) return
    const tank = gameState.current.tanks[currentTurn]

    if (currentTurn === 0) {
      tank.angle = Math.max(1, Math.min(89, tank.angle + delta))
    } else {
      tank.angle = Math.max(91, Math.min(179, tank.angle + delta))
    }
  }, [currentTurn, isFiring, gameOver])

  // Adjust power
  const adjustPower = useCallback((delta: number) => {
    if (isFiring || gameOver) return
    const tank = gameState.current.tanks[currentTurn]
    tank.power = Math.max(10, Math.min(MAX_POWER, tank.power + delta))
  }, [currentTurn, isFiring, gameOver])

  // Damage terrain
  const damageTerrain = useCallback((x: number, _y: number, radius: number) => {
    const terrain = gameState.current.terrain
    for (let i = Math.max(0, Math.floor(x - radius)); i < Math.min(terrain.length, Math.ceil(x + radius)); i++) {
      const dist = Math.abs(i - x)
      if (dist < radius) {
        const damage = Math.sqrt(radius * radius - dist * dist)
        terrain[i] = Math.max(terrain[i], terrain[i] + damage * 0.5)
      }
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const loop = () => {
      // Clear
      ctx.fillStyle = "#1a1a2e"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6)
      skyGradient.addColorStop(0, "#0f0c29")
      skyGradient.addColorStop(0.5, "#302b63")
      skyGradient.addColorStop(1, "#24243e")
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6)

      // Draw terrain
      const terrain = gameState.current.terrain
      ctx.fillStyle = "#2d5a27"
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      for (let x = 0; x < terrain.length; x++) {
        ctx.lineTo(x, canvas.height - terrain[x])
      }
      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()
      ctx.fill()

      // Terrain texture
      ctx.strokeStyle = "#1a3d1a"
      ctx.lineWidth = 1
      for (let x = 0; x < terrain.length; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, canvas.height - terrain[x])
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      // Draw tanks
      gameState.current.tanks.forEach((tank, i) => {
        const tankY = canvas.height - tank.y

        // Tank body
        ctx.fillStyle = tank.color
        ctx.fillRect(tank.x - TANK_WIDTH / 2, tankY - TANK_HEIGHT, TANK_WIDTH, TANK_HEIGHT)

        // Tank turret
        ctx.fillStyle = tank.color
        ctx.beginPath()
        ctx.arc(tank.x, tankY - TANK_HEIGHT, 12, 0, Math.PI * 2)
        ctx.fill()

        // Tank barrel
        const barrelAngle = (tank.angle * Math.PI) / 180
        ctx.strokeStyle = tank.color
        ctx.lineWidth = 6
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(tank.x, tankY - TANK_HEIGHT)
        ctx.lineTo(
          tank.x + Math.cos(barrelAngle) * BARREL_LENGTH,
          tankY - TANK_HEIGHT - Math.sin(barrelAngle) * BARREL_LENGTH
        )
        ctx.stroke()

        // Health bar
        const healthBarWidth = 50
        const healthPercent = tank.health / tank.maxHealth
        ctx.fillStyle = "#333"
        ctx.fillRect(tank.x - healthBarWidth / 2, tankY - TANK_HEIGHT - 25, healthBarWidth, 8)
        ctx.fillStyle = healthPercent > 0.5 ? "#22c55e" : healthPercent > 0.25 ? "#f59e0b" : "#ef4444"
        ctx.fillRect(tank.x - healthBarWidth / 2, tankY - TANK_HEIGHT - 25, healthBarWidth * healthPercent, 8)

        // Name label
        ctx.fillStyle = "#fff"
        ctx.font = "12px monospace"
        ctx.textAlign = "center"
        ctx.fillText(tank.name, tank.x, tankY - TANK_HEIGHT - 35)

        // Current turn indicator
        if (i === currentTurn && !isFiring) {
          ctx.fillStyle = "#ffd700"
          ctx.beginPath()
          ctx.moveTo(tank.x, tankY - TANK_HEIGHT - 50)
          ctx.lineTo(tank.x - 8, tankY - TANK_HEIGHT - 60)
          ctx.lineTo(tank.x + 8, tankY - TANK_HEIGHT - 60)
          ctx.closePath()
          ctx.fill()
        }
      })

      // Update and draw projectile
      const proj = gameState.current.projectile
      if (proj && proj.active) {
        // Update physics
        proj.vx += wind * 0.01
        proj.vy += GRAVITY
        proj.x += proj.vx
        proj.y += proj.vy

        // Draw projectile trail
        ctx.fillStyle = "#ffd700"
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2)
        ctx.fill()

        // Draw glow
        ctx.shadowBlur = 15
        ctx.shadowColor = "#ffd700"
        ctx.fill()
        ctx.shadowBlur = 0

        // Check terrain collision
        const terrainY = canvas.height - (terrain[Math.floor(proj.x)] || 0)
        if (proj.y >= terrainY || proj.x < 0 || proj.x > canvas.width) {
          // Create explosion
          gameState.current.explosions.push({
            x: proj.x,
            y: proj.y,
            radius: 0,
            maxRadius: EXPLOSION_RADIUS,
            alpha: 1
          })

          // Damage terrain
          damageTerrain(proj.x, proj.y, TERRAIN_DAMAGE_RADIUS)

          // Check tank damage
          gameState.current.tanks.forEach((tank, i) => {
            const tankScreenY = canvas.height - tank.y - TANK_HEIGHT / 2
            const dist = Math.sqrt((proj.x - tank.x) ** 2 + (proj.y - tankScreenY) ** 2)
            if (dist < EXPLOSION_RADIUS + TANK_WIDTH / 2) {
              const damage = Math.max(10, 50 - dist)
              tank.health -= damage

              if (tank.health <= 0) {
                tank.health = 0
                setGameOver(true)
                setWinner(i === 0 ? gameState.current.tanks[1].name : gameState.current.tanks[0].name)
                setRoundsWon(prev => ({
                  ...prev,
                  [i === 0 ? "player2" : "player1"]: prev[i === 0 ? "player2" : "player1"] + 1
                }))
              }
            }
          })

          proj.active = false
          gameState.current.isAnimating = false

          // Next turn
          if (!gameOver) {
            setTimeout(() => {
              setIsFiring(false)
              setCurrentTurn(prev => (prev + 1) % 2)

              // AI turn
              if (gameMode === "ai" && currentTurn === 0) {
                setTimeout(aiTurn, 500)
              }
            }, 500)
          }
        }
      }

      // Draw explosions
      gameState.current.explosions = gameState.current.explosions.filter(exp => {
        exp.radius += 3
        exp.alpha -= 0.05

        if (exp.alpha <= 0) return false

        ctx.globalAlpha = exp.alpha
        ctx.fillStyle = "#ff6b35"
        ctx.beginPath()
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#ffd700"
        ctx.beginPath()
        ctx.arc(exp.x, exp.y, exp.radius * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1

        return true
      })

      // Draw wind indicator
      ctx.fillStyle = "#fff"
      ctx.font = "14px monospace"
      ctx.textAlign = "center"
      ctx.fillText(`Wind: ${wind > 0 ? "→" : "←"} ${Math.abs(wind).toFixed(1)}`, canvas.width / 2, 30)

      animationId = requestAnimationFrame(loop)
    }

    animationId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animationId)
  }, [isPlaying, currentTurn, isFiring, gameOver, wind, gameMode, aiTurn, damageTerrain])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying || isFiring || gameOver) return

      const isAITurn = gameMode === "ai" && currentTurn === 1
      if (isAITurn) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          adjustAngle(currentTurn === 0 ? 2 : -2)
          break
        case "ArrowDown":
          e.preventDefault()
          adjustAngle(currentTurn === 0 ? -2 : 2)
          break
        case "ArrowLeft":
          e.preventDefault()
          adjustPower(-5)
          break
        case "ArrowRight":
          e.preventDefault()
          adjustPower(5)
          break
        case " ":
        case "Enter":
          e.preventDefault()
          fire()
          break
      }
    }

    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isPlaying, isFiring, gameOver, currentTurn, gameMode, adjustAngle, adjustPower, fire])

  const currentTank = gameState.current.tanks[currentTurn]
  const isAITurn = gameMode === "ai" && currentTurn === 1

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <Link to="/games">
          <Button variant="outline" size="sm" className="bg-black/50 border-white/20">
            ← Back
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-white font-mono">
            <span className="text-blue-400">{gameState.current.tanks[0].name}</span>
            <span className="mx-2">{roundsWon.player1} - {roundsWon.player2}</span>
            <span className="text-red-400">{gameState.current.tanks[1].name}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!isPlaying && (
            <>
              <Button
                variant={gameMode === "ai" ? "default" : "outline"}
                size="sm"
                onClick={() => setGameMode("ai")}
              >
                vs AI
              </Button>
              <Button
                variant={gameMode === "2player" ? "default" : "outline"}
                size="sm"
                onClick={() => setGameMode("2player")}
              >
                2 Player
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border-2 border-white/20 rounded-lg bg-gray-800"
        />

        {/* Controls Overlay */}
        {isPlaying && !gameOver && !isAITurn && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur p-4 rounded-lg border border-white/20">
            <div className="flex items-center gap-6">
              {/* Angle control */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">Angle</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustAngle(currentTurn === 0 ? -2 : 2)}
                    disabled={isFiring}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <span className="text-white font-mono w-12 text-center">{Math.round(currentTank?.angle || 45)}°</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustAngle(currentTurn === 0 ? 2 : -2)}
                    disabled={isFiring}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Power control */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">Power</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustPower(-5)}
                    disabled={isFiring}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                      style={{ width: `${currentTank?.power || 50}%` }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => adjustPower(5)}
                    disabled={isFiring}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-white font-mono text-xs">{Math.round(currentTank?.power || 50)}%</span>
              </div>

              {/* Fire button */}
              <Button
                onClick={fire}
                disabled={isFiring}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                <Zap className="h-4 w-4" />
                FIRE!
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Arrow Keys: ↑↓ Angle, ←→ Power | Space/Enter: Fire
            </p>
          </div>
        )}

        {/* AI thinking indicator */}
        {isPlaying && !gameOver && isAITurn && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-3 rounded-lg border border-red-500/50">
            <span className="text-red-400 font-mono animate-pulse">AI is thinking...</span>
          </div>
        )}

        {/* Game Over Overlay */}
        {(gameOver || !isPlaying) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className="bg-gray-900 p-8 rounded-xl border border-white/20 text-center">
              {gameOver ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {winner} Wins!
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <span className="text-gray-400">
                      Score: {roundsWon.player1} - {roundsWon.player2}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={startGame} className="gap-2">
                      <RotateCcw className="h-4 w-4" /> Play Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRoundsWon({ player1: 0, player2: 0 })
                        startGame()
                      }}
                    >
                      New Match
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-white mb-4">TANKS</h1>
                  <p className="text-gray-400 mb-6">
                    Adjust angle and power, then fire to destroy your opponent!
                  </p>

                  {gameMode === "ai" && (
                    <div className="mb-6">
                      <span className="text-sm text-gray-500 block mb-2">Difficulty</span>
                      <div className="flex gap-2 justify-center">
                        {(["easy", "medium", "hard"] as const).map(d => (
                          <Button
                            key={d}
                            variant={difficulty === d ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDifficulty(d)}
                            className="capitalize"
                          >
                            {d}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={startGame} size="lg" className="gap-2">
                    <Play className="h-5 w-5" /> Start Game
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
