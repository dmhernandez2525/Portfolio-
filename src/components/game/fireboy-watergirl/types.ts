export interface Vec2 {
  x: number
  y: number
}

export interface Character {
  pos: Vec2
  vel: Vec2
  width: number
  height: number
  onGround: boolean
  alive: boolean
  atExit: boolean
  type: "fire" | "water"
  facingRight: boolean
  walkFrame: number
}

export interface Gem {
  x: number
  y: number
  type: "fire" | "water"
  collected: boolean
}

export interface Door {
  x: number
  y: number
  type: "fire" | "water"
}

export interface Button {
  x: number
  y: number
  width: number
  triggerId: string
  pressed: boolean
}

export interface Lever {
  x: number
  y: number
  triggerId: string
  activated: boolean
}

export interface Mechanism {
  id: string
  tiles: Vec2[]
  type: "door"
  open: boolean
}

export interface MovingPlatform {
  x: number
  y: number
  width: number
  pathStart: Vec2
  pathEnd: Vec2
  speed: number
  progress: number
  direction: 1 | -1
}

export interface LevelData {
  name: string
  tiles: number[][]
  fireSpawn: Vec2
  waterSpawn: Vec2
  fireDoor: Door
  waterDoor: Door
  gems: Gem[]
  buttons: Button[]
  levers: Lever[]
  mechanisms: Mechanism[]
  movingPlatforms: MovingPlatform[]
}

export interface InputState {
  fireLeft: boolean
  fireRight: boolean
  fireUp: boolean
  waterLeft: boolean
  waterRight: boolean
  waterUp: boolean
}

export type GamePhase = "menu" | "playing" | "paused" | "level-complete" | "game-over" | "all-complete"

export interface GameState {
  fire: Character
  water: Character
  level: LevelData
  levelIndex: number
  phase: GamePhase
  fireGems: number
  waterGems: number
  totalFireGems: number
  totalWaterGems: number
  timer: number
  bestTimes: (number | null)[]
  unlockedLevels: number
  deathMessage: string
}
