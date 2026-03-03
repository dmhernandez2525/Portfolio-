export interface Building {
  id: string
  name: string
  description: string
  baseCost: number
  baseCps: number
  owned: number
  icon: string
}

export interface Upgrade {
  id: string
  name: string
  description: string
  cost: number
  purchased: boolean
  trigger?: (state: GameState) => void
  requirement: (state: GameState) => boolean
  icon: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  icon: string
  check: (state: GameState) => boolean
}

export interface GameState {
  cookies: number
  totalCookies: number
  totalClicks: number
  cookiesPerClick: number
  cookiesPerSecond: number
  clickMultiplier: number
  cpsMultiplier: number
  buildings: Building[]
  upgrades: Upgrade[]
  achievements: Achievement[]
  grandmapocalypseLevel: number // 0 = None, 1 = Awoken, 2 = Displeased, 3 = Angered
  wrinklers: Wrinkler[]
  heavenlyChips: number
  ascensionLevel: number
}

export interface Wrinkler {
  id: number
  x: number
  y: number
  suckedCookies: number
}

export interface ClickEffect {
  id: number
  x: number
  y: number
  value: string
}
