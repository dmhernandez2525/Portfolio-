// ========================================
// MAFIA WARS - TYPE DEFINITIONS
// ========================================
// A recreation of the classic 2009 Zynga game
// ========================================

/**
 * Job tier progression - 9 New York tiers matching the original game
 */
export type JobTier =
  | 'street_thug'   // Level 1-4
  | 'associate'     // Level 5-8
  | 'soldier'       // Level 9-13
  | 'enforcer'      // Level 14-20
  | 'hitman'        // Level 21-28
  | 'capo'          // Level 29-38
  | 'consigliere'   // Level 39-50
  | 'underboss'     // Level 51-65
  | 'boss'          // Level 66+

/**
 * Equipment categories
 */
export type EquipmentType = 'weapon' | 'armor' | 'vehicle'

/**
 * Character class - chosen once at level 5
 */
export type CharacterClass = 'maniac' | 'mogul' | 'fearless'

/**
 * Player's core statistics
 */
export interface PlayerStats {
  name: string
  level: number
  experience: number
  experienceToLevel: number

  // Regenerating resources
  energy: number
  maxEnergy: number
  stamina: number
  maxStamina: number
  health: number
  maxHealth: number

  // Currency
  cash: number
  bankedCash: number

  // Combat stats (base values, equipment adds to these)
  attack: number
  defense: number

  // Allocatable skill points
  skillPoints: number
  allocatedAttack: number
  allocatedDefense: number
  allocatedEnergy: number
  allocatedStamina: number

  // Character class (null until selected at level 5)
  characterClass: CharacterClass | null
}

/**
 * Collection item drop from a job's loot table
 */
export interface LootTableEntry {
  collectionId: string
  itemId: string
  dropChance: number // 0-1, e.g., 0.15 = 15%
}

/**
 * Job - energy-consuming missions that reward cash and XP
 */
export interface Job {
  id: string
  name: string
  tier: JobTier
  description: string
  energyCost: number
  cashRewardMin: number
  cashRewardMax: number
  expReward: number
  itemRequirement?: {
    itemId: string
    quantity: number
  }
  lootTable?: LootTableEntry[] // possible collection item drops
  masteryProgress: number // 0-100, increases each completion
  masteryLevel: number    // 0 = none, 1 = bronze, 2 = silver, 3 = gold
  timesCompleted: number
}

/**
 * Property - generates passive income over time, with upgrade levels
 */
export interface Property {
  id: string
  name: string
  description: string
  cost: number
  incomePerHour: number
  owned: number
  maxOwnable: number
  upgradeLevel: number  // 0 = base, 1 = improved, 2 = premium, 3 = max
  icon: string
}

/**
 * Equipment - weapons, armor, and vehicles that affect combat
 */
export interface Equipment {
  id: string
  name: string
  type: EquipmentType
  description: string
  attackBonus: number
  defenseBonus: number
  cost: number
  owned: number
  maxOwnable: number
  icon: string
}

/**
 * AI opponent for the Fight tab
 */
export interface Opponent {
  id: string
  name: string
  description: string
  level: number
  attack: number
  defense: number
  health: number
  cashRewardMin: number
  cashRewardMax: number
  expReward: number
  icon: string
}

/**
 * Achievement - unlocked by meeting certain conditions
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number // timestamp
}

/**
 * A single collectible item within a collection
 */
export interface CollectionItem {
  id: string
  name: string
  icon: string
  collected: boolean
}

/**
 * A collection of items that drops from jobs
 */
export interface Collection {
  id: string
  name: string
  tier: JobTier
  items: CollectionItem[]
  rewardDescription: string
  rewardType: 'stat_boost' | 'cash' | 'bank_fee' | 'energy' | 'stamina' | 'attack' | 'defense'
  rewardValue: number
  completed: boolean
  timesCompleted: number
}

/**
 * Boss fight data
 */
export interface BossFight {
  id: string
  name: string
  description: string
  requiredTiers: JobTier[] // all jobs in these tiers must be gold mastery
  attack: number
  defense: number
  health: number
  maxHealth: number
  cashReward: number
  expReward: number
  rewardDescription: string
  icon: string
}

/**
 * Battle result from fighting an opponent
 */
export interface BattleResult {
  opponentId: string
  opponentName: string
  won: boolean
  playerDamageDealt: number
  opponentDamageDealt: number
  cashEarned: number
  expEarned: number
  timestamp: number
}

/**
 * Message shown to player (for feedback)
 */
export interface GameMessage {
  id: number
  text: string
  type: 'success' | 'error' | 'info' | 'warning'
  timestamp: number
}

/**
 * Full game state - persisted to localStorage
 */
export interface GameState {
  // Save version for migration
  saveVersion: number

  // Player data
  player: PlayerStats
  mafiaSize: number // Crew members (affects combat power)

  // Game content with progress
  jobs: Job[]
  properties: Property[]
  equipment: Equipment[]
  achievements: Achievement[]
  collections: Collection[]

  // Boss fight tracking
  bossesDefeated: string[] // boss IDs

  // Combat history
  wins: number
  losses: number
  battleLog: BattleResult[]

  // Timestamps for regeneration
  lastEnergyRegen: number
  lastStaminaRegen: number
  lastHealthRegen: number
  lastIncomeCollection: number
  lastSaved: number

  // Session data (not saved)
  messages?: GameMessage[]
}

/**
 * Data structure for localStorage save
 */
export interface SavedGameData {
  saveVersion: number
  player: PlayerStats
  mafiaSize: number
  jobs: Array<{
    id: string
    masteryProgress: number
    masteryLevel: number
    timesCompleted: number
  }>
  properties: Array<{
    id: string
    owned: number
    upgradeLevel: number
  }>
  equipment: Array<{
    id: string
    owned: number
  }>
  achievements: Array<{
    id: string
    unlocked: boolean
    unlockedAt?: number
  }>
  collections: Array<{
    id: string
    items: Array<{ id: string; collected: boolean }>
    completed: boolean
    timesCompleted: number
  }>
  bossesDefeated: string[]
  wins: number
  losses: number
  battleLog: BattleResult[]
  lastEnergyRegen: number
  lastStaminaRegen: number
  lastHealthRegen: number
  lastIncomeCollection: number
  lastSaved: number
}

/**
 * UI Tab options
 */
export type GameTab = 'jobs' | 'fight' | 'properties' | 'collections' | 'inventory' | 'profile'

/**
 * Job execution result
 */
export interface JobResult {
  success: boolean
  cashEarned: number
  expEarned: number
  masteryGained: number
  leveledUp: boolean
  masteryLevelUp: boolean
  lootDrop?: {
    itemId: string
    itemName: string
  }
  collectionDrop?: {
    collectionId: string
    collectionName: string
    itemId: string
    itemName: string
  }
}

/**
 * Character class definitions with bonuses
 */
export interface ClassDefinition {
  id: CharacterClass
  name: string
  description: string
  icon: string
  bonuses: {
    energyRegenBonus: number      // extra energy per regen tick
    staminaRegenBonus: number     // extra stamina per regen tick
    jobXpMultiplier: number       // 1.0 = normal, 1.2 = +20%
    propertyIncomeMultiplier: number // 1.0 = normal, 1.2 = +20%
    bankFeeReduction: number      // 0 = no reduction, 0.05 = -5%
    fightCashMultiplier: number   // 1.0 = normal, 1.1 = +10%
  }
}

/**
 * Mastery tier reward for completing all gold mastery in a tier
 */
export interface TierMasteryReward {
  tier: JobTier
  description: string
  type: 'max_energy' | 'max_stamina' | 'max_health' | 'attack' | 'defense' | 'skill_points'
  value: number
}
