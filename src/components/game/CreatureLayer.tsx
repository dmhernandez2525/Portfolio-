import { useEffect, useState, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion"
import { Sparkles, UserCheck, Trash2 } from "lucide-react"
import { useGamification } from "@/hooks/use-gamification"
import { useEasterEggs } from "@/hooks/use-easter-eggs"
import { getEasterEggCatalog } from "@/lib/easter-eggs/catalog"
import { EASTER_EGG_DISCOVERY_EVENT } from "@/lib/easter-eggs/events"
import { hasUnlockedReward, loadEasterEggProgress } from "@/lib/easter-eggs/progress"
import { cn } from "@/lib/utils"
import type { EasterEggDiscoveryEvent } from "@/types/easter-eggs"
// Import sub-components
import { Ghost } from "./creatures/Ghost"
import { Wizard } from "./creatures/Wizard"
import { Bug } from "./creatures/Bug"
import { Monkey } from "./creatures/Monkey"

type CreatureType = "ghost" | "bug" | "sparkle" | "zap" | "wizard" | "daniel" | "princess" | "monkey"

interface Creature {
  id: number
  type: CreatureType
  x: number
  y: number
  delay: number
  scale: number
  fullData?: {
      quote?: string
      swarmOffset?: { x: number, y: number }[]
  }
}



const COLORS = {
  bug: "text-neon-pink drop-shadow-[0_0_15px_rgba(231,60,126,1)] hover:drop-shadow-[0_0_25px_rgba(231,60,126,1)]", // Stronger pink glow
  sparkle: "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,1)] hover:drop-shadow-[0_0_25px_rgba(250,204,21,1)]", // Stronger yellow glow
  daniel: "text-white z-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
}

// Helpers
const generateSwarm = (creature: Creature) => {
    const now = Date.now();
    return Array.from({ length: 5 }).map((_, i) => ({
        id: now + (i * 1000) + Math.floor(Math.random() * 999),
        type: "bug" as CreatureType,
        x: Math.max(0, Math.min(100, creature.x + (Math.random() * 30 - 15))),
        y: Math.max(0, Math.min(100, creature.y + (Math.random() * 30 - 15))),
        delay: 0,
        scale: 0.3,
        fullData: undefined
    }))
}

const generateDaniel = (x: number, y: number) => ({
    id: Date.now() + 10000, // Large offset to avoid collision with swarm (Date.now() + 0-4)
    type: "daniel" as CreatureType,
    x: Math.max(15, Math.min(85, x)), // Clamp to keep message in viewport
    y: Math.max(10, Math.min(80, y)),
    delay: 0,
    scale: 1.5,
    fullData: undefined
})

const WIZARD_QUOTES = [
    "You shall not pass... without hiring me!",
    "A developer is never late, nor is he early.",
    "Fly, you fools! ...to the contact form!",
    "I have no memory of this place... wait, yes I do, it's React.",
    "All we have to decide is what to do with the time that is given us."
]

// Princess component with proper lifecycle management to fix race condition
function PrincessCreature({ creature, onRemove }: { creature: Creature; onRemove: () => void }) {
    const hasRemovedRef = useRef(false)

    useEffect(() => {
        // Auto-remove after 4 seconds - use ref to prevent double-removal
        const timer = setTimeout(() => {
            if (!hasRemovedRef.current) {
                hasRemovedRef.current = true
                onRemove()
            }
        }, 4000)

        return () => clearTimeout(timer)
    }, [onRemove])

    const handleClick = () => {
        if (!hasRemovedRef.current) {
            hasRemovedRef.current = true
            onRemove()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: 1, scale: 1.5, y: -50 }}
            exit={{ opacity: 0, scale: 2, transition: { duration: 0.5 } }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute flex flex-col items-center pointer-events-auto cursor-pointer z-50"
            style={{ left: `${creature.x}vw`, top: `${creature.y}vh` }}
            onClick={handleClick}
        >
            <motion.div
                className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,105,180,0.8)]"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                👸
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 text-pink-600 px-3 py-1 rounded-full text-xs font-bold mt-2 shadow-lg whitespace-nowrap"
            >
                {creature.fullData?.quote}
            </motion.div>
        </motion.div>
    )
}

export function CreatureLayer() {
  const [creatures, setCreatures] = useState<Creature[]>([])
  const [wizardMessage, setWizardMessage] = useState<string | null>(null)
  const [hasPixelSkin, setHasPixelSkin] = useState<boolean>(() => {
    const progress = loadEasterEggProgress(getEasterEggCatalog())
    return hasUnlockedReward(progress, "skin-pixel-creatures")
  })
  const { incrementCount, creaturesEnabled, healSite } = useGamification()

  // Track timeouts for cleanup
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const despawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // High Water Mark for scroll-based spawn rate
  const maxScrollRef = useRef<number>(0)
  const lastBurstRef = useRef<number>(0)

  // Check for mobile - reduce creatures on smaller screens
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  // Constants - 1/4 creatures everywhere for better UX
  const MAX_CREATURES = isMobile ? 2 : 2
  const BASE_SPAWN_INTERVAL = isMobile ? 12000 : 10000
  const MIN_SPAWN_INTERVAL = isMobile ? 6000 : 4000
  
  // Parallax Scroll Effect + High Water Mark Tracking
  const { scrollY, scrollYProgress } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, 200])
  const ySpring = useSpring(y1, { stiffness: 50, damping: 20 })
  
  // Track maximum scroll depth (high water mark)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
      if (latest > maxScrollRef.current) {
          maxScrollRef.current = latest
      }
  })
  
  // Calculate spawn interval based on high water mark
  // Mobile already has larger base intervals defined above
  const calculateSpawnInterval = useCallback(() => {
      const range = BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL
      return BASE_SPAWN_INTERVAL - (maxScrollRef.current * range)
  }, [BASE_SPAWN_INTERVAL, MIN_SPAWN_INTERVAL])
  
  // Prune creatures that have been around too long (cleanup)
  useEffect(() => {
    const interval = setInterval(() => {
      setCreatures(prev => prev.filter(c => {
          // If creature is more than 30 seconds old, remove it (except special bosses like ghost)
          if (c.type === "ghost") return true; 
          return Date.now() - c.id < 30000;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Spawn a random creature
  const spawnRandomCreature = useCallback(() => {
      // Limit total creatures
      if (creatures.length >= 15) return;

      // Ghost and monkey are rare, others are common
      const rand = Math.random()
      let type: CreatureType
      if (rand < 0.08) {
        type = "ghost" // 8% chance for ghost (boss)
      } else if (rand < 0.10) {
        type = "monkey" // 2% chance for monkey (reduced from 8%)
      } else if (rand < 0.40) {
        type = "bug" // 30% chance for bug
      } else if (rand < 0.70) {
        type = "zap" // 30% chance for zap
      } else {
        type = "sparkle" // 30% chance for sparkle
      }
      
      const edgeX = Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20
      
      const newCreature: Creature = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          type,
          x: edgeX,
          y: Math.random() * 80 + 10,
          delay: Math.random() * 2,
          scale: 0.5 + Math.random() * 0.5,
          fullData: undefined
      }
      
      setCreatures(prev => prev.length < MAX_CREATURES ? [...prev, newCreature] : prev)
  }, [creatures.length, MAX_CREATURES])
  
  // Start spawn loop when creatures are enabled
  useEffect(() => {
      if (!creaturesEnabled) return
      
      const runSpawnLoop = () => {
          const interval = calculateSpawnInterval()
          
          spawnTimeoutRef.current = setTimeout(() => {
              spawnRandomCreature()
              runSpawnLoop() // Recursive call
          }, interval)
      }
      
      runSpawnLoop()
      
      return () => {
          if (spawnTimeoutRef.current) {
              clearTimeout(spawnTimeoutRef.current)
          }
      }
  }, [creaturesEnabled, calculateSpawnInterval, spawnRandomCreature])
  
  // Initial Spawn Burst
  const triggerInitialBurst = useCallback(() => {
      const now = Date.now()
      if (now - lastBurstRef.current < 5000) return // 5 second cooldown
      lastBurstRef.current = now
      
      const burstCount = 2 + Math.floor(Math.random() * 2) // 2-3 creatures
      const baseId = Date.now()
      
      const burstCreatures = Array.from({ length: burstCount }).map((_, i) => ({
          id: baseId + (i * 1000),
          type: (["bug", "sparkle", "zap"] as CreatureType[])[Math.floor(Math.random() * 3)],
          x: Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20,
          y: Math.random() * 80 + 10,
          delay: i * 0.3,
          scale: 0.5 + Math.random() * 0.5,
          fullData: undefined
      }))
      
      setCreatures(prev => [...prev, ...burstCreatures].slice(0, MAX_CREATURES))
  }, [MAX_CREATURES])
  
  // Listen for burst event from CreatureToggle
  useEffect(() => {
      const handleBurst = () => triggerInitialBurst()
      window.addEventListener('creature-burst', handleBurst)
      return () => window.removeEventListener('creature-burst', handleBurst)
  }, [triggerInitialBurst])
  


  // Despawn Logic with dynamic interval
  useEffect(() => {
      const scheduleDespawn = () => {
          const interval = 5000 - (maxScrollRef.current * 2000) // 5000ms at 0%, 3000ms at 100%
          
          despawnTimeoutRef.current = setTimeout(() => {
              if(creatures.length > 0 && Math.random() > 0.7) {
                  setCreatures(prev => prev.filter(c => (c.type === 'wizard' || c.type === 'daniel') ? false : Math.random() > 0.5).slice(1))
              }
              scheduleDespawn()
          }, interval)
      }
      
      if (creaturesEnabled) {
          scheduleDespawn()
      }
      
      return () => {
          if (despawnTimeoutRef.current) {
              clearTimeout(despawnTimeoutRef.current)
          }
      }
  }, [creaturesEnabled, creatures.length])

  // Cleanup message timeouts on unmount
  useEffect(() => {
      return () => {
          if (messageTimeoutRef.current) {
              clearTimeout(messageTimeoutRef.current)
          }
      }
  }, [])

  useEffect(() => {
      const handleDiscovery = (event: Event) => {
          const detail = (event as CustomEvent<EasterEggDiscoveryEvent>).detail
          setHasPixelSkin(detail.progress.unlockedRewardIds.includes("skin-pixel-creatures"))
      }

      window.addEventListener(EASTER_EGG_DISCOVERY_EVENT, handleDiscovery)
      return () => window.removeEventListener(EASTER_EGG_DISCOVERY_EVENT, handleDiscovery)
  }, [])

  useEffect(() => {
      const handleVoiceEgg = (event: Event) => {
          const detail = (event as CustomEvent<{ eggId?: string }>).detail
          if (detail?.eggId !== "gandalf") {
              return
          }

          setCreatures(prev => [...prev, {
              id: Date.now() + Math.floor(Math.random() * 10000),
              type: "wizard",
              x: 50,
              y: 45,
              delay: 0,
              scale: 2,
              fullData: { quote: "Voice command accepted. You shall pass." }
          }])

          setWizardMessage("Voice easter egg unlocked: Gandalf summoned.")
          if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
          messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2600)
      }

      window.addEventListener("voice-easter-egg", handleVoiceEgg as EventListener)
      return () => window.removeEventListener("voice-easter-egg", handleVoiceEgg as EventListener)
  }, [])

  const handleCatch = (creature: Creature) => {
    const { id, type } = creature;

    // 1. Daniel Cleaner Logic
    if (type === 'daniel') {
        const bugs = creatures.filter(c => c.type === 'bug')
        if (bugs.length === 0) {
            setWizardMessage("No bugs to clean! I'll hang around.")
            if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
            messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2000)
            return
        }

        setWizardMessage("Debugging in progress...")
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
        messageTimeoutRef.current = setTimeout(() => {
            setCreatures(prev => prev.filter(c => c.type !== 'bug' && c.type !== 'daniel'))
            setWizardMessage(null)
            incrementCount(bugs.length) 
        }, 1000)
        return
    }

    // 2. Zap Interaction (Summon Wizard)
    if (type === 'zap') {
       setCreatures(prev => [...prev.filter(c => c.id !== id), {
            id: Date.now(),
            type: "wizard",
            x: Math.random() > 0.5 ? 10 + Math.random() * 10 : 80 + Math.random() * 10, // Safe edges
            y: 20 + Math.random() * 60, // Safe Y
            delay: 0,
            scale: 2,
            fullData: { quote: WIZARD_QUOTES[Math.floor(Math.random() * WIZARD_QUOTES.length)] }
        }])
        incrementCount()
        return
    }

    // 3. Bug Swarm
    if (type === "bug") {
        const swarm = generateSwarm(creature);
        const daniel = generateDaniel(creature.x, creature.y)
        setCreatures(prev => [...prev.filter(c=>c.id!==id), ...swarm, daniel])
        setWizardMessage("Bug swarm detected! Click me to debug!")
        if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
        messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 3000)
        incrementCount()
        return
    }
    
    // 4. Default catch (Sparkle etc)
    setCreatures(prev => prev.filter(c => c.id !== id))
    incrementCount()
  }

  // Remove specific ID
  const removeCreature = (id: number, killed?: boolean) => {
      incrementCount() 
      
      setCreatures(prev => {
          const creature = prev.find(c => c.id === id)
          // Filter out the caught creature
          const remaining = prev.filter(c => c.id !== id)
          
          // If killed boss, add Princess
          if (killed && creature?.type === 'ghost') {
               // Auto-heal site after defeating ghost (Issue #7)
               setTimeout(() => healSite(), 1000)
               
               return [...remaining, {
                   id: Date.now(),
                   type: "princess" as CreatureType,
                   x: creature.x,
                   y: creature.y,
                   delay: 0,
                   scale: 1,
                   fullData: { quote: "My Hero! Thank you! 💖" }
               }]
          }
          
          return remaining
      })
  }

  // Easter Eggs
  useEasterEggs({
      onKonami: () => {
          const baseId = Date.now()
          const newCreatures = Array.from({ length: 5 }).map((_, i) => ({
              id: baseId + (i * 1000) + Math.floor(Math.random() * 100), // Unique IDs with large gaps
              type: (Math.random() > 0.5 ? "bug" : "sparkle") as CreatureType,
              x: Math.random() * 90,
              y: Math.random() * 90,
              delay: i * 0.2,
              scale: 1,
          }))
          setCreatures(prev => [...prev, ...newCreatures])
          setWizardMessage("Achievement Unlocked: You know the classics! 🎮")
          if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
          messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 3000)
      },
      onGandalf: () => {
           setCreatures(prev => [...prev, {
                id: Date.now() + Math.floor(Math.random() * 10000),
                type: "wizard",
                x: 50,
                y: 50,
                delay: 0,
                scale: 2,
                fullData: { quote: "You typed my name!" }
            }])
      },
      onDaniel: () => {
           setCreatures(prev => [...prev, {
                id: Date.now() + Math.floor(Math.random() * 10000),
                type: "daniel",
                x: 50,
                y: 50,
                delay: 0,
                scale: 1.5
            }])
      },
      onGhost: () => {
           setCreatures(prev => [...prev, {
                id: Date.now() + Math.floor(Math.random() * 10000),
                type: "ghost",
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                delay: 0,
                scale: 1.2
            }])
      },
      onMonkey: () => {
           setCreatures(prev => [...prev, {
                id: Date.now() + Math.floor(Math.random() * 10000),
                type: "monkey",
                x: Math.random() * 60 + 20, // Keep away from edges for vine
                y: 20 + Math.random() * 30, // Keep higher up
                delay: 0,
                scale: 1,
                fullData: undefined
            }])
           setWizardMessage("🐒 Ooh ooh! A wild monkey appears!")
           if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
           messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2500)
      },
      onMatrix: () => {
           const baseId = Date.now()
           const matrixZaps = Array.from({ length: 4 }).map((_, i) => ({
               id: baseId + i,
               type: "zap" as CreatureType,
               x: 15 + Math.random() * 70,
               y: 15 + Math.random() * 70,
               delay: i * 0.1,
               scale: 1.1,
               fullData: undefined,
           }))
           setCreatures(prev => [...prev, ...matrixZaps])
           setWizardMessage("Matrix breach detected. Systems green.")
           if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
           messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2500)
      },
      onMario: () => {
           setWizardMessage("Coin combo! +1 style points.")
           if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
           messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2200)
      },
      onMiniGame: (miniGameId) => {
           setWizardMessage(`Secret mini-game unlocked: ${miniGameId}`)
           if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
           messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2600)
      },
      onSeasonal: (egg) => {
           setWizardMessage(`Seasonal egg found: ${egg.name}`)
           if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
           messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 2600)
      },
      onHint: (hint) => {
           setWizardMessage(`Hint: ${hint}`)
           if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current)
           messageTimeoutRef.current = setTimeout(() => setWizardMessage(null), 3000)
      },
      emitEvents: true,
      enableInactivityHints: true,
  })

  // Only return null AFTER all hooks are called
  if (!creaturesEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {creatures.map(creature => {
          if (creature.type === 'ghost') {
              return (
                  <Ghost 
                    key={creature.id} 
                    id={creature.id} 
                    x={creature.x} 
                    y={creature.y} 
                    onCatch={removeCreature} 
                  />
              )
          }
          if (creature.type === 'wizard') {
              return (
                  <Wizard
                    key={creature.id}
                    id={creature.id}
                    x={creature.x}
                    y={creature.y}
                    quote={creature.fullData?.quote}
                    onDespawn={removeCreature}
                  />
              )
          }
           if (creature.type === 'princess') {
               return (
                   <PrincessCreature
                       key={creature.id}
                       creature={creature}
                       onRemove={() => removeCreature(creature.id)}
                   />
               )
          }
          
          // Render Bug with new crawling component
          if (creature.type === 'bug') {
              return (
                  <Bug
                    key={creature.id}
                    x={creature.x}
                    y={creature.y}
                    scale={creature.scale}
                    onCatch={() => handleCatch(creature)}
                  />
              )
          }
          
          // Render Monkey with swinging animation
          if (creature.type === 'monkey') {
              return (
                  <Monkey
                    key={creature.id}
                    id={creature.id}
                    x={creature.x}
                    y={Math.max(15, creature.y)} // Keep higher up for vine
                    onCatch={removeCreature}
                  />
              )
          }

          // Render others (Daniel, Sparkle, Zap)
          const Icon = creature.type === 'daniel' ? UserCheck : Sparkles
          
          return (
            <motion.div
              key={creature.id}
              initial={{ opacity: 0, scale: 0, x: `${creature.x}vw`, y: `${creature.y}vh` }}
              animate={{ 
                opacity: [0.6, 1, 0.6], 
                scale: creature.type === 'daniel' ? [0, 1.2, 1] : creature.scale,
                y: [0, -20, 0],
                x: [0, 10, -10, 0],
              }}
              exit={{ opacity: 0, scale: 0, rotate: 180 }}
              style={{ 
                  left: `${creature.x}vw`, 
                  top: `${creature.y}vh`, 
                  y: creature.type === 'daniel' ? 0 : ySpring,
                  position: 'absolute' 
              }}
              transition={{ 
                duration: creature.type === 'daniel' ? 2 : 8 + creature.delay, 
                repeat: creature.type === 'daniel' ? 0 : Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              whileHover={{ scale: creature.scale * 1.5, rotate: 10 }}
              whileTap={{ scale: 0.8 }}
              className={cn(
                  "cursor-pointer pointer-events-auto p-4",
                  COLORS[creature.type as keyof typeof COLORS] || "text-white"
              )}
              onClick={() => handleCatch(creature)}
            >
               {creature.type === 'zap' ? (
                   <div className="text-neon-purple drop-shadow-[0_0_8px_rgba(157,70,250,0.8)] text-4xl">⚡️</div>
               ) : (
                   <div className="relative">
                       {creature.type === 'daniel' ? (
                           <>
                             {/* Desktop: small floating DH */}
                             <div className="hidden md:block relative">
                               <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 border-2 border-neon-blue shadow-[0_0_15px_var(--neon-blue)]">
                                   <img src="/favicon.svg" alt="DH" className="w-8 h-8" />
                               </div>
                               <motion.div 
                                   animate={{ rotate: [0, 10, 0, -10, 0] }} 
                                   transition={{ repeat: Infinity, duration: 2 }}
                                   className="absolute -right-2 -bottom-2 bg-neon-pink rounded-full p-1"
                               >
                                   <Trash2 className="w-4 h-4 text-white" />
                               </motion.div>
                             </div>
                             
                             {/* Mobile: Compact centered DH */}
                             <motion.div 
                               className="md:hidden fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] flex flex-col items-center"
                               animate={{ scale: [1, 1.02, 1] }}
                               transition={{ repeat: Infinity, duration: 1.5 }}
                             >
                               <div className="bg-black/80 backdrop-blur-md rounded-xl p-3 border-2 border-neon-blue shadow-[0_0_20px_var(--neon-blue)]">
                                   <img src="/favicon.svg" alt="DH" className="w-12 h-12" />
                                   <motion.div 
                                       animate={{ rotate: [0, 10, 0, -10, 0] }} 
                                       transition={{ repeat: Infinity, duration: 1.5 }}
                                       className="absolute -right-2 -bottom-2 bg-neon-pink rounded-full p-1"
                                   >
                                       <Trash2 className="w-4 h-4 text-white" />
                                   </motion.div>
                               </div>
                               {/* Compact tap hint */}
                               <motion.div 
                                 animate={{ y: [0, -3, 0] }}
                                 transition={{ repeat: Infinity, duration: 0.8 }}
                                 className="mt-2 bg-white text-black px-3 py-1 rounded-full text-xs font-bold shadow-md"
                               >
                                 👆 TAP
                               </motion.div>
                             </motion.div>
                           </>
                       ) : (
                           creature.type === "sparkle" && hasPixelSkin ? (
                             <span className="text-3xl text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]">✶</span>
                           ) : (
                             <Icon className={cn("w-8 h-8")} />
                           )
                       )}
                       
                       {/* Desktop: attached message */}
                       {(creature.type === 'daniel' && wizardMessage) && (
                           <motion.div 
                             initial={{ opacity: 0, y: 10, scale: 0.8 }}
                             animate={{ opacity: 1, y: 0, scale: 1 }}
                             className="hidden md:block absolute bottom-full right-full mb-2 w-48 bg-white text-black p-3 rounded-xl rounded-tr-none text-xs font-bold shadow-lg border-2 border-neon-purple z-50 pointer-events-none"
                           >
                               {wizardMessage}
                           </motion.div>
                       )}
                    </div>
                )}
               
               {/* Mobile: compact centered message for Daniel */}
               {(creature.type === 'daniel' && wizardMessage) && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.9 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     className="md:hidden fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-xs bg-white text-black p-3 rounded-xl text-xs shadow-xl border-2 border-neon-blue z-[100] pointer-events-none text-center"
                   >
                       <div className="flex items-center justify-center gap-2 mb-2">
                           <img src="/favicon.svg" alt="DH" className="w-6 h-6" />
                           <span className="text-neon-blue font-bold text-sm">DH</span>
                       </div>
                       <p className="text-gray-600 text-xs leading-relaxed">{wizardMessage}</p>
                   </motion.div>
               )}
               
               {/* Click Hint - desktop only, mobile has its own */}
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }}
                 whileHover={{ opacity: 1, scale: 1 }}
                 className="hidden md:block absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 text-black px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap pointer-events-none z-50 shadow-sm"
               >
                  CLICK ME!
               </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
