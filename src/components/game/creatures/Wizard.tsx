import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface WizardProps {
    id: number
    x: number
    y: number
    quote?: string
    onDespawn: (id: number) => void
}

export function Wizard({ id, x, y, quote, onDespawn }: WizardProps) {
    const [isExiting, setIsExiting] = useState(false)
    const [message] = useState<string | null>(quote || null)

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setIsExiting(true)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [message])

    // Firework Particles (Pre-calculated for purity)
    const [particles] = useState(() => {
        const colors = ["bg-neon-pink", "bg-neon-cyan", "bg-neon-purple", "bg-yellow-400"];
        return Array.from({ length: 60 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 200 + Math.random() * 800; // MUCH bigger explosion
            return {
                id: i,
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 0.2
            }
        })
    })

    const handleExitComplete = () => {
        onDespawn(id)
    }

    if (isExiting) {
        return (
            <div 
                className="absolute pointer-events-none z-[100]" 
                style={{ left: `${x}vw`, top: `${y}vh` }}
            >
                {particles.map((p, i) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, scale: 1.5, opacity: 1 }}
                        animate={{ 
                            x: p.x, 
                            y: p.y, 
                            opacity: 0, 
                            scale: 0 
                        }}
                        transition={{ 
                            duration: 1.5, 
                            ease: "easeOut",
                            delay: p.delay
                        }}
                        className={`absolute w-3 h-3 rounded-full ${p.color} shadow-[0_0_15px_currentColor]`}
                        onAnimationComplete={i === 0 ? handleExitComplete : undefined}
                    />
                ))}
                {/* Core Flash */}
                <motion.div 
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white rounded-full blur-xl"
                />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute pointer-events-auto cursor-pointer p-4 z-50"
            style={{ left: `${x}vw`, top: `${y}vh` }}
            onClick={() => setIsExiting(true)} // Click to explode early
        >
            <div className="relative">
                 <div className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">🧙‍♂️</div>
                 {message && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute bottom-full right-full mb-4 w-48 bg-white text-black p-3 rounded-xl rounded-tr-none text-xs font-bold shadow-lg border-2 border-neon-purple z-50 pointer-events-none"
                     >
                         {message}
                     </motion.div>
                 )}
            </div>
        </motion.div>
    )
}
