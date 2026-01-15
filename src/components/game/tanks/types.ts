export type TankType = 
  | "PLAYER" 
  | "BROWN" // Static, shoots slow
  | "GREY"  // Moves, shoots
  | "TEAL"  // Fast, Rockets
  | "YELLOW" // Mines
  | "RED"   // Burst fire
  | "GREEN" // Stationary, 2x Ricochet
  | "PURPLE" // Fast burst
  | "WHITE"  // Invisible
  | "BLACK"  // Boss

export interface Point {
  x: number
  y: number
}

export interface Vector {
  x: number
  y: number
}

export interface Entity {
  id: string
  x: number
  y: number
  radius: number
  color: string
  angle: number // Rotation in radians
}

export interface Tank extends Entity {
  type: TankType
  turretAngle: number
  vx: number
  vy: number
  cooldown: number
  maxCooldown: number
  bulletSpeed: number
  maxBullets: number
  bulletCount: number
  rockets: boolean
  isPlayer?: boolean
  hp: number
  speed: number
}

export interface Bullet extends Entity {
  vx: number
  vy: number
  bounces: number
  maxBounces: number
  ownerId: string
  isRocket?: boolean
}

export interface Mine extends Entity {
  ownerId: string
  timer: number
}

export interface Explosion extends Entity {
  maxRadius: number
  life: number
  maxLife: number
}

export interface Wall {
  x: number
  y: number
  width: number
  height: number
  breakable: boolean
  hp?: number
}
