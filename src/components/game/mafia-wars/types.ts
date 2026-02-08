// ========================================
// MAFIA WARS - TYPE DEFINITIONS
// ========================================
// A recreation of the classic MySpace game
// ========================================

/**
 * Job tier progression - players unlock higher tiers as they level up
 */
export type JobTier = 
  | 'street_thug'   // Level 1-5
  | 'associate'     // Level 6-10
  | 'soldier'       // Level 11-20
  | 'capo'          // Level 21-35
  | 'underboss'     // Level 36-50
  | 'boss'          // Level 51+

/**
 * Equipment categories
 */
export type EquipmentType = 'weapon' | 'armor' | 'vehicle'

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
  masteryProgress: number // 0-100, increases each completion
  masteryLevel: number    // 0 = none, 1 = bronze, 2 = silver, 3 = gold
  timesCompleted: number
}

/**
 * Property - generates passive income over time
 */
export interface Property {
  id: string
  name: string
  description: string
  cost: number
  incomePerHour: number
  owned: number
  maxOwnable: number
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
  // Player data
  player: PlayerStats
  mafiaSize: number // Crew members (affects combat power)
  
  // Game content with progress
  jobs: Job[]
  properties: Property[]
  equipment: Equipment[]
  achievements: Achievement[]
  
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
export type GameTab = 'jobs' | 'fight' | 'properties' | 'inventory' | 'profile'

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
}
