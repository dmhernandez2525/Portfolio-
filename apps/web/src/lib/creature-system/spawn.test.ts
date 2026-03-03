import { describe, expect, it } from "vitest"
import { getSpawnPool, hasSeasonalSpawn, pickSpawnSpecies } from "@/lib/creature-system/spawn"

describe("getSpawnPool", () => {
  it("returns entries with speciesId and weight", () => {
    const pool = getSpawnPool()
    expect(pool.length).toBeGreaterThan(0)
    for (const entry of pool) {
      expect(entry.speciesId).toBeTruthy()
      expect(entry.weight).toBeGreaterThan(0)
    }
  })

  it("excludes non-spawnable creatures", () => {
    const pool = getSpawnPool()
    const ids = pool.map((e) => e.speciesId)
    expect(ids).not.toContain("flame-bytecat")
    expect(ids).not.toContain("quantum-worm")
  })
})

describe("pickSpawnSpecies", () => {
  it("returns a valid species id for random value 0", () => {
    const result = pickSpawnSpecies(0)
    expect(result).toBeTruthy()
    expect(typeof result).toBe("string")
  })

  it("returns a valid species id for random value close to 1", () => {
    const result = pickSpawnSpecies(0.999)
    expect(result).toBeTruthy()
  })

  it("returns bug as fallback for 0 total weight (edge case)", () => {
    const july = new Date("2026-07-15T12:00:00Z")
    const result = pickSpawnSpecies(0.5, july)
    expect(result).toBeTruthy()
  })
})

describe("hasSeasonalSpawn", () => {
  it("returns true in December", () => {
    expect(hasSeasonalSpawn(new Date("2026-12-25T12:00:00Z"))).toBe(true)
  })

  it("returns false outside December", () => {
    expect(hasSeasonalSpawn(new Date("2026-06-15T12:00:00Z"))).toBe(false)
  })
})
