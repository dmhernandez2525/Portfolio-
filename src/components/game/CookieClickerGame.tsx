import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { ArrowLeft, Trophy, Sparkles, Zap, Star } from "lucide-react"

// --- Types ---
interface Building {
  id: string
  name: string
  description: string
  baseCost: number
  baseCps: number // Cookies per second
  owned: number
  icon: string
}

interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  purchased: boolean
  effect: () => void
  requirement: () => boolean
  icon: string
}

interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  icon: string
  check: () => boolean
}

interface ClickEffect {
  id: number
  x: number
  y: number
  value: string
}

interface PurchaseEffect {
  id: number
  buildingId: string
}

// --- Helper Functions ---
const formatNumber = (n: number): string => {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " trillion"
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " billion"
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " million"
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K"
  return Math.floor(n).toString()
}

const SAVE_KEY = "cookie-clicker-save"

export function CookieClickerGame() {
  const [cookies, setCookies] = useState(0)
  const [totalCookies, setTotalCookies] = useState(0)
  const [cookiesPerClick, setCookiesPerClick] = useState(1)
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0)
  const [clickMultiplier, setClickMultiplier] = useState(1)
  const [cpsMultiplier, setCpsMultiplier] = useState(1)
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const [purchaseEffects, setPurchaseEffects] = useState<PurchaseEffect[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [goldenCookieActive, setGoldenCookieActive] = useState(false)
  const [goldenCookiePosition, setGoldenCookiePosition] = useState({ x: 0, y: 0 })

  const cookieRef = useRef<HTMLDivElement>(null)
  const lastSaveRef = useRef(Date.now())

  // Buildings
  const [buildings, setBuildings] = useState<Building[]>([
    { id: "cursor", name: "Cursor", description: "Autoclicks once every 10 seconds", baseCost: 15, baseCps: 0.1, owned: 0, icon: "👆" },
    { id: "grandma", name: "Grandma", description: "A nice grandma to bake cookies", baseCost: 100, baseCps: 1, owned: 0, icon: "👵" },
    { id: "farm", name: "Farm", description: "Grows cookie plants", baseCost: 1100, baseCps: 8, owned: 0, icon: "🌾" },
    { id: "mine", name: "Mine", description: "Mines cookie dough", baseCost: 12000, baseCps: 47, owned: 0, icon: "⛏️" },
    { id: "factory", name: "Factory", description: "Mass produces cookies", baseCost: 130000, baseCps: 260, owned: 0, icon: "🏭" },
    { id: "bank", name: "Bank", description: "Generates cookies from interest", baseCost: 1400000, baseCps: 1400, owned: 0, icon: "🏦" },
    { id: "temple", name: "Temple", description: "Cookie worship generates cookies", baseCost: 20000000, baseCps: 7800, owned: 0, icon: "🛕" },
    { id: "wizard", name: "Wizard Tower", description: "Conjures cookies with magic", baseCost: 330000000, baseCps: 44000, owned: 0, icon: "🧙" },
  ])

  // Upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "reinforced-finger",
      name: "Reinforced Index Finger",
      description: "Double click power",
      cost: 100,
      purchased: false,
      effect: () => setClickMultiplier(m => m * 2),
      requirement: () => totalClicks >= 10,
      icon: "👆"
    },
    {
      id: "carpal-tunnel",
      name: "Carpal Tunnel Prevention",
      description: "Triple click power",
      cost: 500,
      purchased: false,
      effect: () => setClickMultiplier(m => m * 3),
      requirement: () => totalClicks >= 50,
      icon: "🤚"
    },
    {
      id: "ambidextrous",
      name: "Ambidextrous",
      description: "Click power +10",
      cost: 10000,
      purchased: false,
      effect: () => setCookiesPerClick(c => c + 10),
      requirement: () => totalClicks >= 200,
      icon: "✌️"
    },
    {
      id: "forwards-grandmas",
      name: "Forwards from Grandma",
      description: "Grandmas are twice as efficient",
      cost: 1000,
      purchased: false,
      effect: () => {
        setBuildings(b => b.map(building =>
          building.id === "grandma" ? { ...building, baseCps: building.baseCps * 2 } : building
        ))
      },
      requirement: () => buildings.find(b => b.id === "grandma")!.owned >= 1,
      icon: "📧"
    },
    {
      id: "steel-plated-rolling-pins",
      name: "Steel-plated Rolling Pins",
      description: "Grandmas are twice as efficient",
      cost: 5000,
      purchased: false,
      effect: () => {
        setBuildings(b => b.map(building =>
          building.id === "grandma" ? { ...building, baseCps: building.baseCps * 2 } : building
        ))
      },
      requirement: () => buildings.find(b => b.id === "grandma")!.owned >= 5,
      icon: "🔧"
    },
    {
      id: "cheap-hoes",
      name: "Cheap Hoes",
      description: "Farms are twice as efficient",
      cost: 11000,
      purchased: false,
      effect: () => {
        setBuildings(b => b.map(building =>
          building.id === "farm" ? { ...building, baseCps: building.baseCps * 2 } : building
        ))
      },
      requirement: () => buildings.find(b => b.id === "farm")!.owned >= 1,
      icon: "🪓"
    },
    {
      id: "sugar-gas",
      name: "Sugar Gas",
      description: "Mines are twice as efficient",
      cost: 120000,
      purchased: false,
      effect: () => {
        setBuildings(b => b.map(building =>
          building.id === "mine" ? { ...building, baseCps: building.baseCps * 2 } : building
        ))
      },
      requirement: () => buildings.find(b => b.id === "mine")!.owned >= 1,
      icon: "⛽"
    },
    {
      id: "sturdier-conveyor-belts",
      name: "Sturdier Conveyor Belts",
      description: "Factories are twice as efficient",
      cost: 1300000,
      purchased: false,
      effect: () => {
        setBuildings(b => b.map(building =>
          building.id === "factory" ? { ...building, baseCps: building.baseCps * 2 } : building
        ))
      },
      requirement: () => buildings.find(b => b.id === "factory")!.owned >= 1,
      icon: "🔄"
    },
    {
      id: "global-cps",
      name: "Kitten Helpers",
      description: "+10% CpS",
      cost: 50000,
      purchased: false,
      effect: () => setCpsMultiplier(m => m * 1.1),
      requirement: () => totalCookies >= 10000,
      icon: "🐱"
    },
    {
      id: "golden-cookie-boost",
      name: "Lucky Day",
      description: "Golden cookies appear more often",
      cost: 777777,
      purchased: false,
      effect: () => {}, // Effect handled in golden cookie spawn
      requirement: () => totalCookies >= 500000,
      icon: "🍀"
    },
  ])

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first-cookie", name: "Wake and Bake", description: "Bake 1 cookie", unlocked: false, icon: "🍪", check: () => totalCookies >= 1 },
    { id: "100-cookies", name: "Making Some Dough", description: "Bake 100 cookies", unlocked: false, icon: "💰", check: () => totalCookies >= 100 },
    { id: "1000-cookies", name: "So Baked Right Now", description: "Bake 1,000 cookies", unlocked: false, icon: "🔥", check: () => totalCookies >= 1000 },
    { id: "10000-cookies", name: "Fledgling Bakery", description: "Bake 10,000 cookies", unlocked: false, icon: "🏠", check: () => totalCookies >= 10000 },
    { id: "100000-cookies", name: "Affluent Bakery", description: "Bake 100,000 cookies", unlocked: false, icon: "🏢", check: () => totalCookies >= 100000 },
    { id: "1m-cookies", name: "Cookie Empire", description: "Bake 1 million cookies", unlocked: false, icon: "👑", check: () => totalCookies >= 1000000 },
    { id: "first-grandma", name: "Just Wrong", description: "Own 1 grandma", unlocked: false, icon: "👵", check: () => buildings.find(b => b.id === "grandma")!.owned >= 1 },
    { id: "10-grandmas", name: "Grandma's Boy", description: "Own 10 grandmas", unlocked: false, icon: "👵", check: () => buildings.find(b => b.id === "grandma")!.owned >= 10 },
    { id: "click-50", name: "Clicktastic", description: "Click 50 times", unlocked: false, icon: "👆", check: () => totalClicks >= 50 },
    { id: "click-500", name: "Clickathlon", description: "Click 500 times", unlocked: false, icon: "✨", check: () => totalClicks >= 500 },
    { id: "click-5000", name: "Clickolympics", description: "Click 5,000 times", unlocked: false, icon: "🏅", check: () => totalClicks >= 5000 },
    { id: "cps-10", name: "Production Line", description: "Reach 10 cookies/second", unlocked: false, icon: "📈", check: () => cookiesPerSecond >= 10 },
    { id: "cps-100", name: "Cookie Factory", description: "Reach 100 cookies/second", unlocked: false, icon: "🏭", check: () => cookiesPerSecond >= 100 },
    { id: "cps-1000", name: "Cookie Corp", description: "Reach 1,000 cookies/second", unlocked: false, icon: "🌐", check: () => cookiesPerSecond >= 1000 },
  ])

  // Calculate building cost
  const getBuildingCost = (building: Building): number => {
    return Math.floor(building.baseCost * Math.pow(1.15, building.owned))
  }

  // Calculate total CPS
  const calculateCps = useCallback(() => {
    let cps = 0
    buildings.forEach(building => {
      cps += building.baseCps * building.owned
    })
    return cps * cpsMultiplier
  }, [buildings, cpsMultiplier])

  // Update CPS when buildings change
  useEffect(() => {
    setCookiesPerSecond(calculateCps())
  }, [calculateCps])

  // Cookie production loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (cookiesPerSecond > 0) {
        const earned = cookiesPerSecond / 10 // 10 updates per second
        setCookies(c => c + earned)
        setTotalCookies(t => t + earned)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [cookiesPerSecond])

  // Check achievements
  useEffect(() => {
    setAchievements(prev => prev.map(a => ({
      ...a,
      unlocked: a.unlocked || a.check()
    })))
  }, [totalCookies, totalClicks, cookiesPerSecond, buildings])

  // Golden cookie spawner
  useEffect(() => {
    const luckyUpgrade = upgrades.find(u => u.id === "golden-cookie-boost")?.purchased
    const spawnTime = luckyUpgrade ? 30000 : 60000 // 30s or 60s

    const spawnGoldenCookie = () => {
      if (!goldenCookieActive && Math.random() < 0.3) {
        setGoldenCookiePosition({
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20
        })
        setGoldenCookieActive(true)

        // Auto-hide after 10 seconds
        setTimeout(() => setGoldenCookieActive(false), 10000)
      }
    }

    const interval = setInterval(spawnGoldenCookie, spawnTime)
    return () => clearInterval(interval)
  }, [goldenCookieActive, upgrades])

  // Save game
  useEffect(() => {
    const save = () => {
      const saveData = {
        cookies,
        totalCookies,
        totalClicks,
        clickMultiplier,
        cpsMultiplier,
        buildings: buildings.map(b => ({ id: b.id, owned: b.owned, baseCps: b.baseCps })),
        upgrades: upgrades.filter(u => u.purchased).map(u => u.id),
        achievements: achievements.filter(a => a.unlocked).map(a => a.id)
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
      lastSaveRef.current = Date.now()
    }

    const interval = setInterval(save, 30000) // Auto-save every 30 seconds
    return () => {
      save() // Save on unmount
      clearInterval(interval)
    }
  }, [cookies, totalCookies, totalClicks, clickMultiplier, cpsMultiplier, buildings, upgrades, achievements])

  // Load game
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setCookies(data.cookies || 0)
        setTotalCookies(data.totalCookies || 0)
        setTotalClicks(data.totalClicks || 0)
        setClickMultiplier(data.clickMultiplier || 1)
        setCpsMultiplier(data.cpsMultiplier || 1)

        if (data.buildings) {
          setBuildings(prev => prev.map(b => {
            const saved = data.buildings.find((s: { id: string }) => s.id === b.id)
            return saved ? { ...b, owned: saved.owned, baseCps: saved.baseCps } : b
          }))
        }

        if (data.upgrades) {
          setUpgrades(prev => prev.map(u => ({
            ...u,
            purchased: data.upgrades.includes(u.id)
          })))
        }

        if (data.achievements) {
          setAchievements(prev => prev.map(a => ({
            ...a,
            unlocked: data.achievements.includes(a.id)
          })))
        }
      } catch (e) {
        console.error("Failed to load save:", e)
      }
    }
  }, [])

  // Click handler
  const handleClick = (e: React.MouseEvent) => {
    const earned = cookiesPerClick * clickMultiplier
    setCookies(c => c + earned)
    setTotalCookies(t => t + earned)
    setTotalClicks(t => t + 1)

    // Add click effect
    const rect = cookieRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setClickEffects(prev => [...prev, {
        id: Date.now(),
        x,
        y,
        value: `+${formatNumber(earned)}`
      }])

      // Remove effect after animation
      setTimeout(() => {
        setClickEffects(prev => prev.filter(ef => ef.id !== Date.now()))
      }, 1000)
    }
  }

  // Golden cookie click
  const handleGoldenCookieClick = () => {
    const bonus = Math.random()
    if (bonus < 0.5) {
      // Lucky - gain cookies
      const amount = cookiesPerSecond * 60 + 100
      setCookies(c => c + amount)
      setTotalCookies(t => t + amount)
    } else {
      // Frenzy - temporary CPS boost
      setCpsMultiplier(m => m * 7)
      setTimeout(() => setCpsMultiplier(m => m / 7), 10000)
    }
    setGoldenCookieActive(false)
  }

  // Buy building
  const buyBuilding = (building: Building) => {
    const cost = getBuildingCost(building)
    if (cookies >= cost) {
      setCookies(c => c - cost)
      setBuildings(prev => prev.map(b =>
        b.id === building.id ? { ...b, owned: b.owned + 1 } : b
      ))

      // Add purchase effect
      const effectId = Date.now()
      setPurchaseEffects(prev => [...prev, { id: effectId, buildingId: building.id }])
      setTimeout(() => {
        setPurchaseEffects(prev => prev.filter(e => e.id !== effectId))
      }, 500)
    }
  }

  // Buy upgrade
  const buyUpgrade = (upgrade: Upgrade) => {
    if (cookies >= upgrade.cost && !upgrade.purchased && upgrade.requirement()) {
      setCookies(c => c - upgrade.cost)
      upgrade.effect()
      setUpgrades(prev => prev.map(u =>
        u.id === upgrade.id ? { ...u, purchased: true } : u
      ))
    }
  }

  const availableUpgrades = upgrades.filter(u => !u.purchased && u.requirement())
  const unlockedAchievements = achievements.filter(a => a.unlocked)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto">
        <Link to="/games">
          <Button variant="outline" size="sm" className="bg-black/30 border-white/20 text-white hover:bg-black/50">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-4 text-white/80 text-sm">
          <span>{unlockedAchievements.length}/{achievements.length} achievements</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Cookie and stats */}
        <div className="lg:col-span-1 flex flex-col items-center">
          {/* Cookie display */}
          <Card className="w-full bg-black/30 border-amber-500/30 p-6 text-center mb-4">
            <h1 className="text-4xl font-bold text-amber-100 mb-2">
              {formatNumber(cookies)}
            </h1>
            <p className="text-amber-200/60">cookies</p>
            <p className="text-sm text-amber-300/80 mt-2">
              per second: {formatNumber(cookiesPerSecond)}
            </p>
          </Card>

          {/* The big cookie */}
          <div
            ref={cookieRef}
            onClick={handleClick}
            className="relative w-64 h-64 cursor-pointer select-none"
          >
            <div className="absolute inset-0 flex items-center justify-center text-[180px] transition-transform active:scale-95 hover:scale-105">
              🍪
            </div>

            {/* Click effects */}
            {clickEffects.map(effect => (
              <div
                key={effect.id}
                className="absolute pointer-events-none text-amber-200 font-bold text-xl animate-float-up"
                style={{ left: effect.x, top: effect.y }}
              >
                {effect.value}
              </div>
            ))}
          </div>

          {/* Golden cookie */}
          {goldenCookieActive && (
            <div
              onClick={handleGoldenCookieClick}
              className="fixed cursor-pointer animate-pulse z-50"
              style={{ left: `${goldenCookiePosition.x}%`, top: `${goldenCookiePosition.y}%` }}
            >
              <div className="text-6xl hover:scale-110 transition-transform drop-shadow-[0_0_30px_gold]">
                ✨🍪✨
              </div>
            </div>
          )}

          {/* Stats */}
          <Card className="w-full bg-black/30 border-amber-500/30 p-4 mt-4">
            <h3 className="text-amber-200 font-bold mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Stats
            </h3>
            <div className="text-sm text-amber-100/70 space-y-1">
              <p>Total cookies: {formatNumber(totalCookies)}</p>
              <p>Total clicks: {totalClicks.toLocaleString()}</p>
              <p>Click power: {formatNumber(cookiesPerClick * clickMultiplier)}</p>
              <p>Buildings owned: {buildings.reduce((sum, b) => sum + b.owned, 0)}</p>
            </div>
          </Card>
        </div>

        {/* Middle column - Buildings */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-amber-100 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5" /> Buildings
          </h2>
          <div className="space-y-2">
            {buildings.map(building => {
              const cost = getBuildingCost(building)
              const canAfford = cookies >= cost
              const isPurchasing = purchaseEffects.some(e => e.buildingId === building.id)
              return (
                <Card
                  key={building.id}
                  onClick={() => canAfford && buyBuilding(building)}
                  className={cn(
                    "p-3 cursor-pointer transition-all relative overflow-hidden",
                    canAfford
                      ? "bg-amber-900/50 border-amber-500/30 hover:bg-amber-800/50 hover:scale-[1.02]"
                      : "bg-black/30 border-gray-600/30 opacity-60 cursor-not-allowed",
                    isPurchasing && "ring-2 ring-green-400 bg-green-900/30"
                  )}
                >
                  {/* Purchase flash effect */}
                  {isPurchasing && (
                    <div className="absolute inset-0 bg-green-400/30 animate-ping" />
                  )}
                  <div className="flex items-center gap-3 relative">
                    <span className={cn(
                      "text-3xl transition-transform",
                      isPurchasing && "scale-125"
                    )}>
                      {building.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-amber-100">{building.name}</span>
                        <span className={cn(
                          "text-sm font-bold px-2 py-0.5 rounded",
                          isPurchasing ? "text-green-300 bg-green-900/50" : "text-amber-300/80"
                        )}>
                          {building.owned}
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/60">{building.description}</p>
                      <p className="text-xs text-amber-400">
                        Cost: {formatNumber(cost)} | +{formatNumber(building.baseCps * cpsMultiplier)}/s
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Right column - Upgrades and Achievements */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upgrades */}
          <div>
            <h2 className="text-xl font-bold text-amber-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Upgrades
            </h2>
            {availableUpgrades.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableUpgrades.map(upgrade => {
                  const canAfford = cookies >= upgrade.cost
                  return (
                    <div
                      key={upgrade.id}
                      onClick={() => canAfford && buyUpgrade(upgrade)}
                      className={cn(
                        "w-14 h-14 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all",
                        canAfford
                          ? "bg-amber-600/50 hover:bg-amber-500/50 border-2 border-amber-400"
                          : "bg-black/30 border border-gray-600/30 opacity-60 cursor-not-allowed"
                      )}
                      title={`${upgrade.name}\n${upgrade.description}\nCost: ${formatNumber(upgrade.cost)}`}
                    >
                      {upgrade.icon}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-amber-200/60 text-sm">Keep playing to unlock upgrades!</p>
            )}
          </div>

          {/* Achievements */}
          <div>
            <h2 className="text-xl font-bold text-amber-100 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5" /> Achievements ({unlockedAchievements.length}/{achievements.length})
            </h2>
            <div className="grid grid-cols-6 gap-2">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xl",
                    achievement.unlocked
                      ? "bg-amber-500/50 border border-amber-400"
                      : "bg-black/30 border border-gray-600/30 grayscale opacity-40"
                  )}
                  title={achievement.unlocked ? `${achievement.name}: ${achievement.description}` : "???"}
                >
                  {achievement.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Recent achievements */}
          {unlockedAchievements.length > 0 && (
            <Card className="bg-black/30 border-amber-500/30 p-4">
              <h3 className="text-amber-200 font-bold mb-2">Recent Unlocks</h3>
              <div className="space-y-1">
                {unlockedAchievements.slice(-3).map(a => (
                  <div key={a.id} className="text-sm text-amber-100/70 flex items-center gap-2">
                    <span>{a.icon}</span>
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* CSS for float animation */}
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
