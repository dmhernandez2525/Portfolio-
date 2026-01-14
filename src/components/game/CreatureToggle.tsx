import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGamification } from "@/hooks/use-gamification"
import { Sparkles, Bug, Ghost, Zap } from "lucide-react"

export function CreatureToggle() {
    const { creaturesEnabled, toggleCreatures, creatureCount } = useGamification()
    const [progress, setProgress] = useState(0)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [hintDismissed, setHintDismissed] = useState(false)

    // Initial "Slow Load" logic
    useEffect(() => {
        // Only run once on mount
        if (hasLoaded) return;

        let val = 0;
        const interval = setInterval(() => {
            val += 5; // Load much faster (was 2)
            setProgress(val)
            if (val >= 100) {
                clearInterval(interval)
                setHasLoaded(true)
                if (!creaturesEnabled) {
                    toggleCreatures() // Auto-enable
                    // Trigger initial burst after a small delay to ensure layer is ready
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('creature-burst'))
                    }, 100)
                }
            }
        }, 50)

        return () => clearInterval(interval)
    }, [hasLoaded]) // Only run once on mount (Issue #5)

    // Show hint on scroll (after creatures are loaded and not dismissed)
    useEffect(() => {
        if (!hasLoaded || !creaturesEnabled || hintDismissed) return;

        const handleScroll = () => {
            const scrollY = window.scrollY
            // Show hint after scrolling 200px
            if (scrollY > 200 && !showHint) {
                setShowHint(true)
                // Auto-hide after 8 seconds
                setTimeout(() => {
                    setShowHint(false)
                    setHintDismissed(true)
                }, 8000)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [hasLoaded, creaturesEnabled, hintDismissed, showHint])

    const handleToggle = () => {
        // Instant toggle
        toggleCreatures()
        setProgress(creaturesEnabled ? 0 : 100) // Snap visual
    }

    return (
        <>
            <div
                onClick={handleToggle}
                className="cursor-pointer group relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 backdrop-blur-sm border border-border hover:border-neon-purple transition-all"
                title={creaturesEnabled ? "Disable Creatures" : "Enable Creatures"}
            >
                {creaturesEnabled ? (
                    <Sparkles className="w-4 h-4 text-neon-purple animate-pulse" />
                ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-neon-purple animate-spin" />
                )}

                {/* Loading Bar Container */}
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden relative">
                     <motion.div
                        className="h-full bg-gradient-to-r from-neon-blue to-neon-purple"
                        initial={{ width: 0 }}
                        animate={{ width: `${creaturesEnabled ? 100 : progress}%` }}
                        transition={{ ease: "linear" }}
                     />
                </div>

                <div className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                    {creaturesEnabled ? (
                        <span className="text-neon-purple font-bold">{creatureCount}</span>
                    ) : (
                        `${progress}%`
                    )}
                </div>
            </div>

            {/* Hint about clicking creatures */}
            <AnimatePresence>
                {showHint && creaturesEnabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="fixed top-20 right-4 z-50 max-w-sm"
                    >
                        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 backdrop-blur-md px-4 py-3 rounded-xl border border-neon-purple/30 shadow-lg">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-foreground font-medium">
                                        Catch the <span className="text-neon-purple font-bold">creatures</span> floating around!
                                    </span>
                                </div>
                                {/* Creature icons showcase */}
                                <div className="flex items-center justify-center gap-4 py-2">
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <Bug className="w-6 h-6 text-neon-pink drop-shadow-[0_0_8px_rgba(231,60,126,0.8)]" />
                                        <span className="text-[10px] text-muted-foreground">Bug</span>
                                    </motion.div>
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <Ghost className="w-6 h-6 text-neon-cyan drop-shadow-[0_0_8px_rgba(137,247,254,0.8)]" />
                                        <span className="text-[10px] text-muted-foreground">Ghost</span>
                                    </motion.div>
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <Zap className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
                                        <span className="text-[10px] text-muted-foreground">Zap</span>
                                    </motion.div>
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <span className="text-2xl">🧙‍♂️</span>
                                        <span className="text-[10px] text-muted-foreground">Wizard</span>
                                    </motion.div>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Click or drag them to interact!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
