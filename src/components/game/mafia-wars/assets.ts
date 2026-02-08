// ========================================
// MAFIA WARS - ASSET IMPORTS
// ========================================

// Sprite sheet imports
import weaponsSprite from './assets/weapons.png'
import vehiclesSprite from './assets/vehicles.png'
import armorSprite from './assets/armor.png'
import propertiesSprite from './assets/properties.png'
import charactersSprite from './assets/characters.png'

// Export sprite sheets
export const SPRITES = {
  weapons: weaponsSprite,
  vehicles: vehiclesSprite,
  armor: armorSprite,
  properties: propertiesSprite,
  characters: charactersSprite,
}

// Sprite positions (row, col) for 8-item sheets (2x4 grid)
// Weapons: brass knuckles, knife, bat, pistol, shotgun, tommy gun, sniper, RPG
export const WEAPON_POSITIONS: Record<string, { row: number; col: number }> = {
  // Map to actual equipment IDs from constants.ts
  'switchblade': { row: 0, col: 1 },       // knife sprite
  'baseball_bat': { row: 0, col: 2 },
  'pistol': { row: 0, col: 3 },            // 9mm pistol
  'shotgun': { row: 1, col: 0 },
  'tommy_gun': { row: 1, col: 1 },
  'rpg': { row: 1, col: 3 },
  'minigun': { row: 1, col: 2 },           // use sniper slot
  'orbital_strike': { row: 0, col: 0 },    // use brass knuckles slot
}

// Vehicles: motorcycle, sedan, sports car, SUV/hummer, armored truck, limo, helicopter, yacht
export const VEHICLE_POSITIONS: Record<string, { row: number; col: number }> = {
  // Map to actual equipment IDs from constants.ts
  'sedan': { row: 0, col: 1 },
  'suv': { row: 1, col: 0 },
  'sports_car': { row: 0, col: 2 },
  'helicopter': { row: 2, col: 1 },
  'yacht': { row: 2, col: 2 },
  'jet': { row: 0, col: 0 },               // use motorcycle slot
  'stealth_jet': { row: 1, col: 2 },       // use limo slot
  'submarine': { row: 2, col: 0 },         // use armored truck slot
}

// Armor: leather jacket, chain vest, kevlar, suit, tactical vest, trench coat, riot gear, exec suit
export const ARMOR_POSITIONS: Record<string, { row: number; col: number }> = {
  // Map to actual equipment IDs from constants.ts
  'leather_jacket': { row: 0, col: 0 },
  'kevlar_vest': { row: 0, col: 2 },
  'tactical_armor': { row: 1, col: 0 },
  'armored_suit': { row: 0, col: 3 },
  'exosuit': { row: 1, col: 2 },           // riot gear slot
  'titan_armor': { row: 1, col: 1 },       // trench coat slot
  'nano_shield': { row: 0, col: 1 },       // chain vest slot
  'godmode': { row: 1, col: 3 },           // exec armor slot
}

// Properties: warehouse, pawn shop, nightclub, restaurant, casino, office tower, island, mansion
export const PROPERTY_POSITIONS: Record<string, { row: number; col: number }> = {
  // Map to actual property IDs from constants.ts
  'abandoned_lot': { row: 0, col: 0 },     // warehouse sprite
  'italian_restaurant': { row: 0, col: 3 }, // restaurant sprite
  'night_club': { row: 0, col: 2 },        // nightclub sprite
  'casino': { row: 1, col: 0 },
  'hotel': { row: 0, col: 1 },             // pawn shop slot (similar look)
  'marina': { row: 1, col: 3 },
  'skyscraper': { row: 1, col: 1 },
  'island': { row: 1, col: 2 },
}

// Characters/Opponents: street punk, thief, loan shark, enforcer, hitman, capo, underboss, godfather
export const CHARACTER_POSITIONS: Record<string, { row: number; col: number }> = {
  // Map to actual opponent IDs from constants.ts
  'street_punk': { row: 0, col: 0 },
  'local_thug': { row: 0, col: 1 },
  'gang_member': { row: 0, col: 2 },
  'enforcer': { row: 0, col: 3 },
  'hitman': { row: 1, col: 0 },
  'underboss': { row: 1, col: 1 },
  'don': { row: 1, col: 2 },
  'godfather': { row: 1, col: 3 },
}

