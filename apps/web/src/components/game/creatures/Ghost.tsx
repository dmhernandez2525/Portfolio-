import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type PanInfo } from "framer-motion"
import { Ghost as GhostIcon } from "lucide-react"
import { useGamification } from "@/hooks/use-gamification"
import { useBoss } from "@/context/boss-context"

interface GhostProps {
    id: number
    x: number
    y: number
    onCatch: (id: number, killed?: boolean) => void
}

// Boss dialogue lines
const BOSS_TAUNTS = [
    "You dare challenge me?!",
    "Feel my wrath!",
    "This site belongs to me now!",
    "You cannot defeat a ghost!"
]

const DEATH_QUOTES = [
    "Impossible... defeated by a mortal...",
    "I'll be back... someday...",
    "Nooooooo!",
    "You win this time..."
]

export function Ghost({ id, x, y, onCatch }: GhostProps) {
    const [scale, setScale] = useState(1)
    const [isEnraged, setIsEnraged] = useState(false)
    const [health, setHealth] = useState(5)
    const [dialogue, setDialogue] = useState<string | null>(null)
    const [shakeProgress, setShakeProgress] = useState(0)
    const [isKilling, setIsKilling] = useState(false)
    const { damageSite } = useGamification()
    const { setBossEnraged } = useBoss()

    // Use refs for high-frequency tracking
    const shakeStateRef = useRef({
        count: 0,
        lastX: 0,
        lastDirection: 0,
        lastTime: 0
    })
    const clickDebounceRef = useRef(false)

    // Show boss taunt when enraged
    const showTaunt = useCallback(() => {
        const taunt = BOSS_TAUNTS[Math.floor(Math.random() * BOSS_TAUNTS.length)]
        setDialogue(taunt)
        setTimeout(() => setDialogue(null), 2500)
    }, [])

    // Damage Site Logic
    useEffect(() => {
        if (!isEnraged) return;

        const interval = setInterval(() => {
            damageSite(5)
            setScale(prev => prev === 4 ? 3.8 : 4)
        }, 2000)

        return () => clearInterval(interval)
    }, [isEnraged, damageSite])

    // Reset drag state when drag ends
    const handleDragEnd = () => {
        shakeStateRef.current.lastX = 0
    }

    // Drag/Shake Logic - improved detection
    const handleDrag = (_: unknown, info: PanInfo) => {
        const currentX = info.point.x
        const now = Date.now()

        if (shakeStateRef.current.lastX === 0) {
            shakeStateRef.current.lastX = currentX
            shakeStateRef.current.lastTime = now
            return
        }

        const deltaX = currentX - shakeStateRef.current.lastX
        const timeDelta = now - shakeStateRef.current.lastTime
        const currentDirection = deltaX > 0 ? 1 : -1

        // More lenient shake detection: lower deltaX threshold (2px), lower time threshold (30ms)
        // This makes shake detection more responsive while still filtering out noise
        if (currentDirection !== shakeStateRef.current.lastDirection && Math.abs(deltaX) > 2 && timeDelta > 30 && timeDelta < 500) {
             shakeStateRef.current.count += 1
             shakeStateRef.current.lastDirection = currentDirection
             shakeStateRef.current.lastTime = now

             if (!isEnraged) {
                 setShakeProgress(Math.min(4, shakeStateRef.current.count))
                 setScale(prev => Math.min(1.8, prev + 0.2))
             }
        }

        // Reset shake count if user pauses too long (800ms) - prevents partial shakes from accumulating
        if (timeDelta > 800 && shakeStateRef.current.count < 4) {
            shakeStateRef.current.count = 0
            if (!isEnraged) {
                setShakeProgress(0)
                setScale(1)
            }
        }

        shakeStateRef.current.lastX = currentX

        if (shakeStateRef.current.count >= 4 && !isEnraged) {
            setIsEnraged(true)
            setBossEnraged(true)
            setScale(4)
            setShakeProgress(0)
            shakeStateRef.current.count = 0
            showTaunt()
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (clickDebounceRef.current || isKilling) return
        clickDebounceRef.current = true
        setTimeout(() => { clickDebounceRef.current = false }, 150)

        if (isEnraged) {
            const newHealth = health - 1
            setHealth(newHealth)

            if (newHealth <= 0) {
                setIsKilling(true)
                setBossEnraged(false)

                const deathQuote = DEATH_QUOTES[Math.floor(Math.random() * DEATH_QUOTES.length)]
                setDialogue(deathQuote)

                setTimeout(() => {
                    onCatch(id, true)
                }, 1500)
            } else {
                setScale(prev => prev * 0.9)
                setTimeout(() => setScale(4), 100)
            }
        } else {
             if (shakeStateRef.current.count > 2) return
             onCatch(id, false)
        }
    }

    return (
        <motion.div
            className={`absolute pointer-events-auto p-4 z-50`}
            style={{
                left: `${x}vw`,
                top: `${y}vh`,
                touchAction: "none",
                cursor: isEnraged ? "url('/sword-cursor.svg') 2 2, crosshair" : "grab"
            }}
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            dragElastic={0.8}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: isEnraged ? 4.1 : 1.3 }}
            onClick={handleClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isKilling ? [1, 0.8, 0.5, 0] : 1,
                scale: isKilling ? [4, 5, 6, 0] : (isEnraged ? [3.8, 4.0, 3.8] : scale),
                rotate: isKilling ? [0, 180, 360, 720] : 0,
                filter: isKilling ? "blur(8px)" : "blur(0px)",
            }}
            exit={{
                opacity: 0,
                scale: 0,
                rotate: 720,
                filter: "blur(10px)",
                transition: { duration: 0.8 }
            }}
            transition={{
                scale: { repeat: isEnraged && !isKilling ? Infinity : 0, duration: isKilling ? 1.5 : 0.5 },
                opacity: { duration: isKilling ? 1.5 : 0.3 },
                rotate: { duration: isKilling ? 1.5 : 0.3 },
                filter: { duration: isKilling ? 1.5 : 0.3 }
            }}
        >
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative group"
            >
                 {isEnraged ? (
                     <div className="relative">
                        <GhostIcon className="w-12 h-12 text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,1)]" />
                        <div className="absolute -top-4 -right-4 text-3xl animate-bounce">⚔️</div>
                        <div className="absolute -bottom-4 -left-4 w-[150%] h-2 bg-gray-900 rounded-full overflow-hidden border border-red-900">
                            <div className="h-full bg-red-600" style={{ width: `${(health / 5) * 100}%` }} />
                        </div>
                     </div>
                 ) : (
                     <GhostIcon className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(137,247,254,0.8)]" />
                 )}

                 {!isEnraged && <div className="absolute top-full left-1/2 -translate-x-1/2 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Shake me!</div>}

                 {!isEnraged && shakeProgress > 0 && (
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                         {[...Array(4)].map((_, i) => (
                             <div
                                 key={i}
                                 className={`w-2 h-2 rounded-full ${i < shakeProgress ? 'bg-red-500' : 'bg-gray-600'}`}
                             />
                         ))}
                     </div>
                 )}
            </motion.div>

            <AnimatePresence>
                {dialogue && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 border border-red-500 rounded-lg px-3 py-2 text-sm text-red-400 whitespace-nowrap z-[60] pointer-events-none"
                    >
                        {dialogue}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
