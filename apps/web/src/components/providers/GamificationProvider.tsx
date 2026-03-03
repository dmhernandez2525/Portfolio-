import { useState, useCallback, type ReactNode } from "react"
import { GamificationContext } from "@/context/gamification-context"

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [creatureCount, setCreatureCount] = useState<number>(() => {
    // Lazy init from storage
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('creature-count')
        return saved ? parseInt(saved, 10) : 0
    }
    return 0
  })

  // Start with creatures enabled, but wait for initial load?
  // User asked for "slowly loads"
  const [creaturesEnabled, setCreaturesEnabled] = useState(false)
  const [siteHealth, setSiteHealth] = useState(100)

  // Auto-enable logic could be in the component, or here.
  // User: "Loading bar that slowly loads... act as toggle"
  // Let's just track the boolean detailed state here.

  const incrementCount = useCallback((amount: number = 1) => {
    setCreatureCount(prev => {
        const next = prev + amount;
        localStorage.setItem('creature-count', next.toString())
        return next
    })
  }, [])
  
  const toggleCreatures = useCallback(() => setCreaturesEnabled(prev => !prev), [])

  const damageSite = useCallback((amount: number) => {
      setSiteHealth(prev => Math.max(0, prev - amount))
  }, [])

  const healSite = useCallback(() => setSiteHealth(100), [])

  return (
    <GamificationContext.Provider value={{ creatureCount, creaturesEnabled, siteHealth, incrementCount, toggleCreatures, damageSite, healSite }}>
      {children}
    </GamificationContext.Provider>
  )
}
