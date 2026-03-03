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

// Sprite positions (row, col) for sprite sheets
// Weapons: 2x4 grid
export const WEAPON_POSITIONS: Record<string, { row: number; col: number }> = {
  'switchblade': { row: 0, col: 1 },
  'baseball_bat': { row: 0, col: 2 },
  'pistol': { row: 0, col: 3 },
  'shotgun': { row: 1, col: 0 },
  'tommy_gun': { row: 1, col: 1 },
  'ak47': { row: 0, col: 0 },
  'rpg': { row: 1, col: 3 },
  'minigun': { row: 1, col: 2 },
  'sniper_50cal': { row: 0, col: 0 },
  'orbital_strike': { row: 0, col: 0 },
}

// Vehicles: 3x3 grid
export const VEHICLE_POSITIONS: Record<string, { row: number; col: number }> = {
  'sedan': { row: 0, col: 1 },
  'suv': { row: 1, col: 0 },
  'sports_car': { row: 0, col: 2 },
  'armored_limo': { row: 1, col: 2 },
  'helicopter': { row: 2, col: 1 },
  'yacht': { row: 2, col: 2 },
  'jet': { row: 0, col: 0 },
  'stealth_jet': { row: 1, col: 2 },
  'submarine': { row: 2, col: 0 },
  'aircraft_carrier': { row: 1, col: 1 },
}

// Armor: 2x4 grid
export const ARMOR_POSITIONS: Record<string, { row: number; col: number }> = {
  'leather_jacket': { row: 0, col: 0 },
  'kevlar_vest': { row: 0, col: 2 },
  'tactical_armor': { row: 1, col: 0 },
  'armored_suit': { row: 0, col: 3 },
  'riot_gear': { row: 1, col: 1 },
  'exosuit': { row: 1, col: 2 },
  'titan_armor': { row: 1, col: 1 },
  'nano_shield': { row: 0, col: 1 },
  'quantum_barrier': { row: 1, col: 3 },
  'godmode_armor': { row: 1, col: 3 },
}

// Properties: 2x4 grid
export const PROPERTY_POSITIONS: Record<string, { row: number; col: number }> = {
  'vacant_lot': { row: 0, col: 0 },
  'mafia_mikes': { row: 0, col: 1 },
  'italian_restaurant': { row: 0, col: 3 },
  'apartment_complex': { row: 0, col: 2 },
  'warehouse': { row: 0, col: 0 },
  'night_club': { row: 0, col: 2 },
  'hotel': { row: 0, col: 1 },
  'casino': { row: 1, col: 0 },
  'marina': { row: 1, col: 3 },
  'office_building': { row: 1, col: 1 },
}

// Characters/Opponents: 2x4 grid
export const CHARACTER_POSITIONS: Record<string, { row: number; col: number }> = {
  'street_punk': { row: 0, col: 0 },
  'local_thug': { row: 0, col: 1 },
  'gang_member': { row: 0, col: 2 },
  'enforcer': { row: 0, col: 3 },
  'hitman': { row: 1, col: 0 },
  'capo_rival': { row: 1, col: 1 },
  'underboss_rival': { row: 1, col: 1 },
  'don': { row: 1, col: 2 },
  'godfather_opp': { row: 1, col: 3 },
}
