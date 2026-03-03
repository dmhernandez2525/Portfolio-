import { CREATURE_SPECIES_MAP, getDexSpecies } from "@/lib/creature-system/catalog"
import { evolvedBetween, getEvolutionStage } from "@/lib/creature-system/evolution"
import type { CreatureCollectionEntry, CreatureDexState } from "@/types/creature-system"

const CREATURE_DEX_STORAGE_KEY = "portfolio:creature-dex:v1"

interface PersistedDexState {
  entries: Record<string, CreatureCollectionEntry>
  unlockedLore: string[]
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage
}

function createDefaultState(): CreatureDexState {
  return {
    entries: {},
    unlockedLore: [],
    completionPercentage: 0,
  }
}

function computeCompletion(entries: Record<string, CreatureCollectionEntry>): number {
  const species = getDexSpecies()
  if (species.length === 0) {
    return 0
  }
  const discovered = species.filter((item) => Boolean(entries[item.id])).length
  return Math.round((discovered / species.length) * 100)
}

function parseState(raw: string | null): PersistedDexState {
  if (!raw) {
    return { entries: {}, unlockedLore: [] }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedDexState>
    return {
      entries: parsed.entries ?? {},
      unlockedLore: Array.isArray(parsed.unlockedLore) ? parsed.unlockedLore : [],
    }
  } catch {
    return { entries: {}, unlockedLore: [] }
  }
}

function toDexState(persisted: PersistedDexState): CreatureDexState {
  return {
    entries: persisted.entries,
    unlockedLore: persisted.unlockedLore,
    completionPercentage: computeCompletion(persisted.entries),
  }
}

export function loadCreatureDexState(): CreatureDexState {
  const storage = getStorage()
  if (!storage) {
    return createDefaultState()
  }
  return toDexState(parseState(storage.getItem(CREATURE_DEX_STORAGE_KEY)))
}

export function saveCreatureDexState(state: CreatureDexState): void {
  const storage = getStorage()
  if (!storage) {
    return
  }

  const persisted: PersistedDexState = {
    entries: state.entries,
    unlockedLore: state.unlockedLore,
  }

  storage.setItem(CREATURE_DEX_STORAGE_KEY, JSON.stringify(persisted))
}

export function registerCreatureCatch(speciesId: string): { state: CreatureDexState; evolvedTo: string | null } {
  const species = CREATURE_SPECIES_MAP[speciesId]
  if (!species) {
    return { state: loadCreatureDexState(), evolvedTo: null }
  }

  const previousState = loadCreatureDexState()
  const now = Date.now()
  const previousEntry = previousState.entries[speciesId]

  const nextEntry: CreatureCollectionEntry = {
    speciesId,
    catches: (previousEntry?.catches ?? 0) + 1,
    firstCaughtAt: previousEntry?.firstCaughtAt ?? now,
    lastCaughtAt: now,
    rarity: species.rarity,
  }

  const nextEntries = {
    ...previousState.entries,
    [speciesId]: nextEntry,
  }

  const unlockedLore = previousState.unlockedLore.includes(speciesId)
    ? previousState.unlockedLore
    : [...previousState.unlockedLore, speciesId]

  const nextState: CreatureDexState = {
    entries: nextEntries,
    unlockedLore,
    completionPercentage: computeCompletion(nextEntries),
  }

  saveCreatureDexState(nextState)

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<{ completion: number }>("creature-dex-update", { detail: { completion: nextState.completionPercentage } }))
  }

  const evolvedTo = evolvedBetween(speciesId, previousEntry?.catches ?? 0, nextEntry.catches)
    ? getEvolutionStage(speciesId, nextEntry.catches)
    : null

  return { state: nextState, evolvedTo }
}

export function getCreatureDexCompletion(): number {
  return loadCreatureDexState().completionPercentage
}
