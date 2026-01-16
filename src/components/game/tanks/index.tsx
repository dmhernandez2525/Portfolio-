import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wind, Fuel, Shield, ShoppingCart, Zap } from "lucide-react"

import type { Tank, Projectile, Explosion, GamePhase, WeaponType } from "./types"
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, COLORS,
    TANK_WIDTH, TANK_HEIGHT, BARREL_LENGTH,
    MAX_POWER, MIN_POWER, POWER_STEP, ANGLE_STEP,
    MOVE_SPEED, PROJECTILE_RADIUS,
    EXPLOSION_RADIUS, TERRAIN_RESOLUTION, WIND_MAX,
    MAX_FUEL, FUEL_CONSUMPTION, WEAPON_DATA
} from "./constants"
import {
    generateTerrain, getTerrainHeight, updateProjectile,
    checkTerrainCollision, destroyTerrain, checkTankCollision,
    calculateAIShot
} from "./physics"

export function TanksGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    // Game state
    const [phase, setPhase] = useState<GamePhase>("aiming")
    const [terrain, setTerrain] = useState<number[]>([])
    const [wind, setWind] = useState(0)
    const [round, setRound] = useState(1)
    
    // Tank state
    const [player, setPlayer] = useState<Tank | null>(null)
    const [enemy, setEnemy] = useState<Tank | null>(null)
    
    // Projectile state
    const projectilesRef = useRef<Projectile[]>([])
    const explosionsRef = useRef<Explosion[]>([])
    
    // Refs for synchronization
    const lastShotOwnerRef = useRef<string | null>(null)
    const animationRef = useRef<number | null>(null)
    
    // Initialize game or next round
    const initGame = useCallback((isNextRound: boolean = false) => {
        const newTerrain = generateTerrain(CANVAS_WIDTH, TERRAIN_RESOLUTION)
        setTerrain(newTerrain)
        setWind((Math.random() - 0.5) * WIND_MAX * 2)
        
        const playerX = 80 + Math.random() * 60
        const enemyX = CANVAS_WIDTH - 80 - Math.random() * 60
        
        if (!isNextRound || !player) {
            setPlayer({
                id: "player",
                x: playerX,
                y: getTerrainHeight(newTerrain, playerX, TERRAIN_RESOLUTION),
                angle: 45,
                power: 50,
                hp: 10,
                maxHp: 10,
                fuel: MAX_FUEL,
                maxFuel: MAX_FUEL,
                weapons: { small_shell: 100, large_shell: 5, mirv: 3, atomic: 1 },
                selectedWeapon: "small_shell",
                isPlayer: true,
                color: COLORS.player,
                isFalling: false
            })
            setRound(1)
        } else {
            // Persist player state between rounds
            setPlayer(prev => prev ? {
                ...prev,
                x: playerX,
                y: getTerrainHeight(newTerrain, playerX, TERRAIN_RESOLUTION),
                fuel: Math.min(prev.maxFuel, prev.fuel + 50),
                isFalling: false
            } : null)
            setRound(r => r + 1)
        }
        
        setEnemy({
            id: "enemy",
            x: enemyX,
            y: getTerrainHeight(newTerrain, enemyX, TERRAIN_RESOLUTION),
            angle: 135,
            power: 50,
            hp: 8 + round * 2,
            maxHp: 8 + round * 2,
            fuel: MAX_FUEL,
            maxFuel: MAX_FUEL,
            weapons: { small_shell: 100, large_shell: 10, mirv: 5, atomic: 2 },
            selectedWeapon: "small_shell",
            isPlayer: false,
            color: COLORS.enemy,
            isFalling: false
        })
        
        setPhase("aiming")
        projectilesRef.current = []
        explosionsRef.current = []
    }, [player, round])
    
    useEffect(() => {
        initGame()
    }, [])

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== "aiming" || !player) return
            const key = e.key.toLowerCase()

            if (key === "arrowleft") setPlayer(p => p ? {...p, angle: Math.min(180, p.angle + ANGLE_STEP)} : null)
            if (key === "arrowright") setPlayer(p => p ? {...p, angle: Math.max(0, p.angle - ANGLE_STEP)} : null)
            if (key === "w") setPlayer(p => p ? {...p, power: Math.min(MAX_POWER, p.power + POWER_STEP)} : null)
            if (key === "s") setPlayer(p => p ? {...p, power: Math.max(MIN_POWER, p.power - POWER_STEP)} : null)
            
            // Movement
            if (key === "a" && player.fuel > 0) {
                const newX = Math.max(TANK_WIDTH/2, player.x - MOVE_SPEED)
                setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
            }
            if (key === "d" && player.fuel > 0) {
                const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, player.x + MOVE_SPEED)
                setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
            }

            // Weapon switching
            if (key === "1") setPlayer(p => p ? {...p, selectedWeapon: "small_shell"} : null)
            if (key === "2") setPlayer(p => p ? {...p, selectedWeapon: "large_shell"} : null)
            if (key === "3") setPlayer(p => p ? {...p, selectedWeapon: "mirv"} : null)
            if (key === "4") setPlayer(p => p ? {...p, selectedWeapon: "atomic"} : null)

            if (key === " " || key === "enter") {
                e.preventDefault()
                fireProjectile()
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [phase, player, terrain])

    const fireProjectile = useCallback(() => {
        if (phase !== "aiming" || !player) return
        const weapon = player.weapons[player.selectedWeapon]
        if (weapon <= 0 && player.selectedWeapon !== "small_shell") return

        const angleRad = player.angle * Math.PI / 180
        const speed = (player.power * 0.12)
        
        projectilesRef.current.push({
            x: player.x + Math.cos(angleRad) * BARREL_LENGTH,
            y: player.y - TANK_HEIGHT/2 - Math.sin(angleRad) * BARREL_LENGTH,
            vx: Math.cos(angleRad) * speed,
            vy: -Math.sin(angleRad) * speed,
            active: true,
            ownerId: "player",
            type: player.selectedWeapon
        })

        if (player.selectedWeapon !== "small_shell") {
            setPlayer(p => p ? {...p, weapons: {...p.weapons, [p.selectedWeapon]: p.weapons[p.selectedWeapon] - 1}} : null)
        }
        
        lastShotOwnerRef.current = "player"
        setPhase("firing")
    }, [phase, player])

    const enemyTurn = useCallback(() => {
        if (!enemy || !player) return
        setPhase("enemy_turn")
        
        setTimeout(() => {
            const shot = calculateAIShot(enemy.x, enemy.y, player.x, player.y, wind)
            setEnemy(e => e ? {...e, angle: shot.angle, power: shot.power} : null)
            
            setTimeout(() => {
                const angleRad = shot.angle * Math.PI / 180
                const speed = shot.power * 0.12
                projectilesRef.current.push({
                    x: enemy.x - Math.cos(angleRad) * BARREL_LENGTH,
                    y: enemy.y - TANK_HEIGHT/2 - Math.sin(angleRad) * BARREL_LENGTH,
                    vx: -Math.cos(angleRad) * speed,
                    vy: -Math.sin(angleRad) * speed,
                    active: true,
                    ownerId: "enemy",
                    type: "small_shell"
                })
                lastShotOwnerRef.current = "enemy"
                setPhase("firing")
            }, 600)
        }, 1000)
    }, [enemy, player, wind])

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        const update = () => {
            // 1. CLEAR & DRAW TERRAIN
            ctx.fillStyle = "#87CEEB" // sky
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
            
            if (terrain.length > 0) {
                ctx.fillStyle = COLORS.terrain
                ctx.beginPath()
                ctx.moveTo(0, CANVAS_HEIGHT)
                terrain.forEach((y, i) => ctx.lineTo(i * TERRAIN_RESOLUTION, y))
                ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT)
                ctx.fill()
            }

            // 2. TANK FALLING LOGIC
            const updateTankFalling = (tank: Tank, setter: React.Dispatch<React.SetStateAction<Tank | null>>) => {
                const tY = getTerrainHeight(terrain, tank.x, TERRAIN_RESOLUTION)
                if (tank.y < tY - 1) {
                    setter(t => t ? {...t, y: t.y + 2, isFalling: true} : null)
                } else {
                    setter(t => t ? {...t, y: tY, isFalling: false} : null)
                }
            }
            if (player) updateTankFalling(player, setPlayer)
            if (enemy) updateTankFalling(enemy, setEnemy)

            // 3. DRAW TANKS
            const drawTank = (tank: Tank) => {
                ctx.save()
                ctx.translate(tank.x, tank.y - TANK_HEIGHT / 2)
                
                // Parachute
                if (tank.isFalling) {
                    ctx.strokeStyle = "#fff"
                    ctx.beginPath()
                    ctx.moveTo(0, -TANK_HEIGHT)
                    ctx.lineTo(-20, -50); ctx.moveTo(0, -TANK_HEIGHT); ctx.lineTo(20, -50)
                    ctx.stroke()
                    ctx.fillStyle = "rgba(255,255,255,0.8)"
                    ctx.beginPath(); ctx.arc(0, -55, 25, Math.PI, 0); ctx.fill()
                }

                ctx.fillStyle = tank.color
                ctx.fillRect(-TANK_WIDTH / 2, -TANK_HEIGHT / 2, TANK_WIDTH, TANK_HEIGHT)
                
                // Barrel
                const angleRad = tank.angle * Math.PI / 180
                const dir = tank.isPlayer ? 1 : -1
                ctx.strokeStyle = "#333"; ctx.lineWidth = 4
                ctx.beginPath()
                ctx.moveTo(0, -TANK_HEIGHT / 4)
                ctx.lineTo(Math.cos(angleRad) * BARREL_LENGTH * dir, -TANK_HEIGHT/4 - Math.sin(angleRad) * BARREL_LENGTH)
                ctx.stroke()
                ctx.restore()

                // HUD over tank
                ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.textAlign = "center"
                ctx.fillText(`HP: ${tank.hp}/${tank.maxHp}`, tank.x, tank.y - TANK_HEIGHT - 10)
                // HP Bar
                ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(tank.x - 15, tank.y - TANK_HEIGHT - 8, 30, 4)
                ctx.fillStyle = "#0f0"; ctx.fillRect(tank.x - 15, tank.y - TANK_HEIGHT - 8, (tank.hp/tank.maxHp) * 30, 4)
            }
            if (player) drawTank(player)
            if (enemy) drawTank(enemy)

            // 4. PROJECTILES
            if (phase === "firing") {
                projectilesRef.current.forEach((p, idx) => {
                    if (!p.active) return
                    const oldX = p.x, oldY = p.y
                    const updated = updateProjectile(p.x, p.y, p.vx, p.vy, wind)
                    p.x = updated.x; p.y = updated.y; p.vx = updated.vx; p.vy = updated.vy

                    // MIRV Splitting
                    if (p.type === "mirv" && !p.isChild && p.vy > 0 && p.y < 200) {
                        p.active = false
                        for (let i = -1; i <= 1; i++) {
                            projectilesRef.current.push({
                                ...p, vx: p.vx + i, vy: p.vy + 1, active: true, isChild: true
                            })
                        }
                    }

                    // Collision
                    let hit = false
                    if (checkTerrainCollision(oldX, oldY, p.x, p.y, terrain, TERRAIN_RESOLUTION)) hit = true
                    if (player && checkTankCollision(p.x, p.y, player.x, player.y, TANK_WIDTH, TANK_HEIGHT)) {
                        hit = true; setPlayer(t => t ? {...t, hp: Math.max(0, t.hp - WEAPON_DATA[p.type].damage)} : null)
                    }
                    if (enemy && checkTankCollision(p.x, p.y, enemy.x, enemy.y, TANK_WIDTH, TANK_HEIGHT)) {
                        hit = true; setEnemy(t => t ? {...t, hp: Math.max(0, t.hp - WEAPON_DATA[p.type].damage)} : null)
                    }
                    if (p.x < 0 || p.x > CANVAS_WIDTH) hit = true

                    if (hit) {
                        p.active = false
                        const data = WEAPON_DATA[p.type]
                        explosionsRef.current.push({
                            x: p.x, y: Math.min(p.y, getTerrainHeight(terrain, p.x, TERRAIN_RESOLUTION)),
                            radius: 0, maxRadius: data.radius, frame: 0, maxFrames: 25
                        })
                        setTerrain(t => destroyTerrain(t, p.x, TERRAIN_RESOLUTION, data.radius))
                    }

                    // Draw
                    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI*2); ctx.fill()
                })

                if (projectilesRef.current.every(p => !p.active)) {
                    setPhase("explosion")
                }
            }

            // 5. EXPLOSIONS
            if (phase === "explosion") {
                explosionsRef.current.forEach(exp => {
                    if (exp.frame >= exp.maxFrames) return
                    exp.frame++
                    exp.radius = (exp.frame / exp.maxFrames) * exp.maxRadius
                    const alpha = 1 - (exp.frame / exp.maxFrames)
                    ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`; ctx.beginPath(); ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI*2); ctx.fill()
                })

                if (explosionsRef.current.every(e => e.frame >= e.maxFrames)) {
                    // Turn switch
                    if (player?.hp <= 0) setPhase("game_over")
                    else if (enemy?.hp <= 0) setPhase("victory")
                    else {
                        if (lastShotOwnerRef.current === "player") enemyTurn()
                        else setPhase("aiming")
                    }
                    projectilesRef.current = []
                    explosionsRef.current = []
                }
            }

            // 6. HUD
            ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(10, 10, 150, 80)
            ctx.fillStyle = "#fff"; ctx.font = "12px Arial"; ctx.textAlign = "left"
            ctx.fillText(`Round: ${round}`, 20, 30)
            ctx.fillText(`Wind: ${wind > 0 ? "→" : "←"} ${Math.abs(wind).toFixed(1)}`, 20, 50)
            if (player) {
                ctx.fillText(`Weapon: ${WEAPON_DATA[player.selectedWeapon].name}`, 20, 70)
                ctx.fillStyle = "#444"; ctx.fillRect(20, 75, 100, 5)
                ctx.fillStyle = "#0af"; ctx.fillRect(20, 75, (player.fuel/MAX_FUEL) * 100, 5)
            }

            animationRef.current = requestAnimationFrame(update)
        }
        animationRef.current = requestAnimationFrame(update)
        return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
    }, [terrain, player, enemy, phase, wind, enemyTurn])

    return (
        <div className="relative w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-4 gap-4 overflow-hidden font-sans">
            <div className="relative w-full max-w-[900px] aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-neutral-800">
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block touch-none" style={{ imageRendering: 'pixelated' }} />
                
                {/* Overlays */}
                {phase === "victory" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        <h1 className="text-5xl font-black text-green-400 mb-2 drop-shadow-lg">VICTORY</h1>
                        <p className="text-white mb-6">You destroyed the enemy tank!</p>
                        <Button onClick={() => initGame(true)} size="lg" className="bg-green-600 hover:bg-green-500">Next Round</Button>
                    </div>
                )}
                
                {phase === "game_over" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        <h1 className="text-5xl font-black text-red-500 mb-2 drop-shadow-lg">DEFEAT</h1>
                        <p className="text-white mb-6">Your tank was destroyed.</p>
                        <Button onClick={() => initGame(false)} size="lg" className="bg-red-600 hover:bg-red-500">Try Again</Button>
                    </div>
                )}

                {phase === "enemy_turn" && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold animate-pulse shadow-lg z-40 border-2 border-white/20">
                        ENEMY TURN
                    </div>
                )}
            </div>

            {/* Controls & UI */}
            <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stats Panel */}
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm font-bold text-white/60 uppercase tracking-tighter">
                        <span>Angle</span>
                        <span className="text-white text-lg">{player?.angle}°</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-white/60 uppercase tracking-tighter">
                        <span>Power</span>
                        <span className="text-white text-lg">{player?.power}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-white/60 uppercase tracking-tighter">
                        <span>Fuel</span>
                        <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{width: `${(player?.fuel || 0)}%`}} />
                        </div>
                    </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-2">
                    <div className="grid grid-cols-3 gap-2">
                        <div />
                        <Button variant="secondary" className="h-12 w-12 rounded-lg" onTouchStart={() => setPlayer(p => p ? {...p, power: Math.min(100, p.power+5)} : null)}><ArrowUp /></Button>
                        <div />
                        <Button variant="secondary" className="h-12 w-12 rounded-lg" onTouchStart={() => {
                            if (phase !== "aiming" || !player || player.fuel <= 0) return
                            const newX = Math.max(TANK_WIDTH/2, player.x - MOVE_SPEED)
                            setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                        }}><ArrowLeft /></Button>
                        <Button variant="secondary" className="h-12 w-12 rounded-lg" onTouchStart={() => setPlayer(p => p ? {...p, power: Math.max(0, p.power-5)} : null)}><ArrowDown /></Button>
                        <Button variant="secondary" className="h-12 w-12 rounded-lg" onTouchStart={() => {
                            if (phase !== "aiming" || !player || player.fuel <= 0) return
                            const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, player.x + MOVE_SPEED)
                            setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                        }}><ArrowRight /></Button>
                    </div>
                    <Button 
                        size="lg" 
                        className="h-24 w-24 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] border-4 border-white/20 font-black text-xl"
                        onClick={fireProjectile}
                        disabled={phase !== "aiming"}
                    >FIRE</Button>
                </div>

                {/* Weapons Panel */}
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-2">
                    {(Object.keys(WEAPON_DATA) as WeaponType[]).map(w => (
                        <Button 
                            key={w}
                            variant={player?.selectedWeapon === w ? "default" : "secondary"}
                            className={`h-10 text-[10px] sm:text-xs flex justify-between items-center px-2 ${player?.selectedWeapon === w ? "bg-blue-600" : ""}`}
                            onClick={() => setPlayer(p => p ? {...p, selectedWeapon: w} : null)}
                        >
                            <span className="truncate">{WEAPON_DATA[w].name}</span>
                            <span className="opacity-50 font-mono ml-1">{player?.weapons[w] === 100 ? "∞" : player?.weapons[w]}</span>
                        </Button>
                    ))}
                </div>
            </div>

            <Link to="/games" className="text-white/20 hover:text-white/60 text-xs transition-colors mt-4">
                ← BACK TO GAMES PORTAL
            </Link>
        </div>
    )
}
