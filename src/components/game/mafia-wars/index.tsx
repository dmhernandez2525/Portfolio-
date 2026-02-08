// ========================================
// MAFIA WARS - MAIN GAME COMPONENT
// ========================================
// A recreation of the classic MySpace game
// ========================================

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Briefcase, 
  Swords, 
  Building2, 
  Package, 
  User, 
  Heart,
  Zap,
  Battery,
  DollarSign,
  TrendingUp,
  Shield,
  Award,
  ChevronRight,
  Lock,
  Star,
  RefreshCw,
  Skull,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { 
  GameState, 
  GameTab, 
  Job, 
  Property, 
  Equipment, 
  Opponent,
  JobResult,
  BattleResult,
  GameMessage,
  JobTier,
  SavedGameData,
} from './types'

import {
  SAVE_KEY,
  ENERGY_REGEN_INTERVAL_MS,
  STAMINA_REGEN_INTERVAL_MS,
  HEALTH_REGEN_INTERVAL_MS,
  AUTO_SAVE_INTERVAL_MS,
  MASTERY_PER_COMPLETION,
  SKILL_POINT_BONUS,
  INITIAL_PLAYER,
  INITIAL_JOBS,
  INITIAL_PROPERTIES,
  INITIAL_EQUIPMENT,
  INITIAL_ACHIEVEMENTS,
  OPPONENTS,
  getXPForLevel,
  getTierName,
  getUnlockedTiers,
  calculateTotalAttack,
  calculateTotalDefense,
  formatMoney,
  formatNumber,
} from './constants'

// ----------------------------------------
// INITIAL STATE
// ----------------------------------------

function getInitialState(): GameState {
  const now = Date.now()
  return {
    player: { ...INITIAL_PLAYER },
    mafiaSize: 1,
    jobs: INITIAL_JOBS.map(j => ({ ...j })),
    properties: INITIAL_PROPERTIES.map(p => ({ ...p })),
    equipment: INITIAL_EQUIPMENT.map(e => ({ ...e })),
    achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a })),
    wins: 0,
    losses: 0,
    battleLog: [],
    lastEnergyRegen: now,
    lastStaminaRegen: now,
    lastHealthRegen: now,
    lastIncomeCollection: now,
    lastSaved: now,
    messages: [],
  }
}

function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (!saved) return getInitialState()

    const data: SavedGameData = JSON.parse(saved)
    const initial = getInitialState()

    // Merge saved data with initial state
    return {
      ...initial,
      player: { ...initial.player, ...data.player },
      mafiaSize: data.mafiaSize ?? 1,
      jobs: initial.jobs.map(job => {
        const savedJob = data.jobs?.find(j => j.id === job.id)
        return savedJob ? { ...job, ...savedJob } : job
      }),
      properties: initial.properties.map(prop => {
        const savedProp = data.properties?.find(p => p.id === prop.id)
        return savedProp ? { ...prop, ...savedProp } : prop
      }),
      equipment: initial.equipment.map(eq => {
        const savedEq = data.equipment?.find(e => e.id === eq.id)
        return savedEq ? { ...eq, ...savedEq } : eq
      }),
      achievements: initial.achievements.map(ach => {
        const savedAch = data.achievements?.find(a => a.id === ach.id)
        return savedAch ? { ...ach, ...savedAch } : ach
      }),
      wins: data.wins ?? 0,
      losses: data.losses ?? 0,
      battleLog: [],
      lastEnergyRegen: data.lastEnergyRegen ?? Date.now(),
      lastStaminaRegen: data.lastStaminaRegen ?? Date.now(),
      lastHealthRegen: data.lastHealthRegen ?? Date.now(),
      lastIncomeCollection: data.lastIncomeCollection ?? Date.now(),
      lastSaved: data.lastSaved ?? Date.now(),
      messages: [],
    }
  } catch {
    return getInitialState()
  }
}

// ----------------------------------------
// MAIN COMPONENT
// ----------------------------------------

export function MafiaWarsGame() {
  const [state, setState] = useState<GameState>(loadGameState)
  const [activeTab, setActiveTab] = useState<GameTab>('jobs')
  const [selectedTier, setSelectedTier] = useState<JobTier>('street_thug')
  const messageIdRef = useRef(0)

  // ----------------------------------------
  // SAVE GAME
  // ----------------------------------------
  
  const saveGame = useCallback(() => {
    const saveData: SavedGameData = {
      player: state.player,
      mafiaSize: state.mafiaSize,
      jobs: state.jobs.map(j => ({
        id: j.id,
        masteryProgress: j.masteryProgress,
        masteryLevel: j.masteryLevel,
        timesCompleted: j.timesCompleted,
      })),
      properties: state.properties.map(p => ({
        id: p.id,
        owned: p.owned,
      })),
      equipment: state.equipment.map(e => ({
        id: e.id,
        owned: e.owned,
      })),
      achievements: state.achievements.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt,
      })),
      wins: state.wins,
      losses: state.losses,
      lastEnergyRegen: state.lastEnergyRegen,
      lastStaminaRegen: state.lastStaminaRegen,
      lastHealthRegen: state.lastHealthRegen,
      lastIncomeCollection: state.lastIncomeCollection,
      lastSaved: Date.now(),
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
  }, [state])

  // ----------------------------------------
  // ADD MESSAGE
  // ----------------------------------------

  const addMessage = useCallback((text: string, type: GameMessage['type'] = 'info') => {
    const id = ++messageIdRef.current
    setState(prev => ({
      ...prev,
      messages: [...(prev.messages || []).slice(-4), { id, text, type, timestamp: Date.now() }],
    }))
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        messages: (prev.messages || []).filter(m => m.id !== id),
      }))
    }, 3000)
  }, [])

  // ----------------------------------------
  // REGENERATION
  // ----------------------------------------

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setState(prev => {
        let { energy, stamina, health } = prev.player
        const { maxEnergy, maxStamina, maxHealth } = prev.player
        let { lastEnergyRegen, lastStaminaRegen, lastHealthRegen } = prev

        // Energy regen
        const energyRegens = Math.floor((now - lastEnergyRegen) / ENERGY_REGEN_INTERVAL_MS)
        if (energyRegens > 0 && energy < maxEnergy) {
          energy = Math.min(maxEnergy, energy + energyRegens)
          lastEnergyRegen = now
        }

        // Stamina regen
        const staminaRegens = Math.floor((now - lastStaminaRegen) / STAMINA_REGEN_INTERVAL_MS)
        if (staminaRegens > 0 && stamina < maxStamina) {
          stamina = Math.min(maxStamina, stamina + staminaRegens)
          lastStaminaRegen = now
        }

        // Health regen
        const healthRegens = Math.floor((now - lastHealthRegen) / HEALTH_REGEN_INTERVAL_MS)
        if (healthRegens > 0 && health < maxHealth) {
          health = Math.min(maxHealth, health + healthRegens)
          lastHealthRegen = now
        }

        return {
          ...prev,
          player: { ...prev.player, energy, stamina, health },
          lastEnergyRegen,
          lastStaminaRegen,
          lastHealthRegen,
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // ----------------------------------------
  // AUTO-SAVE
  // ----------------------------------------

  useEffect(() => {
    const interval = setInterval(saveGame, AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [saveGame])

  // Save on unmount
  useEffect(() => {
    return () => saveGame()
  }, [saveGame])

  // ----------------------------------------
  // LEVEL UP
  // ----------------------------------------

  const checkLevelUp = useCallback((currentExp: number, currentLevel: number): { newLevel: number; newExp: number; skillPointsGained: number } => {
    let level = currentLevel
    let exp = currentExp
    let skillPointsGained = 0
    let xpNeeded = getXPForLevel(level)

    while (exp >= xpNeeded) {
      exp -= xpNeeded
      level++
      skillPointsGained += 3
      xpNeeded = getXPForLevel(level)
    }

    return { newLevel: level, newExp: exp, skillPointsGained }
  }, [])

  // ----------------------------------------
  // CHECK ACHIEVEMENTS
  // ----------------------------------------

  const checkAchievements = useCallback(() => {
    setState(prev => {
      const newAchievements = prev.achievements.map(ach => {
        if (ach.unlocked) return ach

        let shouldUnlock = false
        const totalJobs = prev.jobs.reduce((sum, j) => sum + j.timesCompleted, 0)
        const totalCash = prev.player.cash + prev.player.bankedCash

        switch (ach.id) {
          case 'first_job':
            shouldUnlock = totalJobs >= 1
            break
          case 'hundred_jobs':
            shouldUnlock = totalJobs >= 100
            break
          case 'first_fight':
            shouldUnlock = prev.wins >= 1
            break
          case 'hundred_wins':
            shouldUnlock = prev.wins >= 100
            break
          case 'first_property':
            shouldUnlock = prev.properties.some(p => p.owned > 0)
            break
          case 'millionaire':
            shouldUnlock = totalCash >= 1_000_000
            break
          case 'billionaire':
            shouldUnlock = totalCash >= 1_000_000_000
            break
          case 'level_10':
            shouldUnlock = prev.player.level >= 10
            break
          case 'level_25':
            shouldUnlock = prev.player.level >= 25
            break
          case 'level_50':
            shouldUnlock = prev.player.level >= 50
            break
          case 'mastery_gold':
            shouldUnlock = prev.jobs.some(j => j.masteryLevel >= 3)
            break
          case 'fully_equipped':
            shouldUnlock = 
              prev.equipment.some(e => e.type === 'weapon' && e.owned > 0) &&
              prev.equipment.some(e => e.type === 'armor' && e.owned > 0) &&
              prev.equipment.some(e => e.type === 'vehicle' && e.owned > 0)
            break
          case 'property_mogul':
            shouldUnlock = prev.properties.every(p => p.owned > 0)
            break
          case 'beat_godfather':
            shouldUnlock = prev.battleLog.some(b => b.won && b.expEarned === 10000)
            break
        }

        if (shouldUnlock) {
          return { ...ach, unlocked: true, unlockedAt: Date.now() }
        }
        return ach
      })

      const newlyUnlocked = newAchievements.filter(
        (a, i) => a.unlocked && !prev.achievements[i].unlocked
      )

      return { ...prev, achievements: newAchievements, _newAchievements: newlyUnlocked }
    })
  }, [])

  // ----------------------------------------
  // DO JOB
  // ----------------------------------------

  const doJob = useCallback((jobId: string): JobResult => {
    let result: JobResult = {
      success: false,
      cashEarned: 0,
      expEarned: 0,
      masteryGained: 0,
      leveledUp: false,
      masteryLevelUp: false,
    }

    setState(prev => {
      const job = prev.jobs.find(j => j.id === jobId)
      if (!job) return prev
      if (prev.player.energy < job.energyCost) {
        addMessage('Not enough energy!', 'error')
        return prev
      }

      // Calculate rewards
      const cashEarned = Math.floor(
        job.cashRewardMin + Math.random() * (job.cashRewardMax - job.cashRewardMin)
      )
      const expEarned = job.expReward

      // Update player
      const newEnergy = prev.player.energy - job.energyCost
      const newExp = prev.player.experience + expEarned
      const { newLevel, newExp: remainingExp, skillPointsGained } = checkLevelUp(newExp, prev.player.level)
      const leveledUp = newLevel > prev.player.level

      // Update job mastery
      let newMasteryProgress = job.masteryProgress + MASTERY_PER_COMPLETION
      let newMasteryLevel = job.masteryLevel
      let masteryLevelUp = false

      if (newMasteryProgress >= 100 && newMasteryLevel < 3) {
        newMasteryProgress = 0
        newMasteryLevel++
        masteryLevelUp = true
      } else if (newMasteryLevel >= 3) {
        newMasteryProgress = 100
      }

      result = {
        success: true,
        cashEarned,
        expEarned,
        masteryGained: MASTERY_PER_COMPLETION,
        leveledUp,
        masteryLevelUp,
      }

      const message = leveledUp 
        ? `Level Up! You are now level ${newLevel}! +${formatMoney(cashEarned)} +${expEarned} XP`
        : `Job complete! +${formatMoney(cashEarned)} +${expEarned} XP`
      addMessage(message, leveledUp ? 'success' : 'info')

      return {
        ...prev,
        player: {
          ...prev.player,
          energy: newEnergy,
          experience: remainingExp,
          experienceToLevel: getXPForLevel(newLevel),
          level: newLevel,
          cash: prev.player.cash + cashEarned,
          skillPoints: prev.player.skillPoints + skillPointsGained,
          // Restore full stats on level up
          ...(leveledUp ? {
            energy: prev.player.maxEnergy,
            stamina: prev.player.maxStamina,
            health: prev.player.maxHealth,
          } : {}),
        },
        jobs: prev.jobs.map(j => 
          j.id === jobId 
            ? { ...j, masteryProgress: newMasteryProgress, masteryLevel: newMasteryLevel, timesCompleted: j.timesCompleted + 1 }
            : j
        ),
        lastEnergyRegen: Date.now(),
      }
    })

    setTimeout(checkAchievements, 100)
    return result
  }, [addMessage, checkLevelUp, checkAchievements])

  // ----------------------------------------
  // FIGHT OPPONENT
  // ----------------------------------------

  const fightOpponent = useCallback((opponentId: string): BattleResult | null => {
    let result: BattleResult | null = null

    setState(prev => {
      const opponent = OPPONENTS.find(o => o.id === opponentId)
      if (!opponent) return prev

      const staminaCost = 5 + Math.floor(opponent.level / 10)
      if (prev.player.stamina < staminaCost) {
        addMessage('Not enough stamina!', 'error')
        return prev
      }

      // Calculate combat power
      const playerAttack = calculateTotalAttack(prev.player, prev.equipment) + (prev.mafiaSize * 2)
      const playerDefense = calculateTotalDefense(prev.player, prev.equipment) + prev.mafiaSize

      // Simple combat formula with randomness
      const playerPower = playerAttack + Math.random() * 20
      const opponentPower = opponent.attack + Math.random() * 20
      const won = playerPower > opponentPower * 0.8

      // Calculate damage
      const playerDamageDealt = won ? Math.floor(playerAttack * (0.8 + Math.random() * 0.4)) : Math.floor(playerAttack * 0.3)
      const opponentDamageDealt = won ? Math.floor(opponent.attack * 0.2) : Math.floor(opponent.attack * (0.5 + Math.random() * 0.5))
      const damageReduced = Math.floor(opponentDamageDealt * (playerDefense / (playerDefense + 100)))
      const finalDamage = Math.max(1, opponentDamageDealt - damageReduced)

      // Rewards (only on win)
      const cashEarned = won 
        ? Math.floor(opponent.cashRewardMin + Math.random() * (opponent.cashRewardMax - opponent.cashRewardMin))
        : 0
      const expEarned = won ? opponent.expReward : Math.floor(opponent.expReward * 0.1)

      // Handle level up
      const newExp = prev.player.experience + expEarned
      const { newLevel, newExp: remainingExp, skillPointsGained } = checkLevelUp(newExp, prev.player.level)
      const leveledUp = newLevel > prev.player.level

      result = {
        won,
        playerDamageDealt,
        opponentDamageDealt: finalDamage,
        cashEarned,
        expEarned,
        timestamp: Date.now(),
      }

      const message = won
        ? `Victory! Defeated ${opponent.name}! +${formatMoney(cashEarned)}`
        : `Defeated by ${opponent.name}! Lost ${finalDamage} health.`
      addMessage(message, won ? 'success' : 'warning')

      return {
        ...prev,
        player: {
          ...prev.player,
          stamina: prev.player.stamina - staminaCost,
          health: Math.max(0, prev.player.health - finalDamage),
          cash: prev.player.cash + cashEarned,
          experience: remainingExp,
          experienceToLevel: getXPForLevel(newLevel),
          level: newLevel,
          skillPoints: prev.player.skillPoints + skillPointsGained,
          ...(leveledUp ? {
            energy: prev.player.maxEnergy,
            stamina: prev.player.maxStamina,
            health: prev.player.maxHealth,
          } : {}),
        },
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
        battleLog: [...prev.battleLog.slice(-9), result!],
        lastStaminaRegen: Date.now(),
      }
    })

    setTimeout(checkAchievements, 100)
    return result
  }, [addMessage, checkLevelUp, checkAchievements])

  // ----------------------------------------
  // BUY PROPERTY
  // ----------------------------------------

  const buyProperty = useCallback((propId: string) => {
    setState(prev => {
      const prop = prev.properties.find(p => p.id === propId)
      if (!prop) return prev
      if (prop.owned >= prop.maxOwnable) {
        addMessage('You own the maximum of this property!', 'warning')
        return prev
      }
      if (prev.player.cash < prop.cost) {
        addMessage('Not enough cash!', 'error')
        return prev
      }

      addMessage(`Purchased ${prop.name}!`, 'success')
      return {
        ...prev,
        player: { ...prev.player, cash: prev.player.cash - prop.cost },
        properties: prev.properties.map(p =>
          p.id === propId ? { ...p, owned: p.owned + 1 } : p
        ),
      }
    })
    setTimeout(checkAchievements, 100)
  }, [addMessage, checkAchievements])

  // ----------------------------------------
  // COLLECT INCOME
  // ----------------------------------------

  const calculatePendingIncome = useCallback(() => {
    const now = Date.now()
    const hoursPassed = (now - state.lastIncomeCollection) / (1000 * 60 * 60)
    return state.properties.reduce(
      (sum, p) => sum + (p.owned * p.incomePerHour * hoursPassed),
      0
    )
  }, [state.lastIncomeCollection, state.properties])

  const collectIncome = useCallback(() => {
    const income = Math.floor(calculatePendingIncome())
    if (income <= 0) {
      addMessage('No income to collect yet!', 'info')
      return
    }

    setState(prev => ({
      ...prev,
      player: { ...prev.player, cash: prev.player.cash + income },
      lastIncomeCollection: Date.now(),
    }))
    addMessage(`Collected ${formatMoney(income)} from properties!`, 'success')
    setTimeout(checkAchievements, 100)
  }, [calculatePendingIncome, addMessage, checkAchievements])

  // ----------------------------------------
  // BUY EQUIPMENT
  // ----------------------------------------

  const buyEquipment = useCallback((eqId: string) => {
    setState(prev => {
      const eq = prev.equipment.find(e => e.id === eqId)
      if (!eq) return prev
      if (prev.player.cash < eq.cost) {
        addMessage('Not enough cash!', 'error')
        return prev
      }

      addMessage(`Acquired ${eq.name}!`, 'success')
      return {
        ...prev,
        player: { ...prev.player, cash: prev.player.cash - eq.cost },
        equipment: prev.equipment.map(e =>
          e.id === eqId ? { ...e, owned: e.owned + 1 } : e
        ),
      }
    })
    setTimeout(checkAchievements, 100)
  }, [addMessage, checkAchievements])

  // ----------------------------------------
  // ALLOCATE SKILL POINTS
  // ----------------------------------------

  const allocateSkillPoint = useCallback((stat: 'attack' | 'defense' | 'energy' | 'stamina') => {
    setState(prev => {
      if (prev.player.skillPoints <= 0) {
        addMessage('No skill points available!', 'error')
        return prev
      }

      const bonus = SKILL_POINT_BONUS[stat]
      const allocatedKey = `allocated${stat.charAt(0).toUpperCase() + stat.slice(1)}` as 
        'allocatedAttack' | 'allocatedDefense' | 'allocatedEnergy' | 'allocatedStamina'
      
      const updates: Partial<typeof prev.player> = {
        skillPoints: prev.player.skillPoints - 1,
        [allocatedKey]: prev.player[allocatedKey] + 1,
      }

      if (stat === 'energy') {
        updates.maxEnergy = prev.player.maxEnergy + bonus
        updates.energy = prev.player.energy + bonus
      } else if (stat === 'stamina') {
        updates.maxStamina = prev.player.maxStamina + bonus
        updates.stamina = prev.player.stamina + bonus
      }

      addMessage(`+${bonus} ${stat}!`, 'success')
      return {
        ...prev,
        player: { ...prev.player, ...updates },
      }
    })
  }, [addMessage])

  // ----------------------------------------
  // BANK OPERATIONS
  // ----------------------------------------

  const depositCash = useCallback((amount: number) => {
    setState(prev => {
      const toDeposit = Math.min(amount, prev.player.cash)
      if (toDeposit <= 0) return prev
      return {
        ...prev,
        player: {
          ...prev.player,
          cash: prev.player.cash - toDeposit,
          bankedCash: prev.player.bankedCash + toDeposit,
        },
      }
    })
  }, [])

  const withdrawCash = useCallback((amount: number) => {
    setState(prev => {
      const toWithdraw = Math.min(amount, prev.player.bankedCash)
      if (toWithdraw <= 0) return prev
      return {
        ...prev,
        player: {
          ...prev.player,
          cash: prev.player.cash + toWithdraw,
          bankedCash: prev.player.bankedCash - toWithdraw,
        },
      }
    })
  }, [])

  // ----------------------------------------
  // RESET GAME
  // ----------------------------------------

  const resetGame = useCallback(() => {
    if (!confirm('Are you sure you want to reset your progress? This cannot be undone!')) return
    localStorage.removeItem(SAVE_KEY)
    setState(getInitialState())
    addMessage('Game reset. Start your new criminal empire!', 'info')
  }, [addMessage])

  // ----------------------------------------
  // COMPUTED VALUES
  // ----------------------------------------

  const totalAttack = useMemo(() => calculateTotalAttack(state.player, state.equipment), [state.player, state.equipment])
  const totalDefense = useMemo(() => calculateTotalDefense(state.player, state.equipment), [state.player, state.equipment])
  const unlockedTiers = useMemo(() => getUnlockedTiers(state.player.level), [state.player.level])
  const pendingIncome = useMemo(() => Math.floor(calculatePendingIncome()), [calculatePendingIncome])
  const hourlyIncome = useMemo(() => 
    state.properties.reduce((sum, p) => sum + (p.owned * p.incomePerHour), 0),
    [state.properties]
  )

  // ----------------------------------------
  // RENDER
  // ----------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-amber-900/30">
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/games">
                <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-300">
                MAFIA WARS
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Lv.{state.player.level}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>{formatMoney(state.player.cash)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Resource Bars */}
      <div className="bg-black/40 border-b border-zinc-700/50 py-2">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Energy */}
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 transition-all duration-300"
                  style={{ width: `${(state.player.energy / state.player.maxEnergy) * 100}%` }}
                />
              </div>
              <span>{state.player.energy}/{state.player.maxEnergy}</span>
            </div>
            {/* Stamina */}
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-blue-500" />
              <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(state.player.stamina / state.player.maxStamina) * 100}%` }}
                />
              </div>
              <span>{state.player.stamina}/{state.player.maxStamina}</span>
            </div>
            {/* Health */}
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(state.player.health / state.player.maxHealth) * 100}%` }}
                />
              </div>
              <span>{state.player.health}/{state.player.maxHealth}</span>
            </div>
            {/* XP */}
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${(state.player.experience / state.player.experienceToLevel) * 100}%` }}
                />
              </div>
              <span>{state.player.experience}/{state.player.experienceToLevel} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="bg-zinc-800/50 border-b border-zinc-700/50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {([
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'fight', label: 'Fight', icon: Swords },
              { id: 'properties', label: 'Properties', icon: Building2 },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'profile', label: 'Profile', icon: User },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.id 
                    ? 'border-amber-500 text-amber-500' 
                    : 'border-transparent text-zinc-400 hover:text-white'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Tier Selector */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(['street_thug', 'associate', 'soldier', 'capo', 'underboss', 'boss'] as JobTier[]).map(tier => {
                  const unlocked = unlockedTiers.includes(tier)
                  return (
                    <button
                      key={tier}
                      onClick={() => unlocked && setSelectedTier(tier)}
                      disabled={!unlocked}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
                        selectedTier === tier && unlocked
                          ? 'bg-amber-600 text-white'
                          : unlocked
                            ? 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      )}
                    >
                      {!unlocked && <Lock className="w-3 h-3" />}
                      {getTierName(tier)}
                    </button>
                  )
                })}
              </div>

              {/* Jobs Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {state.jobs
                  .filter(j => j.tier === selectedTier)
                  .map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      energy={state.player.energy}
                      onExecute={() => doJob(job.id)}
                    />
                  ))}
              </div>
            </motion.div>
          )}

          {/* FIGHT TAB */}
          {activeTab === 'fight' && (
            <motion.div
              key="fight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Swords className="w-5 h-5 text-red-500" />
                      <span>Attack: {totalAttack}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span>Defense: {totalDefense}</span>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400">
                    W: {state.wins} / L: {state.losses}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {OPPONENTS.map(opp => (
                  <OpponentCard
                    key={opp.id}
                    opponent={opp}
                    playerLevel={state.player.level}
                    stamina={state.player.stamina}
                    onFight={() => fightOpponent(opp.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <motion.div
              key="properties"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-6 p-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-700/50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-sm text-green-400">Pending Income</div>
                    <div className="text-2xl font-bold text-green-500">{formatMoney(pendingIncome)}</div>
                    <div className="text-xs text-zinc-400">{formatMoney(hourlyIncome)}/hour</div>
                  </div>
                  <Button 
                    onClick={collectIncome}
                    className="bg-green-600 hover:bg-green-500"
                    disabled={pendingIncome < 1}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Collect
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {state.properties.map(prop => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    cash={state.player.cash}
                    onBuy={() => buyProperty(prop.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {(['weapon', 'armor', 'vehicle'] as const).map(type => (
                <div key={type} className="mb-8">
                  <h3 className="text-lg font-bold mb-4 capitalize flex items-center gap-2">
                    {type === 'weapon' && <Swords className="w-5 h-5 text-red-500" />}
                    {type === 'armor' && <Shield className="w-5 h-5 text-blue-500" />}
                    {type === 'vehicle' && <ChevronRight className="w-5 h-5 text-purple-500" />}
                    {type}s
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {state.equipment
                      .filter(e => e.type === type)
                      .map(eq => (
                        <EquipmentCard
                          key={eq.id}
                          equipment={eq}
                          cash={state.player.cash}
                          onBuy={() => buyEquipment(eq.id)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stats Overview */}
              <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  {state.player.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-zinc-400">Level</div>
                    <div className="text-xl font-bold">{state.player.level}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Mafia Size</div>
                    <div className="text-xl font-bold">{state.mafiaSize}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Total Attack</div>
                    <div className="text-xl font-bold text-red-500">{totalAttack}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Total Defense</div>
                    <div className="text-xl font-bold text-blue-500">{totalDefense}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Cash</div>
                    <div className="text-xl font-bold text-green-500">{formatMoney(state.player.cash)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Banked</div>
                    <div className="text-xl font-bold text-yellow-500">{formatMoney(state.player.bankedCash)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Wins</div>
                    <div className="text-xl font-bold">{formatNumber(state.wins)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-400">Losses</div>
                    <div className="text-xl font-bold">{formatNumber(state.losses)}</div>
                  </div>
                </div>
              </div>

              {/* Bank */}
              <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-500" />
                  Bank
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => depositCash(Math.floor(state.player.cash * 0.1))}
                  >
                    Deposit 10%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => depositCash(state.player.cash)}
                  >
                    Deposit All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => withdrawCash(Math.floor(state.player.bankedCash * 0.1))}
                  >
                    Withdraw 10%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => withdrawCash(state.player.bankedCash)}
                  >
                    Withdraw All
                  </Button>
                </div>
              </div>

              {/* Skill Points */}
              {state.player.skillPoints > 0 && (
                <div className="p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-700/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Skill Points: {state.player.skillPoints}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['attack', 'defense', 'energy', 'stamina'] as const).map(stat => (
                      <Button
                        key={stat}
                        variant="outline"
                        onClick={() => allocateSkillPoint(stat)}
                        className="capitalize"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {stat} (+{SKILL_POINT_BONUS[stat]})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div className="p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Achievements ({state.achievements.filter(a => a.unlocked).length}/{state.achievements.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {state.achievements.map(ach => (
                    <div
                      key={ach.id}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-colors',
                        ach.unlocked
                          ? 'bg-amber-900/30 border-amber-700/50'
                          : 'bg-zinc-800/50 border-zinc-700/50 opacity-50'
                      )}
                    >
                      <div className="text-2xl mb-1">{ach.icon}</div>
                      <div className="text-xs font-medium">{ach.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="text-center pt-4">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={resetGame}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Game
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Messages Toast */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {(state.messages || []).map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={cn(
                'px-4 py-2 rounded-lg shadow-lg text-sm font-medium max-w-xs',
                msg.type === 'success' && 'bg-green-600 text-white',
                msg.type === 'error' && 'bg-red-600 text-white',
                msg.type === 'warning' && 'bg-amber-600 text-white',
                msg.type === 'info' && 'bg-zinc-700 text-white',
              )}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ----------------------------------------
// SUB-COMPONENTS
// ----------------------------------------

interface JobCardProps {
  job: Job
  energy: number
  onExecute: () => void
}

function JobCard({ job, energy, onExecute }: JobCardProps) {
  const canAfford = energy >= job.energyCost
  const masteryColors = ['text-zinc-500', 'text-amber-700', 'text-zinc-400', 'text-yellow-500']

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-amber-700/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold">{job.name}</h4>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <Star
              key={i}
              className={cn(
                'w-4 h-4',
                i < job.masteryLevel ? masteryColors[job.masteryLevel] : 'text-zinc-700'
              )}
              fill={i < job.masteryLevel ? 'currentColor' : 'none'}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{job.description}</p>
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-green-500" />
          {formatMoney(job.cashRewardMin)} - {formatMoney(job.cashRewardMax)}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-purple-500" />
          +{job.expReward} XP
        </span>
      </div>
      {job.masteryLevel < 3 && (
        <div className="mb-3">
          <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${job.masteryProgress}%` }}
            />
          </div>
          <div className="text-xs text-zinc-500 mt-1">{job.masteryProgress}% to next mastery</div>
        </div>
      )}
      <Button
        onClick={onExecute}
        disabled={!canAfford}
        className="w-full"
        size="sm"
      >
        <Zap className="w-4 h-4 mr-1" />
        Do Job ({job.energyCost} Energy)
      </Button>
    </div>
  )
}

interface OpponentCardProps {
  opponent: Opponent
  playerLevel: number
  stamina: number
  onFight: () => void
}

function OpponentCard({ opponent, playerLevel, stamina, onFight }: OpponentCardProps) {
  const staminaCost = 5 + Math.floor(opponent.level / 10)
  const canFight = stamina >= staminaCost
  const levelDiff = playerLevel - opponent.level
  const difficulty = levelDiff >= 10 ? 'Easy' : levelDiff >= 0 ? 'Fair' : levelDiff >= -10 ? 'Hard' : 'Deadly'
  const difficultyColor = {
    Easy: 'text-green-500',
    Fair: 'text-yellow-500',
    Hard: 'text-orange-500',
    Deadly: 'text-red-500',
  }[difficulty]

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-red-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{opponent.icon}</div>
        <div>
          <h4 className="font-bold">{opponent.name}</h4>
          <div className={cn('text-xs', difficultyColor)}>
            Lv.{opponent.level} • {difficulty}
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{opponent.description}</p>
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
        <span>ATK: {opponent.attack} / DEF: {opponent.defense}</span>
        <span className="text-green-500">{formatMoney(opponent.cashRewardMin)}-{formatMoney(opponent.cashRewardMax)}</span>
      </div>
      <Button
        onClick={onFight}
        disabled={!canFight}
        variant="destructive"
        className="w-full"
        size="sm"
      >
        <Skull className="w-4 h-4 mr-1" />
        Attack ({staminaCost} Stamina)
      </Button>
    </div>
  )
}

interface PropertyCardProps {
  property: Property
  cash: number
  onBuy: () => void
}

function PropertyCard({ property, cash, onBuy }: PropertyCardProps) {
  const canAfford = cash >= property.cost
  const maxedOut = property.owned >= property.maxOwnable

  return (
    <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 hover:border-green-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-3xl">{property.icon}</div>
        <div>
          <h4 className="font-bold">{property.name}</h4>
          <div className="text-xs text-zinc-400">
            Owned: {property.owned}/{property.maxOwnable}
          </div>
        </div>
      </div>
      <p className="text-sm text-zinc-400 mb-3">{property.description}</p>
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-green-500">+{formatMoney(property.incomePerHour)}/hr</span>
        <span className="text-zinc-400">{formatMoney(property.cost)}</span>
      </div>
      <Button
        onClick={onBuy}
        disabled={!canAfford || maxedOut}
        className="w-full bg-green-600 hover:bg-green-500"
        size="sm"
      >
        {maxedOut ? 'Maxed Out' : `Buy (${formatMoney(property.cost)})`}
      </Button>
    </div>
  )
}

interface EquipmentCardProps {
  equipment: Equipment
  cash: number
  onBuy: () => void
}

function EquipmentCard({ equipment, cash, onBuy }: EquipmentCardProps) {
  const canAfford = cash >= equipment.cost

  return (
    <div className={cn(
      'p-3 rounded-lg border transition-colors',
      equipment.owned > 0 
        ? 'bg-amber-900/20 border-amber-700/50' 
        : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600/50'
    )}>
      <div className="text-2xl text-center mb-1">{equipment.icon}</div>
      <h5 className="font-medium text-sm text-center mb-1">{equipment.name}</h5>
      <div className="text-xs text-center text-zinc-400 mb-2">
        {equipment.attackBonus > 0 && <span className="text-red-400">+{equipment.attackBonus} ATK</span>}
        {equipment.attackBonus > 0 && equipment.defenseBonus > 0 && ' / '}
        {equipment.defenseBonus > 0 && <span className="text-blue-400">+{equipment.defenseBonus} DEF</span>}
      </div>
      {equipment.owned > 0 && (
        <div className="text-xs text-center text-amber-500 mb-2">
          Owned: {equipment.owned}
        </div>
      )}
      <Button
        onClick={onBuy}
        disabled={!canAfford}
        variant="outline"
        size="sm"
        className="w-full text-xs"
      >
        {formatMoney(equipment.cost)}
      </Button>
    </div>
  )
}

export default MafiaWarsGame
