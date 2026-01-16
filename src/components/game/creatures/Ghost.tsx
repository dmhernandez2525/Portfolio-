import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { type PanInfo } from "framer-motion"
import { Ghost as GhostIcon } from "lucide-react"
import { useGamification } from "@/hooks/use-gamification"

interface GhostProps {
    id: number
    x: number
    y: number
    onCatch: (id: number, killed?: boolean) => void
}

export function Ghost({ id, x, y, onCatch }: GhostProps) {
    const [scale, setScale] = useState(1)
    const [isEnraged, setIsEnraged] = useState(false)
    const [health, setHealth] = useState(5) // More health for boss (was 3)
    const { damageSite } = useGamification()
    
    // Use refs for high-frequency tracking
    const shakeStateRef = useRef({
        count: 0,
        lastX: 0,
        lastDirection: 0, // -1 (left), 1 (right), 0 (none)
        lastTime: 0
    })

    // Damage Site Logic
    useEffect(() => {
        if (!isEnraged) return;
        
        const interval = setInterval(() => {
            // Attack the site!
            damageSite(5)
            // Maybe add a visual shake to the ghost too
            setScale(prev => prev === 4 ? 3.8 : 4)
        }, 2000)

        return () => clearInterval(interval)
    }, [isEnraged, damageSite])
    
    // Reset drag state when drag ends
    const handleDragEnd = () => {
        // Reset lastX so next drag starts fresh
        shakeStateRef.current.lastX = 0
    }
    
    // Drag/Shake Logic
    const handleDrag = (_: unknown, info: PanInfo) => {
        const currentX = info.point.x
        
        // Initialize lastX on first drag
        if (shakeStateRef.current.lastX === 0) {
            shakeStateRef.current.lastX = currentX
            return
        }
        
        const deltaX = currentX - shakeStateRef.current.lastX
        
        // Determine direction
        const currentDirection = deltaX > 0 ? 1 : -1
        
        // If direction changed AND moved enough to matter
        if (currentDirection !== shakeStateRef.current.lastDirection && Math.abs(deltaX) > 2) {
             shakeStateRef.current.count += 1
             shakeStateRef.current.lastDirection = currentDirection
             
             // Visual feedback
             if (!isEnraged) {
                 setScale(prev => Math.min(1.8, prev + 0.1)) 
             }
        }
        
        shakeStateRef.current.lastX = currentX
        
        if (shakeStateRef.current.count > 6 && !isEnraged) {
            setIsEnraged(true)
            setScale(4) // MUCH BIGGER as requested
            shakeStateRef.current.count = 0 
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent event bubbling
        
        if (isEnraged) {
            setHealth(prev => prev - 1)
            if (health - 1 <= 0) {
                onCatch(id, true) // Killed!
            } else {
                // Hit effect
                setScale(prev => prev * 0.9) 
                setTimeout(() => setScale(4), 100)
            }
        } else {
             if (shakeStateRef.current.count > 2) return 
             onCatch(id, false) // Just caught normally
        }
    }

    return (
        <motion.div
            className={`absolute pointer-events-auto p-4 z-50`}
            style={{ 
                left: `${x}vw`, 
                top: `${y}vh`, 
                touchAction: "none",
                cursor: isEnraged ? "url('/sword-cursor.svg') 16 16, crosshair" : "grab"
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
                opacity: 1, 
                scale: isEnraged ? [3.8, 4.0, 3.8] : scale,
            }}
            transition={{ 
                scale: { repeat: isEnraged ? Infinity : 0, duration: 0.5 }
            }}
        >
            {/* Inner Wrapper */}
            <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative group"
            >
                 {isEnraged ? (
                     <div className="relative">
                        <GhostIcon className="w-12 h-12 text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,1)]" />
                        <div className="absolute -top-4 -right-4 text-3xl animate-bounce">⚔️</div>
                        {/* Health Bar (Larger) */}
                        <div className="absolute -bottom-4 -left-4 w-[150%] h-2 bg-gray-900 rounded-full overflow-hidden border border-red-900">
                            <div className="h-full bg-red-600" style={{ width: `${(health / 5) * 100}%` }} />
                        </div>
                     </div>
                 ) : (
                     <GhostIcon className="w-8 h-8 text-neon-cyan drop-shadow-[0_0_8px_rgba(137,247,254,0.8)]" />
                 )}
                 
                 {!isEnraged && <div className="absolute top-full left-1/2 -translate-x-1/2 text-[10px] text-white/50 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Shake me!</div>}
            </motion.div>
        </motion.div>
    )
}
