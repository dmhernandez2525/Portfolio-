import { easterEggStorageKey, getDifficultyRank } from "@/lib/easter-eggs/catalog"
import type { EasterEggDefinition, EasterEggProgress } from "@/types/easter-eggs"

interface EasterEggStorageShape {
  discoveredIds: string[]
  unlockedRewardIds: string[]
}

const DEFAULT_STORAGE: EasterEggStorageShape = {
  discoveredIds: [],
  unlockedRewardIds: [],
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items))
}

function parseStorage(raw: string | null): EasterEggStorageShape {
  if (!raw) {
    return DEFAULT_STORAGE
  }

  try {
    const parsed = JSON.parse(raw) as Partial<EasterEggStorageShape>
    return {
      discoveredIds: unique(Array.isArray(parsed.discoveredIds) ? parsed.discoveredIds : []),
      unlockedRewardIds: unique(Array.isArray(parsed.unlockedRewardIds) ? parsed.unlockedRewardIds : []),
    }
  } catch {
    return DEFAULT_STORAGE
  }
}

function toProgress(catalog: EasterEggDefinition[], discoveredIds: string[]): EasterEggProgress {
  const discoverableIds = catalog.map((egg) => egg.id)
  const discovered = discoverableIds.filter((id) => discoveredIds.includes(id))
  const rewardIds = unique(
    catalog
      .filter((egg) => discovered.includes(egg.id))
      .flatMap((egg) => egg.rewards.map((reward) => reward.id)),
  )

  const completionRatio = discoverableIds.length > 0 ? discovered.length / discoverableIds.length : 0

  return {
    discoveredIds: discovered,
    unlockedRewardIds: rewardIds,
    completionPercentage: Math.round(completionRatio * 100),
    completionistUnlocked: discoverableIds.length > 0 && discovered.length === discoverableIds.length,
    totalDiscoverable: discoverableIds.length,
  }
}

export function loadEasterEggProgress(catalog: EasterEggDefinition[]): EasterEggProgress {
  const storage = getStorage()
  if (!storage) {
    return toProgress(catalog, [])
  }

  const stored = parseStorage(storage.getItem(easterEggStorageKey))
  return toProgress(catalog, stored.discoveredIds)
}

export function saveEasterEggDiscovery(catalog: EasterEggDefinition[], eggId: string): { progress: EasterEggProgress; isNewDiscovery: boolean } {
  const storage = getStorage()
  if (!storage) {
    return { progress: toProgress(catalog, [eggId]), isNewDiscovery: true }
  }

  const stored = parseStorage(storage.getItem(easterEggStorageKey))
  const nextDiscovered = unique([...stored.discoveredIds, eggId])
  const progress = toProgress(catalog, nextDiscovered)

  const nextStorage: EasterEggStorageShape = {
    discoveredIds: progress.discoveredIds,
    unlockedRewardIds: progress.unlockedRewardIds,
  }

  storage.setItem(easterEggStorageKey, JSON.stringify(nextStorage))

  return {
    progress,
    isNewDiscovery: !stored.discoveredIds.includes(eggId),
  }
}

export function getNextUndiscoveredHint(catalog: EasterEggDefinition[], progress: EasterEggProgress): EasterEggDefinition | null {
  const undiscovered = catalog
    .filter((egg) => !progress.discoveredIds.includes(egg.id))
    .sort((left, right) => {
      const diff = getDifficultyRank(left.difficulty) - getDifficultyRank(right.difficulty)
      if (diff !== 0) {
        return diff
      }
      return left.name.localeCompare(right.name)
    })

  return undiscovered[0] ?? null
}

export function hasUnlockedReward(progress: EasterEggProgress, rewardId: string): boolean {
  return progress.unlockedRewardIds.includes(rewardId)
}
