import type { EasterEggDefinition } from "@/types/easter-eggs"

const CORE_EASTER_EGGS: EasterEggDefinition[] = [
  {
    id: "gandalf",
    name: "Wizard Summon",
    code: "gandalf",
    difficulty: "easy",
    category: "classic",
    hint: "A grey wizard from Middle-earth loves this codebase.",
    description: "Summons the wizard with a dev quote.",
    rewards: [{ id: "badge-wizard-caller", type: "badge", label: "Wizard Caller", description: "Discovered the Gandalf incantation." }],
  },
  {
    id: "daniel",
    name: "Creator Ping",
    code: "daniel",
    difficulty: "easy",
    category: "classic",
    hint: "Try typing the creator's first name.",
    description: "Spawns Daniel the Cleaner.",
    rewards: [{ id: "badge-creator-ping", type: "badge", label: "Creator Ping", description: "Woke up Daniel the Cleaner." }],
  },
  {
    id: "ghost",
    name: "Ghost Spawn",
    code: "ghost",
    difficulty: "easy",
    category: "classic",
    hint: "The haunted keyword is exactly what it sounds like.",
    description: "Spawns a ghost encounter.",
    rewards: [{ id: "badge-ghost-whisperer", type: "badge", label: "Ghost Whisperer", description: "Summoned a ghost on demand." }],
  },
  {
    id: "monkey",
    name: "Monkey Mode",
    code: "monkey",
    difficulty: "easy",
    category: "classic",
    hint: "A jungle keyword opens an old hidden surprise.",
    description: "Spawns a wild monkey.",
    rewards: [{ id: "badge-jungle-keyboard", type: "badge", label: "Jungle Keyboard", description: "Unlocked monkey mode." }],
  },
  {
    id: "matrix",
    name: "Matrix Rain",
    code: "matrix",
    difficulty: "medium",
    category: "bonus",
    hint: "What do you call digital green rain in hacker films?",
    description: "Triggers Matrix-style visual effects.",
    rewards: [{ id: "theme-matrix-green", type: "theme", label: "Matrix Green Theme", description: "Unlocks the neon matrix accent theme." }],
  },
  {
    id: "mario",
    name: "Coin Hunter",
    code: "mario",
    difficulty: "medium",
    category: "bonus",
    hint: "Type the name of the most famous platform mascot.",
    description: "Plays a retro coin pickup sound.",
    rewards: [{ id: "badge-coin-hunter", type: "badge", label: "Coin Hunter", description: "Collected a retro coin easter egg." }],
  },
  {
    id: "konami",
    name: "Konami Classic",
    difficulty: "legendary",
    category: "classic",
    hint: "Up, up, down, down ... then the old-school finisher.",
    description: "Unlocks the iconic cheat code event.",
    rewards: [{ id: "badge-konami-guardian", type: "badge", label: "Konami Guardian", description: "Completed the legendary code." }],
  },
  {
    id: "pixel-portal",
    name: "Pixel Portal",
    difficulty: "legendary",
    category: "mini-game",
    hint: "Double-left, double-right, then commit with Enter.",
    description: "Unlocks the hidden Pixel Portal mini-game.",
    rewards: [{ id: "badge-portal-runner", type: "badge", label: "Portal Runner", description: "Unlocked a hidden arcade mini-game." }],
  },
  {
    id: "orbit-runner",
    name: "Orbit Runner",
    difficulty: "legendary",
    category: "mini-game",
    hint: "Tap the four screen corners clockwise in a loop.",
    description: "Unlocks the hidden Orbit Runner mini-game.",
    rewards: [{ id: "skin-pixel-creatures", type: "skin", label: "Pixel Creature Skin", description: "Creatures gain a pixel style variant." }],
  },
]

const SEASONAL_BY_MONTH: Record<number, Omit<EasterEggDefinition, "seasonalMonth">> = {
  0: {
    id: "seasonal-new-year",
    name: "New Year Fireworks",
    code: "fireworks",
    difficulty: "medium",
    category: "seasonal",
    hint: "Start the year with a celebration keyword.",
    description: "January seasonal easter egg.",
    rewards: [{ id: "badge-new-year", type: "badge", label: "New Year Spark", description: "Found the January seasonal egg." }],
  },
  1: {
    id: "seasonal-valentine",
    name: "Valentine Pulse",
    code: "heart",
    difficulty: "medium",
    category: "seasonal",
    hint: "A short romantic keyword activates this month.",
    description: "February seasonal easter egg.",
    rewards: [{ id: "badge-valentine", type: "badge", label: "Valentine Pulse", description: "Found the February seasonal egg." }],
  },
  9: {
    id: "seasonal-halloween",
    name: "Halloween Haunt",
    code: "pumpkin",
    difficulty: "medium",
    category: "seasonal",
    hint: "Type the classic autumn decoration.",
    description: "October seasonal easter egg.",
    rewards: [{ id: "badge-haunt-hunter", type: "badge", label: "Haunt Hunter", description: "Found the October seasonal egg." }],
  },
  11: {
    id: "seasonal-holiday",
    name: "Holiday Snow",
    code: "snowglobe",
    difficulty: "medium",
    category: "seasonal",
    hint: "A winter shelf ornament hides this one.",
    description: "December seasonal easter egg.",
    rewards: [{ id: "badge-holiday-scout", type: "badge", label: "Holiday Scout", description: "Found the December seasonal egg." }],
  },
}

const DEFAULT_SEASONAL = {
  id: "seasonal-monthly",
  name: "Monthly Secret",
  code: "season",
  difficulty: "medium",
  category: "seasonal",
  hint: "Try the literal word tied to the current season.",
  description: "Fallback seasonal easter egg for months without a special event.",
  rewards: [{ id: "badge-seasonal-scout", type: "badge", label: "Seasonal Scout", description: "Found a rotating monthly egg." }],
} satisfies Omit<EasterEggDefinition, "seasonalMonth">

export const KONAMI_SEQUENCE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"] as const

export const PIXEL_PORTAL_SEQUENCE = ["ArrowLeft", "ArrowLeft", "ArrowRight", "ArrowRight", "Enter"] as const

export const ORBIT_SEQUENCE = ["top-left", "top-right", "bottom-right", "bottom-left"] as const

export const easterEggStorageKey = "portfolio:easter-eggs:v2"

export function getSeasonalEasterEgg(now: Date = new Date()): EasterEggDefinition {
  const month = now.getMonth()
  const base = SEASONAL_BY_MONTH[month] ?? DEFAULT_SEASONAL
  return { ...base, seasonalMonth: month }
}

export function getEasterEggCatalog(now: Date = new Date()): EasterEggDefinition[] {
  return [...CORE_EASTER_EGGS, getSeasonalEasterEgg(now)]
}

export function getDifficultyRank(difficulty: EasterEggDefinition["difficulty"]): number {
  if (difficulty === "easy") return 0
  if (difficulty === "medium") return 1
  return 2
}
