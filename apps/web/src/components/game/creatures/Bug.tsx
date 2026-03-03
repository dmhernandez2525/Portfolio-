import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Bug as BugIcon } from "lucide-react"

interface BugProps {
    x: number
    y: number
    scale: number
    onCatch: () => void
}

export function Bug({ x, y, scale, onCatch }: BugProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [rotation, setRotation] = useState(0)
    
    // Determine crawl direction based on spawn position
    const startFromLeft = x < 50
    const targetX = startFromLeft ? 85 : 15
    
    // Animate the bug crawling across the screen
    useEffect(() => {
        let step = 0
        const totalSteps = 20
        
        const crawlInterval = setInterval(() => {
            step++
            const progress = step / totalSteps
            
            // Calculate new position
            const newX = (targetX - x) * progress
            const wiggleY = Math.sin(progress * Math.PI * 6) * 2
            
            // Rotate to face direction with wiggle
            const baseRotation = startFromLeft ? 90 : -90
            const wiggleRot = Math.sin(progress * Math.PI * 12) * 20
            setRotation(baseRotation + wiggleRot)
            
            setPosition({ x: newX, y: wiggleY })
            
            if (step >= totalSteps) {
                clearInterval(crawlInterval)
            }
        }, 200)
        
        return () => clearInterval(crawlInterval)
    }, [startFromLeft, targetX, x])
    
    return (
        <motion.div
            className="absolute pointer-events-auto cursor-pointer z-40 p-2"
            style={{ 
                left: `${x}vw`, 
                top: `${y}vh`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
                opacity: 1, 
                scale: scale,
                x: `${position.x}vw`,
                y: `${position.y}vh`,
            }}
            exit={{ opacity: 0, scale: 0, rotate: 360 }}
            transition={{ 
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                x: { duration: 0.15, ease: "linear" },
                y: { duration: 0.15, ease: "linear" },
            }}
            onClick={(e) => {
                e.stopPropagation()
                onCatch()
            }}
            whileHover={{ scale: scale * 1.5 }}
            whileTap={{ scale: 0.5 }}
        >
            <motion.div
                animate={{ rotate: rotation }}
                transition={{ duration: 0.1 }}
                className="relative"
            >
                {/* Bug body */}
                <BugIcon 
                    className="w-8 h-8 text-neon-pink drop-shadow-[0_0_12px_rgba(231,60,126,1)]" 
                />
                
                {/* Leg animation dots */}
                <motion.div
                    animate={{ scaleX: [1, 0.7, 1, 1.3, 1] }}
                    transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="w-1.5 h-1.5 bg-neon-pink rounded-full absolute -left-2 top-1/2 -translate-y-1/2 opacity-70" />
                    <div className="w-1.5 h-1.5 bg-neon-pink rounded-full absolute -right-2 top-1/2 -translate-y-1/2 opacity-70" />
                </motion.div>
            </motion.div>
            
            {/* Hover hint */}
            <motion.div 
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 text-black px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap pointer-events-none z-50 shadow-sm"
            >
                SQUISH!
            </motion.div>
        </motion.div>
    )
}
