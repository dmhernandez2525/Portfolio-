import { describe, expect, it } from "vitest"
import { getSeasonalEasterEgg } from "@/lib/easter-eggs/catalog"

describe("seasonal easter egg rotation", () => {
  it("returns the February valentine seasonal egg", () => {
    const egg = getSeasonalEasterEgg(new Date("2026-02-16T10:00:00Z"))
    expect(egg.id).toBe("seasonal-valentine")
    expect(egg.code).toBe("heart")
  })

  it("returns the October halloween seasonal egg", () => {
    const egg = getSeasonalEasterEgg(new Date("2026-10-31T22:00:00Z"))
    expect(egg.id).toBe("seasonal-halloween")
    expect(egg.code).toBe("pumpkin")
  })

  it("falls back to the monthly seasonal egg when month has no special override", () => {
    const egg = getSeasonalEasterEgg(new Date("2026-06-03T12:00:00Z"))
    expect(egg.id).toBe("seasonal-monthly")
    expect(egg.code).toBe("season")
  })
})
