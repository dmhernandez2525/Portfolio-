export interface Cell {
  id: string
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
  isPlayer?: boolean
  name?: string
}

export interface Food {
  id: string
  x: number
  y: number
  radius: number
  color: string
}

export interface Virus {
  id: string
  x: number
  y: number
  radius: number
}

export interface EjectedMass {
  id: string
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
  creatorId: string
}

export interface AIBehavior {
  targetX: number
  targetY: number
  lastDecision: number
}
