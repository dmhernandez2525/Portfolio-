// ========================================
// MAFIA WARS - GAME CONSTANTS & INITIAL DATA
// ========================================
// Complete recreation of the 2009 Zynga game
// 9 NY tiers, 63 jobs, collections, bosses
// ========================================

import type {
  Job, Property, Equipment, Achievement, PlayerStats, Opponent,
  JobTier, Collection, BossFight, ClassDefinition, TierMasteryReward,
} from './types'

// ----------------------------------------
// CONFIGURATION
// ----------------------------------------

export const SAVE_KEY = 'mafia-wars-save'
export const SAVE_VERSION = 2 // bump to invalidate old saves

export const ENERGY_REGEN_INTERVAL_MS = 5 * 60 * 1000
export const STAMINA_REGEN_INTERVAL_MS = 5 * 60 * 1000
export const HEALTH_REGEN_INTERVAL_MS = 60 * 1000
export const AUTO_SAVE_INTERVAL_MS = 30 * 1000
export const MASTERY_PER_COMPLETION = 5
export const XP_PER_LEVEL_MULTIPLIER = 100
export const BASE_BANK_FEE = 0.10 // 10%
export const MIN_BANK_FEE = 0.03  // 3% minimum
export const BANK_FEE_PER_COLLECTION = 0.005 // -0.5% per completed collection

export const SKILL_POINT_BONUS = {
  attack: 2,
  defense: 2,
  energy: 5,
  stamina: 3,
}

export const TIER_UNLOCK_LEVELS: Record<JobTier, number> = {
  street_thug: 1,
  associate: 5,
  soldier: 9,
  enforcer: 14,
  hitman: 21,
  capo: 29,
  consigliere: 39,
  underboss: 51,
  boss: 66,
}

export const TIER_NAMES: Record<JobTier, string> = {
  street_thug: 'Street Thug',
  associate: 'Associate',
  soldier: 'Soldier',
  enforcer: 'Enforcer',
  hitman: 'Hitman',
  capo: 'Capo',
  consigliere: 'Consigliere',
  underboss: 'Underboss',
  boss: 'Boss',
}

export const ALL_TIERS: JobTier[] = [
  'street_thug', 'associate', 'soldier', 'enforcer', 'hitman',
  'capo', 'consigliere', 'underboss', 'boss',
]

// ----------------------------------------
// CHARACTER CLASSES
// ----------------------------------------

export const CHARACTER_CLASSES: ClassDefinition[] = [
  {
    id: 'maniac',
    name: 'Maniac',
    description: 'Aggressive and relentless. More energy regeneration and bonus job XP.',
    icon: '💀',
    bonuses: {
      energyRegenBonus: 5,
      staminaRegenBonus: 0,
      jobXpMultiplier: 1.2,
      propertyIncomeMultiplier: 1.0,
      bankFeeReduction: 0,
      fightCashMultiplier: 1.0,
    },
  },
  {
    id: 'mogul',
    name: 'Mogul',
    description: 'Business-minded operator. Better property income and lower bank fees.',
    icon: '💰',
    bonuses: {
      energyRegenBonus: 0,
      staminaRegenBonus: 0,
      jobXpMultiplier: 1.0,
      propertyIncomeMultiplier: 1.2,
      bankFeeReduction: 0.05,
      fightCashMultiplier: 1.0,
    },
  },
  {
    id: 'fearless',
    name: 'Fearless',
    description: 'Born fighter. More stamina regeneration and bonus fight cash.',
    icon: '⚔️',
    bonuses: {
      energyRegenBonus: 0,
      staminaRegenBonus: 3,
      jobXpMultiplier: 1.0,
      propertyIncomeMultiplier: 1.0,
      bankFeeReduction: 0,
      fightCashMultiplier: 1.1,
    },
  },
]

// ----------------------------------------
// TIER MASTERY REWARDS
// ----------------------------------------

export const TIER_MASTERY_REWARDS: TierMasteryReward[] = [
  { tier: 'street_thug', description: '+10 Max Energy', type: 'max_energy', value: 10 },
  { tier: 'associate', description: '+5 Max Stamina', type: 'max_stamina', value: 5 },
  { tier: 'soldier', description: '+3 Attack', type: 'attack', value: 3 },
  { tier: 'enforcer', description: '+3 Defense', type: 'defense', value: 3 },
  { tier: 'hitman', description: '+15 Max Energy', type: 'max_energy', value: 15 },
  { tier: 'capo', description: '+10 Max Stamina', type: 'max_stamina', value: 10 },
  { tier: 'consigliere', description: '+5 Attack', type: 'attack', value: 5 },
  { tier: 'underboss', description: '+20 Max Health', type: 'max_health', value: 20 },
  { tier: 'boss', description: '+5 Skill Points', type: 'skill_points', value: 5 },
]

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
  characterClass: null,
}

// ----------------------------------------
// JOBS DATA - 63 jobs across 9 tiers
// ----------------------------------------

export const INITIAL_JOBS: Job[] = [
  // ========================
  // TIER 1: Street Thug (Lv 1-4)
  // ========================
  {
    id: 'mugging', name: 'Corner Store Mugging', tier: 'street_thug',
    description: 'Threaten a store clerk for quick cash. Low risk, low reward.',
    energyCost: 2, cashRewardMin: 50, cashRewardMax: 150, expReward: 5,
    lootTable: [{ collectionId: 'street_tokens', itemId: 'st_brass_knuckles', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'petty_theft', name: 'Petty Theft', tier: 'street_thug',
    description: 'Swipe wallets and phones from distracted pedestrians.',
    energyCost: 3, cashRewardMin: 75, cashRewardMax: 200, expReward: 8,
    lootTable: [{ collectionId: 'street_tokens', itemId: 'st_switchblade', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'vandalism', name: 'Protection Vandalism', tier: 'street_thug',
    description: 'Trash a business that refused to pay up. Send a message.',
    energyCost: 4, cashRewardMin: 100, cashRewardMax: 300, expReward: 12,
    lootTable: [{ collectionId: 'street_tokens', itemId: 'st_spray_paint', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'shoplifting', name: 'Shoplifting Ring', tier: 'street_thug',
    description: 'Coordinate a team of boosters to hit retail stores.',
    energyCost: 5, cashRewardMin: 150, cashRewardMax: 400, expReward: 15,
    lootTable: [{ collectionId: 'street_tokens', itemId: 'st_ski_mask', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'lookout', name: 'Be a Lookout', tier: 'street_thug',
    description: 'Stand watch while the crew does a job. Simple but necessary.',
    energyCost: 3, cashRewardMin: 60, cashRewardMax: 180, expReward: 7,
    lootTable: [{ collectionId: 'petty_cash', itemId: 'pc_walkie_talkie', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'collect_bets', name: 'Collect Street Bets', tier: 'street_thug',
    description: 'Run numbers for the local bookie. Collect what\'s owed.',
    energyCost: 4, cashRewardMin: 120, cashRewardMax: 350, expReward: 10,
    lootTable: [{ collectionId: 'petty_cash', itemId: 'pc_betting_slip', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'car_jack', name: 'Grand Theft Auto', tier: 'street_thug',
    description: 'Boost a car from a parking lot. Chop shop pays good.',
    energyCost: 6, cashRewardMin: 200, cashRewardMax: 500, expReward: 18,
    lootTable: [{ collectionId: 'petty_cash', itemId: 'pc_slim_jim', dropChance: 0.15 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 2: Associate (Lv 5-8)
  // ========================
  {
    id: 'debt_collection', name: 'Debt Collection', tier: 'associate',
    description: 'Collect money owed to the family. Encourage prompt payment.',
    energyCost: 6, cashRewardMin: 300, cashRewardMax: 800, expReward: 25,
    lootTable: [{ collectionId: 'associate_rings', itemId: 'ar_pinky_ring', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'protection_racket', name: 'Protection Racket', tier: 'associate',
    description: 'Convince local businesses they need your protection.',
    energyCost: 8, cashRewardMin: 500, cashRewardMax: 1200, expReward: 35,
    lootTable: [{ collectionId: 'associate_rings', itemId: 'ar_gold_chain', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'street_racing', name: 'Street Racing', tier: 'associate',
    description: 'Run illegal street races and take a cut of the bets.',
    energyCost: 10, cashRewardMin: 800, cashRewardMax: 2000, expReward: 45,
    lootTable: [{ collectionId: 'associate_rings', itemId: 'ar_racing_gloves', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'burglary', name: 'Home Burglary', tier: 'associate',
    description: 'Case wealthy neighborhoods and hit empty houses.',
    energyCost: 12, cashRewardMin: 1000, cashRewardMax: 3000, expReward: 55,
    lootTable: [{ collectionId: 'associate_rings', itemId: 'ar_lockpick_set', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'run_numbers', name: 'Run a Numbers Game', tier: 'associate',
    description: 'Operate an illegal lottery in the neighborhood.',
    energyCost: 7, cashRewardMin: 400, cashRewardMax: 1000, expReward: 30,
    lootTable: [{ collectionId: 'brass_knuckles', itemId: 'bk_silver_knucks', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'fence_goods', name: 'Fence Stolen Goods', tier: 'associate',
    description: 'Move hot merchandise through your network of contacts.',
    energyCost: 9, cashRewardMin: 600, cashRewardMax: 1500, expReward: 40,
    lootTable: [{ collectionId: 'brass_knuckles', itemId: 'bk_gold_knucks', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'intimidation', name: 'Intimidation Job', tier: 'associate',
    description: 'Persuade a reluctant witness to forget what they saw.',
    energyCost: 11, cashRewardMin: 900, cashRewardMax: 2500, expReward: 50,
    lootTable: [{ collectionId: 'brass_knuckles', itemId: 'bk_iron_knucks', dropChance: 0.12 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 3: Soldier (Lv 9-13)
  // ========================
  {
    id: 'bank_heist', name: 'Small Bank Heist', tier: 'soldier',
    description: 'Hit a rural bank branch. In and out in 3 minutes.',
    energyCost: 15, cashRewardMin: 5000, cashRewardMax: 15000, expReward: 100,
    lootTable: [{ collectionId: 'soldier_medals', itemId: 'sm_bronze_star', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'warehouse_robbery', name: 'Warehouse Robbery', tier: 'soldier',
    description: 'Raid shipping warehouses for high-value goods.',
    energyCost: 18, cashRewardMin: 8000, cashRewardMax: 25000, expReward: 130,
    lootTable: [{ collectionId: 'soldier_medals', itemId: 'sm_service_ribbon', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'car_theft_ring', name: 'Car Theft Ring', tier: 'soldier',
    description: 'Run a chop shop operation. Luxury cars only.',
    energyCost: 20, cashRewardMin: 10000, cashRewardMax: 35000, expReward: 160,
    lootTable: [{ collectionId: 'soldier_medals', itemId: 'sm_combat_cross', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'arms_dealing', name: 'Arms Dealing', tier: 'soldier',
    description: 'Move weapons to connected buyers. High risk, high reward.',
    energyCost: 25, cashRewardMin: 15000, cashRewardMax: 50000, expReward: 200,
    lootTable: [{ collectionId: 'soldier_medals', itemId: 'sm_silver_eagle', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'hijack_truck', name: 'Hijack a Delivery Truck', tier: 'soldier',
    description: 'Intercept a shipment of electronics on the highway.',
    energyCost: 16, cashRewardMin: 6000, cashRewardMax: 18000, expReward: 110,
    lootTable: [{ collectionId: 'war_trophies', itemId: 'wt_dog_tags', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'counterfeit_op', name: 'Counterfeit Operation', tier: 'soldier',
    description: 'Print fake bills. Quality over quantity.',
    energyCost: 22, cashRewardMin: 12000, cashRewardMax: 40000, expReward: 175,
    lootTable: [{ collectionId: 'war_trophies', itemId: 'wt_combat_knife', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'smuggle_goods', name: 'Smuggle Contraband', tier: 'soldier',
    description: 'Move illegal goods across state lines using hidden routes.',
    energyCost: 24, cashRewardMin: 14000, cashRewardMax: 45000, expReward: 190,
    lootTable: [{ collectionId: 'war_trophies', itemId: 'wt_war_medal', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 4: Enforcer (Lv 14-20)
  // ========================
  {
    id: 'rough_up_trader', name: 'Rough Up a Trader', tier: 'enforcer',
    description: 'Send a message to someone who shorted the family.',
    energyCost: 28, cashRewardMin: 30000, cashRewardMax: 80000, expReward: 300,
    lootTable: [{ collectionId: 'enforcer_badges', itemId: 'eb_iron_fist', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'destroy_evidence', name: 'Destroy Evidence', tier: 'enforcer',
    description: 'Break into the DA\'s office and burn case files.',
    energyCost: 32, cashRewardMin: 40000, cashRewardMax: 120000, expReward: 380,
    lootTable: [{ collectionId: 'enforcer_badges', itemId: 'eb_badge', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'kidnap_rival', name: 'Kidnap a Rival\'s Associate', tier: 'enforcer',
    description: 'Grab someone important for leverage in negotiations.',
    energyCost: 35, cashRewardMin: 50000, cashRewardMax: 150000, expReward: 450,
    lootTable: [{ collectionId: 'enforcer_badges', itemId: 'eb_handcuffs', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'extortion', name: 'Extortion Ring', tier: 'enforcer',
    description: 'Squeeze businesses for maximum protection money.',
    energyCost: 30, cashRewardMin: 35000, cashRewardMax: 100000, expReward: 340,
    lootTable: [{ collectionId: 'enforcer_badges', itemId: 'eb_blackmail', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'bust_safehouse', name: 'Raid a Safehouse', tier: 'enforcer',
    description: 'Hit a rival\'s hideout and take everything that isn\'t bolted down.',
    energyCost: 33, cashRewardMin: 45000, cashRewardMax: 130000, expReward: 400,
    lootTable: [{ collectionId: 'hit_list', itemId: 'hl_target_photo', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'corrupt_official', name: 'Corrupt a City Official', tier: 'enforcer',
    description: 'Get a building inspector on your payroll.',
    energyCost: 36, cashRewardMin: 55000, cashRewardMax: 160000, expReward: 480,
    lootTable: [{ collectionId: 'hit_list', itemId: 'hl_dossier', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'torch_warehouse', name: 'Torch a Rival\'s Warehouse', tier: 'enforcer',
    description: 'Arson for hire. Make sure nobody\'s inside... maybe.',
    energyCost: 38, cashRewardMin: 60000, cashRewardMax: 180000, expReward: 520,
    lootTable: [{ collectionId: 'hit_list', itemId: 'hl_lighter', dropChance: 0.10 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 5: Hitman (Lv 21-28)
  // ========================
  {
    id: 'contract_kill', name: 'Contract Kill', tier: 'hitman',
    description: 'Accept a contract on a high-value target. Clean and professional.',
    energyCost: 40, cashRewardMin: 100000, cashRewardMax: 300000, expReward: 700,
    lootTable: [{ collectionId: 'hitman_tools', itemId: 'ht_silencer', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'eliminate_witness', name: 'Eliminate a Key Witness', tier: 'hitman',
    description: 'Handle a witness before they can testify against the family.',
    energyCost: 45, cashRewardMin: 130000, cashRewardMax: 400000, expReward: 850,
    lootTable: [{ collectionId: 'hitman_tools', itemId: 'ht_garrote', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'sniper_job', name: 'Long-Range Elimination', tier: 'hitman',
    description: 'Set up a sniper position. One shot, one kill.',
    energyCost: 50, cashRewardMin: 160000, cashRewardMax: 500000, expReward: 1000,
    lootTable: [{ collectionId: 'hitman_tools', itemId: 'ht_scope', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'car_bomb', name: 'Plant a Car Bomb', tier: 'hitman',
    description: 'Wire a rival\'s car. Old school but effective.',
    energyCost: 42, cashRewardMin: 110000, cashRewardMax: 350000, expReward: 750,
    lootTable: [{ collectionId: 'hitman_tools', itemId: 'ht_detonator', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'poison_job', name: 'Poison a Rival Boss', tier: 'hitman',
    description: 'Slip something into their dinner. Untraceable.',
    energyCost: 48, cashRewardMin: 150000, cashRewardMax: 450000, expReward: 950,
    lootTable: [{ collectionId: 'sniper_kit', itemId: 'sk_bipod', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'fake_identity', name: 'Create a Fake Identity', tier: 'hitman',
    description: 'Build a new identity for a family member on the run.',
    energyCost: 44, cashRewardMin: 120000, cashRewardMax: 380000, expReward: 800,
    lootTable: [{ collectionId: 'sniper_kit', itemId: 'sk_night_vision', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'stage_accident', name: 'Stage an "Accident"', tier: 'hitman',
    description: 'Make it look like an unfortunate mishap. No investigation.',
    energyCost: 52, cashRewardMin: 180000, cashRewardMax: 550000, expReward: 1100,
    lootTable: [{ collectionId: 'sniper_kit', itemId: 'sk_ghillie_suit', dropChance: 0.08 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 6: Capo (Lv 29-38)
  // ========================
  {
    id: 'casino_heist', name: 'Casino Heist', tier: 'capo',
    description: 'Hit the cage during a busy night. Need inside help.',
    energyCost: 55, cashRewardMin: 500000, cashRewardMax: 1500000, expReward: 1800,
    lootTable: [{ collectionId: 'capo_seals', itemId: 'cs_gold_seal', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'drug_operation', name: 'Drug Operation', tier: 'capo',
    description: 'Oversee manufacturing and distribution in your territory.',
    energyCost: 60, cashRewardMin: 650000, cashRewardMax: 2000000, expReward: 2200,
    lootTable: [{ collectionId: 'capo_seals', itemId: 'cs_ruby_ring', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'money_laundering', name: 'Money Laundering', tier: 'capo',
    description: 'Clean dirty money through front businesses.',
    energyCost: 65, cashRewardMin: 800000, cashRewardMax: 2500000, expReward: 2600,
    lootTable: [{ collectionId: 'capo_seals', itemId: 'cs_ledger', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'territory_takeover', name: 'Territory Takeover', tier: 'capo',
    description: 'Expand family territory by force. Expect resistance.',
    energyCost: 70, cashRewardMin: 1000000, cashRewardMax: 3000000, expReward: 3000,
    lootTable: [{ collectionId: 'capo_seals', itemId: 'cs_territory_map', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'run_nightclub', name: 'Run an Underground Club', tier: 'capo',
    description: 'Manage a high-end nightclub for the connected crowd.',
    energyCost: 58, cashRewardMin: 550000, cashRewardMax: 1800000, expReward: 2000,
    lootTable: [{ collectionId: 'territory_markers', itemId: 'tm_flag', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'bribe_judge', name: 'Bribe a Federal Judge', tier: 'capo',
    description: 'Get a judge to dismiss cases against family members.',
    energyCost: 62, cashRewardMin: 700000, cashRewardMax: 2200000, expReward: 2400,
    lootTable: [{ collectionId: 'territory_markers', itemId: 'tm_deed', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'hostile_takeover', name: 'Hostile Business Takeover', tier: 'capo',
    description: 'Acquire a legitimate business through... persuasion.',
    energyCost: 68, cashRewardMin: 900000, cashRewardMax: 2800000, expReward: 2800,
    lootTable: [{ collectionId: 'territory_markers', itemId: 'tm_contract', dropChance: 0.07 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 7: Consigliere (Lv 39-50)
  // ========================
  {
    id: 'negotiate_truce', name: 'Negotiate a Family Truce', tier: 'consigliere',
    description: 'Broker peace between warring families. Your word is law.',
    energyCost: 72, cashRewardMin: 2000000, cashRewardMax: 6000000, expReward: 4500,
    lootTable: [{ collectionId: 'consigliere_scrolls', itemId: 'csc_peace_treaty', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'offshore_accounts', name: 'Set Up Offshore Accounts', tier: 'consigliere',
    description: 'Move family money through Swiss and Cayman accounts.',
    energyCost: 78, cashRewardMin: 2500000, cashRewardMax: 8000000, expReward: 5500,
    lootTable: [{ collectionId: 'consigliere_scrolls', itemId: 'csc_account_key', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'political_campaign', name: 'Fund a Political Campaign', tier: 'consigliere',
    description: 'Install your candidate in city hall. Control the government.',
    energyCost: 82, cashRewardMin: 3000000, cashRewardMax: 10000000, expReward: 6000,
    lootTable: [{ collectionId: 'consigliere_scrolls', itemId: 'csc_ballot_box', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'media_control', name: 'Control the Media', tier: 'consigliere',
    description: 'Buy a news network. Control the narrative.',
    energyCost: 85, cashRewardMin: 3500000, cashRewardMax: 12000000, expReward: 6500,
    lootTable: [{ collectionId: 'consigliere_scrolls', itemId: 'csc_press_pass', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'plant_mole', name: 'Plant a Mole in the FBI', tier: 'consigliere',
    description: 'Get an agent on the family payroll for inside information.',
    energyCost: 75, cashRewardMin: 2200000, cashRewardMax: 7000000, expReward: 5000,
    lootTable: [{ collectionId: 'advisor_collection', itemId: 'ac_cipher', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'union_takeover', name: 'Take Over a Union', tier: 'consigliere',
    description: 'Control the docks through union leadership.',
    energyCost: 80, cashRewardMin: 2800000, cashRewardMax: 9000000, expReward: 5800,
    lootTable: [{ collectionId: 'advisor_collection', itemId: 'ac_union_card', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'international_deal', name: 'International Arms Deal', tier: 'consigliere',
    description: 'Broker a deal between foreign governments and the family.',
    energyCost: 88, cashRewardMin: 4000000, cashRewardMax: 14000000, expReward: 7000,
    lootTable: [{ collectionId: 'advisor_collection', itemId: 'ac_diplomatic_pouch', dropChance: 0.06 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 8: Underboss (Lv 51-65)
  // ========================
  {
    id: 'federal_evidence', name: 'Steal Federal Evidence', tier: 'underboss',
    description: 'Bribe or break into federal offices to destroy evidence.',
    energyCost: 90, cashRewardMin: 8000000, cashRewardMax: 25000000, expReward: 10000,
    lootTable: [{ collectionId: 'underboss_insignias', itemId: 'ui_golden_crest', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'witness_elimination', name: 'Witness Protection Breach', tier: 'underboss',
    description: 'Find and silence witnesses in federal protection.',
    energyCost: 95, cashRewardMin: 10000000, cashRewardMax: 30000000, expReward: 12000,
    lootTable: [{ collectionId: 'underboss_insignias', itemId: 'ui_obsidian_ring', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'political_bribery', name: 'Senate Corruption', tier: 'underboss',
    description: 'Get senators in your pocket for legislative protection.',
    energyCost: 100, cashRewardMin: 12000000, cashRewardMax: 40000000, expReward: 14000,
    lootTable: [{ collectionId: 'underboss_insignias', itemId: 'ui_senate_seal', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'rival_family_war', name: 'All-Out Family War', tier: 'underboss',
    description: 'Launch coordinated attacks on all rival operations.',
    energyCost: 110, cashRewardMin: 15000000, cashRewardMax: 50000000, expReward: 16000,
    lootTable: [{ collectionId: 'underboss_insignias', itemId: 'ui_war_banner', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'cia_blackmail', name: 'Blackmail a CIA Director', tier: 'underboss',
    description: 'Use compromising intel to gain intelligence community access.',
    energyCost: 92, cashRewardMin: 9000000, cashRewardMax: 28000000, expReward: 11000,
    lootTable: [{ collectionId: 'power_tokens', itemId: 'pt_classified_file', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'prison_empire', name: 'Run a Prison Empire', tier: 'underboss',
    description: 'Control the contraband trade inside federal prisons.',
    energyCost: 98, cashRewardMin: 11000000, cashRewardMax: 35000000, expReward: 13000,
    lootTable: [{ collectionId: 'power_tokens', itemId: 'pt_prison_key', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'war_chest', name: 'Build the War Chest', tier: 'underboss',
    description: 'Consolidate all family wealth for the final push to power.',
    energyCost: 105, cashRewardMin: 14000000, cashRewardMax: 45000000, expReward: 15000,
    lootTable: [{ collectionId: 'power_tokens', itemId: 'pt_vault_key', dropChance: 0.05 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },

  // ========================
  // TIER 9: Boss (Lv 66+)
  // ========================
  {
    id: 'city_takeover', name: 'Take Over the City', tier: 'boss',
    description: 'Consolidate power over all criminal operations in the city.',
    energyCost: 120, cashRewardMin: 50000000, cashRewardMax: 150000000, expReward: 25000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_diamond_crown', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'eliminate_families', name: 'Eliminate Rival Families', tier: 'boss',
    description: 'Systematically dismantle competing crime families.',
    energyCost: 130, cashRewardMin: 75000000, cashRewardMax: 200000000, expReward: 30000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_scepter', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'build_empire', name: 'Build Criminal Empire', tier: 'boss',
    description: 'Establish an untouchable criminal empire spanning multiple cities.',
    energyCost: 140, cashRewardMin: 100000000, cashRewardMax: 300000000, expReward: 35000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_throne', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'godfather', name: 'Become the Godfather', tier: 'boss',
    description: 'Achieve legendary status as the most powerful crime boss in history.',
    energyCost: 150, cashRewardMin: 150000000, cashRewardMax: 500000000, expReward: 50000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_ring_of_power', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'world_domination', name: 'Global Criminal Network', tier: 'boss',
    description: 'Extend your empire to every continent. International operations.',
    energyCost: 135, cashRewardMin: 80000000, cashRewardMax: 250000000, expReward: 32000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_globe', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'control_government', name: 'Shadow Government', tier: 'boss',
    description: 'Control the government from behind the scenes. The real power.',
    energyCost: 145, cashRewardMin: 120000000, cashRewardMax: 350000000, expReward: 40000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_seal_of_power', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
  {
    id: 'legacy', name: 'Cement Your Legacy', tier: 'boss',
    description: 'Write yourself into the history books. Immortal legend.',
    energyCost: 160, cashRewardMin: 200000000, cashRewardMax: 750000000, expReward: 60000,
    lootTable: [{ collectionId: 'crown_jewels', itemId: 'cj_golden_plaque', dropChance: 0.04 }],
    masteryProgress: 0, masteryLevel: 0, timesCompleted: 0,
  },
]

// ----------------------------------------
// PROPERTIES DATA - 10 properties with upgrades
// ----------------------------------------

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'vacant_lot', name: 'Vacant Lot', description: 'A rundown lot perfect for shady dealings.',
    cost: 5000, incomePerHour: 50, owned: 0, maxOwnable: 10, upgradeLevel: 0, icon: '🏚️',
  },
  {
    id: 'mafia_mikes', name: "Mafia Mike's", description: 'A dive bar popular with the crew. Cold beer, warm company.',
    cost: 25000, incomePerHour: 150, owned: 0, maxOwnable: 8, upgradeLevel: 0, icon: '🍺',
  },
  {
    id: 'italian_restaurant', name: 'Italian Restaurant', description: 'A front business for meetings and money laundering.',
    cost: 75000, incomePerHour: 400, owned: 0, maxOwnable: 5, upgradeLevel: 0, icon: '🍝',
  },
  {
    id: 'apartment_complex', name: 'Apartment Complex', description: 'Affordable housing for the neighborhood. High occupancy.',
    cost: 200000, incomePerHour: 1000, owned: 0, maxOwnable: 4, upgradeLevel: 0, icon: '🏢',
  },
  {
    id: 'warehouse', name: 'Warehouse', description: 'Storage for... legitimate goods. Nothing to see here.',
    cost: 500000, incomePerHour: 2500, owned: 0, maxOwnable: 4, upgradeLevel: 0, icon: '📦',
  },
  {
    id: 'night_club', name: 'Night Club', description: 'Popular nightspot. Great for recruiting and dealing.',
    cost: 1500000, incomePerHour: 7000, owned: 0, maxOwnable: 3, upgradeLevel: 0, icon: '🎵',
  },
  {
    id: 'hotel', name: 'Five-Star Hotel', description: 'Luxury hotel with VIP services for special clients.',
    cost: 5000000, incomePerHour: 25000, owned: 0, maxOwnable: 3, upgradeLevel: 0, icon: '🏨',
  },
  {
    id: 'casino', name: 'Casino', description: 'House always wins. So do you.',
    cost: 20000000, incomePerHour: 80000, owned: 0, maxOwnable: 2, upgradeLevel: 0, icon: '🎰',
  },
  {
    id: 'marina', name: 'Private Marina', description: 'Perfect for importing goods without customs interference.',
    cost: 75000000, incomePerHour: 300000, owned: 0, maxOwnable: 2, upgradeLevel: 0, icon: '⛵',
  },
  {
    id: 'office_building', name: 'Corporate HQ', description: 'Your legitimate business empire headquarters. Untouchable.',
    cost: 250000000, incomePerHour: 1000000, owned: 0, maxOwnable: 1, upgradeLevel: 0, icon: '🏙️',
  },
]

/** Property upgrade multipliers: level 1 = 1.5x income @ 2x cost, level 2 = 2.5x @ 4x, level 3 = 4x @ 8x */
export const PROPERTY_UPGRADE_MULTIPLIERS = [
  { incomeMultiplier: 1.0, costMultiplier: 1.0 },   // base
  { incomeMultiplier: 1.5, costMultiplier: 2.0 },   // improved
  { incomeMultiplier: 2.5, costMultiplier: 4.0 },   // premium
  { incomeMultiplier: 4.0, costMultiplier: 8.0 },   // max
]

export function getPropertyIncome(prop: Property): number {
  return Math.floor(prop.incomePerHour * PROPERTY_UPGRADE_MULTIPLIERS[prop.upgradeLevel].incomeMultiplier)
}

export function getPropertyUpgradeCost(prop: Property): number {
  if (prop.upgradeLevel >= 3) return 0
  return Math.floor(prop.cost * PROPERTY_UPGRADE_MULTIPLIERS[prop.upgradeLevel + 1].costMultiplier)
}

// ----------------------------------------
// EQUIPMENT DATA - 30 items (10 per type)
// ----------------------------------------

export const INITIAL_EQUIPMENT: Equipment[] = [
  // WEAPONS (10)
  {
    id: 'switchblade', name: 'Switchblade', type: 'weapon',
    description: 'Classic street weapon. Gets the point across.',
    attackBonus: 2, defenseBonus: 0, cost: 500, owned: 0, maxOwnable: 501, icon: '🔪',
  },
  {
    id: 'baseball_bat', name: 'Baseball Bat', type: 'weapon',
    description: "America's pastime, mob style.",
    attackBonus: 4, defenseBonus: 1, cost: 1500, owned: 0, maxOwnable: 501, icon: '🏏',
  },
  {
    id: 'pistol', name: '9mm Pistol', type: 'weapon',
    description: 'Standard issue for any self-respecting mobster.',
    attackBonus: 8, defenseBonus: 0, cost: 5000, owned: 0, maxOwnable: 501, icon: '🔫',
  },
  {
    id: 'shotgun', name: 'Sawed-off Shotgun', type: 'weapon',
    description: "For when subtlety isn't required.",
    attackBonus: 15, defenseBonus: 0, cost: 15000, owned: 0, maxOwnable: 501, icon: '💥',
  },
  {
    id: 'tommy_gun', name: 'Tommy Gun', type: 'weapon',
    description: 'The Chicago Typewriter. A classic.',
    attackBonus: 25, defenseBonus: 0, cost: 50000, owned: 0, maxOwnable: 501, icon: '🔫',
  },
  {
    id: 'ak47', name: 'AK-47', type: 'weapon',
    description: 'Reliable, deadly, and easy to acquire.',
    attackBonus: 40, defenseBonus: 0, cost: 150000, owned: 0, maxOwnable: 501, icon: '💀',
  },
  {
    id: 'rpg', name: 'RPG Launcher', type: 'weapon',
    description: 'When you need to make an explosive statement.',
    attackBonus: 60, defenseBonus: 0, cost: 500000, owned: 0, maxOwnable: 501, icon: '🚀',
  },
  {
    id: 'minigun', name: 'Minigun', type: 'weapon',
    description: 'Overkill is underrated.',
    attackBonus: 85, defenseBonus: 0, cost: 2000000, owned: 0, maxOwnable: 501, icon: '⚙️',
  },
  {
    id: 'sniper_50cal', name: '.50 Cal Sniper', type: 'weapon',
    description: 'Anti-materiel rifle. Takes out targets AND their cover.',
    attackBonus: 120, defenseBonus: 0, cost: 10000000, owned: 0, maxOwnable: 501, icon: '🎯',
  },
  {
    id: 'orbital_strike', name: 'Orbital Strike Access', type: 'weapon',
    description: "You've made some very powerful friends.",
    attackBonus: 200, defenseBonus: 0, cost: 50000000, owned: 0, maxOwnable: 501, icon: '☄️',
  },

  // ARMOR (10)
  {
    id: 'leather_jacket', name: 'Leather Jacket', type: 'armor',
    description: 'Looks cool, offers minimal protection.',
    attackBonus: 0, defenseBonus: 3, cost: 1000, owned: 0, maxOwnable: 501, icon: '🧥',
  },
  {
    id: 'kevlar_vest', name: 'Kevlar Vest', type: 'armor',
    description: 'Standard ballistic protection.',
    attackBonus: 0, defenseBonus: 8, cost: 5000, owned: 0, maxOwnable: 501, icon: '🦺',
  },
  {
    id: 'tactical_armor', name: 'Tactical Armor', type: 'armor',
    description: 'Military-grade body armor.',
    attackBonus: 0, defenseBonus: 15, cost: 20000, owned: 0, maxOwnable: 501, icon: '🛡️',
  },
  {
    id: 'armored_suit', name: 'Armored Suit', type: 'armor',
    description: 'Bespoke suit with hidden armor plating.',
    attackBonus: 2, defenseBonus: 25, cost: 75000, owned: 0, maxOwnable: 501, icon: '🕴️',
  },
  {
    id: 'riot_gear', name: 'Riot Gear', type: 'armor',
    description: 'Full tactical riot protection. Head to toe.',
    attackBonus: 3, defenseBonus: 40, cost: 250000, owned: 0, maxOwnable: 501, icon: '🔰',
  },
  {
    id: 'exosuit', name: 'Exosuit Prototype', type: 'armor',
    description: 'Stolen military tech. Enhanced strength and protection.',
    attackBonus: 10, defenseBonus: 60, cost: 1000000, owned: 0, maxOwnable: 501, icon: '🤖',
  },
  {
    id: 'titan_armor', name: 'Titan Armor', type: 'armor',
    description: "Virtually invincible. You're basically a tank.",
    attackBonus: 15, defenseBonus: 90, cost: 5000000, owned: 0, maxOwnable: 501, icon: '⚔️',
  },
  {
    id: 'nano_shield', name: 'Nano Shield System', type: 'armor',
    description: 'Nanobots that repair damage in real-time.',
    attackBonus: 25, defenseBonus: 130, cost: 25000000, owned: 0, maxOwnable: 501, icon: '✨',
  },
  {
    id: 'quantum_barrier', name: 'Quantum Barrier', type: 'armor',
    description: 'Bending reality itself for protection.',
    attackBonus: 40, defenseBonus: 180, cost: 100000000, owned: 0, maxOwnable: 501, icon: '🌀',
  },
  {
    id: 'godmode_armor', name: 'Absolute Defense', type: 'armor',
    description: 'The ultimate protection. Nothing gets through.',
    attackBonus: 60, defenseBonus: 250, cost: 500000000, owned: 0, maxOwnable: 501, icon: '👑',
  },

  // VEHICLES (10)
  {
    id: 'sedan', name: 'Unmarked Sedan', type: 'vehicle',
    description: 'Blends in. Perfect for getaways.',
    attackBonus: 1, defenseBonus: 2, cost: 2000, owned: 0, maxOwnable: 501, icon: '🚗',
  },
  {
    id: 'suv', name: 'Armored SUV', type: 'vehicle',
    description: 'Bulletproof windows and run-flat tires.',
    attackBonus: 3, defenseBonus: 8, cost: 25000, owned: 0, maxOwnable: 501, icon: '🚙',
  },
  {
    id: 'sports_car', name: 'Sports Car', type: 'vehicle',
    description: 'Fast enough to outrun anything.',
    attackBonus: 8, defenseBonus: 4, cost: 100000, owned: 0, maxOwnable: 501, icon: '🏎️',
  },
  {
    id: 'armored_limo', name: 'Armored Limo', type: 'vehicle',
    description: 'Travel in style with full ballistic protection.',
    attackBonus: 10, defenseBonus: 15, cost: 350000, owned: 0, maxOwnable: 501, icon: '🚐',
  },
  {
    id: 'helicopter', name: 'Private Helicopter', type: 'vehicle',
    description: 'Aerial advantage and quick escapes.',
    attackBonus: 15, defenseBonus: 10, cost: 1000000, owned: 0, maxOwnable: 501, icon: '🚁',
  },
  {
    id: 'yacht', name: 'Armored Yacht', type: 'vehicle',
    description: 'Mobile command center on international waters.',
    attackBonus: 20, defenseBonus: 25, cost: 5000000, owned: 0, maxOwnable: 501, icon: '🛥️',
  },
  {
    id: 'jet', name: 'Private Jet', type: 'vehicle',
    description: 'Global reach. Untouchable.',
    attackBonus: 30, defenseBonus: 20, cost: 20000000, owned: 0, maxOwnable: 501, icon: '✈️',
  },
  {
    id: 'stealth_jet', name: 'Stealth Fighter', type: 'vehicle',
    description: 'Off-the-books military hardware.',
    attackBonus: 50, defenseBonus: 50, cost: 75000000, owned: 0, maxOwnable: 501, icon: '🛩️',
  },
  {
    id: 'submarine', name: 'Nuclear Submarine', type: 'vehicle',
    description: 'Your own underwater fortress.',
    attackBonus: 80, defenseBonus: 80, cost: 250000000, owned: 0, maxOwnable: 501, icon: '🚢',
  },
  {
    id: 'aircraft_carrier', name: 'Aircraft Carrier', type: 'vehicle',
    description: 'A floating city under your command.',
    attackBonus: 120, defenseBonus: 120, cost: 1000000000, owned: 0, maxOwnable: 501, icon: '⚓',
  },
]

// ----------------------------------------
// AI OPPONENTS
// ----------------------------------------

export const OPPONENTS: Opponent[] = [
  {
    id: 'street_punk', name: 'Street Punk',
    description: 'Young troublemaker looking to make a name.',
    level: 1, attack: 5, defense: 3, health: 50,
    cashRewardMin: 50, cashRewardMax: 200, expReward: 10, icon: '🧑',
  },
  {
    id: 'local_thug', name: 'Local Thug',
    description: 'Neighborhood tough guy with connections.',
    level: 5, attack: 15, defense: 12, health: 100,
    cashRewardMin: 200, cashRewardMax: 600, expReward: 30, icon: '💪',
  },
  {
    id: 'gang_member', name: 'Gang Member',
    description: "Runs with a crew. Don't expect a fair fight.",
    level: 10, attack: 35, defense: 28, health: 200,
    cashRewardMin: 500, cashRewardMax: 1500, expReward: 60, icon: '🔥',
  },
  {
    id: 'enforcer', name: 'Mob Enforcer',
    description: "Professional muscle. This one knows what they're doing.",
    level: 20, attack: 80, defense: 65, health: 400,
    cashRewardMin: 2000, cashRewardMax: 6000, expReward: 150, icon: '🦾',
  },
  {
    id: 'hitman', name: 'Professional Hitman',
    description: 'Cold, calculating killer for hire.',
    level: 35, attack: 180, defense: 140, health: 800,
    cashRewardMin: 10000, cashRewardMax: 30000, expReward: 400, icon: '🎯',
  },
  {
    id: 'capo_rival', name: 'Rival Capo',
    description: 'Commands a crew of 50. Dangerous and resourceful.',
    level: 45, attack: 300, defense: 250, health: 1200,
    cashRewardMin: 30000, cashRewardMax: 100000, expReward: 750, icon: '🤵',
  },
  {
    id: 'underboss_rival', name: 'Rival Underboss',
    description: 'Second-in-command of a competing family.',
    level: 60, attack: 500, defense: 400, health: 2000,
    cashRewardMin: 100000, cashRewardMax: 300000, expReward: 1500, icon: '🎩',
  },
  {
    id: 'don', name: 'Rival Don',
    description: 'Head of a rival crime family. Ultimate challenge.',
    level: 75, attack: 800, defense: 700, health: 3000,
    cashRewardMin: 250000, cashRewardMax: 750000, expReward: 3000, icon: '👑',
  },
  {
    id: 'godfather_opp', name: 'The Godfather',
    description: 'Legend of the underworld. Few have challenged him and lived.',
    level: 100, attack: 1500, defense: 1200, health: 5000,
    cashRewardMin: 1000000, cashRewardMax: 5000000, expReward: 10000, icon: '💀',
  },
]

// ----------------------------------------
// COLLECTIONS DATA - 17 collections
// ----------------------------------------

export const INITIAL_COLLECTIONS: Collection[] = [
  // Tier 1 collections
  {
    id: 'street_tokens', name: 'Street Cred', tier: 'street_thug',
    items: [
      { id: 'st_brass_knuckles', name: 'Brass Knuckles', icon: '🥊', collected: false },
      { id: 'st_switchblade', name: 'Street Switchblade', icon: '🗡️', collected: false },
      { id: 'st_spray_paint', name: 'Spray Paint Can', icon: '🎨', collected: false },
      { id: 'st_ski_mask', name: 'Ski Mask', icon: '🎭', collected: false },
      { id: 'st_bandana', name: 'Gang Bandana', icon: '🏴', collected: false },
      { id: 'st_crowbar', name: 'Crowbar', icon: '🔧', collected: false },
      { id: 'st_dice', name: 'Loaded Dice', icon: '🎲', collected: false },
    ],
    rewardDescription: '+5 Max Energy',
    rewardType: 'energy', rewardValue: 5, completed: false, timesCompleted: 0,
  },
  {
    id: 'petty_cash', name: 'Petty Cash Stash', tier: 'street_thug',
    items: [
      { id: 'pc_walkie_talkie', name: 'Walkie-Talkie', icon: '📻', collected: false },
      { id: 'pc_betting_slip', name: 'Betting Slip', icon: '🎫', collected: false },
      { id: 'pc_slim_jim', name: 'Slim Jim', icon: '🔑', collected: false },
      { id: 'pc_fake_id', name: 'Fake ID', icon: '🪪', collected: false },
      { id: 'pc_pager', name: 'Burner Pager', icon: '📟', collected: false },
      { id: 'pc_flask', name: 'Hip Flask', icon: '🥃', collected: false },
      { id: 'pc_zippo', name: 'Lucky Zippo', icon: '🔥', collected: false },
    ],
    rewardDescription: '$10,000 Cash',
    rewardType: 'cash', rewardValue: 10000, completed: false, timesCompleted: 0,
  },

  // Tier 2 collections
  {
    id: 'associate_rings', name: 'Associate Rings', tier: 'associate',
    items: [
      { id: 'ar_pinky_ring', name: 'Pinky Ring', icon: '💍', collected: false },
      { id: 'ar_gold_chain', name: 'Gold Chain', icon: '⛓️', collected: false },
      { id: 'ar_racing_gloves', name: 'Racing Gloves', icon: '🧤', collected: false },
      { id: 'ar_lockpick_set', name: 'Lockpick Set', icon: '🔐', collected: false },
      { id: 'ar_money_clip', name: 'Money Clip', icon: '💵', collected: false },
      { id: 'ar_cigars', name: 'Cuban Cigars', icon: '🚬', collected: false },
      { id: 'ar_sunglasses', name: 'Designer Shades', icon: '🕶️', collected: false },
    ],
    rewardDescription: '+3 Max Stamina',
    rewardType: 'stamina', rewardValue: 3, completed: false, timesCompleted: 0,
  },
  {
    id: 'brass_knuckles', name: 'Knuckle Collection', tier: 'associate',
    items: [
      { id: 'bk_silver_knucks', name: 'Silver Knuckles', icon: '🪙', collected: false },
      { id: 'bk_gold_knucks', name: 'Gold Knuckles', icon: '🥇', collected: false },
      { id: 'bk_iron_knucks', name: 'Iron Knuckles', icon: '⚙️', collected: false },
      { id: 'bk_spiked_knucks', name: 'Spiked Knuckles', icon: '🔱', collected: false },
      { id: 'bk_diamond_knucks', name: 'Diamond Knuckles', icon: '💎', collected: false },
      { id: 'bk_titanium_knucks', name: 'Titanium Knuckles', icon: '🔩', collected: false },
      { id: 'bk_obsidian_knucks', name: 'Obsidian Knuckles', icon: '⬛', collected: false },
    ],
    rewardDescription: '+2 Attack',
    rewardType: 'attack', rewardValue: 2, completed: false, timesCompleted: 0,
  },

  // Tier 3 collections
  {
    id: 'soldier_medals', name: 'Soldier Medals', tier: 'soldier',
    items: [
      { id: 'sm_bronze_star', name: 'Bronze Star', icon: '⭐', collected: false },
      { id: 'sm_service_ribbon', name: 'Service Ribbon', icon: '🎀', collected: false },
      { id: 'sm_combat_cross', name: 'Combat Cross', icon: '✝️', collected: false },
      { id: 'sm_silver_eagle', name: 'Silver Eagle', icon: '🦅', collected: false },
      { id: 'sm_valor_medal', name: 'Medal of Valor', icon: '🎖️', collected: false },
      { id: 'sm_loyalty_pin', name: 'Loyalty Pin', icon: '📌', collected: false },
      { id: 'sm_honor_badge', name: 'Honor Badge', icon: '🛡️', collected: false },
    ],
    rewardDescription: '-0.5% Bank Fee',
    rewardType: 'bank_fee', rewardValue: 0.005, completed: false, timesCompleted: 0,
  },
  {
    id: 'war_trophies', name: 'War Trophies', tier: 'soldier',
    items: [
      { id: 'wt_dog_tags', name: 'Dog Tags', icon: '🏷️', collected: false },
      { id: 'wt_combat_knife', name: 'Combat Knife', icon: '🗡️', collected: false },
      { id: 'wt_war_medal', name: 'War Medal', icon: '🥇', collected: false },
      { id: 'wt_bullet_shell', name: 'Bullet Shell', icon: '💊', collected: false },
      { id: 'wt_helmet', name: 'Battle Helmet', icon: '⛑️', collected: false },
      { id: 'wt_flag', name: 'Captured Flag', icon: '🚩', collected: false },
      { id: 'wt_scope', name: 'Sniper Scope', icon: '🔭', collected: false },
    ],
    rewardDescription: '+2 Defense',
    rewardType: 'defense', rewardValue: 2, completed: false, timesCompleted: 0,
  },

  // Tier 4 collections
  {
    id: 'enforcer_badges', name: 'Enforcer Badges', tier: 'enforcer',
    items: [
      { id: 'eb_iron_fist', name: 'Iron Fist Medal', icon: '✊', collected: false },
      { id: 'eb_badge', name: 'Enforcer Badge', icon: '🔰', collected: false },
      { id: 'eb_handcuffs', name: 'Gold Handcuffs', icon: '⛓️', collected: false },
      { id: 'eb_blackmail', name: 'Blackmail Folder', icon: '📂', collected: false },
      { id: 'eb_nightstick', name: 'Nightstick', icon: '🪵', collected: false },
      { id: 'eb_brass_badge', name: 'Brass Badge', icon: '🏅', collected: false },
      { id: 'eb_warrant', name: 'Fake Warrant', icon: '📜', collected: false },
    ],
    rewardDescription: '+8 Max Energy',
    rewardType: 'energy', rewardValue: 8, completed: false, timesCompleted: 0,
  },
  {
    id: 'hit_list', name: 'Hit List', tier: 'enforcer',
    items: [
      { id: 'hl_target_photo', name: 'Target Photo', icon: '📷', collected: false },
      { id: 'hl_dossier', name: 'Target Dossier', icon: '📋', collected: false },
      { id: 'hl_lighter', name: 'Arson Lighter', icon: '🔥', collected: false },
      { id: 'hl_blueprint', name: 'Building Blueprint', icon: '📐', collected: false },
      { id: 'hl_burner_phone', name: 'Burner Phone', icon: '📱', collected: false },
      { id: 'hl_getaway_map', name: 'Getaway Map', icon: '🗺️', collected: false },
      { id: 'hl_alias', name: 'Alias Documents', icon: '📄', collected: false },
    ],
    rewardDescription: '$500,000 Cash',
    rewardType: 'cash', rewardValue: 500000, completed: false, timesCompleted: 0,
  },

  // Tier 5 collections
  {
    id: 'hitman_tools', name: 'Hitman Tools', tier: 'hitman',
    items: [
      { id: 'ht_silencer', name: 'Silencer', icon: '🔇', collected: false },
      { id: 'ht_garrote', name: 'Garrote Wire', icon: '🪢', collected: false },
      { id: 'ht_scope', name: 'Thermal Scope', icon: '🔴', collected: false },
      { id: 'ht_detonator', name: 'Remote Detonator', icon: '💣', collected: false },
      { id: 'ht_poison_vial', name: 'Poison Vial', icon: '🧪', collected: false },
      { id: 'ht_disguise_kit', name: 'Disguise Kit', icon: '🎭', collected: false },
      { id: 'ht_piano_wire', name: 'Piano Wire', icon: '🎹', collected: false },
    ],
    rewardDescription: '+5 Attack',
    rewardType: 'attack', rewardValue: 5, completed: false, timesCompleted: 0,
  },
  {
    id: 'sniper_kit', name: 'Sniper Kit', tier: 'hitman',
    items: [
      { id: 'sk_bipod', name: 'Rifle Bipod', icon: '🔩', collected: false },
      { id: 'sk_night_vision', name: 'Night Vision', icon: '👁️', collected: false },
      { id: 'sk_ghillie_suit', name: 'Ghillie Suit', icon: '🌿', collected: false },
      { id: 'sk_wind_gauge', name: 'Wind Gauge', icon: '💨', collected: false },
      { id: 'sk_rangefinder', name: 'Rangefinder', icon: '📏', collected: false },
      { id: 'sk_ammo_box', name: 'Match-Grade Ammo', icon: '📦', collected: false },
      { id: 'sk_spotter_scope', name: 'Spotter Scope', icon: '🔭', collected: false },
    ],
    rewardDescription: '+5 Defense',
    rewardType: 'defense', rewardValue: 5, completed: false, timesCompleted: 0,
  },

  // Tier 6 collections
  {
    id: 'capo_seals', name: 'Capo Seals', tier: 'capo',
    items: [
      { id: 'cs_gold_seal', name: 'Gold Seal', icon: '🪙', collected: false },
      { id: 'cs_ruby_ring', name: 'Ruby Signet Ring', icon: '💍', collected: false },
      { id: 'cs_ledger', name: 'Secret Ledger', icon: '📒', collected: false },
      { id: 'cs_territory_map', name: 'Territory Map', icon: '🗺️', collected: false },
      { id: 'cs_gold_pen', name: 'Gold Fountain Pen', icon: '🖊️', collected: false },
      { id: 'cs_family_crest', name: 'Family Crest', icon: '🛡️', collected: false },
      { id: 'cs_safe_combo', name: 'Safe Combination', icon: '🔢', collected: false },
    ],
    rewardDescription: '-0.5% Bank Fee',
    rewardType: 'bank_fee', rewardValue: 0.005, completed: false, timesCompleted: 0,
  },
  {
    id: 'territory_markers', name: 'Territory Markers', tier: 'capo',
    items: [
      { id: 'tm_flag', name: 'Territory Flag', icon: '🏴', collected: false },
      { id: 'tm_deed', name: 'Property Deed', icon: '📜', collected: false },
      { id: 'tm_contract', name: 'Territory Contract', icon: '📝', collected: false },
      { id: 'tm_spray_tag', name: 'Spray Tag', icon: '🎨', collected: false },
      { id: 'tm_boundary_stone', name: 'Boundary Stone', icon: '🪨', collected: false },
      { id: 'tm_toll_badge', name: 'Toll Badge', icon: '🎫', collected: false },
      { id: 'tm_key_to_city', name: 'Key to the City', icon: '🗝️', collected: false },
    ],
    rewardDescription: '+10 Max Stamina',
    rewardType: 'stamina', rewardValue: 10, completed: false, timesCompleted: 0,
  },

  // Tier 7 collections
  {
    id: 'consigliere_scrolls', name: 'Consigliere Scrolls', tier: 'consigliere',
    items: [
      { id: 'csc_peace_treaty', name: 'Peace Treaty', icon: '🕊️', collected: false },
      { id: 'csc_account_key', name: 'Account Key', icon: '🔑', collected: false },
      { id: 'csc_ballot_box', name: 'Rigged Ballot', icon: '🗳️', collected: false },
      { id: 'csc_press_pass', name: 'Press Pass', icon: '📰', collected: false },
      { id: 'csc_law_book', name: 'Law Loophole Book', icon: '📕', collected: false },
      { id: 'csc_code_book', name: 'Code Book', icon: '📘', collected: false },
      { id: 'csc_oracle', name: "Oracle's Token", icon: '🔮', collected: false },
    ],
    rewardDescription: '+15 Max Energy',
    rewardType: 'energy', rewardValue: 15, completed: false, timesCompleted: 0,
  },
  {
    id: 'advisor_collection', name: "Advisor's Collection", tier: 'consigliere',
    items: [
      { id: 'ac_cipher', name: 'Cipher Machine', icon: '🔐', collected: false },
      { id: 'ac_union_card', name: 'Union Card', icon: '🪪', collected: false },
      { id: 'ac_diplomatic_pouch', name: 'Diplomatic Pouch', icon: '💼', collected: false },
      { id: 'ac_chess_piece', name: 'Gold Chess King', icon: '♚', collected: false },
      { id: 'ac_whiskey', name: 'Aged Whiskey', icon: '🥃', collected: false },
      { id: 'ac_pocket_watch', name: 'Pocket Watch', icon: '⌚', collected: false },
      { id: 'ac_strategy_book', name: 'Art of War', icon: '📖', collected: false },
    ],
    rewardDescription: '$5,000,000 Cash',
    rewardType: 'cash', rewardValue: 5000000, completed: false, timesCompleted: 0,
  },

  // Tier 8 collections
  {
    id: 'underboss_insignias', name: 'Underboss Insignias', tier: 'underboss',
    items: [
      { id: 'ui_golden_crest', name: 'Golden Crest', icon: '🏆', collected: false },
      { id: 'ui_obsidian_ring', name: 'Obsidian Ring', icon: '💍', collected: false },
      { id: 'ui_senate_seal', name: 'Senate Seal', icon: '🏛️', collected: false },
      { id: 'ui_war_banner', name: 'War Banner', icon: '🚩', collected: false },
      { id: 'ui_blood_oath', name: 'Blood Oath Scroll', icon: '📜', collected: false },
      { id: 'ui_command_baton', name: 'Command Baton', icon: '🪄', collected: false },
      { id: 'ui_iron_mask', name: 'Iron Mask', icon: '🎭', collected: false },
    ],
    rewardDescription: '+10 Attack',
    rewardType: 'attack', rewardValue: 10, completed: false, timesCompleted: 0,
  },
  {
    id: 'power_tokens', name: 'Power Tokens', tier: 'underboss',
    items: [
      { id: 'pt_classified_file', name: 'Classified File', icon: '📁', collected: false },
      { id: 'pt_prison_key', name: 'Prison Master Key', icon: '🗝️', collected: false },
      { id: 'pt_vault_key', name: 'Vault Key', icon: '🔑', collected: false },
      { id: 'pt_blackmail_tape', name: 'Blackmail Tape', icon: '📼', collected: false },
      { id: 'pt_satellite_phone', name: 'Satellite Phone', icon: '📡', collected: false },
      { id: 'pt_nuke_codes', name: 'Nuke Codes', icon: '☢️', collected: false },
      { id: 'pt_power_grid', name: 'Power Grid Access', icon: '⚡', collected: false },
    ],
    rewardDescription: '+10 Defense',
    rewardType: 'defense', rewardValue: 10, completed: false, timesCompleted: 0,
  },

  // Tier 9 collection
  {
    id: 'crown_jewels', name: 'Crown Jewels', tier: 'boss',
    items: [
      { id: 'cj_diamond_crown', name: 'Diamond Crown', icon: '👑', collected: false },
      { id: 'cj_scepter', name: 'Golden Scepter', icon: '🪄', collected: false },
      { id: 'cj_throne', name: 'Throne Fragment', icon: '🪑', collected: false },
      { id: 'cj_ring_of_power', name: 'Ring of Power', icon: '💍', collected: false },
      { id: 'cj_globe', name: 'Golden Globe', icon: '🌍', collected: false },
      { id: 'cj_seal_of_power', name: 'Seal of Power', icon: '🔱', collected: false },
      { id: 'cj_golden_plaque', name: 'Golden Plaque', icon: '🏅', collected: false },
    ],
    rewardDescription: '-1% Bank Fee',
    rewardType: 'bank_fee', rewardValue: 0.01, completed: false, timesCompleted: 0,
  },
]

// ----------------------------------------
// BOSS FIGHTS
// ----------------------------------------

export const BOSS_FIGHTS: BossFight[] = [
  {
    id: 'street_king', name: 'The Street King', icon: '🤴',
    description: 'The ruler of the streets. He controls every corner, every alley.',
    requiredTiers: ['street_thug', 'associate', 'soldier'],
    attack: 200, defense: 150, health: 2000, maxHealth: 2000,
    cashReward: 500000, expReward: 5000,
    rewardDescription: '+10 Attack, +10 Defense',
  },
  {
    id: 'the_enforcer_boss', name: 'The Iron Enforcer', icon: '🦾',
    description: 'An unstoppable force. His reputation alone strikes fear.',
    requiredTiers: ['enforcer', 'hitman'],
    attack: 500, defense: 400, health: 5000, maxHealth: 5000,
    cashReward: 2000000, expReward: 15000,
    rewardDescription: '+20 Attack, +15 Defense',
  },
  {
    id: 'the_consigliere_boss', name: 'The Shadow Advisor', icon: '🧠',
    description: 'The puppet master. He controls everything from the shadows.',
    requiredTiers: ['capo', 'consigliere'],
    attack: 1000, defense: 800, health: 10000, maxHealth: 10000,
    cashReward: 10000000, expReward: 50000,
    rewardDescription: '+30 Max Energy, +15 Max Stamina',
  },
  {
    id: 'the_don_boss', name: 'The Don of Dons', icon: '💀',
    description: 'The final challenge. Defeat him to claim your rightful throne.',
    requiredTiers: ['underboss', 'boss'],
    attack: 2000, defense: 1500, health: 25000, maxHealth: 25000,
    cashReward: 50000000, expReward: 200000,
    rewardDescription: '+50 All Stats',
  },
]

// ----------------------------------------
// ACHIEVEMENTS
// ----------------------------------------

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_job', name: 'Made Man', description: 'Complete your first job.', icon: '🎖️', unlocked: false },
  { id: 'hundred_jobs', name: 'Workaholic', description: 'Complete 100 jobs.', icon: '💼', unlocked: false },
  { id: 'thousand_jobs', name: 'Criminal Mastermind', description: 'Complete 1,000 jobs.', icon: '🧠', unlocked: false },
  { id: 'first_fight', name: 'Street Fighter', description: 'Win your first fight.', icon: '🥊', unlocked: false },
  { id: 'hundred_wins', name: 'Undefeated', description: 'Win 100 fights.', icon: '🏆', unlocked: false },
  { id: 'first_property', name: 'Real Estate', description: 'Purchase your first property.', icon: '🏠', unlocked: false },
  { id: 'millionaire', name: 'Millionaire', description: 'Accumulate $1,000,000 in total cash.', icon: '💰', unlocked: false },
  { id: 'billionaire', name: 'Billionaire', description: 'Accumulate $1,000,000,000 in total cash.', icon: '💎', unlocked: false },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10.', icon: '⭐', unlocked: false },
  { id: 'level_25', name: 'Established', description: 'Reach level 25.', icon: '🌟', unlocked: false },
  { id: 'level_50', name: 'Legendary', description: 'Reach level 50.', icon: '✨', unlocked: false },
  { id: 'level_100', name: 'Immortal', description: 'Reach level 100.', icon: '👑', unlocked: false },
  { id: 'mastery_gold', name: 'Master Criminal', description: 'Achieve gold mastery on any job.', icon: '🥇', unlocked: false },
  { id: 'fully_equipped', name: 'Armed to the Teeth', description: 'Own at least one of each equipment type.', icon: '🛡️', unlocked: false },
  { id: 'property_mogul', name: 'Property Mogul', description: 'Own at least one of each property type.', icon: '🏰', unlocked: false },
  { id: 'beat_godfather', name: 'The New Godfather', description: 'Defeat The Godfather in combat.', icon: '👑', unlocked: false },
  { id: 'first_collection', name: 'Collector', description: 'Complete your first collection.', icon: '🧩', unlocked: false },
  { id: 'all_collections', name: 'Master Collector', description: 'Complete all 17 collections.', icon: '🏆', unlocked: false },
  { id: 'first_boss', name: 'Boss Slayer', description: 'Defeat your first boss.', icon: '⚔️', unlocked: false },
  { id: 'all_bosses', name: 'Untouchable', description: 'Defeat all 4 bosses.', icon: '💀', unlocked: false },
  { id: 'choose_class', name: 'Identity', description: 'Choose your character class.', icon: '🎭', unlocked: false },
  { id: 'mafia_50', name: 'Crime Family', description: 'Grow your mafia to 50 members.', icon: '👥', unlocked: false },
  { id: 'tier_mastery', name: 'Tier Master', description: 'Complete all gold mastery in any tier.', icon: '🏅', unlocked: false },
  { id: 'upgrade_property', name: 'Renovator', description: 'Upgrade a property to max level.', icon: '🔨', unlocked: false },
]

// ----------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------

export function getXPForLevel(level: number): number {
  return level * XP_PER_LEVEL_MULTIPLIER
}

export function getTierName(tier: JobTier): string {
  return TIER_NAMES[tier]
}

export function canAccessTier(playerLevel: number, tier: JobTier): boolean {
  return playerLevel >= TIER_UNLOCK_LEVELS[tier]
}

export function getUnlockedTiers(playerLevel: number): JobTier[] {
  return ALL_TIERS.filter(tier => canAccessTier(playerLevel, tier))
}

export function calculateTotalAttack(player: PlayerStats, equipment: Equipment[]): number {
  const equipmentBonus = equipment.reduce(
    (sum, eq) => sum + (eq.attackBonus * eq.owned), 0
  )
  return player.attack + equipmentBonus + (player.allocatedAttack * SKILL_POINT_BONUS.attack)
}

export function calculateTotalDefense(player: PlayerStats, equipment: Equipment[]): number {
  const equipmentBonus = equipment.reduce(
    (sum, eq) => sum + (eq.defenseBonus * eq.owned), 0
  )
  return player.defense + equipmentBonus + (player.allocatedDefense * SKILL_POINT_BONUS.defense)
}

export function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(2)}K`
  return `$${amount.toFixed(0)}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function calculateBankFee(completedCollections: number, characterClass: PlayerStats['characterClass']): number {
  let fee = BASE_BANK_FEE - (completedCollections * BANK_FEE_PER_COLLECTION)
  if (characterClass === 'mogul') {
    const mogulClass = CHARACTER_CLASSES.find(c => c.id === 'mogul')
    if (mogulClass) fee -= mogulClass.bonuses.bankFeeReduction
  }
  return Math.max(MIN_BANK_FEE, fee)
}

export function getClassDefinition(classId: PlayerStats['characterClass']): ClassDefinition | undefined {
  if (!classId) return undefined
  return CHARACTER_CLASSES.find(c => c.id === classId)
}
