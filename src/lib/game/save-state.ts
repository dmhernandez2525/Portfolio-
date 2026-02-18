import type { GameEnhancementState } from "@/types/game-enhancement"

const KEY_PREFIX = "game_enhancement_state_v1_"

interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const memoryData = new Map<string, string>()
const memoryStorage: StorageLike = {
  getItem: (key) => memoryData.get(key) ?? null,
  setItem: (key, value) => {
    memoryData.set(key, value)
  },
  removeItem: (key) => {
    memoryData.delete(key)
  },
}

function isStorageLike(value: unknown): value is StorageLike {
  if (!value || typeof value !== "object") return false
  const candidate = value as Partial<StorageLike>
  return typeof candidate.getItem === "function" && typeof candidate.setItem === "function" && typeof candidate.removeItem === "function"
}

function getStorage(): StorageLike {
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) return window.localStorage
  if (typeof globalThis !== "undefined" && isStorageLike(globalThis.localStorage)) return globalThis.localStorage
  return memoryStorage
}

function keyFor(gameId: string): string {
  return `${KEY_PREFIX}${gameId}`
}

export function saveGameEnhancementState(state: GameEnhancementState): void {
  getStorage().setItem(keyFor(state.gameId), JSON.stringify(state))
}

export function loadGameEnhancementState(gameId: string): GameEnhancementState | null {
  const raw = getStorage().getItem(keyFor(gameId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as GameEnhancementState
  } catch {
    return null
  }
}

export function clearGameEnhancementState(gameId: string): void {
  getStorage().removeItem(keyFor(gameId))
}
