import { beforeEach, describe, expect, it } from "vitest"
import { getEasterEggCatalog } from "@/lib/easter-eggs/catalog"
import { getNextUndiscoveredHint, hasUnlockedReward, loadEasterEggProgress, saveEasterEggDiscovery } from "@/lib/easter-eggs/progress"

function createMemoryStorage(): Storage {
  const backing = new Map<string, string>()

  return {
    get length() {
      return backing.size
    },
    clear() {
      backing.clear()
    },
    getItem(key: string) {
      return backing.get(key) ?? null
    },
    key(index: number) {
      return Array.from(backing.keys())[index] ?? null
    },
    removeItem(key: string) {
      backing.delete(key)
    },
    setItem(key: string, value: string) {
      backing.set(key, value)
    },
  }
}

describe("easter egg progress", () => {
  beforeEach(() => {
    const storage = createMemoryStorage()
    Object.defineProperty(window, "localStorage", { value: storage, configurable: true })
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true })
  })

  it("tracks discovery progress and unlocked rewards", () => {
    const catalog = getEasterEggCatalog(new Date("2026-02-16T10:00:00Z"))

    const matrixSave = saveEasterEggDiscovery(catalog, "matrix")
    expect(matrixSave.isNewDiscovery).toBe(true)
    expect(matrixSave.progress.completionPercentage).toBeGreaterThan(0)
    expect(hasUnlockedReward(matrixSave.progress, "theme-matrix-green")).toBe(true)

    const loaded = loadEasterEggProgress(catalog)
    expect(loaded.discoveredIds).toContain("matrix")
    expect(loaded.unlockedRewardIds).toContain("theme-matrix-green")
  })

  it("returns next hint from remaining undiscovered eggs", () => {
    const catalog = getEasterEggCatalog(new Date("2026-02-16T10:00:00Z"))
    saveEasterEggDiscovery(catalog, "gandalf")
    saveEasterEggDiscovery(catalog, "daniel")

    const progress = loadEasterEggProgress(catalog)
    const nextHint = getNextUndiscoveredHint(catalog, progress)

    expect(nextHint).not.toBeNull()
    expect(progress.discoveredIds).not.toContain(nextHint?.id ?? "")
  })

  it("unlocks completionist after every discoverable egg is found", () => {
    const catalog = getEasterEggCatalog(new Date("2026-02-16T10:00:00Z"))

    for (const egg of catalog) {
      saveEasterEggDiscovery(catalog, egg.id)
    }

    const progress = loadEasterEggProgress(catalog)
    expect(progress.completionistUnlocked).toBe(true)
    expect(progress.completionPercentage).toBe(100)
  })
})
