import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MonkeyProps {
    id: number
    x: number
    y: number
    onCatch: (id: number) => void
}

const MONKEY_REACTIONS = [
    { emoji: "🍌", message: "Ooh ooh!" },
    { emoji: "🙈", message: "Wheee!" },
    { emoji: "💫", message: "*flip*" },
]

export function Monkey({ id, x, y, onCatch }: MonkeyProps) {
    // Current absolute position on screen (vw/vh)
    const [posX, setPosX] = useState(x)
    const [posY, setPosY] = useState(y)
    
    // Animation state
    const [rotation, setRotation] = useState(0)
    const [swingAngle, setSwingAngle] = useState(0)
    const [isJumping, setIsJumping] = useState(false)
    const [isLooking, setIsLooking] = useState(false)
    const [facingRight, setFacingRight] = useState(true)
    
    // Click state
    const [reaction, setReaction] = useState<typeof MONKEY_REACTIONS[0] | null>(null)
    const clickCountRef = useRef(0)
    
    // Simulation state ref to avoid stale closures in interval
    const stateRef = useRef({
        x,
        y,
        rotation: 0,
        facingRight: true
    })

    // Main movement loop - like Bug's crawl
    useEffect(() => {
        let step = 0
        let phase: "swing" | "look" | "jump" | "land" = "swing"
        let targetX = stateRef.current.x
        let targetY = stateRef.current.y
        let startX = stateRef.current.x
        let startY = stateRef.current.y
        
        const moveInterval = setInterval(() => {
            step++
            
            // Phase 1: Swing (steps 1-30)
            if (phase === "swing" && step <= 30) {
                const swingProgress = step / 30
                setSwingAngle(Math.sin(swingProgress * Math.PI * 4) * 20)
                setIsJumping(false)
                setIsLooking(false)
                
                if (step === 30) {
                    phase = "look"
                    step = 0
                }
            }
            // Phase 2: Look around (steps 1-15)
            else if (phase === "look" && step <= 15) {
                setIsLooking(true)
                setSwingAngle(Math.sin(step / 15 * Math.PI) * 5)
                
                if (step === 15) {
                    // Pick new target
                    targetX = 15 + Math.random() * 70
                    targetY = 10 + Math.random() * 40
                    startX = stateRef.current.x
                    startY = stateRef.current.y
                    
                    const newFacingRight = targetX > stateRef.current.x
                    stateRef.current.facingRight = newFacingRight
                    setFacingRight(newFacingRight)
                    
                    phase = "jump"
                    step = 0
                }
            }
            // Phase 3: Jump with arc (steps 1-25)
            else if (phase === "jump" && step <= 25) {
                setIsJumping(true)
                setIsLooking(false)
                
                const jumpProgress = step / 25
                
                // Parabolic arc
                const arcHeight = Math.sin(jumpProgress * Math.PI) * 20
                
                // Interpolate position
                const newX = startX + (targetX - startX) * jumpProgress
                const newY = startY + (targetY - startY) * jumpProgress - arcHeight
                
                stateRef.current.x = newX
                stateRef.current.y = newY
                setPosX(newX)
                setPosY(newY)
                
                // Tumble rotation
                const newRotation = jumpProgress * 360 * (stateRef.current.facingRight ? 1 : -1)
                stateRef.current.rotation = newRotation
                setRotation(newRotation)
                
                setSwingAngle(0)
                
                if (step === 25) {
                    phase = "land"
                    step = 0
                }
            }
            // Phase 4: Land (steps 1-10)
            else if (phase === "land" && step <= 10) {
                setIsJumping(false)
                const landProgress = step / 10
                
                // Damped bounce on landing
                setSwingAngle(Math.sin(landProgress * Math.PI * 2) * 10 * (1 - landProgress))
                
                const newRotation = stateRef.current.rotation * (1 - landProgress)
                // Note: we don't update ref rotation here as we want it to settle to 0, 
                // but for visual smoothness we decay it. 
                // Actually, let's update it so next jump starts from 0ish
                stateRef.current.rotation = newRotation
                setRotation(newRotation)
                
                if (step === 10) {
                    stateRef.current.rotation = 0
                    setRotation(0)
                    phase = "swing"
                    step = 0
                }
            }
        }, 60) // 60ms per step
        
        return () => clearInterval(moveInterval)
    }, []) // Only run once on mount
    
    // Handle click
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        clickCountRef.current++
        
        const randomReaction = MONKEY_REACTIONS[Math.floor(Math.random() * MONKEY_REACTIONS.length)]
        setReaction(randomReaction)
        
        setTimeout(() => {
            setReaction(null)
            if (clickCountRef.current >= 3) {
                onCatch(id)
            }
        }, 1000)
    }
    
    return (
        <motion.div
            className="absolute pointer-events-auto z-50"
            style={{ 
                left: `${posX}vw`, 
                top: `${posY}vh`,
                transformOrigin: "top center"
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: swingAngle
            }}
            exit={{ opacity: 0, scale: 0, y: -100 }}
            transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                rotate: { duration: 0.05 }
            }}
        >

            
            {/* Monkey body */}
            <motion.div
                onClick={handleClick}
                className="relative cursor-pointer"
                animate={{ 
                    rotate: rotation,
                    scaleX: facingRight ? 1 : -1
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
            >
                {/* Main emoji */}
                <div className="text-3xl select-none filter drop-shadow-[0_0_8px_rgba(139,69,19,0.6)]">
                    🐒
                </div>
                
                {/* Looking eyes */}
                {isLooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="absolute -top-1 right-0 text-sm"
                    >
                        👀
                    </motion.div>
                )}
                
                {/* Reaching hand during jump */}
                {isJumping && (
                    <motion.div
                        animate={{ x: [0, 10, 0], rotate: [0, 20, 0] }}
                        transition={{ duration: 0.3, repeat: Infinity }}
                        className="absolute top-1/2 -right-3 text-lg"
                    >
                        🤚
                    </motion.div>
                )}
                
                {/* Hover hint */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-900 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-lg pointer-events-none z-50"
                >
                    Catch! 🍌
                </motion.div>
            </motion.div>
            
            {/* Reaction bubble */}
            <AnimatePresence>
                {reaction && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: -25, scale: 1 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg shadow-lg border-2 border-amber-400 z-50 pointer-events-none whitespace-nowrap"
                    >
                        <span className="text-sm">{reaction.emoji} {reaction.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Falling bananas on click */}
            <AnimatePresence>
                {reaction && (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 1, y: 0, x: 0 }}
                                animate={{ 
                                    opacity: 0, 
                                    y: 60 + i * 15, 
                                    x: (i - 1) * 25,
                                    rotate: 360
                                }}
                                transition={{ duration: 0.8 }}
                                className="absolute top-full left-1/2 text-xl pointer-events-none"
                            >
                                🍌
                            </motion.div>
                        ))}
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
