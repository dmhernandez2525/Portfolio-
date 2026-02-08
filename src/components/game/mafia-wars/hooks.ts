// ========================================
// MAFIA WARS - CUSTOM HOOKS
// ========================================

import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import type {
  GameState,
  JobResult,
  BattleResult,
  GameMessage,
  SavedGameData,
  CharacterClass,
} from './types'

import {
  SAVE_KEY,
  SAVE_VERSION,
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
  INITIAL_COLLECTIONS,
  BOSS_FIGHTS,
  CHARACTER_CLASSES,
  TIER_MASTERY_REWARDS,
  OPPONENTS,
  getXPForLevel,
  calculateTotalAttack,
  calculateTotalDefense,
  calculateBankFee,
  getPropertyIncome,
  getPropertyUpgradeCost,
  getClassDefinition,
  formatMoney,
} from './constants'

// ----------------------------------------
// INITIAL STATE HELPERS
// ----------------------------------------

export function getInitialState(): GameState {
  const now = Date.now()
  return {
    saveVersion: SAVE_VERSION,
    player: { ...INITIAL_PLAYER },
    mafiaSize: 1,
    jobs: INITIAL_JOBS.map(j => ({ ...j, lootTable: j.lootTable?.map(l => ({ ...l })) })),
    properties: INITIAL_PROPERTIES.map(p => ({ ...p })),
    equipment: INITIAL_EQUIPMENT.map(e => ({ ...e })),
    achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a })),
    collections: INITIAL_COLLECTIONS.map(c => ({
      ...c,
      items: c.items.map(i => ({ ...i })),
    })),
    bossesDefeated: [],
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

    // Version mismatch — reset (portfolio game, no migration needed)
    if (data.saveVersion !== SAVE_VERSION) {
      localStorage.removeItem(SAVE_KEY)
      return getInitialState()
    }

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
        return savedProp ? { ...prop, owned: savedProp.owned, upgradeLevel: savedProp.upgradeLevel ?? 0 } : prop
      }),
      equipment: initial.equipment.map(eq => {
        const savedEq = data.equipment?.find(e => e.id === eq.id)
        return savedEq ? { ...eq, ...savedEq } : eq
      }),
      achievements: initial.achievements.map(ach => {
        const savedAch = data.achievements?.find(a => a.id === ach.id)
        return savedAch ? { ...ach, ...savedAch } : ach
      }),
      collections: initial.collections.map(col => {
        const savedCol = data.collections?.find(c => c.id === col.id)
        if (!savedCol) return col
        return {
          ...col,
          completed: savedCol.completed,
          timesCompleted: savedCol.timesCompleted,
          items: col.items.map(item => {
            const savedItem = savedCol.items?.find(i => i.id === item.id)
            return savedItem ? { ...item, collected: savedItem.collected } : item
          }),
        }
      }),
      bossesDefeated: data.bossesDefeated ?? [],
      wins: data.wins ?? 0,
      losses: data.losses ?? 0,
      battleLog: data.battleLog ?? [],
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
  const stateRef = useRef(state)
  stateRef.current = state

  const saveGame = useCallback(() => {
    const s = stateRef.current
    const saveData: SavedGameData = {
      saveVersion: SAVE_VERSION,
      player: s.player,
      mafiaSize: s.mafiaSize,
      jobs: s.jobs.map(j => ({
        id: j.id,
        masteryProgress: j.masteryProgress,
        masteryLevel: j.masteryLevel,
        timesCompleted: j.timesCompleted,
      })),
      properties: s.properties.map(p => ({
        id: p.id,
        owned: p.owned,
        upgradeLevel: p.upgradeLevel,
      })),
      equipment: s.equipment.map(e => ({
        id: e.id,
        owned: e.owned,
      })),
      achievements: s.achievements.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt,
      })),
      collections: s.collections.map(c => ({
        id: c.id,
        items: c.items.map(i => ({ id: i.id, collected: i.collected })),
        completed: c.completed,
        timesCompleted: c.timesCompleted,
      })),
      bossesDefeated: s.bossesDefeated,
      wins: s.wins,
      losses: s.losses,
      battleLog: s.battleLog.slice(-20),
      lastEnergyRegen: s.lastEnergyRegen,
      lastStaminaRegen: s.lastStaminaRegen,
      lastHealthRegen: s.lastHealthRegen,
      lastIncomeCollection: s.lastIncomeCollection,
      lastSaved: Date.now(),
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
  }, []) // stable — reads from ref

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

        // Get class bonuses for regen
        const classDef = getClassDefinition(prev.player.characterClass)
        const energyBonus = classDef?.bonuses.energyRegenBonus ?? 0
        const staminaBonus = classDef?.bonuses.staminaRegenBonus ?? 0

        const energyRegens = Math.floor((now - lastEnergyRegen) / ENERGY_REGEN_INTERVAL_MS)
        if (energyRegens > 0 && energy < maxEnergy) {
          energy = Math.min(maxEnergy, energy + energyRegens * (1 + energyBonus))
          lastEnergyRegen = lastEnergyRegen + energyRegens * ENERGY_REGEN_INTERVAL_MS
        }

        const staminaRegens = Math.floor((now - lastStaminaRegen) / STAMINA_REGEN_INTERVAL_MS)
        if (staminaRegens > 0 && stamina < maxStamina) {
          stamina = Math.min(maxStamina, stamina + staminaRegens * (1 + staminaBonus))
          lastStaminaRegen = lastStaminaRegen + staminaRegens * STAMINA_REGEN_INTERVAL_MS
        }

        const healthRegens = Math.floor((now - lastHealthRegen) / HEALTH_REGEN_INTERVAL_MS)
        if (healthRegens > 0 && health < maxHealth) {
          health = Math.min(maxHealth, health + healthRegens)
          lastHealthRegen = lastHealthRegen + healthRegens * HEALTH_REGEN_INTERVAL_MS
        }

        // Skip re-render if nothing changed
        if (energy === prev.player.energy &&
            stamina === prev.player.stamina &&
            health === prev.player.health) {
          return prev
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
      const totalJobs = prev.jobs.reduce((sum, j) => sum + j.timesCompleted, 0)
      const totalCash = prev.player.cash + prev.player.bankedCash
      const completedCollections = prev.collections.filter(c => c.completed).length
      const tierJobs = (tier: string) => prev.jobs.filter(j => j.tier === tier)
      const allGoldInTier = (tier: string) => tierJobs(tier).every(j => j.masteryLevel >= 3)

      const checks: Record<string, boolean> = {
        first_job: totalJobs >= 1,
        hundred_jobs: totalJobs >= 100,
        thousand_jobs: totalJobs >= 1000,
        first_fight: prev.wins >= 1,
        hundred_wins: prev.wins >= 100,
        first_property: prev.properties.some(p => p.owned > 0),
        millionaire: totalCash >= 1_000_000,
        billionaire: totalCash >= 1_000_000_000,
        level_10: prev.player.level >= 10,
        level_25: prev.player.level >= 25,
        level_50: prev.player.level >= 50,
        level_100: prev.player.level >= 100,
        mastery_gold: prev.jobs.some(j => j.masteryLevel >= 3),
        fully_equipped:
          prev.equipment.some(e => e.type === 'weapon' && e.owned > 0) &&
          prev.equipment.some(e => e.type === 'armor' && e.owned > 0) &&
          prev.equipment.some(e => e.type === 'vehicle' && e.owned > 0),
        property_mogul: prev.properties.every(p => p.owned > 0),
        beat_godfather: prev.battleLog.some(b => b.won && b.opponentId === 'godfather_opp'),
        first_collection: completedCollections >= 1,
        all_collections: completedCollections >= prev.collections.length,
        first_boss: prev.bossesDefeated.length >= 1,
        all_bosses: prev.bossesDefeated.length >= BOSS_FIGHTS.length,
        choose_class: prev.player.characterClass !== null,
        mafia_50: prev.mafiaSize >= 50,
        tier_mastery: ['street_thug', 'associate', 'soldier', 'enforcer', 'hitman', 'capo', 'consigliere', 'underboss', 'boss'].some(t => allGoldInTier(t)),
        upgrade_property: prev.properties.some(p => p.upgradeLevel >= 3),
      }

      let changed = false
      const newAchievements = prev.achievements.map(ach => {
        if (ach.unlocked) return ach
        if (checks[ach.id]) {
          changed = true
          return { ...ach, unlocked: true, unlockedAt: Date.now() }
        }
        return ach
      })

      if (!changed) return prev
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
      return true
    }
    lastActionRef.current = { action: actionId, time: now }
    return false
  }

  // DO JOB
  const doJob = useCallback(
    (jobId: string): JobResult => {
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

        // Check item requirements
        if (job.itemRequirement) {
          const reqItem = prev.equipment.find(e => e.id === job.itemRequirement!.itemId)
          if (!reqItem || reqItem.owned < job.itemRequirement.quantity) {
            addMessage(`Requires ${job.itemRequirement.quantity}x item to perform this job!`, 'error')
            return prev
          }
        }

        // Get class XP multiplier
        const classDef = getClassDefinition(prev.player.characterClass)
        const xpMultiplier = classDef?.bonuses.jobXpMultiplier ?? 1.0

        const cashEarned = Math.floor(
          job.cashRewardMin + Math.random() * (job.cashRewardMax - job.cashRewardMin)
        )
        const expEarned = Math.floor(job.expReward * xpMultiplier)

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
          masterySkillPoint = 1
        } else if (newMasteryLevel >= 3) {
          newMasteryProgress = 100
        }

        // Collection item drop from job's loot table
        let updatedCollections = prev.collections
        let collectionDrop: JobResult['collectionDrop'] = undefined
        if (job.lootTable && job.lootTable.length > 0) {
          for (const loot of job.lootTable) {
            if (Math.random() < loot.dropChance) {
              const collection = prev.collections.find(c => c.id === loot.collectionId)
              if (collection && !collection.completed) {
                const item = collection.items.find(i => i.id === loot.itemId)
                if (item && !item.collected) {
                  collectionDrop = {
                    collectionId: collection.id,
                    collectionName: collection.name,
                    itemId: item.id,
                    itemName: item.name,
                  }
                  updatedCollections = prev.collections.map(c => {
                    if (c.id !== loot.collectionId) return c
                    const newItems = c.items.map(i =>
                      i.id === loot.itemId ? { ...i, collected: true } : i
                    )
                    const allCollected = newItems.every(i => i.collected)
                    return {
                      ...c,
                      items: newItems,
                      completed: allCollected,
                      timesCompleted: allCollected ? c.timesCompleted + 1 : c.timesCompleted,
                    }
                  })
                  addMessage(`Found ${item.name} for ${collection.name}!`, 'success')
                  break // one drop per job
                }
              }
            }
          }
        }

        // Equipment loot drop (legacy system — small chance for random equipment)
        const lootChance = 0.03 + (job.masteryLevel * 0.02)
        let lootDrop: { itemId: string; itemName: string } | undefined
        let updatedEquipment = prev.equipment

        if (Math.random() < lootChance) {
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
          collectionDrop,
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

        // Check for tier mastery reward
        let bonusUpdates: Partial<typeof prev.player> = {}
        if (masteryLevelUp && newMasteryLevel === 3) {
          const jobTier = job.tier
          const allTierJobs = prev.jobs.filter(j => j.tier === jobTier)
          const allGold = allTierJobs.every(j =>
            j.id === jobId ? newMasteryLevel >= 3 : j.masteryLevel >= 3
          )
          if (allGold) {
            const reward = TIER_MASTERY_REWARDS.find(r => r.tier === jobTier)
            if (reward) {
              addMessage(`Tier Mastery Complete! ${reward.description}`, 'success')
              const rewardMap: Record<string, Partial<typeof prev.player>> = {
                max_energy: { maxEnergy: prev.player.maxEnergy + reward.value },
                max_stamina: { maxStamina: prev.player.maxStamina + reward.value },
                max_health: { maxHealth: prev.player.maxHealth + reward.value },
                attack: { attack: prev.player.attack + reward.value },
                defense: { defense: prev.player.defense + reward.value },
                skill_points: { skillPoints: prev.player.skillPoints + totalSkillPoints + reward.value },
              }
              bonusUpdates = rewardMap[reward.type] ?? {}
            }
          }
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            energy: leveledUp ? prev.player.maxEnergy : newEnergy,
            stamina: leveledUp ? prev.player.maxStamina : prev.player.stamina,
            health: leveledUp ? prev.player.maxHealth : prev.player.health,
            experience: remainingExp,
            experienceToLevel: getXPForLevel(newLevel),
            level: newLevel,
            cash: prev.player.cash + cashEarned,
            skillPoints: prev.player.skillPoints + totalSkillPoints,
            ...bonusUpdates,
          },
          jobs: prev.jobs.map(j =>
            j.id === jobId
              ? { ...j, masteryProgress: newMasteryProgress, masteryLevel: newMasteryLevel, timesCompleted: j.timesCompleted + 1 }
              : j
          ),
          equipment: updatedEquipment,
          collections: updatedCollections,
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

        // Class bonus for fight cash
        const classDef = getClassDefinition(prev.player.characterClass)
        const fightCashMult = classDef?.bonuses.fightCashMultiplier ?? 1.0

        const cashEarned = won
          ? Math.floor((opponent.cashRewardMin + Math.random() * (opponent.cashRewardMax - opponent.cashRewardMin)) * fightCashMult)
          : 0
        const expEarned = won ? opponent.expReward : Math.floor(opponent.expReward * 0.1)

        const newExp = prev.player.experience + expEarned
        const { newLevel, newExp: remainingExp, skillPointsGained } = checkLevelUp(newExp, prev.player.level)
        const leveledUp = newLevel > prev.player.level

        result = {
          opponentId: opponent.id,
          opponentName: opponent.name,
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
            energy: leveledUp ? prev.player.maxEnergy : prev.player.energy,
            stamina: leveledUp ? prev.player.maxStamina : prev.player.stamina - staminaCost,
            health: leveledUp ? prev.player.maxHealth : Math.max(0, prev.player.health - finalDamage),
            cash: prev.player.cash + cashEarned,
            experience: remainingExp,
            experienceToLevel: getXPForLevel(newLevel),
            level: newLevel,
            skillPoints: prev.player.skillPoints + skillPointsGained,
          },
          wins: prev.wins + (won ? 1 : 0),
          losses: prev.losses + (won ? 0 : 1),
          battleLog: [...prev.battleLog.slice(-9), result!],
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

  // UPGRADE PROPERTY
  const upgradeProperty = useCallback(
    (propId: string) => {
      setState(prev => {
        const prop = prev.properties.find(p => p.id === propId)
        if (!prop) return prev
        if (prop.owned <= 0) {
          addMessage('You must own this property first!', 'error')
          return prev
        }
        if (prop.upgradeLevel >= 3) {
          addMessage('This property is already at max upgrade level!', 'warning')
          return prev
        }
        const upgradeCost = getPropertyUpgradeCost(prop)
        if (prev.player.cash < upgradeCost) {
          addMessage(`Not enough cash! Upgrade costs ${formatMoney(upgradeCost)}`, 'error')
          return prev
        }

        const newLevel = prop.upgradeLevel + 1
        const levelNames = ['Improved', 'Premium', 'Maximum']
        addMessage(`Upgraded ${prop.name} to ${levelNames[newLevel - 1]}!`, 'success')
        return {
          ...prev,
          player: { ...prev.player, cash: prev.player.cash - upgradeCost },
          properties: prev.properties.map(p =>
            p.id === propId ? { ...p, upgradeLevel: newLevel } : p
          ),
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
        if (eq.owned >= eq.maxOwnable) {
          addMessage(`You own the maximum ${eq.name}!`, 'warning')
          return prev
        }
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

  // BANK OPERATIONS — dynamic fee based on collections + class
  const depositCash = useCallback(
    (amount: number) => {
      setState(prev => {
        const toDeposit = Math.min(amount, prev.player.cash)
        if (toDeposit <= 0) return prev
        const completedCollections = prev.collections.filter(c => c.completed).length
        const feeRate = calculateBankFee(completedCollections, prev.player.characterClass)
        const fee = Math.floor(toDeposit * feeRate)
        const netDeposit = toDeposit - fee
        const feePercent = Math.round(feeRate * 100)
        addMessage(`Deposited ${formatMoney(netDeposit)} (${feePercent}% fee: ${formatMoney(fee)})`, 'info')
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

  // SELECT CHARACTER CLASS (one-time at level 5+)
  const selectClass = useCallback(
    (classId: CharacterClass) => {
      setState(prev => {
        if (prev.player.characterClass !== null) {
          addMessage('You have already chosen a class!', 'warning')
          return prev
        }
        if (prev.player.level < 5) {
          addMessage('You must be level 5 to choose a class!', 'error')
          return prev
        }
        const classDef = CHARACTER_CLASSES.find(c => c.id === classId)
        if (!classDef) return prev

        addMessage(`You are now a ${classDef.name}! ${classDef.description}`, 'success')
        return {
          ...prev,
          player: { ...prev.player, characterClass: classId },
        }
      })
      setTimeout(checkAchievements, 100)
    },
    [setState, addMessage, checkAchievements]
  )

  // FIGHT BOSS
  const fightBoss = useCallback(
    (bossId: string): { won: boolean; message: string } | null => {
      if (isDebounced(`boss-${bossId}`)) return null

      let result: { won: boolean; message: string } | null = null

      setState(prev => {
        const boss = BOSS_FIGHTS.find(b => b.id === bossId)
        if (!boss) return prev
        if (prev.bossesDefeated.includes(bossId)) {
          addMessage('You have already defeated this boss!', 'warning')
          return prev
        }

        // Check required tier mastery
        const allMastered = boss.requiredTiers.every(tier => {
          const tierJobs = prev.jobs.filter(j => j.tier === tier)
          return tierJobs.every(j => j.masteryLevel >= 3)
        })
        if (!allMastered) {
          addMessage('You must achieve Gold Mastery on all required tier jobs first!', 'error')
          return prev
        }

        if (prev.player.stamina < 20) {
          addMessage('Need at least 20 stamina to fight a boss!', 'error')
          return prev
        }
        if (prev.player.health < 50) {
          addMessage('Need at least 50 health to fight a boss!', 'error')
          return prev
        }

        // Multi-round combat (3 rounds)
        const playerAttack = calculateTotalAttack(prev.player, prev.equipment) + prev.mafiaSize * 3
        const playerDefense = calculateTotalDefense(prev.player, prev.equipment) + prev.mafiaSize * 2
        let bossHP = boss.health
        let playerHP = prev.player.health

        for (let round = 0; round < 3; round++) {
          const playerDmg = Math.floor(playerAttack * (0.7 + Math.random() * 0.6))
          bossHP -= playerDmg

          if (bossHP <= 0) break

          const bossDmg = Math.floor(boss.attack * (0.5 + Math.random() * 0.5))
          const reduced = Math.floor(bossDmg * (playerDefense / (playerDefense + 200)))
          playerHP -= Math.max(1, bossDmg - reduced)
        }

        const won = bossHP <= 0

        if (won) {
          const { newLevel, newExp: remainingExp, skillPointsGained } = checkLevelUp(
            prev.player.experience + boss.expReward,
            prev.player.level
          )
          result = { won: true, message: `Boss defeated! ${boss.rewardDescription}` }
          addMessage(`Defeated ${boss.name}! +${formatMoney(boss.cashReward)} | ${boss.rewardDescription}`, 'success')

          return {
            ...prev,
            player: {
              ...prev.player,
              cash: prev.player.cash + boss.cashReward,
              experience: remainingExp,
              experienceToLevel: getXPForLevel(newLevel),
              level: newLevel,
              skillPoints: prev.player.skillPoints + skillPointsGained,
              health: Math.max(1, playerHP),
              stamina: prev.player.stamina - 20,
            },
            bossesDefeated: [...prev.bossesDefeated, bossId],
          }
        } else {
          result = { won: false, message: `${boss.name} was too strong! Train harder.` }
          addMessage(`Defeated by ${boss.name}! Train harder and try again.`, 'warning')

          return {
            ...prev,
            player: {
              ...prev.player,
              health: Math.max(1, playerHP),
              stamina: prev.player.stamina - 20,
            },
          }
        }
      })

      setTimeout(checkAchievements, 100)
      return result
    },
    [setState, addMessage, checkLevelUp, checkAchievements]
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
      const recruitCost = 1000 + Math.floor(500 * Math.pow(prev.mafiaSize, 1.3))
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
    upgradeProperty,
    buyEquipment,
    allocateSkillPoint,
    depositCash,
    withdrawCash,
    selectClass,
    fightBoss,
    resetGame,
    recruitMafia,
  }
}

// ----------------------------------------
// COMPUTED VALUES HOOK
// ----------------------------------------

export function useComputedValues(state: GameState) {
  const [incomeTick, setIncomeTick] = useState(0)

  // Tick every 5s so pendingIncome visually updates
  useEffect(() => {
    if (state.properties.some(p => p.owned > 0)) {
      const interval = setInterval(() => setIncomeTick(t => t + 1), 5000)
      return () => clearInterval(interval)
    }
  }, [state.properties])

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
    const classDef = getClassDefinition(state.player.characterClass)
    const incomeMultiplier = classDef?.bonuses.propertyIncomeMultiplier ?? 1.0
    return state.properties.reduce(
      (sum, p) => sum + p.owned * getPropertyIncome(p) * hoursPassed * incomeMultiplier, 0
    )
  }, [state.lastIncomeCollection, state.properties, state.player.characterClass])

  const pendingIncome = useMemo(() => {
    void incomeTick // force recalculation on tick
    return Math.floor(calculatePendingIncome())
  }, [calculatePendingIncome, incomeTick])

  const hourlyIncome = useMemo(() => {
    const classDef = getClassDefinition(state.player.characterClass)
    const incomeMultiplier = classDef?.bonuses.propertyIncomeMultiplier ?? 1.0
    return state.properties.reduce(
      (sum, p) => sum + p.owned * getPropertyIncome(p) * incomeMultiplier, 0
    )
  }, [state.properties, state.player.characterClass])

  const bankFeeRate = useMemo(() => {
    const completedCollections = state.collections.filter(c => c.completed).length
    return calculateBankFee(completedCollections, state.player.characterClass)
  }, [state.collections, state.player.characterClass])

  return {
    totalAttack,
    totalDefense,
    pendingIncome,
    hourlyIncome,
    bankFeeRate,
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
