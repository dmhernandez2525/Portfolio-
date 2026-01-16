export type WeaponType = "small_shell" | "large_shell" | "mirv" | "atomic"

export type GamePhase = "aiming" | "firing" | "explosion" | "enemy_turn" | "shop" | "victory" | "game_over"

export interface Tank {
    id: string
    x: number
    y: number
    angle: number
    power: number
    hp: number
    maxHp: number
    fuel: number
    maxFuel: number
    weapons: Record<WeaponType, number>
    selectedWeapon: WeaponType
    isPlayer: boolean
    color: string
    isFalling: boolean
}

export interface Projectile {
    x: number
    y: number
    vx: number
    vy: number
    active: boolean
    ownerId: string
    type: WeaponType
    isChild?: boolean // for MIRV shards
}

export interface Explosion {
    x: number
    y: number
    radius: number
    maxRadius: number
    frame: number
    maxFrames: number
}
