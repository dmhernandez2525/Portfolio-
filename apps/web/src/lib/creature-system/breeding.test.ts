import { describe, expect, it } from "vitest"
import { breedCreatures } from "@/lib/creature-system/breeding"

describe("breedCreatures", () => {
  it("produces flame-bytecat from bytecat and phoenix", () => {
    expect(breedCreatures("bytecat", "phoenix")).toBe("flame-bytecat")
  })

  it("produces flame-bytecat regardless of parent order", () => {
    expect(breedCreatures("phoenix", "bytecat")).toBe("flame-bytecat")
  })

  it("produces quantum-worm from glitchling and pixelworm", () => {
    expect(breedCreatures("glitchling", "pixelworm")).toBe("quantum-worm")
  })

  it("produces holiday-sprite from ghost and phoenix", () => {
    expect(breedCreatures("ghost", "phoenix")).toBe("holiday-sprite")
  })

  it("returns null for identical parents", () => {
    expect(breedCreatures("bug", "bug")).toBeNull()
  })

  it("returns null for unknown combinations", () => {
    expect(breedCreatures("bug", "sparkle")).toBeNull()
  })

  it("returns null for empty inputs", () => {
    expect(breedCreatures("", "bug")).toBeNull()
    expect(breedCreatures("bug", "")).toBeNull()
  })
})
