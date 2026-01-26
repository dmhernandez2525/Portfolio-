import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, Users, Bot } from "lucide-react"

import type { Tank, Projectile, Explosion, GamePhase, WeaponType } from "./types"
import {
    CANVAS_WIDTH, CANVAS_HEIGHT, COLORS,
    TANK_WIDTH, TANK_HEIGHT, BARREL_LENGTH,
    MAX_POWER, MIN_POWER, POWER_STEP, ANGLE_STEP,
    MOVE_SPEED, PROJECTILE_RADIUS,
    TERRAIN_RESOLUTION, WIND_MAX,
    MAX_FUEL, FUEL_CONSUMPTION, WEAPON_DATA
} from "./constants"
import {
    generateTerrain, getTerrainHeight, updateProjectile,
    checkTerrainCollision, destroyTerrain, checkTankCollision,
    calculateAIShot
} from "./physics"

type GameMode = "menu" | "vs_ai" | "vs_player"
type ActivePlayer = "player1" | "player2"

export function TanksGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hasInitializedRef = useRef(false)

    // Game mode
    const [gameMode, setGameMode] = useState<GameMode>("menu")

    // Game state
    const [phase, setPhase] = useState<GamePhase>("aiming")
    const [terrain, setTerrain] = useState<number[]>([])
    const [wind, setWind] = useState(0)
    const [round, setRound] = useState(1)

    // For multiplayer: whose turn is it
    const [activePlayer, setActivePlayer] = useState<ActivePlayer>("player1")

    // Tank state (player = player1, enemy = player2 or AI)
    const [player, setPlayer] = useState<Tank | null>(null)
    const [enemy, setEnemy] = useState<Tank | null>(null)

    // Scores for multiplayer
    const [scores, setScores] = useState({ player1: 0, player2: 0 })

    // Projectile state
    const projectilesRef = useRef<Projectile[]>([])
    const explosionsRef = useRef<Explosion[]>([])

    // Refs for synchronization
    const lastShotOwnerRef = useRef<string | null>(null)
    const animationRef = useRef<number | null>(null)
    
    // Initialize game or next round
    const initGame = useCallback((isNextRound: boolean = false, mode: GameMode = gameMode) => {
        const newTerrain = generateTerrain(CANVAS_WIDTH, TERRAIN_RESOLUTION)
        setTerrain(newTerrain)
        setWind((Math.random() - 0.5) * WIND_MAX * 2)

        const playerX = 80 + Math.random() * 60
        const enemyX = CANVAS_WIDTH - 80 - Math.random() * 60

        const isMultiplayer = mode === "vs_player"

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
            if (!isNextRound) {
                setScores({ player1: 0, player2: 0 })
            }
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

        // Player 2 or AI enemy
        const enemyHp = isMultiplayer ? 10 : 8 + round * 2
        setEnemy({
            id: "enemy",
            x: enemyX,
            y: getTerrainHeight(newTerrain, enemyX, TERRAIN_RESOLUTION),
            angle: 135,
            power: 50,
            hp: enemyHp,
            maxHp: enemyHp,
            fuel: MAX_FUEL,
            maxFuel: MAX_FUEL,
            weapons: { small_shell: 100, large_shell: isMultiplayer ? 5 : 10, mirv: isMultiplayer ? 3 : 5, atomic: isMultiplayer ? 1 : 2 },
            selectedWeapon: "small_shell",
            isPlayer: isMultiplayer, // In multiplayer, player2 is also human controlled
            color: COLORS.enemy,
            isFalling: false
        })

        setActivePlayer("player1")
        setPhase("aiming")
        projectilesRef.current = []
        explosionsRef.current = []
    }, [gameMode, player, round])
    
    // Start game when mode is selected
    const startGame = useCallback((mode: GameMode) => {
        setGameMode(mode)
        hasInitializedRef.current = true
        initGame(false, mode)
    }, [initGame])

    const fireProjectile = useCallback((shooter: "player1" | "player2" = "player1") => {
        if (phase !== "aiming") return

        const isPlayer1 = shooter === "player1"
        const tank = isPlayer1 ? player : enemy
        const setTank = isPlayer1 ? setPlayer : setEnemy

        if (!tank) return
        const weapon = tank.weapons[tank.selectedWeapon]
        if (weapon <= 0 && tank.selectedWeapon !== "small_shell") return

        const angleRad = tank.angle * Math.PI / 180
        const speed = (tank.power * 0.12)
        const dir = isPlayer1 ? 1 : -1

        projectilesRef.current.push({
            x: tank.x + Math.cos(angleRad) * BARREL_LENGTH * dir,
            y: tank.y - TANK_HEIGHT/2 - Math.sin(angleRad) * BARREL_LENGTH,
            vx: Math.cos(angleRad) * speed * dir,
            vy: -Math.sin(angleRad) * speed,
            active: true,
            ownerId: isPlayer1 ? "player" : "enemy",
            type: tank.selectedWeapon
        })

        if (tank.selectedWeapon !== "small_shell") {
            setTank(p => p ? {...p, weapons: {...p.weapons, [p.selectedWeapon]: p.weapons[p.selectedWeapon] - 1}} : null)
        }

        lastShotOwnerRef.current = isPlayer1 ? "player" : "enemy"
        setPhase("firing")
    }, [phase, player, enemy])

    // Input Handling - supports both single player and multiplayer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== "aiming" || gameMode === "menu") return
            const key = e.key.toLowerCase()

            const isMultiplayer = gameMode === "vs_player"
            const isPlayer1Turn = activePlayer === "player1"

            // In multiplayer, only the active player can control
            // Player 1: WASD + Q/E for angle + Space to fire
            // Player 2: Arrow keys + ,/. for angle + Enter to fire

            if (isMultiplayer) {
                if (isPlayer1Turn && player) {
                    // Player 1 controls (WASD + Q/E)
                    if (key === "q") setPlayer(p => p ? {...p, angle: Math.min(180, p.angle + ANGLE_STEP)} : null)
                    if (key === "e") setPlayer(p => p ? {...p, angle: Math.max(0, p.angle - ANGLE_STEP)} : null)
                    if (key === "w") setPlayer(p => p ? {...p, power: Math.min(MAX_POWER, p.power + POWER_STEP)} : null)
                    if (key === "s") setPlayer(p => p ? {...p, power: Math.max(MIN_POWER, p.power - POWER_STEP)} : null)
                    if (key === "a" && player.fuel > 0) {
                        const newX = Math.max(TANK_WIDTH/2, player.x - MOVE_SPEED)
                        setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                    }
                    if (key === "d" && player.fuel > 0) {
                        const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, player.x + MOVE_SPEED)
                        setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                    }
                    if (key === "1") setPlayer(p => p ? {...p, selectedWeapon: "small_shell"} : null)
                    if (key === "2") setPlayer(p => p ? {...p, selectedWeapon: "large_shell"} : null)
                    if (key === "3") setPlayer(p => p ? {...p, selectedWeapon: "mirv"} : null)
                    if (key === "4") setPlayer(p => p ? {...p, selectedWeapon: "atomic"} : null)
                    if (key === " ") { e.preventDefault(); fireProjectile("player1") }
                } else if (!isPlayer1Turn && enemy) {
                    // Player 2 controls: ,/. for angle, Up/Down arrows for power, Left/Right arrows for move
                    if (key === ",") setEnemy(p => p ? {...p, angle: Math.min(180, p.angle + ANGLE_STEP)} : null)
                    if (key === ".") setEnemy(p => p ? {...p, angle: Math.max(0, p.angle - ANGLE_STEP)} : null)
                    if (e.key === "ArrowUp") setEnemy(p => p ? {...p, power: Math.min(MAX_POWER, p.power + POWER_STEP)} : null)
                    if (e.key === "ArrowDown") setEnemy(p => p ? {...p, power: Math.max(MIN_POWER, p.power - POWER_STEP)} : null)
                    if (e.key === "ArrowLeft" && enemy.fuel > 0) {
                        const newX = Math.max(TANK_WIDTH/2, enemy.x - MOVE_SPEED)
                        setEnemy(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                    }
                    if (e.key === "ArrowRight" && enemy.fuel > 0) {
                        const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, enemy.x + MOVE_SPEED)
                        setEnemy(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                    }
                    if (key === "7") setEnemy(p => p ? {...p, selectedWeapon: "small_shell"} : null)
                    if (key === "8") setEnemy(p => p ? {...p, selectedWeapon: "large_shell"} : null)
                    if (key === "9") setEnemy(p => p ? {...p, selectedWeapon: "mirv"} : null)
                    if (key === "0") setEnemy(p => p ? {...p, selectedWeapon: "atomic"} : null)
                    if (key === "enter") { e.preventDefault(); fireProjectile("player2") }
                }
            } else {
                // Single player mode (vs AI) - original controls
                if (!player) return
                if (e.key === "ArrowLeft") setPlayer(p => p ? {...p, angle: Math.min(180, p.angle + ANGLE_STEP)} : null)
                if (e.key === "ArrowRight") setPlayer(p => p ? {...p, angle: Math.max(0, p.angle - ANGLE_STEP)} : null)
                if (key === "w") setPlayer(p => p ? {...p, power: Math.min(MAX_POWER, p.power + POWER_STEP)} : null)
                if (key === "s") setPlayer(p => p ? {...p, power: Math.max(MIN_POWER, p.power - POWER_STEP)} : null)
                if (key === "a" && player.fuel > 0) {
                    const newX = Math.max(TANK_WIDTH/2, player.x - MOVE_SPEED)
                    setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                }
                if (key === "d" && player.fuel > 0) {
                    const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, player.x + MOVE_SPEED)
                    setPlayer(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                }
                if (key === "1") setPlayer(p => p ? {...p, selectedWeapon: "small_shell"} : null)
                if (key === "2") setPlayer(p => p ? {...p, selectedWeapon: "large_shell"} : null)
                if (key === "3") setPlayer(p => p ? {...p, selectedWeapon: "mirv"} : null)
                if (key === "4") setPlayer(p => p ? {...p, selectedWeapon: "atomic"} : null)
                if (key === " " || key === "enter") { e.preventDefault(); fireProjectile("player1") }
            }
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [phase, player, enemy, terrain, fireProjectile, gameMode, activePlayer])



    const enemyTurn = useCallback(() => {
        if (!enemy || !player) return

        // In multiplayer mode, switch to player 2
        if (gameMode === "vs_player") {
            setActivePlayer("player2")
            setPhase("aiming")
            return
        }

        // AI mode - enemy takes automated shot
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
    }, [enemy, player, wind, gameMode])


    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx || gameMode === "menu") return

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
                projectilesRef.current.forEach((p) => {
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
                    // Turn switch - handle multiplayer scoring
                    if (player && player.hp <= 0) {
                        if (gameMode === "vs_player") {
                            setScores(s => ({ ...s, player2: s.player2 + 1 }))
                        }
                        setPhase("game_over")
                    } else if (enemy && enemy.hp <= 0) {
                        if (gameMode === "vs_player") {
                            setScores(s => ({ ...s, player1: s.player1 + 1 }))
                        }
                        setPhase("victory")
                    } else {
                        // Switch turns
                        if (gameMode === "vs_player") {
                            setActivePlayer(prev => prev === "player1" ? "player2" : "player1")
                            setPhase("aiming")
                        } else {
                            if (lastShotOwnerRef.current === "player") enemyTurn()
                            else setPhase("aiming")
                        }
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
    }, [terrain, player, enemy, phase, wind, enemyTurn, round, gameMode, scores])

    return (
        <div className="relative w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-4 gap-4 overflow-hidden font-sans">
            {/* Main Menu */}
            {gameMode === "menu" && (
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 to-neutral-950 flex flex-col items-center justify-center z-50">
                    <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg tracking-tighter">ARTILLERY</h1>
                    <p className="text-neutral-400 mb-8">Classic Tank Battle Game</p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => startGame("vs_ai")} size="lg" className="bg-blue-600 hover:bg-blue-500 gap-3 px-8 py-6 text-lg">
                            <Bot className="h-6 w-6" /> Single Player (vs AI)
                        </Button>
                        <Button onClick={() => startGame("vs_player")} size="lg" className="bg-green-600 hover:bg-green-500 gap-3 px-8 py-6 text-lg">
                            <Users className="h-6 w-6" /> Local Multiplayer (2P)
                        </Button>
                    </div>
                    <div className="mt-8 text-neutral-500 text-sm text-center max-w-md">
                        <p className="mb-2">Aim your cannon and destroy the enemy!</p>
                        <p>Arrow keys to aim • W/S for power • A/D to move • Space to fire</p>
                    </div>
                    <Link to="/games" className="text-white/20 hover:text-white/60 text-xs transition-colors mt-8">
                        ← BACK TO GAMES PORTAL
                    </Link>
                </div>
            )}

            <div className="relative w-full max-w-[900px] aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-neutral-800">
                <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block touch-none" style={{ imageRendering: 'pixelated' }} />

                {/* Multiplayer score display */}
                {gameMode === "vs_player" && phase !== "victory" && phase !== "game_over" && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-2 rounded-full z-40 flex items-center gap-4">
                        <span className="text-blue-400 font-bold">P1: {scores.player1}</span>
                        <span className="text-white/50">|</span>
                        <span className="text-red-400 font-bold">P2: {scores.player2}</span>
                    </div>
                )}

                {/* Turn indicator for multiplayer */}
                {gameMode === "vs_player" && phase === "aiming" && (
                    <div className={`absolute top-12 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-bold z-40 border-2 ${
                        activePlayer === "player1"
                            ? "bg-blue-600/80 text-white border-blue-400"
                            : "bg-red-600/80 text-white border-red-400"
                    }`}>
                        {activePlayer === "player1" ? "PLAYER 1's TURN" : "PLAYER 2's TURN"}
                    </div>
                )}

                {/* Overlays */}
                {phase === "victory" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        <h1 className="text-5xl font-black text-green-400 mb-2 drop-shadow-lg">
                            {gameMode === "vs_player" ? "PLAYER 1 WINS!" : "VICTORY"}
                        </h1>
                        <p className="text-white mb-2">
                            {gameMode === "vs_player" ? "Player 2's tank was destroyed!" : "You destroyed the enemy tank!"}
                        </p>
                        {gameMode === "vs_player" && (
                            <p className="text-neutral-400 mb-4">Score: P1 {scores.player1 + 1} - P2 {scores.player2}</p>
                        )}
                        <div className="flex gap-3">
                            <Button onClick={() => initGame(true)} size="lg" className="bg-green-600 hover:bg-green-500">Next Round</Button>
                            <Button onClick={() => setGameMode("menu")} size="lg" variant="outline" className="border-white/20">Main Menu</Button>
                        </div>
                    </div>
                )}

                {phase === "game_over" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        <h1 className="text-5xl font-black text-red-500 mb-2 drop-shadow-lg">
                            {gameMode === "vs_player" ? "PLAYER 2 WINS!" : "DEFEAT"}
                        </h1>
                        <p className="text-white mb-2">
                            {gameMode === "vs_player" ? "Player 1's tank was destroyed!" : "Your tank was destroyed."}
                        </p>
                        {gameMode === "vs_player" && (
                            <p className="text-neutral-400 mb-4">Score: P1 {scores.player1} - P2 {scores.player2 + 1}</p>
                        )}
                        <div className="flex gap-3">
                            <Button onClick={() => initGame(false)} size="lg" className="bg-red-600 hover:bg-red-500">
                                {gameMode === "vs_player" ? "Rematch" : "Try Again"}
                            </Button>
                            <Button onClick={() => setGameMode("menu")} size="lg" variant="outline" className="border-white/20">Main Menu</Button>
                        </div>
                    </div>
                )}

                {phase === "enemy_turn" && gameMode === "vs_ai" && (
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold animate-pulse shadow-lg z-40 border-2 border-white/20">
                        ENEMY TURN
                    </div>
                )}
            </div>

            {/* Controls & UI - Only show when game is active */}
            {gameMode !== "menu" && (
                <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stats Panel - Show active player's stats in multiplayer */}
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                        {gameMode === "vs_player" && (
                            <div className={`text-center font-bold mb-2 pb-2 border-b border-white/10 ${activePlayer === "player1" ? "text-blue-400" : "text-red-400"}`}>
                                {activePlayer === "player1" ? "Player 1" : "Player 2"}
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm font-bold text-white/60 uppercase tracking-tighter">
                            <span>Angle</span>
                            <span className="text-white text-lg">
                                {(activePlayer === "player1" ? player?.angle : enemy?.angle) || 0}°
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-white/60 uppercase tracking-tighter">
                            <span>Power</span>
                            <span className="text-white text-lg">
                                {(activePlayer === "player1" ? player?.power : enemy?.power) || 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-white/60 uppercase tracking-tighter">
                            <span>Fuel</span>
                            <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: `${(activePlayer === "player1" ? player?.fuel : enemy?.fuel) || 0}%`}} />
                            </div>
                        </div>
                    </div>

                    {/* Main Controls */}
                    <div className="flex items-center justify-center gap-4">
                        {/* Angle controls */}
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="secondary"
                                className="h-12 w-12 rounded-lg"
                                onClick={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, angle: Math.min(180, p.angle + ANGLE_STEP * 3)} : null)
                                }}
                                onTouchStart={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, angle: Math.min(180, p.angle + ANGLE_STEP * 3)} : null)
                                }}
                            >
                                <RotateCcw className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-12 w-12 rounded-lg"
                                onClick={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, angle: Math.max(0, p.angle - ANGLE_STEP * 3)} : null)
                                }}
                                onTouchStart={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, angle: Math.max(0, p.angle - ANGLE_STEP * 3)} : null)
                                }}
                            >
                                <RotateCw className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* D-pad style controls */}
                        <div className="grid grid-cols-3 gap-1">
                            <div />
                            <Button
                                variant="secondary"
                                className="h-10 w-10 rounded-lg"
                                onClick={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, power: Math.min(100, p.power + 5)} : null)
                                }}
                                onTouchStart={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, power: Math.min(100, p.power + 5)} : null)
                                }}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <div />
                            <Button
                                variant="secondary"
                                className="h-10 w-10 rounded-lg"
                                onClick={() => {
                                    if (phase !== "aiming") return
                                    const tank = activePlayer === "player1" ? player : enemy
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    if (!tank || tank.fuel <= 0) return
                                    const newX = Math.max(TANK_WIDTH/2, tank.x - MOVE_SPEED)
                                    setTank(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                                }}
                                onTouchStart={() => {
                                    if (phase !== "aiming") return
                                    const tank = activePlayer === "player1" ? player : enemy
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    if (!tank || tank.fuel <= 0) return
                                    const newX = Math.max(TANK_WIDTH/2, tank.x - MOVE_SPEED)
                                    setTank(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                                }}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-10 w-10 rounded-lg"
                                onClick={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, power: Math.max(0, p.power - 5)} : null)
                                }}
                                onTouchStart={() => {
                                    if (phase !== "aiming") return
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    setTank(p => p ? {...p, power: Math.max(0, p.power - 5)} : null)
                                }}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-10 w-10 rounded-lg"
                                onClick={() => {
                                    if (phase !== "aiming") return
                                    const tank = activePlayer === "player1" ? player : enemy
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    if (!tank || tank.fuel <= 0) return
                                    const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, tank.x + MOVE_SPEED)
                                    setTank(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                                }}
                                onTouchStart={() => {
                                    if (phase !== "aiming") return
                                    const tank = activePlayer === "player1" ? player : enemy
                                    const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                    if (!tank || tank.fuel <= 0) return
                                    const newX = Math.min(CANVAS_WIDTH - TANK_WIDTH/2, tank.x + MOVE_SPEED)
                                    setTank(p => p ? {...p, x: newX, y: getTerrainHeight(terrain, newX, TERRAIN_RESOLUTION), fuel: Math.max(0, p.fuel - FUEL_CONSUMPTION)} : null)
                                }}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Fire button */}
                        <Button
                            size="lg"
                            className={`h-20 w-20 rounded-full active:scale-90 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] border-4 border-white/20 font-black text-lg ${
                                activePlayer === "player1"
                                    ? "bg-blue-600 hover:bg-blue-500"
                                    : "bg-red-600 hover:bg-red-500"
                            }`}
                            onClick={() => fireProjectile(activePlayer)}
                            disabled={phase !== "aiming"}
                        >
                            FIRE
                        </Button>
                    </div>

                    {/* Weapons Panel */}
                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 grid grid-cols-2 gap-2">
                        {(Object.keys(WEAPON_DATA) as WeaponType[]).map(w => {
                            const tank = activePlayer === "player1" ? player : enemy
                            return (
                                <Button
                                    key={w}
                                    variant={tank?.selectedWeapon === w ? "default" : "secondary"}
                                    className={`h-10 text-[10px] sm:text-xs flex justify-between items-center px-2 ${tank?.selectedWeapon === w ? (activePlayer === "player1" ? "bg-blue-600" : "bg-red-600") : ""}`}
                                    onClick={() => {
                                        const setTank = activePlayer === "player1" ? setPlayer : setEnemy
                                        setTank(p => p ? {...p, selectedWeapon: w} : null)
                                    }}
                                >
                                    <span className="truncate">{WEAPON_DATA[w].name}</span>
                                    <span className="opacity-50 font-mono ml-1">{tank?.weapons[w] === 100 ? "∞" : tank?.weapons[w]}</span>
                                </Button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Multiplayer controls help */}
            {gameMode === "vs_player" && phase === "aiming" && (
                <div className="w-full max-w-[900px] text-center text-neutral-500 text-xs">
                    <span className="text-blue-400">P1:</span> A/D move, W/S power, Q/E aim, 1-4 weapons, Space fire •
                    <span className="text-red-400 ml-2">P2:</span> ←/→ move, ↑/↓ power, ,/. aim, 7-0 weapons, Enter fire
                </div>
            )}

            {gameMode !== "menu" && (
                <Link to="/games" className="text-white/20 hover:text-white/60 text-xs transition-colors mt-4">
                    ← BACK TO GAMES PORTAL
                </Link>
            )}
        </div>
    )
}
