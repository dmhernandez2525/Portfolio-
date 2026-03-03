import { describe, expect, it } from "vitest"
import { CREATURE_SPECIES, CREATURE_SPECIES_MAP, getDexSpecies, getSpawnableSpecies } from "@/lib/creature-system/catalog"

describe("creature catalog", () => {
  it("contains new creature types (phoenix, glitchling, bytecat, pixelworm)", () => {
    const ids = CREATURE_SPECIES.map((s) => s.id)
    expect(ids).toContain("phoenix")
    expect(ids).toContain("glitchling")
    expect(ids).toContain("bytecat")
    expect(ids).toContain("pixelworm")
  })

  it("maps every species by id", () => {
    for (const species of CREATURE_SPECIES) {
      expect(CREATURE_SPECIES_MAP[species.id]).toBe(species)
    }
  })

  it("getDexSpecies returns all species including non-spawnable", () => {
    const dex = getDexSpecies()
    expect(dex.length).toBe(CREATURE_SPECIES.length)
    const ids = dex.map((s) => s.id)
    expect(ids).toContain("flame-bytecat")
    expect(ids).toContain("quantum-worm")
  })
})

describe("getSpawnableSpecies", () => {
  it("excludes species with spawnWeight 0", () => {
    const spawnable = getSpawnableSpecies()
    const ids = spawnable.map((s) => s.id)
    expect(ids).not.toContain("flame-bytecat")
    expect(ids).not.toContain("quantum-worm")
  })

  it("excludes seasonal species outside their month", () => {
    const july = new Date("2026-07-15T12:00:00Z")
    const spawnable = getSpawnableSpecies(july)
    const ids = spawnable.map((s) => s.id)
    expect(ids).not.toContain("holiday-sprite")
  })

  it("includes seasonal species during their month", () => {
    const december = new Date("2026-12-15T12:00:00Z")
    const spawnable = getSpawnableSpecies(december)
    const ids = spawnable.map((s) => s.id)
    expect(ids).toContain("holiday-sprite")
  })
})
