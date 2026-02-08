// ========================================
// MAFIA WARS - GAME CONSTANTS & INITIAL DATA
// ========================================

import type { Job, Property, Equipment, Achievement, PlayerStats, Opponent, JobTier } from './types'

// ----------------------------------------
// CONFIGURATION
// ----------------------------------------

export const SAVE_KEY = 'mafia-wars-save'

/** Energy regenerates 1 point every 5 minutes */
export const ENERGY_REGEN_INTERVAL_MS = 5 * 60 * 1000

/** Stamina regenerates 1 point every 5 minutes */
export const STAMINA_REGEN_INTERVAL_MS = 5 * 60 * 1000

/** Health regenerates 1 point every minute */
export const HEALTH_REGEN_INTERVAL_MS = 60 * 1000

/** Auto-save interval */
export const AUTO_SAVE_INTERVAL_MS = 30 * 1000

/** Mastery points gained per job completion */
export const MASTERY_PER_COMPLETION = 5

/** XP required per level (multiplied by level) */
export const XP_PER_LEVEL_MULTIPLIER = 100

/** Skill point bonus per stat allocation */
export const SKILL_POINT_BONUS = {
  attack: 2,
  defense: 2,
  energy: 5,
  stamina: 3,
}

/** Tier unlock levels */
export const TIER_UNLOCK_LEVELS: Record<JobTier, number> = {
  street_thug: 1,
  associate: 6,
  soldier: 11,
  capo: 21,
  underboss: 36,
  boss: 51,
}

/** Tier display names */
export const TIER_NAMES: Record<JobTier, string> = {
  street_thug: 'Street Thug',
  associate: 'Associate',
  soldier: 'Soldier',
  capo: 'Capo',
  underboss: 'Underboss',
  boss: 'Boss',
}

// ----------------------------------------
// INITIAL PLAYER STATS
// ----------------------------------------

export const INITIAL_PLAYER: PlayerStats = {
  name: 'New Mobster',
  level: 1,
  experience: 0,
  experienceToLevel: 100,
  energy: 100,
  maxEnergy: 100,
  stamina: 50,
  maxStamina: 50,
  health: 100,
  maxHealth: 100,
  cash: 1000,
  bankedCash: 0,
  attack: 5,
  defense: 5,
  skillPoints: 0,
  allocatedAttack: 0,
  allocatedDefense: 0,
  allocatedEnergy: 0,
  allocatedStamina: 0,
}

// ----------------------------------------
// JOBS DATA
// ----------------------------------------

export const INITIAL_JOBS: Job[] = [
  // TIER 1: Street Thug (Level 1-5)
  {
    id: 'mugging',
    name: 'Corner Store Mugging',
    tier: 'street_thug',
    description: 'Threaten a store clerk for quick cash. Low risk, low reward.',
    energyCost: 2,
    cashRewardMin: 50,
    cashRewardMax: 150,
    expReward: 5,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'petty_theft',
    name: 'Petty Theft',
    tier: 'street_thug',
    description: 'Swipe wallets and phones from distracted pedestrians.',
    energyCost: 3,
    cashRewardMin: 75,
    cashRewardMax: 200,
    expReward: 8,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'vandalism',
    name: 'Protection Vandalism',
    tier: 'street_thug',
    description: 'Trash a business that refused to pay up. Send a message.',
    energyCost: 4,
    cashRewardMin: 100,
    cashRewardMax: 300,
    expReward: 12,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'shoplifting',
    name: 'Shoplifting Ring',
    tier: 'street_thug',
    description: 'Coordinate a team of boosters to hit retail stores.',
    energyCost: 5,
    cashRewardMin: 150,
    cashRewardMax: 400,
    expReward: 15,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },

  // TIER 2: Associate (Level 6-10)
  {
    id: 'debt_collection',
    name: 'Debt Collection',
    tier: 'associate',
    description: 'Collect money owed to the family. Encourage prompt payment.',
    energyCost: 6,
    cashRewardMin: 300,
    cashRewardMax: 800,
    expReward: 25,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'protection_racket',
    name: 'Protection Racket',
    tier: 'associate',
    description: 'Convince local businesses they need your protection.',
    energyCost: 8,
    cashRewardMin: 500,
    cashRewardMax: 1200,
    expReward: 35,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'street_racing',
    name: 'Street Racing',
    tier: 'associate',
    description: 'Run illegal street races and take a cut of the bets.',
    energyCost: 10,
    cashRewardMin: 800,
    cashRewardMax: 2000,
    expReward: 45,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'burglary',
    name: 'Home Burglary',
    tier: 'associate',
    description: 'Case wealthy neighborhoods and hit empty houses.',
    energyCost: 12,
    cashRewardMin: 1000,
    cashRewardMax: 3000,
    expReward: 55,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },

  // TIER 3: Soldier (Level 11-20)
  {
    id: 'bank_heist',
    name: 'Small Bank Heist',
    tier: 'soldier',
    description: 'Hit a rural bank branch. In and out in 3 minutes.',
    energyCost: 15,
    cashRewardMin: 5000,
    cashRewardMax: 15000,
    expReward: 100,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'warehouse_robbery',
    name: 'Warehouse Robbery',
    tier: 'soldier',
    description: 'Raid shipping warehouses for high-value goods.',
    energyCost: 18,
    cashRewardMin: 8000,
    cashRewardMax: 25000,
    expReward: 130,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'car_theft_ring',
    name: 'Car Theft Ring',
    tier: 'soldier',
    description: 'Run a chop shop operation. Luxury cars only.',
    energyCost: 20,
    cashRewardMin: 10000,
    cashRewardMax: 35000,
    expReward: 160,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'arms_dealing',
    name: 'Arms Dealing',
    tier: 'soldier',
    description: 'Move weapons to connected buyers. High risk, high reward.',
    energyCost: 25,
    cashRewardMin: 15000,
    cashRewardMax: 50000,
    expReward: 200,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },

  // TIER 4: Capo (Level 21-35)
  {
    id: 'casino_heist',
    name: 'Casino Heist',
    tier: 'capo',
    description: 'Hit the cage during a busy night. Need inside help.',
    energyCost: 30,
    cashRewardMin: 50000,
    cashRewardMax: 150000,
    expReward: 400,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'drug_operation',
    name: 'Drug Operation',
    tier: 'capo',
    description: 'Oversee manufacturing and distribution in your territory.',
    energyCost: 35,
    cashRewardMin: 80000,
    cashRewardMax: 250000,
    expReward: 500,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'money_laundering',
    name: 'Money Laundering',
    tier: 'capo',
    description: 'Clean dirty money through front businesses.',
    energyCost: 40,
    cashRewardMin: 100000,
    cashRewardMax: 350000,
    expReward: 600,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'territory_takeover',
    name: 'Territory Takeover',
    tier: 'capo',
    description: 'Expand family territory by force. Expect resistance.',
    energyCost: 45,
    cashRewardMin: 150000,
    cashRewardMax: 500000,
    expReward: 750,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },

  // TIER 5: Underboss (Level 36-50)
  {
    id: 'federal_evidence',
    name: 'Steal Federal Evidence',
    tier: 'underboss',
    description: 'Bribe or break into federal offices to destroy evidence.',
    energyCost: 50,
    cashRewardMin: 500000,
    cashRewardMax: 1500000,
    expReward: 1500,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'witness_elimination',
    name: 'Witness Elimination',
    tier: 'underboss',
    description: 'Handle witnesses before they can testify.',
    energyCost: 55,
    cashRewardMin: 750000,
    cashRewardMax: 2000000,
    expReward: 2000,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'political_bribery',
    name: 'Political Bribery',
    tier: 'underboss',
    description: 'Get politicians in your pocket for protection.',
    energyCost: 60,
    cashRewardMin: 1000000,
    cashRewardMax: 3000000,
    expReward: 2500,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'rival_family_war',
    name: 'Rival Family War',
    tier: 'underboss',
    description: 'Launch attacks on rival family operations.',
    energyCost: 65,
    cashRewardMin: 1500000,
    cashRewardMax: 5000000,
    expReward: 3000,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },

  // TIER 6: Boss (Level 51+)
  {
    id: 'city_takeover',
    name: 'Take Over the City',
    tier: 'boss',
    description: 'Consolidate power over all criminal operations in the city.',
    energyCost: 70,
    cashRewardMin: 5000000,
    cashRewardMax: 15000000,
    expReward: 5000,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'eliminate_families',
    name: 'Eliminate Rival Families',
    tier: 'boss',
    description: 'Systematically dismantle competing crime families.',
    energyCost: 80,
    cashRewardMin: 10000000,
    cashRewardMax: 30000000,
    expReward: 7500,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'build_empire',
    name: 'Build Criminal Empire',
    tier: 'boss',
    description: 'Establish an untouchable criminal empire spanning multiple cities.',
    energyCost: 90,
    cashRewardMin: 25000000,
    cashRewardMax: 75000000,
    expReward: 10000,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
  {
    id: 'godfather',
    name: 'Become the Godfather',
    tier: 'boss',
    description: 'Achieve legendary status as the most powerful crime boss in history.',
    energyCost: 100,
    cashRewardMin: 50000000,
    cashRewardMax: 150000000,
    expReward: 15000,
    masteryProgress: 0,
    masteryLevel: 0,
    timesCompleted: 0,
  },
]

// ----------------------------------------
// PROPERTIES DATA
// ----------------------------------------

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'abandoned_lot',
    name: 'Abandoned Lot',
    description: 'A rundown lot perfect for shady dealings.',
    cost: 5000,
    incomePerHour: 50,
    owned: 0,
    maxOwnable: 10,
    icon: '🏚️',
  },
  {
    id: 'italian_restaurant',
    name: 'Italian Restaurant',
    description: 'A front business for meetings and money laundering.',
    cost: 50000,
    incomePerHour: 300,
    owned: 0,
    maxOwnable: 5,
    icon: '🍝',
  },
  {
    id: 'night_club',
    name: 'Night Club',
    description: 'Popular nightspot. Great for recruiting and dealing.',
    cost: 200000,
    incomePerHour: 1200,
    owned: 0,
    maxOwnable: 4,
    icon: '🎵',
  },
  {
    id: 'casino',
    name: 'Casino',
    description: 'House always wins. So do you.',
    cost: 1000000,
    incomePerHour: 6000,
    owned: 0,
    maxOwnable: 3,
    icon: '🎰',
  },
  {
    id: 'hotel',
    name: 'Five-Star Hotel',
    description: 'Luxury hotel with VIP services for special clients.',
    cost: 5000000,
    incomePerHour: 25000,
    owned: 0,
    maxOwnable: 2,
    icon: '🏨',
  },
  {
    id: 'marina',
    name: 'Private Marina',
    description: 'Perfect for importing goods without customs interference.',
    cost: 20000000,
    incomePerHour: 100000,
    owned: 0,
    maxOwnable: 2,
    icon: '⛵',
  },
  {
    id: 'skyscraper',
    name: 'Skyscraper',
    description: 'Your legitimate business empire headquarters.',
    cost: 100000000,
    incomePerHour: 500000,
    owned: 0,
    maxOwnable: 1,
    icon: '🏢',
  },
  {
    id: 'island',
    name: 'Private Island',
    description: 'International waters. No laws. Ultimate hideout.',
    cost: 500000000,
    incomePerHour: 2000000,
    owned: 0,
    maxOwnable: 1,
    icon: '🏝️',
  },
]

// ----------------------------------------
// EQUIPMENT DATA
// ----------------------------------------

export const INITIAL_EQUIPMENT: Equipment[] = [
  // WEAPONS
  {
    id: 'switchblade',
    name: 'Switchblade',
    type: 'weapon',
    description: 'Classic street weapon. Gets the point across.',
    attackBonus: 2,
    defenseBonus: 0,
    cost: 500,
    owned: 0,
    icon: '🔪',
  },
  {
    id: 'baseball_bat',
    name: 'Baseball Bat',
    type: 'weapon',
    description: 'America\'s pastime, mob style.',
    attackBonus: 4,
    defenseBonus: 1,
    cost: 1500,
    owned: 0,
    icon: '🏏',
  },
  {
    id: 'pistol',
    name: '9mm Pistol',
    type: 'weapon',
    description: 'Standard issue for any self-respecting mobster.',
    attackBonus: 8,
    defenseBonus: 0,
    cost: 5000,
    owned: 0,
    icon: '🔫',
  },
  {
    id: 'shotgun',
    name: 'Sawed-off Shotgun',
    type: 'weapon',
    description: 'For when subtlety isn\'t required.',
    attackBonus: 15,
    defenseBonus: 0,
    cost: 15000,
    owned: 0,
    icon: '💥',
  },
  {
    id: 'tommy_gun',
    name: 'Tommy Gun',
    type: 'weapon',
    description: 'The Chicago Typewriter. A classic.',
    attackBonus: 25,
    defenseBonus: 0,
    cost: 50000,
    owned: 0,
    icon: '🔫',
  },
  {
    id: 'rpg',
    name: 'RPG Launcher',
    type: 'weapon',
    description: 'When you absolutely need to make an explosive statement.',
    attackBonus: 50,
    defenseBonus: 0,
    cost: 200000,
    owned: 0,
    icon: '🚀',
  },
  {
    id: 'minigun',
    name: 'Minigun',
    type: 'weapon',
    description: 'Overkill is underrated.',
    attackBonus: 100,
    defenseBonus: 0,
    cost: 1000000,
    owned: 0,
    icon: '⚙️',
  },
  {
    id: 'orbital_strike',
    name: 'Orbital Strike Access',
    type: 'weapon',
    description: 'You\'ve made some very powerful friends.',
    attackBonus: 250,
    defenseBonus: 0,
    cost: 10000000,
    owned: 0,
    icon: '☄️',
  },

  // ARMOR
  {
    id: 'leather_jacket',
    name: 'Leather Jacket',
    type: 'armor',
    description: 'Looks cool, offers minimal protection.',
    attackBonus: 0,
    defenseBonus: 3,
    cost: 1000,
    owned: 0,
    icon: '🧥',
  },
  {
    id: 'kevlar_vest',
    name: 'Kevlar Vest',
    type: 'armor',
    description: 'Standard ballistic protection.',
    attackBonus: 0,
    defenseBonus: 8,
    cost: 5000,
    owned: 0,
    icon: '🦺',
  },
  {
    id: 'tactical_armor',
    name: 'Tactical Armor',
    type: 'armor',
    description: 'Military-grade body armor.',
    attackBonus: 0,
    defenseBonus: 15,
    cost: 20000,
    owned: 0,
    icon: '🛡️',
  },
  {
    id: 'armored_suit',
    name: 'Armored Suit',
    type: 'armor',
    description: 'Bespoke suit with hidden armor plating.',
    attackBonus: 2,
    defenseBonus: 25,
    cost: 75000,
    owned: 0,
    icon: '🕴️',
  },
  {
    id: 'exosuit',
    name: 'Exosuit Prototype',
    type: 'armor',
    description: 'Stolen military tech. Enhanced strength and protection.',
    attackBonus: 10,
    defenseBonus: 50,
    cost: 500000,
    owned: 0,
    icon: '🤖',
  },
  {
    id: 'titan_armor',
    name: 'Titan Armor',
    type: 'armor',
    description: 'Virtually invincible. You\'re basically a tank.',
    attackBonus: 25,
    defenseBonus: 100,
    cost: 5000000,
    owned: 0,
    icon: '⚔️',
  },
  {
    id: 'nano_shield',
    name: 'Nano Shield System',
    type: 'armor',
    description: 'Nanobots that repair damage in real-time.',
    attackBonus: 50,
    defenseBonus: 200,
    cost: 25000000,
    owned: 0,
    icon: '✨',
  },
  {
    id: 'godmode',
    name: 'Quantum Barrier',
    type: 'armor',
    description: 'Bendng reality itself for protection.',
    attackBonus: 100,
    defenseBonus: 500,
    cost: 100000000,
    owned: 0,
    icon: '🌀',
  },

  // VEHICLES
  {
    id: 'sedan',
    name: 'Unmarked Sedan',
    type: 'vehicle',
    description: 'Blends in. Perfect for getaways.',
    attackBonus: 1,
    defenseBonus: 2,
    cost: 2000,
    owned: 0,
    icon: '🚗',
  },
  {
    id: 'suv',
    name: 'Armored SUV',
    type: 'vehicle',
    description: 'Bulletproof windows and run-flat tires.',
    attackBonus: 3,
    defenseBonus: 8,
    cost: 25000,
    owned: 0,
    icon: '🚙',
  },
  {
    id: 'sports_car',
    name: 'Sports Car',
    type: 'vehicle',
    description: 'Fast enough to outrun anything.',
    attackBonus: 8,
    defenseBonus: 4,
    cost: 100000,
    owned: 0,
    icon: '🏎️',
  },
  {
    id: 'helicopter',
    name: 'Private Helicopter',
    type: 'vehicle',
    description: 'Aerial advantage and quick escapes.',
    attackBonus: 15,
    defenseBonus: 10,
    cost: 500000,
    owned: 0,
    icon: '🚁',
  },
  {
    id: 'yacht',
    name: 'Armored Yacht',
    type: 'vehicle',
    description: 'Mobile command center on international waters.',
    attackBonus: 20,
    defenseBonus: 25,
    cost: 2000000,
    owned: 0,
    icon: '🛥️',
  },
  {
    id: 'jet',
    name: 'Private Jet',
    type: 'vehicle',
    description: 'Global reach. Untouchable.',
    attackBonus: 30,
    defenseBonus: 40,
    cost: 10000000,
    owned: 0,
    icon: '✈️',
  },
  {
    id: 'stealth_jet',
    name: 'Stealth Fighter',
    type: 'vehicle',
    description: 'Off-the-books military hardware.',
    attackBonus: 75,
    defenseBonus: 75,
    cost: 50000000,
    owned: 0,
    icon: '🛩️',
  },
  {
    id: 'submarine',
    name: 'Nuclear Submarine',
    type: 'vehicle',
    description: 'Your own underwater fortress.',
    attackBonus: 150,
    defenseBonus: 150,
    cost: 250000000,
    owned: 0,
    icon: '🚢',
  },
]

// ----------------------------------------
// AI OPPONENTS
// ----------------------------------------

export const OPPONENTS: Opponent[] = [
  {
    id: 'street_punk',
    name: 'Street Punk',
    description: 'Young troublemaker looking to make a name.',
    level: 1,
    attack: 5,
    defense: 3,
    health: 50,
    cashRewardMin: 50,
    cashRewardMax: 200,
    expReward: 10,
    icon: '🧑',
  },
  {
    id: 'local_thug',
    name: 'Local Thug',
    description: 'Neighborhood tough guy with connections.',
    level: 5,
    attack: 15,
    defense: 12,
    health: 100,
    cashRewardMin: 200,
    cashRewardMax: 600,
    expReward: 30,
    icon: '💪',
  },
  {
    id: 'gang_member',
    name: 'Gang Member',
    description: 'Runs with a crew. Don\'t expect a fair fight.',
    level: 10,
    attack: 35,
    defense: 28,
    health: 200,
    cashRewardMin: 500,
    cashRewardMax: 1500,
    expReward: 60,
    icon: '🔥',
  },
  {
    id: 'enforcer',
    name: 'Mob Enforcer',
    description: 'Professional muscle. This one knows what they\'re doing.',
    level: 20,
    attack: 80,
    defense: 65,
    health: 400,
    cashRewardMin: 2000,
    cashRewardMax: 6000,
    expReward: 150,
    icon: '🦾',
  },
  {
    id: 'hitman',
    name: 'Professional Hitman',
    description: 'Cold, calculating killer for hire.',
    level: 35,
    attack: 180,
    defense: 140,
    health: 800,
    cashRewardMin: 10000,
    cashRewardMax: 30000,
    expReward: 400,
    icon: '🎯',
  },
  {
    id: 'underboss',
    name: 'Rival Underboss',
    description: 'Second-in-command of a competing family.',
    level: 50,
    attack: 400,
    defense: 320,
    health: 1500,
    cashRewardMin: 50000,
    cashRewardMax: 150000,
    expReward: 1000,
    icon: '🤵',
  },
  {
    id: 'don',
    name: 'Rival Don',
    description: 'Head of a rival crime family. Ultimate challenge.',
    level: 75,
    attack: 800,
    defense: 700,
    health: 3000,
    cashRewardMin: 250000,
    cashRewardMax: 750000,
    expReward: 3000,
    icon: '👑',
  },
  {
    id: 'godfather',
    name: 'The Godfather',
    description: 'Legend of the underworld. Few have challenged him and lived.',
    level: 100,
    attack: 1500,
    defense: 1200,
    health: 5000,
    cashRewardMin: 1000000,
    cashRewardMax: 5000000,
    expReward: 10000,
    icon: '🎩',
  },
]

// ----------------------------------------
// ACHIEVEMENTS
// ----------------------------------------

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_job',
    name: 'Made Man',
    description: 'Complete your first job.',
    icon: '🎖️',
    unlocked: false,
  },
  {
    id: 'hundred_jobs',
    name: 'Workaholic',
    description: 'Complete 100 jobs.',
    icon: '💼',
    unlocked: false,
  },
  {
    id: 'first_fight',
    name: 'Street Fighter',
    description: 'Win your first fight.',
    icon: '🥊',
    unlocked: false,
  },
  {
    id: 'hundred_wins',
    name: 'Undefeated',
    description: 'Win 100 fights.',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'first_property',
    name: 'Real Estate',
    description: 'Purchase your first property.',
    icon: '🏠',
    unlocked: false,
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Accumulate $1,000,000 in cash.',
    icon: '💰',
    unlocked: false,
  },
  {
    id: 'billionaire',
    name: 'Billionaire',
    description: 'Accumulate $1,000,000,000 in cash.',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10.',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'level_25',
    name: 'Established',
    description: 'Reach level 25.',
    icon: '🌟',
    unlocked: false,
  },
  {
    id: 'level_50',
    name: 'Legendary',
    description: 'Reach level 50.',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'mastery_gold',
    name: 'Master Criminal',
    description: 'Achieve gold mastery on any job.',
    icon: '🥇',
    unlocked: false,
  },
  {
    id: 'fully_equipped',
    name: 'Armed to the Teeth',
    description: 'Own at least one of each equipment type.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'property_mogul',
    name: 'Property Mogul',
    description: 'Own at least one of each property type.',
    icon: '🏰',
    unlocked: false,
  },
  {
    id: 'beat_godfather',
    name: 'The New Godfather',
    description: 'Defeat The Godfather in combat.',
    icon: '👑',
    unlocked: false,
  },
]

// ----------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------

/**
 * Calculate XP required for a given level
 */
export function getXPForLevel(level: number): number {
  return level * XP_PER_LEVEL_MULTIPLIER
}

/**
 * Get tier display name
 */
export function getTierName(tier: JobTier): string {
  return TIER_NAMES[tier]
}

/**
 * Check if player can access a tier
 */
export function canAccessTier(playerLevel: number, tier: JobTier): boolean {
  return playerLevel >= TIER_UNLOCK_LEVELS[tier]
}

/**
 * Get all tiers the player has unlocked
 */
export function getUnlockedTiers(playerLevel: number): JobTier[] {
  return (Object.keys(TIER_UNLOCK_LEVELS) as JobTier[]).filter(
    tier => canAccessTier(playerLevel, tier)
  )
}

/**
 * Calculate total attack power (base + equipment + allocated)
 */
export function calculateTotalAttack(player: PlayerStats, equipment: Equipment[]): number {
  const equipmentBonus = equipment.reduce(
    (sum, eq) => sum + (eq.attackBonus * eq.owned), 0
  )
  return player.attack + equipmentBonus + (player.allocatedAttack * SKILL_POINT_BONUS.attack)
}

/**
 * Calculate total defense power
 */
export function calculateTotalDefense(player: PlayerStats, equipment: Equipment[]): number {
  const equipmentBonus = equipment.reduce(
    (sum, eq) => sum + (eq.defenseBonus * eq.owned), 0
  )
  return player.defense + equipmentBonus + (player.allocatedDefense * SKILL_POINT_BONUS.defense)
}

/**
 * Format large numbers with abbreviations
 */
export function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(2)}K`
  }
  return `$${amount.toFixed(0)}`
}

/**
 * Format numbers with commas
 */
export function formatNumber(n: number): string {
  return n.toLocaleString()
}
