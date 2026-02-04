import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw, Trophy, ArrowLeft, Users, Bot, Split, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import type {
  Cell, Food, Virus, EjectedMass, AIBehavior
} from "./types"

type GameMode = "menu" | "single" | "local_2p"
import {
  WORLD_SIZE, INITIAL_RADIUS, MAX_SPEED, FOOD_COUNT, AI_COUNT,
  FOOD_RADIUS, SPLIT_VELOCITY, MERGE_DELAY, MAX_CELLS, MIN_SPLIT_RADIUS,
  VIRUS_COUNT, VIRUS_RADIUS, EJECT_MASS_COST, EJECT_MASS_VALUE,
  EJECT_VELOCITY, EJECT_RADIUS, COLORS, AI_NAMES
} from "./constants"

// --- Utility Functions ---
function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

function getMass(radius: number): number {
  return Math.PI * radius * radius
}

function getRadiusFromMass(mass: number): number {
  return Math.sqrt(mass / Math.PI)
}

function canEat(eater: Cell, prey: Cell | Food): boolean {
  const distance = getDistance(eater.x, eater.y, prey.x, prey.y)
  return eater.radius > prey.radius * 1.1 && distance < eater.radius - prey.radius * 0.5
}

// --- Component ---
export function AgarGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Game mode
  const [gameMode, setGameMode] = useState<GameMode>("menu")

  // Game state refs for animation loop
  const playerCellsRef = useRef<Cell[]>([])
  const player2CellsRef = useRef<Cell[]>([]) // For local 2P
  const aiCellsRef = useRef<Cell[]>([])
  const foodRef = useRef<Food[]>([])
  const virusesRef = useRef<Virus[]>([])
  const ejectedMassRef = useRef<EjectedMass[]>([])
  const aiBehaviorsRef = useRef<Map<string, AIBehavior>>(new Map())
  const mouseRef = useRef({ x: 0, y: 0 })
  const player2InputRef = useRef({ up: false, down: false, left: false, right: false }) // WASD for P2
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 })
  const gameLoopRef = useRef<number | null>(null)
  const lastSplitRef = useRef<Map<string, number>>(new Map())

  // React state for UI
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player1" | "player2" | null>(null)
  const [score, setScore] = useState(0)
  const [score2, setScore2] = useState(0) // Player 2 score
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem("agar-highscore") || "0", 10)
  )
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number; isPlayer?: boolean; isPlayer2?: boolean }[]>([])

  // Initialize food
  const initializeFood = useCallback(() => {
    const food: Food[] = []
    for (let i = 0; i < FOOD_COUNT; i++) {
      food.push({
        id: generateId(),
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: FOOD_RADIUS,
        color: getRandomColor()
      })
    }
    foodRef.current = food
  }, [])

  // Initialize AI cells
  const initializeAI = useCallback(() => {
    const aiCells: Cell[] = []
    aiBehaviorsRef.current.clear()

    for (let i = 0; i < AI_COUNT; i++) {
      const id = generateId()
      const startRadius = INITIAL_RADIUS * (0.5 + Math.random() * 1.5)
      aiCells.push({
        id,
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: startRadius,
        color: getRandomColor(),
        vx: 0,
        vy: 0,
        name: AI_NAMES[i % AI_NAMES.length]
      })

      aiBehaviorsRef.current.set(id, {
        targetX: Math.random() * WORLD_SIZE,
        targetY: Math.random() * WORLD_SIZE,
        lastDecision: 0
      })
    }
    aiCellsRef.current = aiCells
  }, [])

  // Initialize viruses
  const initializeViruses = useCallback(() => {
    const viruses: Virus[] = []
    for (let i = 0; i < VIRUS_COUNT; i++) {
      viruses.push({
        id: generateId(),
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: VIRUS_RADIUS
      })
    }
    virusesRef.current = viruses
  }, [])

  // Start game
  const startGame = useCallback((mode: GameMode) => {
    setGameMode(mode)

    // Initialize player 1
    playerCellsRef.current = [{
      id: "player-main",
      x: mode === "local_2p" ? WORLD_SIZE / 3 : WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      radius: INITIAL_RADIUS,
      color: "#00D4FF",
      vx: 0,
      vy: 0,
      isPlayer: true,
      name: "Player 1"
    }]

    // Initialize player 2 for local 2P
    if (mode === "local_2p") {
      player2CellsRef.current = [{
        id: "player2-main",
        x: (WORLD_SIZE / 3) * 2,
        y: WORLD_SIZE / 2,
        radius: INITIAL_RADIUS,
        color: "#FF6B6B",
        vx: 0,
        vy: 0,
        isPlayer: true,
        name: "Player 2"
      }]
    } else {
      player2CellsRef.current = []
    }

    lastSplitRef.current.clear()
    initializeFood()
    initializeAI()
    initializeViruses()
    ejectedMassRef.current = []

    setIsPlaying(true)
    setGameOver(false)
    setWinner(null)
    setScore(0)
    setScore2(0)
  }, [initializeFood, initializeAI, initializeViruses])

  // End game
  const endGame = useCallback((killedPlayer?: "player1" | "player2") => {
    setIsPlaying(false)
    setGameOver(true)

    if (gameMode === "local_2p" && killedPlayer) {
      setWinner(killedPlayer === "player1" ? "player2" : "player1")
    } else {
      setWinner(null)
    }

    const finalScore = gameMode === "single"
      ? score
      : Math.floor(
          playerCellsRef.current.reduce((sum, cell) => sum + getMass(cell.radius), 0)
        )

    if (finalScore > highScore && gameMode === "single") {
      setHighScore(finalScore)
      localStorage.setItem("agar-highscore", finalScore.toString())
    }
  }, [highScore, gameMode, score])

  // Split player cell
  const splitPlayer = useCallback((playerNum: 1 | 2 = 1) => {
    if (!isPlaying) return

    const now = Date.now()
    const newCells: Cell[] = []
    const cellsRef = playerNum === 1 ? playerCellsRef : player2CellsRef
    const playerName = playerNum === 1 ? "Player 1" : "Player 2"

    cellsRef.current.forEach(cell => {
      // Need minimum mass to split
      if (cell.radius < MIN_SPLIT_RADIUS) return
      if (cellsRef.current.length >= MAX_CELLS) return // Max cells limit

      const newRadius = getRadiusFromMass(getMass(cell.radius) / 2)

      // Calculate direction
      let dirX = 1, dirY = 0

      if (playerNum === 1) {
        // Player 1: toward mouse
        const canvas = canvasRef.current
        if (canvas) {
          const camera = cameraRef.current
          const worldMouseX = (mouseRef.current.x - canvas.width / 2) / camera.scale + camera.x
          const worldMouseY = (mouseRef.current.y - canvas.height / 2) / camera.scale + camera.y
          const dx = worldMouseX - cell.x
          const dy = worldMouseY - cell.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          dirX = dist > 0 ? dx / dist : 1
          dirY = dist > 0 ? dy / dist : 0
        }
      } else {
        // Player 2: toward movement direction (WASD)
        const input = player2InputRef.current
        dirX = (input.right ? 1 : 0) - (input.left ? 1 : 0)
        dirY = (input.down ? 1 : 0) - (input.up ? 1 : 0)
        const dist = Math.sqrt(dirX * dirX + dirY * dirY)
        if (dist > 0) { dirX /= dist; dirY /= dist }
        else { dirX = 1; dirY = 0 }
      }

      // Update original cell
      cell.radius = newRadius

      // Create new cell
      const newId = generateId()
      newCells.push({
        id: newId,
        x: cell.x + dirX * newRadius,
        y: cell.y + dirY * newRadius,
        radius: newRadius,
        color: cell.color,
        vx: dirX * SPLIT_VELOCITY,
        vy: dirY * SPLIT_VELOCITY,
        isPlayer: true,
        name: playerName
      })

      // Track split time for merging
      lastSplitRef.current.set(cell.id, now)
      lastSplitRef.current.set(newId, now)
    })

    cellsRef.current = [...cellsRef.current, ...newCells]
  }, [isPlaying])

  // Eject mass
  const ejectMass = useCallback((playerNum: 1 | 2 = 1) => {
    if (!isPlaying) return

    const cellsRef = playerNum === 1 ? playerCellsRef : player2CellsRef

    cellsRef.current.forEach(cell => {
      // Must be large enough to eject
      if (cell.radius < 35) return

      const newRadius = getRadiusFromMass(getMass(cell.radius) - EJECT_MASS_COST)

      // Calculate direction
      let dirX = 1, dirY = 0

      if (playerNum === 1) {
        const canvas = canvasRef.current
        if (canvas) {
          const camera = cameraRef.current
          const worldMouseX = (mouseRef.current.x - canvas.width / 2) / camera.scale + camera.x
          const worldMouseY = (mouseRef.current.y - canvas.height / 2) / camera.scale + camera.y
          const dx = worldMouseX - cell.x
          const dy = worldMouseY - cell.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          dirX = dist > 0 ? dx / dist : 1
          dirY = dist > 0 ? dy / dist : 0
        }
      } else {
        // Player 2: toward movement direction (WASD)
        const input = player2InputRef.current
        dirX = (input.right ? 1 : 0) - (input.left ? 1 : 0)
        dirY = (input.down ? 1 : 0) - (input.up ? 1 : 0)
        const dist = Math.sqrt(dirX * dirX + dirY * dirY)
        if (dist > 0) { dirX /= dist; dirY /= dist }
        else { dirX = 1; dirY = 0 }
      }

      // Update cell size
      cell.radius = newRadius

      // Create blob
      ejectedMassRef.current.push({
        id: generateId(),
        x: cell.x + dirX * (cell.radius + EJECT_RADIUS + 5),
        y: cell.y + dirY * (cell.radius + EJECT_RADIUS + 5),
        radius: EJECT_RADIUS,
        color: cell.color,
        vx: dirX * EJECT_VELOCITY,
        vy: dirY * EJECT_VELOCITY,
        creatorId: cell.id
      })
    })
  }, [isPlaying])

  // Update AI behavior
  const updateAIBehavior = useCallback((ai: Cell, now: number) => {
    const behavior = aiBehaviorsRef.current.get(ai.id)
    if (!behavior) return

    // Make decisions every 500-2000ms based on size
    const decisionInterval = 500 + (ai.radius / 100) * 1500
    if (now - behavior.lastDecision < decisionInterval) return

    behavior.lastDecision = now

    // Find all cells this AI can interact with (include player 2 in 2P mode)
    const allCells = [...playerCellsRef.current, ...player2CellsRef.current, ...aiCellsRef.current.filter(c => c.id !== ai.id)]

    // Find threats (bigger cells nearby)
    const threats = allCells.filter(c =>
      c.radius > ai.radius * 1.1 &&
      getDistance(ai.x, ai.y, c.x, c.y) < c.radius * 5
    )

    // Find prey (smaller cells nearby)
    const prey = allCells.filter(c =>
      ai.radius > c.radius * 1.1 &&
      getDistance(ai.x, ai.y, c.x, c.y) < ai.radius * 8
    )

    // Find nearby food
    const nearbyFood = foodRef.current.filter(f =>
      getDistance(ai.x, ai.y, f.x, f.y) < ai.radius * 10
    )

    if (threats.length > 0) {
      // Flee from nearest threat
      const nearest = threats.reduce((a, b) =>
        getDistance(ai.x, ai.y, a.x, a.y) < getDistance(ai.x, ai.y, b.x, b.y) ? a : b
      )
      // Move opposite direction
      const dx = ai.x - nearest.x
      const dy = ai.y - nearest.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      behavior.targetX = ai.x + (dx / dist) * 500
      behavior.targetY = ai.y + (dy / dist) * 500
    } else if (prey.length > 0 && Math.random() > 0.3) {
      // Chase prey
      const target = prey.reduce((a, b) =>
        getDistance(ai.x, ai.y, a.x, a.y) < getDistance(ai.x, ai.y, b.x, b.y) ? a : b
      )
      behavior.targetX = target.x
      behavior.targetY = target.y
    } else if (nearbyFood.length > 0) {
      // Go to nearest food
      const target = nearbyFood.reduce((a, b) =>
        getDistance(ai.x, ai.y, a.x, a.y) < getDistance(ai.x, ai.y, b.x, b.y) ? a : b
      )
      behavior.targetX = target.x
      behavior.targetY = target.y
    } else {
      // Random wandering
      behavior.targetX = Math.random() * WORLD_SIZE
      behavior.targetY = Math.random() * WORLD_SIZE
    }

    // Clamp to world bounds
    behavior.targetX = Math.max(50, Math.min(WORLD_SIZE - 50, behavior.targetX))
    behavior.targetY = Math.max(50, Math.min(WORLD_SIZE - 50, behavior.targetY))
  }, [])

  // Game loop
  const gameLoop = useCallback(function loop() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !isPlaying) return

    const now = Date.now()

    // --- UPDATE ---

    // Update ejected mass physics
    ejectedMassRef.current.forEach(mass => {
      mass.x += mass.vx
      mass.y += mass.vy
      mass.vx *= 0.9
      mass.vy *= 0.9
      
      // Clamp bounds
      if (mass.x < 0 || mass.x > WORLD_SIZE) mass.vx *= -1
      if (mass.y < 0 || mass.y > WORLD_SIZE) mass.vy *= -1
    })

    // Update player cells
    const playerCells = playerCellsRef.current
    const player2Cells = player2CellsRef.current
    const isLocal2P = gameMode === "local_2p"

    // Check for game over conditions
    if (playerCells.length === 0) {
      endGame(isLocal2P ? "player1" : undefined)
      return
    }
    if (isLocal2P && player2Cells.length === 0) {
      endGame("player2")
      return
    }

    // Calculate player 1 center of mass for camera
    let totalMass = 0
    let centerX = 0
    let centerY = 0

    playerCells.forEach(cell => {
      const mass = getMass(cell.radius)
      totalMass += mass
      centerX += cell.x * mass
      centerY += cell.y * mass
    })

    // In 2P mode, also include player 2 in camera calculation
    let totalMass2 = 0
    if (isLocal2P) {
      player2Cells.forEach(cell => {
        const mass = getMass(cell.radius)
        totalMass2 += mass
        centerX += cell.x * mass
        centerY += cell.y * mass
      })
    }

    const combinedMass = totalMass + totalMass2
    centerX /= combinedMass || 1
    centerY /= combinedMass || 1

    // Update scores
    setScore(Math.floor(totalMass))
    if (isLocal2P) setScore2(Math.floor(totalMass2))

    // Update camera (zoom out more in 2P mode)
    const targetScale = isLocal2P
      ? Math.max(0.2, Math.min(0.7, 80 / Math.sqrt(combinedMass / Math.PI)))
      : Math.max(0.3, Math.min(1, 100 / Math.sqrt(totalMass / Math.PI)))
    cameraRef.current.scale += (targetScale - cameraRef.current.scale) * 0.05
    cameraRef.current.x += (centerX - cameraRef.current.x) * 0.1
    cameraRef.current.y += (centerY - cameraRef.current.y) * 0.1

    // Move player 1 cells toward mouse
    const camera = cameraRef.current
    const worldMouseX = (mouseRef.current.x - canvas.width / 2) / camera.scale + camera.x
    const worldMouseY = (mouseRef.current.y - canvas.height / 2) / camera.scale + camera.y

    playerCells.forEach(cell => {
      const dx = worldMouseX - cell.x
      const dy = worldMouseY - cell.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 5) {
        const speed = MAX_SPEED * (INITIAL_RADIUS / cell.radius) * 2
        cell.vx = (dx / dist) * speed
        cell.vy = (dy / dist) * speed
      } else {
        cell.vx *= 0.9
        cell.vy *= 0.9
      }

      // Apply velocity decay for split cells
      if (Math.abs(cell.vx) > MAX_SPEED || Math.abs(cell.vy) > MAX_SPEED) {
        cell.vx *= 0.95
        cell.vy *= 0.95
      }

      cell.x += cell.vx
      cell.y += cell.vy

      // Clamp to world bounds
      cell.x = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.x))
      cell.y = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.y))
    })

    // Move player 2 cells based on WASD input (in 2P mode)
    if (isLocal2P) {
      const p2Input = player2InputRef.current
      const p2DirX = (p2Input.right ? 1 : 0) - (p2Input.left ? 1 : 0)
      const p2DirY = (p2Input.down ? 1 : 0) - (p2Input.up ? 1 : 0)

      player2Cells.forEach(cell => {
        if (p2DirX !== 0 || p2DirY !== 0) {
          const dist = Math.sqrt(p2DirX * p2DirX + p2DirY * p2DirY)
          const speed = MAX_SPEED * (INITIAL_RADIUS / cell.radius) * 2
          cell.vx = (p2DirX / dist) * speed
          cell.vy = (p2DirY / dist) * speed
        } else {
          cell.vx *= 0.9
          cell.vy *= 0.9
        }

        if (Math.abs(cell.vx) > MAX_SPEED || Math.abs(cell.vy) > MAX_SPEED) {
          cell.vx *= 0.95
          cell.vy *= 0.95
        }

        cell.x += cell.vx
        cell.y += cell.vy

        cell.x = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.x))
        cell.y = Math.max(cell.radius, Math.min(WORLD_SIZE - cell.radius, cell.y))
      })
    }

    // Merge player 1 cells
    for (let i = 0; i < playerCells.length; i++) {
      for (let j = i + 1; j < playerCells.length; j++) {
        const a = playerCells[i]
        const b = playerCells[j]

        // Check if can merge (after delay)
        const aTime = lastSplitRef.current.get(a.id) || 0
        const bTime = lastSplitRef.current.get(b.id) || 0

        if (now - aTime < MERGE_DELAY || now - bTime < MERGE_DELAY) continue

        const dist = getDistance(a.x, a.y, b.x, b.y)
        if (dist < Math.max(a.radius, b.radius)) {
          // Merge into larger cell
          const newMass = getMass(a.radius) + getMass(b.radius)
          if (a.radius >= b.radius) {
            a.radius = getRadiusFromMass(newMass)
            playerCells.splice(j, 1)
            j--
          } else {
            b.radius = getRadiusFromMass(newMass)
            playerCells.splice(i, 1)
            i--
            break
          }
        }
      }
    }
    playerCellsRef.current = playerCells

    // Merge player 2 cells (in 2P mode)
    if (isLocal2P) {
      for (let i = 0; i < player2Cells.length; i++) {
        for (let j = i + 1; j < player2Cells.length; j++) {
          const a = player2Cells[i]
          const b = player2Cells[j]
          const aTime = lastSplitRef.current.get(a.id) || 0
          const bTime = lastSplitRef.current.get(b.id) || 0
          if (now - aTime < MERGE_DELAY || now - bTime < MERGE_DELAY) continue
          const dist = getDistance(a.x, a.y, b.x, b.y)
          if (dist < Math.max(a.radius, b.radius)) {
            const newMass = getMass(a.radius) + getMass(b.radius)
            if (a.radius >= b.radius) {
              a.radius = getRadiusFromMass(newMass)
              player2Cells.splice(j, 1)
              j--
            } else {
              b.radius = getRadiusFromMass(newMass)
              player2Cells.splice(i, 1)
              i--
              break
            }
          }
        }
      }
      player2CellsRef.current = player2Cells
    }

    // Check player 1 eating ejected mass
    playerCellsRef.current.forEach(cell => {
      ejectedMassRef.current = ejectedMassRef.current.filter(mass => {
        // Can't eat own mass immediately (simple check: if fast, ignore)
        if (mass.creatorId === cell.id && (Math.abs(mass.vx) > 5 || Math.abs(mass.vy) > 5)) return true

        const dist = getDistance(cell.x, cell.y, mass.x, mass.y)
        if (cell.radius > mass.radius * 1.1 && dist < cell.radius - mass.radius * 0.5) {
          cell.radius = getRadiusFromMass(getMass(cell.radius) + EJECT_MASS_VALUE)
          return false
        }
        return true
      })
    })

    // Check player 2 eating ejected mass (in 2P mode)
    if (isLocal2P) {
      player2CellsRef.current.forEach(cell => {
        ejectedMassRef.current = ejectedMassRef.current.filter(mass => {
          if (mass.creatorId === cell.id && (Math.abs(mass.vx) > 5 || Math.abs(mass.vy) > 5)) return true
          const dist = getDistance(cell.x, cell.y, mass.x, mass.y)
          if (cell.radius > mass.radius * 1.1 && dist < cell.radius - mass.radius * 0.5) {
            cell.radius = getRadiusFromMass(getMass(cell.radius) + EJECT_MASS_VALUE)
            return false
          }
          return true
        })
      })
    }

    // Check player hitting viruses
    const newVirusSplits: Cell[] = []
    
    playerCellsRef.current.forEach((cell) => {
      let exploded = false
      virusesRef.current = virusesRef.current.filter(virus => {
        const dist = getDistance(cell.x, cell.y, virus.x, virus.y)
        
        // Check collision
        if (dist < cell.radius + virus.radius * 0.5) {
          // If player is bigger than virus, explode!
          if (cell.radius > virus.radius && !exploded) {
            if (cell.radius >= 35) { // Minimum mass to explode
                // Explode logic: split into many pieces
                exploded = true
                
                // Max cells we can add
                const spotsAvailable = MAX_CELLS - playerCellsRef.current.length - newVirusSplits.length
                const splitCount = Math.min(spotsAvailable, 8) 
                
                if (splitCount > 0) {
                    const massPerPiece = getMass(cell.radius) / (splitCount + 1)
                    cell.radius = getRadiusFromMass(massPerPiece)
                    
                    for(let i=0; i<splitCount; i++) {
                        const angle = (Math.PI * 2 * i) / splitCount
                        newVirusSplits.push({
                            id: generateId(),
                            x: cell.x,
                            y: cell.y,
                            radius: getRadiusFromMass(massPerPiece),
                            color: cell.color,
                            vx: Math.cos(angle) * 15,
                            vy: Math.sin(angle) * 15,
                            isPlayer: true,
                            name: "You"
                        })
                    }
                }
                return false // Remove virus
            }
          }
        }
        return true
      })
    })
    
    if (newVirusSplits.length > 0) {
        playerCellsRef.current = [...playerCellsRef.current, ...newVirusSplits]
    }

    // Check player 2 hitting viruses (in 2P mode)
    if (isLocal2P) {
      const newVirusSplits2: Cell[] = []

      player2CellsRef.current.forEach((cell) => {
        let exploded = false
        virusesRef.current = virusesRef.current.filter(virus => {
          const dist = getDistance(cell.x, cell.y, virus.x, virus.y)
          if (dist < cell.radius + virus.radius * 0.5) {
            if (cell.radius > virus.radius && !exploded) {
              if (cell.radius >= 35) {
                exploded = true
                const spotsAvailable = MAX_CELLS - player2CellsRef.current.length - newVirusSplits2.length
                const splitCount = Math.min(spotsAvailable, 8)
                if (splitCount > 0) {
                  const massPerPiece = getMass(cell.radius) / (splitCount + 1)
                  cell.radius = getRadiusFromMass(massPerPiece)
                  for(let i=0; i<splitCount; i++) {
                    const angle = (Math.PI * 2 * i) / splitCount
                    newVirusSplits2.push({
                      id: generateId(),
                      x: cell.x,
                      y: cell.y,
                      radius: getRadiusFromMass(massPerPiece),
                      color: cell.color,
                      vx: Math.cos(angle) * 15,
                      vy: Math.sin(angle) * 15,
                      isPlayer: true,
                      name: "Player 2"
                    })
                  }
                }
                return false
              }
            }
          }
          return true
        })
      })

      if (newVirusSplits2.length > 0) {
        player2CellsRef.current = [...player2CellsRef.current, ...newVirusSplits2]
      }
    }

    // Update AI cells
    aiCellsRef.current.forEach(ai => {
      updateAIBehavior(ai, now)

      const behavior = aiBehaviorsRef.current.get(ai.id)
      if (!behavior) return

      const dx = behavior.targetX - ai.x
      const dy = behavior.targetY - ai.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 5) {
        const speed = MAX_SPEED * (INITIAL_RADIUS / ai.radius) * 1.5
        ai.vx = (dx / dist) * speed
        ai.vy = (dy / dist) * speed
      } else {
        ai.vx *= 0.9
        ai.vy *= 0.9
      }

      ai.x += ai.vx
      ai.y += ai.vy

      ai.x = Math.max(ai.radius, Math.min(WORLD_SIZE - ai.radius, ai.x))
      ai.y = Math.max(ai.radius, Math.min(WORLD_SIZE - ai.radius, ai.y))
    })

    // Check player 1 eating food
    playerCells.forEach(cell => {
      foodRef.current = foodRef.current.filter(food => {
        if (canEat(cell, food)) {
          cell.radius = getRadiusFromMass(getMass(cell.radius) + getMass(food.radius) * 2)
          return false
        }
        return true
      })
    })

    // Check player 2 eating food (in 2P mode)
    if (isLocal2P) {
      player2CellsRef.current.forEach(cell => {
        foodRef.current = foodRef.current.filter(food => {
          if (canEat(cell, food)) {
            cell.radius = getRadiusFromMass(getMass(cell.radius) + getMass(food.radius) * 2)
            return false
          }
          return true
        })
      })
    }

    // Check AI eating food
    aiCellsRef.current.forEach(ai => {
      foodRef.current = foodRef.current.filter(food => {
        if (canEat(ai, food)) {
          ai.radius = getRadiusFromMass(getMass(ai.radius) + getMass(food.radius) * 2)
          return false
        }
        return true
      })
    })

    // Respawn food
    while (foodRef.current.length < FOOD_COUNT) {
      foodRef.current.push({
        id: generateId(),
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: FOOD_RADIUS,
        color: getRandomColor()
      })
    }

    // Check player 1 eating AI
    playerCells.forEach(playerCell => {
      aiCellsRef.current = aiCellsRef.current.filter(ai => {
        if (canEat(playerCell, ai)) {
          playerCell.radius = getRadiusFromMass(getMass(playerCell.radius) + getMass(ai.radius))
          return false
        }
        return true
      })
    })

    // Check player 2 eating AI (in 2P mode)
    if (isLocal2P) {
      player2CellsRef.current.forEach(p2Cell => {
        aiCellsRef.current = aiCellsRef.current.filter(ai => {
          if (canEat(p2Cell, ai)) {
            p2Cell.radius = getRadiusFromMass(getMass(p2Cell.radius) + getMass(ai.radius))
            return false
          }
          return true
        })
      })
    }

    // Check AI eating player 1
    aiCellsRef.current.forEach(ai => {
      playerCellsRef.current = playerCellsRef.current.filter(playerCell => {
        if (canEat(ai, playerCell)) {
          ai.radius = getRadiusFromMass(getMass(ai.radius) + getMass(playerCell.radius))
          return false
        }
        return true
      })
    })

    // Check AI eating player 2 (in 2P mode)
    if (isLocal2P) {
      aiCellsRef.current.forEach(ai => {
        player2CellsRef.current = player2CellsRef.current.filter(p2Cell => {
          if (canEat(ai, p2Cell)) {
            ai.radius = getRadiusFromMass(getMass(ai.radius) + getMass(p2Cell.radius))
            return false
          }
          return true
        })
      })
    }

    // Check player vs player eating (in 2P mode)
    if (isLocal2P) {
      // Player 1 eating Player 2 cells
      playerCellsRef.current.forEach(p1Cell => {
        player2CellsRef.current = player2CellsRef.current.filter(p2Cell => {
          if (canEat(p1Cell, p2Cell)) {
            p1Cell.radius = getRadiusFromMass(getMass(p1Cell.radius) + getMass(p2Cell.radius))
            return false
          }
          return true
        })
      })

      // Player 2 eating Player 1 cells
      player2CellsRef.current.forEach(p2Cell => {
        playerCellsRef.current = playerCellsRef.current.filter(p1Cell => {
          if (canEat(p2Cell, p1Cell)) {
            p2Cell.radius = getRadiusFromMass(getMass(p2Cell.radius) + getMass(p1Cell.radius))
            return false
          }
          return true
        })
      })
    }

    // Check AI eating AI
    for (let i = 0; i < aiCellsRef.current.length; i++) {
      for (let j = i + 1; j < aiCellsRef.current.length; j++) {
        const a = aiCellsRef.current[i]
        const b = aiCellsRef.current[j]

        if (canEat(a, b)) {
          a.radius = getRadiusFromMass(getMass(a.radius) + getMass(b.radius))
          aiCellsRef.current.splice(j, 1)
          j--
        } else if (canEat(b, a)) {
          b.radius = getRadiusFromMass(getMass(b.radius) + getMass(a.radius))
          aiCellsRef.current.splice(i, 1)
          i--
          break
        }
      }
    }

    // Respawn AI
    while (aiCellsRef.current.length < AI_COUNT) {
      const id = generateId()
      aiCellsRef.current.push({
        id,
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: INITIAL_RADIUS * (0.5 + Math.random()),
        color: getRandomColor(),
        vx: 0,
        vy: 0,
        name: AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]
      })

      aiBehaviorsRef.current.set(id, {
        targetX: Math.random() * WORLD_SIZE,
        targetY: Math.random() * WORLD_SIZE,
        lastDecision: 0
      })
    }

    // Update leaderboard
    // Aggregate player cells
    const playerScore = playerCellsRef.current.reduce(
      (sum, c) => sum + Math.floor(getMass(c.radius)),
      0
    )

    const player2Score = isLocal2P ? player2CellsRef.current.reduce(
      (sum, c) => sum + Math.floor(getMass(c.radius)),
      0
    ) : 0

    const leaderboardData: { name: string; score: number; isPlayer?: boolean; isPlayer2?: boolean }[] = [
      { name: isLocal2P ? "Player 1" : "You", score: playerScore, isPlayer: true },
      ...(isLocal2P ? [{ name: "Player 2", score: player2Score, isPlayer2: true }] : []),
      ...aiCellsRef.current.map(c => ({
        name: c.name || "Bot",
        score: Math.floor(getMass(c.radius))
      }))
    ]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setLeaderboard(leaderboardData)

    // --- RENDER ---

    // Clear canvas
    ctx.fillStyle = "#0a0a0a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save context for camera transform
    ctx.save()

    // Apply camera transform
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(camera.scale, camera.scale)
    ctx.translate(-camera.x, -camera.y)

    // Draw grid
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 1
    const gridSize = 50

    const startX = Math.floor((camera.x - canvas.width / 2 / camera.scale) / gridSize) * gridSize
    const endX = Math.ceil((camera.x + canvas.width / 2 / camera.scale) / gridSize) * gridSize
    const startY = Math.floor((camera.y - canvas.height / 2 / camera.scale) / gridSize) * gridSize
    const endY = Math.ceil((camera.y + canvas.height / 2 / camera.scale) / gridSize) * gridSize

    for (let x = startX; x <= endX; x += gridSize) {
      if (x >= 0 && x <= WORLD_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, Math.max(0, startY))
        ctx.lineTo(x, Math.min(WORLD_SIZE, endY))
        ctx.stroke()
      }
    }

    for (let y = startY; y <= endY; y += gridSize) {
      if (y >= 0 && y <= WORLD_SIZE) {
        ctx.beginPath()
        ctx.moveTo(Math.max(0, startX), y)
        ctx.lineTo(Math.min(WORLD_SIZE, endX), y)
        ctx.stroke()
      }
    }

    // Draw world border
    ctx.strokeStyle = "#ff0000"
    ctx.lineWidth = 5
    ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE)

    // Draw food
    foodRef.current.forEach(food => {
      ctx.fillStyle = food.color
      ctx.beginPath()
      ctx.arc(food.x, food.y, food.radius, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw AI cells
    aiCellsRef.current.forEach(ai => {
      // Cell body
      ctx.fillStyle = ai.color
      ctx.beginPath()
      ctx.arc(ai.x, ai.y, ai.radius, 0, Math.PI * 2)
      ctx.fill()

      // Border
      ctx.strokeStyle = "rgba(0,0,0,0.3)"
      ctx.lineWidth = 3
      ctx.stroke()

      // Name
      if (ai.radius > 20) {
        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${Math.max(12, ai.radius / 3)}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(ai.name || "Bot", ai.x, ai.y)
      }
    })

    // Draw ejected mass
    ejectedMassRef.current.forEach(mass => {
      ctx.fillStyle = mass.color
      ctx.beginPath()
      ctx.arc(mass.x, mass.y, mass.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.2)"
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw viruses
    virusesRef.current.forEach(virus => {
      ctx.fillStyle = "#33ff33"
      ctx.beginPath()
      
      // Draw spiky virus
      const spikes = 20
      const outerRad = virus.radius + 5
      const innerRad = virus.radius - 5
      
      for(let i=0; i<spikes * 2; i++) {
        const rad = (i % 2 === 0) ? outerRad : innerRad
        const angle = (Math.PI * 2 * i) / (spikes * 2)
        const x = virus.x + Math.cos(angle) * rad
        const y = virus.y + Math.sin(angle) * rad
        if (i===0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      
      ctx.closePath()
      ctx.fill()
      
      ctx.strokeStyle = "#22cc22"
      ctx.lineWidth = 4
      ctx.stroke()
    })

    // Draw player 2 cells (in 2P mode, drawn before player 1)
    if (isLocal2P) {
      player2CellsRef.current.forEach(cell => {
        ctx.shadowColor = cell.color
        ctx.shadowBlur = 20
        ctx.fillStyle = cell.color
        ctx.beginPath()
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.strokeStyle = "rgba(255,255,255,0.5)"
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.fillStyle = "#ffffff"
        ctx.font = `bold ${Math.max(14, cell.radius / 3)}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("P2", cell.x, cell.y)
      })
    }

    // Draw player 1 cells (on top)
    playerCellsRef.current.forEach(cell => {
      // Cell body with glow
      ctx.shadowColor = cell.color
      ctx.shadowBlur = 20
      ctx.fillStyle = cell.color
      ctx.beginPath()
      ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.5)"
      ctx.lineWidth = 3
      ctx.stroke()

      // Name
      ctx.fillStyle = "#ffffff"
      ctx.font = `bold ${Math.max(14, cell.radius / 3)}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(isLocal2P ? "P1" : "You", cell.x, cell.y)
    })

    ctx.restore()

    // Continue loop
    gameLoopRef.current = requestAnimationFrame(loop)
  }, [isPlaying, endGame, updateAIBehavior, gameMode])

  // Start/stop game loop
  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameLoop])

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const touch = e.touches[0]
      mouseRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  // Handle keyboard - Player 1: Space=split, E=eject | Player 2: WASD movement, Q=split, Tab=eject
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Player 1 controls
      if (e.code === "Space") {
        e.preventDefault()
        splitPlayer(1)
      }
      if (e.code === "KeyE") {
        e.preventDefault()
        ejectMass(1)
      }

      // Player 2 controls (only in 2P mode)
      if (gameMode === "local_2p") {
        if (e.code === "KeyW") player2InputRef.current.up = true
        if (e.code === "KeyS") player2InputRef.current.down = true
        if (e.code === "KeyA") player2InputRef.current.left = true
        if (e.code === "KeyD") player2InputRef.current.right = true
        if (e.code === "KeyQ") {
          e.preventDefault()
          splitPlayer(2)
        }
        if (e.code === "Tab") {
          e.preventDefault()
          ejectMass(2)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Player 2 movement release
      if (e.code === "KeyW") player2InputRef.current.up = false
      if (e.code === "KeyS") player2InputRef.current.down = false
      if (e.code === "KeyA") player2InputRef.current.left = false
      if (e.code === "KeyD") player2InputRef.current.right = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [splitPlayer, ejectMass, gameMode])

  // Resize canvas
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden"
      style={{ height: "100vh" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Back button - always visible */}
      <div className="absolute top-4 left-4 z-20">
        <Link to="/games">
          <Button variant="outline" size="sm" className="bg-black/50 border-white/20 text-white hover:bg-black/70">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </div>

      {/* HUD */}
      {isPlaying && (
        <>
          {/* Leaderboard with Score above it */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg min-w-48 border border-white/10">
            {/* Score at top */}
            <div className="text-center mb-3 pb-3 border-b border-white/20">
              {gameMode === "local_2p" ? (
                <div className="flex gap-4 justify-center">
                  <div>
                    <p className="text-cyan-400 text-xs uppercase tracking-wider">P1</p>
                    <p className="text-cyan-400 text-xl font-bold">{score.toLocaleString()}</p>
                  </div>
                  <div className="border-l border-white/20" />
                  <div>
                    <p className="text-red-400 text-xs uppercase tracking-wider">P2</p>
                    <p className="text-red-400 text-xl font-bold">{score2.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Score</p>
                  <p className="text-white text-2xl font-bold">{score.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Cells: {playerCellsRef.current.length}</p>
                </>
              )}
            </div>

            {/* Leaderboard */}
            <h3 className="text-white font-bold mb-2 text-center text-sm">Leaderboard</h3>
            <div className="space-y-1">
              {leaderboard.map((entry, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex justify-between text-sm",
                    entry.isPlayer ? "text-cyan-400 font-bold" : "",
                    entry.isPlayer2 ? "text-red-400 font-bold" : "",
                    !entry.isPlayer && !entry.isPlayer2 ? "text-gray-300" : ""
                  )}
                >
                  <span>{i + 1}. {entry.name}</span>
                  <span>{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 bg-black/50 px-4 py-2 rounded-lg hidden md:block">
            {gameMode === "local_2p" ? (
              <div className="text-gray-400 text-xs">
                <p className="text-cyan-400">P1: Mouse • Space split • E eject</p>
                <p className="text-red-400">P2: WASD • Q split • Tab eject</p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Mouse to move • Space to split • E to eject</p>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="absolute bottom-4 right-4 md:hidden flex gap-2">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => ejectMass(1)}
              className="h-14 w-14 rounded-full"
            >
              <Zap className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              onClick={() => splitPlayer(1)}
              className="h-14 w-14 rounded-full bg-cyan-600"
            >
              <Split className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}

      {/* Menu / Game Over overlay */}
      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-30">
          {gameOver ? (
            <>
              {gameMode === "local_2p" && winner ? (
                <>
                  <h1 className={`text-5xl font-bold mb-4 ${winner === "player1" ? "text-cyan-400" : "text-red-400"}`}>
                    {winner === "player1" ? "PLAYER 1 WINS!" : "PLAYER 2 WINS!"}
                  </h1>
                  <p className="text-xl text-white mb-4">
                    Final Scores: <span className="text-cyan-400">{score.toLocaleString()}</span> vs <span className="text-red-400">{score2.toLocaleString()}</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-red-500 mb-4">Game Over</h1>
                  <p className="text-xl text-white mb-2">Final Score: {score.toLocaleString()}</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-yellow-400 font-bold mb-4 animate-pulse">New High Score!</p>
                  )}
                </>
              )}
              <div className="flex gap-3">
                <Button onClick={() => startGame(gameMode)} size="lg" className="gap-2">
                  <RotateCcw className="h-5 w-5" /> Play Again
                </Button>
                <Button onClick={() => { setGameOver(false); setGameMode("menu") }} size="lg" variant="outline" className="border-white/20">
                  Main Menu
                </Button>
              </div>
            </>
          ) : gameMode === "menu" ? (
            <>
              <h1 className="text-5xl font-bold text-cyan-400 mb-6">Agar Clone</h1>

              <div className="flex items-center gap-2 mb-8">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-white text-lg">High Score: {highScore.toLocaleString()}</span>
              </div>

              <div className="flex flex-col gap-4">
                <Button onClick={() => startGame("single")} size="lg" className="gap-3 text-lg px-8 py-6 bg-cyan-600 hover:bg-cyan-500">
                  <Bot className="h-6 w-6" /> Single Player
                </Button>
                <Button onClick={() => startGame("local_2p")} size="lg" className="gap-3 text-lg px-8 py-6 bg-green-600 hover:bg-green-500">
                  <Users className="h-6 w-6" /> Local 2 Player
                </Button>
              </div>

              <div className="mt-8 text-gray-400 text-center max-w-md">
                <p className="mb-2">Eat smaller cells and food to grow</p>
                <p className="mb-2">Avoid larger cells or be eaten!</p>
                <p className="text-sm text-gray-500 mt-4">
                  <span className="text-cyan-400">P1:</span> Mouse • Space split • E eject<br />
                  <span className="text-red-400">P2:</span> WASD • Q split • Tab eject
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
