import { describe, expect, it } from "vitest"
import { getQuickQuestions, getVoiceFilterPrefix, localizeTourScript, parseAssistantLocale, SUPPORTED_ASSISTANT_LOCALES } from "@/lib/voice-assistant/localization"

describe("voice assistant localization", () => {
  it("parses and falls back locales correctly", () => {
    expect(parseAssistantLocale("es-ES")).toBe("es-ES")
    expect(parseAssistantLocale("unknown")).toBe("en-US")
  })

  it("localizes guided tour script outside english", () => {
    expect(localizeTourScript("Welcome", "en-US")).toBe("Welcome")
    expect(localizeTourScript("Welcome", "fr-FR")).toContain("[FR]")
  })

  it("provides language-aware quick questions and voice prefixes", () => {
    expect(getQuickQuestions("de-DE").length).toBeGreaterThan(0)
    expect(getVoiceFilterPrefix("fr-FR")).toBe("fr")
    expect(Object.keys(SUPPORTED_ASSISTANT_LOCALES)).toEqual(["en-US", "es-ES", "fr-FR", "de-DE"])
  })
})
