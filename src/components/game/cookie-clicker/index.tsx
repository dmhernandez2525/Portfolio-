import { useEffect, useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { ArrowLeft, Trophy, Sparkles, Skull } from "lucide-react"
import type { Building, Upgrade, Achievement, GameState, Wrinkler, ClickEffect } from "./types"
import { INITIAL_BUILDINGS, UPGRADES_DATA, ACHIEVEMENTS_DATA, SAVE_KEY } from "./constants"

function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " trillion"
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " billion"
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " million"
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K"
  return Math.floor(n).toString()
}

export function CookieClickerGame() {
  // --- STATE ---
  const [cookies, setCookies] = useState(0)
  const [totalCookies, setTotalCookies] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS)
  const [upgrades, setUpgrades] = useState<Upgrade[]>(
    UPGRADES_DATA.map(u => ({ ...u, purchased: false }))
  )
  const [achievements, setAchievements] = useState<Achievement[]>(
    ACHIEVEMENTS_DATA.map(a => ({ ...a, unlocked: false }))
  )
  
  const [grandmaLevel, setGrandmaLevel] = useState(0)
  const [heavenlyChips, setHeavenlyChips] = useState(0)
  const [wrinklers, setWrinklers] = useState<Wrinkler[]>([])
  
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const [goldenCookie, setGoldenCookie] = useState<{ x: number, y: number, active: boolean, type: 'lucky'|'wrath' }>({ 
    x: 0, y: 0, active: false, type: 'lucky' 
  })
  
  const [cpsMultiplier, setCpsMultiplier] = useState(1)
  const [clickMultiplier] = useState(1) // Keep state if needed for future features or remove entirely
  
  const cookieRef = useRef<HTMLDivElement>(null)
  
  // --- CALCULATORS ---
  const cps = useMemo(() => {
    let base = 0
    buildings.forEach(b => base += b.baseCps * b.owned)
    
    // Apply grandma multiplier from upgrades
    if (upgrades.find(u => u.id === "steel-plated-rolling-pins")?.purchased) {
        // This logic is simplified; ideally we'd separate "baseCps" from "currentCps"
        // For now, let's just use the global multiplier to represent these
    }
    
    // Apply global multiplier
    let mult = cpsMultiplier
    if (upgrades.find(u => u.id === "global-cps")?.purchased) mult *= 1.1
    
    // Heavenly Chips (Prestige)
    if (heavenlyChips > 0) mult *= (1 + heavenlyChips * 0.1)
    
    // Wrinkler penalty
    const witherRate = wrinklers.length * 0.05
    
    return base * mult * (1 - witherRate)
  }, [buildings, upgrades, cpsMultiplier, wrinklers.length])
  
  const clickPower = useMemo(() => {
    let base = 1
    // Upgrades
    if (upgrades.find(u => u.id === "reinforced-finger")?.purchased) base *= 2
    if (upgrades.find(u => u.id === "carpal-tunnel")?.purchased) base *= 2
    if (upgrades.find(u => u.id === "ambidextrous")?.purchased) base *= 2
    
    // Building synergy (cursors) could go here
    
    return base * clickMultiplier
  }, [upgrades, clickMultiplier])
  
  const gameState: GameState = {
    cookies, totalCookies, totalClicks, cookiesPerClick: clickPower, cookiesPerSecond: cps,
    clickMultiplier, cpsMultiplier, buildings, upgrades, achievements,
    grandmapocalypseLevel: grandmaLevel, wrinklers, heavenlyChips: 0, ascensionLevel: 0
  }

  // --- GAME LOOP ---
  useEffect(() => {
    const tickRate = 100 // 10 ticks per second
    const interval = setInterval(() => {
        if (cps > 0) {
            setCookies(c => c + cps / 10)
            setTotalCookies(t => t + cps / 10)
            
            // Feed wrinklers
            if (wrinklers.length > 0) {
                // Simplified: Wrinklers suck cookies
                setWrinklers(ws => ws.map(w => ({...w, suckedCookies: w.suckedCookies + (cps/10) * 0.5 }))) 
            }
        }
        
        // Check Achievements
        setAchievements(prev => {
            let changed = false
            const next = prev.map(a => {
                if (!a.unlocked && a.check(gameState)) {
                    changed = true
                    // Unlock notification could go here
                    return { ...a, unlocked: true }
                }
                return a
            })
            return changed ? next : prev
        })
        
        // Wrinkler Spawning (if Grandmapocalypse)
        if (grandmaLevel >= 1 && wrinklers.length < 10 && Math.random() < 0.001 * grandmaLevel) {
             // Spawn one
             const angle = Math.random() * Math.PI * 2
             const dist = 100 
             setWrinklers(prev => [...prev, {
                 id: Date.now(),
                 x: Math.cos(angle) * dist,
                 y: Math.sin(angle) * dist,
                 suckedCookies: 0
             }])
        }
    }, tickRate)
    return () => clearInterval(interval)
  }, [cps, grandmaLevel, wrinklers, gameState]) 

  // --- SAVE / LOAD & GOLDEN COOKIE ---
  // Load
  useEffect(() => {
      const saved = localStorage.getItem(SAVE_KEY)
      if (saved) {
          try {
              const data = JSON.parse(saved)
              if(data.cookies) setCookies(data.cookies)
              if(data.totalCookies) setTotalCookies(data.totalCookies)
              if(data.buildings) {
                  setBuildings(prev => prev.map(b => {
                      const s = data.buildings.find((sb: any) => sb.id === b.id)
                      return s ? {...b, owned: s.owned} : b
                  }))
              }
              if(data.upgrades) {
                  setUpgrades(prev => prev.map(u => ({...u, purchased: data.upgrades.includes(u.id)})))
              }
              if(data.grandmaLevel) setGrandmaLevel(data.grandmaLevel)
              if(data.heavenlyChips) setHeavenlyChips(data.heavenlyChips)
          } catch(e) { console.error(e) }
      }
  }, [])

  // Save
  useEffect(() => {
      const save = () => {
          const data = {
              cookies, totalCookies, grandmaLevel, heavenlyChips,
              buildings: buildings.map(b => ({id: b.id, owned: b.owned})),
              upgrades: upgrades.filter(u => u.purchased).map(u => u.id)
          }
          localStorage.setItem(SAVE_KEY, JSON.stringify(data))
      }
      const i = setInterval(save, 30000)
      return () => clearInterval(i)
  }, [cookies, totalCookies, buildings, upgrades, grandmaLevel])

  // Golden Cookie Spawner
  useEffect(() => {
      const spawn = () => {
          if (!goldenCookie.active && Math.random() < 0.3) {
             setGoldenCookie({
                 active: true,
                 x: Math.random() * 80 + 10,
                 y: Math.random() * 60 + 20,
                 type: Math.random() < 0.1 && grandmaLevel > 0 ? 'wrath' : 'lucky'
             })
             setTimeout(() => setGoldenCookie(prev => ({...prev, active: false})), 13000)
          }
      }
      const i = setInterval(spawn, 10000 + Math.random() * 20000)
      return () => clearInterval(i)
  }, [goldenCookie.active, grandmaLevel])

  const clickGoldenCookie = (e: React.MouseEvent) => {
      e.stopPropagation()
      setGoldenCookie(prev => ({...prev, active: false}))
      if (goldenCookie.type === 'lucky') {
          const gain = cps * 60 + 13
          setCookies(c => c + gain)
          setTotalCookies(t => t + gain)
           // Effect
          const rect = cookieRef.current?.getBoundingClientRect()
          if (rect) {
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            setClickEffects(prev => [...prev, { id: Date.now(), x, y, value: "Lucky! +" + formatNumber(gain) }])
          }
      } else {
          // Wrath: Ruin
          const loss = cookies * 0.05
          setCookies(c => Math.max(0, c - loss))
          setCpsMultiplier(0.5)
          setTimeout(() => setCpsMultiplier(1), 10000)
      }
  }

  // --- HELPERS ---
  const ascend = () => {
      const chipsEarned = Math.floor(Math.sqrt(totalCookies / 1000000)) 
      if (chipsEarned <= 0) return

      const confirm = window.confirm(`Ascend now? You will reset progress but gain ${chipsEarned} Heavenly Chips (+${chipsEarned*10}% CpS).`)
      if (!confirm) return
      
      setHeavenlyChips(prev => prev + chipsEarned)
      setCookies(0)
      setTotalCookies(0)
      setBuildings(INITIAL_BUILDINGS)
      setUpgrades(UPGRADES_DATA.map(u => ({ ...u, purchased: false })))
      setGrandmaLevel(0)
      setWrinklers([])
      setGoldenCookie({ x: 0, y: 0, active: false, type: 'lucky' })
  }

  const getBuildingCost = (b: Building) => Math.floor(b.baseCost * Math.pow(1.15, b.owned))
  
  const buyBuilding = (id: string) => {
      const idx = buildings.findIndex(b => b.id === id)
      if (idx === -1) return
      const b = buildings[idx]
      const cost = getBuildingCost(b)
      if (cookies >= cost) {
          setCookies(c => c - cost)
          const newBuildings = [...buildings]
          newBuildings[idx] = { ...b, owned: b.owned + 1 }
          setBuildings(newBuildings)
      }
  }
  
  const buyUpgrade = (id: string) => {
      const idx = upgrades.findIndex(u => u.id === id)
      if (idx === -1) return
      const u = upgrades[idx]
      if (!u.purchased && cookies >= u.cost) {
           setCookies(c => c - u.cost)
           const newUpgrades = [...upgrades]
           newUpgrades[idx] = { ...u, purchased: true }
           setUpgrades(newUpgrades)
           
           // Apply Effects
           if (id === "one-mind") setGrandmaLevel(1)
           if (id === "communal-brainsweep") setGrandmaLevel(2)
      }
  }
  
  const clickCookie = (e: React.MouseEvent) => {
      setCookies(c => c + clickPower)
      setTotalCookies(t => t + clickPower)
      setTotalClicks(tc => tc + 1)
      
       // Add unique click effect
      const rect = cookieRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const newEffect = { id: Date.now(), x, y, value: `+${formatNumber(clickPower)}` }
        setClickEffects(prev => [...prev, newEffect])
        setTimeout(() => setClickEffects(prev => prev.filter(ef => ef.id !== newEffect.id)), 1000)
      }
  }
  
  const popWrinkler = (e: React.MouseEvent, id: number) => {
      e.stopPropagation()
      const w = wrinklers.find(w => w.id === id)
      if (w) {
          const reward = w.suckedCookies * 1.1
          setCookies(c => c + reward)
          setWrinklers(prev => prev.filter(w => w.id !== id))
          // Effect
          // ... 
      }
  }

  // Background style based on Grandma Level
  const bgStyle = grandmaLevel >= 3 ? "bg-red-950" : grandmaLevel >= 1 ? "bg-orange-950" : "bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900"

  return (
    <div className={cn("min-h-screen p-4 transition-colors duration-1000", bgStyle)}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
            <Link to="/games">
            <Button variant="outline" size="sm" className="bg-black/30 border-white/20 text-white hover:bg-black/50">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            </Link>
            <div className="flex items-center gap-4 text-white/80 text-sm">
                 {totalCookies > 1000000 && (
                     <Button 
                        onClick={ascend}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-2 py-1 h-auto"
                     >
                         <Sparkles className="w-3 h-3 mr-1" /> Ascend
                     </Button>
                 )}
                 {heavenlyChips > 0 && (
                     <div className="flex items-center text-purple-300 font-bold" title={`+${heavenlyChips*10}% CpS`}>
                         <Sparkles className="w-3 h-3 mr-1" /> {heavenlyChips} Chips
                     </div>
                 )}
                 <Trophy className="w-4 h-4 text-yellow-500" />
                 <span>{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
            </div>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Cookie */}
            <div className="flex flex-col items-center">
                 <div className="text-center mb-8">
                     <h1 className="text-4xl font-bold text-white mb-2">{formatNumber(cookies)} <span className="text-sm">cookies</span></h1>
                     <p className="text-white/60">per second: {formatNumber(cps)}</p>
                 </div>
                 
                 <div className="relative w-64 h-64 select-none" ref={cookieRef}>
                     <div 
                        onClick={clickCookie}
                        className="absolute inset-0 flex items-center justify-center text-[160px] cursor-pointer hover:scale-105 active:scale-95 transition-transform z-10"
                     >
                        🍪
                     </div>
                     
                     {/* Wrinklers */}
                     {wrinklers.map(w => (
                         <div 
                             key={w.id}
                             onClick={(e) => popWrinkler(e, w.id)}
                             className="absolute w-12 h-12 bg-red-800 rounded-full border-2 border-red-500 z-20 cursor-pointer animate-pulse flex items-center justify-center text-xs text-white"
                             style={{ 
                                 left: 128 + w.x - 24, 
                                 top: 128 + w.y - 24,
                                 transform: `rotate(${Math.atan2(w.y, w.x)}rad)` 
                             }}
                         >
                            🐛
                         </div>
                     ))}
                     
                     {/* Golden Cookie */}
                     {goldenCookie.active && (
                         <div
                             onClick={clickGoldenCookie}
                             className="absolute z-50 text-6xl cursor-pointer animate-pulse drop-shadow-[0_0_15px_gold]"
                             style={{ left: `${goldenCookie.x}%`, top: `${goldenCookie.y}%` }}
                         >
                            {goldenCookie.type === 'wrath' ? '🍪' : '✨'}
                         </div>
                     )}
                     
                     {/* Click Effects */}
                     {clickEffects.map(fx => (
                         <div key={fx.id} className="absolute text-white font-bold pointer-events-none animate-float-up z-30" style={{ left: fx.x, top: fx.y }}>
                             {fx.value}
                         </div>
                     ))}
                 </div>
            </div>
            
            {/* Middle: Buildings */}
            <div className="bg-black/20 rounded-xl p-4 h-[600px] overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">Store</h2>
                <div className="space-y-2">
                    {buildings.map(b => {
                        const cost = getBuildingCost(b)
                        const canAfford = cookies >= cost
                        return (
                            <div 
                                key={b.id}
                                onClick={() => buyBuilding(b.id)}
                                className={cn(
                                    "flex items-center p-3 rounded-lg cursor-pointer transition-all border border-transparent",
                                    canAfford ? "bg-white/10 hover:bg-white/20" : "opacity-50 bg-black/20"
                                )}
                            >
                                <div className="text-3xl mr-4">{b.icon}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-white">{b.name}</span>
                                        <span className="text-2xl font-bold text-white/20">{b.owned}</span>
                                    </div>
                                    <div className="text-yellow-400 text-sm font-mono">
                                        🍪 {formatNumber(cost)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            {/* Right: Upgrades */}
            <div className="space-y-6">
                <div className="bg-black/20 rounded-xl p-4">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" /> Upgrades
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {upgrades.filter(u => !u.purchased && u.requirement(gameState)).map(u => (
                            <div
                                key={u.id}
                                onClick={() => buyUpgrade(u.id)}
                                className={cn(
                                    "w-12 h-12 rounded bg-black/40 flex items-center justify-center text-2xl cursor-pointer border border-white/10 hover:border-white/50 relative group",
                                    cookies >= u.cost ? "opacity-100" : "opacity-50"
                                )}
                            >
                                {u.icon}
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 bg-black/90 p-2 rounded text-xs w-48 hidden group-hover:block z-50 pointer-events-none">
                                    <div className="font-bold text-white">{u.name}</div>
                                    <div className="text-white/70">{u.description}</div>
                                    <div className="text-yellow-400 mt-1">{formatNumber(u.cost)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Grandmapocalypse Status */}
                {grandmaLevel > 0 && (
                     <div className="bg-red-900/50 rounded-xl p-4 border border-red-500/30">
                         <h3 className="text-red-200 font-bold flex items-center gap-2">
                             <Skull className="w-4 h-4" /> Elder Status
                         </h3>
                         <p className="text-red-100/70 text-sm mt-1">
                             {grandmaLevel === 1 ? "The grandmas are acting strange..." : 
                              grandmaLevel === 2 ? "The grandmas are displeased." : "THE GRANDMAS ARE ANGERED."}
                         </p>
                     </div>
                )}
            </div>
        </div>
        
        <style>{`
         @keyframes float-up {
           0% { opacity: 1; transform: translateY(0); }
           100% { opacity: 0; transform: translateY(-50px); }
         }
         .animate-float-up {
           animation: float-up 1s ease-out forwards;
         }
       `}</style>
    </div>
  )
}
