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
  'brass_knuckles': { row: 0, col: 0 },
  'butterfly_knife': { row: 0, col: 1 },
  'baseball_bat': { row: 0, col: 2 },
  '9mm_pistol': { row: 0, col: 3 },
  'shotgun': { row: 1, col: 0 },
  'tommy_gun': { row: 1, col: 1 },
  'sniper_rifle': { row: 1, col: 2 },
  'rpg': { row: 1, col: 3 },
}

// Vehicles: motorcycle, sedan, sports car, SUV/hummer, armored truck, limo, helicopter, yacht
export const VEHICLE_POSITIONS: Record<string, { row: number; col: number }> = {
  'motorcycle': { row: 0, col: 0 },
  'sedan': { row: 0, col: 1 },
  'sports_car': { row: 0, col: 2 },
  'suv': { row: 1, col: 0 },
  'hummer': { row: 1, col: 1 },
  'limo': { row: 1, col: 2 },
  'armored_truck': { row: 2, col: 0 },
  'helicopter': { row: 2, col: 1 },
  'yacht': { row: 2, col: 2 },
}

// Armor: leather jacket, chain vest, kevlar, suit, tactical vest, trench coat, riot gear, exec suit
export const ARMOR_POSITIONS: Record<string, { row: number; col: number }> = {
  'leather_jacket': { row: 0, col: 0 },
  'chain_vest': { row: 0, col: 1 },
  'kevlar_vest': { row: 0, col: 2 },
  'bulletproof_suit': { row: 0, col: 3 },
  'tactical_vest': { row: 1, col: 0 },
  'armored_trench': { row: 1, col: 1 },
  'riot_gear': { row: 1, col: 2 },
  'executive_armor': { row: 1, col: 3 },
}

// Properties: warehouse, pawn shop, nightclub, restaurant, casino, office tower, island, mansion
export const PROPERTY_POSITIONS: Record<string, { row: number; col: number }> = {
  'abandoned_lot': { row: 0, col: 0 },
  'pawn_shop': { row: 0, col: 1 },
  'nightclub': { row: 0, col: 2 },
  'restaurant': { row: 0, col: 3 },
  'casino': { row: 1, col: 0 },
  'office_building': { row: 1, col: 1 },
  'private_island': { row: 1, col: 2 },
  'mansion': { row: 1, col: 3 },
}

// Characters/Opponents: street punk, thief, loan shark, enforcer, hitman, capo, underboss, godfather
export const CHARACTER_POSITIONS: Record<string, { row: number; col: number }> = {
  'street_punk': { row: 0, col: 0 },
  'petty_thief': { row: 0, col: 1 },
  'loan_shark': { row: 0, col: 2 },
  'enforcer': { row: 0, col: 3 },
  'hitman': { row: 1, col: 0 },
  'capo': { row: 1, col: 1 },
  'underboss': { row: 1, col: 2 },
  'godfather': { row: 1, col: 3 },
}

// Helper to get sprite background style
export function getSpriteStyle(
  sprite: string,
  position: { row: number; col: number },
  size: number = 64
): React.CSSProperties {
  return {
    backgroundImage: `url(${sprite})`,
    backgroundPosition: `-${position.col * size}px -${position.row * size}px`,
    backgroundSize: 'auto',
    width: size,
    height: size,
    backgroundRepeat: 'no-repeat',
  }
}
