import { describe, expect, it } from "vitest"
import { evolvedBetween, getEvolutionStage } from "@/lib/creature-system/evolution"

describe("getEvolutionStage", () => {
  it("returns base id for species without evolution paths", () => {
    expect(getEvolutionStage("bug", 10)).toBe("bug")
  })

  it("returns base id when catches are below first threshold", () => {
    expect(getEvolutionStage("phoenix", 0)).toBe("phoenix")
  })

  it("returns base id at exactly the first threshold", () => {
    expect(getEvolutionStage("phoenix", 1)).toBe("phoenix")
  })

  it("returns first evolution at threshold 4", () => {
    expect(getEvolutionStage("phoenix", 4)).toBe("phoenix-spark")
  })

  it("returns second evolution at threshold 8", () => {
    expect(getEvolutionStage("phoenix", 8)).toBe("phoenix-prime")
  })

  it("returns final evolution for very high catch counts", () => {
    expect(getEvolutionStage("bytecat", 100)).toBe("bytecat-ultra")
  })

  it("returns base id for unknown species", () => {
    expect(getEvolutionStage("nonexistent", 5)).toBe("nonexistent")
  })
})

describe("evolvedBetween", () => {
  it("detects evolution between catch thresholds", () => {
    expect(evolvedBetween("phoenix", 3, 4)).toBe(true)
  })

  it("returns false when no evolution occurs", () => {
    expect(evolvedBetween("phoenix", 1, 2)).toBe(false)
  })

  it("returns false for species without evolution paths", () => {
    expect(evolvedBetween("bug", 3, 4)).toBe(false)
  })
})
