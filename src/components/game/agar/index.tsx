import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Trophy, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import type { 
  Cell, Food, Virus, EjectedMass, AIBehavior 
} from "./types"
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

  // Game state refs for animation loop
  const playerCellsRef = useRef<Cell[]>([])
  const aiCellsRef = useRef<Cell[]>([])
  const foodRef = useRef<Food[]>([])
  const virusesRef = useRef<Virus[]>([])
  const ejectedMassRef = useRef<EjectedMass[]>([])
  const aiBehaviorsRef = useRef<Map<string, AIBehavior>>(new Map())
  const mouseRef = useRef({ x: 0, y: 0 })
  const cameraRef = useRef({ x: 0, y: 0, scale: 1 })
  const gameLoopRef = useRef<number | null>(null)
  const lastSplitRef = useRef<Map<string, number>>(new Map())

  // React state for UI
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem("agar-highscore") || "0")
  )
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([])

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
  const startGame = useCallback(() => {
    // Initialize player
    playerCellsRef.current = [{
      id: "player-main",
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      radius: INITIAL_RADIUS,
      color: "#00D4FF",
      vx: 0,
      vy: 0,
      isPlayer: true,
      name: "You"
    }]

    lastSplitRef.current.clear()
    initializeFood()
    initializeAI()
    initializeViruses()
    ejectedMassRef.current = []

    setIsPlaying(true)
    setGameOver(false)
    setScore(0)
  }, [initializeFood, initializeAI, initializeViruses])

  // End game
  const endGame = useCallback(() => {
    setIsPlaying(false)
    setGameOver(true)

    const finalScore = Math.floor(
      playerCellsRef.current.reduce((sum, cell) => sum + getMass(cell.radius), 0)
    )

    if (finalScore > highScore) {
      setHighScore(finalScore)
      localStorage.setItem("agar-highscore", finalScore.toString())
    }
  }, [highScore])

  // Split player cell
  const splitPlayer = useCallback(() => {
    if (!isPlaying) return

    const now = Date.now()
    const newCells: Cell[] = []

    playerCellsRef.current.forEach(cell => {
      // Need minimum mass to split
      if (cell.radius < MIN_SPLIT_RADIUS) return
      if (playerCellsRef.current.length >= MAX_CELLS) return // Max cells limit

      const newRadius = getRadiusFromMass(getMass(cell.radius) / 2)

      // Calculate direction toward mouse
      const canvas = canvasRef.current
      if (!canvas) return

      const camera = cameraRef.current
      const worldMouseX = (mouseRef.current.x - canvas.width / 2) / camera.scale + camera.x
      const worldMouseY = (mouseRef.current.y - canvas.height / 2) / camera.scale + camera.y

      const dx = worldMouseX - cell.x
      const dy = worldMouseY - cell.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      const dirX = dist > 0 ? dx / dist : 1
      const dirY = dist > 0 ? dy / dist : 0

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
        name: "You"
      })

      // Track split time for merging
      lastSplitRef.current.set(cell.id, now)
      lastSplitRef.current.set(newId, now)
    })

    playerCellsRef.current = [...playerCellsRef.current, ...newCells]
  }, [isPlaying])

  // Eject mass
  const ejectMass = useCallback(() => {
    if (!isPlaying) return

    const canvas = canvasRef.current
    if (!canvas) return
    const camera = cameraRef.current
    const worldMouseX = (mouseRef.current.x - canvas.width / 2) / camera.scale + camera.x
    const worldMouseY = (mouseRef.current.y - canvas.height / 2) / camera.scale + camera.y

    playerCellsRef.current.forEach(cell => {
      // Must be large enough to eject
      if (cell.radius < 35) return

      const newRadius = getRadiusFromMass(getMass(cell.radius) - EJECT_MASS_COST)
      
      const dx = worldMouseX - cell.x
      const dy = worldMouseY - cell.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const dirX = dist > 0 ? dx / dist : 1
      const dirY = dist > 0 ? dy / dist : 0

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

    // Find all cells this AI can interact with
    const allCells = [...playerCellsRef.current, ...aiCellsRef.current.filter(c => c.id !== ai.id)]

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
  const gameLoop = useCallback(() => {
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

    if (playerCells.length === 0) {
      endGame()
      return
    }

    // Calculate player center of mass for camera
    let totalMass = 0
    let centerX = 0
    let centerY = 0

    playerCells.forEach(cell => {
      const mass = getMass(cell.radius)
      totalMass += mass
      centerX += cell.x * mass
      centerY += cell.y * mass
    })

    centerX /= totalMass
    centerY /= totalMass

    // Update score
    setScore(Math.floor(totalMass))

    // Update camera
    const targetScale = Math.max(0.3, Math.min(1, 100 / Math.sqrt(totalMass / Math.PI)))
    cameraRef.current.scale += (targetScale - cameraRef.current.scale) * 0.05
    cameraRef.current.x += (centerX - cameraRef.current.x) * 0.1
    cameraRef.current.y += (centerY - cameraRef.current.y) * 0.1

    // Move player cells toward mouse
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

    // Merge player cells
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

    // Check player eating ejected mass
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

    // Check player eating food
    playerCells.forEach(cell => {
      foodRef.current = foodRef.current.filter(food => {
        if (canEat(cell, food)) {
          cell.radius = getRadiusFromMass(getMass(cell.radius) + getMass(food.radius) * 2)
          return false
        }
        return true
      })
    })

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

    // Check player eating AI
    playerCells.forEach(playerCell => {
      aiCellsRef.current = aiCellsRef.current.filter(ai => {
        if (canEat(playerCell, ai)) {
          playerCell.radius = getRadiusFromMass(getMass(playerCell.radius) + getMass(ai.radius))
          return false
        }
        return true
      })
    })

    // Check AI eating player
    aiCellsRef.current.forEach(ai => {
      playerCellsRef.current = playerCellsRef.current.filter(playerCell => {
        if (canEat(ai, playerCell)) {
          ai.radius = getRadiusFromMass(getMass(ai.radius) + getMass(playerCell.radius))
          return false
        }
        return true
      })
    })

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

    const leaderboardData = [
      { name: "You", score: playerScore },
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

    // Draw player cells (on top)
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
      ctx.fillText("You", cell.x, cell.y)
    })

    ctx.restore()

    // Continue loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [isPlaying, endGame, updateAIBehavior])

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

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        splitPlayer()
      }
      if (e.code === "KeyW") {
        e.preventDefault()
        ejectMass()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [splitPlayer, ejectMass])

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
              <p className="text-gray-400 text-xs uppercase tracking-wider">Score</p>
              <p className="text-white text-2xl font-bold">{score.toLocaleString()}</p>
              <p className="text-gray-500 text-xs">Cells: {playerCellsRef.current.length}</p>
            </div>
            
            {/* Leaderboard */}
            <h3 className="text-white font-bold mb-2 text-center text-sm">Leaderboard</h3>
            <div className="space-y-1">
              {leaderboard.map((entry, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex justify-between text-sm",
                    entry.name === "You" ? "text-cyan-400 font-bold" : "text-gray-300"
                  )}
                >
                  <span>{i + 1}. {entry.name}</span>
                  <span>{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls hint */}
          <div className="absolute bottom-4 left-4 bg-black/50 px-4 py-2 rounded-lg">
            <p className="text-gray-400 text-sm">Mouse to move • Space to split</p>
          </div>

          {/* Split button for mobile */}
          <Button
            className="absolute bottom-4 right-4 md:hidden"
            size="lg"
            onClick={splitPlayer}
          >
            Split
          </Button>
        </>
      )}

      {/* Start/Game Over overlay */}
      {(!isPlaying || gameOver) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          {gameOver ? (
            <>
              <h1 className="text-4xl font-bold text-red-500 mb-4">Game Over</h1>
              <p className="text-xl text-white mb-2">Final Score: {score.toLocaleString()}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 font-bold mb-4 animate-pulse">New High Score!</p>
              )}
              <Button onClick={startGame} size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" /> Play Again
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-cyan-400 mb-6">Agar Clone</h1>

              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-white text-lg">High Score: {highScore.toLocaleString()}</span>
              </div>

              <Button onClick={startGame} size="lg" className="gap-2 text-lg px-8 py-6">
                <Play className="h-6 w-6" /> Start Game
              </Button>

              <div className="mt-8 text-gray-400 text-center max-w-md">
                <p className="mb-2">Move your mouse to control your cell</p>
                <p className="mb-2">Eat smaller cells and food to grow</p>
                <p className="mb-2">Avoid larger cells or be eaten!</p>
                <p className="text-sm text-gray-500 mt-4">Press SPACE to split • Tap split button on mobile</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
