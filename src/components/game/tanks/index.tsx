import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

import { Link } from "react-router-dom"
import type { 
  Tank, Bullet, Wall, Explosion 
} from "./types"
import {
  VIEWPORT_WIDTH, VIEWPORT_HEIGHT, COLORS, TANK_RADIUS, TANK_STATS,
  BULLET_RADIUS
} from "./constants"
import { updateBulletPhysics, resolveWallCollision, checkCircleCollision } from "./physics"

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Simple level layout 
const LEVEL_1_WALLS: Wall[] = [
  // Outer Box handled by viewport, but let's add some inner obstacles
  { x: 200, y: 150, width: 400, height: 20, breakable: false }, // Top horiz
  { x: 200, y: 450, width: 400, height: 20, breakable: false }, // Bottom horiz
  { x: 390, y: 250, width: 20, height: 100, breakable: true, hp: 3 }, // Center vert breakable
]

export function TanksGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Game State
  const playerRef = useRef<Tank | null>(null)
  const enemiesRef = useRef<Tank[]>([])
  const bulletsRef = useRef<Bullet[]>([])

  const explosionsRef = useRef<Explosion[]>([])
  const wallsRef = useRef<Wall[]>([])
  
  // Inputs
  const keysRef = useRef<Set<string>>(new Set())
  const mouseRef = useRef({ x: 0, y: 0 })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [victory, setVictory] = useState(false)
  const [mission, setMission] = useState(1)
  
  const gameLoopRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  const initLevel = useCallback((levelNum: number) => {
    bulletsRef.current = []
    explosionsRef.current = []
    
    // Walls & Enemies setup
    let levelWalls: Wall[] = []
    let levelEnemies: {type: any, x: number, y: number}[] = []

    if (levelNum === 1) {
        levelWalls = [...LEVEL_1_WALLS]
        levelEnemies = [
            { type: "BROWN", x: 700, y: 100 },
            { type: "GREY", x: 700, y: 500 }
        ]
    } else if (levelNum === 2) {
        levelWalls = [
            { x: 300, y: 200, width: 200, height: 20, breakable: false },
            { x: 300, y: 380, width: 200, height: 20, breakable: false }
        ]
        levelEnemies = [
            { type: "GREY", x: 600, y: 300 },
            { type: "TEAL", x: 700, y: 100 },
            { type: "TEAL", x: 700, y: 500 }
        ]
    } else {
        // Boss / Hard Level
        levelWalls = [{ x: 390, y: 200, width: 20, height: 200, breakable: true, hp: 5 }]
        levelEnemies = [
            { type: "RED", x: 700, y: 300 },
            { type: "GREEN", x: 700, y: 100 },
            { type: "GREEN", x: 700, y: 500 },
            { type: "BLACK", x: 750, y: 300 }
        ]
    }

    wallsRef.current = levelWalls
    
    // Create Player
    const pStats = TANK_STATS.PLAYER
    playerRef.current = {
      id: "player",
      type: "PLAYER",
      x: 100, 
      y: 300,
      radius: TANK_RADIUS,
      color: COLORS.PLAYER,
      angle: 0,
      turretAngle: 0,
      vx: 0, vy: 0,
      cooldown: 0,
      maxCooldown: pStats.cooldown,
      bulletSpeed: pStats.bulletSpeed,
      maxBullets: pStats.maxBullets,
      bulletCount: 0,
      rockets: pStats.rockets,
      speed: pStats.speed,
      hp: pStats.hp,
      isPlayer: true
    }

    // Initialize Enemies using generic loader
    enemiesRef.current = levelEnemies.map((e, i) => {
        const stats = TANK_STATS[e.type as keyof typeof TANK_STATS]
        return {
            id: `enemy-${i}`,
            type: e.type,
            x: e.x,
            y: e.y,
            radius: TANK_RADIUS,
            color: COLORS[e.type as keyof typeof COLORS],
            angle: Math.PI,
            turretAngle: Math.PI,
            vx: 0, vy: 0,
            cooldown: 50 + i * 20, // Stagger
            maxCooldown: stats.cooldown,
            bulletSpeed: stats.bulletSpeed,
            maxBullets: stats.maxBullets,
            bulletCount: 0,
            rockets: stats.rockets,
            speed: stats.speed,
            hp: stats.hp
        }
    })
  }, [])

  const startGame = useCallback(() => {
    initLevel(mission)
    setIsPlaying(true)
    setGameOver(false)
    setVictory(false)
  }, [initLevel, mission])

  // Fire Bullet function
  const fireBullet = useCallback((tank: Tank) => {
    if (tank.cooldown > 0 || tank.bulletCount >= tank.maxBullets) return

    // Offset bullet spawn to end of barrel (approx 25px)
    const barrelLen = 25
    const spawnX = tank.x + Math.cos(tank.turretAngle) * barrelLen
    const spawnY = tank.y + Math.sin(tank.turretAngle) * barrelLen

    const maxBounces = TANK_STATS[tank.type].maxBounces

    bulletsRef.current.push({
      id: generateId(),
      x: spawnX,
      y: spawnY,
      radius: BULLET_RADIUS,
      color: "#000", // Black bullets usually
      angle: 0,
      vx: Math.cos(tank.turretAngle) * tank.bulletSpeed,
      vy: Math.sin(tank.turretAngle) * tank.bulletSpeed,
      bounces: 0,
      maxBounces: maxBounces,
      ownerId: tank.id,
      isRocket: tank.rockets
    })

    tank.cooldown = tank.maxCooldown
    tank.bulletCount++
  }, [])

  // FIRE Input
  const handleMouseDown = useCallback(() => {
    if (!isPlaying || !playerRef.current) return
    fireBullet(playerRef.current)
  }, [isPlaying, fireBullet])
  
  // Main Loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    // const dt = (timestamp - lastTimeRef.current) / 1000 * 60 
    lastTimeRef.current = timestamp

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // --- LOGIC ---
    
    // 1. Player Movement
    const player = playerRef.current
    if (player) {
      // WASD
      let dx = 0
      let dy = 0
      if (keysRef.current.has('w')) dy -= 1
      if (keysRef.current.has('s')) dy += 1
      if (keysRef.current.has('a')) dx -= 1
      if (keysRef.current.has('d')) dx += 1
      
      // Normalize vector
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx*dx + dy*dy)
        dx /= len
        dy /= len
        
        player.x += dx * player.speed
        player.y += dy * player.speed
        
        // Body rotation follows movement
        player.angle = Math.atan2(dy, dx)
      }

      // Turret rotation follows mouse
      // Mouse is handled by listener updating mouseRef
      const angleToMouse = Math.atan2(
        mouseRef.current.y - player.y, 
        mouseRef.current.x - player.x
      )
      player.turretAngle = angleToMouse

      // Cooldown
      if (player.cooldown > 0) player.cooldown--

      // Wall Collisions
      wallsRef.current.forEach(wall => resolveWallCollision(player, wall))
      
      // Clamp to screen
      player.x = Math.max(player.radius, Math.min(VIEWPORT_WIDTH - player.radius, player.x))
      player.y = Math.max(player.radius, Math.min(VIEWPORT_HEIGHT - player.radius, player.y))
    }

    // 2. Enemy AI
    enemiesRef.current.forEach(enemy => {
        if (!player) return

        const dx = player.x - enemy.x
        const dy = player.y - enemy.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        let shouldFire = false

        if (enemy.type === "BROWN" || enemy.type === "GREEN") {
            // Stationary Aimers
            enemy.turretAngle = Math.atan2(dy, dx)
            shouldFire = true
        } else {
             // Movers (GREY, TEAL, RED, BLACK)
             // Simple chase
             if (dist > 150) {
                 enemy.vx = (dx/dist) * enemy.speed
                 enemy.vy = (dy/dist) * enemy.speed
                 enemy.angle = Math.atan2(dy, dx) // Face move dir (tracks)
             } else {
                 enemy.vx = 0
                 enemy.vy = 0
             }
             
             // Update position
             enemy.x += enemy.vx
             enemy.y += enemy.vy
             wallsRef.current.forEach(wall => resolveWallCollision(enemy, wall))
             
             enemy.turretAngle = Math.atan2(dy, dx)
             
             // Fire logic: GREY=Rare, TEAL=Frequent, RED=Burst
             shouldFire = true 
        }

        // Fire Check (Randomized based on aggressiveness)
        let fireChance = 0.01
        if (enemy.type === "GREY") fireChance = 0.02
        if (enemy.type === "TEAL") fireChance = 0.03
        if (enemy.type === "RED" || enemy.type === "BLACK") fireChance = 0.05
        
        if (shouldFire && Math.random() < fireChance) fireBullet(enemy)

        if (enemy.cooldown > 0) enemy.cooldown--
    })

    // 3. Bullets
    // Filter out dead bullets
    bulletsRef.current = bulletsRef.current.filter(b => {
      // Physics Update
      const alive = updateBulletPhysics(b, wallsRef.current, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
      
      // Check Hit Tanks with Bullet
      let hit = false
      
      // Hit Enemy?
      if (b.ownerId === "player") {
        enemiesRef.current.forEach(enemy => {
           if (checkCircleCollision(b, enemy)) {
             enemy.hp-- // Damage
             hit = true
           }
        })
      }
      
      // Hit Player?
      if (b.ownerId !== "player" && player) {
          if (checkCircleCollision(b, player)) {
              // Player Hit!
              setGameOver(true)
              setIsPlaying(false)
              hit = true
          }
      }
      
      if (hit) return false // Destroy bullet
      return alive
    })
    
    // Remove dead Enemies
    const prevCount = enemiesRef.current.length
    enemiesRef.current = enemiesRef.current.filter(e => e.hp > 0)
    
    // If enemy died, we can decrement bullet counts (simple logic: bullet count resets when bullet dies, wait...)
    // Actually standard Tanks logic: you have 5 active bullets. When one dies, you get one back.
    // I need to track bullet death to decrement tank.bulletCount.
    // Complexity: I need to map bullet owner to tank to decrement.
    // Hack: Just recalculate bullet counts every frame? No, expensive.
    // Better: when filter removes b, decrement owner.
    
    // Let's rely on a simpler check: 
    // Just count bullets per owner every frame? Valid for < 100 bullets.
    const counts = new Map<string, number>()
    bulletsRef.current.forEach(b => {
        counts.set(b.ownerId, (counts.get(b.ownerId) || 0) + 1)
    })
    
    if (player) player.bulletCount = counts.get(player.id) || 0
    enemiesRef.current.forEach(e => e.bulletCount = counts.get(e.id) || 0)

    // Check Victory
    if (prevCount > 0 && enemiesRef.current.length === 0) {
        if (mission < 3) {
            // Next Mission
            setMission(m => m + 1)
            initLevel(mission + 1)
        } else {
            setVictory(true)
            setIsPlaying(false)
        }
    }

    // --- RENDER ---
    // Clear
    ctx.fillStyle = "#DEB887" // Burlywood / Cork board color background (Wii Tanks style)
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)
    
    // Grid (light)
    ctx.strokeStyle = "rgba(0,0,0,0.1)"
    ctx.lineWidth = 1
    const gridSize = 50
    for(let x=0; x<=VIEWPORT_WIDTH; x+=gridSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x, VIEWPORT_HEIGHT); ctx.stroke(); }
    for(let y=0; y<=VIEWPORT_HEIGHT; y+=gridSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(VIEWPORT_WIDTH, y); ctx.stroke(); }
    
    // Draw Walls
    wallsRef.current.forEach(w => {
        ctx.shadowColor = "rgba(0,0,0,0.4)"
        ctx.shadowBlur = 5
        ctx.shadowOffsetY = 5
        ctx.fillStyle = w.breakable ? COLORS.WALL_BREAKABLE : COLORS.WALL_STATIC
        ctx.fillRect(w.x, w.y, w.width, w.height)
        
        // Top highlight
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(w.x, w.y, w.width, 4);
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0
    })

    // Draw Tracks (static for now)
    
    // Draw Tank Function
    const drawTank = (t: Tank) => {
        ctx.save()
        ctx.translate(t.x, t.y)
        
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)"
        ctx.beginPath()
        ctx.arc(4, 4, t.radius, 0, Math.PI*2)
        ctx.fill()
        
        // Body (Base)
        ctx.rotate(t.angle)
        ctx.fillStyle = t.color
        // Tread rectangles
        ctx.fillRect(-t.radius, -t.radius, t.radius*2, t.radius*2) 
        // Detail for threads
        ctx.fillStyle = "#000"
        ctx.fillRect(-t.radius -2, -t.radius, 4, t.radius*2) // Left tread
        ctx.fillRect(t.radius - 2, -t.radius, 4, t.radius*2) // Right tread
        
        // Reset rotation for turret
        ctx.rotate(-t.angle) 
        
        // Turret
        ctx.rotate(t.turretAngle)
        ctx.fillStyle = "#666" // Barrel
        ctx.fillRect(0, -3, 25, 6)
        
        ctx.fillStyle = t.color // Turret Dome
        ctx.beginPath()
        ctx.arc(0, 0, 8, 0, Math.PI*2)
        ctx.fill()
        ctx.stroke()
        
        ctx.restore()
    }
    
    // Draw Enemies
    enemiesRef.current.forEach(drawTank)
    
    // Draw Player
    if (player) drawTank(player)
    
    // Draw Bullets
    bulletsRef.current.forEach(b => {
        ctx.fillStyle = "#000"
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2)
        ctx.fill()
        // Shine
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(b.x - 1, b.y - 1, 1, 0, Math.PI*2)
        ctx.fill()
    })

    gameLoopRef.current = requestAnimationFrame(() => gameLoop(Date.now()))
  }, [isPlaying, fireBullet]) // Dependencies

  // Effects
  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = requestAnimationFrame(() => gameLoop(Date.now()))
    }
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current) }
  }, [isPlaying, gameLoop])

  // Mouse Listener
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
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])
  
  // Keyboard Listener
  useEffect(() => {
      const onDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase())
      const onUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase())
      
      window.addEventListener("keydown", onDown)
      window.addEventListener("keyup", onUp)
      return () => {
          window.removeEventListener("keydown", onDown)
          window.removeEventListener("keyup", onUp)
      }
  }, [])
  
  // Resize
  useEffect(() => {
      // Fixed viewport size for Tanks (800x600) to keep level consistent
      // We can scale it with CSS
      const canvas = canvasRef.current
      if(canvas) {
          canvas.width = VIEWPORT_WIDTH
          canvas.height = VIEWPORT_HEIGHT
      }
  }, [])

  return (
    <div className="relative w-full h-screen bg-neutral-900 flex items-center justify-center p-4">
      
      <div 
        ref={containerRef}
        className="relative bg-[#DEB887] shadow-2xl rounded-sm overflow-hidden" 
        style={{ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }}
      >
        <canvas ref={canvasRef} className="block cursor-crosshair" onClick={handleMouseDown} />
        
        {/* HUD */}
        <div className="absolute top-4 left-4 text-black font-mono font-bold text-xl">
           MISSION {mission}
        </div>
        <div className="absolute top-4 right-4 text-black font-mono font-bold text-xl">
           x {playerRef.current ? TANK_STATS.PLAYER.hp : 0}
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20 mt-8">
            <Link to="/games">
                <Button variant="outline" size="sm" className="bg-black/20 hover:bg-black/30 text-white border-none">
                    Exit
                </Button>
            </Link>
        </div>

        {/* Overlay */}
        {(!isPlaying || gameOver || victory) && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <h1 className="text-6xl font-black mb-4 tracking-tighter shadow-black drop-shadow-lg">
                    {victory ? "MISSION CLEAR!" : gameOver ? "FAILED" : "TANKS"}
                </h1>
                
                {!isPlaying && !gameOver && !victory && (
                    <div className="text-center"> 
                        <p className="mb-6 opacity-80">
                           WASD to Move • Mouse to Aim • Click to Fire<br/>
                           Bullets Ricochet once!
                        </p>
                        <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-xl font-bold rounded-none border-4 border-white/20">
                            START MISSION
                        </Button>
                    </div>
                )}
                
                {gameOver && (
                    <Button onClick={startGame} className="bg-red-600 hover:bg-red-500 text-white px-8 py-6 text-xl font-bold">
                        RETRY
                    </Button>
                )}
                
                {victory && (
                    <Button onClick={startGame} className="bg-green-600 hover:bg-green-500 text-white px-8 py-6 text-xl font-bold">
                        REPLAY
                    </Button>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
