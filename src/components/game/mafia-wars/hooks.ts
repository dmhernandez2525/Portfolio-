// ========================================
// MAFIA WARS - CUSTOM HOOKS
// ========================================

import { useCallback, useEffect, useRef, useMemo } from 'react'
import type {
  GameState,
  JobResult,
  BattleResult,
  GameMessage,
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
  calculateTotalAttack,
  calculateTotalDefense,
  formatMoney,
} from './constants'

// ----------------------------------------
// INITIAL STATE HELPERS
// ----------------------------------------

export function getInitialState(): GameState {
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

export function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(SAVE_KEY)
    if (!saved) return getInitialState()

    const data: SavedGameData = JSON.parse(saved)
    const initial = getInitialState()

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
// SAVE GAME HOOK
// ----------------------------------------

export function useSaveGame(state: GameState) {
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

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(saveGame, AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [saveGame])

  // Save on unmount
  useEffect(() => {
    return () => saveGame()
  }, [saveGame])

  return saveGame
}

// ----------------------------------------
// MESSAGE HOOK
// ----------------------------------------

export function useMessages(
  setState: React.Dispatch<React.SetStateAction<GameState>>
) {
  const messageIdRef = useRef(0)
  const lastMessageRef = useRef<{ text: string; timestamp: number }>({ text: '', timestamp: 0 })

  const addMessage = useCallback(
    (text: string, type: GameMessage['type'] = 'info') => {
      // Prevent duplicate messages within 500ms
      const now = Date.now()
      if (lastMessageRef.current.text === text && now - lastMessageRef.current.timestamp < 500) {
        return
      }
      lastMessageRef.current = { text, timestamp: now }

      const id = ++messageIdRef.current
      setState(prev => ({
        ...prev,
        messages: [...(prev.messages || []).slice(-4), { id, text, type, timestamp: now }],
      }))
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          messages: (prev.messages || []).filter(m => m.id !== id),
        }))
      }, 3000)
    },
    [setState]
  )

  return addMessage
}

// ----------------------------------------
// REGENERATION HOOK
// ----------------------------------------

export function useRegeneration(
  setState: React.Dispatch<React.SetStateAction<GameState>>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setState(prev => {
        let { energy, stamina, health } = prev.player
        const { maxEnergy, maxStamina, maxHealth } = prev.player
        let { lastEnergyRegen, lastStaminaRegen, lastHealthRegen } = prev

        const energyRegens = Math.floor((now - lastEnergyRegen) / ENERGY_REGEN_INTERVAL_MS)
        if (energyRegens > 0 && energy < maxEnergy) {
          energy = Math.min(maxEnergy, energy + energyRegens)
          lastEnergyRegen = now
        }

        const staminaRegens = Math.floor((now - lastStaminaRegen) / STAMINA_REGEN_INTERVAL_MS)
        if (staminaRegens > 0 && stamina < maxStamina) {
          stamina = Math.min(maxStamina, stamina + staminaRegens)
          lastStaminaRegen = now
        }

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
  }, [setState])
}

// ----------------------------------------
// LEVEL UP HELPER
// ----------------------------------------

export function useLevelUp() {
  return useCallback(
    (currentExp: number, currentLevel: number): { newLevel: number; newExp: number; skillPointsGained: number } => {
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
    },
    []
  )
}

// ----------------------------------------
// ACHIEVEMENTS HOOK
// ----------------------------------------

export function useAchievements(
  setState: React.Dispatch<React.SetStateAction<GameState>>
) {
  return useCallback(() => {
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

      return { ...prev, achievements: newAchievements }
    })
  }, [setState])
}

// ----------------------------------------
// GAME ACTIONS HOOK
// ----------------------------------------

interface UseGameActionsProps {
  setState: React.Dispatch<React.SetStateAction<GameState>>
  addMessage: (text: string, type?: GameMessage['type']) => void
  checkLevelUp: (exp: number, level: number) => { newLevel: number; newExp: number; skillPointsGained: number }
  checkAchievements: () => void
}

export function useGameActions({
  setState,
  addMessage,
  checkLevelUp,
  checkAchievements,
}: UseGameActionsProps) {
  // Debounce ref to prevent React StrictMode double-execution
  const lastActionRef = useRef<{ action: string; time: number }>({ action: '', time: 0 })
  
  const isDebounced = (actionId: string): boolean => {
    const now = Date.now()
    if (lastActionRef.current.action === actionId && now - lastActionRef.current.time < 300) {
      return true // Skip, already executed
    }
    lastActionRef.current = { action: actionId, time: now }
    return false
  }
  // DO JOB
  const doJob = useCallback(
    (jobId: string): JobResult => {
      // Skip if debounced (React StrictMode protection)
      if (isDebounced(`job-${jobId}`)) {
        return { success: false, cashEarned: 0, expEarned: 0, masteryGained: 0, leveledUp: false, masteryLevelUp: false }
      }
      
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
        
        // Check item requirements if job has any
        if (job.itemRequirement) {
          const reqItem = prev.equipment.find(e => e.id === job.itemRequirement!.itemId)
          if (!reqItem || reqItem.owned < job.itemRequirement.quantity) {
            addMessage(`Requires ${job.itemRequirement.quantity}x item to perform this job!`, 'error')
            return prev
          }
        }

        const cashEarned = Math.floor(
          job.cashRewardMin + Math.random() * (job.cashRewardMax - job.cashRewardMin)
        )
        const expEarned = job.expReward

        const newEnergy = prev.player.energy - job.energyCost
        const newExp = prev.player.experience + expEarned
        const { newLevel, newExp: remainingExp, skillPointsGained } = checkLevelUp(newExp, prev.player.level)
        const leveledUp = newLevel > prev.player.level

        let newMasteryProgress = job.masteryProgress + MASTERY_PER_COMPLETION
        let newMasteryLevel = job.masteryLevel
        let masteryLevelUp = false
        let masterySkillPoint = 0

        if (newMasteryProgress >= 100 && newMasteryLevel < 3) {
          newMasteryProgress = 0
          newMasteryLevel++
          masteryLevelUp = true
          masterySkillPoint = 1 // Award skill point for mastery level up
        } else if (newMasteryLevel >= 3) {
          newMasteryProgress = 100
        }

        // Loot drop chance (increases with mastery level)
        const lootChance = 0.05 + (job.masteryLevel * 0.05) // 5% base + 5% per mastery
        let lootDrop: { itemId: string; itemName: string } | undefined
        let updatedEquipment = prev.equipment
        
        if (Math.random() < lootChance) {
          // Pick a random equipment item player doesn't have many of
          const possibleLoot = prev.equipment.filter(e => e.owned < 10)
          if (possibleLoot.length > 0) {
            const lootItem = possibleLoot[Math.floor(Math.random() * possibleLoot.length)]
            lootDrop = { itemId: lootItem.id, itemName: lootItem.name }
            updatedEquipment = prev.equipment.map(e => 
              e.id === lootItem.id ? { ...e, owned: e.owned + 1 } : e
            )
            addMessage(`Loot drop: ${lootItem.name}!`, 'success')
          }
        }

        result = {
          success: true,
          cashEarned,
          expEarned,
          masteryGained: MASTERY_PER_COMPLETION,
          leveledUp,
          masteryLevelUp,
          lootDrop,
        }

        const totalSkillPoints = skillPointsGained + masterySkillPoint
        
        let message = leveledUp
          ? `Level Up! You are now level ${newLevel}! +${formatMoney(cashEarned)} +${expEarned} XP`
          : `Job complete! +${formatMoney(cashEarned)} +${expEarned} XP`
        
        if (masteryLevelUp) {
          const masteryName = ['Bronze', 'Silver', 'Gold'][newMasteryLevel - 1]
          message += ` | ${masteryName} Mastery! +1 Skill Point`
        }
        
        addMessage(message, leveledUp || masteryLevelUp ? 'success' : 'info')

        return {
          ...prev,
          player: {
            ...prev.player,
            energy: newEnergy,
            experience: remainingExp,
            experienceToLevel: getXPForLevel(newLevel),
            level: newLevel,
            cash: prev.player.cash + cashEarned,
            skillPoints: prev.player.skillPoints + totalSkillPoints,
            ...(leveledUp
              ? {
                  energy: prev.player.maxEnergy,
                  stamina: prev.player.maxStamina,
                  health: prev.player.maxHealth,
                }
              : {}),
          },
          jobs: prev.jobs.map(j =>
            j.id === jobId
              ? { ...j, masteryProgress: newMasteryProgress, masteryLevel: newMasteryLevel, timesCompleted: j.timesCompleted + 1 }
              : j
          ),
          equipment: updatedEquipment,
          lastEnergyRegen: Date.now(),
        }
      })

      setTimeout(checkAchievements, 100)
      return result
    },
    [setState, addMessage, checkLevelUp, checkAchievements]
  )

  // FIGHT OPPONENT
  const fightOpponent = useCallback(
    (opponentId: string): BattleResult | null => {
      // Skip if debounced (React StrictMode protection)
      if (isDebounced(`fight-${opponentId}`)) {
        return null
      }
      
      let result: BattleResult | null = null

      setState(prev => {
        const opponent = OPPONENTS.find(o => o.id === opponentId)
        if (!opponent) return prev

        const staminaCost = 5 + Math.floor(opponent.level / 10)
        if (prev.player.stamina < staminaCost) {
          addMessage('Not enough stamina!', 'error')
          return prev
        }
        if (prev.player.health < 10) {
          addMessage('Too injured to fight! Rest or wait for health to regenerate.', 'error')
          return prev
        }

        const playerAttack = calculateTotalAttack(prev.player, prev.equipment) + prev.mafiaSize * 2
        const playerDefense = calculateTotalDefense(prev.player, prev.equipment) + prev.mafiaSize

        const playerPower = playerAttack + Math.random() * 20
        const opponentPower = opponent.attack + Math.random() * 20
        const won = playerPower > opponentPower * 0.8

        const playerDamageDealt = won
          ? Math.floor(playerAttack * (0.8 + Math.random() * 0.4))
          : Math.floor(playerAttack * 0.3)
        const opponentDamageDealt = won
          ? Math.floor(opponent.attack * 0.2)
          : Math.floor(opponent.attack * (0.5 + Math.random() * 0.5))
        const damageReduced = Math.floor(opponentDamageDealt * (playerDefense / (playerDefense + 100)))
        const finalDamage = Math.max(1, opponentDamageDealt - damageReduced)

        const cashEarned = won
          ? Math.floor(opponent.cashRewardMin + Math.random() * (opponent.cashRewardMax - opponent.cashRewardMin))
          : 0
        const expEarned = won ? opponent.expReward : Math.floor(opponent.expReward * 0.1)

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
            ...(leveledUp
              ? {
                  energy: prev.player.maxEnergy,
                  stamina: prev.player.maxStamina,
                  health: prev.player.maxHealth,
                }
              : {}),
          },
          wins: prev.wins + (won ? 1 : 0),
          losses: prev.losses + (won ? 0 : 1),
          battleLog: [...prev.battleLog.slice(-9), result!],
          lastStaminaRegen: Date.now(),
        }
      })

      setTimeout(checkAchievements, 100)
      return result
    },
    [setState, addMessage, checkLevelUp, checkAchievements]
  )

  // BUY PROPERTY
  const buyProperty = useCallback(
    (propId: string) => {
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
          properties: prev.properties.map(p => (p.id === propId ? { ...p, owned: p.owned + 1 } : p)),
        }
      })
      setTimeout(checkAchievements, 100)
    },
    [setState, addMessage, checkAchievements]
  )

  // BUY EQUIPMENT
  const buyEquipment = useCallback(
    (eqId: string) => {
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
          equipment: prev.equipment.map(e => (e.id === eqId ? { ...e, owned: e.owned + 1 } : e)),
        }
      })
      setTimeout(checkAchievements, 100)
    },
    [setState, addMessage, checkAchievements]
  )

  // ALLOCATE SKILL POINT
  const allocateSkillPoint = useCallback(
    (stat: 'attack' | 'defense' | 'energy' | 'stamina') => {
      setState(prev => {
        if (prev.player.skillPoints <= 0) {
          addMessage('No skill points available!', 'error')
          return prev
        }

        const bonus = SKILL_POINT_BONUS[stat]
        const allocatedKey = `allocated${stat.charAt(0).toUpperCase() + stat.slice(1)}` as
          | 'allocatedAttack'
          | 'allocatedDefense'
          | 'allocatedEnergy'
          | 'allocatedStamina'

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
    },
    [setState, addMessage]
  )

  // BANK OPERATIONS
  const depositCash = useCallback(
    (amount: number) => {
      setState(prev => {
        const toDeposit = Math.min(amount, prev.player.cash)
        if (toDeposit <= 0) return prev
        // Original game had 10% deposit fee - money laundering tax!
        const fee = Math.floor(toDeposit * 0.1)
        const netDeposit = toDeposit - fee
        addMessage(`Deposited ${formatMoney(netDeposit)} (10% laundering fee: ${formatMoney(fee)})`, 'info')
        return {
          ...prev,
          player: {
            ...prev.player,
            cash: prev.player.cash - toDeposit,
            bankedCash: prev.player.bankedCash + netDeposit,
          },
        }
      })
    },
    [setState, addMessage]
  )

  const withdrawCash = useCallback(
    (amount: number) => {
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
    },
    [setState]
  )

  // RESET GAME
  const resetGame = useCallback(() => {
    if (!confirm('Are you sure you want to reset your progress? This cannot be undone!')) return
    localStorage.removeItem(SAVE_KEY)
    setState(getInitialState())
    addMessage('Game reset. Start your new criminal empire!', 'info')
  }, [setState, addMessage])

  // RECRUIT MAFIA MEMBER
  const recruitMafia = useCallback(() => {
    setState(prev => {
      // Cost scales with current mafia size
      const recruitCost = 5000 * prev.mafiaSize
      if (prev.player.cash < recruitCost) {
        addMessage(`Not enough cash! Recruitment costs ${formatMoney(recruitCost)}`, 'error')
        return prev
      }

      addMessage(`Recruited a new crew member! Your mafia is now ${prev.mafiaSize + 1} strong.`, 'success')
      return {
        ...prev,
        player: { ...prev.player, cash: prev.player.cash - recruitCost },
        mafiaSize: prev.mafiaSize + 1,
      }
    })
  }, [setState, addMessage])

  return {
    doJob,
    fightOpponent,
    buyProperty,
    buyEquipment,
    allocateSkillPoint,
    depositCash,
    withdrawCash,
    resetGame,
    recruitMafia,
  }
}

// ----------------------------------------
// COMPUTED VALUES HOOK
// ----------------------------------------

export function useComputedValues(state: GameState) {
  const totalAttack = useMemo(
    () => calculateTotalAttack(state.player, state.equipment),
    [state.player, state.equipment]
  )

  const totalDefense = useMemo(
    () => calculateTotalDefense(state.player, state.equipment),
    [state.player, state.equipment]
  )

  const calculatePendingIncome = useCallback(() => {
    const now = Date.now()
    const hoursPassed = (now - state.lastIncomeCollection) / (1000 * 60 * 60)
    return state.properties.reduce((sum, p) => sum + p.owned * p.incomePerHour * hoursPassed, 0)
  }, [state.lastIncomeCollection, state.properties])

  const pendingIncome = useMemo(() => Math.floor(calculatePendingIncome()), [calculatePendingIncome])

  const hourlyIncome = useMemo(
    () => state.properties.reduce((sum, p) => sum + p.owned * p.incomePerHour, 0),
    [state.properties]
  )

  return {
    totalAttack,
    totalDefense,
    pendingIncome,
    hourlyIncome,
    calculatePendingIncome,
  }
}

// ----------------------------------------
// INCOME COLLECTION HOOK
// ----------------------------------------

export function useIncomeCollection(
  setState: React.Dispatch<React.SetStateAction<GameState>>,
  addMessage: (text: string, type?: GameMessage['type']) => void,
  calculatePendingIncome: () => number,
  checkAchievements: () => void
) {
  return useCallback(() => {
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
  }, [setState, addMessage, calculatePendingIncome, checkAchievements])
}
