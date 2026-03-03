// Game constants for artillery-style tanks
export const CANVAS_WIDTH = 800
export const CANVAS_HEIGHT = 500

// Physics
export const GRAVITY = 0.15
export const MAX_POWER = 100
export const MIN_POWER = 10
export const POWER_STEP = 2
export const ANGLE_STEP = 1
export const WIND_MAX = 3

// Tank properties
export const TANK_WIDTH = 40
export const TANK_HEIGHT = 20
export const BARREL_LENGTH = 25
export const MOVES_PER_TURN = 10
export const MOVE_SPEED = 3

// Projectile
export const PROJECTILE_RADIUS = 3
export const EXPLOSION_RADIUS = 30

// Fuel/Movement
export const MAX_FUEL = 100
export const FUEL_CONSUMPTION = 1.5

// Weapons
export const WEAPON_DATA: Record<string, { 
    name: string, 
    damage: number, 
    radius: number, 
    cost: number,
    isFree: boolean 
}> = {
    small_shell: { name: "Small Shell", damage: 1, radius: 25, cost: 0, isFree: true },
    large_shell: { name: "Large Shell", damage: 2, radius: 45, cost: 50, isFree: false },
    mirv: { name: "MIRV", damage: 1, radius: 30, cost: 100, isFree: false },
    atomic: { name: "Atomic", damage: 4, radius: 80, cost: 250, isFree: false }
}

// Terrain
export const TERRAIN_RESOLUTION = 2 // pixels per terrain point

// Colors
export const COLORS = {
    sky: "#87CEEB",
    terrain: "#8B4513",
    terrainDark: "#654321",
    player: "#2563EB",   // Blue
    enemy: "#DC2626",    // Red
    projectile: "#000000",
    explosion: "#FF6600",
    hud: "#FFFFFF"
}
