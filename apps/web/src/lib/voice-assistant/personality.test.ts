import { describe, expect, it } from "vitest"
import { ASSISTANT_PERSONALITIES, getPersonalityInstruction, parsePersonality } from "@/lib/voice-assistant/personality"

describe("assistant personality", () => {
  it("returns distinct prompt instructions for each personality", () => {
    const professional = getPersonalityInstruction("professional")
    const casual = getPersonalityInstruction("casual")
    const playful = getPersonalityInstruction("playful")

    expect(professional).not.toBe(casual)
    expect(casual).not.toBe(playful)
    expect(Object.keys(ASSISTANT_PERSONALITIES)).toEqual(["professional", "casual", "playful"])
  })

  it("falls back to professional on unknown input", () => {
    expect(parsePersonality("invalid")).toBe("professional")
    expect(parsePersonality("playful")).toBe("playful")
  })
})
